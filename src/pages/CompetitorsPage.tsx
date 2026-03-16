import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Eye, ExternalLink } from "lucide-react";
import { useCompetitors } from "@/hooks/use-supabase-data";

const benchCols: ColumnDef<any, any>[] = [
  { accessorKey: "metrica", header: "Métrica" },
  { accessorKey: "seu", header: "Seu Valor", cell: ({ getValue }) => <span className="font-mono tabular-nums font-semibold text-primary">{getValue() as string}</span> },
  { accessorKey: "media", header: "Média Setor" },
  { accessorKey: "p25", header: "P25" },
  { accessorKey: "mediana", header: "Mediana" },
  { accessorKey: "p75", header: "P75" },
];

const CompetitorsPage = () => {
  const { data: competitorsData, isLoading } = useCompetitors();

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

  const allCompetitors = (competitorsData ?? []) as any[];

  if (allCompetitors.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <PageHeader title="Competidores" subtitle="Monitore anúncios e benchmarks do setor" />
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Nenhum dado encontrado.
        </div>
      </div>
    );
  }

  const competitors = allCompetitors.map((c: any) => ({
    nome: c.name ?? c.nome ?? "—",
    dominio: c.domain ?? c.dominio ?? "—",
    totalAds: c.total_ads ?? c.totalAds ?? 0,
    ultimoAd: c.last_ad_date ? new Date(c.last_ad_date).toLocaleDateString("pt-BR") : (c.ultimoAd ?? "—"),
  }));

  const benchmarks = (allCompetitors[0]?.benchmarks ?? []).map((b: any) => ({
    metrica: b.metric ?? b.metrica ?? "—",
    seu: b.your_value ?? b.seu ?? "—",
    media: b.sector_avg ?? b.media ?? "—",
    p25: b.p25 ?? "—",
    mediana: b.median ?? b.mediana ?? "—",
    p75: b.p75 ?? "—",
  }));

  const radarData = (allCompetitors[0]?.radar ?? []).map((r: any) => ({
    metric: r.metric ?? "—",
    voce: r.you ?? r.voce ?? 50,
    setor: r.sector ?? r.setor ?? 50,
  }));

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="Competidores" subtitle="Monitore anúncios e benchmarks do setor" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {competitors.map((c: any, i: number) => (
          <motion.div key={c.nome + i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl surface-glow p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center"><Eye className="h-5 w-5 text-muted-foreground" /></div>
              <div><p className="font-medium text-sm">{c.nome}</p><p className="text-xs text-muted-foreground">{c.dominio}</p></div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>{c.totalAds} anúncios detectados</span>
              <span className="text-muted-foreground">Último: {c.ultimoAd}</span>
            </div>
            <button className="mt-3 w-full py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" /> Ver Anúncios
            </button>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {benchmarks.length > 0 ? (
            <DataTable data={benchmarks} columns={benchCols} searchPlaceholder="Buscar métrica..." />
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm bg-card rounded-xl surface-glow">Nenhum benchmark disponível.</div>
          )}
        </div>
        {radarData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Você vs Setor</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(217,33%,12%)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} />
                  <Radar name="Você" dataKey="voce" stroke="hsl(221,83%,53%)" fill="hsl(221,83%,53%)" fillOpacity={0.2} />
                  <Radar name="Setor" dataKey="setor" stroke="hsl(215,20%,55%)" fill="hsl(215,20%,55%)" fillOpacity={0.1} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
export default CompetitorsPage;
