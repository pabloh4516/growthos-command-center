import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Plug, Globe, BarChart3, Users, Layout, MessageSquare, Target, Phone, RefreshCw, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useAdAccounts, useIntegrations, useUtmifyConfig } from "@/hooks/use-supabase-data";
import { getGoogleAdsAuthUrl, syncGoogleAds } from "@/services/edge-functions";

type PlatformDef = {
  nome: string;
  desc: string;
  icon: any;
  platform: string;
  badge?: string;
  comingSoon?: boolean;
};

const sections: { label: string; items: PlatformDef[] }[] = [
  {
    label: "Trafego Pago",
    items: [
      { nome: "Google Ads", desc: "Campanhas de pesquisa, display e YouTube", icon: Globe, platform: "google_ads" },
      { nome: "Meta Ads", desc: "Facebook e Instagram Ads", icon: Globe, platform: "meta_ads", comingSoon: true },
      { nome: "TikTok Ads", desc: "Campanhas TikTok For Business", icon: Globe, platform: "tiktok_ads", comingSoon: true },
      { nome: "YouTube Ads", desc: "Video e discovery ads", icon: Globe, platform: "youtube_ads", comingSoon: true },
    ],
  },
  {
    label: "Analytics",
    items: [
      { nome: "Google Analytics 4", desc: "Web analytics e conversoes", icon: BarChart3, platform: "ga4", comingSoon: true },
      { nome: "Google Tag Manager", desc: "Gerenciamento de tags", icon: BarChart3, platform: "gtm", comingSoon: true },
      { nome: "Google Search Console", desc: "Performance organica", icon: BarChart3, platform: "gsc", comingSoon: true },
    ],
  },
  {
    label: "CRM Externo",
    items: [
      { nome: "HubSpot", desc: "CRM e automacao de marketing", icon: Users, platform: "hubspot", comingSoon: true },
      { nome: "Pipedrive", desc: "Pipeline de vendas", icon: Users, platform: "pipedrive", comingSoon: true },
      { nome: "RD Station", desc: "Marketing e CRM", icon: Users, platform: "rd_station", comingSoon: true },
    ],
  },
  {
    label: "Paginas",
    items: [
      { nome: "WordPress", desc: "Sites e landing pages", icon: Layout, platform: "wordpress", comingSoon: true },
      { nome: "Webflow", desc: "Design e landing pages", icon: Layout, platform: "webflow", comingSoon: true },
      { nome: "ClickFunnels", desc: "Funis de vendas", icon: Layout, platform: "clickfunnels", comingSoon: true },
    ],
  },
  {
    label: "Comunicacao",
    items: [
      { nome: "WhatsApp Business API", desc: "Mensagens e templates", icon: MessageSquare, platform: "whatsapp", comingSoon: true },
      { nome: "Email (SendGrid/Resend)", desc: "Emails transacionais", icon: MessageSquare, platform: "email", comingSoon: true },
    ],
  },
  {
    label: "Tracking",
    items: [
      { nome: "Utmify", desc: "Rastreamento de vendas reais via UTM", icon: Target, platform: "utmify", badge: "Vendas Reais" },
      { nome: "Pixels (Meta, TikTok, Google)", desc: "Pixels de conversao", icon: Target, platform: "pixels", comingSoon: true },
    ],
  },
  {
    label: "Call Tracking",
    items: [
      { nome: "Twilio", desc: "Rastreamento de ligacoes", icon: Phone, platform: "twilio", comingSoon: true },
    ],
  },
];

const IntegrationsPage = () => {
  const { currentOrg } = useAuth();
  const orgId = currentOrg?.id ?? null;
  const { data: adAccounts, isLoading: accountsLoading } = useAdAccounts();
  const { data: integrations } = useIntegrations();
  const { data: utmifyConfig } = useUtmifyConfig();

  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null);

  const googleAdsAccounts = (adAccounts ?? []).filter((a: any) => a.platform === "google_ads");
  const hasGoogleAdsConnected = googleAdsAccounts.length > 0;

  const handleConnectGoogleAds = async () => {
    if (!orgId) {
      toast.error("Nenhuma organizacao selecionada");
      return;
    }
    setConnectingGoogle(true);
    try {
      const result = await getGoogleAdsAuthUrl(orgId, window.location.origin + "/connections/callback");
      if (result?.authUrl) {
        window.location.href = result.authUrl;
      } else {
        toast.error("Erro ao obter URL de autorizacao");
      }
    } catch (err: any) {
      console.error("Google Ads auth error:", err);
      toast.error(err?.message || "Erro ao conectar Google Ads");
    } finally {
      setConnectingGoogle(false);
    }
  };

  const handleSync = async (accountId: string) => {
    setSyncingAccountId(accountId);
    try {
      await syncGoogleAds(accountId);
      toast.success("Sincronizacao iniciada com sucesso!");
    } catch (err: any) {
      console.error("Sync error:", err);
      toast.error(err?.message || "Erro ao sincronizar");
    } finally {
      setSyncingAccountId(null);
    }
  };

  const getStatus = (platform: string): "connected" | "disconnected" => {
    if (platform === "google_ads") return hasGoogleAdsConnected ? "connected" : "disconnected";
    if (platform === "utmify") return utmifyConfig ? "connected" : "disconnected";
    const match = (integrations ?? []).find((i: any) => i.platform === platform && i.status === "active");
    return match ? "connected" : "disconnected";
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "agora";
      if (diffMin < 60) return `${diffMin}min atras`;
      const diffH = Math.floor(diffMin / 60);
      if (diffH < 24) return `${diffH}h atras`;
      return d.toLocaleDateString("pt-BR");
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <PageHeader title="Integracoes" subtitle="Conecte suas plataformas de ads, analytics e CRM" />

      {/* Connected Google Ads Accounts */}
      {googleAdsAccounts.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Contas Google Ads Conectadas</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {googleAdsAccounts.map((account: any, i: number) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl surface-glow p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{account.account_name || account.external_account_id || "Conta Google Ads"}</p>
                    {account.external_account_id && (
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">{account.external_account_id}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <StatusBadge status={account.status === "active" ? "connected" : "disconnected"} />
                      {account.last_sync_at && (
                        <span className="text-[10px] text-muted-foreground">
                          Sync: {formatDate(account.last_sync_at)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleSync(account.id)}
                      disabled={syncingAccountId === account.id}
                      className="mt-2 w-full py-1.5 rounded-md text-xs font-medium transition-colors bg-secondary hover:bg-secondary/80 flex items-center justify-center gap-1.5"
                    >
                      {syncingAccountId === account.id ? (
                        <><Loader2 className="h-3 w-3 animate-spin" /> Sincronizando...</>
                      ) : (
                        <><RefreshCw className="h-3 w-3" /> Sincronizar</>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Utmify Webhook Info */}
      {utmifyConfig?.webhook_url_generated && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Utmify - Webhook URL</p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-4">
            <p className="text-xs text-muted-foreground mb-2">Cole esta URL no painel da Utmify para receber vendas reais:</p>
            <div className="bg-secondary rounded-lg p-3 flex items-center gap-2">
              <p className="text-xs font-mono break-all flex-1">{utmifyConfig.webhook_url_generated}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(utmifyConfig.webhook_url_generated);
                  toast.success("URL copiada!");
                }}
                className="shrink-0 p-1.5 rounded-md hover:bg-primary/10 transition-colors"
              >
                <Copy className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* All Platforms */}
      {sections.map((section) => (
        <div key={section.label}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">{section.label}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {section.items.map((item, i) => {
              const status = getStatus(item.platform);
              const isGoogleAds = item.platform === "google_ads";
              const isUtmify = item.platform === "utmify";

              return (
                <motion.div
                  key={item.nome}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-card rounded-xl surface-glow p-4 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{item.nome}</p>
                      {item.badge && (
                        <span className="text-[9px] font-medium bg-success/20 text-success px-1.5 py-0.5 rounded-full">{item.badge}</span>
                      )}
                      {item.comingSoon && (
                        <span className="text-[9px] font-medium bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full">Em breve</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    <div className="flex items-center justify-between mt-2">
                      <StatusBadge status={status} />
                    </div>

                    {isGoogleAds && !hasGoogleAdsConnected && (
                      <button
                        onClick={handleConnectGoogleAds}
                        disabled={connectingGoogle || !orgId}
                        className="mt-2 w-full py-1.5 rounded-md text-xs font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1.5"
                      >
                        {connectingGoogle ? (
                          <><Loader2 className="h-3 w-3 animate-spin" /> Conectando...</>
                        ) : (
                          "Conectar"
                        )}
                      </button>
                    )}

                    {isGoogleAds && hasGoogleAdsConnected && (
                      <button
                        onClick={handleConnectGoogleAds}
                        disabled={connectingGoogle || !orgId}
                        className="mt-2 w-full py-1.5 rounded-md text-xs font-medium transition-colors bg-secondary hover:bg-secondary/80"
                      >
                        Adicionar outra conta
                      </button>
                    )}

                    {isUtmify && (
                      <button
                        disabled
                        className="mt-2 w-full py-1.5 rounded-md text-xs font-medium transition-colors bg-secondary hover:bg-secondary/80"
                      >
                        {status === "connected" ? "Configurado" : "Configurar"}
                      </button>
                    )}

                    {!isGoogleAds && !isUtmify && (
                      <button
                        disabled={item.comingSoon}
                        className={`mt-2 w-full py-1.5 rounded-md text-xs font-medium transition-colors ${
                          item.comingSoon
                            ? "bg-secondary text-muted-foreground cursor-not-allowed opacity-60"
                            : status === "connected"
                            ? "bg-secondary hover:bg-secondary/80"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                      >
                        {item.comingSoon ? "Em breve" : status === "connected" ? "Configurar" : "Conectar"}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IntegrationsPage;
