-- =============================================
-- GrowthOS Seed Complement — tabelas que faltaram
-- =============================================

-- METRICS DAILY (30 dias para campanha Colágeno)
INSERT INTO metrics_daily (organization_id, date, entity_type, entity_id, impressions, clicks, cost, conversions, revenue, ctr, cpc, roas, cpa, real_sales, real_revenue) VALUES
('00000000-0000-0000-0000-000000000001', '2026-03-15', 'campaign', '00000000-0000-0000-0000-000000000101', 1520, 62, 286, 3, 891, 0.041, 4.61, 3.11, 45.3, 2, 594),
('00000000-0000-0000-0000-000000000001', '2026-03-14', 'campaign', '00000000-0000-0000-0000-000000000101', 1480, 58, 268, 4, 1188, 0.039, 4.62, 4.43, 33.5, 3, 891),
('00000000-0000-0000-0000-000000000001', '2026-03-13', 'campaign', '00000000-0000-0000-0000-000000000101', 1550, 65, 300, 3, 891, 0.042, 4.62, 2.97, 50.0, 2, 594),
('00000000-0000-0000-0000-000000000001', '2026-03-12', 'campaign', '00000000-0000-0000-0000-000000000101', 1600, 70, 323, 5, 1485, 0.044, 4.61, 4.60, 32.3, 4, 1188),
('00000000-0000-0000-0000-000000000001', '2026-03-11', 'campaign', '00000000-0000-0000-0000-000000000101', 1420, 55, 254, 2, 594, 0.039, 4.62, 2.34, 63.5, 1, 297),
('00000000-0000-0000-0000-000000000001', '2026-03-10', 'campaign', '00000000-0000-0000-0000-000000000101', 1490, 60, 277, 4, 1188, 0.040, 4.62, 4.29, 34.6, 3, 891),
('00000000-0000-0000-0000-000000000001', '2026-03-09', 'campaign', '00000000-0000-0000-0000-000000000101', 1530, 63, 291, 3, 891, 0.041, 4.62, 3.06, 48.5, 2, 594),
('00000000-0000-0000-0000-000000000001', '2026-03-08', 'campaign', '00000000-0000-0000-0000-000000000101', 1570, 68, 314, 4, 1188, 0.043, 4.62, 3.78, 39.3, 3, 891),
('00000000-0000-0000-0000-000000000001', '2026-03-07', 'campaign', '00000000-0000-0000-0000-000000000101', 1450, 57, 263, 3, 891, 0.039, 4.61, 3.39, 43.8, 2, 594),
('00000000-0000-0000-0000-000000000001', '2026-03-06', 'campaign', '00000000-0000-0000-0000-000000000101', 1510, 61, 282, 5, 1485, 0.040, 4.62, 5.27, 28.2, 4, 1188),
('00000000-0000-0000-0000-000000000001', '2026-03-05', 'campaign', '00000000-0000-0000-0000-000000000101', 1460, 56, 259, 2, 594, 0.038, 4.63, 2.29, 64.8, 1, 297),
('00000000-0000-0000-0000-000000000001', '2026-03-04', 'campaign', '00000000-0000-0000-0000-000000000101', 1540, 64, 296, 4, 1188, 0.042, 4.63, 4.01, 37.0, 3, 891),
('00000000-0000-0000-0000-000000000001', '2026-03-03', 'campaign', '00000000-0000-0000-0000-000000000101', 1580, 67, 310, 3, 891, 0.042, 4.63, 2.87, 51.7, 2, 594),
('00000000-0000-0000-0000-000000000001', '2026-03-02', 'campaign', '00000000-0000-0000-0000-000000000101', 1500, 59, 273, 4, 1188, 0.039, 4.63, 4.35, 34.1, 3, 891),
('00000000-0000-0000-0000-000000000001', '2026-03-01', 'campaign', '00000000-0000-0000-0000-000000000101', 1470, 58, 268, 3, 891, 0.039, 4.62, 3.32, 44.7, 2, 594),
-- Campanha Whey (melhor performer)
('00000000-0000-0000-0000-000000000001', '2026-03-15', 'campaign', '00000000-0000-0000-0000-000000000104', 420, 34, 68, 3, 891, 0.081, 2.00, 13.10, 11.3, 3, 891),
('00000000-0000-0000-0000-000000000001', '2026-03-14', 'campaign', '00000000-0000-0000-0000-000000000104', 390, 30, 60, 2, 594, 0.077, 2.00, 9.90, 15.0, 2, 594),
('00000000-0000-0000-0000-000000000001', '2026-03-13', 'campaign', '00000000-0000-0000-0000-000000000104', 410, 32, 64, 3, 891, 0.078, 2.00, 13.92, 10.7, 3, 891),
('00000000-0000-0000-0000-000000000001', '2026-03-12', 'campaign', '00000000-0000-0000-0000-000000000104', 440, 36, 72, 2, 594, 0.082, 2.00, 8.25, 18.0, 2, 594),
('00000000-0000-0000-0000-000000000001', '2026-03-11', 'campaign', '00000000-0000-0000-0000-000000000104', 380, 28, 56, 2, 594, 0.074, 2.00, 10.61, 14.0, 2, 594)
ON CONFLICT DO NOTHING;

-- CREATIVE LIBRARY
INSERT INTO creative_library (organization_id, name, type, platform, tags) VALUES
('00000000-0000-0000-0000-000000000001', 'Colágeno Premium - Resultados 30 dias', 'image', 'google_ads', '["colageno","vencedor"]'),
('00000000-0000-0000-0000-000000000001', 'Whey Protein - Oferta Imperdível', 'image', 'google_ads', '["whey","oferta"]'),
('00000000-0000-0000-0000-000000000001', 'Curso Marketing - Depoimento Maria', 'video', 'google_ads', '["curso","depoimento"]'),
('00000000-0000-0000-0000-000000000001', 'Kit Emagrecimento - Antes e Depois', 'carousel', 'google_ads', '["kit","antes-depois"]'),
('00000000-0000-0000-0000-000000000001', 'Suplementos - Banner Display', 'image', 'google_ads', '["display","banner"]')
ON CONFLICT DO NOTHING;

-- EMAIL SEQUENCES
INSERT INTO email_sequences (organization_id, name, trigger_type, status) VALUES
('00000000-0000-0000-0000-000000000001', 'Boas-vindas', 'lead_created', 'active'),
('00000000-0000-0000-0000-000000000001', 'Carrinho Abandonado', 'cart_abandoned', 'active'),
('00000000-0000-0000-0000-000000000001', 'Reativação 30 dias', 'inactive_30d', 'active')
ON CONFLICT DO NOTHING;

-- A/B TESTS
INSERT INTO ab_tests (organization_id, name, type, status, variants, statistical_significance, sample_size_needed, winner_variant) VALUES
('00000000-0000-0000-0000-000000000001', 'LP Colágeno - CTA Verde vs Azul', 'page', 'running', '[{"id":"A","name":"CTA Verde"},{"id":"B","name":"CTA Azul"}]', 78.5, 2500, NULL),
('00000000-0000-0000-0000-000000000001', 'Copy Whey - Preço vs Benefício', 'copy', 'completed', '[{"id":"A","name":"Foco Preço"},{"id":"B","name":"Foco Benefício"}]', 96.2, 1800, 'B'),
('00000000-0000-0000-0000-000000000001', 'Criativo Display - Pessoa vs Produto', 'creative', 'draft', '[{"id":"A","name":"Com Pessoa"},{"id":"B","name":"Só Produto"}]', 0, 3000, NULL)
ON CONFLICT DO NOTHING;

-- FINANCIAL RECORDS (ad spend diário + custos operacionais + receita)
INSERT INTO financial_records (organization_id, type, amount, currency, category, description, date) VALUES
('00000000-0000-0000-0000-000000000001', 'ad_spend', 850, 'BRL', 'Google Ads', 'Gasto diário', '2026-03-01'),
('00000000-0000-0000-0000-000000000001', 'ad_spend', 920, 'BRL', 'Google Ads', 'Gasto diário', '2026-03-02'),
('00000000-0000-0000-0000-000000000001', 'ad_spend', 780, 'BRL', 'Google Ads', 'Gasto diário', '2026-03-03'),
('00000000-0000-0000-0000-000000000001', 'ad_spend', 1050, 'BRL', 'Google Ads', 'Gasto diário', '2026-03-04'),
('00000000-0000-0000-0000-000000000001', 'ad_spend', 890, 'BRL', 'Google Ads', 'Gasto diário', '2026-03-05'),
('00000000-0000-0000-0000-000000000001', 'ad_spend', 960, 'BRL', 'Google Ads', 'Gasto diário', '2026-03-06'),
('00000000-0000-0000-0000-000000000001', 'ad_spend', 830, 'BRL', 'Google Ads', 'Gasto diário', '2026-03-07'),
('00000000-0000-0000-0000-000000000001', 'ad_spend', 1100, 'BRL', 'Google Ads', 'Gasto diário', '2026-03-08'),
('00000000-0000-0000-0000-000000000001', 'ad_spend', 940, 'BRL', 'Google Ads', 'Gasto diário', '2026-03-09'),
('00000000-0000-0000-0000-000000000001', 'ad_spend', 870, 'BRL', 'Google Ads', 'Gasto diário', '2026-03-10'),
('00000000-0000-0000-0000-000000000001', 'ad_spend', 990, 'BRL', 'Google Ads', 'Gasto diário', '2026-03-11'),
('00000000-0000-0000-0000-000000000001', 'ad_spend', 1020, 'BRL', 'Google Ads', 'Gasto diário', '2026-03-12'),
('00000000-0000-0000-0000-000000000001', 'ad_spend', 880, 'BRL', 'Google Ads', 'Gasto diário', '2026-03-13'),
('00000000-0000-0000-0000-000000000001', 'ad_spend', 950, 'BRL', 'Google Ads', 'Gasto diário', '2026-03-14'),
('00000000-0000-0000-0000-000000000001', 'ad_spend', 910, 'BRL', 'Google Ads', 'Gasto diário', '2026-03-15'),
('00000000-0000-0000-0000-000000000001', 'operational_cost', 150, 'BRL', 'Ferramentas', 'Supabase Pro', '2026-03-01'),
('00000000-0000-0000-0000-000000000001', 'operational_cost', 80, 'BRL', 'Ferramentas', 'Google Workspace', '2026-03-01'),
('00000000-0000-0000-0000-000000000001', 'operational_cost', 3000, 'BRL', 'Equipe', 'Designer Freelancer', '2026-03-01'),
('00000000-0000-0000-0000-000000000001', 'operational_cost', 500, 'BRL', 'Ferramentas', 'Semrush', '2026-03-01'),
('00000000-0000-0000-0000-000000000001', 'revenue', 37864, 'BRL', 'Vendas', 'Receita Utmify Março', '2026-03-15')
ON CONFLICT DO NOTHING;

-- AUTOMATION RULES
INSERT INTO automation_rules (organization_id, name, trigger_type, conditions, actions, status, executions_count) VALUES
('00000000-0000-0000-0000-000000000001', 'Lead quente → notificar vendedor', 'score_reached', '[{"field":"lead_score","operator":">","value":70}]', '[{"type":"notify","target":"vendedor"}]', 'active', 45),
('00000000-0000-0000-0000-000000000001', 'Form submit → iniciar sequência', 'form_submit', '[]', '[{"type":"start_sequence","sequence":"Boas-vindas"}]', 'active', 128),
('00000000-0000-0000-0000-000000000001', 'Churn alto → reativação', 'churn_risk_high', '[{"field":"churn_risk_score","operator":">","value":60}]', '[{"type":"start_sequence","sequence":"Reativação 30 dias"}]', 'active', 23)
ON CONFLICT DO NOTHING;

-- CONTACT TIMELINE (eventos para alguns contatos)
INSERT INTO contact_timeline (contact_id, event_type, event_data, timestamp) VALUES
('00000000-0000-0000-0000-000000000401', 'ad_click', '{"campaign":"Colágeno Premium - Search","keyword":"colágeno premium"}', NOW() - interval '15 days'),
('00000000-0000-0000-0000-000000000401', 'page_view', '{"url":"https://colageno-premium.com.br"}', NOW() - interval '15 days'),
('00000000-0000-0000-0000-000000000401', 'form_submit', '{"form":"Formulário de Interesse"}', NOW() - interval '14 days'),
('00000000-0000-0000-0000-000000000401', 'email_open', '{"subject":"Bem-vinda à Acme Digital!"}', NOW() - interval '13 days'),
('00000000-0000-0000-0000-000000000401', 'sale', '{"product":"Colágeno Premium","value":297}', NOW() - interval '10 days'),
('00000000-0000-0000-0000-000000000402', 'ad_click', '{"campaign":"Curso Marketing Digital"}', NOW() - interval '20 days'),
('00000000-0000-0000-0000-000000000402', 'page_view', '{"url":"https://curso-marketing.com.br"}', NOW() - interval '20 days'),
('00000000-0000-0000-0000-000000000402', 'form_submit', '{"form":"Inscrição Curso"}', NOW() - interval '18 days'),
('00000000-0000-0000-0000-000000000402', 'email_click', '{"subject":"Sua vaga está reservada"}', NOW() - interval '16 days'),
('00000000-0000-0000-0000-000000000402', 'sale', '{"product":"Curso Marketing Digital","value":497}', NOW() - interval '12 days'),
('00000000-0000-0000-0000-000000000404', 'ad_click', '{"campaign":"Whey Protein - Search Brand"}', NOW() - interval '8 days'),
('00000000-0000-0000-0000-000000000404', 'page_view', '{"url":"https://wheyprotein.com.br/oferta"}', NOW() - interval '8 days'),
('00000000-0000-0000-0000-000000000404', 'sale', '{"product":"Whey Protein 1kg","value":197}', NOW() - interval '5 days')
ON CONFLICT DO NOTHING;

-- OPTIMIZATION LOGS
INSERT INTO optimization_logs (organization_id, action_type, entity_type, entity_id, before_state, after_state, reason, estimated_impact, status, suggested_at, executed_at) VALUES
('00000000-0000-0000-0000-000000000001', 'pause_keyword', 'keyword', '00000000-0000-0000-0000-000000000309', '{"status":"active","cost":280}', '{"status":"paused"}', 'Keyword "rejuvenescimento pele" com QS 4 e apenas 2 conversões. CPA R$140.', 'Economia de R$280/mês', 'executed', NOW() - interval '5 days', NOW() - interval '5 days'),
('00000000-0000-0000-0000-000000000001', 'increase_budget', 'campaign', '00000000-0000-0000-0000-000000000104', '{"budget":80}', '{"budget":130}', 'ROAS real 5.0x — melhor campanha da conta. Escalar orçamento.', '+15 vendas/mês estimadas', 'executed', NOW() - interval '3 days', NOW() - interval '3 days')
ON CONFLICT DO NOTHING;
