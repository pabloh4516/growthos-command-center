import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { ArrowRight } from "lucide-react";

const journeys = [
  { steps: ["Google Ads", "Landing Page", "Formulário", "Email", "Venda"], pct: 35, tempo: "4.2 dias", cor: "bg-blue-500" },
  { steps: ["Meta Ads", "Landing Page", "WhatsApp", "Venda"], pct: 28, tempo: "2.8 dias", cor: "bg-purple-500" },
  { steps: ["Orgânico", "Blog", "Newsletter", "Venda"], pct: 18, tempo: "12.5 dias", cor: "bg-success" },
  { steps: ["Google Ads", "Landing Page", "Call", "Proposta", "Venda"], pct: 12, tempo: "6.1 dias", cor: "bg-warning" },
  { steps: ["Indicação", "WhatsApp", "Venda"], pct: 7, tempo: "1.5 dias", cor: "bg-cyan-500" },
];

const touchpoints = [
  { nome: "Landing Page", peso: 92, cor: "bg-primary" },
  { nome: "Email Marketing", peso: 78, cor: "bg-purple-500" },
  { nome: "WhatsApp", peso: 65, cor: "bg-success" },
  { nome: "Google Ads (Click)", peso: 58, cor: "bg-blue-500" },
  { nome: "Blog/Conteúdo", peso: 42, cor: "bg-warning" },
  { nome: "Meta Ads (View)", peso: 35, cor: "bg-pink-500" },
  { nome: "Call/Telefone", peso: 28, cor: "bg-cyan-500" },
];

const CustomerJourneyPage = () => (
  <div className="space-y-6 max-w-[1600px]">
    <PageHeader title="Customer Journey" subtitle="Visualize os caminhos mais comuns dos seus clientes até a venda" />

    <div className="space-y-4">
      {journeys.map((j, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl surface-glow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${j.cor}`} />
              <span className="text-sm font-semibold">{j.pct}% dos clientes</span>
            </div>
            <span className="text-xs text-muted-foreground">Tempo médio: {j.tempo}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {j.steps.map((step, si) => (
              <div key={si} className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${si === j.steps.length - 1 ? "bg-success/20 text-success" : "bg-muted text-foreground"}`}>
                  {step}
                </div>
                {si < j.steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>

    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl surface-glow p-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Touchpoints Mais Influentes</p>
      <div className="space-y-3">
        {touchpoints.map((t, i) => (
          <div key={t.nome} className="flex items-center gap-3">
            <span className="text-xs w-32 text-right text-muted-foreground">{t.nome}</span>
            <div className="flex-1 h-5 rounded-full bg-muted/50 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${t.peso}%` }}
                transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
                className={`h-full rounded-full ${t.cor}`}
              />
            </div>
            <span className="text-xs font-mono tabular-nums w-8">{t.peso}%</span>
          </div>
        ))}
      </div>
    </motion.div>

    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card rounded-xl surface-glow p-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Tempo Médio da Jornada por Segmento</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { seg: "Google Ads", tempo: "4.2 dias" },
          { seg: "Meta Ads", tempo: "2.8 dias" },
          { seg: "Orgânico", tempo: "12.5 dias" },
          { seg: "Indicação", tempo: "1.5 dias" },
        ].map(s => (
          <div key={s.seg} className="text-center">
            <p className="text-2xl font-mono font-bold">{s.tempo}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.seg}</p>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

export default CustomerJourneyPage;
