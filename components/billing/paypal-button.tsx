"use client";

import { useState } from "react";

export function PaypalButton({ enabled }: { enabled: boolean }) {
  const [loading,setLoading]=useState(false);
  async function start() {
    setLoading(true);
    try {
      const response = await fetch("/api/billing/paypal/subscribe",{method:"POST"});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível iniciar o pagamento.");
      window.location.href=data.url;
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao iniciar pagamento.");
      setLoading(false);
    }
  }
  return <button disabled={!enabled||loading} onClick={start} className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{loading?"Abrindo PayPal…":"Assinar com PayPal"}</button>;
}
