import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/header";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: "RentAI",
  description: "Rent and monetize AI API access time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
   
      <html lang="en" className={cn("font-sans", geist.variable)}>
        <body>
        <ClerkProvider>
          <Header />

            {children}
        </ClerkProvider>

        </body>
      </html>
  );
}