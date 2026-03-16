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
