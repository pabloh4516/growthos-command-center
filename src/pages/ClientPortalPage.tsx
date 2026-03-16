import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { KPICard } from "@/components/KPICard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Check, X, MessageSquare, Send } from "lucide-react";

const kpis = [
  { title: "Leads Gerados", value: "45", change: 18.2, spark: [28, 32, 35, 38, 40, 42, 45] },
  { title: "Vendas", value: "12", change: 25.0, spark: [6, 7, 8, 9, 10, 11, 12] },
  { title: "ROI", value: "320%", change: 15.4, spark: [220, 240, 260, 280, 300, 310, 320] },
  { title: "Investimento", value: "R$ 5.000", change: 8.0, spark: [3800, 4000, 4200, 4400, 4600, 4800, 5000] },
];

const chartData = Array.from({ length: 30 }, (_, i) => ({ day: `${i + 1}/01`, leads: Math.round(1 + Math.random() * 3), vendas: Math.random() > 0.6 ? 1 : 0 }));

const criativos = [
  { id: "c1", nome: "Banner Colágeno — Janeiro", status: "pending", preview: "🖼️" },
  { id: "c2", nome: "Vídeo Depoimento Cliente", status: "pending", preview: "🎬" },
  { id: "c3", nome: "Carrossel Benefícios", status: "pending", preview: "📊" },
  { id: "c4", nome: "Story Promoção Relâmpago", status: "pending", preview: "⚡" },
];

const mensagens = [
  { autor: "Equipe", msg: "Olá! O relatório semanal está disponível. Tivemos ótimos resultados esta semana!", time: "10:30" },
  { autor: "Cliente", msg: "Ótimo! Vi que as vendas subiram. Podemos escalar o budget?", time: "11:15" },
  { autor: "Equipe", msg: "Sim! Recomendamos aumentar 20% no Google Search. Preparamos 4 novos criativos para aprovação.", time: "11:45" },
  { autor: "Cliente", msg: "Perfeito, vou olhar os criativos agora.", time: "12:00" },
];

const ClientPortalPage = () => {
  const [criativosState, setCriativosState] = useState(criativos);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <PageHeader title="Portal do Cliente" subtitle="Visão simplificada de resultados e aprovações" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => <KPICard key={kpi.title} {...kpi} sparkData={kpi.spark} delay={i * 0.05} />)}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Este mês geramos <span className="text-foreground font-semibold">45 leads</span> e <span className="text-foreground font-semibold">12 vendas</span> com ROI de <span className="text-success font-semibold">320%</span>. Seu investimento de <span className="font-semibold">R$5.000</span> retornou <span className="text-success font-semibold">R$21.000</span> em receita.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aprovação Criativos */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Criativos Pendentes</p>
          <div className="space-y-3">
            {criativosState.map((c) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-2xl">{c.preview}</div>
                    <p className="text-sm font-medium">{c.nome}</p>
                  </div>
                  {c.status === "pending" ? (
                    <div className="flex gap-2">
                      <button onClick={() => setCriativosState(prev => prev.map(x => x.id === c.id ? { ...x, status: "approved" } : x))} className="px-3 py-1.5 rounded-md bg-success text-success-foreground text-xs font-medium hover:bg-success/90 flex items-center gap-1"><Check className="h-3 w-3" /> Aprovar</button>
                      <button onClick={() => setCriativosState(prev => prev.map(x => x.id === c.id ? { ...x, status: "revision" } : x))} className="px-3 py-1.5 rounded-md bg-warning text-warning-foreground text-xs font-medium hover:bg-warning/90 flex items-center gap-1"><X className="h-3 w-3" /> Revisão</button>
                    </div>
                  ) : (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.status === "approved" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>{c.status === "approved" ? "Aprovado ✓" : "Em Revisão"}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Mensagens</p>
          <div className="bg-card rounded-xl surface-glow p-4 flex flex-col h-[360px]">
            <div className="flex-1 overflow-y-auto space-y-3 mb-3">
              {mensagens.map((m, i) => (
                <div key={i} className={`flex ${m.autor === "Cliente" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.autor === "Cliente" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    <p>{m.msg}</p>
                    <p className="text-[10px] opacity-60 mt-1">{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input placeholder="Digite uma mensagem..." className="flex-1 h-9 px-3 text-sm bg-secondary border-none rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <button className="h-9 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"><Send className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ClientPortalPage;
