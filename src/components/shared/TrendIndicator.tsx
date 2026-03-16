import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendIndicatorProps {
  value: number;
  suffix?: string;
  className?: string;
  invertColor?: boolean;
}

export function TrendIndicator({ value, suffix = "%", className, invertColor = false }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  const colorClass = isNeutral
    ? "text-muted-foreground"
    : invertColor
      ? (isPositive ? "text-destructive" : "text-success")
      : (isPositive ? "text-success" : "text-destructive");

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", colorClass, className)}>
      <Icon className="h-3 w-3" />
      {isPositive ? "+" : ""}{value}{suffix}
    </span>
  );
}
