import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  sparkData: number[];
  delay?: number;
}

export function KPICard({ title, value, change, sparkData, delay = 0 }: KPICardProps) {
  const isPositive = change >= 0;
  const chartData = sparkData.map((v, i) => ({ v, i }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card p-5 rounded-xl surface-glow space-y-2"
    >
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
        {title}
      </p>
      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl font-semibold font-mono tracking-tight tabular-nums">
          {value}
        </h3>
        <span
          className={`flex items-center gap-1 text-xs font-medium ${
            isPositive ? "text-success" : "text-destructive"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {isPositive ? "+" : ""}
          {change}%
        </span>
      </div>
      <div className="h-10 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`sparkGrad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? "hsl(142,71%,45%)" : "hsl(0,84%,60%)"} stopOpacity={0.3} />
                <stop offset="100%" stopColor={isPositive ? "hsl(142,71%,45%)" : "hsl(0,84%,60%)"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={isPositive ? "hsl(142,71%,45%)" : "hsl(0,84%,60%)"}
              strokeWidth={1.5}
              fill={`url(#sparkGrad-${title})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
