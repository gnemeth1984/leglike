import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { AuthSessionProvider } from "@/components/session-provider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "LegLike — AI Lower-Body Strength, Mobility & Rehab",
  description:
    "LegLike builds personalized lower-body strength, mobility and rehab programs using AI — for athletes, everyday movers, and post-injury recovery.",
  metadataBase: new URL("https://leglike.com"),
  // Search Console site-ownership proof. Set GOOGLE_SITE_VERIFICATION (and
  // optionally BING_SITE_VERIFICATION) in env once the properties exist —
  // absent env vars just omit the tag rather than emitting an empty one.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans antialiased">
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
