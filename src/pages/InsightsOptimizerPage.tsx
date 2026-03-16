import { motion } from "framer-motion";
import { useState } from "react";
import { Check, X, RotateCcw, Zap, Pause, TrendingUp, MinusCircle, Trash2, Palette, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAIDecisions, useUpdateAIDecisionStatus, useOptimizationLogs } from "@/hooks/use-supabase-data";
import { executeAIDecision } from "@/services/edge-functions";

const typeConfig: Record<string, { icon: any; className: string }> = {
  "pause_keyword": { icon: Pause, className: "text-warning bg-warning/10" },
  "Pausar Keyword": { icon: Pause, className: "text-warning bg-warning/10" },
  "scale_budget": { icon: TrendingUp, className: "text-success bg-success/10" },
  "Escalar Budget": { icon: TrendingUp, className: "text-success bg-success/10" },
  "add_negative": { icon: MinusCircle, className: "text-primary bg-primary/10" },
  "Add Negativa": { icon: MinusCircle, className: "text-primary bg-primary/10" },
  "exclude_placement": { icon: Trash2, className: "text-destructive bg-destructive/10" },
  "Excluir Placement": { icon: Trash2, className: "text-destructive bg-destructive/10" },
  "swap_creative": { icon: Palette, className: "text-purple-400 bg-purple-400/10" },
  "Trocar Criativo": { icon: Palette, className: "text-purple-400 bg-purple-400/10" },
};

const defaultConfig = { icon: Zap, className: "text-primary bg-primary/10" };

// Mock fallbacks for when no real data exists
const mockPending = [
  {
    id: "mock-1",
    type: "Pausar Keyword",
    campaign_name: "Google - Brand Search",
    campaign_id: "camp-001",
    reasoning: "A keyword 'erp barato' tem Quality Score 4 e CPA de R$ 19,00 — 48% acima da média da campanha. Nos últimos 7 dias, gerou apenas 5 conversões com gasto de R$ 95,00.",
    estimated_impact: "R$ 95,00/mês",
    confidence_score: 92,
    status: "pending",
  },
  {
    id: "mock-2",
    type: "Escalar Budget",
    campaign_name: "Meta - Retargeting Q1",
    campaign_id: "camp-002",
    reasoning: "Esta campanha mantém ROAS de 4,35x com CPA estável em R$ 8,17. Há margem para aumentar o budget em 30% sem degradar performance.",
    estimated_impact: "R$ 5.526,00/mês receita adicional",
    confidence_score: 87,
    status: "pending",
  },
  {
    id: "mock-3",
    type: "Add Negativa",
    campaign_name: "Google - Competitor KWs",
    campaign_id: "camp-003",
    reasoning: "Identificamos 8 termos de busca irrelevantes consumindo 22% do budget desta campanha.",
    estimated_impact: "R$ 418,00/mês economia",
    confidence_score: 95,
    status: "pending",
  },
];

const mockExecuted = [
  {
    id: "mock-e1",
    type: "Pausar Keyword",
    campaign_name: "Google - Brand Search",
    action: "Pausada keyword 'gestão empresarial grátis'",
    before_value: "CPA R$ 43,33 · 3 conv. em 30 dias",
    after_value: "CPA da campanha caiu de R$ 16,20 para R$ 14,80",
    executed_at: "12/03/2026",
    status: "executed",
  },
  {
    id: "mock-e2",
    type: "Add Negativa",
    campaign_name: "Google - Competitor KWs",
    action: "Adicionadas 5 keywords negativas de marca",
    before_value: "CTR 4,2% · CPA R$ 19,00",
    after_value: "CTR subiu para 5,8% · CPA caiu para R$ 15,40",
    executed_at: "08/03/2026",
    status: "executed",
  },
];

const mockReverted = [
  {
    id: "mock-r1",
    type: "Escalar Budget",
    campaign_name: "TikTok - Gen Z Launch",
    action: "Budget aumentado de R$ 150/d para R$ 200/d",
    revert_reason: "Após 3 dias, o CPA subiu 35% sem aumento proporcional de conversões.",
    executed_at: "01/03/2026",
    reverted_at: "04/03/2026",
    status: "reverted",
  },
];

const InsightsOptimizerPage = () => {
  const { data: decisionsRaw, isLoading: isLoadingDecisions } = useAIDecisions();
  const { data: logsRaw, isLoading: isLoadingLogs } = useOptimizationLogs();
  const updateStatus = useUpdateAIDecisionStatus();
  const [executingIds, setExecutingIds] = useState<Set<string>>(new Set());

  const decisions = decisionsRaw || [];
  const logs = logsRaw || [];

  // Split decisions by status, fall back to mocks if empty
  const pendingDecisions = decisions.filter((d: any) => d.status === "pending");
  const executedDecisions = decisions.filter((d: any) => d.status === "executed" || d.status === "approved");
  const revertedDecisions = decisions.filter((d: any) => d.status === "reverted");

  const pending = pendingDecisions.length > 0 ? pendingDecisions : mockPending;
  const executed = executedDecisions.length > 0 ? executedDecisions : mockExecuted;
  const reverted = revertedDecisions.length > 0 ? revertedDecisions : mockReverted;

  const handleApprove = async (decisionId: string) => {
    if (decisionId.startsWith("mock-")) return; // Don't call API for mocks
    setExecutingIds((prev) => new Set(prev).add(decisionId));
    try {
      await executeAIDecision(decisionId);
    } catch (err) {
      console.error("Error executing AI decision:", err);
    } finally {
      setExecutingIds((prev) => {
        const next = new Set(prev);
        next.delete(decisionId);
        return next;
      });
    }
  };

  const handleReject = (decisionId: string) => {
    if (decisionId.startsWith("mock-")) return;
    updateStatus.mutate({ id: decisionId, status: "rejected" });
  };

  const isLoading = isLoadingDecisions || isLoadingLogs;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">Motor de Otimização</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Otimizações sugeridas pela IA · Aprove, execute ou reverta
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-32 bg-muted animate-pulse rounded-xl" />
          <div className="h-32 bg-muted animate-pulse rounded-xl" />
          <div className="h-32 bg-muted animate-pulse rounded-xl" />
        </div>
      ) : (
        <Tabs defaultValue="pendentes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pendentes">
              Pendentes
              <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{pending.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="executadas">
              Executadas
              <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{executed.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="revertidas">
              Revertidas
              <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{reverted.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Pendentes Tab */}
          <TabsContent value="pendentes" className="space-y-4">
            {pending.map((opt: any, i: number) => {
              const config = typeConfig[opt.type || opt.decision_type] || defaultConfig;
              const Icon = config.icon;
              const campaignName = opt.campaign_name || opt.campaigns?.name || "Campanha";
              const campaignId = opt.campaign_id || opt.campaigns?.id || "";
              const isExecuting = executingIds.has(opt.id);
              return (
                <motion.div
                  key={opt.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-card rounded-xl surface-glow p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 ${config.className}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">{opt.type || opt.decision_type}</Badge>
                          <Link
                            to={`/campaigns/${campaignId}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {campaignName}
                          </Link>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                          {opt.reasoning || opt.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">
                        Impacto estimado: <span className="font-mono tabular-nums text-success font-medium">{opt.estimated_impact || opt.impact || "—"}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Confiança: <span className="font-mono tabular-nums text-foreground font-medium">{opt.confidence_score || opt.confidence || 0}%</span>
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/90 text-xs gap-1"
                        onClick={() => handleApprove(opt.id)}
                        disabled={isExecuting}
                      >
                        {isExecuting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Aprovar e Executar
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs gap-1"
                        onClick={() => handleReject(opt.id)}
                      >
                        <X className="h-3 w-3" /> Dispensar
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* Executadas Tab */}
          <TabsContent value="executadas" className="space-y-4">
            {executed.map((opt: any, i: number) => {
              const config = typeConfig[opt.type || opt.decision_type] || defaultConfig;
              const Icon = config.icon;
              return (
                <motion.div
                  key={opt.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-card rounded-xl surface-glow p-5 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${config.className}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{opt.type || opt.decision_type}</Badge>
                          <span className="text-sm font-medium">{opt.campaign_name || opt.campaigns?.name || "Campanha"}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{opt.executed_at ? new Date(opt.executed_at).toLocaleDateString("pt-BR") : opt.date || ""}</span>
                      </div>
                      <p className="text-sm text-foreground mt-2">{opt.action || opt.reasoning || opt.description}</p>
                      {(opt.before_value || opt.after_value) && (
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <span className="text-muted-foreground">{opt.before_value || opt.before}</span>
                          <span className="text-muted-foreground">{"\u2192"}</span>
                          <span className="text-success">{opt.after_value || opt.after}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* Revertidas Tab */}
          <TabsContent value="revertidas" className="space-y-4">
            {reverted.map((opt: any, i: number) => {
              const config = typeConfig[opt.type || opt.decision_type] || defaultConfig;
              const Icon = config.icon;
              return (
                <motion.div
                  key={opt.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-card rounded-xl surface-glow p-5 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${config.className}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{opt.type || opt.decision_type}</Badge>
                        <span className="text-sm font-medium">{opt.campaign_name || opt.campaigns?.name || "Campanha"}</span>
                        <Badge variant="destructive" className="text-[10px]">
                          <RotateCcw className="h-2.5 w-2.5 mr-1" /> Revertida
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground mt-2">{opt.action || opt.reasoning || opt.description}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                        <span className="text-destructive font-medium">Motivo da reversão:</span> {opt.revert_reason || opt.reason || "—"}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span>Executada: {opt.executed_at ? new Date(opt.executed_at).toLocaleDateString("pt-BR") : opt.executedDate || ""}</span>
                        <span>Revertida: {opt.reverted_at ? new Date(opt.reverted_at).toLocaleDateString("pt-BR") : opt.revertedDate || ""}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default InsightsOptimizerPage;
