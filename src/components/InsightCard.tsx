import { motion } from "framer-motion";
import { AlertTriangle, Info, AlertCircle, ChevronRight } from "lucide-react";

interface InsightCardProps {
  severity: "info" | "warning" | "critical";
  title: string;
  action: string;
  delay?: number;
}

const severityConfig = {
  info: { icon: Info, className: "text-primary bg-primary/10" },
  warning: { icon: AlertTriangle, className: "text-warning bg-warning/10" },
  critical: { icon: AlertCircle, className: "text-destructive bg-destructive/10" },
};

export function InsightCard({ severity, title, action, delay = 0 }: InsightCardProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-3 p-4 rounded-xl bg-card surface-glow hover:surface-glow-hover transition-shadow cursor-pointer group"
    >
      <div className={`p-2 rounded-lg shrink-0 ${config.className}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">{title}</p>
        <p className="text-xs text-primary mt-1 font-medium">{action}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
    </motion.div>
  );
}
