import crypto from "crypto";

export function generateAccessToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}