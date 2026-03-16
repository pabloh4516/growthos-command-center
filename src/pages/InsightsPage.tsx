import { motion } from "framer-motion";
import { Brain, AlertTriangle, Info, AlertCircle, MessageSquare, Check, X } from "lucide-react";
import { useInsights, useAIDecisions, useUpdateInsightStatus, useUpdateAIDecisionStatus } from "@/hooks/use-supabase-data";

const severityConfig: Record<string, { icon: any; className: string }> = {
  info: { icon: Info, className: "text-primary bg-primary/10" },
  warning: { icon: AlertTriangle, className: "text-warning bg-warning/10" },
  critical: { icon: AlertCircle, className: "text-destructive bg-destructive/10" },
};

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}min atras`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atras`;
  const days = Math.floor(hours / 24);
  return `${days}d atras`;
}

const LoadingSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="h-8 w-48 bg-muted animate-pulse rounded" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
      </div>
      <div className="space-y-6">
        <div className="h-48 bg-muted animate-pulse rounded-xl" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    </div>
  </div>
);

const InsightsPage = () => {
  const { data: insightsRaw, isLoading: insightsLoading } = useInsights();
  const { data: decisionsRaw, isLoading: decisionsLoading } = useAIDecisions();
  const updateInsightStatus = useUpdateInsightStatus();
  const updateDecisionStatus = useUpdateAIDecisionStatus();

  const isLoading = insightsLoading || decisionsLoading;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Map insights from DB
  const insights = (insightsRaw ?? []).map((ins: any) => ({
    id: ins.id,
    severity: ins.severity ?? 'info',
    title: ins.title ?? '',
    action: ins.suggested_action ?? 'Ver detalhes',
    time: timeAgo(ins.created_at),
    status: ins.status ?? 'new',
  }));

  // Map AI decisions as optimizations (pending ones)
  const optimizations = (decisionsRaw ?? [])
    .filter((d: any) => d.status === 'pending')
    .map((d: any) => ({
      id: d.id,
      action: d.reasoning ?? '',
      entity: d.campaigns?.name ?? d.decision_type ?? '',
      impact: d.action_details?.estimated_impact ?? '',
      status: d.status ?? 'pending',
    }));

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Insights & IA</h1>
        <p className="text-sm text-muted-foreground mt-1">Analises automaticas e sugestoes de otimizacao</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insights Feed */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Feed de Insights</p>
          {insights.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhum insight encontrado. A IA ira gerar insights conforme dados forem coletados.</div>
          ) : (
            insights.map((insight: any, i: number) => {
              const config = severityConfig[insight.severity] ?? severityConfig.info;
              const Icon = config.icon;
              return (
                <motion.div
                  key={insight.id ?? i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="flex items-start gap-4 p-4 bg-card rounded-xl surface-glow hover:surface-glow-hover transition-shadow"
                >
                  <div className={`p-2 rounded-lg shrink-0 ${config.className}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">{insight.title}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        className="text-xs font-medium text-primary hover:underline"
                        onClick={() => {
                          if (insight.id && insight.status === 'new') {
                            updateInsightStatus.mutate({ id: insight.id, status: 'acted' });
                          }
                        }}
                      >
                        {insight.action}
                      </button>
                      <span className="text-[10px] text-muted-foreground">{insight.time}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* AI Chat shortcut */}
          <div className="bg-card rounded-xl surface-glow p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Assistente IA
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Pergunte sobre seus dados em linguagem natural.
            </p>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                placeholder="Por que meu CPA subiu?"
                className="h-10 w-full pl-9 pr-3 text-sm bg-secondary border-none rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Pending Optimizations */}
          <div className="bg-card rounded-xl surface-glow p-5 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Otimizacoes Pendentes
            </p>
            {optimizations.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">Nenhuma otimizacao pendente.</div>
            ) : (
              optimizations.map((opt: any, i: number) => (
                <div key={opt.id ?? i} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium">{opt.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">{opt.entity}</p>
                  {opt.impact && <p className="text-xs text-success mt-1">{opt.impact}</p>}
                  <div className="flex gap-2 mt-2">
                    <button
                      className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors"
                      onClick={() => {
                        if (opt.id) updateDecisionStatus.mutate({ id: opt.id, status: 'approved' });
                      }}
                    >
                      <Check className="h-3 w-3" /> Aprovar
                    </button>
                    <button
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-md transition-colors"
                      onClick={() => {
                        if (opt.id) updateDecisionStatus.mutate({ id: opt.id, status: 'rejected' });
                      }}
                    >
                      <X className="h-3 w-3" /> Dispensar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
