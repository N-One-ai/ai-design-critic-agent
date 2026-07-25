import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

interface PlaceholderPageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: "soon" | "beta";
  features?: string[];
}

export function PlaceholderPage({
  icon,
  title,
  description,
  badge = "soon",
  features = [],
}: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center">
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        action={
          <div className="flex flex-col items-center gap-4">
            {badge && (
              <Badge variant={badge === "beta" ? "primary" : "default"} dot>
                {badge === "soon" ? "Coming Soon" : "Beta"}
              </Badge>
            )}
            {features.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-sm w-full mt-2">
                {features.map((f) => (
                  <Card key={f} variant="flat" padding="sm">
                    <div className="flex items-center gap-2.5 text-left">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-default)] shrink-0" />
                      <span className="text-[13px] text-[var(--fg-muted)]">{f}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
