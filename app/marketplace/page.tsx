import Link from "next/link";
import { marketplaceTokens } from "@/lib/mock-data";

export default function MarketplacePage() {
  return (
    <main className="container page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Marketplace</h1>
          <p className="page-subtitle">
            Browse public token listings and compare providers, balance, and
            hourly price.
          </p>
        </div>
      </div>

      <div className="list">
        {marketplaceTokens.map((token) => (
          <div key={token.id} className="card list-card">
            <div>
              <div className="badge">{token.provider}</div>
              <h3>{token.seller}</h3>
              <div className="meta">
                Balance: {token.balance ?? "N/A"} · Max duration:{" "}
                {token.maxDurationHours}h · Expires:{" "}
                {token.expiresAt
                  ? new Date(token.expiresAt).toLocaleDateString()
                  : "No expiry"}
              </div>
            </div>

            <div>
              <div className="price">${token.pricePerHour}/hr</div>
              <div className="actions">
                <Link href="/sign-in" className="btn">
                  Sign in to rent
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}