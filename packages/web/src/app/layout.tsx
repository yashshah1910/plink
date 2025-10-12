import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plink - Save for the future, one plink at a time",
  description:
    "Create secure, time-locked digital piggy banks for your children. Family and friends can easily gift USDC via a simple link, building a permanent digital memory book on the Flow blockchain.",
  keywords: [
    "crypto",
    "savings",
    "children",
    "USDC",
    "Flow blockchain",
    "digital piggy bank",
    "time-locked",
    "family gifting",
  ],
  authors: [{ name: "Plink Team" }],
  openGraph: {
    title: "Plink - Save for the future, one plink at a time",
    description:
      "Create secure, time-locked digital piggy banks for your children. Family and friends can easily gift USDC via a simple link.",
    type: "website",
    siteName: "Plink",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plink - Save for the future, one plink at a time",
    description:
      "Create secure, time-locked digital piggy banks for your children. Family and friends can easily gift USDC via a simple link.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
