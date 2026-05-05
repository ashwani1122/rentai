
import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <section className="hero container">
        <div className="hero-grid">
          <div>
            <span className="badge">AI access marketplace</span>
            <h1 className="h1">
              Rent AI API time. Sell unused credits. Stay in control.
            </h1>
            <p className="lead">
              RentAI lets sellers monetize idle API access and lets buyers rent
              access by the hour through a clean marketplace and dashboard flow.
            </p>

            <div className="actions">
              <Link className="btn btn-primary" href="/marketplace">
                Browse marketplace
              </Link>
              <Link className="btn" href="/dashboard/seller-tokens">
                Open dashboard
              </Link>
            </div>
          </div>

          <div className="card hero-card">
            <div className="grid-2">
              <div className="card stat">
                <div className="small">Average hourly price</div>
                <div className="kpi">$3.90</div>
              </div>
              <div className="card stat">
                <div className="small">Active rentals</div>
                <div className="kpi">128</div>
              </div>
              <div className="card stat">
                <div className="small">Seller earnings</div>
                <div className="kpi">$12.4k</div>
              </div>
              <div className="card stat">
                <div className="small">Supported providers</div>
                <div className="kpi">4</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="grid-3">
          <div className="card panel">
            <div className="badge">For sellers</div>
            <h3>List token slots</h3>
            <p className="small">
              Add provider keys, set hourly price, define max duration, and
              manage activity status.
            </p>
          </div>

          <div className="card panel">
            <div className="badge">For buyers</div>
            <h3>Rent by the hour</h3>
            <p className="small">
              Compare providers, balance, price, and expiry before starting a
              rental and checkout flow.
            </p>
          </div>

          <div className="card panel">
            <div className="badge">Protected usage</div>
            <h3>Proxy-based access</h3>
            <p className="small">
              Use time-limited access through a controlled backend flow instead
              of exposing raw seller keys.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}