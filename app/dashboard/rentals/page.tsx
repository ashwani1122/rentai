import Link from "next/link";
// import { DashboardShell } from "@/components/dashboard-shell";
import { rentals } from "@/lib/mock-data";
import { DashboardShell } from "@/components/dashboard-shell";

export default function RentalsPage() {
  return (
    <DashboardShell active="rentals">
      <div className="page-head">
        <div>
          <h1 className="page-title">Rentals</h1>
          <p className="page-subtitle">
            Track pending, active, expired, and completed rentals.
          </p>
        </div>
      </div>

      <div className="list">
        {rentals.map((rental) => (
          <div key={rental.id} className="card list-card">
            <div>
              <div className="badge">{rental.status}</div>
              <h3>
                {rental.provider} from {rental.seller}
              </h3>
              <div className="meta">
                {rental.duration} · Starts {rental.startTime} · Ends{" "}
                {rental.endTime}
              </div>
            </div>

            <div>
              <div className="price">${rental.amount}</div>
              <div className="actions">
                <Link className="btn" href={`/dashboard/rentals/${rental.id}`}>
                  Open details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}