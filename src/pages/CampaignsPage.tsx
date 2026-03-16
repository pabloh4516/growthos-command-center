import { motion } from "framer-motion";
import { Search, Filter, MoreHorizontal, Pause } from "lucide-react";
import { useState, useMemo } from "react";
import { useCampaigns } from "@/hooks/use-supabase-data";

function healthColor(h: number) {
  if (h >= 70) return "text-success";
  if (h >= 40) return "text-warning";
  return "text-destructive";
}

function statusBadge(s: string) {
  if (s === "active") return <span className="flex items-center gap-1 text-xs text-success"><span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse-glow" />Active</span>;
  if (s === "paused") return <span className="flex items-center gap-1 text-xs text-warning"><Pause className="h-3 w-3" />Paused</span>;
  return <span className="text-xs text-muted-foreground">{s}</span>;
}

function formatNum(n: number | null | undefined): string {
  const v = Number(n ?? 0);
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return v.toLocaleString();
}

const LoadingSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="h-8 w-48 bg-muted animate-pulse rounded" />
    <div className="h-9 w-64 bg-muted animate-pulse rounded-lg" />
    <div className="bg-muted animate-pulse rounded-xl h-[400px]" />
  </div>
);

const CampaignsPage = () => {
  const { data: campaignsRaw, isLoading } = useCampaigns();
  const [search, setSearch] = useState("");

  // Map DB fields to display fields
  const campaigns = useMemo(() => {
    return (campaignsRaw ?? []).map((c: any) => ({
      id: c.id,
      name: c.name ?? '',
      platform: c.platform ?? '',
      status: c.status ?? 'draft',
      budget: c.daily_budget ? `$${Number(c.daily_budget).toLocaleString()}/d` : c.lifetime_budget ? `$${Number(c.lifetime_budget).toLocaleString()} total` : '-',
      spend: `$${Number(c.cost ?? 0).toLocaleString()}`,
      impressions: formatNum(c.impressions),
      clicks: formatNum(c.clicks),
      ctr: `${(Number(c.ctr ?? 0) * 100).toFixed(2)}%`,
      cpc: `$${Number(c.avg_cpc ?? 0).toFixed(2)}`,
      conversions: Number(c.google_conversions ?? 0),
      cpa: `$${Number(c.real_cpa ?? (Number(c.google_conversions) > 0 ? Number(c.cost) / Number(c.google_conversions) : 0)).toFixed(2)}`,
      revenue: `$${Number(c.real_revenue ?? c.google_conversion_value ?? 0).toLocaleString()}`,
      roas: `${Number(c.real_roas ?? (Number(c.cost) > 0 ? Number(c.google_conversion_value ?? 0) / Number(c.cost) : 0)).toFixed(2)}x`,
      health: Number(c.health_score ?? 0),
    }));
  }, [campaignsRaw]);

  const filtered = useMemo(() => {
    if (!search) return campaigns;
    const q = search.toLowerCase();
    return campaigns.filter((c: any) => c.name.toLowerCase().includes(q) || c.platform.toLowerCase().includes(q));
  }, [campaigns, search]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const uniquePlatforms = new Set((campaignsRaw ?? []).map((c: any) => c.platform));

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campanhas</h1>
          <p className="text-sm text-muted-foreground mt-1">{campaigns.length} campanhas · {uniquePlatforms.size} plataformas</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          + Nova Campanha
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            placeholder="Buscar campanha..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full pl-9 pr-3 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button className="h-9 px-3 flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-lg hover:text-foreground transition-colors">
          <Filter className="h-3.5 w-3.5" /> Filtros
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {campaigns.length === 0
            ? "Nenhuma campanha encontrada. Conecte sua conta do Google Ads para comecar."
            : "Nenhuma campanha corresponde a sua busca."}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-xl surface-glow overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Campanha", "Plataforma", "Status", "Budget", "Gasto", "Impr.", "Clicks", "CTR", "CPC", "Conv.", "CPA", "Receita", "ROAS", "Score", ""].map((h) => (
                    <th key={h} className="text-left px-3 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c: any, i: number) => (
                  <motion.tr
                    key={c.id || c.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border hover:bg-secondary/30 transition-colors cursor-pointer"
                  >
                    <td className="px-3 py-3 pl-5 font-medium max-w-[200px] truncate">{c.name}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.platform}</td>
                    <td className="px-3 py-3">{statusBadge(c.status)}</td>
                    <td className="px-3 py-3 font-mono tabular-nums text-muted-foreground">{c.budget}</td>
                    <td className="px-3 py-3 font-mono tabular-nums">{c.spend}</td>
                    <td className="px-3 py-3 font-mono tabular-nums text-muted-foreground">{c.impressions}</td>
                    <td className="px-3 py-3 font-mono tabular-nums text-muted-foreground">{c.clicks}</td>
                    <td className="px-3 py-3 font-mono tabular-nums">{c.ctr}</td>
                    <td className="px-3 py-3 font-mono tabular-nums text-muted-foreground">{c.cpc}</td>
                    <td className="px-3 py-3 font-mono tabular-nums">{c.conversions}</td>
                    <td className="px-3 py-3 font-mono tabular-nums">{c.cpa}</td>
                    <td className="px-3 py-3 font-mono tabular-nums">{c.revenue}</td>
                    <td className="px-3 py-3 font-mono tabular-nums text-success">{c.roas}</td>
                    <td className={`px-3 py-3 font-mono tabular-nums font-semibold ${healthColor(c.health)}`}>{c.health}</td>
                    <td className="px-3 py-3 pr-5">
                      <button className="p-1 text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CampaignsPage;
