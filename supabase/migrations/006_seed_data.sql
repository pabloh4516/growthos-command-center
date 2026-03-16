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
