import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio Optimizer",
  description: "Personal portfolio optimizer and long-term forecast dashboard"
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}