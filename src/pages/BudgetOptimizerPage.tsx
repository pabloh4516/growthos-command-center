import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatBRL } from "@/components/shared/CurrencyDisplay";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useCampaigns } from "@/hooks/use-supabase-data";
import { optimizeBudget } from "@/services/edge-functions";

// Fallback mock data
const mockCampanhas = [
  { nome: "Google - Brand Search", budgetAtual: 12000, budgetOtimizado: 15000, roas: 4.8, conversoes: 180, cpa: 66.67, convOtimizado: 225, cpaOtimizado: 66.67 },
  { nome: "Google - Competitor KWs", budgetAtual: 8000, budgetOtimizado: 5000, roas: 1.2, conversoes: 48, cpa: 166.67, convOtimizado: 30, cpaOtimizado: 166.67 },
  { nome: "Meta - Retargeting Q1", budgetAtual: 10000, budgetOtimizado: 13000, roas: 3.5, conversoes: 120, cpa: 83.33, convOtimizado: 156, cpaOtimizado: 83.33 },
  { nome: "Meta - LAL Purchasers", budgetAtual: 7000, budgetOtimizado: 9000, roas: 2.8, conversoes: 75, cpa: 93.33, convOtimizado: 96, cpaOtimizado: 93.75 },
  { nome: "TikTok - Gen Z Launch", budgetAtual: 5000, budgetOtimizado: 3000, roas: 0.9, conversoes: 22, cpa: 227.27, convOtimizado: 13, cpaOtimizado: 230.77 },
  { nome: "Google - Display Remarketing", budgetAtual: 3000, budgetOtimizado: 0, roas: 0.3, conversoes: 5, cpa: 600, convOtimizado: 0, cpaOtimizado: 0 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(210 80% 60%)", "hsl(280 60% 60%)"];

const curveData = [500, 1000, 2000, 4000, 6000, 8000, 10000, 12000, 15000, 20000].map(b => ({
  budget: b,
  cpaBrand: Math.max(20, 15 + (b / 3000)),
  cpaCompetitor: Math.max(80, 60 + (b / 500)),
  cpaRetargeting: Math.max(40, 30 + (b / 2000)),
}));

const BudgetOptimizerPage = () => {
  const { currentOrg } = useAuth();
  const orgId = currentOrg?.id;
  const { data: campaignsRaw, isLoading: isLoadingCampaigns } = useCampaigns();

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedData, setOptimizedData] = useState<any[] | null>(null);
  const [aiTip, setAiTip] = useState<string | null>(null);

  // Build campaign list from real data, or fallback to mocks
  const realCampaigns = (campaignsRaw || []).map((c: any) => ({
    nome: c.name,
    budgetAtual: c.daily_budget ? c.daily_budget * 30 : c.lifetime_budget || 0,
    budgetOtimizado: 0,
    roas: c.real_roas || c.google_roas || 0,
    conversoes: c.google_conversions || 0,
    cpa: c.google_conversions > 0 ? (c.total_cost || 0) / c.google_conversions : 0,
    convOtimizado: 0,
    cpaOtimizado: 0,
  }));

  const campanhas = optimizedData || (realCampaigns.length > 0 ? realCampaigns : mockCampanhas);

  const pieData = campanhas.map((c: any) => ({ name: c.nome, value: c.budgetAtual }));
  const pieDataOtimizado = campanhas.filter((c: any) => c.budgetOtimizado > 0).map((c: any) => ({ name: c.nome, value: c.budgetOtimizado }));

  const totalAtual = campanhas.reduce((s: number, c: any) => s + c.budgetAtual, 0);
  const totalConvAtual = campanhas.reduce((s: number, c: any) => s + c.conversoes, 0);
  const totalConvOtimizado = campanhas.reduce((s: number, c: any) => s + c.convOtimizado, 0);

  const [budgetTotal, setBudgetTotal] = useState(totalAtual);

  const handleOptimize = async () => {
    if (!orgId) return;
    setIsOptimizing(true);
    try {
      const result = await optimizeBudget(orgId, budgetTotal || undefined);
      if (result?.campaigns) {
        setOptimizedData(result.campaigns);
      }
      if (result?.tip) {
        setAiTip(result.tip);
      }
    } catch (err) {
      console.error("Error optimizing budget:", err);
      // Keep current data as fallback
    } finally {
      setIsOptimizing(false);
    }
  };

  if (isLoadingCampaigns) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <PageHeader title="Budget Optimizer" subtitle="Otimize a alocação de budget entre campanhas" />
        <div className="h-32 bg-muted animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
        </div>
        <div className="h-48 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="Budget Optimizer" subtitle="Otimize a alocação de budget entre campanhas" />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/10 border border-primary/20 rounded-xl p-4">
        <p className="text-sm">{aiTip || (<>Mova <span className="font-semibold">{formatBRL(3000)}/mês</span> da <span className="font-medium">Google - Competitor KWs</span> (ROAS 1.2x) para <span className="font-medium">Google - Brand Search</span> (ROAS 4.8x) — impacto: <span className="font-semibold text-success">+45 conversões/mês</span></>)}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Alocação Atual</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2}>
                {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-sm text-muted-foreground">Total: {formatBRL(totalAtual)} — {totalConvAtual} conversões</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-xl surface-glow p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Alocação Otimizada</p>
          {pieDataOtimizado.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieDataOtimizado} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2}>
                  {pieDataOtimizado.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
              Clique em "Otimizar" para ver a alocação sugerida pela IA
            </div>
          )}
          <p className="text-center text-sm text-muted-foreground">
            Total: {formatBRL(totalAtual)} — {totalConvOtimizado > 0 ? (
              <span className="text-success font-semibold">{totalConvOtimizado} conversões (+{totalConvOtimizado - totalConvAtual})</span>
            ) : (
              <span>{totalConvAtual} conversões</span>
            )}
          </p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl surface-glow p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Comparação: Atual vs Otimizado</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                <th className="text-left py-2 px-3">Campanha</th>
                <th className="text-right py-2 px-3">Budget Atual</th>
                <th className="text-right py-2 px-3">Budget Otimizado</th>
                <th className="text-right py-2 px-3">ROAS</th>
                <th className="text-right py-2 px-3">Conv. Atual</th>
                <th className="text-right py-2 px-3">Conv. Otimizado</th>
                <th className="text-right py-2 px-3">{"\u0394"}</th>
              </tr>
            </thead>
            <tbody>
              {campanhas.map((c: any, i: number) => {
                const delta = c.convOtimizado - c.conversoes;
                return (
                  <tr key={c.nome} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-medium">{c.nome}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">{formatBRL(c.budgetAtual)}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">{formatBRL(c.budgetOtimizado)}</td>
                    <td className={`py-2.5 px-3 text-right font-mono tabular-nums font-semibold ${c.roas >= 3 ? "text-success" : c.roas >= 2 ? "text-warning" : "text-destructive"}`}>{c.roas.toFixed(1)}x</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">{c.conversoes}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">{c.convOtimizado}</td>
                    <td className={`py-2.5 px-3 text-right font-mono tabular-nums font-semibold ${delta > 0 ? "text-success" : delta < 0 ? "text-destructive" : "text-muted-foreground"}`}>{delta > 0 ? `+${delta}` : delta}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-xl surface-glow p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Curva de Eficiência (CPA vs Budget)</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={curveData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="budget" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => formatBRL(v)} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => formatBRL(v)} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatBRL(v)} />
            <Line type="monotone" dataKey="cpaBrand" stroke="hsl(var(--primary))" strokeWidth={2} name="Brand Search" dot={false} />
            <Line type="monotone" dataKey="cpaCompetitor" stroke="hsl(var(--destructive))" strokeWidth={2} name="Competitor KWs" dot={false} />
            <Line type="monotone" dataKey="cpaRetargeting" stroke="hsl(var(--success))" strokeWidth={2} name="Retargeting" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="flex justify-end">
        <button
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isOptimizing ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Otimizando...</>
          ) : (
            "Otimizar"
          )}
        </button>
      </div>
    </div>
  );
};

export default BudgetOptimizerPage;
