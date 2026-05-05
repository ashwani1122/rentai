export const marketplaceTokens = [
  {
    id: "tok_1",
    provider: "OpenAI",
    seller: "Aarav",
    pricePerHour: 3.5,
    balance: 120,
    maxDurationHours: 24,
    expiresAt: "2026-06-15T10:00:00Z",
  },
  {
    id: "tok_2",
    provider: "Anthropic",
    seller: "Naina",
    pricePerHour: 4.2,
    balance: 90,
    maxDurationHours: 12,
    expiresAt: null,
  },
  {
    id: "tok_3",
    provider: "Gemini",
    seller: "Reyansh",
    pricePerHour: 2.8,
    balance: 240,
    maxDurationHours: 48,
    expiresAt: "2026-07-01T10:00:00Z",
  },
];

export const sellerTokens = [
  {
    id: "st_1",
    provider: "OpenAI",
    keyLabel: "GPT-4o main",
    pricePerHour: 4,
    balance: 150,
    isActive: true,
    maxDurationHours: 24,
  },
  {
    id: "st_2",
    provider: "Anthropic",
    keyLabel: "Claude backup",
    pricePerHour: 3,
    balance: 80,
    isActive: false,
    maxDurationHours: 8,
  },
];

export const rentals = [
  {
    id: "r_1",
    provider: "OpenAI",
    seller: "Aarav",
    status: "ACTIVE",
    duration: "4 hours",
    amount: 14,
    startTime: "2026-05-05 11:00",
    endTime: "2026-05-05 15:00",
  },
  {
    id: "r_2",
    provider: "Anthropic",
    seller: "Naina",
    status: "PENDING_PAYMENT",
    duration: "2 hours",
    amount: 8.4,
    startTime: "2026-05-05 13:00",
    endTime: "2026-05-05 15:00",
  },
];