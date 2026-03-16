import { motion } from "framer-motion";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Pause, Edit, ArrowLeft, Search as SearchIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/KPICard";
import { HealthGauge } from "@/components/HealthGauge";
import { InsightCard } from "@/components/InsightCard";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { Link } from "react-router-dom";
import { useCampaignById } from "@/hooks/use-supabase-data";

// Fallback mock data
const mockTrendData = [
  { day: "01/03", gasto: 320, conversoes: 12, vendas: 8, roas: 3.2 },
  { day: "02/03", gasto: 280, conversoes: 10, vendas: 7, roas: 3.0 },
  { day: "03/03", gasto: 350, conversoes: 15, vendas: 11, roas: 3.5 },
  { day: "04/03", gasto: 310, conversoes: 13, vendas: 9, roas: 3.1 },
  { day: "05/03", gasto: 400, conversoes: 18, vendas: 14, roas: 4.0 },
  { day: "06/03", gasto: 370, conversoes: 16, vendas: 12, roas: 3.8 },
  { day: "07/03", gasto: 290, conversoes: 11, vendas: 8, roas: 2.9 },
  { day: "08/03", gasto: 340, conversoes: 14, vendas: 10, roas: 3.3 },
  { day: "09/03", gasto: 380, conversoes: 17, vendas: 13, roas: 3.7 },
  { day: "10/03", gasto: 420, conversoes: 19, vendas: 15, roas: 4.1 },
  { day: "11/03", gasto: 360, conversoes: 15, vendas: 11, roas: 3.4 },
  { day: "12/03", gasto: 330, conversoes: 13, vendas: 10, roas: 3.2 },
  { day: "13/03", gasto: 310, conversoes: 12, vendas: 9, roas: 3.0 },
  { day: "14/03", gasto: 390, conversoes: 17, vendas: 13, roas: 3.9 },
  { day: "15/03", gasto: 410, conversoes: 18, vendas: 14, roas: 4.0 },
];

const mockAdGroups = [
  { name: "Brand - Exato", status: "Ativo", keywords: 24, clicks: 1240, cpc: "R$ 0,85", conversions: 87, cpa: "R$ 12,10", spend: "R$ 1.054,00" },
  { name: "Produto - Ampla", status: "Ativo", keywords: 38, clicks: 890, cpc: "R$ 1,20", conversions: 45, cpa: "R$ 23,73", spend: "R$ 1.068,00" },
  { name: "Concorrentes", status: "Pausado", keywords: 15, clicks: 320, cpc: "R$ 2,10", conversions: 12, cpa: "R$ 56,00", spend: "R$ 672,00" },
  { name: "Remarketing - RLSA", status: "Ativo", keywords: 12, clicks: 560, cpc: "R$ 0,65", conversions: 62, cpa: "R$ 5,87", spend: "R$ 364,00" },
  { name: "Long Tail - Informacional", status: "Ativo", keywords: 52, clicks: 430, cpc: "R$ 0,45", conversions: 18, cpa: "R$ 10,75", spend: "R$ 193,50" },
];

const mockAds = [
  { headline: "Software de Gestão #1 do Brasil", description: "Experimente grátis por 14 dias. Sem cartão de crédito. Automatize processos e aumente suas vendas.", ctr: "8,2%", conversions: 45 },
  { headline: "Gestão Empresarial Completa", description: "CRM + ERP + Financeiro em uma única plataforma. Mais de 10.000 empresas confiam em nós.", ctr: "6,7%", conversions: 32 },
  { headline: "Reduza Custos em 40%", description: "Automatize tarefas manuais e foque no que importa. Demonstração personalizada disponível.", ctr: "5,9%", conversions: 28 },
  { headline: "Melhor Custo-Benefício", description: "Planos a partir de R$ 99/mês. Suporte 24h incluso. Migração gratuita de outros sistemas.", ctr: "7,1%", conversions: 38 },
];

const mockKeywords = [
  { text: "software gestão empresarial", matchType: "Exata", qs: 9, bid: "R$ 2,50", clicks: 340, cpc: "R$ 1,80", conversions: 42 },
  { text: "sistema erp online", matchType: "Frase", qs: 8, bid: "R$ 3,00", clicks: 280, cpc: "R$ 2,10", conversions: 28 },
  { text: "crm para pequenas empresas", matchType: "Exata", qs: 7, bid: "R$ 1,80", clicks: 195, cpc: "R$ 1,45", conversions: 22 },
  { text: "gestão financeira empresa", matchType: "Ampla Mod.", qs: 6, bid: "R$ 2,20", clicks: 150, cpc: "R$ 1,90", conversions: 12 },
  { text: "automação comercial", matchType: "Frase", qs: 8, bid: "R$ 2,80", clicks: 210, cpc: "R$ 2,30", conversions: 18 },
  { text: "software nota fiscal", matchType: "Exata", qs: 9, bid: "R$ 1,50", clicks: 320, cpc: "R$ 1,10", conversions: 35 },
  { text: "sistema controle estoque", matchType: "Frase", qs: 5, bid: "R$ 2,00", clicks: 130, cpc: "R$ 1,75", conversions: 8 },
  { text: "erp barato", matchType: "Ampla Mod.", qs: 4, bid: "R$ 1,20", clicks: 95, cpc: "R$ 1,00", conversions: 5 },
  { text: "gestão empresarial grátis", matchType: "Frase", qs: 3, bid: "R$ 0,80", clicks: 180, cpc: "R$ 0,65", conversions: 3 },
  { text: "melhor software gestão 2026", matchType: "Exata", qs: 7, bid: "R$ 3,50", clicks: 110, cpc: "R$ 2,90", conversions: 15 },
];

const campaignInsights = [
  { severity: "critical" as const, title: "O grupo 'Concorrentes' tem CPA de R$ 56,00 — 3,5x acima da média da campanha. Considere pausar ou reformular.", action: "Pausar grupo de anúncios \u2192" },
  { severity: "warning" as const, title: "A keyword 'gestão empresarial grátis' atrai tráfego de baixa intenção — apenas 1,7% de taxa de conversão.", action: "Adicionar como negativa \u2192" },
  { severity: "info" as const, title: "O grupo 'Remarketing - RLSA' tem CPA de R$ 5,87 — 63% abaixo da média. Excelente candidato para escalar.", action: "Aumentar budget \u2192" },
];

const mockPendingOptimizations = [
  { action: "Pausar keyword 'erp barato' (QS 4, CPA alto)", impact: "Economia estimada: R$ 95/mês", date: "" },
  { action: "Aumentar lance em 20% para 'software gestão empresarial'", impact: "+12 conversões estimadas/mês", date: "" },
];

const mockExecutedOptimizations = [
  { action: "Pausado grupo 'Concorrentes'", before: "CPA R$ 56,00", after: "CPA geral caiu para R$ 14,20", date: "10/03/2026" },
  { action: "Adicionadas 8 keywords negativas", before: "CTR 4,2%", after: "CTR subiu para 5,8%", date: "07/03/2026" },
];

function qsColor(qs: number) {
  if (qs >= 7) return "text-success";
  if (qs >= 5) return "text-warning";
  return "text-destructive";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-mono tabular-nums" style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? `R$ ${p.value.toLocaleString("pt-BR")}` : p.value}
        </p>
      ))}
    </div>
  );
};

const CampaignDetailPage = () => {
  const { id } = useParams();
  const { data: campaign, isLoading } = useCampaignById(id);

  // Derive data from real campaign or fall back to mocks
  const campaignName = campaign?.name || "Google - Brand Search";
  const campaignPlatform = campaign?.platform || "Google Ads";
  const campaignStatus = campaign?.status || "active";
  const statusLabel = campaignStatus === "active" ? "Ativo" : "Pausado";

  // Real ad groups from Supabase join, or fallback
  const realAdGroups = campaign?.ad_groups || [];
  const adGroups = realAdGroups.length > 0
    ? realAdGroups.map((ag: any) => ({
        name: ag.name,
        status: ag.status === "active" || ag.status === "enabled" ? "Ativo" : "Pausado",
        keywords: 0,
        clicks: ag.clicks || 0,
        cpc: ag.clicks > 0 ? `R$ ${((ag.cost || 0) / ag.clicks).toFixed(2).replace(".", ",")}` : "R$ 0,00",
        conversions: ag.conversions || 0,
        cpa: ag.conversions > 0 ? `R$ ${((ag.cost || 0) / ag.conversions).toFixed(2).replace(".", ",")}` : "—",
        spend: `R$ ${(ag.cost || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      }))
    : mockAdGroups;

  const trendData = mockTrendData;
  const ads = mockAds;
  const keywords = mockKeywords;
  const pendingOptimizations = mockPendingOptimizations;
  const executedOptimizations = mockExecutedOptimizations;

  // Compute KPIs from real data if available
  const totalSpend = campaign?.cost || 10520;
  const totalConversions = campaign?.google_conversions || 188;
  const totalSales = campaign?.real_sales_count || 143;
  const roas = campaign?.real_roas || 3.54;

  const kpis = [
    { title: "Gasto", value: `R$ ${Number(totalSpend).toLocaleString("pt-BR")}`, change: 8.5, spark: [280, 310, 350, 340, 380, 370, 400] },
    { title: "Conversões Google", value: String(totalConversions), change: 15.2, spark: [10, 12, 14, 13, 16, 17, 19] },
    { title: "Vendas Reais", value: String(totalSales), change: 12.8, spark: [7, 8, 11, 9, 12, 13, 15] },
    { title: "ROAS Real", value: `${Number(roas).toFixed(2).replace(".", ",")}x`, change: 6.3, spark: [2.9, 3.0, 3.2, 3.1, 3.5, 3.6, 3.54] },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <div className="h-16 bg-muted animate-pulse rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Link to="/campaigns" className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{campaignName}</h1>
              <Badge variant="outline" className="text-xs">{campaignPlatform}</Badge>
              <Badge className={statusLabel === "Ativo" ? "bg-success/20 text-success border-success/30 text-xs" : "bg-secondary text-muted-foreground text-xs"}>
                {statusLabel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">ID: {id || "camp-001"} · Criada em {campaign?.created_at ? new Date(campaign.created_at).toLocaleDateString("pt-BR") : "15/01/2026"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <HealthGauge score={campaign?.health_score || 88} size={80} />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Pause className="h-3.5 w-3.5" /> Pausar
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="h-3.5 w-3.5" /> Editar Budget
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="adgroups">Ad Groups</TabsTrigger>
          <TabsTrigger value="anuncios">Anúncios</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="searchterms">Search Terms</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="otimizacoes">Otimizações</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <KPICard key={kpi.title} {...kpi} sparkData={kpi.spark} delay={i * 0.05} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-card rounded-xl surface-glow p-5"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
              Tendência 30 Dias — Gasto Diário (R$)
            </p>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,12%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <defs>
                    <linearGradient id="gastoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(221,83%,53%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(221,83%,53%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="gasto" stroke="hsl(221,83%,53%)" strokeWidth={2} fill="url(#gastoGrad)" dot={false} name="Gasto" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </TabsContent>

        {/* Ad Groups Tab */}
        <TabsContent value="adgroups">
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
                    {["Ad Group", "Status", "Keywords", "Clicks", "CPC", "Conv.", "CPA", "Gasto"].map((h) => (
                      <th key={h} className="text-left px-3 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider first:pl-5 last:pr-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {adGroups.map((ag: any, i: number) => (
                    <motion.tr
                      key={ag.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border hover:bg-secondary/30 transition-colors cursor-pointer"
                    >
                      <td className="px-3 py-3 pl-5 font-medium">{ag.name}</td>
                      <td className="px-3 py-3">
                        <Badge variant={ag.status === "Ativo" ? "default" : "secondary"} className={ag.status === "Ativo" ? "bg-success/20 text-success border-success/30" : ""}>
                          {ag.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 font-mono tabular-nums text-muted-foreground">{ag.keywords}</td>
                      <td className="px-3 py-3 font-mono tabular-nums">{typeof ag.clicks === "number" ? ag.clicks.toLocaleString("pt-BR") : ag.clicks}</td>
                      <td className="px-3 py-3 font-mono tabular-nums text-muted-foreground">{ag.cpc}</td>
                      <td className="px-3 py-3 font-mono tabular-nums">{ag.conversions}</td>
                      <td className="px-3 py-3 font-mono tabular-nums">{ag.cpa}</td>
                      <td className="px-3 py-3 pr-5 font-mono tabular-nums">{ag.spend}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>

        {/* Anúncios Tab */}
        <TabsContent value="anuncios">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ads.map((ad, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-card rounded-xl surface-glow p-5 space-y-3"
              >
                <h3 className="text-sm font-semibold text-primary">{ad.headline}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{ad.description}</p>
                <div className="flex items-center gap-4 pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">CTR: <span className="font-mono tabular-nums text-foreground">{ad.ctr}</span></span>
                  <span className="text-xs text-muted-foreground">Conversões: <span className="font-mono tabular-nums text-foreground">{ad.conversions}</span></span>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Keywords Tab */}
        <TabsContent value="keywords">
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
                    {["Keyword", "Tipo", "QS", "Lance", "Clicks", "CPC", "Conv."].map((h) => (
                      <th key={h} className="text-left px-3 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider first:pl-5 last:pr-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((kw, i) => (
                    <motion.tr
                      key={kw.text}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-3 py-3 pl-5 font-medium">{kw.text}</td>
                      <td className="px-3 py-3">
                        <Badge variant="outline" className="text-[10px]">{kw.matchType}</Badge>
                      </td>
                      <td className={`px-3 py-3 font-mono tabular-nums font-semibold ${qsColor(kw.qs)}`}>{kw.qs}</td>
                      <td className="px-3 py-3 font-mono tabular-nums text-muted-foreground">{kw.bid}</td>
                      <td className="px-3 py-3 font-mono tabular-nums">{kw.clicks}</td>
                      <td className="px-3 py-3 font-mono tabular-nums text-muted-foreground">{kw.cpc}</td>
                      <td className="px-3 py-3 pr-5 font-mono tabular-nums">{kw.conversions}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>

        {/* Search Terms Tab */}
        <TabsContent value="searchterms">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card rounded-xl surface-glow p-8 flex flex-col items-center justify-center gap-4"
          >
            <SearchIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Análise detalhada dos termos de busca desta campanha.</p>
            <Link to="/analytics/search-terms" className="text-sm font-medium text-primary hover:underline">
              Ver Search Terms desta campanha {"\u2192"}
            </Link>
          </motion.div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Insights desta Campanha</p>
            {campaignInsights.map((insight, i) => (
              <InsightCard key={i} {...insight} delay={i * 0.05} />
            ))}
          </div>
        </TabsContent>

        {/* Otimizações Tab */}
        <TabsContent value="otimizacoes" className="space-y-6">
          {/* Pendentes */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Otimizações Pendentes</p>
            {pendingOptimizations.map((opt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-card rounded-xl surface-glow p-4"
              >
                <p className="text-sm font-medium">{opt.action}</p>
                <p className="text-xs text-success mt-1">{opt.impact}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="bg-success hover:bg-success/90 text-xs">Aprovar e Executar</Button>
                  <Button variant="secondary" size="sm" className="text-xs">Dispensar</Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Executadas */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Otimizações Executadas</p>
            {executedOptimizations.map((opt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-card rounded-xl surface-glow p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{opt.action}</p>
                  <span className="text-[10px] text-muted-foreground">{opt.date}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="text-muted-foreground">{opt.before}</span>
                  <span className="text-muted-foreground">{"\u2192"}</span>
                  <span className="text-success">{opt.after}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignDetailPage;
