import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Copy, Check, Save, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useAISettings, useUpdateAISettings } from "@/hooks/use-supabase-data";
import { supabase } from "@/integrations/supabase/client";

// ---------------------------------------------------------------------------
// Static data for API keys & billing (kept as-is)
// ---------------------------------------------------------------------------

const apiKeys = [
  { nome: "Production Key", key: "sk_live_****4f8a", permissoes: ["read", "write"], ultimoUso: "20/01 14:30", expiracao: "01/06/2025" },
  { nome: "Test Key", key: "sk_test_****9b2c", permissoes: ["read"], ultimoUso: "18/01 09:00", expiracao: "01/03/2025" },
];

const faturas = [
  { data: "01/01/2025", valor: "R$ 297,00", status: "Pago", plano: "Pro" },
  { data: "01/12/2024", valor: "R$ 297,00", status: "Pago", plano: "Pro" },
  { data: "01/11/2024", valor: "R$ 197,00", status: "Pago", plano: "Starter" },
];

const notifTypes = ["CPA spike", "CTR drop", "Budget esgotando", "Campanha parou", "Criativo fadiga", "Relatorio pronto", "Lead quente", "Churn risk"];

const papelColors: Record<string, string> = {
  owner: "bg-purple-500/20 text-purple-400",
  admin: "bg-primary/20 text-primary",
  analyst: "bg-success/20 text-success",
  viewer: "bg-secondary text-muted-foreground",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SettingsPage = () => {
  const { currentOrg, user } = useAuth();
  const orgId = currentOrg?.id ?? null;

  // ------ Workspace ------
  const [wsName, setWsName] = useState(currentOrg?.name ?? "");
  const [wsTimezone, setWsTimezone] = useState(currentOrg?.timezone ?? "America/Sao_Paulo");
  const [wsCurrency, setWsCurrency] = useState(currentOrg?.currency ?? "BRL");
  const [wsSaving, setWsSaving] = useState(false);

  useEffect(() => {
    if (currentOrg) {
      setWsName(currentOrg.name);
      setWsTimezone(currentOrg.timezone);
      setWsCurrency(currentOrg.currency);
    }
  }, [currentOrg]);

  const handleSaveWorkspace = async () => {
    if (!orgId) return;
    setWsSaving(true);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({ name: wsName, timezone: wsTimezone, currency: wsCurrency } as any)
        .eq("id", orgId);
      if (error) throw error;
      toast.success("Workspace salvo com sucesso!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao salvar workspace");
    } finally {
      setWsSaving(false);
    }
  };

  // ------ Members ------
  type MemberRow = { id: string; nome: string; email: string; papel: string; status: string; entrada: string };
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    setMembersLoading(true);
    supabase
      .from("organization_members")
      .select("id, user_id, role, accepted_at, created_at, user_profiles:user_id(name, email)" as any)
      .eq("organization_id", orgId)
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          setMembersLoading(false);
          return;
        }
        const rows: MemberRow[] = (data ?? []).map((m: any) => ({
          id: m.id ?? m.user_id,
          nome: m.user_profiles?.name ?? "Sem nome",
          email: m.user_profiles?.email ?? "-",
          papel: m.role ?? "viewer",
          status: m.accepted_at ? "Ativo" : "Pendente",
          entrada: m.created_at ? new Date(m.created_at).toLocaleDateString("pt-BR") : "-",
        }));
        setMembers(rows);
        setMembersLoading(false);
      });
  }, [orgId]);

  const membrosCols: ColumnDef<MemberRow, any>[] = [
    { accessorKey: "nome", header: "Nome" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "papel",
      header: "Papel",
      cell: ({ getValue }) => {
        const v = getValue() as string;
        return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${papelColors[v] || papelColors.viewer}`}>{v}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const v = getValue() as string;
        return <span className={`text-[10px] font-medium ${v === "Ativo" ? "text-success" : "text-warning"}`}>{v}</span>;
      },
    },
    { accessorKey: "entrada", header: "Entrada" },
  ];

  const handleInvite = async () => {
    if (!orgId || !inviteEmail) {
      toast.error("Preencha o email para convidar");
      return;
    }
    setInviting(true);
    try {
      // Look up user by email
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("email", inviteEmail)
        .maybeSingle();

      if (!profile) {
        toast.error("Usuario nao encontrado. O usuario precisa criar uma conta primeiro.");
        setInviting(false);
        return;
      }

      const { error } = await supabase.from("organization_members").insert({
        organization_id: orgId,
        user_id: profile.id,
        role: inviteRole,
      } as any);

      if (error) throw error;

      toast.success(`Convite enviado para ${inviteEmail}!`);
      setInviteEmail("");
      // Refresh members list
      const { data: refreshed } = await supabase
        .from("organization_members")
        .select("id, user_id, role, accepted_at, created_at, user_profiles:user_id(name, email)" as any)
        .eq("organization_id", orgId);
      if (refreshed) {
        setMembers(
          (refreshed as any[]).map((m: any) => ({
            id: m.id ?? m.user_id,
            nome: m.user_profiles?.name ?? "Sem nome",
            email: m.user_profiles?.email ?? "-",
            papel: m.role ?? "viewer",
            status: m.accepted_at ? "Ativo" : "Pendente",
            entrada: m.created_at ? new Date(m.created_at).toLocaleDateString("pt-BR") : "-",
          }))
        );
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao convidar membro");
    } finally {
      setInviting(false);
    }
  };

  // ------ AI Settings ------
  const { data: aiSettingsData, isLoading: aiLoading } = useAISettings();
  const updateAIMutation = useUpdateAISettings();

  const [aiMode, setAiMode] = useState("assistive");
  const [aiBudgetLimit, setAiBudgetLimit] = useState(500);
  const [aiFrequency, setAiFrequency] = useState("daily");
  const [aiAutoPause, setAiAutoPause] = useState(true);
  const [aiCreativeSuggestions, setAiCreativeSuggestions] = useState(true);
  const [aiAutoExecute, setAiAutoExecute] = useState(false);
  const [aiTargetRoas, setAiTargetRoas] = useState(3);
  const [aiMaxCpa, setAiMaxCpa] = useState(100);
  const [aiMaxBudgetChangePct, setAiMaxBudgetChangePct] = useState(20);
  const aiInitRef = useRef(false);

  useEffect(() => {
    if (aiSettingsData && !aiInitRef.current) {
      const s = aiSettingsData as any;
      setAiMode(s.mode ?? s.operation_mode ?? "assistive");
      setAiBudgetLimit(s.autonomous_budget_limit ?? s.budget_limit ?? 500);
      setAiFrequency(s.analysis_frequency ?? "daily");
      setAiAutoPause(s.auto_pause_campaigns ?? true);
      setAiCreativeSuggestions(s.creative_suggestions ?? true);
      setAiAutoExecute(s.auto_execute ?? false);
      setAiTargetRoas(s.target_roas ?? 3);
      setAiMaxCpa(s.max_cpa ?? 100);
      setAiMaxBudgetChangePct(s.max_budget_change_pct ?? 20);
      aiInitRef.current = true;
    }
  }, [aiSettingsData]);

  const handleSaveAI = async () => {
    try {
      await updateAIMutation.mutateAsync({
        operation_mode: aiMode,
        autonomous_budget_limit: aiBudgetLimit,
        analysis_frequency: aiFrequency,
        auto_pause_campaigns: aiAutoPause,
        creative_suggestions: aiCreativeSuggestions,
        auto_execute: aiAutoExecute,
        target_roas: aiTargetRoas,
        max_cpa: aiMaxCpa,
        max_budget_change_pct: aiMaxBudgetChangePct,
      });
      toast.success("Configuracoes de IA salvas!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao salvar configuracoes de IA");
    }
  };

  // ------ Notifications ------
  type NotifSettings = Record<string, { dashboard: boolean; email: boolean; whatsapp: boolean }>;
  const [notifSettings, setNotifSettings] = useState<NotifSettings>(() => {
    const initial: NotifSettings = {};
    for (const t of notifTypes) {
      initial[t] = { dashboard: true, email: true, whatsapp: false };
    }
    return initial;
  });
  const [notifSaving, setNotifSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("user_preferences" as any)
      .select("notification_settings")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data?.notification_settings) {
          try {
            const parsed = typeof data.notification_settings === "string" ? JSON.parse(data.notification_settings) : data.notification_settings;
            setNotifSettings((prev) => ({ ...prev, ...parsed }));
          } catch {}
        }
      });
  }, [user?.id]);

  const handleNotifChange = (type: string, channel: "dashboard" | "email" | "whatsapp", checked: boolean) => {
    setNotifSettings((prev) => ({
      ...prev,
      [type]: { ...prev[type], [channel]: checked },
    }));
  };

  const handleSaveNotifications = async () => {
    if (!user?.id) return;
    setNotifSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("user_preferences")
        .upsert(
          { user_id: user.id, notification_settings: notifSettings },
          { onConflict: "user_id" }
        );
      if (error) throw error;
      toast.success("Preferencias de notificacao salvas!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao salvar notificacoes");
    } finally {
      setNotifSaving(false);
    }
  };

  // ------ UTM Builder ------
  const [utmUrl, setUtmUrl] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmSaving, setUtmSaving] = useState(false);

  const generatedUrl = utmUrl ? `${utmUrl}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}` : "";

  const handleSaveUtm = async () => {
    if (!orgId || !generatedUrl) return;
    setUtmSaving(true);
    try {
      const { error } = await (supabase as any).from("utm_templates").insert({
        organization_id: orgId,
        base_url: utmUrl,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        generated_url: generatedUrl,
      });
      if (error) throw error;
      toast.success("Template UTM salvo!");
      setUtmUrl("");
      setUtmSource("");
      setUtmMedium("");
      setUtmCampaign("");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao salvar template UTM");
    } finally {
      setUtmSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <PageHeader title="Configuracoes" subtitle="Workspace, membros, API keys e preferencias" />
      <Tabs defaultValue="workspace">
        <TabsList className="flex-wrap">
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="membros">Membros</TabsTrigger>
          <TabsTrigger value="apikeys">API Keys</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificacoes</TabsTrigger>
          <TabsTrigger value="utm">UTM Builder</TabsTrigger>
          <TabsTrigger value="ai">IA</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* ---- Workspace ---- */}
        <TabsContent value="workspace" className="mt-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5 max-w-lg space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Nome da Organizacao</label>
              <input
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Timezone</label>
              <select
                value={wsTimezone}
                onChange={(e) => setWsTimezone(e.target.value)}
                className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground"
              >
                <option value="America/Sao_Paulo">America/Sao_Paulo (BRT)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Chicago">America/Chicago (CST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Europe/Lisbon">Europe/Lisbon (WET)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Moeda</label>
              <select
                value={wsCurrency}
                onChange={(e) => setWsCurrency(e.target.value)}
                className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground"
              >
                <option value="BRL">BRL (R$)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <button
              onClick={handleSaveWorkspace}
              disabled={wsSaving}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {wsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar
            </button>
          </motion.div>
        </TabsContent>

        {/* ---- Members ---- */}
        <TabsContent value="membros" className="mt-4 space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-4 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground">Email do novo membro</label>
              <input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Papel</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="mt-1 h-9 px-3 text-sm bg-secondary border-none rounded-lg text-foreground"
              >
                <option value="admin">Admin</option>
                <option value="analyst">Analyst</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <button
              onClick={handleInvite}
              disabled={inviting}
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Convidar
            </button>
          </motion.div>
          {membersLoading ? (
            <div className="p-6 space-y-3">
              <div className="h-6 w-40 bg-muted animate-pulse rounded" />
              <div className="h-32 bg-muted animate-pulse rounded-xl" />
            </div>
          ) : (
            <DataTable data={members} columns={membrosCols} searchPlaceholder="Buscar membro..." />
          )}
        </TabsContent>

        {/* ---- API Keys ---- */}
        <TabsContent value="apikeys" className="mt-4 space-y-3">
          {apiKeys.map((k) => (
            <motion.div key={k.nome} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{k.nome}</p>
                <p className="text-xs font-mono text-muted-foreground mt-1">{k.key}</p>
                <div className="flex gap-1 mt-1">
                  {k.permissoes.map((p) => (
                    <span key={p} className="text-[9px] bg-secondary px-1.5 py-0.5 rounded">{p}</span>
                  ))}
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Ultimo uso: {k.ultimoUso}</p>
                <p>Expira: {k.expiracao}</p>
              </div>
            </motion.div>
          ))}
        </TabsContent>

        {/* ---- Notifications ---- */}
        <TabsContent value="notificacoes" className="mt-4 space-y-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-[10px] font-medium text-muted-foreground uppercase">Tipo</th>
                  <th className="text-center px-3 py-3 text-[10px] font-medium text-muted-foreground uppercase">Dashboard</th>
                  <th className="text-center px-3 py-3 text-[10px] font-medium text-muted-foreground uppercase">Email</th>
                  <th className="text-center px-5 py-3 text-[10px] font-medium text-muted-foreground uppercase">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {notifTypes.map((t) => (
                  <tr key={t} className="border-b border-border">
                    <td className="px-5 py-3">{t}</td>
                    <td className="px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={notifSettings[t]?.dashboard ?? true}
                        onChange={(e) => handleNotifChange(t, "dashboard", e.target.checked)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={notifSettings[t]?.email ?? false}
                        onChange={(e) => handleNotifChange(t, "email", e.target.checked)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={notifSettings[t]?.whatsapp ?? false}
                        onChange={(e) => handleNotifChange(t, "whatsapp", e.target.checked)}
                        className="rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
          <button
            onClick={handleSaveNotifications}
            disabled={notifSaving}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            {notifSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Notificacoes
          </button>
        </TabsContent>

        {/* ---- UTM Builder ---- */}
        <TabsContent value="utm" className="mt-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5 max-w-lg space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">URL Base</label>
              <input value={utmUrl} onChange={(e) => setUtmUrl(e.target.value)} placeholder="https://seusite.com.br/pagina" className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Source</label>
              <input value={utmSource} onChange={(e) => setUtmSource(e.target.value)} placeholder="google" className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Medium</label>
              <input value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)} placeholder="cpc" className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Campaign</label>
              <input value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} placeholder="brand-search" className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            {generatedUrl && (
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">URL Gerada</p>
                <p className="text-xs font-mono break-all">{generatedUrl}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedUrl);
                      toast.success("URL copiada!");
                    }}
                    className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium"
                  >
                    Copiar URL
                  </button>
                  <button
                    onClick={handleSaveUtm}
                    disabled={utmSaving}
                    className="px-3 py-1.5 rounded-md bg-secondary text-foreground text-xs font-medium border border-border hover:bg-secondary/80 flex items-center gap-1.5"
                  >
                    {utmSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Salvar Template
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* ---- AI Settings ---- */}
        <TabsContent value="ai" className="mt-4">
          {aiLoading ? (
            <div className="p-6 space-y-4">
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              <div className="h-32 bg-muted animate-pulse rounded-xl" />
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5 max-w-lg space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Configuracoes de IA</p>
              {aiSettingsData && Object.keys(aiSettingsData).length > 0 ? (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground">Modo de Operacao</label>
                    <select value={aiMode} onChange={(e) => setAiMode(e.target.value)} className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground">
                      <option value="assistive">Assistivo (sugere, humano aprova)</option>
                      <option value="semi_auto">Semi-automatico (executa dentro de limites)</option>
                      <option value="full_auto">Totalmente Autonomo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Limite de Budget Autonomo</label>
                    <input type="number" value={aiBudgetLimit} onChange={(e) => setAiBudgetLimit(Number(e.target.value))} className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Target ROAS</label>
                    <input type="number" step="0.1" value={aiTargetRoas} onChange={(e) => setAiTargetRoas(Number(e.target.value))} className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">CPA Maximo</label>
                    <input type="number" value={aiMaxCpa} onChange={(e) => setAiMaxCpa(Number(e.target.value))} className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Max % Mudanca de Budget</label>
                    <input type="number" value={aiMaxBudgetChangePct} onChange={(e) => setAiMaxBudgetChangePct(Number(e.target.value))} className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Frequencia de Analise</label>
                    <select value={aiFrequency} onChange={(e) => setAiFrequency(e.target.value)} className="mt-1 h-9 w-full px-3 text-sm bg-secondary border-none rounded-lg text-foreground">
                      <option value="hourly">A cada hora</option>
                      <option value="daily">Diaria</option>
                      <option value="weekly">Semanal</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={aiAutoExecute} onChange={(e) => setAiAutoExecute(e.target.checked)} className="rounded" />
                    <label className="text-sm">Executar decisoes de IA automaticamente</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={aiAutoPause} onChange={(e) => setAiAutoPause(e.target.checked)} className="rounded" />
                    <label className="text-sm">Pausar campanhas automaticamente se CPA ultrapassar limite</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={aiCreativeSuggestions} onChange={(e) => setAiCreativeSuggestions(e.target.checked)} className="rounded" />
                    <label className="text-sm">Gerar sugestoes de criativos automaticamente</label>
                  </div>
                  <button
                    onClick={handleSaveAI}
                    disabled={updateAIMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    {updateAIMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Salvar Configuracoes IA
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">Nenhuma configuracao de IA encontrada.</div>
              )}
            </motion.div>
          )}
        </TabsContent>

        {/* ---- Billing ---- */}
        <TabsContent value="billing" className="mt-4 space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Plano Atual</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">Plano Pro</p>
                <p className="text-sm text-muted-foreground">R$297/mes - Ate 10 contas - Relatorios ilimitados</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Fazer Upgrade</button>
            </div>
          </motion.div>
          <div className="bg-card rounded-xl surface-glow overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-[10px] font-medium text-muted-foreground uppercase">Data</th>
                  <th className="text-left px-3 py-3 text-[10px] font-medium text-muted-foreground uppercase">Valor</th>
                  <th className="text-left px-3 py-3 text-[10px] font-medium text-muted-foreground uppercase">Plano</th>
                  <th className="text-left px-5 py-3 text-[10px] font-medium text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {faturas.map((f, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-5 py-3">{f.data}</td>
                    <td className="px-3 py-3 font-mono tabular-nums">{f.valor}</td>
                    <td className="px-3 py-3">{f.plano}</td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-medium text-success">{f.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
