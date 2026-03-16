import { motion } from "framer-motion";
import { Trophy, TrendingDown, Image, Video, Type } from "lucide-react";
import { useCreatives } from "@/hooks/use-supabase-data";

const typeIcon: Record<string, any> = { video: Video, image: Image, carousel: Image, text: Type };

const CreativesPage = () => {
  const { data: creativesData, isLoading } = useCreatives();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </div>
    );
  }

  const rawCreatives = (creativesData ?? []) as any[];

  if (rawCreatives.length === 0) {
    return (
      <div className="space-y-6 max-w-[1400px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Biblioteca de Criativos</h1>
            <p className="text-sm text-muted-foreground mt-1">0 criativos</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            + Upload Criativo
          </button>
        </div>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Nenhum dado encontrado.
        </div>
      </div>
    );
  }

  const creatives = rawCreatives.map((c: any) => ({
    name: c.name ?? c.title ?? "—",
    type: c.type ?? c.creative_type ?? "image",
    platform: c.platform ?? "—",
    ctr: c.ctr ? (typeof c.ctr === "number" ? `${c.ctr.toFixed(1)}%` : c.ctr) : "0.0%",
    conversions: c.conversions ?? 0,
    status: c.status ?? "normal",
    fatigue: c.fatigue ?? c.is_fatigued ?? false,
  }));

  // Count unique platforms
  const platforms = new Set(creatives.map((c: any) => c.platform));

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Biblioteca de Criativos</h1>
          <p className="text-sm text-muted-foreground mt-1">{creatives.length} criativos · {platforms.size} plataformas</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          + Upload Criativo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {creatives.map((c: any, i: number) => {
          const Icon = typeIcon[c.type as keyof typeof typeIcon] || Image;
          return (
            <motion.div
              key={c.name + i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-card rounded-xl surface-glow hover:surface-glow-hover transition-shadow cursor-pointer overflow-hidden"
            >
              {/* Thumbnail placeholder */}
              <div className="h-40 bg-secondary/50 flex items-center justify-center">
                <Icon className="h-10 w-10 text-muted-foreground/30" />
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium truncate">{c.name}</h3>
                  {c.status === "winner" && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                      <Trophy className="h-3 w-3" /> Vencedor
                    </span>
                  )}
                  {c.fatigue && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                      <TrendingDown className="h-3 w-3" /> Fadiga
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{c.platform}</span>
                  <span className="capitalize">{c.type}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">CTR</p>
                    <p className="font-mono tabular-nums text-sm font-medium">{c.ctr}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Conv.</p>
                    <p className="font-mono tabular-nums text-sm font-medium">{c.conversions}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CreativesPage;
