import { cn } from "@/lib/utils";

type StatusType = "active" | "paused" | "error" | "connected" | "disconnected" | "pending" | "draft";

const statusConfig: Record<StatusType, { label: string; dotClass: string; textClass: string }> = {
  active: { label: "Ativo", dotClass: "bg-success animate-pulse-glow", textClass: "text-success" },
  paused: { label: "Pausado", dotClass: "bg-warning", textClass: "text-warning" },
  error: { label: "Erro", dotClass: "bg-destructive", textClass: "text-destructive" },
  connected: { label: "Conectado", dotClass: "bg-success", textClass: "text-success" },
  disconnected: { label: "Desconectado", dotClass: "bg-muted-foreground", textClass: "text-muted-foreground" },
  pending: { label: "Pendente", dotClass: "bg-warning", textClass: "text-warning" },
  draft: { label: "Rascunho", dotClass: "bg-muted-foreground", textClass: "text-muted-foreground" },
};

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn("flex items-center gap-1.5 text-xs font-medium", config.textClass, className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dotClass)} />
      {label || config.label}
    </span>
  );
}
