import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Copy, Check, Save } from "lucide-react";
import { useAISettings } from "@/hooks/use-supabase-data";

const membros = [
  { nome: "João Silva", email: "joao@growthOS.com", papel: "Owner", status: "Ativo", entrada: "01/06/2024" },
  { nome: "Maria Santos", email: "maria@growthOS.com", papel: "Admin", status: "Ativo", entrada: "15/07/2024" },
  { nome: "Ana Costa", email: "ana@growthOS.com", papel: "Analyst", status: "Ativo", entrada: "01/09/2024" },
  { nome: "Pedro Lima", email: "pedro@growthOS.com", papel: "Viewer", status: "Pendente", entrada: "10/01/2025" },
];
const papelColors: Record<string, string> = { Owner: "bg-purple-500/20 text-purple-400", Admin: "bg-primary/20 text-primary", Analyst: "bg-success/20 text-success", Viewer: "bg-secondary text-muted-foreground" };

const membrosCols: ColumnDef<typeof membros[0], any>[] = [
  { accessorKey: "nome", header: "Nome" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "papel", header: "Papel", cell: ({ getValue }) => <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${papelColors[getValue() as string] || ""}`}>{getValue() as string}</span> },
  { accessorKey: "status", header: "Status", cell: ({ getValue }) => <span className={`text-[10px] font-medium ${(getValue() as string) === "Ativo" ? "text-success" : "text-warning"}`}>{getValue() as string}</span> },
  { accessorKey: "entrada", header: "Entrada" },
];

const apiKeys = [
  { nome: "Production Key", key: "sk_live_****4f8a", permissoes: ["read", "write"], ultimoUso: "20/01 14:30", expiracao: "01/06/2025" },
  { nome: "Test Key", key: "sk_test_****9b2c", permissoes: ["read"], ultimoUso: "18/01 09:00", expiracao: "01/03/2025" },
];

const faturas = [
  { data: "01/01/2025", valor: "R$ 297,00", status: "Pago", plano: "Pro" },
  { data: "01/12/2024", valor: "R$ 297,00", status: "Pago", plano: "Pro" },
  { data: "01/11/2024", valor: "R$ 197,00", status: "Pago", plano: "Starter" },
];

const notifTypes = ["CPA spike", "CTR drop", "Budget esgotando", "Campanha parou", "Criativo fadiga", "Relatório pronto", "Lead quente", "Churn risk"];

const SettingsPage = () => {
  const [utmUrl, setUtmUrl] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");

  const { data: aiSettingsData, isLoading: aiLoading } = useAISettings();

  const generatedUrl = utmUrl ? `${utmUrl}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}` : "";

  const aiSettings = (aiSettingsData ?? {}) as any;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <PageHeader title="Configurações" subtitle="Workspace, membros, API keys e preferências" />
      <Tabs defaultValue="workspace">
        <TabsList className="flex-wrap">
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="membros">Membros</TabsTrigger>
          <TabsTrigger value="apikeys">API Keys</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="utm">UTM Builder</TabsTrigger>
          <TabsTrigger value="ai">IA</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="workspace" className="mt-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5 max-w-lg space-y-4">
            <div><label className="text-xs text-muted-foreground">Nome da Organização</label><input defaultValue="Growth Agency" className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary" /></div>
            <div><label className="text-xs text-muted-foreground">Timezone</label><select className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground"><option>America/Sao_Paulo (BRT)</option></select></div>
            <div><label className="text-xs text-muted-foreground">Moeda</label><select className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground"><option>BRL (R$)</option><option>USD ($)</option></select></div>
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"><Save className="h-4 w-4" /> Salvar</button>
          </motion.div>
        </TabsContent>

        <TabsContent value="membros" className="mt-4">
          <DataTable data={membros} columns={membrosCols} searchPlaceholder="Buscar membro..." />
        </TabsContent>

        <TabsContent value="apikeys" className="mt-4 space-y-3">
          {apiKeys.map(k => (
            <motion.div key={k.nome} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{k.nome}</p>
                <p className="text-xs font-mono text-muted-foreground mt-1">{k.key}</p>
                <div className="flex gap-1 mt-1">{k.permissoes.map(p => <span key={p} className="text-[9px] bg-secondary px-1.5 py-0.5 rounded">{p}</span>)}</div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Último uso: {k.ultimoUso}</p>
                <p>Expira: {k.expiracao}</p>
              </div>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="notificacoes" className="mt-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-[10px] font-medium text-muted-foreground uppercase">Tipo</th>
                <th className="text-center px-3 py-3 text-[10px] font-medium text-muted-foreground uppercase">Dashboard</th>
                <th className="text-center px-3 py-3 text-[10px] font-medium text-muted-foreground uppercase">Email</th>
                <th className="text-center px-5 py-3 text-[10px] font-medium text-muted-foreground uppercase">WhatsApp</th>
              </tr></thead>
              <tbody>{notifTypes.map(t => (
                <tr key={t} className="border-b border-border">
                  <td className="px-5 py-3">{t}</td>
                  <td className="px-3 py-3 text-center"><input type="checkbox" defaultChecked className="rounded" /></td>
                  <td className="px-3 py-3 text-center"><input type="checkbox" defaultChecked={Math.random() > 0.3} className="rounded" /></td>
                  <td className="px-5 py-3 text-center"><input type="checkbox" defaultChecked={Math.random() > 0.6} className="rounded" /></td>
                </tr>
              ))}</tbody>
            </table>
          </motion.div>
        </TabsContent>

        <TabsContent value="utm" className="mt-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5 max-w-lg space-y-3">
            <div><label className="text-xs text-muted-foreground">URL Base</label><input value={utmUrl} onChange={e => setUtmUrl(e.target.value)} placeholder="https://seusite.com.br/pagina" className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" /></div>
            <div><label className="text-xs text-muted-foreground">Source</label><input value={utmSource} onChange={e => setUtmSource(e.target.value)} placeholder="google" className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" /></div>
            <div><label className="text-xs text-muted-foreground">Medium</label><input value={utmMedium} onChange={e => setUtmMedium(e.target.value)} placeholder="cpc" className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" /></div>
            <div><label className="text-xs text-muted-foreground">Campaign</label><input value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} placeholder="brand-search" className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" /></div>
            {generatedUrl && (
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">URL Gerada</p>
                <p className="text-xs font-mono break-all">{generatedUrl}</p>
                <button onClick={() => navigator.clipboard.writeText(generatedUrl)} className="mt-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium">Copiar URL</button>
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          {aiLoading ? (
            <div className="p-6 space-y-4">
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              <div className="h-32 bg-muted animate-pulse rounded-xl" />
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5 max-w-lg space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Configurações de IA</p>
              {aiSettings && Object.keys(aiSettings).length > 0 ? (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground">Modo de Operação</label>
                    <select defaultValue={aiSettings.mode ?? aiSettings.operation_mode ?? "assistive"} className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground">
                      <option value="assistive">Assistivo (sugere, humano aprova)</option>
                      <option value="semi_auto">Semi-automático (executa dentro de limites)</option>
                      <option value="full_auto">Totalmente Autônomo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Limite de Budget Autônomo</label>
                    <input type="number" defaultValue={aiSettings.autonomous_budget_limit ?? aiSettings.budget_limit ?? 500} className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Frequência de Análise</label>
                    <select defaultValue={aiSettings.analysis_frequency ?? "daily"} className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground">
                      <option value="hourly">A cada hora</option>
                      <option value="daily">Diária</option>
                      <option value="weekly">Semanal</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked={aiSettings.auto_pause_campaigns ?? true} className="rounded" />
                    <label className="text-sm">Pausar campanhas automaticamente se CPA ultrapassar limite</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked={aiSettings.creative_suggestions ?? true} className="rounded" />
                    <label className="text-sm">Gerar sugestões de criativos automaticamente</label>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"><Save className="h-4 w-4" /> Salvar Configurações IA</button>
                </>
              ) : (
                <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">Nenhuma configuração de IA encontrada.</div>
              )}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="billing" className="mt-4 space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Plano Atual</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">Plano Pro</p>
                <p className="text-sm text-muted-foreground">R$297/mês · Até 10 contas · Relatórios ilimitados</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Fazer Upgrade</button>
            </div>
          </motion.div>
          <div className="bg-card rounded-xl surface-glow overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-[10px] font-medium text-muted-foreground uppercase">Data</th>
                <th className="text-left px-3 py-3 text-[10px] font-medium text-muted-foreground uppercase">Valor</th>
                <th className="text-left px-3 py-3 text-[10px] font-medium text-muted-foreground uppercase">Plano</th>
                <th className="text-left px-5 py-3 text-[10px] font-medium text-muted-foreground uppercase">Status</th>
              </tr></thead>
              <tbody>{faturas.map((f, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-5 py-3">{f.data}</td>
                  <td className="px-3 py-3 font-mono tabular-nums">{f.valor}</td>
                  <td className="px-3 py-3">{f.plano}</td>
                  <td className="px-5 py-3"><span className="text-[10px] font-medium text-success">{f.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default SettingsPage;
