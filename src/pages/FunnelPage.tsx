import { motion } from "framer-motion";
import { useFunnels } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";

const fallbackStages = [
  { name: "Impressoes", value: 0, width: "100%" },
  { name: "Cliques", value: 0, width: "70%", rate: "0%" },
  { name: "Visitas na Pagina", value: 0, width: "58%", rate: "0%" },
  { name: "Leads", value: 0, width: "42%", rate: "0%" },
  { name: "MQLs", value: 0, width: "30%", rate: "0%" },
  { name: "SQLs", value: 0, width: "20%", rate: "0%" },
  { name: "Oportunidades", value: 0, width: "12%", rate: "0%" },
  { name: "Vendas", value: 0, width: "6%", rate: "0%" },
];

function rateColor(rate: string | undefined) {
  if (!rate) return "";
  const n = parseFloat(rate);
  if (n >= 10) return "text-success";
  if (n >= 5) return "text-warning";
  return "text-destructive";
}

function buildStagesFromFunnel(funnel: any) {
  const steps = funnel.steps || funnel.stages;
  if (!Array.isArray(steps) || steps.length === 0) return null;

  const widths = ["100%", "85%", "70%", "58%", "42%", "30%", "20%", "12%", "6%"];
  return steps.map((s: any, i: number) => ({
    name: s.name || s.label || `Etapa ${i + 1}`,
    value: Number(s.value ?? s.count ?? 0),
    width: widths[i] || "6%",
    rate: i > 0 ? s.rate || s.conversion_rate : undefined,
  }));
}

const LoadingSkeleton = () => (
  <div className="space-y-6 max-w-[1400px]">
    <div>
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-80" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
      <Skeleton className="h-[400px] rounded-xl" />
    </div>
  </div>
);

const EmptyState = () => (
  <div className="space-y-6 max-w-[1400px]">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard de Funil</h1>
      <p className="text-sm text-muted-foreground mt-1">Analise completa do funil de conversao</p>
    </div>
    <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl surface-glow">
      <p className="text-muted-foreground text-sm">Configure seu funil para ver dados.</p>
    </div>
  </div>
);

const FunnelPage = () => {
  const { data, isLoading } = useFunnels();
  const funnels = data || [];

  if (isLoading) return <LoadingSkeleton />;
  if (funnels.length === 0) return <EmptyState />;

  const activeFunnel = funnels[0];
  const stages = buildStagesFromFunnel(activeFunnel) || fallbackStages;

  const diagnosis = [
    { label: "Trafego", status: "---", note: "Volume adequado", color: "text-success" },
    { label: "CTR", status: "---", note: "Acima da media", color: "text-success" },
    { label: "Conversao da Pagina", status: "---", note: "Analise pendente", color: "text-warning" },
    { label: "Lead -> MQL", status: "---", note: "Analise pendente", color: "text-warning" },
    { label: "Conversao Final", status: "---", note: "Analise pendente", color: "text-warning" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard de Funil</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analise completa do funil de conversao
          {activeFunnel.name ? ` — ${activeFunnel.name}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel visualization */}
        <div className="lg:col-span-2 bg-card rounded-xl surface-glow p-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">
            Funil de Conversao
          </p>
          <div className="space-y-3 flex flex-col items-center">
            {stages.map((stage: any, i: number) => (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between"
                style={{ width: stage.width, minWidth: "200px" }}
              >
                <span className="text-sm font-medium">{stage.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono tabular-nums text-sm">{Number(stage.value).toLocaleString()}</span>
                  {stage.rate && (
                    <span className={`text-xs font-medium ${rateColor(stage.rate)}`}>
                      {stage.rate}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Diagnosis panel */}
        <div className="bg-card rounded-xl surface-glow p-6 space-y-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Diagnostico Automatico
          </p>
          <div className="space-y-4">
            {diagnosis.map((d) => (
              <div key={d.label} className="flex items-start gap-3">
                <span className="text-lg">{d.status}</span>
                <div>
                  <p className="text-sm font-medium">{d.label}</p>
                  <p className={`text-xs ${d.color}`}>{d.note}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
              Conclusao
            </p>
            <p className="text-sm leading-relaxed">
              Analise seu funil para identificar gargalos e oportunidades de melhoria.
            </p>
          </div>

          <button className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Ver Sugestoes de IA
          </button>
        </div>
      </div>
    </div>
  );
};

export default FunnelPage;
