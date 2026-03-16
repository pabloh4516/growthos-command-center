import { AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Severity = "info" | "warning" | "critical" | "success";

const config: Record<Severity, { icon: typeof Info; bg: string; text: string }> = {
  info: { icon: Info, bg: "bg-primary/10", text: "text-primary" },
  warning: { icon: AlertTriangle, bg: "bg-warning/10", text: "text-warning" },
  critical: { icon: AlertCircle, bg: "bg-destructive/10", text: "text-destructive" },
  success: { icon: CheckCircle, bg: "bg-success/10", text: "text-success" },
};

interface SeverityBadgeProps {
  severity: Severity;
  label?: string;
  className?: string;
}

export function SeverityBadge({ severity, label, className }: SeverityBadgeProps) {
  const c = config[severity];
  const Icon = c.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", c.bg, c.text, className)}>
      <Icon className="h-3 w-3" />
      {label || severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
}
