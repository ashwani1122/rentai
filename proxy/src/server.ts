import express from "express";
// import { PrismaClient, RentalStatus } from "../../../app/generated/prisma/index.js";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import crypto from "crypto";
import { decryptSecret } from "../../lib/crypto.js";
import { PrismaClient, RentalStatus } from "@/app/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const app = express();
app.use(express.json({ limit: "2mb" }));

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "60 s"),
  analytics: true,
});

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

app.post("/proxy/:rentalId/chat/completions", async (req, res) => {
  const { rentalId } = req.params;
  const accessToken = req.headers["x-rental-token"];
  const incomingSecret = req.headers["x-proxy-secret"];

  if (incomingSecret !== process.env.PROXY_SHARED_SECRET) {
    return res.status(401).json({ error: "Invalid proxy secret" });
  }

  const { success } = await ratelimit.limit(`proxy:${rentalId}`);
  if (!success) return res.status(429).json({ error: "Too many requests" });
  if (typeof accessToken !== "string") {
    return res.status(401).json({ error: "Missing rental token" });
  }

  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
    include: { sellerToken: true },
  });

  if (!rental || rental.status !== RentalStatus.ACTIVE) {
    return res.status(403).json({ error: "Rental inactive" });
  }

  if (rental.endTime.getTime() < Date.now()) {
    await prisma.rental.update({
      where: { id: rental.id },
      data: { status: RentalStatus.EXPIRED },
    });
    return res.status(403).json({ error: "Rental expired" });
  }

  const hashed = sha256(accessToken);
  if (rental.proxyTokenHash !== hashed) {
    return res.status(401).json({ error: "Invalid rental token" });
  }

  const sellerKey = decryptSecret(rental.sellerToken.encryptedKey);

  const upstream = await fetch(`${process.env.OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sellerKey}`,
    },
    body: JSON.stringify(req.body),
  });

  const data = await upstream.json();

  await prisma.usageLog.create({
    data: {
      rentalId,
      provider: rental.sellerToken.provider,
      endpoint: "/chat/completions",
      requestCount: 1,
      inputTokens: data?.usage?.prompt_tokens ?? null,
      outputTokens: data?.usage?.completion_tokens ?? null,
      estimatedCost: null,
    },
  });

  return res.status(upstream.status).json(data);
});

app.listen(8080, () => {
  console.log("RentAI proxy listening on :8080");
});