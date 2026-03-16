import { motion } from "framer-motion";

const stages = [
  { name: "Impressões", value: 1250000, width: "100%" },
  { name: "Cliques", value: 87500, width: "70%", rate: "7.0%" },
  { name: "Visitas na Página", value: 72000, width: "58%", rate: "82.3%" },
  { name: "Leads", value: 3847, width: "42%", rate: "5.3%" },
  { name: "MQLs", value: 1539, width: "30%", rate: "40.0%" },
  { name: "SQLs", value: 615, width: "20%", rate: "40.0%" },
  { name: "Oportunidades", value: 246, width: "12%", rate: "40.0%" },
  { name: "Vendas", value: 98, width: "6%", rate: "39.8%" },
];

function rateColor(rate: string | undefined) {
  if (!rate) return "";
  const n = parseFloat(rate);
  if (n >= 10) return "text-success";
  if (n >= 5) return "text-warning";
  return "text-destructive";
}

const diagnosis = [
  { label: "Tráfego", status: "✅", note: "Volume adequado", color: "text-success" },
  { label: "CTR", status: "✅", note: "7.0% — acima da média", color: "text-success" },
  { label: "Conversão da Página", status: "❌", note: "5.3% — média do setor: 8.2%", color: "text-destructive" },
  { label: "Lead → MQL", status: "⚠️", note: "40% — pode melhorar", color: "text-warning" },
  { label: "Conversão Final", status: "⚠️", note: "39.8% — estável", color: "text-warning" },
];

const FunnelPage = () => {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard de Funil</h1>
        <p className="text-sm text-muted-foreground mt-1">Análise completa do funil de conversão</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel visualization */}
        <div className="lg:col-span-2 bg-card rounded-xl surface-glow p-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">
            Funil de Conversão
          </p>
          <div className="space-y-3 flex flex-col items-center">
            {stages.map((stage, i) => (
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
                  <span className="font-mono tabular-nums text-sm">{stage.value.toLocaleString()}</span>
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
            Diagnóstico Automático
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
              Conclusão
            </p>
            <p className="text-sm leading-relaxed">
              Sua landing page é o principal gargalo. Você está perdendo{" "}
              <span className="text-destructive font-semibold">~35%</span> das conversões possíveis nesta etapa.
            </p>
          </div>

          <button className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Ver Sugestões de IA
          </button>
        </div>
      </div>
    </div>
  );
};

export default FunnelPage;
