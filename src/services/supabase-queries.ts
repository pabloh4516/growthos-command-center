import { supabase } from '@/integrations/supabase/client';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Read the current organisation id that AuthContext persists in localStorage */
export function getCurrentOrgId(): string | null {
  return localStorage.getItem('growthOS_current_org');
}

/** Small guard so every query can bail early when org is missing */
function requireOrg(orgId: string | null): asserts orgId is string {
  if (!orgId) throw new Error('No organisation selected');
}

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------

export async function fetchCampaigns(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchCampaignById(id: string) {
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      ad_groups (
        id, external_id, name, status, impressions, clicks, cost, conversions
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCampaign(orgId: string, campaign: {
  ad_account_id: string;
  platform: string;
  external_id: string;
  name: string;
  objective?: string;
  status?: string;
  daily_budget?: number;
  lifetime_budget?: number;
  start_date?: string;
  end_date?: string;
}) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('campaigns')
    .insert({ ...campaign, organization_id: orgId } as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCampaign(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Utmify Sales (Vendas Reais)
// ---------------------------------------------------------------------------

export interface UtmifySalesFilters {
  status?: string;
  utm_source?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export async function fetchUtmifySales(orgId: string, filters?: UtmifySalesFilters) {
  requireOrg(orgId);
  let query = supabase
    .from('utmify_sales')
    .select(`
      *,
      campaigns:matched_campaign_id ( id, name, platform )
    `)
    .eq('organization_id', orgId)
    .order('sale_date', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status as any);
  }
  if (filters?.utm_source) {
    query = query.eq('utm_source', filters.utm_source);
  }
  if (filters?.dateFrom) {
    query = query.gte('sale_date', filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte('sale_date', filters.dateTo);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchUtmifyConfig(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('utmify_config')
    .select('*')
    .eq('organization_id', orgId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
}

// ---------------------------------------------------------------------------
// Contacts (CRM)
// ---------------------------------------------------------------------------

export async function fetchContacts(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('organization_id', orgId)
    .order('last_activity_at', { ascending: false })
    .limit(500);

  if (error) throw error;
  return data;
}

export async function fetchContactById(id: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select(`
      *,
      contact_timeline ( id, event_type, event_data, timestamp )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Dashboard Metrics (aggregated from metrics_daily)
// ---------------------------------------------------------------------------

export async function fetchDashboardMetrics(orgId: string, period: string) {
  requireOrg(orgId);

  // Derive a date range from the period label
  const now = new Date();
  let daysBack = 30;
  if (period === '7d') daysBack = 7;
  else if (period === '14d') daysBack = 14;
  else if (period === '90d') daysBack = 90;

  const fromDate = new Date(now);
  fromDate.setDate(fromDate.getDate() - daysBack);
  const fromStr = fromDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('metrics_daily')
    .select('*')
    .eq('organization_id', orgId)
    .gte('date', fromStr)
    .order('date', { ascending: true });

  if (error) throw error;

  // Aggregate totals
  const totals = (data ?? []).reduce(
    (acc, row) => {
      acc.impressions += Number(row.impressions ?? 0);
      acc.clicks += Number(row.clicks ?? 0);
      acc.cost += Number(row.cost ?? 0);
      acc.conversions += Number(row.conversions ?? 0);
      acc.revenue += Number(row.revenue ?? 0);
      acc.real_sales += Number(row.real_sales ?? 0);
      acc.real_revenue += Number(row.real_revenue ?? 0);
      return acc;
    },
    { impressions: 0, clicks: 0, cost: 0, conversions: 0, revenue: 0, real_sales: 0, real_revenue: 0 },
  );

  const roas = totals.cost > 0 ? totals.revenue / totals.cost : 0;
  const cpa = totals.conversions > 0 ? totals.cost / totals.conversions : 0;

  return {
    totals: { ...totals, roas, cpa },
    daily: data ?? [],
  };
}

/** Fetch top campaigns ordered by real ROAS (or google ROAS) */
export async function fetchTopCampaigns(orgId: string, limit = 5) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('organization_id', orgId)
    .order('real_roas', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/** Aggregate conversions grouped by platform */
export async function fetchConversionsByPlatform(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('campaigns')
    .select('platform, google_conversions, real_sales_count')
    .eq('organization_id', orgId);

  if (error) throw error;

  const byPlatform: Record<string, { conversions: number }> = {};
  for (const row of data ?? []) {
    const key = row.platform ?? 'unknown';
    if (!byPlatform[key]) byPlatform[key] = { conversions: 0 };
    byPlatform[key].conversions += Number(row.google_conversions ?? 0);
  }

  return Object.entries(byPlatform).map(([platform, vals]) => ({
    platform,
    conversions: vals.conversions,
  }));
}

// ---------------------------------------------------------------------------
// Insights
// ---------------------------------------------------------------------------

export async function fetchInsights(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

export async function updateInsightStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('insights')
    .update({ status } as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// AI Decisions
// ---------------------------------------------------------------------------

export async function fetchAIDecisions(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('ai_decisions')
    .select(`
      *,
      campaigns:campaign_id ( id, name, platform )
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

export async function updateAIDecisionStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('ai_decisions')
    .update({ status } as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// AI Analyses
// ---------------------------------------------------------------------------

export async function fetchAIAnalyses(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('ai_analyses')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// AI Chat — messages are read from the table but sending goes through the
// edge function (see edge-functions.ts).
// ---------------------------------------------------------------------------

export async function fetchChatMessages(orgId: string, conversationId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('ai_chat_messages')
    .select('*')
    .eq('organization_id', orgId)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export async function fetchAlerts(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('organization_id', orgId)
    .order('triggered_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data;
}

export async function updateAlertStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('alerts')
    .update({ status } as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchAlertRules(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('alert_rules')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Ad Accounts
// ---------------------------------------------------------------------------

export async function fetchAdAccounts(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('ad_accounts')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Creatives
// ---------------------------------------------------------------------------

export async function fetchCreatives(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('creative_library')
    .select(`
      *,
      creative_performance ( impressions, clicks, ctr, conversions, cpa, roas )
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Funnels
// ---------------------------------------------------------------------------

export async function fetchFunnels(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('funnels')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchFunnelSnapshots(funnelId: string) {
  const { data, error } = await supabase
    .from('funnel_snapshots')
    .select('*')
    .eq('funnel_id', funnelId)
    .order('date', { ascending: false })
    .limit(30);

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Audiences
// ---------------------------------------------------------------------------

export async function fetchAudiences(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('audiences')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export async function fetchTasks(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

export async function fetchGoals(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Financial
// ---------------------------------------------------------------------------

export async function fetchFinancialRecords(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('financial_records')
    .select('*')
    .eq('organization_id', orgId)
    .order('date', { ascending: false })
    .limit(200);

  if (error) throw error;
  return data;
}

export async function fetchBudgets(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Integrations
// ---------------------------------------------------------------------------

export async function fetchIntegrations(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Calendar Events
// ---------------------------------------------------------------------------

export async function fetchCalendarEvents(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('organization_id', orgId)
    .order('start_date', { ascending: true });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Competitors
// ---------------------------------------------------------------------------

export async function fetchCompetitors(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('competitors')
    .select(`
      *,
      competitor_ads ( id, platform, ad_content, first_seen, last_seen, status )
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Automation Rules
// ---------------------------------------------------------------------------

export async function fetchAutomationRules(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('automation_rules')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// A/B Tests
// ---------------------------------------------------------------------------

export async function fetchABTests(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('ab_tests')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Landing Pages
// ---------------------------------------------------------------------------

export async function fetchLandingPages(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Deals / Pipeline
// ---------------------------------------------------------------------------

export async function fetchDeals(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('deals')
    .select(`
      *,
      contacts:contact_id ( id, name, email )
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchPipelines(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('pipelines')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------

export async function fetchSEOKeywords(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('seo_keywords')
    .select('*')
    .eq('organization_id', orgId)
    .order('current_position', { ascending: true });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Analytics: Search Terms
// ---------------------------------------------------------------------------

export async function fetchSearchTerms(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('search_terms')
    .select('*')
    .eq('organization_id', orgId)
    .order('cost', { ascending: false })
    .limit(200);

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Analytics: Metrics by Hour (Schedule)
// ---------------------------------------------------------------------------

export async function fetchMetricsByHour(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('metrics_hourly')
    .select('*')
    .eq('organization_id', orgId)
    .order('hour', { ascending: true });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Analytics: Metrics by Geo
// ---------------------------------------------------------------------------

export async function fetchMetricsByGeo(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('metrics_geo')
    .select('*')
    .eq('organization_id', orgId)
    .order('conversions', { ascending: false });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Analytics: Placements
// ---------------------------------------------------------------------------

export async function fetchPlacements(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('placements')
    .select('*')
    .eq('organization_id', orgId)
    .order('conversions', { ascending: false });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Analytics: Quality Score Keywords
// ---------------------------------------------------------------------------

export async function fetchQualityScoreKeywords(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('keywords')
    .select('*')
    .eq('organization_id', orgId)
    .order('quality_score', { ascending: true });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Analytics: LTV Data
// ---------------------------------------------------------------------------

export async function fetchLTVData(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('ltv_by_source')
    .select('*')
    .eq('organization_id', orgId)
    .order('avg_ltv', { ascending: false });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// AI Settings
// ---------------------------------------------------------------------------

export async function fetchAISettings(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('ai_settings')
    .select('*')
    .eq('organization_id', orgId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateAISettings(orgId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('ai_settings')
    .update(updates)
    .eq('organization_id', orgId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Optimization Logs
// ---------------------------------------------------------------------------

export async function fetchOptimizationLogs(orgId: string) {
  requireOrg(orgId);
  const { data, error } = await supabase
    .from('optimization_logs')
    .select('*')
    .eq('organization_id', orgId)
    .order('suggested_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}
