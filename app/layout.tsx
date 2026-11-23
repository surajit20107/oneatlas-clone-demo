import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { QueryProvider } from "@/components/atlas/query-provider";
import { SiteHeader } from "@/components/atlas/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "OneAtlas — AI model intelligence",
    template: "%s · OneAtlas",
  },
  description:
    "Discover, compare, and evaluate AI models across companies and inference providers.",
  applicationName: "OneAtlas",
  generator: "OneAtlas.dev",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#090b10",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <QueryProvider>
          <SiteHeader />
          {children}
        </QueryProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
