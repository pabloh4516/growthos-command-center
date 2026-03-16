import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatBRL } from "@/components/shared/CurrencyDisplay";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { usePlacements } from "@/hooks/use-supabase-data";

const mockPlacements = [
  { placement: "Feed", plataforma: "Meta", impressoes: 380000, cliques: 22800, conversoes: 342, cpa: 14.20, roas: 4.5, budget: 32 },
  { placement: "Stories", plataforma: "Meta", impressoes: 220000, cliques: 11000, conversoes: 132, cpa: 18.60, roas: 3.2, budget: 18 },
  { placement: "Reels", plataforma: "Meta", impressoes: 150000, cliques: 10500, conversoes: 105, cpa: 16.70, roas: 3.8, budget: 12 },
  { placement: "Audience Network", plataforma: "Meta", impressoes: 280000, cliques: 5600, conversoes: 14, cpa: 85.70, roas: 0.3, budget: 30 },
  { placement: "Search", plataforma: "Google", impressoes: 89000, cliques: 8900, conversoes: 400, cpa: 5.25, roas: 6.0, budget: 35 },
  { placement: "Display", plataforma: "Google", impressoes: 420000, cliques: 8400, conversoes: 42, cpa: 45.20, roas: 1.1, budget: 15 },
  { placement: "YouTube", plataforma: "Google", impressoes: 180000, cliques: 5400, conversoes: 96, cpa: 29.17, roas: 1.7, budget: 8 },
  { placement: "For You", plataforma: "TikTok", impressoes: 520000, cliques: 26000, conversoes: 187, cpa: 24.19, roas: 2.5, budget: 10 },
];

type P = {
  placement: string;
  plataforma: string;
  impressoes: number;
  cliques: number;
  conversoes: number;
  cpa: number;
  roas: number;
  budget: number;
};

const columns: ColumnDef<P, any>[] = [
  { accessorKey: "placement", header: "Placement" },
  { accessorKey: "plataforma", header: "Plataforma" },
  { accessorKey: "impressoes", header: "Impr.", cell: ({ getValue }) => <span className="font-mono tabular-nums text-muted-foreground">{(getValue() as number).toLocaleString("pt-BR")}</span> },
  { accessorKey: "cliques", header: "Cliques", cell: ({ getValue }) => <span className="font-mono tabular-nums">{(getValue() as number).toLocaleString("pt-BR")}</span> },
  { accessorKey: "conversoes", header: "Conv.", cell: ({ getValue }) => <span className="font-mono tabular-nums">{getValue() as number}</span> },
  { accessorKey: "cpa", header: "CPA", cell: ({ getValue }) => <span className={`font-mono tabular-nums ${(getValue() as number) > 30 ? "text-destructive" : "text-success"}`}>{formatBRL(getValue() as number)}</span> },
  { accessorKey: "roas", header: "ROAS", cell: ({ getValue }) => {
    const v = getValue() as number;
    return <span className={`font-mono tabular-nums font-semibold ${v >= 3 ? "text-success" : v >= 2 ? "text-warning" : "text-destructive"}`}>{v.toFixed(1)}x</span>;
  }},
  { accessorKey: "budget", header: "% Budget", cell: ({ getValue }) => <span className="font-mono tabular-nums">{getValue() as number}%</span> },
];

const PlacementsPage = () => {
  const { data: rawData, isLoading } = usePlacements();

  const placements: P[] = rawData && rawData.length > 0
    ? rawData.map((row: any) => ({
        placement: row.placement_name || row.placement || "",
        plataforma: row.platform || row.plataforma || "",
        impressoes: row.impressions || row.impressoes || 0,
        cliques: row.clicks || row.cliques || 0,
        conversoes: row.conversions || row.conversoes || 0,
        cpa: row.cpa || 0,
        roas: row.roas || 0,
        budget: row.budget_pct || row.budget || 0,
      }))
    : mockPlacements;

  const chartData = placements.map(p => ({ name: p.placement, roas: p.roas }));

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <PageHeader title="Placements" subtitle="Performance por posicionamento de anúncio" />
        <div className="h-16 bg-muted animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-96 bg-muted animate-pulse rounded-xl" />
          <div className="h-96 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="Placements" subtitle="Performance por posicionamento de anúncio" />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
        <p className="text-sm"><span className="font-medium">Audience Network</span> gasta <span className="font-semibold">30%</span> do budget com ROAS <span className="text-destructive font-semibold">0.3x</span> — considere excluir este placement.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <DataTable data={placements} columns={columns} searchPlaceholder="Buscar placement..." />
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl surface-glow p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">ROAS por Placement</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ background: "hsl(222,47%,7%)", border: "1px solid hsl(217,33%,12%)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="roas" fill="hsl(221,83%,53%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlacementsPage;
