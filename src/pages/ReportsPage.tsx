import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { FileText, Download, Calendar, Clock } from "lucide-react";
import { useAIReports } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";

const templates = [
  { nome: "Relatorio Semanal", secoes: "KPIs, Top Campanhas, Insights, Gasto", linguagem: "Tecnica" },
  { nome: "Relatorio Quinzenal", secoes: "KPIs, Funil, Criativos, Budget", linguagem: "Simplificada" },
  { nome: "Relatorio Mensal", secoes: "Resumo Executivo, KPIs, Campanhas, Funil, Criativos, Financeiro, Insights", linguagem: "Tecnica" },
  { nome: "Relatorio Custom", secoes: "Configuravel", linguagem: "Configuravel" },
];

const agendamentos = [
  { template: "Relatorio Semanal", frequencia: "Semanal", destinatario: "cliente@empresa.com", proximo: "27/01 08:00", status: "Ativo" },
  { template: "Relatorio Mensal", frequencia: "Mensal", destinatario: "ceo@empresa.com", proximo: "01/02 09:00", status: "Ativo" },
  { template: "Relatorio Quinzenal", frequencia: "Quinzenal", destinatario: "marketing@empresa.com", proximo: "03/02 08:00", status: "Pausado" },
];

const LoadingSkeleton = () => (
  <div className="space-y-6 max-w-[1600px]">
    <div>
      <Skeleton className="h-8 w-40 mb-2" />
      <Skeleton className="h-4 w-80" />
    </div>
    <Skeleton className="h-10 w-80" />
    <Skeleton className="h-[300px] rounded-xl" />
  </div>
);

const EmptyReportsState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-xl surface-glow">
    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
    <p className="text-muted-foreground text-sm">Nenhum relatorio gerado ainda.</p>
    <p className="text-muted-foreground text-xs mt-1">Use os templates abaixo para gerar seu primeiro relatorio.</p>
  </div>
);

const ReportsPage = () => {
  const { data, isLoading } = useAIReports();
  const reports = data || [];

  if (isLoading) return <LoadingSkeleton />;

  // Build columns from Supabase data
  const geradosCols: ColumnDef<any, any>[] = [
    { accessorKey: "name", header: "Nome", cell: ({ getValue, row }) => <span>{(getValue() as string) || (row.original as any).nome || "Relatorio"}</span> },
    { accessorKey: "client", header: "Cliente", cell: ({ getValue, row }) => <span>{(getValue() as string) || (row.original as any).cliente || "---"}</span> },
    { accessorKey: "period", header: "Periodo", cell: ({ getValue, row }) => <span>{(getValue() as string) || (row.original as any).periodo || "---"}</span> },
    { accessorKey: "created_at", header: "Gerado em", cell: ({ getValue }) => {
      const v = getValue() as string;
      return v ? new Date(v).toLocaleString("pt-BR") : "---";
    }},
    { accessorKey: "format", header: "Formato", cell: ({ getValue }) => {
      const v = (getValue() as string) || "PDF";
      return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${v === "PDF" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}`}>{v}</span>;
    }},
    { id: "download", header: "", cell: () => <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground"><Download className="h-4 w-4" /></button> },
  ];

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="Relatorios" subtitle="Gere relatorios personalizados para seus clientes" />
      <Tabs defaultValue="gerados">
        <TabsList>
          <TabsTrigger value="gerados">Gerados ({reports.length})</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
        </TabsList>
        <TabsContent value="gerados" className="mt-4">
          {reports.length === 0 ? (
            <EmptyReportsState />
          ) : (
            <DataTable data={reports} columns={geradosCols} searchPlaceholder="Buscar relatorio..." />
          )}
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((t) => (
              <motion.div key={t.nome} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="h-5 w-5 text-primary" /></div>
                  <p className="font-medium">{t.nome}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Secoes: {t.secoes}</p>
                <p className="text-xs text-muted-foreground">Linguagem: {t.linguagem}</p>
                <button className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">Gerar Relatorio</button>
              </motion.div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="agendamentos" className="mt-4">
          <div className="space-y-3">
            {agendamentos.map((a) => (
              <motion.div key={a.template + a.frequencia} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Clock className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-sm font-medium">{a.template}</p>
                    <p className="text-xs text-muted-foreground">{a.frequencia} -> {a.destinatario}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Proximo: {a.proximo}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${a.status === "Ativo" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>{a.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default ReportsPage;
