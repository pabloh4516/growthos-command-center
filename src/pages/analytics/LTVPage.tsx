import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatBRL } from "@/components/shared/CurrencyDisplay";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useLTVData } from "@/hooks/use-supabase-data";

const mockLtvData = [
  { source: "Google Search", avgLtv: 3200, mediana: 2800, clientes: 142, cac: 520, ltvCac: 6.15 },
  { source: "Meta Retargeting", avgLtv: 2100, mediana: 1800, clientes: 215, cac: 380, ltvCac: 5.53 },
  { source: "Meta LAL", avgLtv: 1450, mediana: 1200, clientes: 89, cac: 450, ltvCac: 3.22 },
  { source: "TikTok", avgLtv: 980, mediana: 750, clientes: 67, cac: 620, ltvCac: 1.58 },
  { source: "Orgânico", avgLtv: 4500, mediana: 3800, clientes: 198, cac: 0, ltvCac: 0 },
  { source: "Indicação", avgLtv: 5200, mediana: 4200, clientes: 56, cac: 150, ltvCac: 34.67 },
];

type LTV = {
  source: string;
  avgLtv: number;
  mediana: number;
  clientes: number;
  cac: number;
  ltvCac: number;
};

const columns: ColumnDef<LTV, any>[] = [
  { accessorKey: "source", header: "Source" },
  { accessorKey: "avgLtv", header: "LTV Médio", cell: ({ getValue }) => <span className="font-mono tabular-nums">{formatBRL(getValue() as number)}</span> },
  { accessorKey: "mediana", header: "Mediana", cell: ({ getValue }) => <span className="font-mono tabular-nums text-muted-foreground">{formatBRL(getValue() as number)}</span> },
  { accessorKey: "clientes", header: "Clientes", cell: ({ getValue }) => <span className="font-mono tabular-nums">{getValue() as number}</span> },
  { accessorKey: "cac", header: "CAC", cell: ({ getValue }) => <span className="font-mono tabular-nums">{(getValue() as number) > 0 ? formatBRL(getValue() as number) : "\u2014"}</span> },
  { accessorKey: "ltvCac", header: "LTV:CAC", cell: ({ getValue }) => {
    const v = getValue() as number;
    if (v === 0) return <span className="text-muted-foreground">{"\u2014"}</span>;
    return <span className={`font-mono tabular-nums font-semibold ${v >= 3 ? "text-success" : v >= 2 ? "text-warning" : "text-destructive"}`}>{v.toFixed(1)}x</span>;
  }},
];

const LTVPage = () => {
  const { data: rawData, isLoading } = useLTVData();

  const ltvData: LTV[] = rawData && rawData.length > 0
    ? rawData.map((row: any) => ({
        source: row.source || row.channel || "",
        avgLtv: row.avg_ltv || row.avgLtv || 0,
        mediana: row.median_ltv || row.mediana || 0,
        clientes: row.customers || row.clientes || 0,
        cac: row.cac || 0,
        ltvCac: row.cac > 0 ? (row.avg_ltv || 0) / row.cac : 0,
      }))
    : mockLtvData;

  const chartData = ltvData.filter(d => d.cac > 0).map(d => ({ source: d.source, ltv: d.avgLtv, cac: d.cac }));

  // Compute aggregate KPIs
  const totalClients = ltvData.reduce((s, d) => s + d.clientes, 0);
  const weightedLtv = totalClients > 0 ? ltvData.reduce((s, d) => s + d.avgLtv * d.clientes, 0) / totalClients : 0;
  const weightedMedian = totalClients > 0 ? ltvData.reduce((s, d) => s + d.mediana * d.clientes, 0) / totalClients : 0;
  const paidClients = ltvData.filter(d => d.cac > 0);
  const totalPaidClients = paidClients.reduce((s, d) => s + d.clientes, 0);
  const weightedCac = totalPaidClients > 0 ? paidClients.reduce((s, d) => s + d.cac * d.clientes, 0) / totalPaidClients : 1;
  const ltvCacRatio = weightedCac > 0 ? weightedLtv / weightedCac : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <PageHeader title="LTV Analysis" subtitle="Lifetime Value por canal e segmento" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="LTV Analysis" subtitle="Lifetime Value por canal e segmento" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="LTV Médio" value={`R$ ${Math.round(weightedLtv).toLocaleString("pt-BR")}`} change={12.3} sparkData={[1800, 1900, 2000, 2100, 2200, 2350, Math.round(weightedLtv)]} />
        <KPICard title="LTV Mediano" value={`R$ ${Math.round(weightedMedian).toLocaleString("pt-BR")}`} change={8.5} sparkData={[1400, 1450, 1500, 1550, 1650, 1750, Math.round(weightedMedian)]} delay={0.05} />
        <KPICard title="LTV:CAC Ratio" value={`${ltvCacRatio.toFixed(1)}x`} change={15.7} sparkData={[2.2, 2.4, 2.6, 2.8, 2.9, 3.0, ltvCacRatio]} delay={0.1} />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-success/10 border border-success/20 rounded-xl p-4">
        <p className="text-sm">Clientes do <span className="font-medium">Google Search</span> têm LTV <span className="text-success font-semibold">2.5x maior</span> — justifica CPA mais alto neste canal.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <DataTable data={ltvData} columns={columns} searchPlaceholder="Buscar source..." />
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl surface-glow p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">LTV vs CAC por Canal</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="source" tick={{ fontSize: 9, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "hsl(222,47%,7%)", border: "1px solid hsl(217,33%,12%)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="ltv" name="LTV" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cac" name="CAC" fill="hsl(0,84%,60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LTVPage;
