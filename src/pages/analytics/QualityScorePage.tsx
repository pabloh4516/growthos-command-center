import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatBRL } from "@/components/shared/CurrencyDisplay";
import { useQualityScoreKeywords } from "@/hooks/use-supabase-data";

const mockKeywords = Array.from({ length: 25 }, (_, i) => ({
  keyword: ["colágeno hidrolisado", "curso marketing digital", "consultoria seo", "gestão google ads", "tráfego pago", "landing page", "automação marketing", "email marketing", "facebook ads", "instagram ads", "copywriting", "funil de vendas", "leads qualificados", "remarketing", "público lookalike", "google analytics", "conversion rate", "cpc google ads", "roi marketing", "growth hacking", "inbound marketing", "social media", "branding", "e-commerce marketing", "performance marketing"][i],
  qs: [8, 3, 7, 9, 4, 6, 5, 2, 7, 8, 3, 6, 9, 4, 5, 7, 2, 6, 8, 3, 7, 4, 9, 5, 6][i],
  relevancia: ["Bom", "Ruim", "Bom", "Bom", "Médio", "Médio", "Médio", "Ruim", "Bom", "Bom", "Ruim", "Médio", "Bom", "Médio", "Médio", "Bom", "Ruim", "Médio", "Bom", "Ruim", "Bom", "Médio", "Bom", "Médio", "Médio"][i],
  experienciaLP: ["Bom", "Ruim", "Bom", "Bom", "Médio", "Bom", "Médio", "Ruim", "Bom", "Bom", "Médio", "Médio", "Bom", "Ruim", "Médio", "Bom", "Ruim", "Bom", "Bom", "Ruim", "Bom", "Médio", "Bom", "Médio", "Bom"][i],
  ctrEsperado: ["Bom", "Ruim", "Médio", "Bom", "Ruim", "Médio", "Médio", "Ruim", "Bom", "Bom", "Ruim", "Médio", "Bom", "Médio", "Médio", "Bom", "Ruim", "Médio", "Bom", "Ruim", "Médio", "Ruim", "Bom", "Médio", "Médio"][i],
}));

type KW = {
  keyword: string;
  qs: number;
  relevancia: string;
  experienciaLP: string;
  ctrEsperado: string;
};

const qsBadge: Record<string, string> = { "Bom": "bg-success/20 text-success", "Médio": "bg-warning/20 text-warning", "Ruim": "bg-destructive/20 text-destructive" };

const columns: ColumnDef<KW, any>[] = [
  { accessorKey: "keyword", header: "Keyword" },
  { accessorKey: "qs", header: "QS", cell: ({ getValue }) => {
    const v = getValue() as number;
    return <span className={`font-mono tabular-nums font-bold ${v >= 7 ? "text-success" : v >= 4 ? "text-warning" : "text-destructive"}`}>{v}</span>;
  }},
  { accessorKey: "relevancia", header: "Relevância", cell: ({ getValue }) => <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${qsBadge[getValue() as string] || ""}`}>{getValue() as string}</span> },
  { accessorKey: "experienciaLP", header: "Exp. LP", cell: ({ getValue }) => <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${qsBadge[getValue() as string] || ""}`}>{getValue() as string}</span> },
  { accessorKey: "ctrEsperado", header: "CTR Esperado", cell: ({ getValue }) => <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${qsBadge[getValue() as string] || ""}`}>{getValue() as string}</span> },
];

function qsLabel(qs: number): string {
  if (qs >= 7) return "Bom";
  if (qs >= 4) return "Médio";
  return "Ruim";
}

const QualityScorePage = () => {
  const { data: rawData, isLoading } = useQualityScoreKeywords();

  const keywords: KW[] = rawData && rawData.length > 0
    ? rawData.map((row: any) => ({
        keyword: row.keyword || row.text || "",
        qs: row.quality_score || row.qs || 0,
        relevancia: row.relevance_label || qsLabel(row.quality_score || 0),
        experienciaLP: row.lp_experience_label || qsLabel(row.lp_experience || row.quality_score || 0),
        ctrEsperado: row.expected_ctr_label || qsLabel(row.expected_ctr || row.quality_score || 0),
      }))
    : mockKeywords;

  const lowQS = keywords.filter(k => k.qs < 5);
  const midQS = keywords.filter(k => k.qs >= 4 && k.qs <= 6);
  const highQS = keywords.filter(k => k.qs >= 7);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <PageHeader title="Quality Score" subtitle="Análise de Quality Score das keywords Google Ads" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="Quality Score" subtitle="Análise de Quality Score das keywords Google Ads" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "QS 1-3 (Baixo)", count: lowQS.length, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "QS 4-6 (Médio)", count: midQS.length, color: "text-warning", bg: "bg-warning/10" },
          { label: "QS 7-10 (Alto)", count: highQS.length, color: "text-success", bg: "bg-success/10" },
        ].map(c => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl p-5 ${c.bg}`}>
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className={`text-3xl font-mono font-bold mt-1 ${c.color}`}>{c.count}</p>
            <p className="text-xs text-muted-foreground mt-1">keywords</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-warning/10 border border-warning/20 rounded-xl p-4">
        <p className="text-sm"><span className="font-semibold">{lowQS.length} keywords</span> com QS {"<"} 5 geraram gasto extra estimado de <span className="font-semibold text-destructive">{formatBRL(2300)}</span>/mês</p>
      </motion.div>

      <DataTable data={keywords} columns={columns} searchPlaceholder="Buscar keyword..." />
    </div>
  );
};

export default QualityScorePage;
