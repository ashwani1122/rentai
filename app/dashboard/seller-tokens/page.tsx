// import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardShell } from "@/components/dashboard-shell";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sellerTokens } from "@/lib/mock-data";

export default function SellerTokensPage() {
  return (
    <DashboardShell active="seller">
      <div className="page-head">
        <div>
          <h1 className="page-title">Seller tokens</h1>
          <p className="page-subtitle">
            Add and manage the API access you want to rent out.
          </p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card panel">
          <h3>Add token</h3>

          <div className="form" style={{ marginTop: 16 }}>
            <Select>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                <SelectItem value="light">Anthropic</SelectItem>
                <SelectItem value="dark">OpenAI</SelectItem>
                <SelectItem value="system">Gemini</SelectItem>
                <SelectItem value="system">Grok</SelectItem>
                <SelectItem value="system">Custom</SelectItem>
                </SelectGroup>
            </SelectContent>
            </Select>

            <input className="input" placeholder="Key label" />
            <input
              className="input"
              placeholder="Encrypted key will be submitted from client"
            />
            <input className="input" placeholder="Price per hour" />
            <input className="input" placeholder="Max duration hours" />

            <button className="btn btn-primary">Create listing</button>
          </div>
        </div>

        <div className="card panel">
          <h3>Your listings</h3>

          <table className="table" style={{ marginTop: 16 }}>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Label</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {sellerTokens.map((item) => (
                <tr key={item.id}>
                  <td>{item.provider}</td>
                  <td>{item.keyLabel}</td>
                  <td>${item.pricePerHour}/hr</td>
                  <td>{item.isActive ? "Active" : "Paused"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}