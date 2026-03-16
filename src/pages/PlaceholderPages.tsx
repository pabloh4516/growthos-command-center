import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import {
  Filter, Megaphone, Users, Layout, FlaskConical, Zap, DollarSign,
  Bell, FileText, Eye, ExternalLink, CheckCircle, Plug, Settings
} from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  items?: string[];
}

function PlaceholderPage({ title, subtitle, icon: Icon, items }: PlaceholderPageProps) {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl surface-glow p-12 flex flex-col items-center justify-center text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6">{subtitle}</p>
        {items && (
          <div className="grid grid-cols-2 gap-2 mb-6">
            {items.map((item) => (
              <div key={item} className="text-xs text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg">
                {item}
              </div>
            ))}
          </div>
        )}
        <button className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Começar Configuração
        </button>
      </motion.div>
    </div>
  );
}

export const CRMPage = () => <PlaceholderPage title="CRM" subtitle="Gestão de contatos, pipeline de vendas e lead scoring" icon={Users} items={["Contatos", "Pipeline Kanban", "Lead Scoring", "Timeline"]} />;
export const LandingPagesPage = () => <PlaceholderPage title="Landing Pages" subtitle="Monitore performance e conversão das suas páginas" icon={Layout} items={["Métricas por página", "Bounce rate", "Heatmaps", "A/B Tests"]} />;
export const ABTestsPage = () => <PlaceholderPage title="Testes A/B" subtitle="Crie e gerencie testes A/B para criativos, páginas e audiências" icon={FlaskConical} items={["Significância estatística", "Variantes", "Winner detection", "Sample size"]} />;
export const AutomationsPage = () => <PlaceholderPage title="Automações" subtitle="Sequências de email, fluxos de WhatsApp e regras automáticas" icon={Zap} items={["Email sequences", "WhatsApp flows", "Rules engine", "Triggers"]} />;
export const FinancialPage = () => <PlaceholderPage title="Financeiro" subtitle="Controle de gastos, receita, margens e orçamentos" icon={DollarSign} items={["Ad spend", "Revenue", "Budgets", "ROI real"]} />;
export const AlertsPage = () => <PlaceholderPage title="Alertas" subtitle="Configure alertas para CPA, CTR, conversões e budget" icon={Bell} items={["CPA spike", "CTR drop", "Budget depleting", "Creative fatigue"]} />;
export const ReportsPage = () => <PlaceholderPage title="Relatórios" subtitle="Gere relatórios personalizados em PDF para seus clientes" icon={FileText} items={["Templates", "Agendamento", "White-label", "Exportar PDF"]} />;
export const CompetitorsPage = () => <PlaceholderPage title="Competidores" subtitle="Monitore anúncios e estratégias dos concorrentes" icon={Eye} items={["Ad Library", "Benchmarks", "New ads alerts", "Analysis"]} />;
export const ClientPortalPage = () => <PlaceholderPage title="Portal do Cliente" subtitle="Dashboard simplificado e aprovação de criativos para clientes" icon={ExternalLink} items={["Dashboard simples", "Aprovações", "Chat", "Relatórios"]} />;
export const TasksPage = () => <PlaceholderPage title="Equipe & Tarefas" subtitle="Gerencie tarefas e atividades da equipe" icon={CheckCircle} items={["Kanban board", "Atribuição", "Prioridades", "Activity log"]} />;
export const IntegrationsPage = () => <PlaceholderPage title="Integrações" subtitle="Conecte suas plataformas de ads, analytics e CRM" icon={Plug} items={["Google Ads", "Meta Ads", "TikTok Ads", "GA4"]} />;
export const SettingsPage = () => <PlaceholderPage title="Configurações" subtitle="Workspace, membros, API keys e preferências" icon={Settings} items={["Workspace", "Membros", "API Keys", "Webhooks"]} />;
