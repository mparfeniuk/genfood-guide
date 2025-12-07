import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GeneFood Guide",
  description:
    "Analyze MyHeritage genetics and get personalized nutrition guidance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background text-foreground", inter.variable)}>
        <AppProviders>
          <div className="min-h-screen flex flex-col">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
