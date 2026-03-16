import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { FileText, Download, Calendar, Clock } from "lucide-react";

const gerados = [
  { nome: "Relatório Semanal — Semana 3", cliente: "Colágeno Premium", periodo: "13/01 - 19/01", gerado: "20/01 08:00", formato: "PDF" },
  { nome: "Relatório Mensal — Dezembro", cliente: "Curso Marketing", periodo: "01/12 - 31/12", gerado: "02/01 09:00", formato: "PDF" },
  { nome: "Performance Q4 2024", cliente: "Consultoria SEO", periodo: "01/10 - 31/12", gerado: "03/01 10:00", formato: "DOCX" },
  { nome: "Relatório Semanal — Semana 2", cliente: "Colágeno Premium", periodo: "06/01 - 12/01", gerado: "13/01 08:00", formato: "PDF" },
  { nome: "ROI Consolidado", cliente: "Todos", periodo: "01/01 - 20/01", gerado: "20/01 14:00", formato: "PDF" },
];
const geradosCols: ColumnDef<typeof gerados[0], any>[] = [
  { accessorKey: "nome", header: "Nome" },
  { accessorKey: "cliente", header: "Cliente" },
  { accessorKey: "periodo", header: "Período" },
  { accessorKey: "gerado", header: "Gerado em" },
  { accessorKey: "formato", header: "Formato", cell: ({ getValue }) => <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${(getValue() as string) === "PDF" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}`}>{getValue() as string}</span> },
  { id: "download", header: "", cell: () => <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground"><Download className="h-4 w-4" /></button> },
];

const templates = [
  { nome: "Relatório Semanal", secoes: "KPIs, Top Campanhas, Insights, Gasto", linguagem: "Técnica" },
  { nome: "Relatório Quinzenal", secoes: "KPIs, Funil, Criativos, Budget", linguagem: "Simplificada" },
  { nome: "Relatório Mensal", secoes: "Resumo Executivo, KPIs, Campanhas, Funil, Criativos, Financeiro, Insights", linguagem: "Técnica" },
  { nome: "Relatório Custom", secoes: "Configurável", linguagem: "Configurável" },
];

const agendamentos = [
  { template: "Relatório Semanal", frequencia: "Semanal", destinatario: "cliente@empresa.com", proximo: "27/01 08:00", status: "Ativo" },
  { template: "Relatório Mensal", frequencia: "Mensal", destinatario: "ceo@empresa.com", proximo: "01/02 09:00", status: "Ativo" },
  { template: "Relatório Quinzenal", frequencia: "Quinzenal", destinatario: "marketing@empresa.com", proximo: "03/02 08:00", status: "Pausado" },
];

const ReportsPage = () => (
  <div className="space-y-6 max-w-[1600px]">
    <PageHeader title="Relatórios" subtitle="Gere relatórios personalizados para seus clientes" />
    <Tabs defaultValue="gerados">
      <TabsList>
        <TabsTrigger value="gerados">Gerados ({gerados.length})</TabsTrigger>
        <TabsTrigger value="templates">Templates</TabsTrigger>
        <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
      </TabsList>
      <TabsContent value="gerados" className="mt-4">
        <DataTable data={gerados} columns={geradosCols} searchPlaceholder="Buscar relatório..." />
      </TabsContent>
      <TabsContent value="templates" className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <motion.div key={t.nome} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="h-5 w-5 text-primary" /></div>
                <p className="font-medium">{t.nome}</p>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Seções: {t.secoes}</p>
              <p className="text-xs text-muted-foreground">Linguagem: {t.linguagem}</p>
              <button className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">Gerar Relatório</button>
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
                  <p className="text-xs text-muted-foreground">{a.frequencia} → {a.destinatario}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Próximo: {a.proximo}</p>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${a.status === "Ativo" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>{a.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  </div>
);
export default ReportsPage;
