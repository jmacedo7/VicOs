import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VICOS — Your Business Operating System",
  description: "Centralize your company's operations with VICOS.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
