import Link from "next/link";
import { Icon } from "@/components/ui/icons";

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
    <header className="vicos-enter mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.2em] text-blue-600">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            {eyebrow}
          </div>
        )}
        <h1 className="text-[2rem] font-black tracking-[-.035em] text-slate-950 md:text-[2.35rem]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      {action && href && (
        <Link href={href} className="vicos-button shrink-0">
          <Icon name="plus" size={16} strokeWidth={2} />
          {action}
        </Link>
      )}
    </header>
  );
}
