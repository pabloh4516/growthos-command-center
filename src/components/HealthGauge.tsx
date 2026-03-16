import { motion } from "framer-motion";

interface HealthGaugeProps {
  score: number;
  size?: number;
}

export function HealthGauge({ score, size = 160 }: HealthGaugeProps) {
  const color =
    score >= 70 ? "hsl(142,71%,45%)" : score >= 40 ? "hsl(38,92%,50%)" : "hsl(0,84%,60%)";
  const circumference = 2 * Math.PI * 60;
  const progress = (score / 100) * circumference * 0.75; // 270 degrees

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 140 140" className="-rotate-[135deg]">
        {/* Background arc */}
        <circle
          cx="70" cy="70" r="60"
          fill="none"
          stroke="hsl(217,33%,12%)"
          strokeWidth="8"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.circle
          cx="70" cy="70" r="60"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${progress} ${circumference - progress}` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold font-mono tabular-nums" style={{ color }}>
          {score}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}
