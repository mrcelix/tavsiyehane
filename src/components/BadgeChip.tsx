import { BADGES } from "@/lib/badges";
import type { BadgeKey } from "@/lib/types";

export function BadgeChip({ badge, small = false }: { badge: BadgeKey; small?: boolean }) {
  const def = BADGES[badge];
  if (!def) return null;
  return (
    <span
      title={def.description}
      className={`inline-flex items-center rounded-full font-semibold ${def.className} ${
        small ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      {def.label}
    </span>
  );
}
