export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ab_test_results: {
        Row: {
          ab_test_id: string
          clicks: number | null
          confidence_interval: Json | null
          conversion_rate: number | null
          conversions: number | null
          created_at: string
          id: string
          impressions: number | null
          variant_id: string
        }
        Insert: {
          ab_test_id: string
          clicks?: number | null
          confidence_interval?: Json | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          variant_id: string
        }
        Update: {
          ab_test_id?: string
          clicks?: number | null
          confidence_interval?: Json | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_results_ab_test_id_fkey"
            columns: ["ab_test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          metric: string | null
          name: string
          organization_id: string
          sample_size_needed: number | null
          start_date: string | null
          statistical_significance: number | null
          status: Database["public"]["Enums"]["ab_test_status"]
          type: Database["public"]["Enums"]["ab_test_type"]
          updated_at: string
          variants: Json
          winner_variant: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          metric?: string | null
          name: string
          organization_id: string
          sample_size_needed?: number | null
          start_date?: string | null
          statistical_significance?: number | null
          status?: Database["public"]["Enums"]["ab_test_status"]
          type: Database["public"]["Enums"]["ab_test_type"]
          updated_at?: string
          variants?: Json
          winner_variant?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          metric?: string | null
          name?: string
          organization_id?: string
          sample_size_needed?: number | null
          start_date?: string | null
          statistical_significance?: number | null
          status?: Database["public"]["Enums"]["ab_test_status"]
          type?: Database["public"]["Enums"]["ab_test_type"]
          updated_at?: string
          variants?: Json
          winner_variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_tests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          organization_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          organization_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          organization_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_accounts: {
        Row: {
          access_token_encrypted: string | null
          account_id: string
          account_name: string
          business_manager_id: string | null
          connected_at: string | null
          created_at: string
          currency_code: string | null
          developer_token: string | null
          id: string
          last_sync_at: string | null
          metadata: Json | null
          organization_id: string
          platform: Database["public"]["Enums"]["ad_platform"]
          refresh_token_encrypted: string | null
          status: Database["public"]["Enums"]["connection_status"]
          timezone: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token_encrypted?: string | null
          account_id: string
          account_name: string
          business_manager_id?: string | null
          connected_at?: string | null
          created_at?: string
          currency_code?: string | null
          developer_token?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          organization_id: string
          platform: Database["public"]["Enums"]["ad_platform"]
          refresh_token_encrypted?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          timezone?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token_encrypted?: string | null
          account_id?: string
          account_name?: string
          business_manager_id?: string | null
          connected_at?: string | null
          created_at?: string
          currency_code?: string | null
          developer_token?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          organization_id?: string
          platform?: Database["public"]["Enums"]["ad_platform"]
          refresh_token_encrypted?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          timezone?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_groups: {
        Row: {
          bid_strategy: string | null
          campaign_id: string
          clicks: number | null
          conversions: number | null
          cost: number | null
          created_at: string
          external_id: string
          id: string
          impressions: number | null
          last_sync_at: string | null
          metadata: Json | null
          name: string
          status: Database["public"]["Enums"]["campaign_status"]
          targeting: Json | null
          updated_at: string
        }
        Insert: {
          bid_strategy?: string | null
          campaign_id: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string
          external_id: string
          id?: string
          impressions?: number | null
          last_sync_at?: string | null
          metadata?: Json | null
          name: string
          status?: Database["public"]["Enums"]["campaign_status"]
          targeting?: Json | null
          updated_at?: string
        }
        Update: {
          bid_strategy?: string | null
          campaign_id?: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string
          external_id?: string
          id?: string
          impressions?: number | null
          last_sync_at?: string | null
          metadata?: Json | null
          name?: string
          status?: Database["public"]["Enums"]["campaign_status"]
          targeting?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_groups_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          ad_group_id: string
          clicks: number | null
          conversions: number | null
          cost: number | null
          created_at: string
          creative_url: string | null
          description: string | null
          destination_url: string | null
          external_id: string
          headline: string | null
          id: string
          impressions: number | null
          last_sync_at: string | null
          metadata: Json | null
          name: string
          status: Database["public"]["Enums"]["campaign_status"]
          type: Database["public"]["Enums"]["ad_type"]
          updated_at: string
        }
        Insert: {
          ad_group_id: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string
          creative_url?: string | null
          description?: string | null
          destination_url?: string | null
          external_id: string
          headline?: string | null
          id?: string
          impressions?: number | null
          last_sync_at?: string | null
          metadata?: Json | null
          name: string
          status?: Database["public"]["Enums"]["campaign_status"]
          type?: Database["public"]["Enums"]["ad_type"]
          updated_at?: string
        }
        Update: {
          ad_group_id?: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string
          creative_url?: string | null
          description?: string | null
          destination_url?: string | null
          external_id?: string
          headline?: string | null
          id?: string
          impressions?: number | null
          last_sync_at?: string | null
          metadata?: Json | null
          name?: string
          status?: Database["public"]["Enums"]["campaign_status"]
          type?: Database["public"]["Enums"]["ad_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_ad_group_id_fkey"
            columns: ["ad_group_id"]
            isOneToOne: false
            referencedRelation: "ad_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_analyses: {
        Row: {
          campaigns_analyzed: number | null
          completed_at: string | null
          created_at: string
          date_range_end: string | null
          date_range_start: string | null
          decisions_count: number | null
          duration_ms: number | null
          error_message: string | null
          full_analysis: Json | null
          id: string
          model_used: string | null
          organization_id: string
          raw_claude_response: string | null
          started_at: string
          status: Database["public"]["Enums"]["ai_analysis_status"]
          summary: string | null
          tokens_used: number | null
          total_spend_analyzed: number | null
          trigger_type: string | null
          utmify_sales_analyzed: number | null
        }
        Insert: {
          campaigns_analyzed?: number | null
          completed_at?: string | null
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          decisions_count?: number | null
          duration_ms?: number | null
          error_message?: string | null
          full_analysis?: Json | null
          id?: string
          model_used?: string | null
          organization_id: string
          raw_claude_response?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["ai_analysis_status"]
          summary?: string | null
          tokens_used?: number | null
          total_spend_analyzed?: number | null
          trigger_type?: string | null
          utmify_sales_analyzed?: number | null
        }
        Update: {
          campaigns_analyzed?: number | null
          completed_at?: string | null
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          decisions_count?: number | null
          duration_ms?: number | null
          error_message?: string | null
          full_analysis?: Json | null
          id?: string
          model_used?: string | null
          organization_id?: string
          raw_claude_response?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["ai_analysis_status"]
          summary?: string | null
          tokens_used?: number | null
          total_spend_analyzed?: number | null
          trigger_type?: string | null
          utmify_sales_analyzed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analyses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          organization_id: string
          role: Database["public"]["Enums"]["chat_message_role"]
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          organization_id: string
          role: Database["public"]["Enums"]["chat_message_role"]
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          role?: Database["public"]["Enums"]["chat_message_role"]
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_creative_suggestions: {
        Row: {
          based_on_creative_id: string | null
          content: string
          created_at: string
          id: string
          organization_id: string
          platform: Database["public"]["Enums"]["ad_platform"] | null
          status: string | null
          type: string
        }
        Insert: {
          based_on_creative_id?: string | null
          content: string
          created_at?: string
          id?: string
          organization_id: string
          platform?: Database["public"]["Enums"]["ad_platform"] | null
          status?: string | null
          type: string
        }
        Update: {
          based_on_creative_id?: string | null
          content?: string
          created_at?: string
          id?: string
          organization_id?: string
          platform?: Database["public"]["Enums"]["ad_platform"] | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_creative_suggestions_based_on_creative_id_fkey"
            columns: ["based_on_creative_id"]
            isOneToOne: false
            referencedRelation: "creative_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_creative_suggestions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_decisions: {
        Row: {
          action_details: Json
          ad_group_id: string | null
          analysis_id: string | null
          campaign_id: string | null
          confidence: number | null
          created_at: string
          data_snapshot: Json | null
          decision_type: Database["public"]["Enums"]["ai_decision_type"]
          error_message: string | null
          executed_at: string | null
          execution_result: Json | null
          id: string
          keyword_id: string | null
          organization_id: string
          priority: number | null
          reasoning: string
          rollback_action: Json | null
          rolled_back_at: string | null
          status: Database["public"]["Enums"]["ai_decision_status"]
          updated_at: string
        }
        Insert: {
          action_details?: Json
          ad_group_id?: string | null
          analysis_id?: string | null
          campaign_id?: string | null
          confidence?: number | null
          created_at?: string
          data_snapshot?: Json | null
          decision_type: Database["public"]["Enums"]["ai_decision_type"]
          error_message?: string | null
          executed_at?: string | null
          execution_result?: Json | null
          id?: string
          keyword_id?: string | null
          organization_id: string
          priority?: number | null
          reasoning: string
          rollback_action?: Json | null
          rolled_back_at?: string | null
          status?: Database["public"]["Enums"]["ai_decision_status"]
          updated_at?: string
        }
        Update: {
          action_details?: Json
          ad_group_id?: string | null
          analysis_id?: string | null
          campaign_id?: string | null
          confidence?: number | null
          created_at?: string
          data_snapshot?: Json | null
          decision_type?: Database["public"]["Enums"]["ai_decision_type"]
          error_message?: string | null
          executed_at?: string | null
          execution_result?: Json | null
          id?: string
          keyword_id?: string | null
          organization_id?: string
          priority?: number | null
          reasoning?: string
          rollback_action?: Json | null
          rolled_back_at?: string | null
          status?: Database["public"]["Enums"]["ai_decision_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_decisions_ad_group_id_fkey"
            columns: ["ad_group_id"]
            isOneToOne: false
            referencedRelation: "ad_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_decisions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_decisions_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_decisions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_reports: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          organization_id: string
          period_end: string | null
          period_start: string | null
          type: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          organization_id: string
          period_end?: string | null
          period_start?: string | null
          type: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          organization_id?: string
          period_end?: string | null
          period_start?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_settings: {
        Row: {
          analysis_frequency_hours: number | null
          auto_execute: boolean | null
          created_at: string
          daily_budget_limit: number | null
          enabled: boolean | null
          id: string
          max_budget_change_pct: number | null
          max_cpa: number | null
          min_data_days: number | null
          organization_id: string
          target_roas: number | null
          updated_at: string
        }
        Insert: {
          analysis_frequency_hours?: number | null
          auto_execute?: boolean | null
          created_at?: string
          daily_budget_limit?: number | null
          enabled?: boolean | null
          id?: string
          max_budget_change_pct?: number | null
          max_cpa?: number | null
          min_data_days?: number | null
          organization_id: string
          target_roas?: number | null
          updated_at?: string
        }
        Update: {
          analysis_frequency_hours?: number | null
          auto_execute?: boolean | null
          created_at?: string
          daily_budget_limit?: number | null
          enabled?: boolean | null
          id?: string
          max_budget_change_pct?: number | null
          max_cpa?: number | null
          min_data_days?: number | null
          organization_id?: string
          target_roas?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rules: {
        Row: {
          channels: Json | null
          created_at: string
          enabled: boolean | null
          entity_scope: string | null
          id: string
          metric: string
          operator: string
          organization_id: string
          severity: Database["public"]["Enums"]["alert_severity"]
          threshold: number
          updated_at: string
        }
        Insert: {
          channels?: Json | null
          created_at?: string
          enabled?: boolean | null
          entity_scope?: string | null
          id?: string
          metric: string
          operator: string
          organization_id: string
          severity?: Database["public"]["Enums"]["alert_severity"]
          threshold: number
          updated_at?: string
        }
        Update: {
          channels?: Json | null
          created_at?: string
          enabled?: boolean | null
          entity_scope?: string | null
          id?: string
          metric?: string
          operator?: string
          organization_id?: string
          severity?: Database["public"]["Enums"]["alert_severity"]
          threshold?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          channel: string | null
          current_value: number | null
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string | null
          organization_id: string
          resolved_at: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          status: Database["public"]["Enums"]["alert_status"]
          threshold_value: number | null
          title: string
          triggered_at: string
          type: string
        }
        Insert: {
          channel?: string | null
          current_value?: number | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          organization_id: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["alert_status"]
          threshold_value?: number | null
          title: string
          triggered_at?: string
          type: string
        }
        Update: {
          channel?: string | null
          current_value?: number | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          organization_id?: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["alert_status"]
          threshold_value?: number | null
          title?: string
          triggered_at?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          key_hash: string
          last_used_at: string | null
          name: string
          organization_id: string
          permissions: Json | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          key_hash: string
          last_used_at?: string | null
          name: string
          organization_id: string
          permissions?: Json | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          key_hash?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
          permissions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      attribution: {
        Row: {
          contact_id: string | null
          created_at: string
          id: string
          model: Database["public"]["Enums"]["attribution_model"]
          sale_id: string
          touchpoints: Json
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          id?: string
          model?: Database["public"]["Enums"]["attribution_model"]
          sale_id: string
          touchpoints?: Json
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          id?: string
          model?: Database["public"]["Enums"]["attribution_model"]
          sale_id?: string
          touchpoints?: Json
        }
        Relationships: [
          {
            foreignKeyName: "attribution_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attribution_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      audience_contacts: {
        Row: {
          added_at: string
          audience_id: string
          contact_id: string
          id: string
        }
        Insert: {
          added_at?: string
          audience_id: string
          contact_id: string
          id?: string
        }
        Update: {
          added_at?: string
          audience_id?: string
          contact_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audience_contacts_audience_id_fkey"
            columns: ["audience_id"]
            isOneToOne: false
            referencedRelation: "audiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audience_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      audience_performance: {
        Row: {
          audience_id: string
          campaign_id: string | null
          clicks: number | null
          conversions: number | null
          cpa: number | null
          created_at: string
          id: string
          impressions: number | null
          period_end: string | null
          period_start: string | null
          roas: number | null
        }
        Insert: {
          audience_id: string
          campaign_id?: string | null
          clicks?: number | null
          conversions?: number | null
          cpa?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          period_end?: string | null
          period_start?: string | null
          roas?: number | null
        }
        Update: {
          audience_id?: string
          campaign_id?: string | null
          clicks?: number | null
          conversions?: number | null
          cpa?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          period_end?: string | null
          period_start?: string | null
          roas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audience_performance_audience_id_fkey"
            columns: ["audience_id"]
            isOneToOne: false
            referencedRelation: "audiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audience_performance_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      audiences: {
        Row: {
          created_at: string
          criteria: Json | null
          id: string
          last_synced_at: string | null
          name: string
          organization_id: string
          platform: Database["public"]["Enums"]["ad_platform"] | null
          platform_audience_id: string | null
          size_estimate: number | null
          source_type: Database["public"]["Enums"]["audience_source"] | null
          status: Database["public"]["Enums"]["audience_status"]
          sync_status: string | null
          type: Database["public"]["Enums"]["audience_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria?: Json | null
          id?: string
          last_synced_at?: string | null
          name: string
          organization_id: string
          platform?: Database["public"]["Enums"]["ad_platform"] | null
          platform_audience_id?: string | null
          size_estimate?: number | null
          source_type?: Database["public"]["Enums"]["audience_source"] | null
          status?: Database["public"]["Enums"]["audience_status"]
          sync_status?: string | null
          type: Database["public"]["Enums"]["audience_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria?: Json | null
          id?: string
          last_synced_at?: string | null
          name?: string
          organization_id?: string
          platform?: Database["public"]["Enums"]["ad_platform"] | null
          platform_audience_id?: string | null
          size_estimate?: number | null
          source_type?: Database["public"]["Enums"]["audience_source"] | null
          status?: Database["public"]["Enums"]["audience_status"]
          sync_status?: string | null
          type?: Database["public"]["Enums"]["audience_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audiences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          actions: Json | null
          conditions: Json | null
          created_at: string
          executions_count: number | null
          id: string
          last_executed_at: string | null
          name: string
          organization_id: string
          status: string | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string
          executions_count?: number | null
          id?: string
          last_executed_at?: string | null
          name: string
          organization_id: string
          status?: string | null
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string
          executions_count?: number | null
          id?: string
          last_executed_at?: string | null
          name?: string
          organization_id?: string
          status?: string | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_adjustments: {
        Row: {
          adjustment_pct: number
          campaign_id: string
          created_at: string
          id: string
          reason: string | null
          status: string | null
          target: string
          type: string
        }
        Insert: {
          adjustment_pct: number
          campaign_id: string
          created_at?: string
          id?: string
          reason?: string | null
          status?: string | null
          target: string
          type: string
        }
        Update: {
          adjustment_pct?: number
          campaign_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          status?: string | null
          target?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_adjustments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          ad_account_id: string | null
          alert_threshold_pct: number | null
          amount: number
          campaign_id: string | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          organization_id: string
          period: Database["public"]["Enums"]["budget_period"]
          spent_amount: number | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          ad_account_id?: string | null
          alert_threshold_pct?: number | null
          amount: number
          campaign_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          organization_id: string
          period?: Database["public"]["Enums"]["budget_period"]
          spent_amount?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          ad_account_id?: string | null
          alert_threshold_pct?: number | null
          amount?: number
          campaign_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          organization_id?: string
          period?: Database["public"]["Enums"]["budget_period"]
          spent_amount?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          assigned_to: string | null
          campaign_id: string | null
          color: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          organization_id: string
          start_date: string
          status: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean | null
          assigned_to?: string | null
          campaign_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          organization_id: string
          start_date: string
          status?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean | null
          assigned_to?: string | null
          campaign_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          organization_id?: string
          start_date?: string
          status?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_templates: {
        Row: {
          created_at: string
          events: Json
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          events?: Json
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          events?: Json
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      call_metrics_daily: {
        Row: {
          answered: number | null
          avg_duration: number | null
          created_at: string
          date: string
          id: string
          missed: number | null
          qualified_leads: number | null
          total_calls: number | null
          tracking_number_id: string
        }
        Insert: {
          answered?: number | null
          avg_duration?: number | null
          created_at?: string
          date: string
          id?: string
          missed?: number | null
          qualified_leads?: number | null
          total_calls?: number | null
          tracking_number_id: string
        }
        Update: {
          answered?: number | null
          avg_duration?: number | null
          created_at?: string
          date?: string
          id?: string
          missed?: number | null
          qualified_leads?: number | null
          total_calls?: number | null
          tracking_number_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_metrics_daily_tracking_number_id_fkey"
            columns: ["tracking_number_id"]
            isOneToOne: false
            referencedRelation: "tracking_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          attributed_ad_id: string | null
          attributed_campaign_id: string | null
          call_end: string | null
          call_start: string | null
          caller_phone: string | null
          contact_id: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          notes: string | null
          organization_id: string
          qualification:
            | Database["public"]["Enums"]["call_qualification"]
            | null
          recording_url: string | null
          status: Database["public"]["Enums"]["call_status"]
          tracking_number_id: string | null
        }
        Insert: {
          attributed_ad_id?: string | null
          attributed_campaign_id?: string | null
          call_end?: string | null
          call_start?: string | null
          caller_phone?: string | null
          contact_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          organization_id: string
          qualification?:
            | Database["public"]["Enums"]["call_qualification"]
            | null
          recording_url?: string | null
          status?: Database["public"]["Enums"]["call_status"]
          tracking_number_id?: string | null
        }
        Update: {
          attributed_ad_id?: string | null
          attributed_campaign_id?: string | null
          call_end?: string | null
          call_start?: string | null
          caller_phone?: string | null
          contact_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
          qualification?:
            | Database["public"]["Enums"]["call_qualification"]
            | null
          recording_url?: string | null
          status?: Database["public"]["Enums"]["call_status"]
          tracking_number_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_attributed_ad_id_fkey"
            columns: ["attributed_ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_attributed_campaign_id_fkey"
            columns: ["attributed_campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_tracking_number_id_fkey"
            columns: ["tracking_number_id"]
            isOneToOne: false
            referencedRelation: "tracking_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          ad_account_id: string
          avg_cpc: number | null
          budget_micros: number | null
          campaign_budget_resource: string | null
          clicks: number | null
          cost: number | null
          created_at: string
          ctr: number | null
          daily_budget: number | null
          end_date: string | null
          external_id: string
          google_conversion_value: number | null
          google_conversions: number | null
          health_score: number | null
          id: string
          impressions: number | null
          last_sync_at: string | null
          lifetime_budget: number | null
          metadata: Json | null
          name: string
          objective: string | null
          organization_id: string
          platform: Database["public"]["Enums"]["ad_platform"]
          real_cpa: number | null
          real_revenue: number | null
          real_roas: number | null
          real_sales_count: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          updated_at: string
        }
        Insert: {
          ad_account_id: string
          avg_cpc?: number | null
          budget_micros?: number | null
          campaign_budget_resource?: string | null
          clicks?: number | null
          cost?: number | null
          created_at?: string
          ctr?: number | null
          daily_budget?: number | null
          end_date?: string | null
          external_id: string
          google_conversion_value?: number | null
          google_conversions?: number | null
          health_score?: number | null
          id?: string
          impressions?: number | null
          last_sync_at?: string | null
          lifetime_budget?: number | null
          metadata?: Json | null
          name: string
          objective?: string | null
          organization_id: string
          platform: Database["public"]["Enums"]["ad_platform"]
          real_cpa?: number | null
          real_revenue?: number | null
          real_roas?: number | null
          real_sales_count?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          updated_at?: string
        }
        Update: {
          ad_account_id?: string
          avg_cpc?: number | null
          budget_micros?: number | null
          campaign_budget_resource?: string | null
          clicks?: number | null
          cost?: number | null
          created_at?: string
          ctr?: number | null
          daily_budget?: number | null
          end_date?: string | null
          external_id?: string
          google_conversion_value?: number | null
          google_conversions?: number | null
          health_score?: number | null
          id?: string
          impressions?: number | null
          last_sync_at?: string | null
          lifetime_budget?: number | null
          metadata?: Json | null
          name?: string
          objective?: string | null
          organization_id?: string
          platform?: Database["public"]["Enums"]["ad_platform"]
          real_cpa?: number | null
          real_revenue?: number | null
          real_roas?: number | null
          real_sales_count?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_approval_requests: {
        Row: {
          client_portal_user_id: string | null
          entity_id: string | null
          feedback: string | null
          id: string
          organization_id: string
          responded_at: string | null
          status: Database["public"]["Enums"]["approval_status"]
          submitted_at: string
          type: string
        }
        Insert: {
          client_portal_user_id?: string | null
          entity_id?: string | null
          feedback?: string | null
          id?: string
          organization_id: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          submitted_at?: string
          type: string
        }
        Update: {
          client_portal_user_id?: string | null
          entity_id?: string | null
          feedback?: string | null
          id?: string
          organization_id?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          submitted_at?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_approval_requests_client_portal_user_id_fkey"
            columns: ["client_portal_user_id"]
            isOneToOne: false
            referencedRelation: "client_portal_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_approval_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_users: {
        Row: {
          client_name: string
          created_at: string
          email: string
          id: string
          last_login: string | null
          organization_id: string
          password_hash: string
          permissions: Json | null
        }
        Insert: {
          client_name: string
          created_at?: string
          email: string
          id?: string
          last_login?: string | null
          organization_id: string
          password_hash: string
          permissions?: Json | null
        }
        Update: {
          client_name?: string
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          organization_id?: string
          password_hash?: string
          permissions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_reports: {
        Row: {
          client_name: string | null
          created_at: string
          data: Json | null
          format: Database["public"]["Enums"]["report_format"] | null
          generated_at: string | null
          id: string
          organization_id: string
          period_end: string | null
          period_start: string | null
          sent_at: string | null
          template_id: string | null
        }
        Insert: {
          client_name?: string | null
          created_at?: string
          data?: Json | null
          format?: Database["public"]["Enums"]["report_format"] | null
          generated_at?: string | null
          id?: string
          organization_id: string
          period_end?: string | null
          period_start?: string | null
          sent_at?: string | null
          template_id?: string | null
        }
        Update: {
          client_name?: string | null
          created_at?: string
          data?: Json | null
          format?: Database["public"]["Enums"]["report_format"] | null
          generated_at?: string | null
          id?: string
          organization_id?: string
          period_end?: string | null
          period_start?: string | null
          sent_at?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_ads: {
        Row: {
          ad_content: Json | null
          competitor_id: string
          created_at: string
          first_seen: string | null
          id: string
          last_seen: string | null
          platform: Database["public"]["Enums"]["ad_platform"] | null
          status: string | null
        }
        Insert: {
          ad_content?: Json | null
          competitor_id: string
          created_at?: string
          first_seen?: string | null
          id?: string
          last_seen?: string | null
          platform?: Database["public"]["Enums"]["ad_platform"] | null
          status?: string | null
        }
        Update: {
          ad_content?: Json | null
          competitor_id?: string
          created_at?: string
          first_seen?: string | null
          id?: string
          last_seen?: string | null
          platform?: Database["public"]["Enums"]["ad_platform"] | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_ads_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          ad_library_id: string | null
          created_at: string
          domain: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
        }
        Insert: {
          ad_library_id?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
        }
        Update: {
          ad_library_id?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_timeline: {
        Row: {
          contact_id: string
          event_data: Json | null
          event_type: Database["public"]["Enums"]["timeline_event_type"]
          id: string
          timestamp: string
        }
        Insert: {
          contact_id: string
          event_data?: Json | null
          event_type: Database["public"]["Enums"]["timeline_event_type"]
          id?: string
          timestamp?: string
        }
        Update: {
          contact_id?: string
          event_data?: Json | null
          event_type?: Database["public"]["Enums"]["timeline_event_type"]
          id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_timeline_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          assigned_to: string | null
          campaign: string | null
          churn_risk_score: number | null
          company: string | null
          created_at: string
          custom_fields: Json | null
          email: string | null
          first_touch_at: string | null
          id: string
          last_activity_at: string | null
          lead_score: number | null
          lifecycle_stage: Database["public"]["Enums"]["lifecycle_stage"]
          medium: string | null
          name: string | null
          organization_id: string
          phone: string | null
          predicted_ltv: number | null
          source: string | null
          tags: Json | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          campaign?: string | null
          churn_risk_score?: number | null
          company?: string | null
          created_at?: string
          custom_fields?: Json | null
          email?: string | null
          first_touch_at?: string | null
          id?: string
          last_activity_at?: string | null
          lead_score?: number | null
          lifecycle_stage?: Database["public"]["Enums"]["lifecycle_stage"]
          medium?: string | null
          name?: string | null
          organization_id: string
          phone?: string | null
          predicted_ltv?: number | null
          source?: string | null
          tags?: Json | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          campaign?: string | null
          churn_risk_score?: number | null
          company?: string | null
          created_at?: string
          custom_fields?: Json | null
          email?: string | null
          first_touch_at?: string | null
          id?: string
          last_activity_at?: string | null
          lead_score?: number | null
          lifecycle_stage?: Database["public"]["Enums"]["lifecycle_stage"]
          medium?: string | null
          name?: string | null
          organization_id?: string
          phone?: string | null
          predicted_ltv?: number | null
          source?: string | null
          tags?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_library: {
        Row: {
          created_at: string
          elements: Json | null
          file_url: string | null
          id: string
          name: string
          organization_id: string
          platform: Database["public"]["Enums"]["ad_platform"] | null
          tags: Json | null
          thumbnail_url: string | null
          type: Database["public"]["Enums"]["creative_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          elements?: Json | null
          file_url?: string | null
          id?: string
          name: string
          organization_id: string
          platform?: Database["public"]["Enums"]["ad_platform"] | null
          tags?: Json | null
          thumbnail_url?: string | null
          type: Database["public"]["Enums"]["creative_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          elements?: Json | null
          file_url?: string | null
          id?: string
          name?: string
          organization_id?: string
          platform?: Database["public"]["Enums"]["ad_platform"] | null
          tags?: Json | null
          thumbnail_url?: string | null
          type?: Database["public"]["Enums"]["creative_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_library_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_performance: {
        Row: {
          ad_id: string | null
          campaign_id: string | null
          clicks: number | null
          conversion_rate: number | null
          conversions: number | null
          cost: number | null
          cpa: number | null
          created_at: string
          creative_id: string
          ctr: number | null
          id: string
          impressions: number | null
          period_end: string | null
          period_start: string | null
          roas: number | null
        }
        Insert: {
          ad_id?: string | null
          campaign_id?: string | null
          clicks?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          cost?: number | null
          cpa?: number | null
          created_at?: string
          creative_id: string
          ctr?: number | null
          id?: string
          impressions?: number | null
          period_end?: string | null
          period_start?: string | null
          roas?: number | null
        }
        Update: {
          ad_id?: string | null
          campaign_id?: string | null
          clicks?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          cost?: number | null
          cpa?: number | null
          created_at?: string
          creative_id?: string
          ctr?: number | null
          id?: string
          impressions?: number | null
          period_end?: string | null
          period_start?: string | null
          roas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "creative_performance_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_performance_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_performance_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creative_library"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_variants: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          original_creative_id: string
          performance_comparison: Json | null
          status: string | null
          variant_type: Database["public"]["Enums"]["creative_variant_type"]
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          original_creative_id: string
          performance_comparison?: Json | null
          status?: string | null
          variant_type?: Database["public"]["Enums"]["creative_variant_type"]
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          original_creative_id?: string
          performance_comparison?: Json | null
          status?: string | null
          variant_type?: Database["public"]["Enums"]["creative_variant_type"]
        }
        Relationships: [
          {
            foreignKeyName: "creative_variants_original_creative_id_fkey"
            columns: ["original_creative_id"]
            isOneToOne: false
            referencedRelation: "creative_library"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_dashboards: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean | null
          layout: Json | null
          name: string
          organization_id: string
          shared_with: Json | null
          updated_at: string
          widgets: Json | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          layout?: Json | null
          name: string
          organization_id: string
          shared_with?: Json | null
          updated_at?: string
          widgets?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          layout?: Json | null
          name?: string
          organization_id?: string
          shared_with?: Json | null
          updated_at?: string
          widgets?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_dashboards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_ltv: {
        Row: {
          acquisition_campaign: string | null
          acquisition_source: string | null
          avg_order_value: number | null
          contact_id: string
          created_at: string
          first_purchase_date: string | null
          id: string
          last_purchase_date: string | null
          ltv_segment: Database["public"]["Enums"]["ltv_segment"] | null
          organization_id: string
          predicted_ltv_12m: number | null
          total_purchases: number | null
          total_revenue: number | null
          updated_at: string
        }
        Insert: {
          acquisition_campaign?: string | null
          acquisition_source?: string | null
          avg_order_value?: number | null
          contact_id: string
          created_at?: string
          first_purchase_date?: string | null
          id?: string
          last_purchase_date?: string | null
          ltv_segment?: Database["public"]["Enums"]["ltv_segment"] | null
          organization_id: string
          predicted_ltv_12m?: number | null
          total_purchases?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Update: {
          acquisition_campaign?: string | null
          acquisition_source?: string | null
          avg_order_value?: number | null
          contact_id?: string
          created_at?: string
          first_purchase_date?: string | null
          id?: string
          last_purchase_date?: string | null
          ltv_segment?: Database["public"]["Enums"]["ltv_segment"] | null
          organization_id?: string
          predicted_ltv_12m?: number | null
          total_purchases?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_ltv_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_ltv_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_widgets: {
        Row: {
          config: Json | null
          created_at: string
          dashboard_id: string
          id: string
          position: Json | null
          size: Json | null
          type: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          dashboard_id: string
          id?: string
          position?: Json | null
          size?: Json | null
          type: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          dashboard_id?: string
          id?: string
          position?: Json | null
          size?: Json | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "custom_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_activities: {
        Row: {
          created_at: string
          created_by: string | null
          deal_id: string
          description: string | null
          id: string
          type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deal_id: string
          description?: string | null
          id?: string
          type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deal_id?: string
          description?: string | null
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          assigned_to: string | null
          closed_at: string | null
          contact_id: string | null
          created_at: string
          currency: string | null
          expected_close_date: string | null
          id: string
          lost_reason: string | null
          organization_id: string
          pipeline_id: string
          probability: number | null
          stage_id: string
          title: string
          updated_at: string
          value: number | null
          won: boolean | null
        }
        Insert: {
          assigned_to?: string | null
          closed_at?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string | null
          expected_close_date?: string | null
          id?: string
          lost_reason?: string | null
          organization_id: string
          pipeline_id: string
          probability?: number | null
          stage_id: string
          title: string
          updated_at?: string
          value?: number | null
          won?: boolean | null
        }
        Update: {
          assigned_to?: string | null
          closed_at?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string | null
          expected_close_date?: string | null
          id?: string
          lost_reason?: string | null
          organization_id?: string
          pipeline_id?: string
          probability?: number | null
          stage_id?: string
          title?: string
          updated_at?: string
          value?: number | null
          won?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sends: {
        Row: {
          clicked_at: string | null
          contact_id: string
          created_at: string
          id: string
          opened_at: string | null
          sent_at: string | null
          sequence_step_id: string | null
          status: Database["public"]["Enums"]["email_send_status"]
        }
        Insert: {
          clicked_at?: string | null
          contact_id: string
          created_at?: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          sequence_step_id?: string | null
          status?: Database["public"]["Enums"]["email_send_status"]
        }
        Update: {
          clicked_at?: string | null
          contact_id?: string
          created_at?: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          sequence_step_id?: string | null
          status?: Database["public"]["Enums"]["email_send_status"]
        }
        Relationships: [
          {
            foreignKeyName: "email_sends_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sends_sequence_step_id_fkey"
            columns: ["sequence_step_id"]
            isOneToOne: false
            referencedRelation: "email_sequence_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequence_steps: {
        Row: {
          body_html: string | null
          body_text: string | null
          condition: Json | null
          created_at: string
          delay_hours: number | null
          id: string
          sequence_id: string
          step_order: number
          subject: string | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          condition?: Json | null
          created_at?: string
          delay_hours?: number | null
          id?: string
          sequence_id: string
          step_order: number
          subject?: string | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          condition?: Json | null
          created_at?: string
          delay_hours?: number | null
          id?: string
          sequence_id?: string
          step_order?: number
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequences: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          status: string | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
          status?: string | null
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          status?: string | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sequences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_records: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          currency: string | null
          date: string
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          organization_id: string
          type: Database["public"]["Enums"]["financial_type"]
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          currency?: string | null
          date: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          organization_id: string
          type: Database["public"]["Enums"]["financial_type"]
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          currency?: string | null
          date?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          organization_id?: string
          type?: Database["public"]["Enums"]["financial_type"]
        }
        Relationships: [
          {
            foreignKeyName: "financial_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      form_metrics_daily: {
        Row: {
          conversion_rate: number | null
          created_at: string
          date: string
          form_id: string
          id: string
          submissions: number | null
          views: number | null
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string
          date: string
          form_id: string
          id?: string
          submissions?: number | null
          views?: number | null
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string
          date?: string
          form_id?: string
          id?: string
          submissions?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "form_metrics_daily_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          contact_id: string | null
          data: Json
          form_id: string
          id: string
          ip_address: string | null
          page_url: string | null
          submitted_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          contact_id?: string | null
          data?: Json
          form_id: string
          id?: string
          ip_address?: string | null
          page_url?: string | null
          submitted_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          contact_id?: string | null
          data?: Json
          form_id?: string
          id?: string
          ip_address?: string | null
          page_url?: string | null
          submitted_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string
          embed_code: string | null
          fields: Json
          id: string
          name: string
          organization_id: string
          settings: Json | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          embed_code?: string | null
          fields?: Json
          id?: string
          name: string
          organization_id: string
          settings?: Json | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          embed_code?: string | null
          fields?: Json
          id?: string
          name?: string
          organization_id?: string
          settings?: Json | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_events: {
        Row: {
          campaign: string | null
          funnel_id: string
          id: string
          medium: string | null
          metadata: Json | null
          session_id: string | null
          source: string | null
          stage: string
          timestamp: string
          visitor_id: string | null
        }
        Insert: {
          campaign?: string | null
          funnel_id: string
          id?: string
          medium?: string | null
          metadata?: Json | null
          session_id?: string | null
          source?: string | null
          stage: string
          timestamp?: string
          visitor_id?: string | null
        }
        Update: {
          campaign?: string | null
          funnel_id?: string
          id?: string
          medium?: string | null
          metadata?: Json | null
          session_id?: string | null
          source?: string | null
          stage?: string
          timestamp?: string
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_events_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_snapshots: {
        Row: {
          created_at: string
          date: string
          funnel_id: string
          id: string
          stages_data: Json
        }
        Insert: {
          created_at?: string
          date: string
          funnel_id: string
          id?: string
          stages_data?: Json
        }
        Update: {
          created_at?: string
          date?: string
          funnel_id?: string
          id?: string
          stages_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "funnel_snapshots_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      funnels: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          stages: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
          stages?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          stages?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      geo_bid_adjustments: {
        Row: {
          adjustment_pct: number
          campaign_id: string
          created_at: string
          id: string
          location: string
          reason: string | null
          status: string | null
        }
        Insert: {
          adjustment_pct: number
          campaign_id: string
          created_at?: string
          id?: string
          location: string
          reason?: string | null
          status?: string | null
        }
        Update: {
          adjustment_pct?: number
          campaign_id?: string
          created_at?: string
          id?: string
          location?: string
          reason?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geo_bid_adjustments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_milestones: {
        Row: {
          created_at: string
          date: string
          goal_id: string
          id: string
          projected_value: number | null
          value: number | null
        }
        Insert: {
          created_at?: string
          date: string
          goal_id: string
          id?: string
          projected_value?: number | null
          value?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          goal_id?: string
          id?: string
          projected_value?: number | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          current_value: number | null
          id: string
          name: string
          organization_id: string
          parent_goal_id: string | null
          period_end: string | null
          period_start: string | null
          status: Database["public"]["Enums"]["goal_status"]
          target_value: number
          type: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          id?: string
          name: string
          organization_id: string
          parent_goal_id?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          target_value: number
          type: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          id?: string
          name?: string
          organization_id?: string
          parent_goal_id?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          target_value?: number
          type?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_parent_goal_id_fkey"
            columns: ["parent_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_benchmarks: {
        Row: {
          created_at: string
          id: string
          industry: string
          metric: string
          p25: number | null
          p50: number | null
          p75: number | null
          period: string | null
          platform: Database["public"]["Enums"]["ad_platform"] | null
          source: string | null
          value: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          industry: string
          metric: string
          p25?: number | null
          p50?: number | null
          p75?: number | null
          period?: string | null
          platform?: Database["public"]["Enums"]["ad_platform"] | null
          source?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          industry?: string
          metric?: string
          p25?: number | null
          p50?: number | null
          p75?: number | null
          period?: string | null
          platform?: Database["public"]["Enums"]["ad_platform"] | null
          source?: string | null
          value?: number | null
        }
        Relationships: []
      }
      insights: {
        Row: {
          created_at: string
          data: Json | null
          description: string | null
          entity_id: string | null
          entity_type: string | null
          estimated_impact: string | null
          id: string
          organization_id: string
          severity: Database["public"]["Enums"]["insight_severity"]
          status: Database["public"]["Enums"]["insight_status"]
          suggested_action: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          estimated_impact?: string | null
          id?: string
          organization_id: string
          severity?: Database["public"]["Enums"]["insight_severity"]
          status?: Database["public"]["Enums"]["insight_status"]
          suggested_action?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          estimated_impact?: string | null
          id?: string
          organization_id?: string
          severity?: Database["public"]["Enums"]["insight_severity"]
          status?: Database["public"]["Enums"]["insight_status"]
          suggested_action?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "insights_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config: Json | null
          connected_at: string | null
          created_at: string
          id: string
          organization_id: string
          status: Database["public"]["Enums"]["connection_status"]
          type: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          connected_at?: string | null
          created_at?: string
          id?: string
          organization_id: string
          status?: Database["public"]["Enums"]["connection_status"]
          type: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          connected_at?: string | null
          created_at?: string
          id?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["connection_status"]
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      keywords: {
        Row: {
          ad_group_id: string
          bid: number | null
          bid_micros: number | null
          clicks: number | null
          conversions: number | null
          cost: number | null
          created_at: string
          external_id: string
          id: string
          impressions: number | null
          last_sync_at: string | null
          match_type: Database["public"]["Enums"]["keyword_match_type"]
          quality_score: number | null
          status: Database["public"]["Enums"]["campaign_status"]
          text: string
          updated_at: string
        }
        Insert: {
          ad_group_id: string
          bid?: number | null
          bid_micros?: number | null
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string
          external_id: string
          id?: string
          impressions?: number | null
          last_sync_at?: string | null
          match_type?: Database["public"]["Enums"]["keyword_match_type"]
          quality_score?: number | null
          status?: Database["public"]["Enums"]["campaign_status"]
          text: string
          updated_at?: string
        }
        Update: {
          ad_group_id?: string
          bid?: number | null
          bid_micros?: number | null
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string
          external_id?: string
          id?: string
          impressions?: number | null
          last_sync_at?: string | null
          match_type?: Database["public"]["Enums"]["keyword_match_type"]
          quality_score?: number | null
          status?: Database["public"]["Enums"]["campaign_status"]
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "keywords_ad_group_id_fkey"
            columns: ["ad_group_id"]
            isOneToOne: false
            referencedRelation: "ad_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          platform: string | null
          status: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
          platform?: string | null
          status?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          platform?: string | null
          status?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ltv_by_segment: {
        Row: {
          avg_ltv: number | null
          created_at: string
          customer_count: number | null
          id: string
          median_ltv: number | null
          organization_id: string
          period: string | null
          segment_type: string
          segment_value: string
        }
        Insert: {
          avg_ltv?: number | null
          created_at?: string
          customer_count?: number | null
          id?: string
          median_ltv?: number | null
          organization_id: string
          period?: string | null
          segment_type: string
          segment_value: string
        }
        Update: {
          avg_ltv?: number | null
          created_at?: string
          customer_count?: number | null
          id?: string
          median_ltv?: number | null
          organization_id?: string
          period?: string | null
          segment_type?: string
          segment_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "ltv_by_segment_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_by_device: {
        Row: {
          campaign_id: string
          clicks: number | null
          conversion_rate: number | null
          conversions: number | null
          cost: number | null
          cpa: number | null
          created_at: string
          device: string
          id: string
          impressions: number | null
          organization_id: string
          period: string | null
          roas: number | null
        }
        Insert: {
          campaign_id: string
          clicks?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          cost?: number | null
          cpa?: number | null
          created_at?: string
          device: string
          id?: string
          impressions?: number | null
          organization_id: string
          period?: string | null
          roas?: number | null
        }
        Update: {
          campaign_id?: string
          clicks?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          cost?: number | null
          cpa?: number | null
          created_at?: string
          device?: string
          id?: string
          impressions?: number | null
          organization_id?: string
          period?: string | null
          roas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_by_device_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metrics_by_device_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_by_geo: {
        Row: {
          campaign_id: string
          city: string | null
          clicks: number | null
          conversions: number | null
          cost: number | null
          country: string | null
          cpa: number | null
          created_at: string
          id: string
          impressions: number | null
          latitude: number | null
          longitude: number | null
          organization_id: string
          period: string | null
          roas: number | null
          state: string | null
        }
        Insert: {
          campaign_id: string
          city?: string | null
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          country?: string | null
          cpa?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          latitude?: number | null
          longitude?: number | null
          organization_id: string
          period?: string | null
          roas?: number | null
          state?: string | null
        }
        Update: {
          campaign_id?: string
          city?: string | null
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          country?: string | null
          cpa?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          latitude?: number | null
          longitude?: number | null
          organization_id?: string
          period?: string | null
          roas?: number | null
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_by_geo_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metrics_by_geo_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_by_hour: {
        Row: {
          campaign_id: string
          clicks: number | null
          conversions: number | null
          cost: number | null
          cpa: number | null
          created_at: string
          day_of_week: number
          hour: number
          id: string
          impressions: number | null
          organization_id: string
          period: string | null
          roas: number | null
        }
        Insert: {
          campaign_id: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          cpa?: number | null
          created_at?: string
          day_of_week: number
          hour: number
          id?: string
          impressions?: number | null
          organization_id: string
          period?: string | null
          roas?: number | null
        }
        Update: {
          campaign_id?: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          cpa?: number | null
          created_at?: string
          day_of_week?: number
          hour?: number
          id?: string
          impressions?: number | null
          organization_id?: string
          period?: string | null
          roas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_by_hour_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metrics_by_hour_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_by_placement: {
        Row: {
          campaign_id: string
          clicks: number | null
          conversions: number | null
          cost: number | null
          cpa: number | null
          created_at: string
          id: string
          impressions: number | null
          organization_id: string
          period: string | null
          placement: string
          platform: Database["public"]["Enums"]["ad_platform"] | null
          roas: number | null
        }
        Insert: {
          campaign_id: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          cpa?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          organization_id: string
          period?: string | null
          placement: string
          platform?: Database["public"]["Enums"]["ad_platform"] | null
          roas?: number | null
        }
        Update: {
          campaign_id?: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          cpa?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          organization_id?: string
          period?: string | null
          placement?: string
          platform?: Database["public"]["Enums"]["ad_platform"] | null
          roas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_by_placement_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metrics_by_placement_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_daily: {
        Row: {
          clicks: number | null
          conversion_rate: number | null
          conversions: number | null
          cost: number | null
          cpa: number | null
          cpc: number | null
          created_at: string
          ctr: number | null
          date: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type"]
          frequency: number | null
          id: string
          impressions: number | null
          organization_id: string
          reach: number | null
          real_revenue: number | null
          real_sales: number | null
          revenue: number | null
          roas: number | null
          video_view_rate: number | null
          video_views: number | null
        }
        Insert: {
          clicks?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          cost?: number | null
          cpa?: number | null
          cpc?: number | null
          created_at?: string
          ctr?: number | null
          date: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type"]
          frequency?: number | null
          id?: string
          impressions?: number | null
          organization_id: string
          reach?: number | null
          real_revenue?: number | null
          real_sales?: number | null
          revenue?: number | null
          roas?: number | null
          video_view_rate?: number | null
          video_views?: number | null
        }
        Update: {
          clicks?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          cost?: number | null
          cpa?: number | null
          cpc?: number | null
          created_at?: string
          ctr?: number | null
          date?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["entity_type"]
          frequency?: number | null
          id?: string
          impressions?: number | null
          organization_id?: string
          reach?: number | null
          real_revenue?: number | null
          real_sales?: number | null
          revenue?: number | null
          roas?: number | null
          video_view_rate?: number | null
          video_views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_daily_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_hourly: {
        Row: {
          clicks: number | null
          conversions: number | null
          cost: number | null
          cpc: number | null
          created_at: string
          ctr: number | null
          date: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type"]
          hour: number
          id: string
          impressions: number | null
          organization_id: string
          revenue: number | null
        }
        Insert: {
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          cpc?: number | null
          created_at?: string
          ctr?: number | null
          date: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type"]
          hour: number
          id?: string
          impressions?: number | null
          organization_id: string
          revenue?: number | null
        }
        Update: {
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          cpc?: number | null
          created_at?: string
          ctr?: number | null
          date?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["entity_type"]
          hour?: number
          id?: string
          impressions?: number | null
          organization_id?: string
          revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_hourly_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      negative_keywords: {
        Row: {
          ad_group_id: string | null
          campaign_id: string | null
          created_at: string
          id: string
          level: Database["public"]["Enums"]["negative_keyword_level"]
          match_type: Database["public"]["Enums"]["keyword_match_type"]
          text: string
        }
        Insert: {
          ad_group_id?: string | null
          campaign_id?: string | null
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["negative_keyword_level"]
          match_type?: Database["public"]["Enums"]["keyword_match_type"]
          text: string
        }
        Update: {
          ad_group_id?: string | null
          campaign_id?: string | null
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["negative_keyword_level"]
          match_type?: Database["public"]["Enums"]["keyword_match_type"]
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "negative_keywords_ad_group_id_fkey"
            columns: ["ad_group_id"]
            isOneToOne: false
            referencedRelation: "ad_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negative_keywords_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      offline_conversions: {
        Row: {
          amount: number | null
          contact_id: string | null
          conversion_date: string | null
          created_at: string
          fbclid: string | null
          gclid: string | null
          id: string
          match_status:
            | Database["public"]["Enums"]["offline_match_status"]
            | null
          organization_id: string
          original_click_id: string | null
          platform_sent: string | null
          product: string | null
          type: string
          uploaded_at: string
        }
        Insert: {
          amount?: number | null
          contact_id?: string | null
          conversion_date?: string | null
          created_at?: string
          fbclid?: string | null
          gclid?: string | null
          id?: string
          match_status?:
            | Database["public"]["Enums"]["offline_match_status"]
            | null
          organization_id: string
          original_click_id?: string | null
          platform_sent?: string | null
          product?: string | null
          type: string
          uploaded_at?: string
        }
        Update: {
          amount?: number | null
          contact_id?: string | null
          conversion_date?: string | null
          created_at?: string
          fbclid?: string | null
          gclid?: string | null
          id?: string
          match_status?:
            | Database["public"]["Enums"]["offline_match_status"]
            | null
          organization_id?: string
          original_click_id?: string | null
          platform_sent?: string | null
          product?: string | null
          type?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offline_conversions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offline_conversions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      offline_uploads: {
        Row: {
          filename: string
          id: string
          matched_rows: number | null
          organization_id: string
          platform_synced: string | null
          processed_at: string | null
          total_rows: number | null
          unmatched_rows: number | null
          uploaded_at: string
        }
        Insert: {
          filename: string
          id?: string
          matched_rows?: number | null
          organization_id: string
          platform_synced?: string | null
          processed_at?: string | null
          total_rows?: number | null
          unmatched_rows?: number | null
          uploaded_at?: string
        }
        Update: {
          filename?: string
          id?: string
          matched_rows?: number | null
          organization_id?: string
          platform_synced?: string | null
          processed_at?: string | null
          total_rows?: number | null
          unmatched_rows?: number | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offline_uploads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      okr_key_results: {
        Row: {
          created_at: string
          current_value: number | null
          description: string
          id: string
          okr_id: string
          target_value: number
          unit: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          description: string
          id?: string
          okr_id: string
          target_value: number
          unit?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          current_value?: number | null
          description?: string
          id?: string
          okr_id?: string
          target_value?: number
          unit?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "okr_key_results_okr_id_fkey"
            columns: ["okr_id"]
            isOneToOne: false
            referencedRelation: "okrs"
            referencedColumns: ["id"]
          },
        ]
      }
      okrs: {
        Row: {
          created_at: string
          id: string
          objective: string
          organization_id: string
          period: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          objective: string
          organization_id: string
          period?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          objective?: string
          organization_id?: string
          period?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "okrs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      optimization_logs: {
        Row: {
          action_type: string
          after_state: Json | null
          before_state: Json | null
          entity_id: string | null
          entity_type: string | null
          estimated_impact: string | null
          executed_at: string | null
          executed_by: string | null
          id: string
          organization_id: string
          reason: string | null
          status: Database["public"]["Enums"]["optimization_status"]
          suggested_at: string
        }
        Insert: {
          action_type: string
          after_state?: Json | null
          before_state?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          estimated_impact?: string | null
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          organization_id: string
          reason?: string | null
          status?: Database["public"]["Enums"]["optimization_status"]
          suggested_at?: string
        }
        Update: {
          action_type?: string
          after_state?: Json | null
          before_state?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          estimated_impact?: string | null
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          organization_id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["optimization_status"]
          suggested_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "optimization_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          accepted_at: string | null
          id: string
          invited_at: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          invited_at?: string
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          invited_at?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          currency: string
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_metrics_daily: {
        Row: {
          avg_time_on_page: number | null
          bounce_rate: number | null
          conversion_rate: number | null
          created_at: string
          date: string
          id: string
          landing_page_id: string
          leads: number | null
          scroll_depth_avg: number | null
          unique_visitors: number | null
          visitors: number | null
        }
        Insert: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          conversion_rate?: number | null
          created_at?: string
          date: string
          id?: string
          landing_page_id: string
          leads?: number | null
          scroll_depth_avg?: number | null
          unique_visitors?: number | null
          visitors?: number | null
        }
        Update: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          conversion_rate?: number | null
          created_at?: string
          date?: string
          id?: string
          landing_page_id?: string
          leads?: number | null
          scroll_depth_avg?: number | null
          unique_visitors?: number | null
          visitors?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "page_metrics_daily_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          stages: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
          stages?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          stages?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      pixels_and_tracking: {
        Row: {
          ad_account_id: string | null
          config: Json | null
          created_at: string
          id: string
          organization_id: string
          pixel_id: string | null
          platform: Database["public"]["Enums"]["ad_platform"]
          status: Database["public"]["Enums"]["connection_status"]
          type: Database["public"]["Enums"]["pixel_type"]
          updated_at: string
        }
        Insert: {
          ad_account_id?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          organization_id: string
          pixel_id?: string | null
          platform: Database["public"]["Enums"]["ad_platform"]
          status?: Database["public"]["Enums"]["connection_status"]
          type?: Database["public"]["Enums"]["pixel_type"]
          updated_at?: string
        }
        Update: {
          ad_account_id?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          organization_id?: string
          pixel_id?: string | null
          platform?: Database["public"]["Enums"]["ad_platform"]
          status?: Database["public"]["Enums"]["connection_status"]
          type?: Database["public"]["Enums"]["pixel_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pixels_and_tracking_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pixels_and_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      placement_exclusions: {
        Row: {
          campaign_id: string
          excluded_at: string
          id: string
          placement: string
          reason: string | null
        }
        Insert: {
          campaign_id: string
          excluded_at?: string
          id?: string
          placement: string
          reason?: string | null
        }
        Update: {
          campaign_id?: string
          excluded_at?: string
          id?: string
          placement?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "placement_exclusions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          amount: number
          contact_id: string | null
          created_at: string
          currency: string | null
          deal_id: string | null
          id: string
          is_offline: boolean | null
          organization_id: string
          original_click_id: string | null
          payment_method: string | null
          product: string | null
          sale_date: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          contact_id?: string | null
          created_at?: string
          currency?: string | null
          deal_id?: string | null
          id?: string
          is_offline?: boolean | null
          organization_id: string
          original_click_id?: string | null
          payment_method?: string | null
          product?: string | null
          sale_date: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          contact_id?: string | null
          created_at?: string
          currency?: string | null
          deal_id?: string | null
          id?: string
          is_offline?: boolean | null
          organization_id?: string
          original_click_id?: string | null
          payment_method?: string | null
          product?: string | null
          sale_date?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      search_term_actions: {
        Row: {
          action: string
          created_at: string
          executed: boolean | null
          id: string
          organization_id: string
          search_term_id: string
        }
        Insert: {
          action: string
          created_at?: string
          executed?: boolean | null
          id?: string
          organization_id: string
          search_term_id: string
        }
        Update: {
          action?: string
          created_at?: string
          executed?: boolean | null
          id?: string
          organization_id?: string
          search_term_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_term_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_term_actions_search_term_id_fkey"
            columns: ["search_term_id"]
            isOneToOne: false
            referencedRelation: "search_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      search_terms: {
        Row: {
          ad_account_id: string
          ad_group_id: string | null
          campaign_id: string | null
          clicks: number | null
          conversions: number | null
          cost: number | null
          created_at: string
          date: string | null
          id: string
          impressions: number | null
          keyword_id: string | null
          match_type: string | null
          revenue: number | null
          term: string
        }
        Insert: {
          ad_account_id: string
          ad_group_id?: string | null
          campaign_id?: string | null
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string
          date?: string | null
          id?: string
          impressions?: number | null
          keyword_id?: string | null
          match_type?: string | null
          revenue?: number | null
          term: string
        }
        Update: {
          ad_account_id?: string
          ad_group_id?: string | null
          campaign_id?: string | null
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string
          date?: string | null
          id?: string
          impressions?: number | null
          keyword_id?: string | null
          match_type?: string | null
          revenue?: number | null
          term?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_terms_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_terms_ad_group_id_fkey"
            columns: ["ad_group_id"]
            isOneToOne: false
            referencedRelation: "ad_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_terms_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_terms_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_keywords: {
        Row: {
          created_at: string
          current_position: number | null
          difficulty: number | null
          id: string
          keyword: string
          organization_id: string
          previous_position: number | null
          search_volume: number | null
          tracked_since: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          current_position?: number | null
          difficulty?: number | null
          id?: string
          keyword: string
          organization_id: string
          previous_position?: number | null
          search_volume?: number | null
          tracked_since?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          current_position?: number | null
          difficulty?: number | null
          id?: string
          keyword?: string
          organization_id?: string
          previous_position?: number | null
          search_volume?: number | null
          tracked_since?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_keywords_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_metrics_daily: {
        Row: {
          created_at: string
          date: string
          id: string
          organic_conversions: number | null
          organic_revenue: number | null
          organic_sessions: number | null
          organization_id: string
          top_pages: Json | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          organic_conversions?: number | null
          organic_revenue?: number | null
          organic_sessions?: number | null
          organization_id: string
          top_pages?: Json | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          organic_conversions?: number | null
          organic_revenue?: number | null
          organic_sessions?: number | null
          organization_id?: string
          top_pages?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_metrics_daily_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_vs_paid: {
        Row: {
          created_at: string
          id: string
          keyword: string
          organic_clicks: number | null
          organic_position: number | null
          organization_id: string
          overlap_savings_potential: number | null
          paid_clicks: number | null
          paid_cost: number | null
          paid_cpa: number | null
          period: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          keyword: string
          organic_clicks?: number | null
          organic_position?: number | null
          organization_id: string
          overlap_savings_potential?: number | null
          paid_clicks?: number | null
          paid_cost?: number | null
          paid_cpa?: number | null
          period?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          keyword?: string
          organic_clicks?: number | null
          organic_position?: number | null
          organization_id?: string
          overlap_savings_potential?: number | null
          paid_clicks?: number | null
          paid_cost?: number | null
          paid_cpa?: number | null
          period?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_vs_paid_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          task_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          task_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          task_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          campaign_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          organization_id: string
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_events: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          device: string | null
          event_name: string
          id: string
          organization_id: string
          page_url: string | null
          referrer: string | null
          session_id: string | null
          timestamp: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visitor_id: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device?: string | null
          event_name: string
          id?: string
          organization_id: string
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          timestamp?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device?: string | null
          event_name?: string
          id?: string
          organization_id?: string
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          timestamp?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_numbers: {
        Row: {
          ad_group_id: string | null
          campaign_id: string | null
          created_at: string
          id: string
          number: string
          organization_id: string
          provider_number_id: string | null
          status: string | null
        }
        Insert: {
          ad_group_id?: string | null
          campaign_id?: string | null
          created_at?: string
          id?: string
          number: string
          organization_id: string
          provider_number_id?: string | null
          status?: string | null
        }
        Update: {
          ad_group_id?: string | null
          campaign_id?: string | null
          created_at?: string
          id?: string
          number?: string
          organization_id?: string
          provider_number_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_numbers_ad_group_id_fkey"
            columns: ["ad_group_id"]
            isOneToOne: false
            referencedRelation: "ad_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_numbers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_numbers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          language: string | null
          notification_settings: Json | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string | null
          notification_settings?: Json | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string | null
          notification_settings?: Json | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      utm_templates: {
        Row: {
          campaign: string | null
          content: string | null
          created_at: string
          generated_url: string | null
          id: string
          medium: string | null
          name: string
          organization_id: string
          short_url: string | null
          source: string | null
          term: string | null
        }
        Insert: {
          campaign?: string | null
          content?: string | null
          created_at?: string
          generated_url?: string | null
          id?: string
          medium?: string | null
          name: string
          organization_id: string
          short_url?: string | null
          source?: string | null
          term?: string | null
        }
        Update: {
          campaign?: string | null
          content?: string | null
          created_at?: string
          generated_url?: string | null
          id?: string
          medium?: string | null
          name?: string
          organization_id?: string
          short_url?: string | null
          source?: string | null
          term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "utm_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      utmify_config: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          organization_id: string
          updated_at: string
          webhook_secret: string | null
          webhook_url_generated: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          organization_id: string
          updated_at?: string
          webhook_secret?: string | null
          webhook_url_generated?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string
          updated_at?: string
          webhook_secret?: string | null
          webhook_url_generated?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "utmify_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      utmify_sales: {
        Row: {
          created_at: string
          currency: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          match_confidence: number | null
          matched_ad_group_id: string | null
          matched_campaign_id: string | null
          order_id: string
          organization_id: string
          product_name: string | null
          raw_payload: Json | null
          received_at: string
          revenue: number
          sale_date: string | null
          sck: string | null
          src: string | null
          status: Database["public"]["Enums"]["utmify_status"]
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          match_confidence?: number | null
          matched_ad_group_id?: string | null
          matched_campaign_id?: string | null
          order_id: string
          organization_id: string
          product_name?: string | null
          raw_payload?: Json | null
          received_at?: string
          revenue: number
          sale_date?: string | null
          sck?: string | null
          src?: string | null
          status: Database["public"]["Enums"]["utmify_status"]
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          match_confidence?: number | null
          matched_ad_group_id?: string | null
          matched_campaign_id?: string | null
          order_id?: string
          organization_id?: string
          product_name?: string | null
          raw_payload?: Json | null
          received_at?: string
          revenue?: number
          sale_date?: string | null
          sck?: string | null
          src?: string | null
          status?: Database["public"]["Enums"]["utmify_status"]
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "utmify_sales_matched_ad_group_id_fkey"
            columns: ["matched_ad_group_id"]
            isOneToOne: false
            referencedRelation: "ad_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utmify_sales_matched_campaign_id_fkey"
            columns: ["matched_campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utmify_sales_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          event: string
          id: string
          payload: Json | null
          response_body: string | null
          response_status: number | null
          sent_at: string
          webhook_id: string
        }
        Insert: {
          event: string
          id?: string
          payload?: Json | null
          response_body?: string | null
          response_status?: number | null
          sent_at?: string
          webhook_id: string
        }
        Update: {
          event?: string
          id?: string
          payload?: Json | null
          response_body?: string | null
          response_status?: number | null
          sent_at?: string
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          events: Json | null
          id: string
          last_triggered_at: string | null
          name: string
          organization_id: string
          secret: string | null
          status: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          events?: Json | null
          id?: string
          last_triggered_at?: string | null
          name: string
          organization_id: string
          secret?: string | null
          status?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          events?: Json | null
          id?: string
          last_triggered_at?: string | null
          name?: string
          organization_id?: string
          secret?: string | null
          status?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          body: string | null
          contact_id: string
          created_at: string
          direction: Database["public"]["Enums"]["whatsapp_direction"]
          id: string
          sent_at: string | null
          status: string | null
          template_id: string | null
        }
        Insert: {
          body?: string | null
          contact_id: string
          created_at?: string
          direction?: Database["public"]["Enums"]["whatsapp_direction"]
          id?: string
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
        }
        Update: {
          body?: string | null
          contact_id?: string
          created_at?: string
          direction?: Database["public"]["Enums"]["whatsapp_direction"]
          id?: string
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          approved_at: string | null
          body: string
          created_at: string
          id: string
          name: string
          organization_id: string
          status: string | null
          variables: Json | null
        }
        Insert: {
          approved_at?: string | null
          body: string
          created_at?: string
          id?: string
          name: string
          organization_id: string
          status?: string | null
          variables?: Json | null
        }
        Update: {
          approved_at?: string | null
          body?: string
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          status?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_ids: { Args: never; Returns: string[] }
      user_belongs_to_org: { Args: { org_id: string }; Returns: boolean }
    }
    Enums: {
      ab_test_status: "draft" | "running" | "completed" | "winner_declared"
      ab_test_type: "creative" | "page" | "audience" | "copy"
      ad_platform:
        | "google_ads"
        | "meta_ads"
        | "tiktok_ads"
        | "youtube_ads"
        | "microsoft_ads"
      ad_type: "text" | "image" | "video" | "carousel" | "responsive"
      ai_analysis_status: "running" | "completed" | "failed"
      ai_decision_status:
        | "pending"
        | "approved"
        | "executed"
        | "failed"
        | "rejected"
        | "rolled_back"
      ai_decision_type:
        | "pause_campaign"
        | "activate_campaign"
        | "increase_budget"
        | "decrease_budget"
        | "add_negative_keyword"
        | "remove_keyword"
        | "adjust_bid"
        | "create_campaign"
        | "reallocate_budget"
        | "scale_campaign"
        | "suggest_structure"
        | "ab_test_creative"
        | "create_audience"
        | "exclude_placement"
        | "adjust_schedule_bid"
        | "adjust_geo_bid"
      alert_severity: "low" | "medium" | "high" | "critical"
      alert_status: "active" | "acknowledged" | "resolved"
      approval_status:
        | "pending"
        | "approved"
        | "rejected"
        | "revision_requested"
      attribution_model:
        | "first_touch"
        | "last_touch"
        | "linear"
        | "time_decay"
        | "position_based"
      audience_source:
        | "crm_list"
        | "website_visitors"
        | "purchasers"
        | "top_ltv"
        | "engaged_leads"
      audience_status: "building" | "ready" | "synced" | "error"
      audience_type: "custom" | "lookalike" | "remarketing" | "seed"
      budget_period: "daily" | "weekly" | "monthly"
      call_qualification: "hot" | "warm" | "cold" | "spam"
      call_status: "answered" | "missed" | "voicemail"
      campaign_status:
        | "active"
        | "paused"
        | "deleted"
        | "archived"
        | "ended"
        | "draft"
      chat_message_role: "user" | "assistant" | "system"
      connection_status: "connected" | "disconnected" | "expired" | "error"
      creative_type: "image" | "video" | "text" | "carousel" | "responsive"
      creative_variant_type: "ai_generated" | "manual"
      deal_status: "open" | "won" | "lost"
      email_send_status:
        | "queued"
        | "sent"
        | "delivered"
        | "opened"
        | "clicked"
        | "bounced"
        | "unsubscribed"
      entity_type: "campaign" | "ad_group" | "ad" | "keyword"
      financial_type: "ad_spend" | "operational_cost" | "revenue" | "refund"
      goal_status: "on_track" | "at_risk" | "behind" | "achieved"
      insight_severity: "info" | "warning" | "critical"
      insight_status: "new" | "seen" | "acted" | "dismissed"
      keyword_match_type: "broad" | "phrase" | "exact"
      lifecycle_stage:
        | "subscriber"
        | "lead"
        | "mql"
        | "sql"
        | "opportunity"
        | "customer"
      ltv_segment: "high" | "medium" | "low"
      negative_keyword_level: "campaign" | "ad_group"
      offline_match_status: "matched" | "unmatched" | "partial"
      optimization_status: "suggested" | "approved" | "executed" | "reverted"
      pixel_type: "pixel" | "conversions_api" | "enhanced_conversions"
      report_format: "pdf" | "docx"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "todo" | "in_progress" | "review" | "done"
      timeline_event_type:
        | "page_view"
        | "form_submit"
        | "email_open"
        | "email_click"
        | "ad_click"
        | "call"
        | "meeting"
        | "note"
        | "stage_change"
        | "sale"
        | "whatsapp"
        | "tag_added"
        | "tag_removed"
        | "score_change"
      user_role: "owner" | "admin" | "analyst" | "viewer"
      utmify_status:
        | "paid"
        | "waiting_payment"
        | "refused"
        | "refunded"
        | "chargedback"
      whatsapp_direction: "inbound" | "outbound"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ab_test_status: ["draft", "running", "completed", "winner_declared"],
      ab_test_type: ["creative", "page", "audience", "copy"],
      ad_platform: [
        "google_ads",
        "meta_ads",
        "tiktok_ads",
        "youtube_ads",
        "microsoft_ads",
      ],
      ad_type: ["text", "image", "video", "carousel", "responsive"],
      ai_analysis_status: ["running", "completed", "failed"],
      ai_decision_status: [
        "pending",
        "approved",
        "executed",
        "failed",
        "rejected",
        "rolled_back",
      ],
      ai_decision_type: [
        "pause_campaign",
        "activate_campaign",
        "increase_budget",
        "decrease_budget",
        "add_negative_keyword",
        "remove_keyword",
        "adjust_bid",
        "create_campaign",
        "reallocate_budget",
        "scale_campaign",
        "suggest_structure",
        "ab_test_creative",
        "create_audience",
        "exclude_placement",
        "adjust_schedule_bid",
        "adjust_geo_bid",
      ],
      alert_severity: ["low", "medium", "high", "critical"],
      alert_status: ["active", "acknowledged", "resolved"],
      approval_status: [
        "pending",
        "approved",
        "rejected",
        "revision_requested",
      ],
      attribution_model: [
        "first_touch",
        "last_touch",
        "linear",
        "time_decay",
        "position_based",
      ],
      audience_source: [
        "crm_list",
        "website_visitors",
        "purchasers",
        "top_ltv",
        "engaged_leads",
      ],
      audience_status: ["building", "ready", "synced", "error"],
      audience_type: ["custom", "lookalike", "remarketing", "seed"],
      budget_period: ["daily", "weekly", "monthly"],
      call_qualification: ["hot", "warm", "cold", "spam"],
      call_status: ["answered", "missed", "voicemail"],
      campaign_status: [
        "active",
        "paused",
        "deleted",
        "archived",
        "ended",
        "draft",
      ],
      chat_message_role: ["user", "assistant", "system"],
      connection_status: ["connected", "disconnected", "expired", "error"],
      creative_type: ["image", "video", "text", "carousel", "responsive"],
      creative_variant_type: ["ai_generated", "manual"],
      deal_status: ["open", "won", "lost"],
      email_send_status: [
        "queued",
        "sent",
        "delivered",
        "opened",
        "clicked",
        "bounced",
        "unsubscribed",
      ],
      entity_type: ["campaign", "ad_group", "ad", "keyword"],
      financial_type: ["ad_spend", "operational_cost", "revenue", "refund"],
      goal_status: ["on_track", "at_risk", "behind", "achieved"],
      insight_severity: ["info", "warning", "critical"],
      insight_status: ["new", "seen", "acted", "dismissed"],
      keyword_match_type: ["broad", "phrase", "exact"],
      lifecycle_stage: [
        "subscriber",
        "lead",
        "mql",
        "sql",
        "opportunity",
        "customer",
      ],
      ltv_segment: ["high", "medium", "low"],
      negative_keyword_level: ["campaign", "ad_group"],
      offline_match_status: ["matched", "unmatched", "partial"],
      optimization_status: ["suggested", "approved", "executed", "reverted"],
      pixel_type: ["pixel", "conversions_api", "enhanced_conversions"],
      report_format: ["pdf", "docx"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["todo", "in_progress", "review", "done"],
      timeline_event_type: [
        "page_view",
        "form_submit",
        "email_open",
        "email_click",
        "ad_click",
        "call",
        "meeting",
        "note",
        "stage_change",
        "sale",
        "whatsapp",
        "tag_added",
        "tag_removed",
        "score_change",
      ],
      user_role: ["owner", "admin", "analyst", "viewer"],
      utmify_status: [
        "paid",
        "waiting_payment",
        "refused",
        "refunded",
        "chargedback",
      ],
      whatsapp_direction: ["inbound", "outbound"],
    },
  },
} as const
