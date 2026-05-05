import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main
      className="container page"
      style={{ paddingTop: 40, display: "grid", placeItems: "center" }}
    >
      <SignUp />
    </main>
  );
}