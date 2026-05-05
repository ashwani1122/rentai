// import { DashboardShell } from "@/components/dashboard-shell";

import { DashboardShell } from "@/components/dashboard-shell";

export default async function RentalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <DashboardShell active="rentals">
      <div className="page-head">
        <div>
          <h1 className="page-title">Rental {id}</h1>
          <p className="page-subtitle">
            Review payment state, access flow, and usage details.
          </p>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card panel">
          <h3>Rental summary</h3>

          <table className="table" style={{ marginTop: 16 }}>
            <tbody>
              <tr>
                <td>Status</td>
                <td>ACTIVE</td>
              </tr>
              <tr>
                <td>Provider</td>
                <td>OpenAI</td>
              </tr>
              <tr>
                <td>Seller</td>
                <td>Aarav</td>
              </tr>
              <tr>
                <td>Start</td>
                <td>2026-05-05 11:00</td>
              </tr>
              <tr>
                <td>End</td>
                <td>2026-05-05 15:00</td>
              </tr>
              <tr>
                <td>Total</td>
                <td>$14.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card panel">
          <h3>Actions</h3>

          <div className="actions">
            <button className="btn btn-primary">Pay with Polar</button>
            <button className="btn">Generate proxy token</button>
          </div>

          <p className="small" style={{ marginTop: 12 }}>
            After payment confirmation, buyers should request a short-lived
            proxy token from the backend and use it against the proxy service.
          </p>
        </div>
      </div>

      <div className="card panel" style={{ marginTop: 16 }}>
        <h3>Proxy request example</h3>

        <div className="codebox" style={{ marginTop: 14 }}>
{`curl -X POST https://your-proxy.example.com/proxy/${id}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "x-proxy-secret: server_shared_secret" \\
  -H "x-rental-token: buyer_short_lived_token" \\
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}]}'`}
        </div>
      </div>
    </DashboardShell>
  );
}