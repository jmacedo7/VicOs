import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VicOs — Your Business Operating System",
  description: "Gestão empresarial centralizada com o VicOs.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
