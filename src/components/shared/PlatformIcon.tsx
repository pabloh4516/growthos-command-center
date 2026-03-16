import { cn } from "@/lib/utils";

type Platform = "google" | "meta" | "tiktok" | "youtube" | "ga4" | "organico";

const platformConfig: Record<Platform, { label: string; color: string; letter: string }> = {
  google: { label: "Google Ads", color: "bg-blue-500/20 text-blue-400", letter: "G" },
  meta: { label: "Meta Ads", color: "bg-indigo-500/20 text-indigo-400", letter: "M" },
  tiktok: { label: "TikTok Ads", color: "bg-pink-500/20 text-pink-400", letter: "T" },
  youtube: { label: "YouTube", color: "bg-red-500/20 text-red-400", letter: "Y" },
  ga4: { label: "GA4", color: "bg-orange-500/20 text-orange-400", letter: "A" },
  organico: { label: "Orgânico", color: "bg-green-500/20 text-green-400", letter: "O" },
};

interface PlatformIconProps {
  platform: Platform;
  showLabel?: boolean;
  className?: string;
}

export function PlatformIcon({ platform, showLabel = false, className }: PlatformIconProps) {
  const config = platformConfig[platform] || platformConfig.google;
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center", config.color)}>
        {config.letter}
      </span>
      {showLabel && <span className="text-xs text-muted-foreground">{config.label}</span>}
    </span>
  );
}
