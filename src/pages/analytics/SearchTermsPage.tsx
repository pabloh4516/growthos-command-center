import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatBRL } from "@/components/shared/CurrencyDisplay";
import { Plus, Minus } from "lucide-react";
import { useSearchTerms } from "@/hooks/use-supabase-data";

// Fallback mock data
const mockSearchTerms = [
  { termo: "colágeno hidrolisado comprar", campanha: "Google - Brand Search", adGroup: "Colágeno", keyword: "colágeno", matchType: "broad", impressoes: 4500, cliques: 315, ctr: 7.0, conversoes: 42, cpa: 12.50, custo: 525, badge: "Oportunidade" },
  { termo: "melhor colágeno para pele", campanha: "Google - Brand Search", adGroup: "Colágeno", keyword: "colágeno pele", matchType: "phrase", impressoes: 3200, cliques: 224, ctr: 7.0, conversoes: 28, cpa: 14.30, custo: 400, badge: "Oportunidade" },
  { termo: "colágeno preço", campanha: "Google - Brand Search", adGroup: "Colágeno", keyword: "colágeno", matchType: "broad", impressoes: 8900, cliques: 534, ctr: 6.0, conversoes: 38, cpa: 22.10, custo: 840, badge: null },
  { termo: "receita de colágeno caseiro", campanha: "Google - Brand Search", adGroup: "Colágeno", keyword: "colágeno", matchType: "broad", impressoes: 12000, cliques: 840, ctr: 7.0, conversoes: 0, cpa: 0, custo: 1260, badge: "Desperdiçando" },
  { termo: "colágeno efeitos colaterais", campanha: "Google - Brand Search", adGroup: "Colágeno", keyword: "colágeno", matchType: "broad", impressoes: 5600, cliques: 280, ctr: 5.0, conversoes: 0, cpa: 0, custo: 420, badge: "Irrelevante" },
  { termo: "marketing digital curso online", campanha: "Google - Competitor KWs", adGroup: "Cursos", keyword: "curso marketing", matchType: "phrase", impressoes: 6700, cliques: 402, ctr: 6.0, conversoes: 22, cpa: 32.70, custo: 720, badge: null },
  { termo: "como fazer marketing digital grátis", campanha: "Google - Competitor KWs", adGroup: "Cursos", keyword: "marketing digital", matchType: "broad", impressoes: 15000, cliques: 750, ctr: 5.0, conversoes: 0, cpa: 0, custo: 1125, badge: "Desperdiçando" },
  { termo: "consultoria seo preço", campanha: "Google - Brand Search", adGroup: "SEO", keyword: "consultoria seo", matchType: "exact", impressoes: 1200, cliques: 144, ctr: 12.0, conversoes: 18, cpa: 16.70, custo: 300, badge: "Oportunidade" },
  { termo: "seo o que é", campanha: "Google - Brand Search", adGroup: "SEO", keyword: "seo", matchType: "broad", impressoes: 22000, cliques: 660, ctr: 3.0, conversoes: 2, cpa: 165.0, custo: 330, badge: "Irrelevante" },
  { termo: "agência de marketing sp", campanha: "Google - Competitor KWs", adGroup: "Agência", keyword: "agência marketing", matchType: "phrase", impressoes: 3400, cliques: 272, ctr: 8.0, conversoes: 15, cpa: 29.30, custo: 440, badge: "Oportunidade" },
];

type ST = {
  termo: string;
  campanha: string;
  adGroup: string;
  keyword: string;
  matchType: string;
  impressoes: number;
  cliques: number;
  ctr: number;
  conversoes: number;
  cpa: number;
  custo: number;
  badge: string | null;
};

const badgeColors: Record<string, string> = {
  "Oportunidade": "bg-success/20 text-success",
  "Desperdiçando": "bg-destructive/20 text-destructive",
  "Irrelevante": "bg-secondary text-muted-foreground",
};

const matchColors: Record<string, string> = {
  "broad": "bg-blue-500/20 text-blue-400",
  "phrase": "bg-purple-500/20 text-purple-400",
  "exact": "bg-success/20 text-success",
};

const columns: ColumnDef<ST, any>[] = [
  { accessorKey: "termo", header: "Termo de Busca", cell: ({ row }) => (
    <div className="flex items-center gap-2">
      <span className="text-sm">{row.original.termo}</span>
      {row.original.badge && <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${badgeColors[row.original.badge] || ""}`}>{row.original.badge}</span>}
    </div>
  )},
  { accessorKey: "campanha", header: "Campanha", cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{getValue() as string}</span> },
  { accessorKey: "matchType", header: "Match", cell: ({ getValue }) => <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${matchColors[getValue() as string] || ""}`}>{getValue() as string}</span> },
  { accessorKey: "impressoes", header: "Impr.", cell: ({ getValue }) => <span className="font-mono tabular-nums text-muted-foreground">{(getValue() as number).toLocaleString("pt-BR")}</span> },
  { accessorKey: "cliques", header: "Cliques", cell: ({ getValue }) => <span className="font-mono tabular-nums">{(getValue() as number).toLocaleString("pt-BR")}</span> },
  { accessorKey: "ctr", header: "CTR", cell: ({ getValue }) => <span className="font-mono tabular-nums">{getValue() as number}%</span> },
  { accessorKey: "conversoes", header: "Conv.", cell: ({ getValue }) => <span className="font-mono tabular-nums">{getValue() as number}</span> },
  { accessorKey: "cpa", header: "CPA", cell: ({ getValue }) => <span className="font-mono tabular-nums">{(getValue() as number) > 0 ? formatBRL(getValue() as number) : "\u2014"}</span> },
  { accessorKey: "custo", header: "Custo", cell: ({ getValue }) => <span className="font-mono tabular-nums">{formatBRL(getValue() as number)}</span> },
  { id: "actions", header: "", cell: () => (
    <div className="flex gap-1">
      <button className="p-1 rounded text-success hover:bg-success/10" title="Adicionar como keyword"><Plus className="h-3.5 w-3.5" /></button>
      <button className="p-1 rounded text-destructive hover:bg-destructive/10" title="Adicionar como negativa"><Minus className="h-3.5 w-3.5" /></button>
    </div>
  )},
];

const SearchTermsPage = () => {
  const { data: rawData, isLoading } = useSearchTerms();

  // Map Supabase data to our format, or fallback
  const searchTerms: ST[] = rawData && rawData.length > 0
    ? rawData.map((row: any) => ({
        termo: row.search_term || row.term || row.termo || "",
        campanha: row.campaign_name || row.campanha || "",
        adGroup: row.ad_group || row.adGroup || "",
        keyword: row.keyword || "",
        matchType: row.match_type || row.matchType || "broad",
        impressoes: row.impressions || row.impressoes || 0,
        cliques: row.clicks || row.cliques || 0,
        ctr: row.ctr || 0,
        conversoes: row.conversions || row.conversoes || 0,
        cpa: row.cpa || 0,
        custo: row.cost || row.custo || 0,
        badge: row.badge || row.classification || null,
      }))
    : mockSearchTerms;

  const wastedTotal = searchTerms.filter(t => t.badge === "Desperdiçando" || t.badge === "Irrelevante").reduce((s, t) => s + t.custo, 0);
  const totalCost = searchTerms.reduce((s, t) => s + t.custo, 0);
  const budgetPct = totalCost > 0 ? ((wastedTotal / totalCost) * 100).toFixed(0) : "0";

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <PageHeader title="Search Terms" subtitle="Análise de termos de busca do Google Ads" />
        <div className="h-16 bg-muted animate-pulse rounded-xl" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="Search Terms" subtitle="Análise de termos de busca do Google Ads" />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
        <p className="text-sm"><span className="font-semibold text-destructive">{formatBRL(wastedTotal)}</span> gastos em termos irrelevantes este mês (<span className="font-medium">{budgetPct}%</span> do budget)</p>
      </motion.div>
      <DataTable data={searchTerms} columns={columns} searchPlaceholder="Buscar termo..." pageSize={15} />
    </div>
  );
};

export default SearchTermsPage;
