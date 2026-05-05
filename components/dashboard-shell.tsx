import Link from "next/link";

export function DashboardShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: "seller" | "rentals";
}) {
  return (
    <main className="container sidebar-layout">
      <aside className="card sidebar">
        <Link
          href="/dashboard/seller-tokens"
          className={active === "seller" ? "active" : ""}
        >
          Seller tokens
        </Link>

        <Link
          href="/dashboard/rentals"
          className={active === "rentals" ? "active" : ""}
        >
          Rentals
        </Link>
      </aside>

      <section>{children}</section>
    </main>
  );
}