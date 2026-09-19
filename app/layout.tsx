import type { Metadata } from "next";
import "./globals.css";
import { LocalFirstSyncProvider } from "@/components/local-first/sync-provider";

export const metadata: Metadata = {
  title: "VicOs — Your Business Operating System",
  description: "Gestão empresarial centralizada com o VicOs.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <LocalFirstSyncProvider />
        {children}
        <footer className="border-t border-slate-200 bg-white px-6 py-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} D7 Studio and João Macedo. Todos os direitos reservados.
        </footer>
      </body>
    </html>
  );
}
