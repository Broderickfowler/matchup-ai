import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MATCHUP//AI",
  description: "NFL decision intelligence for the play you are considering."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
