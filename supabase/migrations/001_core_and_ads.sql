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
