import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Plus, LayoutGrid, Eye, Pencil, Trash2 } from "lucide-react";
import { useCustomDashboards } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";

const widgetTypes = [
  { nome: "StatCard", descricao: "Metrica com tendencia" },
  { nome: "LineChart", descricao: "Grafico de linhas temporal" },
  { nome: "BarChart", descricao: "Grafico de barras" },
  { nome: "PieChart", descricao: "Grafico pizza/donut" },
  { nome: "Table", descricao: "Tabela de dados" },
  { nome: "Funnel", descricao: "Funil de conversao" },
  { nome: "Gauge", descricao: "Medidor circular" },
];

const LoadingSkeleton = () => (
  <div className="space-y-6 max-w-[1600px]">
    <div>
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-80" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <Skeleton key={i} className="h-48 rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-32 rounded-xl" />
  </div>
);

const EmptyState = () => (
  <div className="space-y-6 max-w-[1600px]">
    <PageHeader title="Dashboards Customizaveis" subtitle="Crie e gerencie dashboards personalizados" actions={
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        <Plus className="h-4 w-4" /> Criar Dashboard
      </button>
    } />
    <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl surface-glow">
      <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground text-sm">Crie seu primeiro dashboard customizado.</p>
      <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        <Plus className="h-4 w-4" /> Criar Dashboard
      </button>
    </div>
  </div>
);

const CustomDashboardPage = () => {
  const { data, isLoading } = useCustomDashboards();
  const dashboards = data || [];

  if (isLoading) return <LoadingSkeleton />;
  if (dashboards.length === 0) return <EmptyState />;

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="Dashboards Customizaveis" subtitle={`Crie e gerencie dashboards personalizados — ${dashboards.length} dashboard(s)`} actions={
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Criar Dashboard
        </button>
      } />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dashboards.map((d: any, i: number) => (
          <motion.div key={d.id || d.nome || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl surface-glow p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{d.name || d.nome || "Dashboard"}</h3>
                  <p className="text-xs text-muted-foreground">{d.description || d.descricao || ""}</p>
                </div>
              </div>
              {d.shared && <span className="text-[9px] font-medium bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">Compartilhado</span>}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
              {d.widget_count != null && <span>{d.widget_count} widgets</span>}
              {d.updated_at && <span>Editado: {new Date(d.updated_at).toLocaleString("pt-BR")}</span>}
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
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Widgets Disponiveis</p>
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
};

export default CustomDashboardPage;
