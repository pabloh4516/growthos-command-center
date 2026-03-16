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
