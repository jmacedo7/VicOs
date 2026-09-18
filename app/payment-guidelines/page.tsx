import Link from "next/link";

const rules = [
  ["Use apenas canais oficiais", "Antes de pagar, confirme que os dados de pagamento aparecem em um canal oficial do VicOs ou foram confirmados pelo suporte."],
  ["Nunca envie sua senha", "O suporte do VicOs não precisa da sua senha. Nunca compartilhe senhas, códigos de autenticação ou tokens."],
  ["Confirme o beneficiário", "Confira nome, documento e instituição do recebedor antes de concluir uma transferência ou pagamento."],
  ["Desconfie de urgência", "Pedidos inesperados para pagar imediatamente, trocar dados bancários ou enviar códigos devem ser verificados antes da ação."],
  ["Guarde o comprovante", "Depois de um pagamento autorizado, mantenha o comprovante e o identificador da transação para consulta."],
];

export default function PaymentGuidelinesPage() {
  const whatsapp = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP;
  const href = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Quero confirmar uma orientação de pagamento do VicOs.")}` : null;

  return <main className="min-h-screen bg-slate-50 px-6 py-10"><div className="mx-auto max-w-4xl"><Link href="/" className="text-sm font-bold text-blue-500">← Voltar para o início</Link><div className="mt-6 rounded-3xl bg-slate-950 p-8 text-white md:p-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Segurança financeira</p><h1 className="mt-2 text-3xl font-black md:text-4xl">Orientações de pagamento</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Estas orientações ajudam a reduzir erros e tentativas de fraude. Sempre confirme os dados antes de autorizar qualquer pagamento.</p></div><div className="mt-6 grid gap-4 md:grid-cols-2">{rules.map(([title, text]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-bold text-slate-950">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></article>)}</div><section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="font-bold text-amber-950">Importante</h2><p className="mt-2 text-sm leading-6 text-amber-900">O VicOs não considera um pagamento autorizado apenas porque alguém enviou uma mensagem dizendo representar a empresa. Confirme sempre pelo canal oficial e pelos dados cadastrados.</p>{href && <a href={href} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700">Confirmar pelo WhatsApp</a>}</section></div></main>;
}
