import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatBRL } from "@/components/shared/CurrencyDisplay";
import { ProgressBarCustom } from "@/components/shared/ProgressBarCustom";
import { KPICard } from "@/components/KPICard";
import {
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useFinancialRecords, useBudgets } from "@/hooks/use-supabase-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-mono tabular-nums" style={{ color: p.color }}>{p.name}: {formatBRL(p.value)}</p>
      ))}
    </div>
  );
};

const accountCols: ColumnDef<any, any>[] = [
  { accessorKey: "conta", header: "Conta" },
  { accessorKey: "plataforma", header: "Plataforma" },
  { accessorKey: "gasto", header: "Gasto", cell: ({ getValue }) => <span className="font-mono tabular-nums">{formatBRL(getValue() as number)}</span> },
  { accessorKey: "impressoes", header: "Impressões", cell: ({ getValue }) => <span className="font-mono tabular-nums text-muted-foreground">{(getValue() as number).toLocaleString("pt-BR")}</span> },
  { accessorKey: "cliques", header: "Cliques", cell: ({ getValue }) => <span className="font-mono tabular-nums text-muted-foreground">{(getValue() as number).toLocaleString("pt-BR")}</span> },
  { accessorKey: "conversoes", header: "Conv.", cell: ({ getValue }) => <span className="font-mono tabular-nums">{(getValue() as number).toLocaleString("pt-BR")}</span> },
  { accessorKey: "cpa", header: "CPA", cell: ({ getValue }) => <span className="font-mono tabular-nums">{formatBRL(getValue() as number)}</span> },
  { accessorKey: "receita", header: "Receita", cell: ({ getValue }) => <span className="font-mono tabular-nums text-success">{formatBRL(getValue() as number)}</span> },
  { accessorKey: "roas", header: "ROAS", cell: ({ getValue }) => <span className="font-mono tabular-nums text-success">{(getValue() as number).toFixed(2)}x</span> },
];

const campFinCols: ColumnDef<any, any>[] = [
  { accessorKey: "campanha", header: "Campanha" },
  { accessorKey: "plataforma", header: "Plataforma" },
  { accessorKey: "gasto", header: "Gasto", cell: ({ getValue }) => <span className="font-mono tabular-nums">{formatBRL(getValue() as number)}</span> },
  { accessorKey: "receita", header: "Receita", cell: ({ getValue }) => <span className="font-mono tabular-nums text-success">{formatBRL(getValue() as number)}</span> },
  { accessorKey: "lucro", header: "Lucro", cell: ({ getValue }) => <span className="font-mono tabular-nums text-success">{formatBRL(getValue() as number)}</span> },
  { accessorKey: "margem", header: "Margem", cell: ({ getValue }) => <span className="font-mono tabular-nums">{(getValue() as number).toFixed(1)}%</span> },
  { accessorKey: "roas", header: "ROAS", cell: ({ getValue }) => <span className="font-mono tabular-nums text-success">{(getValue() as number).toFixed(2)}x</span> },
];

const FinancialPage = () => {
  const { currentOrg } = useAuth();
  const { data: financialData, isLoading: financialLoading } = useFinancialRecords();
  const { data: budgetsData, isLoading: budgetsLoading } = useBudgets();
  const [budgetIncrease, setBudgetIncrease] = useState(20);
  const [costOpen, setCostOpen] = useState(false);
  const [costCategoria, setCostCategoria] = useState("");
  const [costDescricao, setCostDescricao] = useState("");
  const [costValor, setCostValor] = useState("");
  const [costData, setCostData] = useState("");

  async function handleCreateCost() {
    if (!costCategoria || !costValor) { toast.error("Preencha categoria e valor"); return; }
    const { error } = await supabase.from('financial_records').insert({
      organization_id: currentOrg?.id,
      type: 'operational_cost',
      category: costCategoria,
      description: costDescricao,
      amount: parseFloat(costValor),
      date: costData || new Date().toISOString().split('T')[0],
    } as any);
    if (error) { toast.error("Erro ao registrar custo"); return; }
    toast.success("Custo registrado com sucesso!");
    setCostOpen(false);
    setCostCategoria(""); setCostDescricao(""); setCostValor(""); setCostData("");
    window.location.reload();
  }

  const isLoading = financialLoading || budgetsLoading;

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

  const records = (financialData ?? []) as any[];
  const budgets = (budgetsData ?? []) as any[];

  if (records.length === 0 && budgets.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <PageHeader title="Financeiro" subtitle="Controle de gastos, receita, margens e orçamentos" />
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Nenhum dado encontrado.
        </div>
      </div>
    );
  }

  // Derive overview data from records
  const totalGasto = records.reduce((s: number, r: any) => s + (r.spend ?? r.gasto ?? 0), 0);
  const totalReceita = records.reduce((s: number, r: any) => s + (r.revenue ?? r.receita ?? 0), 0);
  const totalLucro = totalReceita - totalGasto;
  const margem = totalReceita > 0 ? ((totalLucro / totalReceita) * 100) : 0;

  const overviewData = records.slice(0, 30).map((r: any, i: number) => ({
    day: r.date ? new Date(r.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : `${i + 1}`,
    gasto: r.spend ?? r.gasto ?? 0,
    receita: r.revenue ?? r.receita ?? 0,
    lucro: (r.revenue ?? r.receita ?? 0) - (r.spend ?? r.gasto ?? 0),
  }));

  // Platform breakdown from records
  const platformMap: Record<string, number> = {};
  records.forEach((r: any) => {
    const p = r.platform ?? r.plataforma ?? "Outro";
    platformMap[p] = (platformMap[p] ?? 0) + (r.spend ?? r.gasto ?? 0);
  });
  const platformColors = ["hsl(221,83%,53%)", "hsl(280,65%,60%)", "hsl(340,80%,60%)", "hsl(142,71%,45%)", "hsl(45,93%,47%)"];
  const totalPlatformSpend = Object.values(platformMap).reduce((a, b) => a + b, 0);
  const platformBreakdown = Object.entries(platformMap).map(([name, value], i) => ({
    name,
    value: totalPlatformSpend > 0 ? Math.round((value / totalPlatformSpend) * 100) : 0,
    color: platformColors[i % platformColors.length],
  }));

  // Account data
  const accountData = records.filter((r: any) => r.account ?? r.conta).map((r: any) => ({
    conta: r.account ?? r.conta ?? "—",
    plataforma: r.platform ?? r.plataforma ?? "—",
    gasto: r.spend ?? r.gasto ?? 0,
    impressoes: r.impressions ?? r.impressoes ?? 0,
    cliques: r.clicks ?? r.cliques ?? 0,
    conversoes: r.conversions ?? r.conversoes ?? 0,
    cpa: r.cpa ?? ((r.spend ?? 0) / Math.max(r.conversions ?? r.conversoes ?? 1, 1)),
    receita: r.revenue ?? r.receita ?? 0,
    roas: r.roas ?? ((r.revenue ?? 0) / Math.max(r.spend ?? r.gasto ?? 1, 1)),
  }));

  // Campaign financial data
  const campaignFinData = records.filter((r: any) => r.campaign ?? r.campanha).map((r: any) => {
    const gasto = r.spend ?? r.gasto ?? 0;
    const receita = r.revenue ?? r.receita ?? 0;
    const lucro = receita - gasto;
    return {
      campanha: r.campaign ?? r.campanha ?? "—",
      plataforma: r.platform ?? r.plataforma ?? "—",
      gasto,
      receita,
      lucro,
      margem: receita > 0 ? (lucro / receita) * 100 : 0,
      roas: gasto > 0 ? receita / gasto : 0,
    };
  });

  // Custos from records with type "cost"
  const custos = records.filter((r: any) => r.type === "cost" || r.categoria).map((r: any) => ({
    categoria: r.category ?? r.categoria ?? "Outro",
    descricao: r.description ?? r.descricao ?? "—",
    valor: r.amount ?? r.valor ?? 0,
  }));
  const totalCustos = custos.reduce((s: number, c: any) => s + c.valor, 0);

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="Financeiro" subtitle="Controle de gastos, receita, margens e orçamentos" />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contas">Por Conta</TabsTrigger>
          <TabsTrigger value="campanhas">Por Campanha</TabsTrigger>
          <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
          <TabsTrigger value="custos">Custos</TabsTrigger>
          <TabsTrigger value="projecao">Projeção</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Gasto Total" value={formatBRL(totalGasto)} change={0} sparkData={overviewData.slice(-7).map((d: any) => d.gasto)} />
            <KPICard title="Receita" value={formatBRL(totalReceita)} change={0} sparkData={overviewData.slice(-7).map((d: any) => d.receita)} delay={0.05} />
            <KPICard title="Lucro Bruto" value={formatBRL(totalLucro)} change={0} sparkData={overviewData.slice(-7).map((d: any) => d.lucro)} delay={0.1} />
            <KPICard title="Margem" value={`${margem.toFixed(1)}%`} change={0} sparkData={[margem]} delay={0.15} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-card rounded-xl surface-glow p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Gasto vs Receita vs Lucro</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overviewData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,12%)" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="receita" name="Receita" stroke="hsl(142,71%,45%)" fill="hsl(142,71%,45%)" fillOpacity={0.1} strokeWidth={2} />
                    <Area type="monotone" dataKey="lucro" name="Lucro" stroke="hsl(221,83%,53%)" fill="hsl(221,83%,53%)" fillOpacity={0.1} strokeWidth={2} />
                    <Area type="monotone" dataKey="gasto" name="Gasto" stroke="hsl(0,84%,60%)" fill="hsl(0,84%,60%)" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl surface-glow p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Gasto por Plataforma</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={platformBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {platformBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(222,47%,7%)", border: "1px solid hsl(217,33%,12%)", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {platformBreakdown.map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: p.color }} />{p.name}</span>
                    <span className="font-mono tabular-nums">{p.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="contas" className="mt-4">
          {accountData.length > 0 ? (
            <DataTable data={accountData} columns={accountCols} searchPlaceholder="Buscar conta..." />
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Nenhuma conta encontrada.</div>
          )}
        </TabsContent>

        <TabsContent value="campanhas" className="mt-4">
          {campaignFinData.length > 0 ? (
            <DataTable data={campaignFinData} columns={campFinCols} searchPlaceholder="Buscar campanha..." />
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Nenhuma campanha encontrada.</div>
          )}
        </TabsContent>

        <TabsContent value="orcamentos" className="mt-4">
          {budgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgets.map((b: any, i: number) => {
                const nome = b.name ?? b.nome ?? "—";
                const total = b.total_amount ?? b.total ?? 0;
                const gasto = b.spent_amount ?? b.gasto ?? 0;
                const esgota = b.days_remaining ?? b.esgota ?? "—";
                return (
                  <motion.div key={b.id ?? nome} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl surface-glow p-5">
                    <p className="text-sm font-medium mb-1">{nome}</p>
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="font-mono tabular-nums text-lg font-semibold">{formatBRL(gasto)}</span>
                      <span className="text-xs text-muted-foreground">de {formatBRL(total)}</span>
                    </div>
                    <ProgressBarCustom value={gasto} max={total} showLabel={false} />
                    <p className="text-xs text-muted-foreground mt-2">Esgota em <span className={`font-medium ${parseInt(String(esgota)) <= 5 ? "text-destructive" : parseInt(String(esgota)) <= 10 ? "text-warning" : "text-success"}`}>{typeof esgota === "number" ? `${esgota} dias` : esgota}</span></p>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Nenhum orçamento encontrado.</div>
          )}
        </TabsContent>

        <TabsContent value="custos" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={costOpen} onOpenChange={setCostOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2"><Plus className="h-4 w-4" /> Registrar Custo</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Registrar Custo</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Categoria</Label>
                    <Select value={costCategoria} onValueChange={setCostCategoria}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ferramenta">Ferramenta</SelectItem>
                        <SelectItem value="equipe">Equipe</SelectItem>
                        <SelectItem value="infra">Infraestrutura</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Descri\u00e7\u00e3o</Label>
                    <Input value={costDescricao} onChange={e => setCostDescricao(e.target.value)} placeholder="Ex: Assinatura SEMrush" />
                  </div>
                  <div>
                    <Label>Valor R$</Label>
                    <Input type="number" step="0.01" value={costValor} onChange={e => setCostValor(e.target.value)} placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Data</Label>
                    <Input type="date" value={costData} onChange={e => setCostData(e.target.value)} />
                  </div>
                  <Button className="w-full" onClick={handleCreateCost}>Salvar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {custos.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Categoria</th>
                    <th className="text-left px-3 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Descrição</th>
                    <th className="text-right px-5 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Valor Mensal</th>
                  </tr>
                </thead>
                <tbody>
                  {custos.map((c: any, i: number) => (
                    <tr key={i} className="border-b border-border">
                      <td className="px-5 py-3"><span className="text-xs bg-secondary px-2 py-0.5 rounded">{c.categoria}</span></td>
                      <td className="px-3 py-3">{c.descricao}</td>
                      <td className="px-5 py-3 text-right font-mono tabular-nums">{formatBRL(c.valor)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border">
                    <td className="px-5 py-3 font-semibold" colSpan={2}>Total Custos Operacionais</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums font-semibold">{formatBRL(totalCustos)}</td>
                  </tr>
                </tfoot>
              </table>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Nenhum custo encontrado.</div>
          )}
        </TabsContent>

        <TabsContent value="projecao" className="mt-4 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Simulador de Projeção</p>
            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm">Se aumentar budget em:</label>
              <input type="range" min={0} max={100} value={budgetIncrease} onChange={(e) => setBudgetIncrease(Number(e.target.value))} className="flex-1 max-w-xs" />
              <span className="font-mono tabular-nums font-semibold text-primary">{budgetIncrease}%</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Gasto Projetado</p>
                <p className="text-lg font-mono font-semibold mt-1">{formatBRL(totalGasto * (1 + budgetIncrease / 100))}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Receita Estimada</p>
                <p className="text-lg font-mono font-semibold text-success mt-1">{formatBRL(totalReceita * (1 + budgetIncrease / 100 * 0.75))}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">ROAS Esperado</p>
                <p className="text-lg font-mono font-semibold mt-1">{totalGasto > 0 ? (totalReceita * (1 + budgetIncrease / 100 * 0.75) / (totalGasto * (1 + budgetIncrease / 100))).toFixed(2) : "0.00"}x</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Conversões Est.</p>
                <p className="text-lg font-mono font-semibold mt-1">{Math.round(records.reduce((s: number, r: any) => s + (r.conversions ?? r.conversoes ?? 0), 0) * (1 + budgetIncrease / 100 * 0.7)).toLocaleString("pt-BR")}</p>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialPage;
