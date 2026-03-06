import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANIME STREAM",
  description: "Watch anime online - stream the latest and greatest anime series",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
