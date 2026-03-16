import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/shared/DataTable";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, AlertTriangle, Info, TrendingDown, DollarSign, Palette, BarChart3, Zap, Check, X } from "lucide-react";
import { useAlerts, useAlertRules, useUpdateAlertStatus } from "@/hooks/use-supabase-data";

const historyCols: ColumnDef<any, any>[] = [
  { accessorKey: "tipo", header: "Tipo" },
  { accessorKey: "severidade", header: "Severidade", cell: ({ getValue }) => <SeverityBadge severity={getValue() as any} /> },
  { accessorKey: "titulo", header: "Título" },
  { accessorKey: "entidade", header: "Entidade" },
  { accessorKey: "triggered", header: "Disparado em" },
  { accessorKey: "resolved", header: "Resolvido em" },
  { accessorKey: "by", header: "Por" },
];

const AlertsPage = () => {
  const { data: alertsData, isLoading: alertsLoading } = useAlerts();
  const { data: rulesData, isLoading: rulesLoading } = useAlertRules();
  const updateAlertStatus = useUpdateAlertStatus();

  const isLoading = alertsLoading || rulesLoading;

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

  const alerts = (alertsData ?? []) as any[];
  const alertRules = (rulesData ?? []) as any[];

  if (alerts.length === 0 && alertRules.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <PageHeader title="Alertas" subtitle="0 alertas ativos" />
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Nenhum dado encontrado.
        </div>
      </div>
    );
  }

  const activeAlerts = alerts.filter((a: any) => a.status !== "resolved");
  const resolvedAlerts = alerts.filter((a: any) => a.status === "resolved");

  const groupedAlerts = {
    critical: activeAlerts.filter((a: any) => a.severity === "critical"),
    warning: activeAlerts.filter((a: any) => a.severity === "warning"),
    info: activeAlerts.filter((a: any) => a.severity === "info"),
  };

  const resolve = (id: string) => {
    updateAlertStatus.mutate({ id, status: "resolved" });
  };

  const historyData = resolvedAlerts.map((a: any) => ({
    tipo: a.title ?? a.type ?? "—",
    severidade: a.severity ?? "info",
    titulo: a.message ?? a.title ?? "—",
    entidade: a.entity ?? "—",
    triggered: a.created_at ? new Date(a.created_at).toLocaleString("pt-BR") : "—",
    resolved: a.resolved_at ? new Date(a.resolved_at).toLocaleString("pt-BR") : "—",
    by: a.resolved_by ?? "—",
  }));

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="Alertas" subtitle={`${activeAlerts.length} alertas ativos`} />

      <Tabs defaultValue="ativos">
        <TabsList>
          <TabsTrigger value="ativos">Ativos ({activeAlerts.length})</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="configurar">Configurar</TabsTrigger>
        </TabsList>

        <TabsContent value="ativos" className="mt-4 space-y-6">
          {(["critical", "warning", "info"] as const).map((sev) => {
            const items = groupedAlerts[sev];
            if (items.length === 0) return null;
            return (
              <div key={sev}>
                <div className="flex items-center gap-2 mb-3">
                  <SeverityBadge severity={sev} />
                  <span className="text-xs text-muted-foreground">({items.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((alert: any, i: number) => (
                    <motion.div key={alert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className="bg-card rounded-xl surface-glow p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span>Atual: <span className="font-mono font-medium">{alert.current_value ?? "—"}</span></span>
                            <span>Limite: <span className="font-mono font-medium">{alert.threshold ?? "—"}</span></span>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-primary">{alert.entity ?? "—"}</span>
                            <span className="text-[10px] text-muted-foreground">{alert.created_at ? new Date(alert.created_at).toLocaleString("pt-BR") : ""}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0 ml-3">
                          <button onClick={() => resolve(alert.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-success hover:bg-success/10 transition-colors" title="Resolver">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={() => resolve(alert.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Dispensar">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
          {activeAlerts.length === 0 && (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Nenhum alerta ativo.</div>
          )}
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          {historyData.length > 0 ? (
            <DataTable data={historyData} columns={historyCols} searchPlaceholder="Buscar no histórico..." />
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Nenhum histórico encontrado.</div>
          )}
        </TabsContent>

        <TabsContent value="configurar" className="mt-4">
          {alertRules.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Métrica</th>
                    <th className="text-center px-3 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Operador</th>
                    <th className="text-center px-3 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Threshold</th>
                    <th className="text-center px-3 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Severidade</th>
                    <th className="text-center px-3 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Dashboard</th>
                    <th className="text-center px-3 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="text-center px-5 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {alertRules.map((rule: any, i: number) => (
                    <tr key={rule.id ?? i} className="border-b border-border">
                      <td className="px-5 py-3 font-medium">{rule.metric ?? rule.metrica ?? "—"}</td>
                      <td className="px-3 py-3 text-center font-mono">{rule.operator ?? rule.operador ?? "—"}</td>
                      <td className="px-3 py-3 text-center font-mono tabular-nums">{rule.threshold ?? "—"}</td>
                      <td className="px-3 py-3 text-center"><SeverityBadge severity={rule.severity ?? rule.severidade ?? "info"} /></td>
                      <td className="px-3 py-3 text-center"><input type="checkbox" defaultChecked={rule.notify_dashboard ?? rule.dashboard ?? false} className="rounded" /></td>
                      <td className="px-3 py-3 text-center"><input type="checkbox" defaultChecked={rule.notify_email ?? rule.email ?? false} className="rounded" /></td>
                      <td className="px-5 py-3 text-center"><input type="checkbox" defaultChecked={rule.notify_whatsapp ?? rule.whatsapp ?? false} className="rounded" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Nenhuma regra configurada.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertsPage;
