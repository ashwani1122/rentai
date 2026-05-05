import { Polar } from "@polar-sh/sdk";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: "production",
});

export async function createPolarCheckout(input: {
  productIds: string[];
  successUrl: string;
  metadata: Record<string, string>;
  customerEmail?: string;
}) {
  return polar.checkouts.create({
    products: input.productIds,
    successUrl: input.successUrl,
    metadata: input.metadata,
    customerEmail: input.customerEmail,
  });
}

export function verifyPolarWebhook(rawBody: string, headers: Headers) {
  try {
    return validateEvent(
      rawBody,
      Object.fromEntries(headers.entries()),
      process.env.POLAR_WEBHOOK_SECRET!
    );
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      throw new Error("Invalid Polar webhook signature");
    }
    throw error;
  }
}