import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { KPICard } from "@/components/KPICard";
import { ColumnDef } from "@tanstack/react-table";
import { formatBRL } from "@/components/shared/CurrencyDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ArrowUp, ArrowDown, Plus } from "lucide-react";
import { useSEOKeywords } from "@/hooks/use-supabase-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const rankColumns: ColumnDef<any, any>[] = [
  { accessorKey: "keyword", header: "Keyword", cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span> },
  { accessorKey: "posAtual", header: "Posição", cell: ({ row }) => {
    const atual = row.original.posAtual;
    const anterior = row.original.posAnterior;
    const delta = anterior - atual;
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono tabular-nums font-bold text-lg">{atual}</span>
        {delta !== 0 && (
          <span className={`flex items-center gap-0.5 text-xs ${delta > 0 ? "text-success" : "text-destructive"}`}>
            {delta > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(delta)}
          </span>
        )}
      </div>
    );
  }},
  { accessorKey: "volume", header: "Volume", cell: ({ getValue }) => <span className="font-mono tabular-nums text-muted-foreground">{(getValue() as number).toLocaleString("pt-BR")}</span> },
  { accessorKey: "difficulty", header: "Dificuldade", cell: ({ getValue }) => {
    const v = getValue() as number;
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full ${v >= 80 ? "bg-destructive" : v >= 60 ? "bg-warning" : "bg-success"}`} style={{ width: `${v}%` }} /></div>
        <span className="text-xs font-mono tabular-nums text-muted-foreground">{v}</span>
      </div>
    );
  }},
  { accessorKey: "url", header: "URL", cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{getValue() as string}</span> },
];

const seoVsPaidColumns: ColumnDef<any, any>[] = [
  { accessorKey: "keyword", header: "Keyword" },
  { accessorKey: "posAtual", header: "Posição Orgânica", cell: ({ getValue }) => <span className="font-mono tabular-nums font-bold">{getValue() as number}</span> },
  { accessorKey: "cliquesOrg", header: "Cliques Orgânicos", cell: ({ getValue }) => <span className="font-mono tabular-nums">{(getValue() as number).toLocaleString("pt-BR")}</span> },
  { accessorKey: "cliquesPago", header: "Cliques Pagos", cell: ({ getValue }) => <span className="font-mono tabular-nums">{(getValue() as number).toLocaleString("pt-BR")}</span> },
  { accessorKey: "custoPago", header: "Custo Pago", cell: ({ getValue }) => {
    const v = getValue() as number;
    return <span className="font-mono tabular-nums">{v > 0 ? formatBRL(v) : "—"}</span>;
  }},
];

const SEOPage = () => {
  const { currentOrg } = useAuth();
  const { data: seoData, isLoading } = useSEOKeywords();
  const [seoOpen, setSeoOpen] = useState(false);
  const [seoKeyword, setSeoKeyword] = useState("");
  const [seoPosition, setSeoPosition] = useState("");
  const [seoVolume, setSeoVolume] = useState("");
  const [seoUrl, setSeoUrl] = useState("");

  async function handleCreateKeyword() {
    if (!seoKeyword) { toast.error("Preencha a keyword"); return; }
    const { error } = await supabase.from('seo_keywords').insert({
      organization_id: currentOrg?.id,
      keyword: seoKeyword,
      current_position: seoPosition ? parseInt(seoPosition) : null,
      search_volume: seoVolume ? parseInt(seoVolume) : null,
      url: seoUrl || null,
    } as any);
    if (error) { toast.error("Erro ao adicionar keyword"); return; }
    toast.success("Keyword adicionada com sucesso!");
    setSeoOpen(false);
    setSeoKeyword(""); setSeoPosition(""); setSeoVolume(""); setSeoUrl("");
    window.location.reload();
  }

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

  const rawKeywords = (seoData ?? []) as any[];

  if (rawKeywords.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <PageHeader title="SEO Monitor" subtitle="Rankings org\u00e2nicos, sess\u00f5es e compara\u00e7\u00e3o SEO vs Paid" actions={
          <Dialog open={seoOpen} onOpenChange={setSeoOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2"><Plus className="h-4 w-4" /> Adicionar Keyword</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Adicionar Keyword</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Keyword</Label><Input value={seoKeyword} onChange={e => setSeoKeyword(e.target.value)} placeholder="Ex: suplemento col\u00e1geno" /></div>
                <div><Label>Posi\u00e7\u00e3o Atual</Label><Input type="number" value={seoPosition} onChange={e => setSeoPosition(e.target.value)} placeholder="Ex: 5" /></div>
                <div><Label>Volume de Busca</Label><Input type="number" value={seoVolume} onChange={e => setSeoVolume(e.target.value)} placeholder="Ex: 12000" /></div>
                <div><Label>URL</Label><Input value={seoUrl} onChange={e => setSeoUrl(e.target.value)} placeholder="Ex: /blog/colageno" /></div>
                <Button className="w-full" onClick={handleCreateKeyword}>Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        } />
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Nenhum dado encontrado.
        </div>
      </div>
    );
  }

  const rankings = rawKeywords.map((r: any) => ({
    keyword: r.keyword ?? "—",
    posAtual: r.current_position ?? r.posAtual ?? 0,
    posAnterior: r.previous_position ?? r.posAnterior ?? 0,
    volume: r.search_volume ?? r.volume ?? 0,
    difficulty: r.difficulty ?? 0,
    url: r.url ?? "—",
    cliquesOrg: r.organic_clicks ?? r.cliquesOrg ?? 0,
    cliquesPago: r.paid_clicks ?? r.cliquesPago ?? 0,
    custoPago: r.paid_cost ?? r.custoPago ?? 0,
  }));

  const totalSessoes = rankings.reduce((s: number, r: any) => s + r.cliquesOrg, 0);
  const totalConversoes = Math.round(totalSessoes * 0.012);
  const receitaOrg = totalConversoes * 200;

  const overviewData = Array.from({ length: 30 }, (_, i) => ({
    dia: `${i + 1}/01`,
    sessoes: Math.round(totalSessoes / 30 + (Math.random() - 0.5) * (totalSessoes / 60)),
    conversoes: Math.round(totalConversoes / 30 + (Math.random() - 0.5) * (totalConversoes / 60)),
  }));

  const savings = rankings.filter((r: any) => r.posAtual <= 5 && r.custoPago > 0);
  const totalSavings = savings.reduce((sum: number, r: any) => sum + Math.round(r.custoPago * 0.75), 0);

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="SEO Monitor" subtitle="Rankings org\u00e2nicos, sess\u00f5es e compara\u00e7\u00e3o SEO vs Paid" actions={
        <Dialog open={seoOpen} onOpenChange={setSeoOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2"><Plus className="h-4 w-4" /> Adicionar Keyword</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar Keyword</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Keyword</Label><Input value={seoKeyword} onChange={e => setSeoKeyword(e.target.value)} placeholder="Ex: suplemento col\u00e1geno" /></div>
              <div><Label>Posi\u00e7\u00e3o Atual</Label><Input type="number" value={seoPosition} onChange={e => setSeoPosition(e.target.value)} placeholder="Ex: 5" /></div>
              <div><Label>Volume de Busca</Label><Input type="number" value={seoVolume} onChange={e => setSeoVolume(e.target.value)} placeholder="Ex: 12000" /></div>
              <div><Label>URL</Label><Input value={seoUrl} onChange={e => setSeoUrl(e.target.value)} placeholder="Ex: /blog/colageno" /></div>
              <Button className="w-full" onClick={handleCreateKeyword}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Sessões Orgânicas" value={totalSessoes.toLocaleString("pt-BR")} change={0} sparkData={overviewData.slice(-7).map(d => d.sessoes)} />
        <KPICard title="Conversões Orgânicas" value={totalConversoes.toLocaleString("pt-BR")} change={0} sparkData={overviewData.slice(-7).map(d => d.conversoes)} />
        <KPICard title="Receita Orgânica" value={formatBRL(receitaOrg)} change={0} sparkData={[receitaOrg * 0.7, receitaOrg * 0.8, receitaOrg * 0.85, receitaOrg * 0.9, receitaOrg * 0.95, receitaOrg * 0.98, receitaOrg]} />
      </div>

      <Tabs defaultValue="rankings">
        <TabsList>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="seo-vs-paid">SEO vs Paid</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings" className="space-y-4 mt-4">
          <DataTable data={rankings} columns={rankColumns} searchPlaceholder="Buscar keyword..." />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Sessões Orgânicas (30 dias)</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={overviewData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="dia" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="sessoes" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="conversoes" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </TabsContent>

        <TabsContent value="seo-vs-paid" className="space-y-4 mt-4">
          {totalSavings > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-success/10 border border-success/20 rounded-xl p-4">
              <p className="text-sm">Economia potencial total: <span className="font-semibold text-success">{formatBRL(totalSavings)}</span>/mês — você gasta em ads para keywords onde já é top 5 orgânico.</p>
            </motion.div>
          )}

          {savings.slice(0, 3).map((s: any) => (
            <motion.div key={s.keyword} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/10 border border-primary/20 rounded-xl p-4">
              <p className="text-sm">Você gasta <span className="font-semibold text-destructive">{formatBRL(s.custoPago)}</span>/mês na keyword "<span className="font-medium">{s.keyword}</span>" mas já é #{s.posAtual} orgânico — reduza bid e economize <span className="font-semibold text-success">{formatBRL(Math.round(s.custoPago * 0.75))}</span>/mês.</p>
            </motion.div>
          ))}

          <DataTable data={rankings} columns={seoVsPaidColumns} searchPlaceholder="Buscar keyword..." />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEOPage;
