import { supabase } from '@/integrations/supabase/client';

// ---------------------------------------------------------------------------
// Google Ads OAuth & Sync
// ---------------------------------------------------------------------------

export async function getGoogleAdsAuthUrl(orgId: string, redirectUri: string) {
  const { data, error } = await supabase.functions.invoke('google-ads-oauth', {
    body: { action: 'get-auth-url', organizationId: orgId, redirectUri },
  });
  if (error) throw error;
  return data;
}

export async function exchangeGoogleAdsCode(orgId: string, code: string, redirectUri: string) {
  const { data, error } = await supabase.functions.invoke('google-ads-oauth', {
    body: { action: 'exchange-code', organizationId: orgId, code, redirectUri },
  });
  if (error) throw error;
  return data;
}

export async function syncGoogleAds(accountId: string) {
  const { data, error } = await supabase.functions.invoke('google-ads-sync', {
    body: { accountId },
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// AI Analysis
// ---------------------------------------------------------------------------

export async function triggerAIAnalysis(orgId: string) {
  const { data, error } = await supabase.functions.invoke('ai-analysis', {
    body: { organizationId: orgId },
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// AI Chat  (always goes through the edge function, not direct table insert)
// ---------------------------------------------------------------------------

export async function sendAIChatMessage(
  orgId: string,
  message: string,
  conversationId?: string,
) {
  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: { organizationId: orgId, message, conversationId },
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// AI Execute (approve & run a pending AI decision)
// ---------------------------------------------------------------------------

export async function executeAIDecision(decisionId: string) {
  const { data, error } = await supabase.functions.invoke('ai-execute', {
    body: { decisionId },
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// AI Creative Generation
// ---------------------------------------------------------------------------

export async function generateCreatives(params: {
  organizationId: string;
  platform?: string;
  type?: string;
  basedOnCreativeId?: string;
  prompt?: string;
}) {
  const { data, error } = await supabase.functions.invoke('ai-creative-gen', {
    body: params,
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// AI Reports
// ---------------------------------------------------------------------------

export async function generateReport(orgId: string, type: string) {
  const { data, error } = await supabase.functions.invoke('ai-report', {
    body: { organizationId: orgId, reportType: type },
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// AI ROI Prediction
// ---------------------------------------------------------------------------

export async function predictROI(
  orgId: string,
  proposedBudget: number,
  campaignId?: string,
) {
  const { data, error } = await supabase.functions.invoke('ai-roi-prediction', {
    body: { organizationId: orgId, proposedBudget, campaignId },
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Budget Optimizer
// ---------------------------------------------------------------------------

export async function optimizeBudget(orgId: string, totalBudget?: number) {
  const { data, error } = await supabase.functions.invoke('budget-optimizer', {
    body: { organizationId: orgId, totalBudget },
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Health Score (on-demand recalculation)
// ---------------------------------------------------------------------------

export async function recalculateHealthScore(orgId: string) {
  const { data, error } = await supabase.functions.invoke('health-score', {
    body: { organizationId: orgId },
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Lead Scoring
// ---------------------------------------------------------------------------

export async function runLeadScoring(orgId: string) {
  const { data, error } = await supabase.functions.invoke('lead-scoring', {
    body: { organizationId: orgId },
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Funnel Snapshot
// ---------------------------------------------------------------------------

export async function takeFunnelSnapshot(funnelId: string) {
  const { data, error } = await supabase.functions.invoke('funnel-snapshot', {
    body: { funnelId },
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Alert Checker (manual trigger)
// ---------------------------------------------------------------------------

export async function runAlertChecker(orgId: string) {
  const { data, error } = await supabase.functions.invoke('alert-checker', {
    body: { organizationId: orgId },
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Audience Generation & Sync
// ---------------------------------------------------------------------------

export async function generateAudiences(orgId: string, sourceType: string) {
  const { data, error } = await supabase.functions.invoke('generate-audiences', {
    body: { organizationId: orgId, sourceType },
  });
  if (error) throw error;
  return data;
}

export async function createGoogleAudience(audienceId: string) {
  const { data, error } = await supabase.functions.invoke('create-google-audience', {
    body: { audienceId },
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// GA4 Sync
// ---------------------------------------------------------------------------

export async function syncGA4(orgId: string) {
  const { data, error } = await supabase.functions.invoke('ga4-sync', {
    body: { organizationId: orgId },
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Search Console Sync
// ---------------------------------------------------------------------------

export async function syncSearchConsole(orgId: string) {
  const { data, error } = await supabase.functions.invoke('search-console-sync', {
    body: { organizationId: orgId },
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Email Sender
// ---------------------------------------------------------------------------

export async function sendEmail(params: {
  contactId: string;
  sequenceStepId?: string;
  subject: string;
  bodyHtml: string;
}) {
  const { data, error } = await supabase.functions.invoke('email-sender', {
    body: params,
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Payment Webhooks (manual re-process)
// ---------------------------------------------------------------------------

export async function reprocessPaymentWebhook(webhookLogId: string) {
  const { data, error } = await supabase.functions.invoke('payment-webhooks', {
    body: { action: 'reprocess', webhookLogId },
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Tracking Script (get snippet for embedding)
// ---------------------------------------------------------------------------

export async function getTrackingScript(orgId: string) {
  const { data, error } = await supabase.functions.invoke('tracking-script', {
    body: { organizationId: orgId },
  });
  if (error) throw error;
  return data;
}
