import { cn } from "@/lib/utils";

interface ProgressBarCustomProps {
  value: number;
  max?: number;
  thresholds?: { green: number; yellow: number };
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBarCustom({
  value,
  max = 100,
  thresholds = { green: 60, yellow: 80 },
  className,
  showLabel = true,
  label,
}: ProgressBarCustomProps) {
  const pct = Math.min((value / max) * 100, 100);
  const barColor =
    pct < thresholds.green ? "bg-success" :
    pct < thresholds.yellow ? "bg-warning" :
    "bg-destructive";

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{label || ""}</span>
          <span className="font-mono tabular-nums">{pct.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", barColor)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
