import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  value: number;
  colored?: boolean;
  className?: string;
  showSign?: boolean;
}

export function CurrencyDisplay({ value, colored = false, className, showSign = false }: CurrencyDisplayProps) {
  const formatted = value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const colorClass = colored
    ? value > 0 ? "text-success" : value < 0 ? "text-destructive" : ""
    : "";
  return (
    <span className={cn("font-mono tabular-nums", colorClass, className)}>
      {showSign && value > 0 ? "+" : ""}{formatted}
    </span>
  );
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
