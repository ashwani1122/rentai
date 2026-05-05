import Link from "next/link";
import {  Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand">RentAI</Link>

        <nav className="nav-links">
          <Link href="/marketplace">Marketplace</Link>

            <Link href="/dashboard/seller-tokens">Seller dashboard</Link>
            <Link href="/dashboard/rentals">Rentals</Link>
           <Show when="signed-out">
            <SignInButton mode="modal">
              Sign in
            </SignInButton>
            <SignUpButton>
                Sign up
            </SignUpButton>
        </Show>
        <Show when="signed-in">
            <UserButton />
        </Show>

        </nav>
      </div>
    </header>
  );
}