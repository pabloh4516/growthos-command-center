import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Mail, MessageSquare, Clock, ArrowRight, Zap, GitBranch, Send, Eye } from "lucide-react";
import { useAutomationRules } from "@/hooks/use-supabase-data";

const nodeIcon: Record<string, any> = { trigger: Zap, wait: Clock, email: Mail, condition: GitBranch };
const nodeColor: Record<string, string> = { trigger: "bg-success/20 text-success", wait: "bg-warning/20 text-warning", email: "bg-primary/20 text-primary", condition: "bg-purple-500/20 text-purple-400" };

const logCols: ColumnDef<any, any>[] = [
  { accessorKey: "contato", header: "Contato" },
  { accessorKey: "direcao", header: "Direção", cell: ({ getValue }) => {
    const v = getValue() as string;
    return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${v === "entrada" ? "bg-success/20 text-success" : "bg-primary/20 text-primary"}`}>{v}</span>;
  }},
  { accessorKey: "corpo", header: "Mensagem", cell: ({ getValue }) => <span className="text-xs text-muted-foreground truncate max-w-[200px] block">{getValue() as string}</span> },
  { accessorKey: "status", header: "Status", cell: ({ getValue }) => {
    const v = getValue() as string;
    const c = v === "delivered" ? "text-success" : v === "read" ? "text-primary" : v === "failed" ? "text-destructive" : "text-muted-foreground";
    return <span className={`text-xs font-medium ${c}`}>{v}</span>;
  }},
  { accessorKey: "time", header: "Hora" },
];

const AutomationsPage = () => {
  const [selectedSeq, setSelectedSeq] = useState<string | null>(null);
  const { data: automationsData, isLoading } = useAutomationRules();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </div>
    );
  }

  const allRules = (automationsData ?? []) as any[];

  if (allRules.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <PageHeader title="Automações" subtitle="Sequências de email, WhatsApp e regras automáticas" />
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Nenhum dado encontrado.
        </div>
      </div>
    );
  }

  // Derive sequences, templates, whatsapp log, and rules from automation data
  const sequences = allRules.filter((r: any) => r.type === "email_sequence" || r.trigger_type === "email").map((r: any) => ({
    id: r.id,
    name: r.name ?? "—",
    trigger: r.trigger ?? r.trigger_event ?? "—",
    status: r.status ?? "active",
    contacts: r.contacts_count ?? r.contacts ?? 0,
    openRate: r.open_rate ?? 0,
    clickRate: r.click_rate ?? 0,
  }));

  const templates = allRules.filter((r: any) => r.type === "whatsapp_template").map((r: any) => ({
    id: r.id,
    name: r.name ?? "—",
    body: r.body ?? r.template_body ?? "—",
    status: r.approval_status ?? r.status ?? "pending",
    vars: r.variables ?? [],
  }));

  const whatsappLog = allRules.filter((r: any) => r.type === "whatsapp_log").map((r: any) => ({
    contato: r.contact_name ?? r.contact ?? "—",
    direcao: r.direction ?? "saída",
    corpo: r.body ?? r.message ?? "—",
    status: r.delivery_status ?? r.status ?? "sent",
    time: r.sent_at ? new Date(r.sent_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—",
  }));

  const rules = allRules.filter((r: any) => r.type === "rule" || r.type === "automation_rule" || (!r.type && r.trigger)).map((r: any) => ({
    name: r.name ?? "—",
    trigger: r.trigger ?? r.trigger_event ?? "—",
    conditions: r.conditions ?? r.condition ?? "—",
    actions: r.actions ?? r.action ?? "—",
    status: r.status ?? "active",
    execucoes: r.execution_count ?? r.executions ?? 0,
    ultima: r.last_executed_at ? new Date(r.last_executed_at).toLocaleString("pt-BR") : "—",
  }));

  // Fallback: if no categorized items, show all as rules
  const displayRules = rules.length > 0 ? rules : allRules.map((r: any) => ({
    name: r.name ?? "—",
    trigger: r.trigger ?? r.trigger_event ?? "—",
    conditions: r.conditions ?? r.condition ?? "—",
    actions: r.actions ?? r.action ?? "—",
    status: r.status ?? "active",
    execucoes: r.execution_count ?? r.executions ?? 0,
    ultima: r.last_executed_at ? new Date(r.last_executed_at).toLocaleString("pt-BR") : "—",
  }));

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="Automações" subtitle="Sequências de email, WhatsApp e regras automáticas" />

      <Tabs defaultValue="email">
        <TabsList>
          <TabsTrigger value="email">Sequências de Email</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="regras">Regras</TabsTrigger>
        </TabsList>

        {/* EMAIL */}
        <TabsContent value="email" className="mt-4 space-y-4">
          {sequences.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Nenhuma sequência de email encontrada.</div>
          ) : (
            <div className="space-y-3">
              {sequences.map((seq: any, i: number) => (
                <motion.div key={seq.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl surface-glow p-4 flex items-center justify-between cursor-pointer hover:surface-glow-hover transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Mail className="h-5 w-5 text-primary" /></div>
                    <div>
                      <p className="text-sm font-medium">{seq.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-secondary px-2 py-0.5 rounded">{seq.trigger}</span>
                        <StatusBadge status={seq.status} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Contatos</p>
                      <p className="font-mono tabular-nums text-sm">{seq.contacts}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Abertura</p>
                      <p className="font-mono tabular-nums text-sm">{seq.openRate}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Clique</p>
                      <p className="font-mono tabular-nums text-sm">{seq.clickRate}%</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* WHATSAPP */}
        <TabsContent value="whatsapp" className="mt-4 space-y-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Templates</p>
            {templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {templates.map((t: any) => (
                  <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">{t.name}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${t.status === "approved" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>{t.status === "approved" ? "Aprovado" : "Pendente"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.body}</p>
                    <div className="flex gap-1 mt-2">
                      {(t.vars ?? []).map((v: string) => <span key={v} className="text-[9px] bg-secondary px-1.5 py-0.5 rounded">{`{{${v}}}`}</span>)}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">Nenhum template encontrado.</div>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Log de Mensagens</p>
            {whatsappLog.length > 0 ? (
              <DataTable data={whatsappLog} columns={logCols} searchPlaceholder="Buscar mensagem..." pageSize={8} />
            ) : (
              <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">Nenhuma mensagem encontrada.</div>
            )}
          </div>
        </TabsContent>

        {/* REGRAS */}
        <TabsContent value="regras" className="mt-4 space-y-3">
          {displayRules.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Nenhuma regra encontrada.</div>
          ) : (
            displayRules.map((rule: any, i: number) => (
              <motion.div key={rule.name + i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl surface-glow p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{rule.name}</p>
                  <StatusBadge status={rule.status} />
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-xs space-y-1">
                  <p><span className="text-muted-foreground">QUANDO</span> <span className="font-medium text-primary">{rule.trigger}</span></p>
                  <p><span className="text-muted-foreground">E</span> <span className="font-medium">{rule.conditions}</span></p>
                  <p><span className="text-muted-foreground">ENTÃO</span> <span className="font-medium text-success">{rule.actions}</span></p>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>Execuções: <span className="font-mono">{rule.execucoes}</span></span>
                  <span>Última: {rule.ultima}</span>
                </div>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationsPage;
