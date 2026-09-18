import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "grid" | "users" | "wallet" | "chart" | "team" | "sync" | "history"
  | "building" | "settings" | "search" | "bell" | "arrow" | "plus" | "check"
  | "clock" | "more" | "external" | "message" | "file" | "task";

export function Icon({ name, size = 18, strokeWidth = 1.8, ...props }: SVGProps<SVGSVGElement> & {
  name: IconName; size?: number; strokeWidth?: number;
}) {
  const common = { width:size, height:size, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor",
    strokeWidth, strokeLinecap:"round" as const, strokeLinejoin:"round" as const, "aria-hidden":true, ...props };
  const paths: Record<IconName, ReactNode> = {
    grid:<><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></>,
    users:<><path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20"/><circle cx="10" cy="7.5" r="3.5"/><path d="M16 5.5a3.5 3.5 0 0 1 0 6.8"/><path d="M20 20v-1.5a4.5 4.5 0 0 0-3.2-4.3"/></>,
    wallet:<><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 16.5z"/><path d="M4 8h14.5A2.5 2.5 0 0 1 21 10.5v3A2.5 2.5 0 0 1 18.5 16H16"/><circle cx="16.5" cy="13.5" r=".8" fill="currentColor" stroke="none"/></>,
    chart:<><path d="M4 19.5V15"/><path d="M9 19.5V10"/><path d="M14 19.5V12.5"/><path d="M19 19.5V6"/><path d="M3 19.5h18"/></>,
    team:<><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.5a3 3 0 0 1 0 5.7"/><path d="M16.5 14.5a5 5 0 0 1 3.5 4.8"/></>,
    sync:<><path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M6.2 9A7 7 0 0 1 19 7"/><path d="M17.8 15A7 7 0 0 1 5 17"/></>,
    history:<><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3.5 5v5h5"/><path d="M12 7v5l3 2"/></>,
    building:<><path d="M4 20V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v15"/><path d="M2 20h20"/><path d="M8 8h3M8 12h3M8 16h3M18 10h2v10"/></>,
    settings:<><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 1.3v.2a1.8 1.8 0 0 1-3.6 0v-.2a1.8 1.8 0 0 0-3-1.3l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-1.3-3h-.2a1.8 1.8 0 0 1 0-3.6h.2a1.8 1.8 0 0 0 1.3-3l-.1-.1a1.8 1.8 0 0 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-1.3v-.2a1.8 1.8 0 0 1 3.6 0v.2a1.8 1.8 0 0 0 3 1.3l.1-.1a1.8 1.8 0 0 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 1.3 3h.2a1.8 1.8 0 0 1 0 3.6h-.2a1.8 1.8 0 0 0-1.3 3Z"/></>,
    search:<><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></>,
    bell:<><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    arrow:<path d="M5 12h13M13 6l6 6-6 6"/>, plus:<path d="M12 5v14M5 12h14"/>, check:<path d="m5 12.5 4.5 4.5L19 7.5"/>,
    clock:<><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/></>,
    more:<><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/></>,
    external:<><path d="M14 5h5v5"/><path d="m19 5-8 8"/><path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></>,
    message:<><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.4 8.4 0 0 1-3.4-.7L4 20l1.5-3.8A7.3 7.3 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></>,
    file:<><path d="M6 3.5h8l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20z"/><path d="M14 3.5V8h4"/><path d="M8.5 12h7M8.5 15.5h7"/></>,
    task:<><rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12 2.5 2.5L16 9"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}
