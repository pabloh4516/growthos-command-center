import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgressBarCustom } from "@/components/shared/ProgressBarCustom";
import { formatBRL } from "@/components/shared/CurrencyDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useGoals } from "@/hooks/use-supabase-data";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  on_track: { label: "No caminho", color: "text-success", icon: TrendingUp },
  at_risk: { label: "Em risco", color: "text-warning", icon: AlertTriangle },
  behind: { label: "Atrasado", color: "text-destructive", icon: TrendingDown },
};

const GoalsPage = () => {
  const { data: goalsData, isLoading } = useGoals();

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

  const allGoals = (goalsData ?? []) as any[];

  if (allGoals.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <PageHeader title="Metas & OKRs" subtitle="Acompanhe metas de performance e objetivos estratégicos" />
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Nenhum dado encontrado.
        </div>
      </div>
    );
  }

  const metas = allGoals.filter((g: any) => g.type === "meta" || g.type === "goal" || !g.key_results).map((g: any) => ({
    nome: g.name ?? g.nome ?? "—",
    target: g.target_value ?? g.target ?? 0,
    current: g.current_value ?? g.current ?? 0,
    unit: g.unit ?? "",
    metric2: g.metric_label ?? g.metric2 ?? "—",
    status: g.status ?? "on_track",
    projecao: g.projection ?? g.projecao ?? "—",
  }));

  const okrs = allGoals.filter((g: any) => g.type === "okr" || g.key_results).map((g: any) => ({
    objective: g.name ?? g.objective ?? "—",
    progress: g.progress ?? 0,
    keyResults: (g.key_results ?? []).map((kr: any) => ({
      title: kr.title ?? "—",
      progress: kr.progress ?? 0,
      current: kr.current ?? "—",
      target: kr.target ?? "—",
    })),
  }));

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="Metas & OKRs" subtitle="Acompanhe metas de performance e objetivos estratégicos" />

      <Tabs defaultValue="metas">
        <TabsList>
          <TabsTrigger value="metas">Metas</TabsTrigger>
          <TabsTrigger value="okrs">OKRs</TabsTrigger>
        </TabsList>

        <TabsContent value="metas" className="space-y-4 mt-4">
          {metas.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Nenhuma meta encontrada.</div>
          ) : (
            metas.map((m: any, i: number) => {
              const sc = statusConfig[m.status] ?? statusConfig.on_track;
              const Icon = sc.icon;
              const pct = m.status === "behind"
                ? Math.max(0, Math.round((1 - (m.current - m.target) / m.target) * 100))
                : m.target > 0 ? Math.round((m.current / m.target) * 100) : 0;
              return (
                <motion.div key={m.nome + i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl surface-glow p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-sm">{m.nome}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{m.metric2}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${sc.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {sc.label}
                    </div>
                  </div>
                  <ProgressBarCustom value={Math.min(pct, 100)} thresholds={{ green: 70, yellow: 40 }} />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>{pct}% concluído</span>
                    <span>Projeção: {m.projecao}</span>
                  </div>
                </motion.div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="okrs" className="space-y-6 mt-4">
          {okrs.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Nenhum OKR encontrado.</div>
          ) : (
            okrs.map((okr: any, i: number) => (
              <motion.div key={okr.objective + i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{okr.objective}</h3>
                    <p className="text-xs text-muted-foreground">Progresso geral: {okr.progress}%</p>
                  </div>
                </div>
                <ProgressBarCustom value={okr.progress} thresholds={{ green: 70, yellow: 40 }} />
                <div className="mt-5 space-y-4 ml-6 border-l-2 border-border pl-5">
                  {(okr.keyResults ?? []).map((kr: any, j: number) => (
                    <motion.div key={kr.title + j} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + j * 0.05 }}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{kr.title}</span>
                        <span className="text-xs text-muted-foreground">{kr.current} / {kr.target}</span>
                      </div>
                      <ProgressBarCustom value={kr.progress} thresholds={{ green: 70, yellow: 40 }} />
                      <p className="text-xs text-muted-foreground mt-1">{kr.progress}%</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoalsPage;
