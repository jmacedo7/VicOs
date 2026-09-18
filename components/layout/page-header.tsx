import Link from "next/link";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  href,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: string;
  href?: string;
}) {
  return (
    <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-500">{eyebrow}</p>}
        <h1 className="text-3xl font-black tracking-tight text-slate-950">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {action && href && (
        <Link href={href} className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600">
          {action}
        </Link>
      )}
    </header>
  );
}
