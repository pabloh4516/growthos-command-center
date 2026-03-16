import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Plug, Globe, BarChart3, Users, Layout, MessageSquare, Target, Phone } from "lucide-react";

type Integration = { nome: string; desc: string; icon: any; status: "connected" | "disconnected"; lastSync?: string; badge?: string };

const sections: { label: string; items: Integration[] }[] = [
  { label: "Tráfego Pago", items: [
    { nome: "Google Ads", desc: "Campanhas de pesquisa, display e YouTube", icon: Globe, status: "connected", lastSync: "5min atrás" },
    { nome: "Meta Ads", desc: "Facebook e Instagram Ads", icon: Globe, status: "disconnected" },
    { nome: "TikTok Ads", desc: "Campanhas TikTok For Business", icon: Globe, status: "disconnected" },
    { nome: "YouTube Ads", desc: "Vídeo e discovery ads", icon: Globe, status: "disconnected" },
  ]},
  { label: "Analytics", items: [
    { nome: "Google Analytics 4", desc: "Web analytics e conversões", icon: BarChart3, status: "disconnected" },
    { nome: "Google Tag Manager", desc: "Gerenciamento de tags", icon: BarChart3, status: "disconnected" },
    { nome: "Google Search Console", desc: "Performance orgânica", icon: BarChart3, status: "disconnected" },
  ]},
  { label: "CRM Externo", items: [
    { nome: "HubSpot", desc: "CRM e automação de marketing", icon: Users, status: "disconnected" },
    { nome: "Pipedrive", desc: "Pipeline de vendas", icon: Users, status: "disconnected" },
    { nome: "RD Station", desc: "Marketing e CRM", icon: Users, status: "disconnected" },
  ]},
  { label: "Páginas", items: [
    { nome: "WordPress", desc: "Sites e landing pages", icon: Layout, status: "disconnected" },
    { nome: "Webflow", desc: "Design e landing pages", icon: Layout, status: "disconnected" },
    { nome: "ClickFunnels", desc: "Funis de vendas", icon: Layout, status: "disconnected" },
  ]},
  { label: "Comunicação", items: [
    { nome: "WhatsApp Business API", desc: "Mensagens e templates", icon: MessageSquare, status: "disconnected" },
    { nome: "Email (SendGrid/Resend)", desc: "Emails transacionais", icon: MessageSquare, status: "disconnected" },
  ]},
  { label: "Tracking", items: [
    { nome: "Utmify", desc: "Rastreamento de vendas reais via UTM", icon: Target, status: "connected", lastSync: "15min atrás", badge: "Vendas Reais" },
    { nome: "Pixels (Meta, TikTok, Google)", desc: "Pixels de conversão", icon: Target, status: "disconnected" },
  ]},
  { label: "Call Tracking", items: [
    { nome: "Twilio", desc: "Rastreamento de ligações", icon: Phone, status: "disconnected" },
  ]},
];

const IntegrationsPage = () => (
  <div className="space-y-6 max-w-[1400px]">
    <PageHeader title="Integrações" subtitle="Conecte suas plataformas de ads, analytics e CRM" />
    {sections.map((section) => (
      <div key={section.label}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">{section.label}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {section.items.map((item, i) => (
            <motion.div key={item.nome} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-card rounded-xl surface-glow p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{item.nome}</p>
                  {item.badge && <span className="text-[9px] font-medium bg-success/20 text-success px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                <div className="flex items-center justify-between mt-2">
                  <StatusBadge status={item.status} />
                  {item.lastSync && <span className="text-[10px] text-muted-foreground">{item.lastSync}</span>}
                </div>
                <button className={`mt-2 w-full py-1.5 rounded-md text-xs font-medium transition-colors ${item.status === "connected" ? "bg-secondary hover:bg-secondary/80" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                  {item.status === "connected" ? "Configurar" : "Conectar"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
export default IntegrationsPage;
