import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main
      className="container page"
      style={{ paddingTop: 40, display: "grid", placeItems: "center" }}
    >
      <SignIn />
    </main>
  );
}