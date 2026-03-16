import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0';
import { getCorsHeaders, handlePreflight, jsonResponse } from '../_shared/cors.ts';
import { validateCronSecret, validateAuth } from '../_shared/auth.ts';
import { getValidAccessToken, googleAdsSearch, GAQL } from '../_shared/google-ads-api.ts';

/**
 * GrowthOS — Google Ads Sync (Cron Job)
 * Syncs campaigns, ad groups, keywords, metrics from all connected Google Ads accounts
 */

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return handlePreflight(corsHeaders);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    // Auth: cron secret or user token
    const isCron = validateCronSecret(req);
    let orgFilter: string | null = null;

    if (!isCron) {
      const { user } = await validateAuth(req);
      const body = await req.json().catch(() => ({}));
      orgFilter = body.organizationId || null;
    }

    // Get all connected Google Ads accounts
    let query = supabase
      .from('ad_accounts')
      .select('*')
      .eq('platform', 'google_ads')
      .eq('status', 'connected');

    if (orgFilter) {
      query = query.eq('organization_id', orgFilter);
    }

    const { data: accounts } = await query;

    if (!accounts || accounts.length === 0) {
      return jsonResponse({ message: 'No connected Google Ads accounts' }, 200, corsHeaders);
    }

    const results = [];

    for (const account of accounts) {
      try {
        const tokenData = await getValidAccessToken(supabase, account.id);
        if (!tokenData) {
          results.push({ accountId: account.id, error: 'Token expired' });
          continue;
        }

        const { accessToken, developerToken } = tokenData;
        const customerId = account.account_id;

        // Sync campaigns
        const campaignResults = await googleAdsSearch(accessToken, customerId, GAQL.campaigns, developerToken);

        let syncedCampaigns = 0;
        for (const row of campaignResults) {
          const c = row.campaign;
          const m = row.metrics;
          const b = row.campaignBudget;

          const statusMap: Record<string, string> = {
            'ENABLED': 'active', 'PAUSED': 'paused', 'REMOVED': 'deleted',
          };

          const { data: campaign } = await supabase.from('campaigns').upsert({
            ad_account_id: account.id,
            organization_id: account.organization_id,
            platform: 'google_ads',
            external_id: String(c.id),
            name: c.name,
            status: statusMap[c.status] || 'active',
            objective: c.advertisingChannelType,
            daily_budget: b?.amountMicros ? Number(b.amountMicros) / 1_000_000 : null,
            budget_micros: b?.amountMicros ? Number(b.amountMicros) : null,
            campaign_budget_resource: c.campaignBudget || null,
            impressions: Number(m.impressions || 0),
            clicks: Number(m.clicks || 0),
            cost: Number(m.costMicros || 0) / 1_000_000,
            google_conversions: Number(m.conversions || 0),
            google_conversion_value: Number(m.conversionsValue || 0),
            ctr: Number(m.ctr || 0),
            avg_cpc: Number(m.averageCpc || 0) / 1_000_000,
            last_sync_at: new Date().toISOString(),
          }, { onConflict: 'ad_account_id,external_id' })
            .select('id, external_id')
            .single();

          if (campaign) {
            syncedCampaigns++;

            // Sync ad groups for this campaign
            try {
              const adGroupResults = await googleAdsSearch(
                accessToken, customerId, GAQL.adGroups(campaign.external_id), developerToken
              );

              for (const agRow of adGroupResults) {
                const ag = agRow.adGroup;
                const agm = agRow.metrics;

                await supabase.from('ad_groups').upsert({
                  campaign_id: campaign.id,
                  external_id: String(ag.id),
                  name: ag.name,
                  status: ag.status === 'ENABLED' ? 'active' : ag.status === 'PAUSED' ? 'paused' : 'deleted',
                  impressions: Number(agm.impressions || 0),
                  clicks: Number(agm.clicks || 0),
                  cost: Number(agm.costMicros || 0) / 1_000_000,
                  conversions: Number(agm.conversions || 0),
                  last_sync_at: new Date().toISOString(),
                }, { onConflict: 'campaign_id,external_id' });
              }
            } catch (e) {
              console.error(`Error syncing ad groups for campaign ${campaign.external_id}:`, e);
            }
          }

          // Save daily metrics
          const today = new Date().toISOString().split('T')[0];
          if (campaign) {
            await supabase.from('metrics_daily').upsert({
              organization_id: account.organization_id,
              date: today,
              entity_type: 'campaign',
              entity_id: campaign.id,
              impressions: Number(m.impressions || 0),
              clicks: Number(m.clicks || 0),
              cost: Number(m.costMicros || 0) / 1_000_000,
              conversions: Number(m.conversions || 0),
              revenue: Number(m.conversionsValue || 0),
              ctr: Number(m.ctr || 0),
              cpc: Number(m.averageCpc || 0) / 1_000_000,
              roas: Number(m.costMicros) > 0
                ? Number(m.conversionsValue || 0) / (Number(m.costMicros) / 1_000_000)
                : 0,
              cpa: Number(m.conversions) > 0
                ? (Number(m.costMicros) / 1_000_000) / Number(m.conversions)
                : 0,
            }, { onConflict: 'date,entity_type,entity_id' });
          }
        }

        // Update account last sync
        await supabase
          .from('ad_accounts')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('id', account.id);

        results.push({
          accountId: account.id,
          accountName: account.account_name,
          syncedCampaigns,
        });

      } catch (e) {
        console.error(`Error syncing account ${account.id}:`, e);
        results.push({ accountId: account.id, error: e.message });
      }
    }

    return jsonResponse({ success: true, results }, 200, corsHeaders);

  } catch (error) {
    console.error('Google Ads Sync error:', error);
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
});
