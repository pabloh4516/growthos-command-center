import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Plus, LayoutGrid, Eye, Pencil, Trash2 } from "lucide-react";

const dashboards = [
  {
    nome: "Visão do CEO",
    descricao: "KPIs de alto nível: receita, leads, ROI e crescimento mensal",
    widgets: 6,
    ultimaEdicao: "18/01/2025 14:30",
    compartilhado: true,
  },
  {
    nome: "Performance Semanal",
    descricao: "Métricas de campanhas, gastos e conversões da semana atual",
    widgets: 8,
    ultimaEdicao: "17/01/2025 09:15",
    compartilhado: false,
  },
];

const widgetTypes = [
  { nome: "StatCard", descricao: "Métrica com tendência" },
  { nome: "LineChart", descricao: "Gráfico de linhas temporal" },
  { nome: "BarChart", descricao: "Gráfico de barras" },
  { nome: "PieChart", descricao: "Gráfico pizza/donut" },
  { nome: "Table", descricao: "Tabela de dados" },
  { nome: "Funnel", descricao: "Funil de conversão" },
  { nome: "Gauge", descricao: "Medidor circular" },
];

const CustomDashboardPage = () => (
  <div className="space-y-6 max-w-[1600px]">
    <PageHeader title="Dashboards Customizáveis" subtitle="Crie e gerencie dashboards personalizados" actions={
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        <Plus className="h-4 w-4" /> Criar Dashboard
      </button>
    } />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {dashboards.map((d, i) => (
        <motion.div key={d.nome} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl surface-glow p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <LayoutGrid className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{d.nome}</h3>
                <p className="text-xs text-muted-foreground">{d.descricao}</p>
              </div>
            </div>
            {d.compartilhado && <span className="text-[9px] font-medium bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">Compartilhado</span>}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <span>{d.widgets} widgets</span>
            <span>Editado: {d.ultimaEdicao}</span>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
              <Eye className="h-3 w-3" /> Visualizar
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors">
              <Pencil className="h-3 w-3" /> Editar
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors">
              <Trash2 className="h-3 w-3" /> Excluir
            </button>
          </div>
        </motion.div>
      ))}
    </div>

    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-xl surface-glow p-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Widgets Disponíveis</p>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {widgetTypes.map(w => (
          <div key={w.nome} className="bg-muted/50 rounded-lg p-3 text-center hover:bg-muted transition-colors cursor-pointer">
            <p className="text-sm font-medium">{w.nome}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{w.descricao}</p>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

export default CustomDashboardPage;
