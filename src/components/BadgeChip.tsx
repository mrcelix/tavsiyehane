import { BADGES } from "@/lib/badges";
import type { BadgeKey } from "@/lib/types";
import { Badge } from "./ui/Badge";

export function BadgeChip({ badge, small = false }: { badge: BadgeKey; small?: boolean }) {
  const def = BADGES[badge];
  if (!def) return null;
  return (
    <Badge variant={def.variant} title={def.description} className={small ? "text-[10px]" : undefined}>
      {def.label}
    </Badge>
  );
}
