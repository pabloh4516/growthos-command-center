import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatBRL } from "@/components/shared/CurrencyDisplay";
import { useMetricsByGeo } from "@/hooks/use-supabase-data";

const mockGeoData = [
  { estado: "SP - São Paulo (Capital)", impressoes: 320000, cliques: 22400, conversoes: 380, cpa: 15.20, roas: 4.2, gasto: 5776 },
  { estado: "RJ - Rio de Janeiro", impressoes: 180000, cliques: 10800, conversoes: 162, cpa: 18.50, roas: 3.5, gasto: 2997 },
  { estado: "MG - Belo Horizonte", impressoes: 120000, cliques: 8400, conversoes: 126, cpa: 16.80, roas: 3.8, gasto: 2117 },
  { estado: "PR - Curitiba", impressoes: 85000, cliques: 5950, conversoes: 89, cpa: 14.50, roas: 4.5, gasto: 1291 },
  { estado: "RS - Porto Alegre", impressoes: 75000, cliques: 5250, conversoes: 79, cpa: 17.20, roas: 3.3, gasto: 1359 },
  { estado: "SC - Florianópolis", impressoes: 45000, cliques: 3150, conversoes: 47, cpa: 19.80, roas: 2.9, gasto: 931 },
  { estado: "BA - Salvador", impressoes: 65000, cliques: 3900, conversoes: 39, cpa: 25.60, roas: 2.1, gasto: 998 },
  { estado: "PE - Recife", impressoes: 42000, cliques: 2520, conversoes: 25, cpa: 28.40, roas: 1.8, gasto: 710 },
  { estado: "CE - Fortaleza", impressoes: 38000, cliques: 2280, conversoes: 23, cpa: 26.50, roas: 2.0, gasto: 610 },
  { estado: "GO - Goiânia", impressoes: 35000, cliques: 2450, conversoes: 37, cpa: 15.90, roas: 4.0, gasto: 588 },
  { estado: "DF - Brasília", impressoes: 52000, cliques: 3640, conversoes: 55, cpa: 16.10, roas: 3.9, gasto: 886 },
  { estado: "SP - Campinas", impressoes: 28000, cliques: 1680, conversoes: 12, cpa: 35.00, roas: 0.7, gasto: 420 },
  { estado: "ES - Vitória", impressoes: 18000, cliques: 1080, conversoes: 16, cpa: 20.60, roas: 2.7, gasto: 330 },
  { estado: "PA - Belém", impressoes: 15000, cliques: 750, conversoes: 8, cpa: 31.20, roas: 1.5, gasto: 250 },
  { estado: "AM - Manaus", impressoes: 12000, cliques: 600, conversoes: 5, cpa: 36.00, roas: 1.2, gasto: 180 },
];

type Geo = {
  estado: string;
  impressoes: number;
  cliques: number;
  conversoes: number;
  cpa: number;
  roas: number;
  gasto: number;
};

const columns: ColumnDef<Geo, any>[] = [
  { accessorKey: "estado", header: "Estado/Cidade" },
  { accessorKey: "impressoes", header: "Impressões", cell: ({ getValue }) => <span className="font-mono tabular-nums text-muted-foreground">{(getValue() as number).toLocaleString("pt-BR")}</span> },
  { accessorKey: "cliques", header: "Cliques", cell: ({ getValue }) => <span className="font-mono tabular-nums">{(getValue() as number).toLocaleString("pt-BR")}</span> },
  { accessorKey: "conversoes", header: "Conv.", cell: ({ getValue }) => <span className="font-mono tabular-nums">{getValue() as number}</span> },
  { accessorKey: "cpa", header: "CPA", cell: ({ getValue }) => {
    const v = getValue() as number;
    return <span className={`font-mono tabular-nums ${v <= 18 ? "text-success" : v <= 25 ? "text-warning" : "text-destructive"}`}>{formatBRL(v)}</span>;
  }},
  { accessorKey: "roas", header: "ROAS", cell: ({ getValue }) => {
    const v = getValue() as number;
    return <span className={`font-mono tabular-nums font-semibold ${v >= 3 ? "text-success" : v >= 2 ? "text-warning" : "text-destructive"}`}>{v.toFixed(1)}x</span>;
  }},
  { accessorKey: "gasto", header: "Gasto", cell: ({ getValue }) => <span className="font-mono tabular-nums">{formatBRL(getValue() as number)}</span> },
];

const GeoPage = () => {
  const { data: rawData, isLoading } = useMetricsByGeo();

  const geoData: Geo[] = rawData && rawData.length > 0
    ? rawData.map((row: any) => ({
        estado: row.region || row.city || row.estado || "",
        impressoes: row.impressions || row.impressoes || 0,
        cliques: row.clicks || row.cliques || 0,
        conversoes: row.conversions || row.conversoes || 0,
        cpa: row.cpa || 0,
        roas: row.roas || 0,
        gasto: row.cost || row.gasto || 0,
      }))
    : mockGeoData;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <PageHeader title="Análise Geográfica" subtitle="Performance por estado e cidade" />
        <div className="h-16 bg-muted animate-pulse rounded-xl" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="Análise Geográfica" subtitle="Performance por estado e cidade" />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/10 border border-primary/20 rounded-xl p-4">
        <p className="text-sm"><span className="font-medium">São Paulo capital</span> tem ROAS <span className="text-success font-semibold">4.2x</span> mas <span className="font-medium">Campinas</span> tem ROAS <span className="text-destructive font-semibold">0.7x</span> — considere excluir ou reduzir bid.</p>
      </motion.div>

      <DataTable data={geoData} columns={columns} searchPlaceholder="Buscar região..." />
    </div>
  );
};

export default GeoPage;
