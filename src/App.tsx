import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";

// Auth pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// App pages
import Dashboard from "./pages/Dashboard";
import FunnelPage from "./pages/FunnelPage";
import CampaignsPage from "./pages/CampaignsPage";
import CreativesPage from "./pages/CreativesPage";
import InsightsPage from "./pages/InsightsPage";
import AudiencesPage from "./pages/AudiencesPage";
import CRMPage from "./pages/CRMPage";
import LandingPagesPage from "./pages/LandingPagesPage";
import ABTestsPage from "./pages/ABTestsPage";
import AutomationsPage from "./pages/AutomationsPage";
import FinancialPage from "./pages/FinancialPage";
import AlertsPage from "./pages/AlertsPage";
import ReportsPage from "./pages/ReportsPage";
import CompetitorsPage from "./pages/CompetitorsPage";
import ClientPortalPage from "./pages/ClientPortalPage";
import TasksPage from "./pages/TasksPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import SettingsPage from "./pages/SettingsPage";
import SalesPage from "./pages/SalesPage";
import SearchTermsPage from "./pages/analytics/SearchTermsPage";
import SchedulePage from "./pages/analytics/SchedulePage";
import GeoPage from "./pages/analytics/GeoPage";
import PlacementsPage from "./pages/analytics/PlacementsPage";
import QualityScorePage from "./pages/analytics/QualityScorePage";
import LTVPage from "./pages/analytics/LTVPage";
import SEOPage from "./pages/SEOPage";
import GoalsPage from "./pages/GoalsPage";
import CallTrackingPage from "./pages/CallTrackingPage";
import OfflineConversionsPage from "./pages/OfflineConversionsPage";
import CalendarPage from "./pages/CalendarPage";
import BudgetOptimizerPage from "./pages/BudgetOptimizerPage";
import CustomDashboardPage from "./pages/CustomDashboardPage";
import CustomerJourneyPage from "./pages/CustomerJourneyPage";
import CampaignDetailPage from "./pages/CampaignDetailPage";
import CampaignCreatePage from "./pages/CampaignCreatePage";
import InsightsChatPage from "./pages/InsightsChatPage";
import InsightsOptimizerPage from "./pages/InsightsOptimizerPage";
import ConnectionsCallbackPage from "./pages/ConnectionsCallbackPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/connections/callback" element={<ConnectionsCallbackPage />} />

            {/* Protected app routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/funnel" element={<FunnelPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/campaigns/create" element={<CampaignCreatePage />} />
              <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
              <Route path="/creatives" element={<CreativesPage />} />
              <Route path="/crm" element={<CRMPage />} />
              <Route path="/landing-pages" element={<LandingPagesPage />} />
              <Route path="/ab-tests" element={<ABTestsPage />} />
              <Route path="/automations" element={<AutomationsPage />} />
              <Route path="/financial" element={<FinancialPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/insights/chat" element={<InsightsChatPage />} />
              <Route path="/insights/optimizer" element={<InsightsOptimizerPage />} />
              <Route path="/audiences" element={<AudiencesPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/competitors" element={<CompetitorsPage />} />
              <Route path="/client-portal" element={<ClientPortalPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/seo" element={<SEOPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/call-tracking" element={<CallTrackingPage />} />
              <Route path="/offline-conversions" element={<OfflineConversionsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/budget-optimizer" element={<BudgetOptimizerPage />} />
              <Route path="/dashboard/custom" element={<CustomDashboardPage />} />
              <Route path="/funnel/journey" element={<CustomerJourneyPage />} />
              <Route path="/analytics/search-terms" element={<SearchTermsPage />} />
              <Route path="/analytics/schedule" element={<SchedulePage />} />
              <Route path="/analytics/geo" element={<GeoPage />} />
              <Route path="/analytics/placements" element={<PlacementsPage />} />
              <Route path="/analytics/quality-score" element={<QualityScorePage />} />
              <Route path="/analytics/ltv" element={<LTVPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
