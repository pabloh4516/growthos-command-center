import {
  LayoutDashboard, Filter, Megaphone, Palette, Layout, FlaskConical,
  Users, ShoppingCart, Phone, Brain, BarChart3, Search, Eye,
  Zap, DollarSign, PieChart, Upload, CalendarDays, Target,
  Bell, FileText, CheckCircle, ExternalLink, Plug, Settings,
  ChevronLeft, ChevronRight, ChevronDown, X
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  badge?: number;
  badgeText?: string;
  children?: { title: string; url: string }[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    label: "Principal",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Funil & Jornada", url: "/funnel", icon: Filter },
      { title: "Campanhas", url: "/campaigns", icon: Megaphone },
    ],
  },
  {
    label: "Conteúdo",
    items: [
      { title: "Criativos", url: "/creatives", icon: Palette },
      { title: "Landing Pages", url: "/landing-pages", icon: Layout },
      { title: "Testes A/B", url: "/ab-tests", icon: FlaskConical },
    ],
  },
  {
    label: "CRM & Vendas",
    items: [
      { title: "Contatos & Pipeline", url: "/crm", icon: Users },
      { title: "Vendas Reais", url: "/sales", icon: ShoppingCart, badgeText: "Utmify" },
      { title: "Call Tracking", url: "/call-tracking", icon: Phone },
    ],
  },
  {
    label: "Analytics",
    items: [
      { title: "Insights & IA", url: "/insights", icon: Brain },
      {
        title: "Analytics Avançado", url: "/analytics", icon: BarChart3,
        children: [
          { title: "Search Terms", url: "/analytics/search-terms" },
          { title: "Horários", url: "/analytics/schedule" },
          { title: "Geográfico", url: "/analytics/geo" },
          { title: "Placements", url: "/analytics/placements" },
          { title: "Quality Score", url: "/analytics/quality-score" },
          { title: "LTV", url: "/analytics/ltv" },
        ],
      },
      { title: "SEO Monitor", url: "/seo", icon: Search },
      { title: "Competidores", url: "/competitors", icon: Eye },
    ],
  },
  {
    label: "Operação",
    items: [
      { title: "Automações", url: "/automations", icon: Zap },
      { title: "Financeiro", url: "/financial", icon: DollarSign },
      { title: "Budget Optimizer", url: "/budget-optimizer", icon: PieChart },
      { title: "Conv. Offline", url: "/offline-conversions", icon: Upload },
      { title: "Calendário", url: "/calendar", icon: CalendarDays },
      { title: "Metas & OKRs", url: "/goals", icon: Target },
    ],
  },
  {
    label: "Gestão",
    items: [
      { title: "Alertas", url: "/alerts", icon: Bell, badge: 5 },
      { title: "Relatórios", url: "/reports", icon: FileText },
      { title: "Equipe & Tarefas", url: "/tasks", icon: CheckCircle },
      { title: "Portal do Cliente", url: "/client-portal", icon: ExternalLink },
      { title: "Públicos-Alvo", url: "/audiences", icon: Users },
      { title: "Integrações", url: "/integrations", icon: Plug },
      { title: "Configurações", url: "/settings", icon: Settings },
    ],
  },
];

interface AppSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const location = useLocation();

  const currentPath = location.pathname;
  const analyticsOpen = currentPath.startsWith("/analytics");

  const handleNavClick = () => {
    // Close mobile sidebar on navigation
    onMobileClose();
  };

  const sidebarContent = (isDesktopCollapsed: boolean) => (
    <>
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border shrink-0">
        {!isDesktopCollapsed && (
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Growth<span className="text-primary">OS</span>
          </span>
        )}
        {isDesktopCollapsed && <span className="text-lg font-semibold text-primary mx-auto">G</span>}

        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 scrollbar-thin">
        {sections.map((section) => (
          <div key={section.label} className="mb-3">
            {!isDesktopCollapsed && (
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest px-3 mb-1">
                {section.label}
              </p>
            )}
            {isDesktopCollapsed && <div className="h-px bg-sidebar-border mx-2 my-2" />}
            {section.items.map((item) => (
              <div key={item.url}>
                {item.children ? (
                  <>
                    {isDesktopCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setOpenSubmenu(openSubmenu === item.url ? null : item.url)}
                            className={`w-full flex items-center justify-center p-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors mb-0.5 ${
                              analyticsOpen ? "text-primary bg-primary/10" : ""
                            }`}
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">{item.title}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <button
                        onClick={() => setOpenSubmenu(openSubmenu === item.url ? null : item.url)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors mb-0.5 ${
                          analyticsOpen ? "text-primary font-medium" : ""
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left">{item.title}</span>
                        <ChevronDown className={`h-3 w-3 transition-transform ${(openSubmenu === item.url || analyticsOpen) ? "rotate-0" : "-rotate-90"}`} />
                      </button>
                    )}
                    {!isDesktopCollapsed && (openSubmenu === item.url || analyticsOpen) && (
                      <div className="ml-6 pl-3 border-l border-border space-y-0.5 mb-1">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.url}
                            to={child.url}
                            onClick={handleNavClick}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                            activeClassName="text-primary font-medium bg-primary/10"
                          >
                            <span>{child.title}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  isDesktopCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === "/"}
                          onClick={handleNavClick}
                          className="flex items-center justify-center p-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors mb-0.5 relative"
                          activeClassName="bg-primary/10 text-primary"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {item.badge && (
                            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-destructive rounded-full" />
                          )}
                        </NavLink>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">{item.title}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      onClick={handleNavClick}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors mb-0.5 relative"
                      activeClassName="bg-primary/10 text-primary font-medium before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-primary before:rounded-full"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto text-[10px] font-medium bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {item.badgeText && (
                        <span className="ml-auto text-[9px] font-medium bg-success/20 text-success px-1.5 py-0.5 rounded-full">
                          {item.badgeText}
                        </span>
                      )}
                    </NavLink>
                  )
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse toggle — desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex h-10 items-center justify-center border-t border-sidebar-border text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        {isDesktopCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex h-screen sticky top-0 flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {sidebarContent(collapsed)}
      </aside>

      {/* Mobile sidebar (slide-in) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent(false)}
      </aside>
    </>
  );
}
