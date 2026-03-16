import { KPICard } from "@/components/KPICard";
import { HealthGauge } from "@/components/HealthGauge";
import { InsightCard } from "@/components/InsightCard";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useDashboardMetrics, useTopCampaigns, useInsights, useConversionsByPlatform } from "@/hooks/use-supabase-data";

function healthColor(h: number) {
  if (h >= 70) return "text-success";
  if (h >= 40) return "text-warning";
  return "text-destructive";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-mono tabular-nums" style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" && p.name !== "conversions" ? `$${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="h-8 w-48 bg-muted animate-pulse rounded" />
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 h-64 bg-muted animate-pulse rounded-xl" />
      <div className="h-64 bg-muted animate-pulse rounded-xl" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-3 h-64 bg-muted animate-pulse rounded-xl" />
      <div className="h-64 bg-muted animate-pulse rounded-xl" />
    </div>
  </div>
);

const Dashboard = () => {
  const { data: metricsData, isLoading: metricsLoading } = useDashboardMetrics('30d');
  const { data: topCampaignsData, isLoading: campaignsLoading } = useTopCampaigns(5);
  const { data: insightsData, isLoading: insightsLoading } = useInsights();
  const { data: conversionsByPlatformData, isLoading: conversionsLoading } = useConversionsByPlatform();

  const isLoading = metricsLoading || campaignsLoading || insightsLoading || conversionsLoading;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Map metrics to KPI cards
  const totals = metricsData?.totals ?? { impressions: 0, clicks: 0, cost: 0, conversions: 0, revenue: 0, real_sales: 0, real_revenue: 0, roas: 0, cpa: 0 };
  const daily = metricsData?.daily ?? [];

  // Build spark data from daily metrics
  const costSpark = daily.slice(-7).map((d: any) => Number(d.cost ?? 0));
  const revenueSpark = daily.slice(-7).map((d: any) => Number(d.revenue ?? 0));
  const roasSpark = daily.slice(-7).map((d: any) => Number(d.cost) > 0 ? Number(d.revenue) / Number(d.cost) : 0);
  const cpaSpark = daily.slice(-7).map((d: any) => Number(d.conversions) > 0 ? Number(d.cost) / Number(d.conversions) : 0);
  const convSpark = daily.slice(-7).map((d: any) => Number(d.conversions ?? 0));
  const realSalesSpark = daily.slice(-7).map((d: any) => Number(d.real_sales ?? 0));

  const kpis = [
    { title: "Gasto Total", value: `$${totals.cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, change: 0, spark: costSpark.length > 0 ? costSpark : [0] },
    { title: "Receita Gerada", value: `$${totals.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, change: 0, spark: revenueSpark.length > 0 ? revenueSpark : [0] },
    { title: "ROAS Geral", value: `${totals.roas.toFixed(2)}x`, change: 0, spark: roasSpark.length > 0 ? roasSpark : [0] },
    { title: "CPA Medio", value: `$${totals.cpa.toFixed(2)}`, change: 0, spark: cpaSpark.length > 0 ? cpaSpark : [0] },
    { title: "Conversoes", value: totals.conversions.toLocaleString(undefined, { maximumFractionDigits: 0 }), change: 0, spark: convSpark.length > 0 ? convSpark : [0] },
    { title: "Vendas Reais", value: totals.real_sales.toLocaleString(), change: 0, spark: realSalesSpark.length > 0 ? realSalesSpark : [0] },
  ];

  // Build spend vs revenue chart data from daily metrics
  const spendRevenueData = daily.map((d: any) => ({
    name: d.date?.slice(5) ?? '',
    spend: Number(d.cost ?? 0),
    revenue: Number(d.revenue ?? 0),
  }));

  // Conversions by platform
  const conversionsByPlatform = (conversionsByPlatformData ?? []).map((c: any) => ({
    platform: c.platform ?? 'Unknown',
    conversions: Number(c.conversions ?? 0),
  }));

  // Top campaigns mapped from DB shape
  const topCampaigns = (topCampaignsData ?? []).map((c: any) => ({
    name: c.name ?? '',
    platform: c.platform ?? '',
    spend: `$${Number(c.cost ?? 0).toLocaleString()}`,
    revenue: `$${Number(c.real_revenue ?? c.google_conversion_value ?? 0).toLocaleString()}`,
    roas: `${Number(c.real_roas ?? 0).toFixed(2)}x`,
    cpa: `$${Number(c.real_cpa ?? 0).toFixed(2)}`,
    health: Number(c.health_score ?? 0),
  }));

  // Map insights from DB shape
  const severityMap: Record<string, "critical" | "warning" | "info"> = { critical: "critical", warning: "warning", info: "info" };
  const insights = (insightsData ?? []).slice(0, 5).map((ins: any) => ({
    severity: severityMap[ins.severity] ?? ("info" as const),
    title: ins.title ?? '',
    action: ins.suggested_action ?? 'Ver detalhes',
  }));

  // Health score: average of top campaigns health
  const avgHealth = topCampaigns.length > 0
    ? Math.round(topCampaigns.reduce((s: number, c: any) => s + c.health, 0) / topCampaigns.length)
    : 0;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-[1400px]">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Centro de Comando</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Visao geral da operacao · Ultimos 30 dias
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.title} {...kpi} sparkData={kpi.spark} delay={i * 0.05} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spend vs Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-2 bg-card rounded-xl surface-glow p-5"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
            Gasto vs Receita
          </p>
          {spendRevenueData.length === 0 ? (
            <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground text-sm">Nenhum dado de metricas encontrado.</div>
          ) : (
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,12%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="spend" stroke="hsl(0,84%,60%)" strokeWidth={2} dot={false} name="Gasto" />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(142,71%,45%)" strokeWidth={2} dot={false} name="Receita" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Conversions by Platform */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-card rounded-xl surface-glow p-5"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
            Conversoes por Plataforma
          </p>
          {conversionsByPlatform.length === 0 ? (
            <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground text-sm">Nenhuma conversao encontrada.</div>
          ) : (
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionsByPlatform} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,12%)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="platform" type="category" tick={{ fontSize: 11, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="conversions" fill="hsl(221,83%,53%)" radius={[0, 4, 4, 0]} name="conversions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      {/* Table + Health Score Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Top Campaigns Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="lg:col-span-3 bg-card rounded-xl surface-glow overflow-hidden"
        >
          <div className="p-5 pb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Top Campanhas por ROAS
            </p>
          </div>
          {topCampaigns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhuma campanha encontrada. Conecte sua conta do Google Ads para comecar.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-t border-border">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Campanha</th>
                    <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Plataforma</th>
                    <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Gasto</th>
                    <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Receita</th>
                    <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">ROAS</th>
                    <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">CPA</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {topCampaigns.map((c: any) => (
                    <tr key={c.name} className="border-t border-border hover:bg-secondary/30 transition-colors cursor-pointer">
                      <td className="px-5 py-3 font-medium">{c.name}</td>
                      <td className="px-3 py-3 text-muted-foreground">{c.platform}</td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums">{c.spend}</td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums">{c.revenue}</td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-success">{c.roas}</td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums">{c.cpa}</td>
                      <td className={`px-5 py-3 text-right font-mono tabular-nums font-semibold ${healthColor(c.health)}`}>{c.health}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="bg-card rounded-xl surface-glow p-5 flex flex-col items-center justify-center relative"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
            Operation Health
          </p>
          <HealthGauge score={avgHealth} />
          <p className="text-xs text-muted-foreground mt-4 text-center leading-relaxed">
            {avgHealth >= 70 ? "ROAS trending up." : avgHealth >= 40 ? "Performance moderada." : "Atencao necessaria."}<br />
            {topCampaigns.length > 0 ? `${topCampaigns.length} campanhas ativas.` : "Nenhuma campanha ativa."}
          </p>
        </motion.div>
      </div>

      {/* Insights Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
          Insights Recentes
        </p>
        {insights.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Nenhum insight encontrado ainda.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {insights.map((insight: any, i: number) => (
              <InsightCard key={i} {...insight} delay={0.7 + i * 0.05} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
