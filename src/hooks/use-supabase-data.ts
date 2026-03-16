import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as queries from '@/services/supabase-queries';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function useOrgId() {
  return queries.getCurrentOrgId();
}

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------

export function useCampaigns() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['campaigns', orgId],
    queryFn: () => queries.fetchCampaigns(orgId!),
    enabled: !!orgId,
  });
}

export function useCampaignById(id: string | undefined) {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => queries.fetchCampaignById(id!),
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  const orgId = useOrgId();
  return useMutation({
    mutationFn: (campaign: Parameters<typeof queries.createCampaign>[1]) =>
      queries.createCampaign(orgId!, campaign),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns', orgId] });
    },
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  const orgId = useOrgId();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) =>
      queries.updateCampaign(id, updates),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['campaigns', orgId] });
      qc.invalidateQueries({ queryKey: ['campaign', vars.id] });
    },
  });
}

// ---------------------------------------------------------------------------
// Utmify Sales
// ---------------------------------------------------------------------------

export function useUtmifySales(filters?: queries.UtmifySalesFilters) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['utmify-sales', orgId, filters],
    queryFn: () => queries.fetchUtmifySales(orgId!, filters),
    enabled: !!orgId,
  });
}

export function useUtmifyConfig() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['utmify-config', orgId],
    queryFn: () => queries.fetchUtmifyConfig(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export function useContacts() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['contacts', orgId],
    queryFn: () => queries.fetchContacts(orgId!),
    enabled: !!orgId,
  });
}

export function useContactById(id: string | undefined) {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: () => queries.fetchContactById(id!),
    enabled: !!id,
  });
}

// ---------------------------------------------------------------------------
// Dashboard Metrics
// ---------------------------------------------------------------------------

export function useDashboardMetrics(period: string = '30d') {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['dashboard-metrics', orgId, period],
    queryFn: () => queries.fetchDashboardMetrics(orgId!, period),
    enabled: !!orgId,
  });
}

export function useTopCampaigns(limit = 5) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['top-campaigns', orgId, limit],
    queryFn: () => queries.fetchTopCampaigns(orgId!, limit),
    enabled: !!orgId,
  });
}

export function useConversionsByPlatform() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['conversions-by-platform', orgId],
    queryFn: () => queries.fetchConversionsByPlatform(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Insights
// ---------------------------------------------------------------------------

export function useInsights() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['insights', orgId],
    queryFn: () => queries.fetchInsights(orgId!),
    enabled: !!orgId,
  });
}

export function useUpdateInsightStatus() {
  const qc = useQueryClient();
  const orgId = useOrgId();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      queries.updateInsightStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['insights', orgId] });
    },
  });
}

// ---------------------------------------------------------------------------
// AI Decisions
// ---------------------------------------------------------------------------

export function useAIDecisions() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['ai-decisions', orgId],
    queryFn: () => queries.fetchAIDecisions(orgId!),
    enabled: !!orgId,
  });
}

export function useUpdateAIDecisionStatus() {
  const qc = useQueryClient();
  const orgId = useOrgId();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      queries.updateAIDecisionStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-decisions', orgId] });
    },
  });
}

// ---------------------------------------------------------------------------
// AI Analyses
// ---------------------------------------------------------------------------

export function useAIAnalyses() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['ai-analyses', orgId],
    queryFn: () => queries.fetchAIAnalyses(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// AI Chat
// ---------------------------------------------------------------------------

export function useChatMessages(conversationId: string | undefined) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['chat-messages', orgId, conversationId],
    queryFn: () => queries.fetchChatMessages(orgId!, conversationId!),
    enabled: !!orgId && !!conversationId,
    refetchInterval: 5000, // poll every 5s for new messages
  });
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export function useAlerts() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['alerts', orgId],
    queryFn: () => queries.fetchAlerts(orgId!),
    enabled: !!orgId,
  });
}

export function useUpdateAlertStatus() {
  const qc = useQueryClient();
  const orgId = useOrgId();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      queries.updateAlertStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts', orgId] });
    },
  });
}

export function useAlertRules() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['alert-rules', orgId],
    queryFn: () => queries.fetchAlertRules(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Ad Accounts
// ---------------------------------------------------------------------------

export function useAdAccounts() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['ad-accounts', orgId],
    queryFn: () => queries.fetchAdAccounts(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Creatives
// ---------------------------------------------------------------------------

export function useCreatives() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['creatives', orgId],
    queryFn: () => queries.fetchCreatives(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Funnels
// ---------------------------------------------------------------------------

export function useFunnels() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['funnels', orgId],
    queryFn: () => queries.fetchFunnels(orgId!),
    enabled: !!orgId,
  });
}

export function useFunnelSnapshots(funnelId: string | undefined) {
  return useQuery({
    queryKey: ['funnel-snapshots', funnelId],
    queryFn: () => queries.fetchFunnelSnapshots(funnelId!),
    enabled: !!funnelId,
  });
}

// ---------------------------------------------------------------------------
// Audiences
// ---------------------------------------------------------------------------

export function useAudiences() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['audiences', orgId],
    queryFn: () => queries.fetchAudiences(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export function useTasks() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['tasks', orgId],
    queryFn: () => queries.fetchTasks(orgId!),
    enabled: !!orgId,
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  const orgId = useOrgId();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) =>
      queries.updateTask(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', orgId] });
    },
  });
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

export function useGoals() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['goals', orgId],
    queryFn: () => queries.fetchGoals(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Financial
// ---------------------------------------------------------------------------

export function useFinancialRecords() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['financial-records', orgId],
    queryFn: () => queries.fetchFinancialRecords(orgId!),
    enabled: !!orgId,
  });
}

export function useBudgets() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['budgets', orgId],
    queryFn: () => queries.fetchBudgets(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Integrations
// ---------------------------------------------------------------------------

export function useIntegrations() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['integrations', orgId],
    queryFn: () => queries.fetchIntegrations(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

export function useCalendarEvents() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['calendar-events', orgId],
    queryFn: () => queries.fetchCalendarEvents(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Competitors
// ---------------------------------------------------------------------------

export function useCompetitors() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['competitors', orgId],
    queryFn: () => queries.fetchCompetitors(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Automations
// ---------------------------------------------------------------------------

export function useAutomationRules() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['automation-rules', orgId],
    queryFn: () => queries.fetchAutomationRules(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// A/B Tests
// ---------------------------------------------------------------------------

export function useABTests() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['ab-tests', orgId],
    queryFn: () => queries.fetchABTests(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Landing Pages
// ---------------------------------------------------------------------------

export function useLandingPages() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['landing-pages', orgId],
    queryFn: () => queries.fetchLandingPages(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Deals / Pipeline
// ---------------------------------------------------------------------------

export function useDeals() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['deals', orgId],
    queryFn: () => queries.fetchDeals(orgId!),
    enabled: !!orgId,
  });
}

export function usePipelines() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['pipelines', orgId],
    queryFn: () => queries.fetchPipelines(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------

export function useSEOKeywords() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['seo-keywords', orgId],
    queryFn: () => queries.fetchSEOKeywords(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// AI Settings
// ---------------------------------------------------------------------------

export function useAISettings() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['ai-settings', orgId],
    queryFn: () => queries.fetchAISettings(orgId!),
    enabled: !!orgId,
  });
}

export function useUpdateAISettings() {
  const qc = useQueryClient();
  const orgId = useOrgId();
  return useMutation({
    mutationFn: (updates: Record<string, unknown>) =>
      queries.updateAISettings(orgId!, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-settings', orgId] });
    },
  });
}

// ---------------------------------------------------------------------------
// Analytics: Search Terms
// ---------------------------------------------------------------------------

export function useSearchTerms() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['search-terms', orgId],
    queryFn: () => queries.fetchSearchTerms(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Analytics: Metrics by Hour (Schedule)
// ---------------------------------------------------------------------------

export function useMetricsByHour() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['metrics-by-hour', orgId],
    queryFn: () => queries.fetchMetricsByHour(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Analytics: Metrics by Geo
// ---------------------------------------------------------------------------

export function useMetricsByGeo() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['metrics-by-geo', orgId],
    queryFn: () => queries.fetchMetricsByGeo(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Analytics: Placements
// ---------------------------------------------------------------------------

export function usePlacements() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['placements', orgId],
    queryFn: () => queries.fetchPlacements(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Analytics: Quality Score Keywords
// ---------------------------------------------------------------------------

export function useQualityScoreKeywords() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['quality-score-keywords', orgId],
    queryFn: () => queries.fetchQualityScoreKeywords(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Analytics: LTV Data
// ---------------------------------------------------------------------------

export function useLTVData() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['ltv-data', orgId],
    queryFn: () => queries.fetchLTVData(orgId!),
    enabled: !!orgId,
  });
}

// ---------------------------------------------------------------------------
// Optimization Logs
// ---------------------------------------------------------------------------

export function useOptimizationLogs() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['optimization-logs', orgId],
    queryFn: () => queries.fetchOptimizationLogs(orgId!),
    enabled: !!orgId,
  });
}
