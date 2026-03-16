-- =============================================
-- GrowthOS Migration 001: Core + Ads
-- Organizations, Users, Ad Accounts, Campaigns
-- =============================================

-- ENUMS
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'analyst', 'viewer');
CREATE TYPE ad_platform AS ENUM ('google_ads', 'meta_ads', 'tiktok_ads', 'youtube_ads', 'microsoft_ads');
CREATE TYPE connection_status AS ENUM ('connected', 'disconnected', 'expired', 'error');
CREATE TYPE campaign_status AS ENUM ('active', 'paused', 'deleted', 'archived', 'ended', 'draft');
CREATE TYPE keyword_match_type AS ENUM ('broad', 'phrase', 'exact');
CREATE TYPE negative_keyword_level AS ENUM ('campaign', 'ad_group');
CREATE TYPE ad_type AS ENUM ('text', 'image', 'video', 'carousel', 'responsive');
CREATE TYPE pixel_type AS ENUM ('pixel', 'conversions_api', 'enhanced_conversions');

-- =============================================
-- ORGANIZATIONS
-- =============================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  currency TEXT NOT NULL DEFAULT 'BRL',
  industry TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'viewer',
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(organization_id, user_id)
);

-- =============================================
-- USER PROFILES & PREFERENCES
-- =============================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'pt-BR',
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- AD ACCOUNTS
-- =============================================

CREATE TABLE ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform ad_platform NOT NULL,
  account_id TEXT NOT NULL,
  account_name TEXT NOT NULL,
  status connection_status NOT NULL DEFAULT 'disconnected',
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  business_manager_id TEXT,
  developer_token TEXT,
  currency_code TEXT DEFAULT 'BRL',
  timezone TEXT,
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, platform, account_id)
);

-- =============================================
-- INTEGRATIONS & PIXELS
-- =============================================

CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  status connection_status NOT NULL DEFAULT 'disconnected',
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pixels_and_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ad_account_id UUID REFERENCES ad_accounts(id) ON DELETE SET NULL,
  pixel_id TEXT,
  platform ad_platform NOT NULL,
  type pixel_type NOT NULL DEFAULT 'pixel',
  status connection_status NOT NULL DEFAULT 'disconnected',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- CAMPAIGNS
-- =============================================

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_account_id UUID NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform ad_platform NOT NULL,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  objective TEXT,
  status campaign_status NOT NULL DEFAULT 'active',
  daily_budget NUMERIC(12,2),
  lifetime_budget NUMERIC(12,2),
  budget_micros BIGINT,
  campaign_budget_resource TEXT,
  start_date DATE,
  end_date DATE,

  -- Google Ads metrics (synced)
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  cost NUMERIC(12,2) DEFAULT 0,
  google_conversions NUMERIC(12,2) DEFAULT 0,
  google_conversion_value NUMERIC(12,2) DEFAULT 0,
  ctr NUMERIC(8,4) DEFAULT 0,
  avg_cpc NUMERIC(12,2) DEFAULT 0,

  -- Utmify REAL metrics
  real_sales_count INTEGER DEFAULT 0,
  real_revenue NUMERIC(12,2) DEFAULT 0,
  real_roas NUMERIC(8,4) DEFAULT 0,
  real_cpa NUMERIC(12,2) DEFAULT 0,

  -- Health score
  health_score INTEGER DEFAULT 0,

  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(ad_account_id, external_id)
);

-- =============================================
-- AD GROUPS
-- =============================================

CREATE TABLE ad_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  targeting JSONB DEFAULT '{}',
  bid_strategy TEXT,
  status campaign_status NOT NULL DEFAULT 'active',

  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  cost NUMERIC(12,2) DEFAULT 0,
  conversions NUMERIC(12,2) DEFAULT 0,

  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, external_id)
);

-- =============================================
-- ADS
-- =============================================

CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_group_id UUID NOT NULL REFERENCES ad_groups(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type ad_type NOT NULL DEFAULT 'text',
  headline TEXT,
  description TEXT,
  creative_url TEXT,
  destination_url TEXT,
  status campaign_status NOT NULL DEFAULT 'active',

  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  cost NUMERIC(12,2) DEFAULT 0,
  conversions NUMERIC(12,2) DEFAULT 0,

  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(ad_group_id, external_id)
);

-- =============================================
-- KEYWORDS & NEGATIVE KEYWORDS
-- =============================================

CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_group_id UUID NOT NULL REFERENCES ad_groups(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  text TEXT NOT NULL,
  match_type keyword_match_type NOT NULL DEFAULT 'broad',
  bid NUMERIC(12,2),
  bid_micros BIGINT,
  status campaign_status NOT NULL DEFAULT 'active',
  quality_score INTEGER,

  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  cost NUMERIC(12,2) DEFAULT 0,
  conversions NUMERIC(12,2) DEFAULT 0,

  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(ad_group_id, external_id)
);

CREATE TABLE negative_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  ad_group_id UUID REFERENCES ad_groups(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  match_type keyword_match_type NOT NULL DEFAULT 'broad',
  level negative_keyword_level NOT NULL DEFAULT 'campaign',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (campaign_id IS NOT NULL OR ad_group_id IS NOT NULL)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_ad_accounts_org ON ad_accounts(organization_id);
CREATE INDEX idx_ad_accounts_platform ON ad_accounts(platform);
CREATE INDEX idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX idx_campaigns_account ON campaigns(ad_account_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_platform ON campaigns(platform);
CREATE INDEX idx_ad_groups_campaign ON ad_groups(campaign_id);
CREATE INDEX idx_ads_adgroup ON ads(ad_group_id);
CREATE INDEX idx_keywords_adgroup ON keywords(ad_group_id);
CREATE INDEX idx_negative_keywords_campaign ON negative_keywords(campaign_id);
CREATE INDEX idx_negative_keywords_adgroup ON negative_keywords(ad_group_id);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_organizations_updated BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_user_profiles_updated BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_user_preferences_updated BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_ad_accounts_updated BEFORE UPDATE ON ad_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_integrations_updated BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_campaigns_updated BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_ad_groups_updated BEFORE UPDATE ON ad_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_ads_updated BEFORE UPDATE ON ads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_keywords_updated BEFORE UPDATE ON keywords FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO user_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
-- =============================================
-- GrowthOS Migration 002: Metrics, CRM, Funnel, Sales, Utmify
-- =============================================

-- ENUMS
CREATE TYPE entity_type AS ENUM ('campaign', 'ad_group', 'ad', 'keyword');
CREATE TYPE lifecycle_stage AS ENUM ('subscriber', 'lead', 'mql', 'sql', 'opportunity', 'customer');
CREATE TYPE deal_status AS ENUM ('open', 'won', 'lost');
CREATE TYPE attribution_model AS ENUM ('first_touch', 'last_touch', 'linear', 'time_decay', 'position_based');
CREATE TYPE utmify_status AS ENUM ('paid', 'waiting_payment', 'refused', 'refunded', 'chargedback');
CREATE TYPE timeline_event_type AS ENUM (
  'page_view', 'form_submit', 'email_open', 'email_click', 'ad_click',
  'call', 'meeting', 'note', 'stage_change', 'sale', 'whatsapp',
  'tag_added', 'tag_removed', 'score_change'
);

-- =============================================
-- METRICS DAILY & HOURLY
-- =============================================

CREATE TABLE metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  entity_type entity_type NOT NULL,
  entity_id UUID NOT NULL,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  ctr NUMERIC(8,4) DEFAULT 0,
  cpc NUMERIC(12,2) DEFAULT 0,
  cost NUMERIC(12,2) DEFAULT 0,
  conversions NUMERIC(12,2) DEFAULT 0,
  conversion_rate NUMERIC(8,4) DEFAULT 0,
  revenue NUMERIC(12,2) DEFAULT 0,
  roas NUMERIC(8,4) DEFAULT 0,
  cpa NUMERIC(12,2) DEFAULT 0,
  reach BIGINT DEFAULT 0,
  frequency NUMERIC(8,2) DEFAULT 0,
  video_views BIGINT DEFAULT 0,
  video_view_rate NUMERIC(8,4) DEFAULT 0,
  -- Utmify real metrics
  real_sales INTEGER DEFAULT 0,
  real_revenue NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, entity_type, entity_id)
);

CREATE TABLE metrics_hourly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  entity_type entity_type NOT NULL,
  entity_id UUID NOT NULL,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  ctr NUMERIC(8,4) DEFAULT 0,
  cpc NUMERIC(12,2) DEFAULT 0,
  cost NUMERIC(12,2) DEFAULT 0,
  conversions NUMERIC(12,2) DEFAULT 0,
  revenue NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, hour, entity_type, entity_id)
);

-- =============================================
-- FUNNEL
-- =============================================

CREATE TABLE funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  visitor_id TEXT,
  session_id TEXT,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE funnel_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  stages_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(funnel_id, date)
);

-- =============================================
-- CRM — CONTACTS
-- =============================================

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  name TEXT,
  company TEXT,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  first_touch_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  lifecycle_stage lifecycle_stage NOT NULL DEFAULT 'subscriber',
  lead_score INTEGER DEFAULT 0,
  churn_risk_score NUMERIC(5,2) DEFAULT 0,
  predicted_ltv NUMERIC(12,2) DEFAULT 0,
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE contact_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  event_type timeline_event_type NOT NULL,
  event_data JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- CRM — PIPELINE & DEALS
-- =============================================

CREATE TABLE pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  title TEXT NOT NULL,
  value NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  probability NUMERIC(5,2) DEFAULT 0,
  expected_close_date DATE,
  closed_at TIMESTAMPTZ,
  won BOOLEAN,
  lost_reason TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE deal_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SALES & ATTRIBUTION
-- =============================================

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  product TEXT,
  payment_method TEXT,
  transaction_id TEXT,
  sale_date TIMESTAMPTZ NOT NULL,
  is_offline BOOLEAN DEFAULT FALSE,
  original_click_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  touchpoints JSONB NOT NULL DEFAULT '[]',
  model attribution_model NOT NULL DEFAULT 'last_touch',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- UTMIFY SALES (VENDAS REAIS)
-- =============================================

CREATE TABLE utmify_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  status utmify_status NOT NULL,
  revenue NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',

  -- UTM parameters for campaign matching
  utm_source TEXT,
  utm_campaign TEXT,
  utm_medium TEXT,
  utm_content TEXT,
  utm_term TEXT,
  src TEXT,
  sck TEXT,

  -- Campaign matching
  matched_campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  matched_ad_group_id UUID REFERENCES ad_groups(id) ON DELETE SET NULL,
  match_confidence NUMERIC(3,2) DEFAULT 0,

  -- Customer
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  product_name TEXT,

  sale_date TIMESTAMPTZ,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, order_id)
);

CREATE TABLE utmify_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  webhook_secret TEXT,
  webhook_url_generated TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_metrics_daily_date ON metrics_daily(date);
CREATE INDEX idx_metrics_daily_entity ON metrics_daily(entity_type, entity_id);
CREATE INDEX idx_metrics_daily_org ON metrics_daily(organization_id);
CREATE INDEX idx_metrics_hourly_date ON metrics_hourly(date, hour);
CREATE INDEX idx_metrics_hourly_entity ON metrics_hourly(entity_type, entity_id);
CREATE INDEX idx_funnel_events_funnel ON funnel_events(funnel_id);
CREATE INDEX idx_funnel_events_stage ON funnel_events(stage);
CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_stage ON contacts(lifecycle_stage);
CREATE INDEX idx_contacts_score ON contacts(lead_score);
CREATE INDEX idx_contact_timeline_contact ON contact_timeline(contact_id);
CREATE INDEX idx_contact_timeline_type ON contact_timeline(event_type);
CREATE INDEX idx_deals_org ON deals(organization_id);
CREATE INDEX idx_deals_pipeline ON deals(pipeline_id);
CREATE INDEX idx_deals_contact ON deals(contact_id);
CREATE INDEX idx_sales_org ON sales(organization_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_utmify_sales_org ON utmify_sales(organization_id);
CREATE INDEX idx_utmify_sales_status ON utmify_sales(status);
CREATE INDEX idx_utmify_sales_campaign ON utmify_sales(matched_campaign_id);
CREATE INDEX idx_utmify_sales_utm ON utmify_sales(utm_source, utm_campaign);
CREATE INDEX idx_utmify_sales_date ON utmify_sales(sale_date);

-- TRIGGERS
CREATE TRIGGER tr_funnels_updated BEFORE UPDATE ON funnels FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_contacts_updated BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_pipelines_updated BEFORE UPDATE ON pipelines FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_deals_updated BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_utmify_sales_updated BEFORE UPDATE ON utmify_sales FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_utmify_config_updated BEFORE UPDATE ON utmify_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();
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
-- =============================================
-- GrowthOS Migration 004: Alerts, Financial, Competitors, Portal, Team,
-- Analytics (Search Terms, Schedule, Geo, Placements, Call Tracking, Forms,
-- SEO, Goals, Calendar, LTV, Offline, Custom Dashboards, Audiences, UTM, Webhooks)
-- =============================================

-- ENUMS
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved');
CREATE TYPE financial_type AS ENUM ('ad_spend', 'operational_cost', 'revenue', 'refund');
CREATE TYPE budget_period AS ENUM ('daily', 'weekly', 'monthly');
CREATE TYPE report_format AS ENUM ('pdf', 'docx');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'revision_requested');
CREATE TYPE audience_type AS ENUM ('custom', 'lookalike', 'remarketing', 'seed');
CREATE TYPE audience_source AS ENUM ('crm_list', 'website_visitors', 'purchasers', 'top_ltv', 'engaged_leads');
CREATE TYPE audience_status AS ENUM ('building', 'ready', 'synced', 'error');
CREATE TYPE call_status AS ENUM ('answered', 'missed', 'voicemail');
CREATE TYPE call_qualification AS ENUM ('hot', 'warm', 'cold', 'spam');
CREATE TYPE goal_status AS ENUM ('on_track', 'at_risk', 'behind', 'achieved');
CREATE TYPE ltv_segment AS ENUM ('high', 'medium', 'low');
CREATE TYPE offline_match_status AS ENUM ('matched', 'unmatched', 'partial');

-- =============================================
-- ALERTS
-- =============================================

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  message TEXT,
  threshold_value NUMERIC(12,2),
  current_value NUMERIC(12,2),
  entity_type TEXT,
  entity_id UUID,
  channel TEXT DEFAULT 'dashboard',
  status alert_status NOT NULL DEFAULT 'active',
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric TEXT NOT NULL,
  operator TEXT NOT NULL,
  threshold NUMERIC(12,2) NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'medium',
  channels JSONB DEFAULT '["dashboard"]',
  entity_scope TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- FINANCIAL
-- =============================================

CREATE TABLE financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type financial_type NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  category TEXT,
  description TEXT,
  entity_type TEXT,
  entity_id UUID,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  period budget_period NOT NULL DEFAULT 'monthly',
  ad_account_id UUID REFERENCES ad_accounts(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  alert_threshold_pct NUMERIC(5,2) DEFAULT 80,
  spent_amount NUMERIC(12,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE client_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_name TEXT,
  template_id TEXT,
  period_start DATE,
  period_end DATE,
  data JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  format report_format DEFAULT 'pdf',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- COMPETITORS
-- =============================================

CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT,
  ad_library_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE competitor_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  platform ad_platform,
  ad_content JSONB DEFAULT '{}',
  first_seen TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE industry_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  metric TEXT NOT NULL,
  platform ad_platform,
  value NUMERIC(12,4),
  p25 NUMERIC(12,4),
  p50 NUMERIC(12,4),
  p75 NUMERIC(12,4),
  period TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- CLIENT PORTAL
-- =============================================

CREATE TABLE client_portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE client_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_portal_user_id UUID REFERENCES client_portal_users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  entity_id UUID,
  status approval_status NOT NULL DEFAULT 'pending',
  feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- =============================================
-- TEAM (TASKS & ACTIVITY)
-- =============================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- AUDIENCES
-- =============================================

CREATE TABLE audiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform ad_platform,
  type audience_type NOT NULL,
  source_type audience_source,
  status audience_status NOT NULL DEFAULT 'building',
  size_estimate INTEGER DEFAULT 0,
  platform_audience_id TEXT,
  sync_status TEXT,
  criteria JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audience_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audience_id UUID NOT NULL REFERENCES audiences(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(audience_id, contact_id)
);

CREATE TABLE audience_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audience_id UUID NOT NULL REFERENCES audiences(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions NUMERIC(12,2) DEFAULT 0,
  cpa NUMERIC(12,2) DEFAULT 0,
  roas NUMERIC(8,4) DEFAULT 0,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SEARCH TERMS
-- =============================================

CREATE TABLE search_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_account_id UUID NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  ad_group_id UUID REFERENCES ad_groups(id) ON DELETE SET NULL,
  keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
  term TEXT NOT NULL,
  match_type TEXT,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  cost NUMERIC(12,2) DEFAULT 0,
  conversions NUMERIC(12,2) DEFAULT 0,
  revenue NUMERIC(12,2) DEFAULT 0,
  date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE search_term_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  search_term_id UUID NOT NULL REFERENCES search_terms(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  executed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SCHEDULE / DEVICE METRICS
-- =============================================

CREATE TABLE metrics_by_hour (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions NUMERIC(12,2) DEFAULT 0,
  cost NUMERIC(12,2) DEFAULT 0,
  cpa NUMERIC(12,2) DEFAULT 0,
  roas NUMERIC(8,4) DEFAULT 0,
  period TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE metrics_by_device (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  device TEXT NOT NULL,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions NUMERIC(12,2) DEFAULT 0,
  cost NUMERIC(12,2) DEFAULT 0,
  cpa NUMERIC(12,2) DEFAULT 0,
  roas NUMERIC(8,4) DEFAULT 0,
  conversion_rate NUMERIC(8,4) DEFAULT 0,
  period TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bid_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  target TEXT NOT NULL,
  adjustment_pct NUMERIC(8,2) NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'suggested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- GEO METRICS
-- =============================================

CREATE TABLE metrics_by_geo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  country TEXT DEFAULT 'BR',
  state TEXT,
  city TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions NUMERIC(12,2) DEFAULT 0,
  cost NUMERIC(12,2) DEFAULT 0,
  cpa NUMERIC(12,2) DEFAULT 0,
  roas NUMERIC(8,4) DEFAULT 0,
  period TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE geo_bid_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  adjustment_pct NUMERIC(8,2) NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'suggested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- PLACEMENTS
-- =============================================

CREATE TABLE metrics_by_placement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  platform ad_platform,
  placement TEXT NOT NULL,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions NUMERIC(12,2) DEFAULT 0,
  cost NUMERIC(12,2) DEFAULT 0,
  cpa NUMERIC(12,2) DEFAULT 0,
  roas NUMERIC(8,4) DEFAULT 0,
  period TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE placement_exclusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  placement TEXT NOT NULL,
  reason TEXT,
  excluded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- CALL TRACKING
-- =============================================

CREATE TABLE tracking_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  provider_number_id TEXT,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  ad_group_id UUID REFERENCES ad_groups(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tracking_number_id UUID REFERENCES tracking_numbers(id) ON DELETE SET NULL,
  caller_phone TEXT,
  duration_seconds INTEGER DEFAULT 0,
  recording_url TEXT,
  status call_status NOT NULL DEFAULT 'answered',
  qualification call_qualification,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  attributed_campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  attributed_ad_id UUID REFERENCES ads(id) ON DELETE SET NULL,
  call_start TIMESTAMPTZ,
  call_end TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE call_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number_id UUID NOT NULL REFERENCES tracking_numbers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_calls INTEGER DEFAULT 0,
  answered INTEGER DEFAULT 0,
  missed INTEGER DEFAULT 0,
  avg_duration INTEGER DEFAULT 0,
  qualified_leads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tracking_number_id, date)
);

-- =============================================
-- FORMS
-- =============================================

CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fields JSONB NOT NULL DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  embed_code TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  data JSONB NOT NULL DEFAULT '{}',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  page_url TEXT,
  ip_address TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE form_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  submissions INTEGER DEFAULT 0,
  conversion_rate NUMERIC(8,4) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(form_id, date)
);

-- =============================================
-- SEO
-- =============================================

CREATE TABLE seo_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  current_position INTEGER,
  previous_position INTEGER,
  search_volume INTEGER DEFAULT 0,
  difficulty NUMERIC(5,2) DEFAULT 0,
  url TEXT,
  tracked_since DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE seo_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  organic_sessions BIGINT DEFAULT 0,
  organic_conversions BIGINT DEFAULT 0,
  organic_revenue NUMERIC(12,2) DEFAULT 0,
  top_pages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE seo_vs_paid (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  organic_position INTEGER,
  organic_clicks BIGINT DEFAULT 0,
  paid_clicks BIGINT DEFAULT 0,
  paid_cost NUMERIC(12,2) DEFAULT 0,
  paid_cpa NUMERIC(12,2) DEFAULT 0,
  overlap_savings_potential NUMERIC(12,2) DEFAULT 0,
  period TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- GOALS & OKRs
-- =============================================

CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  target_value NUMERIC(12,2) NOT NULL,
  current_value NUMERIC(12,2) DEFAULT 0,
  unit TEXT,
  period_start DATE,
  period_end DATE,
  status goal_status NOT NULL DEFAULT 'on_track',
  parent_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value NUMERIC(12,2) DEFAULT 0,
  projected_value NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE okrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  objective TEXT NOT NULL,
  period TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE okr_key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  okr_id UUID NOT NULL REFERENCES okrs(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  target_value NUMERIC(12,2) NOT NULL,
  current_value NUMERIC(12,2) DEFAULT 0,
  unit TEXT,
  weight NUMERIC(5,2) DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- CALENDAR
-- =============================================

CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT FALSE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  color TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE calendar_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  events JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- LTV
-- =============================================

CREATE TABLE customer_ltv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  total_revenue NUMERIC(12,2) DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  avg_order_value NUMERIC(12,2) DEFAULT 0,
  first_purchase_date DATE,
  last_purchase_date DATE,
  predicted_ltv_12m NUMERIC(12,2) DEFAULT 0,
  ltv_segment ltv_segment DEFAULT 'medium',
  acquisition_source TEXT,
  acquisition_campaign TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ltv_by_segment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  segment_type TEXT NOT NULL,
  segment_value TEXT NOT NULL,
  avg_ltv NUMERIC(12,2) DEFAULT 0,
  median_ltv NUMERIC(12,2) DEFAULT 0,
  customer_count INTEGER DEFAULT 0,
  period TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- OFFLINE CONVERSIONS
-- =============================================

CREATE TABLE offline_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  amount NUMERIC(12,2),
  product TEXT,
  original_click_id TEXT,
  gclid TEXT,
  fbclid TEXT,
  conversion_date TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  match_status offline_match_status DEFAULT 'unmatched',
  platform_sent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE offline_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  total_rows INTEGER DEFAULT 0,
  matched_rows INTEGER DEFAULT 0,
  unmatched_rows INTEGER DEFAULT 0,
  platform_synced TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- =============================================
-- CUSTOM DASHBOARDS
-- =============================================

CREATE TABLE custom_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  layout JSONB DEFAULT '{}',
  widgets JSONB DEFAULT '[]',
  is_default BOOLEAN DEFAULT FALSE,
  shared_with JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES custom_dashboards(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  position JSONB DEFAULT '{}',
  size JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- UTM & TRACKING
-- =============================================

CREATE TABLE utm_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  content TEXT,
  term TEXT,
  generated_url TEXT,
  short_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  visitor_id TEXT,
  session_id TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  page_url TEXT,
  referrer TEXT,
  device TEXT,
  browser TEXT,
  country TEXT,
  city TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- WEBHOOKS & API KEYS
-- =============================================

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events JSONB DEFAULT '[]',
  secret TEXT,
  status TEXT DEFAULT 'active',
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  response_status INTEGER,
  response_body TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES (all remaining tables)
-- =============================================

CREATE INDEX idx_alerts_org ON alerts(organization_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alert_rules_org ON alert_rules(organization_id);
CREATE INDEX idx_financial_records_org ON financial_records(organization_id);
CREATE INDEX idx_financial_records_date ON financial_records(date);
CREATE INDEX idx_budgets_org ON budgets(organization_id);
CREATE INDEX idx_competitors_org ON competitors(organization_id);
CREATE INDEX idx_competitor_ads_competitor ON competitor_ads(competitor_id);
CREATE INDEX idx_tasks_org ON tasks(organization_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_activity_log_org ON activity_log(organization_id);
CREATE INDEX idx_audiences_org ON audiences(organization_id);
CREATE INDEX idx_audiences_type ON audiences(type);
CREATE INDEX idx_search_terms_account ON search_terms(ad_account_id);
CREATE INDEX idx_search_terms_campaign ON search_terms(campaign_id);
CREATE INDEX idx_search_terms_date ON search_terms(date);
CREATE INDEX idx_metrics_by_hour_campaign ON metrics_by_hour(campaign_id);
CREATE INDEX idx_metrics_by_device_campaign ON metrics_by_device(campaign_id);
CREATE INDEX idx_metrics_by_geo_campaign ON metrics_by_geo(campaign_id);
CREATE INDEX idx_metrics_by_geo_state ON metrics_by_geo(state);
CREATE INDEX idx_metrics_by_placement_campaign ON metrics_by_placement(campaign_id);
CREATE INDEX idx_calls_org ON calls(organization_id);
CREATE INDEX idx_calls_campaign ON calls(attributed_campaign_id);
CREATE INDEX idx_forms_org ON forms(organization_id);
CREATE INDEX idx_form_submissions_form ON form_submissions(form_id);
CREATE INDEX idx_seo_keywords_org ON seo_keywords(organization_id);
CREATE INDEX idx_goals_org ON goals(organization_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_calendar_events_org ON calendar_events(organization_id);
CREATE INDEX idx_calendar_events_dates ON calendar_events(start_date, end_date);
CREATE INDEX idx_customer_ltv_contact ON customer_ltv(contact_id);
CREATE INDEX idx_customer_ltv_org ON customer_ltv(organization_id);
CREATE INDEX idx_ltv_by_segment_org ON ltv_by_segment(organization_id);
CREATE INDEX idx_offline_conversions_org ON offline_conversions(organization_id);
CREATE INDEX idx_tracking_events_org ON tracking_events(organization_id);
CREATE INDEX idx_tracking_events_timestamp ON tracking_events(timestamp);
CREATE INDEX idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX idx_webhooks_org ON webhooks(organization_id);
CREATE INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id);

-- TRIGGERS
CREATE TRIGGER tr_alert_rules_updated BEFORE UPDATE ON alert_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_budgets_updated BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_audiences_updated BEFORE UPDATE ON audiences FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_seo_keywords_updated BEFORE UPDATE ON seo_keywords FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_goals_updated BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_okrs_updated BEFORE UPDATE ON okrs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_okr_key_results_updated BEFORE UPDATE ON okr_key_results FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_calendar_events_updated BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_customer_ltv_updated BEFORE UPDATE ON customer_ltv FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_custom_dashboards_updated BEFORE UPDATE ON custom_dashboards FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_forms_updated BEFORE UPDATE ON forms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_tasks_updated BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_webhooks_updated BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- =============================================
-- GrowthOS Migration 005: Row Level Security Policies
-- All tables scoped by organization_id
-- =============================================

-- Helper function: get user's organization IDs
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS UUID[] AS $$
  SELECT ARRAY(
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: check if user belongs to org
CREATE OR REPLACE FUNCTION user_belongs_to_org(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM organization_members
    WHERE user_id = auth.uid() AND organization_id = org_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================
-- CORE TABLES
-- =============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their organizations" ON organizations
  FOR ALL USING (id = ANY(get_user_org_ids()));

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their org members" ON organization_members
  FOR ALL USING (organization_id = ANY(get_user_org_ids()));

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own profile" ON user_profiles
  FOR ALL USING (id = auth.uid());

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own preferences" ON user_preferences
  FOR ALL USING (user_id = auth.uid());

-- =============================================
-- ADS TABLES
-- =============================================

ALTER TABLE ad_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see ad accounts" ON ad_accounts
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see integrations" ON integrations
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE pixels_and_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see pixels" ON pixels_and_tracking
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see campaigns" ON campaigns
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE ad_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see ad groups" ON ad_groups
  FOR ALL USING (campaign_id IN (SELECT id FROM campaigns WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see ads" ON ads
  FOR ALL USING (ad_group_id IN (SELECT id FROM ad_groups WHERE campaign_id IN (SELECT id FROM campaigns WHERE organization_id = ANY(get_user_org_ids()))));

ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see keywords" ON keywords
  FOR ALL USING (ad_group_id IN (SELECT id FROM ad_groups WHERE campaign_id IN (SELECT id FROM campaigns WHERE organization_id = ANY(get_user_org_ids()))));

ALTER TABLE negative_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see negative keywords" ON negative_keywords
  FOR ALL USING (
    campaign_id IN (SELECT id FROM campaigns WHERE organization_id = ANY(get_user_org_ids()))
    OR ad_group_id IN (SELECT id FROM ad_groups WHERE campaign_id IN (SELECT id FROM campaigns WHERE organization_id = ANY(get_user_org_ids())))
  );

-- =============================================
-- METRICS TABLES
-- =============================================

ALTER TABLE metrics_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see daily metrics" ON metrics_daily
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE metrics_hourly ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see hourly metrics" ON metrics_hourly
  FOR ALL USING (user_belongs_to_org(organization_id));

-- =============================================
-- CRM TABLES
-- =============================================

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see contacts" ON contacts
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE contact_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see timeline" ON contact_timeline
  FOR ALL USING (contact_id IN (SELECT id FROM contacts WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see pipelines" ON pipelines
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see deals" ON deals
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see deal activities" ON deal_activities
  FOR ALL USING (deal_id IN (SELECT id FROM deals WHERE organization_id = ANY(get_user_org_ids())));

-- =============================================
-- FUNNEL TABLES
-- =============================================

ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see funnels" ON funnels
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see funnel events" ON funnel_events
  FOR ALL USING (funnel_id IN (SELECT id FROM funnels WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE funnel_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see funnel snapshots" ON funnel_snapshots
  FOR ALL USING (funnel_id IN (SELECT id FROM funnels WHERE organization_id = ANY(get_user_org_ids())));

-- =============================================
-- SALES & UTMIFY
-- =============================================

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see sales" ON sales
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE attribution ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see attribution" ON attribution
  FOR ALL USING (sale_id IN (SELECT id FROM sales WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE utmify_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see utmify sales" ON utmify_sales
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE utmify_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see utmify config" ON utmify_config
  FOR ALL USING (user_belongs_to_org(organization_id));

-- =============================================
-- CREATIVES & LANDING PAGES
-- =============================================

ALTER TABLE creative_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see creatives" ON creative_library
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE creative_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see creative perf" ON creative_performance
  FOR ALL USING (creative_id IN (SELECT id FROM creative_library WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE creative_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see creative variants" ON creative_variants
  FOR ALL USING (original_creative_id IN (SELECT id FROM creative_library WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see landing pages" ON landing_pages
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE page_metrics_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see page metrics" ON page_metrics_daily
  FOR ALL USING (landing_page_id IN (SELECT id FROM landing_pages WHERE organization_id = ANY(get_user_org_ids())));

-- =============================================
-- A/B TESTS
-- =============================================

ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see ab tests" ON ab_tests
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see ab results" ON ab_test_results
  FOR ALL USING (ab_test_id IN (SELECT id FROM ab_tests WHERE organization_id = ANY(get_user_org_ids())));

-- =============================================
-- AUTOMATIONS
-- =============================================

ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see sequences" ON email_sequences
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE email_sequence_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see steps" ON email_sequence_steps
  FOR ALL USING (sequence_id IN (SELECT id FROM email_sequences WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see sends" ON email_sends
  FOR ALL USING (contact_id IN (SELECT id FROM contacts WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see wa templates" ON whatsapp_templates
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see wa messages" ON whatsapp_messages
  FOR ALL USING (contact_id IN (SELECT id FROM contacts WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see automations" ON automation_rules
  FOR ALL USING (user_belongs_to_org(organization_id));

-- =============================================
-- AI & INSIGHTS
-- =============================================

ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see insights" ON insights
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE optimization_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see optimizations" ON optimization_logs
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see ai reports" ON ai_reports
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE ai_creative_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see ai suggestions" ON ai_creative_suggestions
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE ai_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see ai decisions" ON ai_decisions
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see ai analyses" ON ai_analyses
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see ai chat" ON ai_chat_messages
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see ai settings" ON ai_settings
  FOR ALL USING (user_belongs_to_org(organization_id));

-- =============================================
-- ALERTS & FINANCIAL
-- =============================================

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see alerts" ON alerts
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see alert rules" ON alert_rules
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see financial" ON financial_records
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see budgets" ON budgets
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE client_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see client reports" ON client_reports
  FOR ALL USING (user_belongs_to_org(organization_id));

-- =============================================
-- COMPETITORS & PORTAL
-- =============================================

ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see competitors" ON competitors
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE competitor_ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see competitor ads" ON competitor_ads
  FOR ALL USING (competitor_id IN (SELECT id FROM competitors WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE client_portal_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see portal users" ON client_portal_users
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE client_approval_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see approvals" ON client_approval_requests
  FOR ALL USING (user_belongs_to_org(organization_id));

-- =============================================
-- TEAM
-- =============================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see tasks" ON tasks
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see comments" ON task_comments
  FOR ALL USING (task_id IN (SELECT id FROM tasks WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see activity" ON activity_log
  FOR ALL USING (user_belongs_to_org(organization_id));

-- =============================================
-- AUDIENCES
-- =============================================

ALTER TABLE audiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see audiences" ON audiences
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE audience_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see audience contacts" ON audience_contacts
  FOR ALL USING (audience_id IN (SELECT id FROM audiences WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE audience_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see audience perf" ON audience_performance
  FOR ALL USING (audience_id IN (SELECT id FROM audiences WHERE organization_id = ANY(get_user_org_ids())));

-- =============================================
-- ANALYTICS TABLES
-- =============================================

ALTER TABLE search_terms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see search terms" ON search_terms
  FOR ALL USING (ad_account_id IN (SELECT id FROM ad_accounts WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE search_term_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see st actions" ON search_term_actions
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE metrics_by_hour ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see hourly metrics" ON metrics_by_hour
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE metrics_by_device ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see device metrics" ON metrics_by_device
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE bid_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see bid adj" ON bid_adjustments
  FOR ALL USING (campaign_id IN (SELECT id FROM campaigns WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE metrics_by_geo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see geo metrics" ON metrics_by_geo
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE geo_bid_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see geo adj" ON geo_bid_adjustments
  FOR ALL USING (campaign_id IN (SELECT id FROM campaigns WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE metrics_by_placement ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see placement metrics" ON metrics_by_placement
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE placement_exclusions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see exclusions" ON placement_exclusions
  FOR ALL USING (campaign_id IN (SELECT id FROM campaigns WHERE organization_id = ANY(get_user_org_ids())));

-- =============================================
-- REMAINING TABLES
-- =============================================

ALTER TABLE tracking_numbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see tracking nums" ON tracking_numbers
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see calls" ON calls
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE call_metrics_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see call metrics" ON call_metrics_daily
  FOR ALL USING (tracking_number_id IN (SELECT id FROM tracking_numbers WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see forms" ON forms
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see submissions" ON form_submissions
  FOR ALL USING (form_id IN (SELECT id FROM forms WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE form_metrics_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see form metrics" ON form_metrics_daily
  FOR ALL USING (form_id IN (SELECT id FROM forms WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see seo keywords" ON seo_keywords
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE seo_metrics_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see seo metrics" ON seo_metrics_daily
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE seo_vs_paid ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see seo vs paid" ON seo_vs_paid
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see goals" ON goals
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see milestones" ON goal_milestones
  FOR ALL USING (goal_id IN (SELECT id FROM goals WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE okrs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see okrs" ON okrs
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE okr_key_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see key results" ON okr_key_results
  FOR ALL USING (okr_id IN (SELECT id FROM okrs WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see calendar" ON calendar_events
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE calendar_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see cal templates" ON calendar_templates
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE customer_ltv ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see ltv" ON customer_ltv
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE ltv_by_segment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see ltv segments" ON ltv_by_segment
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE offline_conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see offline conv" ON offline_conversions
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE offline_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see uploads" ON offline_uploads
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE custom_dashboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see dashboards" ON custom_dashboards
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see widgets" ON dashboard_widgets
  FOR ALL USING (dashboard_id IN (SELECT id FROM custom_dashboards WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE utm_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see utms" ON utm_templates
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see events" ON tracking_events
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see api keys" ON api_keys
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see webhooks" ON webhooks
  FOR ALL USING (user_belongs_to_org(organization_id));

ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see webhook logs" ON webhook_logs
  FOR ALL USING (webhook_id IN (SELECT id FROM webhooks WHERE organization_id = ANY(get_user_org_ids())));

ALTER TABLE industry_benchmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone sees benchmarks" ON industry_benchmarks
  FOR SELECT USING (true);
-- =============================================
-- GrowthOS Seed Data — Dados realistas em PT-BR
-- Rodar após criar um usuário via signup
-- =============================================

-- 1. ORGANIZAÇÃO DEMO
INSERT INTO organizations (id, name, timezone, currency, industry) VALUES
('00000000-0000-0000-0000-000000000001', 'Acme Digital', 'America/Sao_Paulo', 'BRL', 'E-commerce')
ON CONFLICT DO NOTHING;

-- 2. AI SETTINGS
INSERT INTO ai_settings (organization_id, enabled, auto_execute, target_roas, max_cpa, max_budget_change_pct, min_data_days, daily_budget_limit, analysis_frequency_hours) VALUES
('00000000-0000-0000-0000-000000000001', true, true, 3.0, 45.00, 30, 3, 5000.00, 6)
ON CONFLICT (organization_id) DO NOTHING;

-- 3. UTMIFY CONFIG
INSERT INTO utmify_config (organization_id, is_active, webhook_url_generated) VALUES
('00000000-0000-0000-0000-000000000001', true, 'https://ndtfmhuuzyzgmpizplhd.supabase.co/functions/v1/utmify-webhook?org=00000000-0000-0000-0000-000000000001')
ON CONFLICT (organization_id) DO NOTHING;

-- 4. GOOGLE ADS ACCOUNT
INSERT INTO ad_accounts (id, organization_id, platform, account_id, account_name, status, currency_code, connected_at) VALUES
('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'google_ads', '123-456-7890', 'Acme Digital - Google Ads', 'connected', 'BRL', NOW())
ON CONFLICT DO NOTHING;

-- 5. CAMPAIGNS (6 campanhas com dados realistas)
INSERT INTO campaigns (id, ad_account_id, organization_id, platform, external_id, name, status, objective, daily_budget, impressions, clicks, cost, google_conversions, google_conversion_value, ctr, avg_cpc, real_sales_count, real_revenue, real_roas, real_cpa, health_score) VALUES
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'google_ads', '11111', 'Colágeno Premium - Search', 'active', 'SEARCH', 200.00, 45200, 1850, 8540.00, 92, 18400.00, 0.0409, 4.62, 38, 14820.00, 1.74, 224.74, 72),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'google_ads', '22222', 'Curso Marketing Digital - Display', 'active', 'DISPLAY', 150.00, 128000, 3200, 6300.00, 45, 22050.00, 0.025, 1.97, 22, 10868.00, 1.72, 286.36, 65),
('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'google_ads', '33333', 'Suplementos - Performance Max', 'active', 'PERFORMANCE_MAX', 300.00, 89000, 2100, 12450.00, 68, 27200.00, 0.0236, 5.93, 0, 0.00, 0.00, 0.00, 15),
('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'google_ads', '44444', 'Whey Protein - Search Brand', 'active', 'SEARCH', 80.00, 12000, 980, 1960.00, 35, 8750.00, 0.0817, 2.00, 28, 9800.00, 5.00, 70.00, 92),
('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'google_ads', '55555', 'Kit Emagrecimento - Shopping', 'paused', 'SHOPPING', 100.00, 34000, 890, 4200.00, 18, 3600.00, 0.0262, 4.72, 5, 1485.00, 0.35, 840.00, 28),
('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'google_ads', '66666', 'Vídeo Institucional - YouTube', 'active', 'VIDEO', 50.00, 67000, 420, 1050.00, 8, 1600.00, 0.0063, 2.50, 3, 891.00, 0.85, 350.00, 45)
ON CONFLICT DO NOTHING;

-- 6. AD GROUPS (3 por campanha de search)
INSERT INTO ad_groups (id, campaign_id, external_id, name, status, impressions, clicks, cost, conversions) VALUES
('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'ag1', 'Colágeno - Exato', 'active', 18000, 850, 3920.00, 42),
('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', 'ag2', 'Colágeno - Frase', 'active', 15200, 620, 2860.00, 30),
('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000101', 'ag3', 'Colágeno - Ampla', 'active', 12000, 380, 1760.00, 20),
('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000102', 'ag4', 'Marketing Digital - Interesse', 'active', 68000, 1800, 3540.00, 25),
('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000102', 'ag5', 'Marketing Digital - Remarketing', 'active', 42000, 1000, 1970.00, 15),
('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000102', 'ag6', 'Marketing Digital - Lookalike', 'active', 18000, 400, 790.00, 5),
('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000104', 'ag7', 'Whey - Marca Exato', 'active', 8000, 680, 1360.00, 28),
('00000000-0000-0000-0000-000000000208', '00000000-0000-0000-0000-000000000104', 'ag8', 'Whey - Genérico', 'active', 4000, 300, 600.00, 7)
ON CONFLICT DO NOTHING;

-- 7. KEYWORDS (10 para campanha Search)
INSERT INTO keywords (id, ad_group_id, external_id, text, match_type, bid, status, quality_score, impressions, clicks, cost, conversions) VALUES
('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', 'k1', 'colágeno hidrolisado', 'exact', 5.50, 'active', 8, 6200, 310, 1705.00, 18),
('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000201', 'k2', 'colágeno premium', 'exact', 4.80, 'active', 9, 4800, 280, 1344.00, 14),
('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000201', 'k3', 'melhor colágeno', 'exact', 6.20, 'active', 7, 3500, 150, 930.00, 8),
('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000202', 'k4', 'colágeno para pele', 'phrase', 3.90, 'active', 6, 5200, 210, 819.00, 10),
('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000202', 'k5', 'suplemento de colágeno', 'phrase', 4.10, 'active', 7, 4800, 200, 820.00, 9),
('00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000203', 'k6', 'colágeno', 'broad', 2.80, 'active', 5, 8000, 250, 700.00, 12),
('00000000-0000-0000-0000-000000000307', '00000000-0000-0000-0000-000000000207', 'k7', 'whey protein', 'exact', 2.00, 'active', 9, 5000, 420, 840.00, 20),
('00000000-0000-0000-0000-000000000308', '00000000-0000-0000-0000-000000000207', 'k8', 'whey protein isolado', 'exact', 2.50, 'active', 8, 3000, 260, 650.00, 12),
('00000000-0000-0000-0000-000000000309', '00000000-0000-0000-0000-000000000203', 'k9', 'rejuvenescimento pele', 'broad', 3.50, 'active', 4, 2200, 80, 280.00, 2),
('00000000-0000-0000-0000-000000000310', '00000000-0000-0000-0000-000000000208', 'k10', 'proteína barata', 'broad', 1.50, 'active', 3, 1500, 120, 180.00, 1)
ON CONFLICT DO NOTHING;

-- 8. CONTACTS (25 contatos brasileiros)
INSERT INTO contacts (id, organization_id, email, phone, name, source, lifecycle_stage, lead_score, churn_risk_score, predicted_ltv, last_activity_at) VALUES
('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000001', 'maria.silva@gmail.com', '11987654321', 'Maria Silva', 'google_ads', 'customer', 85, 10, 2450.00, NOW() - interval '1 day'),
('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000001', 'joao.santos@hotmail.com', '21976543210', 'João Santos', 'google_ads', 'customer', 72, 15, 1890.00, NOW() - interval '3 days'),
('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000001', 'ana.oliveira@gmail.com', '31965432109', 'Ana Oliveira', 'organic', 'mql', 65, 25, 980.00, NOW() - interval '2 days'),
('00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000001', 'pedro.costa@yahoo.com', '41954321098', 'Pedro Costa', 'google_ads', 'sql', 78, 8, 3200.00, NOW() - interval '1 day'),
('00000000-0000-0000-0000-000000000405', '00000000-0000-0000-0000-000000000001', 'carla.ferreira@gmail.com', '51943210987', 'Carla Ferreira', 'referral', 'customer', 90, 5, 4100.00, NOW() - interval '4 hours'),
('00000000-0000-0000-0000-000000000406', '00000000-0000-0000-0000-000000000001', 'lucas.almeida@outlook.com', '61932109876', 'Lucas Almeida', 'google_ads', 'lead', 35, 45, 500.00, NOW() - interval '7 days'),
('00000000-0000-0000-0000-000000000407', '00000000-0000-0000-0000-000000000001', 'fernanda.lima@gmail.com', '71921098765', 'Fernanda Lima', 'organic', 'subscriber', 15, 60, 200.00, NOW() - interval '14 days'),
('00000000-0000-0000-0000-000000000408', '00000000-0000-0000-0000-000000000001', 'roberto.gomes@gmail.com', '81910987654', 'Roberto Gomes', 'google_ads', 'customer', 82, 12, 2100.00, NOW() - interval '2 days'),
('00000000-0000-0000-0000-000000000409', '00000000-0000-0000-0000-000000000001', 'juliana.martins@hotmail.com', '85909876543', 'Juliana Martins', 'google_ads', 'opportunity', 70, 20, 1500.00, NOW() - interval '1 day'),
('00000000-0000-0000-0000-000000000410', '00000000-0000-0000-0000-000000000001', 'marcos.souza@gmail.com', '11898765432', 'Marcos Souza', 'google_ads', 'lead', 40, 35, 600.00, NOW() - interval '5 days'),
('00000000-0000-0000-0000-000000000411', '00000000-0000-0000-0000-000000000001', 'patricia.rocha@yahoo.com', '21887654321', 'Patrícia Rocha', 'organic', 'mql', 55, 30, 800.00, NOW() - interval '3 days'),
('00000000-0000-0000-0000-000000000412', '00000000-0000-0000-0000-000000000001', 'rafael.dias@gmail.com', '31876543210', 'Rafael Dias', 'google_ads', 'customer', 88, 8, 3500.00, NOW() - interval '6 hours'),
('00000000-0000-0000-0000-000000000413', '00000000-0000-0000-0000-000000000001', 'camila.nunes@outlook.com', '41865432109', 'Camila Nunes', 'referral', 'sql', 68, 18, 1200.00, NOW() - interval '2 days'),
('00000000-0000-0000-0000-000000000414', '00000000-0000-0000-0000-000000000001', 'thiago.barbosa@gmail.com', '51854321098', 'Thiago Barbosa', 'google_ads', 'lead', 28, 55, 350.00, NOW() - interval '10 days'),
('00000000-0000-0000-0000-000000000415', '00000000-0000-0000-0000-000000000001', 'amanda.castro@hotmail.com', '61843210987', 'Amanda Castro', 'google_ads', 'customer', 92, 3, 5200.00, NOW() - interval '12 hours'),
('00000000-0000-0000-0000-000000000416', '00000000-0000-0000-0000-000000000001', 'gustavo.ribeiro@gmail.com', '71832109876', 'Gustavo Ribeiro', 'organic', 'subscriber', 10, 70, 100.00, NOW() - interval '21 days'),
('00000000-0000-0000-0000-000000000417', '00000000-0000-0000-0000-000000000001', 'isabela.mendes@gmail.com', '81821098765', 'Isabela Mendes', 'google_ads', 'mql', 50, 28, 750.00, NOW() - interval '4 days'),
('00000000-0000-0000-0000-000000000418', '00000000-0000-0000-0000-000000000001', 'daniel.araujo@yahoo.com', '85810987654', 'Daniel Araújo', 'google_ads', 'lead', 32, 40, 420.00, NOW() - interval '8 days'),
('00000000-0000-0000-0000-000000000419', '00000000-0000-0000-0000-000000000001', 'larissa.freitas@gmail.com', '11809876543', 'Larissa Freitas', 'google_ads', 'customer', 80, 14, 1950.00, NOW() - interval '1 day'),
('00000000-0000-0000-0000-000000000420', '00000000-0000-0000-0000-000000000001', 'felipe.cardoso@outlook.com', '21798765432', 'Felipe Cardoso', 'organic', 'opportunity', 62, 22, 1100.00, NOW() - interval '3 days'),
('00000000-0000-0000-0000-000000000421', '00000000-0000-0000-0000-000000000001', 'bianca.moreira@gmail.com', '31787654321', 'Bianca Moreira', 'google_ads', 'sql', 75, 10, 2800.00, NOW() - interval '1 day'),
('00000000-0000-0000-0000-000000000422', '00000000-0000-0000-0000-000000000001', 'andre.pereira@gmail.com', '41776543210', 'André Pereira', 'referral', 'customer', 86, 6, 3800.00, NOW() - interval '2 days'),
('00000000-0000-0000-0000-000000000423', '00000000-0000-0000-0000-000000000001', 'natalia.vieira@hotmail.com', '51765432109', 'Natália Vieira', 'google_ads', 'lead', 22, 50, 280.00, NOW() - interval '12 days'),
('00000000-0000-0000-0000-000000000424', '00000000-0000-0000-0000-000000000001', 'bruno.santos@gmail.com', '61754321098', 'Bruno Santos Jr.', 'google_ads', 'mql', 58, 32, 900.00, NOW() - interval '5 days'),
('00000000-0000-0000-0000-000000000425', '00000000-0000-0000-0000-000000000001', 'carolina.lima@gmail.com', '71743210987', 'Carolina Lima', 'organic', 'subscriber', 8, 75, 50.00, NOW() - interval '30 days')
ON CONFLICT DO NOTHING;

-- 9. PIPELINE + DEALS
INSERT INTO pipelines (id, organization_id, name, stages) VALUES
('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000001', 'Pipeline Principal', '[{"id":"novo","name":"Novo Lead","order":1},{"id":"qualificado","name":"Qualificado","order":2},{"id":"proposta","name":"Proposta Enviada","order":3},{"id":"negociacao","name":"Negociação","order":4},{"id":"ganho","name":"Fechado Ganho","order":5},{"id":"perdido","name":"Fechado Perdido","order":6}]')
ON CONFLICT DO NOTHING;

INSERT INTO deals (id, contact_id, organization_id, pipeline_id, stage_id, title, value, probability, assigned_to) VALUES
('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', 'qualificado', 'Pacote Colágeno 6 meses', 1170.00, 40, NULL),
('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', 'proposta', 'Curso Marketing + Mentoria', 2497.00, 60, NULL),
('00000000-0000-0000-0000-000000000603', '00000000-0000-0000-0000-000000000409', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', 'negociacao', 'Kit Emagrecimento Premium', 897.00, 75, NULL),
('00000000-0000-0000-0000-000000000604', '00000000-0000-0000-0000-000000000410', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', 'novo', 'Whey Protein 3kg', 297.00, 20, NULL),
('00000000-0000-0000-0000-000000000605', '00000000-0000-0000-0000-000000000413', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', 'proposta', 'Assinatura Suplementos', 197.00, 55, NULL),
('00000000-0000-0000-0000-000000000606', '00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', 'ganho', 'Colágeno Premium + Vitamina D', 594.00, 100, NULL),
('00000000-0000-0000-0000-000000000607', '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', 'ganho', 'Curso Marketing Digital', 497.00, 100, NULL),
('00000000-0000-0000-0000-000000000608', '00000000-0000-0000-0000-000000000417', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', 'novo', 'Consulta Nutricional', 350.00, 15, NULL),
('00000000-0000-0000-0000-000000000609', '00000000-0000-0000-0000-000000000420', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', 'qualificado', 'Pack Suplementos Fitness', 780.00, 45, NULL),
('00000000-0000-0000-0000-000000000610', '00000000-0000-0000-0000-000000000414', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', 'perdido', 'Colágeno Básico', 197.00, 0, NULL)
ON CONFLICT DO NOTHING;

-- 10. UTMIFY SALES (20 vendas — 15 paid, 2 refunded, 2 waiting, 1 chargeback)
INSERT INTO utmify_sales (id, organization_id, order_id, status, revenue, utm_source, utm_campaign, utm_medium, customer_email, customer_name, product_name, matched_campaign_id, match_confidence, sale_date) VALUES
('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000001', 'UTM-001', 'paid', 297.00, 'google', 'colageno_search', 'cpc', 'maria.silva@gmail.com', 'Maria Silva', 'Colágeno Premium 60 caps', '00000000-0000-0000-0000-000000000101', 0.90, NOW() - interval '2 days'),
('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000001', 'UTM-002', 'paid', 497.00, 'google', 'curso_marketing', 'cpc', 'joao.santos@hotmail.com', 'João Santos', 'Curso Marketing Digital', '00000000-0000-0000-0000-000000000102', 0.85, NOW() - interval '3 days'),
('00000000-0000-0000-0000-000000000703', '00000000-0000-0000-0000-000000000001', 'UTM-003', 'paid', 197.00, 'google', 'whey_brand', 'cpc', 'pedro.costa@yahoo.com', 'Pedro Costa', 'Whey Protein 1kg', '00000000-0000-0000-0000-000000000104', 0.95, NOW() - interval '1 day'),
('00000000-0000-0000-0000-000000000704', '00000000-0000-0000-0000-000000000001', 'UTM-004', 'paid', 594.00, 'google', 'colageno_search', 'cpc', 'carla.ferreira@gmail.com', 'Carla Ferreira', 'Colágeno Premium + Vitamina D', '00000000-0000-0000-0000-000000000101', 0.90, NOW() - interval '4 days'),
('00000000-0000-0000-0000-000000000705', '00000000-0000-0000-0000-000000000001', 'UTM-005', 'paid', 297.00, 'google', 'whey_brand', 'cpc', 'rafael.dias@gmail.com', 'Rafael Dias', 'Whey Protein Isolado', '00000000-0000-0000-0000-000000000104', 0.95, NOW() - interval '2 days'),
('00000000-0000-0000-0000-000000000706', '00000000-0000-0000-0000-000000000001', 'UTM-006', 'paid', 497.00, 'google', 'curso_marketing', 'cpc', 'amanda.castro@hotmail.com', 'Amanda Castro', 'Curso Marketing + Bônus', '00000000-0000-0000-0000-000000000102', 0.85, NOW() - interval '5 days'),
('00000000-0000-0000-0000-000000000707', '00000000-0000-0000-0000-000000000001', 'UTM-007', 'paid', 297.00, 'google', 'colageno_search', 'cpc', 'roberto.gomes@gmail.com', 'Roberto Gomes', 'Colágeno Premium', '00000000-0000-0000-0000-000000000101', 0.90, NOW() - interval '1 day'),
('00000000-0000-0000-0000-000000000708', '00000000-0000-0000-0000-000000000001', 'UTM-008', 'paid', 197.00, 'google', 'whey_brand', 'cpc', 'andre.pereira@gmail.com', 'André Pereira', 'Whey Protein 2kg', '00000000-0000-0000-0000-000000000104', 0.95, NOW() - interval '3 days'),
('00000000-0000-0000-0000-000000000709', '00000000-0000-0000-0000-000000000001', 'UTM-009', 'paid', 891.00, 'google', 'youtube_inst', 'video', 'larissa.freitas@gmail.com', 'Larissa Freitas', 'Kit Completo Saúde', '00000000-0000-0000-0000-000000000106', 0.70, NOW() - interval '6 days'),
('00000000-0000-0000-0000-000000000710', '00000000-0000-0000-0000-000000000001', 'UTM-010', 'paid', 297.00, 'google', 'colageno_search', 'cpc', 'bianca.moreira@gmail.com', 'Bianca Moreira', 'Colágeno Premium', '00000000-0000-0000-0000-000000000101', 0.90, NOW() - interval '2 days'),
('00000000-0000-0000-0000-000000000711', '00000000-0000-0000-0000-000000000001', 'UTM-011', 'paid', 497.00, 'google', 'curso_marketing', 'cpc', 'felipe.cardoso@outlook.com', 'Felipe Cardoso', 'Curso Marketing Digital', '00000000-0000-0000-0000-000000000102', 0.85, NOW() - interval '7 days'),
('00000000-0000-0000-0000-000000000712', '00000000-0000-0000-0000-000000000001', 'UTM-012', 'paid', 197.00, 'google', 'whey_brand', 'cpc', 'marcos.souza@gmail.com', 'Marcos Souza', 'Whey Protein', '00000000-0000-0000-0000-000000000104', 0.95, NOW() - interval '4 days'),
('00000000-0000-0000-0000-000000000713', '00000000-0000-0000-0000-000000000001', 'UTM-013', 'paid', 297.00, 'google', 'kit_emag', 'cpc', 'juliana.martins@hotmail.com', 'Juliana Martins', 'Kit Emagrecimento', '00000000-0000-0000-0000-000000000105', 0.80, NOW() - interval '8 days'),
('00000000-0000-0000-0000-000000000714', '00000000-0000-0000-0000-000000000001', 'UTM-014', 'paid', 594.00, 'organic', NULL, NULL, 'isabela.mendes@gmail.com', 'Isabela Mendes', 'Colágeno + Whey Combo', NULL, 0.00, NOW() - interval '3 days'),
('00000000-0000-0000-0000-000000000715', '00000000-0000-0000-0000-000000000001', 'UTM-015', 'paid', 297.00, 'google', 'colageno_search', 'cpc', 'bruno.santos@gmail.com', 'Bruno Santos Jr.', 'Colágeno Premium', '00000000-0000-0000-0000-000000000101', 0.90, NOW() - interval '1 day'),
('00000000-0000-0000-0000-000000000716', '00000000-0000-0000-0000-000000000001', 'UTM-016', 'refunded', 297.00, 'google', 'colageno_search', 'cpc', 'thiago.barbosa@gmail.com', 'Thiago Barbosa', 'Colágeno Premium', '00000000-0000-0000-0000-000000000101', 0.90, NOW() - interval '10 days'),
('00000000-0000-0000-0000-000000000717', '00000000-0000-0000-0000-000000000001', 'UTM-017', 'refunded', 497.00, 'google', 'curso_marketing', 'cpc', 'natalia.vieira@hotmail.com', 'Natália Vieira', 'Curso Marketing Digital', '00000000-0000-0000-0000-000000000102', 0.85, NOW() - interval '12 days'),
('00000000-0000-0000-0000-000000000718', '00000000-0000-0000-0000-000000000001', 'UTM-018', 'waiting_payment', 297.00, 'google', 'whey_brand', 'cpc', 'daniel.araujo@yahoo.com', 'Daniel Araújo', 'Whey Protein', '00000000-0000-0000-0000-000000000104', 0.95, NOW() - interval '1 day'),
('00000000-0000-0000-0000-000000000719', '00000000-0000-0000-0000-000000000001', 'UTM-019', 'waiting_payment', 594.00, 'google', 'colageno_search', 'cpc', 'gustavo.ribeiro@gmail.com', 'Gustavo Ribeiro', 'Colágeno + Vitamina D', '00000000-0000-0000-0000-000000000101', 0.90, NOW() - interval '2 days'),
('00000000-0000-0000-0000-000000000720', '00000000-0000-0000-0000-000000000001', 'UTM-020', 'chargedback', 197.00, 'google', 'kit_emag', 'cpc', 'carolina.lima@gmail.com', 'Carolina Lima', 'Kit Emagrecimento Básico', '00000000-0000-0000-0000-000000000105', 0.80, NOW() - interval '15 days')
ON CONFLICT DO NOTHING;

-- 11. INSIGHTS
INSERT INTO insights (organization_id, type, severity, title, description, suggested_action, status) VALUES
('00000000-0000-0000-0000-000000000001', 'campaign_alert', 'critical', 'Campanha gastando sem vendas reais', 'A campanha "Suplementos - Performance Max" gastou R$12.450 com 68 conversões Google, mas ZERO vendas reais na Utmify. Provavelmente tráfego de baixa qualidade.', 'Pausar campanha imediatamente e investigar fonte de tráfego', 'new'),
('00000000-0000-0000-0000-000000000001', 'budget_suggestion', 'warning', 'Campanha vencedora com orçamento baixo', 'A campanha "Whey Protein - Search Brand" tem ROAS real de 5.0x mas orçamento diário de apenas R$80. Há potencial de escalar.', 'Aumentar orçamento para R$150/dia (+87%)', 'new'),
('00000000-0000-0000-0000-000000000001', 'keyword_opportunity', 'info', 'Keyword com alto QS e bom CPA', 'A keyword "colágeno premium" tem Quality Score 9 e CPA de R$96. É a keyword mais eficiente da conta.', 'Considerar aumentar lance em 20% para ganhar mais impressões', 'new'),
('00000000-0000-0000-0000-000000000001', 'creative_winner', 'info', 'Criativo vencedor identificado', 'O anúncio "Colágeno Premium - Resultados em 30 dias" tem CTR 3.4x acima da média da campanha.', 'Criar variações baseadas neste criativo', 'seen'),
('00000000-0000-0000-0000-000000000001', 'funnel_bottleneck', 'warning', 'Gargalo na conversão da landing page', 'Sua landing page "colageno-premium.com.br" tem bounce rate de 68%, muito acima da média de 45% do setor.', 'Otimizar velocidade de carregamento e CTA acima da dobra', 'new'),
('00000000-0000-0000-0000-000000000001', 'campaign_alert', 'warning', 'CPA subindo na campanha Display', 'O CPA da campanha "Curso Marketing Digital - Display" subiu 23% nos últimos 7 dias. CPA atual: R$286.', 'Revisar segmentação de público e considerar excluir placements ruins', 'new'),
('00000000-0000-0000-0000-000000000001', 'keyword_opportunity', 'info', 'Termos de busca desperdiçando budget', 'R$1.840 gastos em termos de busca irrelevantes este mês, representando 23% do budget da campanha Search.', 'Adicionar 15 palavras negativas sugeridas', 'new'),
('00000000-0000-0000-0000-000000000001', 'budget_suggestion', 'info', 'Kit Emagrecimento com ROAS abaixo de 1x', 'A campanha "Kit Emagrecimento - Shopping" tem ROAS real de 0.35x. Está perdendo R$2.715 este mês.', 'Pausar ou reduzir budget drasticamente', 'new')
ON CONFLICT DO NOTHING;

-- 12. AI DECISIONS
INSERT INTO ai_decisions (organization_id, decision_type, status, campaign_id, reasoning, action_details, confidence, priority) VALUES
('00000000-0000-0000-0000-000000000001', 'pause_campaign', 'executed', '00000000-0000-0000-0000-000000000103', 'Campanha "Suplementos - Performance Max" gastou R$12.450 sem nenhuma venda real na Utmify. Google reporta 68 conversões mas são provavelmente leads de baixa qualidade.', '{"campaignName":"Suplementos - Performance Max","action":"pause"}', 0.95, 1),
('00000000-0000-0000-0000-000000000001', 'increase_budget', 'executed', '00000000-0000-0000-0000-000000000104', 'Campanha "Whey Protein - Search Brand" tem ROAS real de 5.0x. É a campanha mais lucrativa da conta. Orçamento atual de R$80/dia é muito conservador.', '{"campaignName":"Whey Protein - Search Brand","oldBudget":80,"newBudget":130,"changePct":62}', 0.88, 2),
('00000000-0000-0000-0000-000000000001', 'add_negative_keyword', 'pending', '00000000-0000-0000-0000-000000000101', 'Termos como "colágeno grátis", "colágeno amostra" e "colágeno receita" estão gastando R$320/mês sem conversões.', '{"keywords":["colágeno grátis","colágeno amostra","colágeno receita caseira"],"matchType":"PHRASE"}', 0.82, 3),
('00000000-0000-0000-0000-000000000001', 'decrease_budget', 'pending', '00000000-0000-0000-0000-000000000105', 'Campanha "Kit Emagrecimento - Shopping" tem ROAS real de 0.35x. Reduzir budget de R$100 para R$30/dia enquanto otimiza.', '{"campaignName":"Kit Emagrecimento - Shopping","oldBudget":100,"newBudget":30,"changePct":-70}', 0.90, 2),
('00000000-0000-0000-0000-000000000001', 'scale_campaign', 'failed', '00000000-0000-0000-0000-000000000102', 'Tentativa de escalar "Curso Marketing Digital - Display" de R$150 para R$250/dia.', '{"error":"API rate limit exceeded"}', 0.75, 4)
ON CONFLICT DO NOTHING;

-- 13. ALERTS
INSERT INTO alerts (organization_id, type, severity, title, message, threshold_value, current_value, status, triggered_at) VALUES
('00000000-0000-0000-0000-000000000001', 'cpa', 'critical', 'CPA muito alto na Performance Max', 'CPA da campanha "Suplementos - Performance Max" está infinito (0 vendas reais com R$12.450 gastos)', 45.00, 0, 'active', NOW() - interval '2 hours'),
('00000000-0000-0000-0000-000000000001', 'roas', 'high', 'ROAS abaixo do target', 'ROAS real da campanha "Kit Emagrecimento" é 0.35x, muito abaixo do target de 3.0x', 3.00, 0.35, 'active', NOW() - interval '6 hours'),
('00000000-0000-0000-0000-000000000001', 'budget_spent_pct', 'medium', 'Budget 78% utilizado', 'O budget mensal de "Google Ads Geral" está 78% utilizado com 12 dias restantes', 80.00, 78.00, 'active', NOW() - interval '1 day'),
('00000000-0000-0000-0000-000000000001', 'ctr', 'low', 'CTR abaixo da média', 'CTR da campanha YouTube caiu para 0.63%, abaixo do benchmark de 1.5%', 1.50, 0.63, 'acknowledged', NOW() - interval '3 days'),
('00000000-0000-0000-0000-000000000001', 'cpa', 'medium', 'CPA subindo na Display', 'CPA da campanha Display subiu 23% nos últimos 7 dias', 45.00, 286.36, 'active', NOW() - interval '12 hours')
ON CONFLICT DO NOTHING;

-- 14. ALERT RULES
INSERT INTO alert_rules (organization_id, metric, operator, threshold, severity, channels, enabled) VALUES
('00000000-0000-0000-0000-000000000001', 'cpa', '>', 50.00, 'high', '["dashboard","email"]', true),
('00000000-0000-0000-0000-000000000001', 'roas', '<', 1.00, 'critical', '["dashboard","email"]', true),
('00000000-0000-0000-0000-000000000001', 'ctr', '<', 1.00, 'medium', '["dashboard"]', true),
('00000000-0000-0000-0000-000000000001', 'budget_spent_pct', '>', 80.00, 'high', '["dashboard","email"]', true)
ON CONFLICT DO NOTHING;

-- 15. BUDGETS
INSERT INTO budgets (organization_id, name, amount, period, alert_threshold_pct, spent_amount, start_date, end_date) VALUES
('00000000-0000-0000-0000-000000000001', 'Google Ads - Março', 35000.00, 'monthly', 80, 27300.00, '2026-03-01', '2026-03-31'),
('00000000-0000-0000-0000-000000000001', 'Campanha Colágeno', 6000.00, 'monthly', 85, 5100.00, '2026-03-01', '2026-03-31'),
('00000000-0000-0000-0000-000000000001', 'Campanha Whey', 2400.00, 'monthly', 90, 1560.00, '2026-03-01', '2026-03-31')
ON CONFLICT DO NOTHING;

-- 16. GOALS
INSERT INTO goals (organization_id, name, type, target_value, current_value, unit, period_start, period_end, status) VALUES
('00000000-0000-0000-0000-000000000001', 'Gerar 200 vendas/mês', 'sales', 200, 96, 'vendas', '2026-03-01', '2026-03-31', 'at_risk'),
('00000000-0000-0000-0000-000000000001', 'ROAS real acima de 3x', 'roas', 3.0, 2.1, 'x', '2026-03-01', '2026-03-31', 'behind'),
('00000000-0000-0000-0000-000000000001', 'CPA abaixo de R$40', 'cpa', 40.0, 52.3, 'R$', '2026-03-01', '2026-03-31', 'behind'),
('00000000-0000-0000-0000-000000000001', 'Reduzir churn para 5%', 'custom', 5.0, 8.2, '%', '2026-03-01', '2026-03-31', 'behind'),
('00000000-0000-0000-0000-000000000001', '500 novos leads', 'leads', 500, 380, 'leads', '2026-03-01', '2026-03-31', 'on_track')
ON CONFLICT DO NOTHING;

-- 17. TASKS
INSERT INTO tasks (organization_id, title, type, status, priority, due_date) VALUES
('00000000-0000-0000-0000-000000000001', 'Revisar criativos campanha Colágeno', 'create_creative', 'todo', 'high', '2026-03-20'),
('00000000-0000-0000-0000-000000000001', 'Analisar search terms últimos 30 dias', 'review_performance', 'in_progress', 'medium', '2026-03-18'),
('00000000-0000-0000-0000-000000000001', 'Criar landing page para Whey', 'other', 'todo', 'high', '2026-03-22'),
('00000000-0000-0000-0000-000000000001', 'Reunião com cliente Acme', 'client_meeting', 'review', 'medium', '2026-03-17'),
('00000000-0000-0000-0000-000000000001', 'Configurar remarketing YouTube', 'launch_campaign', 'done', 'low', '2026-03-15')
ON CONFLICT DO NOTHING;

-- 18. LANDING PAGES
INSERT INTO landing_pages (id, organization_id, url, name, platform, status) VALUES
('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000001', 'https://colageno-premium.com.br', 'Colágeno Premium - LP Principal', 'custom', 'active'),
('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000001', 'https://curso-marketing.com.br', 'Curso Marketing Digital - LP', 'wordpress', 'active'),
('00000000-0000-0000-0000-000000000803', '00000000-0000-0000-0000-000000000001', 'https://wheyprotein.com.br/oferta', 'Whey Protein - Oferta Especial', 'custom', 'active'),
('00000000-0000-0000-0000-000000000804', '00000000-0000-0000-0000-000000000001', 'https://kit-emagrecimento.com.br', 'Kit Emagrecimento - LP', 'webflow', 'active'),
('00000000-0000-0000-0000-000000000805', '00000000-0000-0000-0000-000000000001', 'https://acmedigital.com.br/blog', 'Blog Acme Digital', 'wordpress', 'active')
ON CONFLICT DO NOTHING;

-- 19. COMPETITORS
INSERT INTO competitors (organization_id, name, domain, notes) VALUES
('00000000-0000-0000-0000-000000000001', 'NutriVida', 'nutrivida.com.br', 'Principal concorrente em suplementos. Forte no Google Ads e Meta.'),
('00000000-0000-0000-0000-000000000001', 'FitStore Brasil', 'fitstorerbrasil.com.br', 'Concorrente em whey protein. Preços agressivos.'),
('00000000-0000-0000-0000-000000000001', 'BelezaNatural', 'belezanatural.com.br', 'Concorrente em colágeno. Forte no Instagram/TikTok.')
ON CONFLICT DO NOTHING;

-- 20. CALENDAR EVENTS
INSERT INTO calendar_events (organization_id, title, type, start_date, end_date, color, status) VALUES
('00000000-0000-0000-0000-000000000001', 'Lançamento Campanha Colágeno V2', 'campaign_launch', '2026-03-20 09:00', '2026-03-20 10:00', '#448AFF', 'scheduled'),
('00000000-0000-0000-0000-000000000001', 'Deadline Criativos YouTube', 'creative_deadline', '2026-03-18 18:00', '2026-03-18 18:00', '#6C5CE7', 'scheduled'),
('00000000-0000-0000-0000-000000000001', 'Reunião Cliente Acme', 'client_meeting', '2026-03-17 14:00', '2026-03-17 15:00', '#00E676', 'scheduled'),
('00000000-0000-0000-0000-000000000001', 'Relatório Semanal', 'report_due', '2026-03-21 08:00', '2026-03-21 08:00', '#FFB300', 'scheduled'),
('00000000-0000-0000-0000-000000000001', 'Início Teste A/B Landing Page', 'test_start', '2026-03-19 00:00', '2026-04-02 23:59', '#00D2FF', 'scheduled'),
('00000000-0000-0000-0000-000000000001', 'Promoção Dia do Consumidor', 'promo_start', '2026-03-15 00:00', '2026-03-15 23:59', '#FF5252', 'scheduled')
ON CONFLICT DO NOTHING;

-- 21. SEO KEYWORDS
INSERT INTO seo_keywords (organization_id, keyword, current_position, previous_position, search_volume, difficulty, url) VALUES
('00000000-0000-0000-0000-000000000001', 'colágeno hidrolisado', 3, 5, 22000, 45.0, 'https://colageno-premium.com.br'),
('00000000-0000-0000-0000-000000000001', 'melhor colágeno', 7, 8, 18000, 52.0, 'https://colageno-premium.com.br/blog'),
('00000000-0000-0000-0000-000000000001', 'whey protein barato', 12, 15, 33000, 38.0, 'https://wheyprotein.com.br/oferta'),
('00000000-0000-0000-0000-000000000001', 'curso marketing digital', 18, 22, 27000, 65.0, 'https://curso-marketing.com.br'),
('00000000-0000-0000-0000-000000000001', 'suplementos para emagrecer', 25, 20, 14000, 42.0, 'https://kit-emagrecimento.com.br'),
('00000000-0000-0000-0000-000000000001', 'colágeno para pele', 5, 6, 12000, 40.0, 'https://colageno-premium.com.br'),
('00000000-0000-0000-0000-000000000001', 'proteína isolada', 15, 18, 9800, 35.0, 'https://wheyprotein.com.br'),
('00000000-0000-0000-0000-000000000001', 'marketing digital curso online', 22, 30, 8500, 58.0, 'https://curso-marketing.com.br'),
('00000000-0000-0000-0000-000000000001', 'colágeno tipo 2', 8, 10, 6500, 32.0, 'https://colageno-premium.com.br'),
('00000000-0000-0000-0000-000000000001', 'whey protein isolado preço', 10, 12, 15000, 28.0, 'https://wheyprotein.com.br/oferta')
ON CONFLICT DO NOTHING;
