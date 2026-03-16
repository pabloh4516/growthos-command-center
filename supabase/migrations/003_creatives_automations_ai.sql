-- =============================================
-- GrowthOS Migration 003: Creatives, Landing Pages, A/B Tests, Automations, AI/Insights
-- =============================================

-- ENUMS
CREATE TYPE creative_type AS ENUM ('image', 'video', 'text', 'carousel', 'responsive');
CREATE TYPE creative_variant_type AS ENUM ('ai_generated', 'manual');
CREATE TYPE ab_test_type AS ENUM ('creative', 'page', 'audience', 'copy');
CREATE TYPE ab_test_status AS ENUM ('draft', 'running', 'completed', 'winner_declared');
CREATE TYPE email_send_status AS ENUM ('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed');
CREATE TYPE whatsapp_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE insight_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE insight_status AS ENUM ('new', 'seen', 'acted', 'dismissed');
CREATE TYPE optimization_status AS ENUM ('suggested', 'approved', 'executed', 'reverted');
CREATE TYPE ai_decision_type AS ENUM (
  'pause_campaign', 'activate_campaign', 'increase_budget', 'decrease_budget',
  'add_negative_keyword', 'remove_keyword', 'adjust_bid', 'create_campaign',
  'reallocate_budget', 'scale_campaign', 'suggest_structure', 'ab_test_creative',
  'create_audience', 'exclude_placement', 'adjust_schedule_bid', 'adjust_geo_bid'
);
CREATE TYPE ai_decision_status AS ENUM ('pending', 'approved', 'executed', 'failed', 'rejected', 'rolled_back');
CREATE TYPE ai_analysis_status AS ENUM ('running', 'completed', 'failed');
CREATE TYPE chat_message_role AS ENUM ('user', 'assistant', 'system');

-- =============================================
-- CREATIVES
-- =============================================

CREATE TABLE creative_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type creative_type NOT NULL,
  file_url TEXT,
  thumbnail_url TEXT,
  tags JSONB DEFAULT '[]',
  platform ad_platform,
  elements JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE creative_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_id UUID NOT NULL REFERENCES creative_library(id) ON DELETE CASCADE,
  ad_id UUID REFERENCES ads(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  ctr NUMERIC(8,4) DEFAULT 0,
  conversions NUMERIC(12,2) DEFAULT 0,
  conversion_rate NUMERIC(8,4) DEFAULT 0,
  cost NUMERIC(12,2) DEFAULT 0,
  cpa NUMERIC(12,2) DEFAULT 0,
  roas NUMERIC(8,4) DEFAULT 0,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE creative_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_creative_id UUID NOT NULL REFERENCES creative_library(id) ON DELETE CASCADE,
  variant_type creative_variant_type NOT NULL DEFAULT 'manual',
  content JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  performance_comparison JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- LANDING PAGES
-- =============================================

CREATE TABLE landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  platform TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE page_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id UUID NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  visitors BIGINT DEFAULT 0,
  unique_visitors BIGINT DEFAULT 0,
  leads BIGINT DEFAULT 0,
  conversion_rate NUMERIC(8,4) DEFAULT 0,
  avg_time_on_page NUMERIC(8,2) DEFAULT 0,
  bounce_rate NUMERIC(8,4) DEFAULT 0,
  scroll_depth_avg NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(landing_page_id, date)
);

-- =============================================
-- A/B TESTS
-- =============================================

CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type ab_test_type NOT NULL,
  status ab_test_status NOT NULL DEFAULT 'draft',
  variants JSONB NOT NULL DEFAULT '[]',
  metric TEXT DEFAULT 'conversion_rate',
  start_date DATE,
  end_date DATE,
  winner_variant TEXT,
  statistical_significance NUMERIC(5,2) DEFAULT 0,
  sample_size_needed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ab_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ab_test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant_id TEXT NOT NULL,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions BIGINT DEFAULT 0,
  conversion_rate NUMERIC(8,4) DEFAULT 0,
  confidence_interval JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- EMAIL SEQUENCES & AUTOMATIONS
-- =============================================

CREATE TABLE email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE email_sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  delay_hours INTEGER DEFAULT 0,
  subject TEXT,
  body_html TEXT,
  body_text TEXT,
  condition JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_step_id UUID REFERENCES email_sequence_steps(id) ON DELETE SET NULL,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status email_send_status NOT NULL DEFAULT 'queued',
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  template_id UUID REFERENCES whatsapp_templates(id) ON DELETE SET NULL,
  direction whatsapp_direction NOT NULL DEFAULT 'outbound',
  body TEXT,
  status TEXT DEFAULT 'queued',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}',
  conditions JSONB DEFAULT '[]',
  actions JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  executions_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- AI & INSIGHTS
-- =============================================

CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity insight_severity NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  description TEXT,
  data JSONB DEFAULT '{}',
  suggested_action TEXT,
  estimated_impact TEXT,
  status insight_status NOT NULL DEFAULT 'new',
  entity_type TEXT,
  entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE optimization_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  before_state JSONB DEFAULT '{}',
  after_state JSONB DEFAULT '{}',
  reason TEXT,
  estimated_impact TEXT,
  status optimization_status NOT NULL DEFAULT 'suggested',
  suggested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_at TIMESTAMPTZ,
  executed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_creative_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform ad_platform,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  based_on_creative_id UUID REFERENCES creative_library(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'generated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  analysis_id UUID,
  decision_type ai_decision_type NOT NULL,
  status ai_decision_status NOT NULL DEFAULT 'pending',
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  ad_group_id UUID REFERENCES ad_groups(id) ON DELETE SET NULL,
  keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
  reasoning TEXT NOT NULL,
  action_details JSONB NOT NULL DEFAULT '{}',
  data_snapshot JSONB DEFAULT '{}',
  executed_at TIMESTAMPTZ,
  execution_result JSONB,
  error_message TEXT,
  rollback_action JSONB,
  rolled_back_at TIMESTAMPTZ,
  priority INTEGER DEFAULT 5,
  confidence NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status ai_analysis_status NOT NULL DEFAULT 'running',
  trigger_type TEXT DEFAULT 'scheduled',
  campaigns_analyzed INTEGER DEFAULT 0,
  utmify_sales_analyzed INTEGER DEFAULT 0,
  total_spend_analyzed NUMERIC(12,2) DEFAULT 0,
  date_range_start DATE,
  date_range_end DATE,
  decisions_count INTEGER DEFAULT 0,
  summary TEXT,
  full_analysis JSONB,
  raw_claude_response TEXT,
  tokens_used INTEGER DEFAULT 0,
  model_used TEXT DEFAULT 'claude-sonnet-4-6-20250514',
  duration_ms INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL,
  role chat_message_role NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Settings (per org)
CREATE TABLE ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT TRUE,
  auto_execute BOOLEAN DEFAULT TRUE,
  analysis_frequency_hours INTEGER DEFAULT 6,
  max_budget_change_pct NUMERIC(5,2) DEFAULT 30,
  min_data_days INTEGER DEFAULT 3,
  target_roas NUMERIC(8,2) DEFAULT 2.0,
  max_cpa NUMERIC(12,2),
  daily_budget_limit NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_creative_library_org ON creative_library(organization_id);
CREATE INDEX idx_creative_performance_creative ON creative_performance(creative_id);
CREATE INDEX idx_landing_pages_org ON landing_pages(organization_id);
CREATE INDEX idx_ab_tests_org ON ab_tests(organization_id);
CREATE INDEX idx_ab_tests_status ON ab_tests(status);
CREATE INDEX idx_email_sequences_org ON email_sequences(organization_id);
CREATE INDEX idx_email_sends_contact ON email_sends(contact_id);
CREATE INDEX idx_email_sends_status ON email_sends(status);
CREATE INDEX idx_insights_org ON insights(organization_id);
CREATE INDEX idx_insights_severity ON insights(severity);
CREATE INDEX idx_insights_status ON insights(status);
CREATE INDEX idx_optimization_logs_org ON optimization_logs(organization_id);
CREATE INDEX idx_ai_decisions_org ON ai_decisions(organization_id);
CREATE INDEX idx_ai_decisions_status ON ai_decisions(status);
CREATE INDEX idx_ai_decisions_campaign ON ai_decisions(campaign_id);
CREATE INDEX idx_ai_analyses_org ON ai_analyses(organization_id);
CREATE INDEX idx_ai_chat_conversation ON ai_chat_messages(conversation_id, created_at);

-- TRIGGERS
CREATE TRIGGER tr_creative_library_updated BEFORE UPDATE ON creative_library FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_landing_pages_updated BEFORE UPDATE ON landing_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_ab_tests_updated BEFORE UPDATE ON ab_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_email_sequences_updated BEFORE UPDATE ON email_sequences FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_automation_rules_updated BEFORE UPDATE ON automation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_ai_decisions_updated BEFORE UPDATE ON ai_decisions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_ai_settings_updated BEFORE UPDATE ON ai_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
