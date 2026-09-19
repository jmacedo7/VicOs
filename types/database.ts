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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_contacts: {
        Row: {
          account_id: string
          contact_id: string
        }
        Insert: {
          account_id: string
          contact_id: string
        }
        Update: {
          account_id?: string
          contact_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_contacts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          company_id: string
          created_at: string | null
          display_name: string | null
          external_id: string
          id: string
          notes: string | null
          platform: string
          status: Database["public"]["Enums"]["record_status"] | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          display_name?: string | null
          external_id: string
          id?: string
          notes?: string | null
          platform: string
          status?: Database["public"]["Enums"]["record_status"] | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          display_name?: string | null
          external_id?: string
          id?: string
          notes?: string | null
          platform?: string
          status?: Database["public"]["Enums"]["record_status"] | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          company_id: string
          created_at: string
          expires_at: string | null
          id: string
          last_used_at: string | null
          name: string
          prefix: string
          revoked_at: string | null
          scopes: string[]
          secret_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name: string
          prefix: string
          revoked_at?: string | null
          scopes?: string[]
          secret_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name?: string
          prefix?: string
          revoked_at?: string | null
          scopes?: string[]
          secret_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          company_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          company_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          company_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          business_segment: string | null
          chat_allow_attachments: boolean
          chat_enabled: boolean
          chat_retention_days: number
          city: string | null
          created_at: string | null
          description: string | null
          document: string | null
          email: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          phone: string | null
          state: string | null
          theme_primary: string | null
          theme_secondary: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          business_segment?: string | null
          chat_allow_attachments?: boolean
          chat_enabled?: boolean
          chat_retention_days?: number
          city?: string | null
          created_at?: string | null
          description?: string | null
          document?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          state?: string | null
          theme_primary?: string | null
          theme_secondary?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          business_segment?: string | null
          chat_allow_attachments?: boolean
          chat_enabled?: boolean
          chat_retention_days?: number
          city?: string | null
          created_at?: string | null
          description?: string | null
          document?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          state?: string | null
          theme_primary?: string | null
          theme_secondary?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_tags: {
        Row: {
          contact_id: string
          tag_id: string
        }
        Insert: {
          contact_id: string
          tag_id: string
        }
        Update: {
          contact_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_tags_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          area_code: string | null
          carrier: string | null
          company_id: string
          country_code: string | null
          created_at: string | null
          external_id: string | null
          id: string
          name: string
          normalized_phone: string
          notes: string | null
          phone: string
          status: Database["public"]["Enums"]["record_status"] | null
          updated_at: string | null
        }
        Insert: {
          area_code?: string | null
          carrier?: string | null
          company_id: string
          country_code?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          name: string
          normalized_phone: string
          notes?: string | null
          phone: string
          status?: Database["public"]["Enums"]["record_status"] | null
          updated_at?: string | null
        }
        Update: {
          area_code?: string | null
          carrier?: string | null
          company_id?: string
          country_code?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          name?: string
          normalized_phone?: string
          notes?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["record_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_key_envelopes: {
        Row: {
          conversation_id: string
          created_at: string
          device_key_id: string
          encrypted_key: string
          iv: string
          sender_device_key_id: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string
          device_key_id: string
          encrypted_key: string
          iv: string
          sender_device_key_id?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string
          device_key_id?: string
          encrypted_key?: string
          iv?: string
          sender_device_key_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_key_envelopes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_key_envelopes_device_key_id_fkey"
            columns: ["device_key_id"]
            isOneToOne: false
            referencedRelation: "device_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_key_envelopes_sender_device_key_id_fkey"
            columns: ["sender_device_key_id"]
            isOneToOne: false
            referencedRelation: "device_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_members: {
        Row: {
          conversation_id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          id: string
          last_message_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          id?: string
          last_message_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          id?: string
          last_message_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      device_keys: {
        Row: {
          algorithm: string
          created_at: string
          device_label: string | null
          id: string
          last_seen_at: string
          public_key: string
          user_id: string
        }
        Insert: {
          algorithm?: string
          created_at?: string
          device_label?: string | null
          id?: string
          last_seen_at?: string
          public_key: string
          user_id: string
        }
        Update: {
          algorithm?: string
          created_at?: string
          device_label?: string | null
          id?: string
          last_seen_at?: string
          public_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          content: string
          created_at: string
          document_id: string
          edited_by: string | null
          id: string
          title: string
          version: number
        }
        Insert: {
          content: string
          created_at?: string
          document_id: string
          edited_by?: string | null
          id?: string
          title: string
          version: number
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string
          edited_by?: string | null
          id?: string
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          archived_at: string | null
          company_id: string
          content: string
          created_at: string
          created_by: string
          id: string
          title: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          archived_at?: string | null
          company_id: string
          content?: string
          created_at?: string
          created_by: string
          id?: string
          title: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          archived_at?: string | null
          company_id?: string
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_integrations: {
        Row: {
          access_token_encrypted: string
          company_id: string
          created_at: string
          email: string
          id: string
          provider: string
          refresh_token_encrypted: string | null
          scope: string | null
          status: string
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted: string
          company_id: string
          created_at?: string
          email: string
          id?: string
          provider: string
          refresh_token_encrypted?: string | null
          scope?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string
          company_id?: string
          created_at?: string
          email?: string
          id?: string
          provider?: string
          refresh_token_encrypted?: string | null
          scope?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_integrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          company_id: string
          created_at: string | null
          description: string
          due_date: string | null
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          company_id: string
          created_at?: string | null
          description: string
          due_date?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          company_id?: string
          created_at?: string | null
          description?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      incomes: {
        Row: {
          amount: number
          category: string | null
          company_id: string
          created_at: string | null
          date: string | null
          description: string
          id: string
          notes: string | null
          payment_method: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          company_id: string
          created_at?: string | null
          date?: string | null
          description: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          company_id?: string
          created_at?: string | null
          date?: string | null
          description?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incomes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_cents: number
          company_id: string
          created_at: string
          currency: string
          due_at: string | null
          id: string
          paid_at: string | null
          provider: string | null
          provider_invoice_id: string | null
          status: string
          subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          company_id: string
          created_at?: string
          currency?: string
          due_at?: string | null
          id?: string
          paid_at?: string | null
          provider?: string | null
          provider_invoice_id?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          company_id?: string
          created_at?: string
          currency?: string
          due_at?: string | null
          id?: string
          paid_at?: string | null
          provider?: string | null
          provider_invoice_id?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          ciphertext: string
          conversation_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          iv: string
          message_version: number
          sender_id: string
        }
        Insert: {
          ciphertext: string
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          iv: string
          message_version?: number
          sender_id: string
        }
        Update: {
          ciphertext?: string
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          iv?: string
          message_version?: number
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          company_id: string | null
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          provider: string
          provider_event_id: string
          status: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          payload?: Json
          processed_at?: string | null
          provider: string
          provider_event_id: string
          status?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          provider?: string
          provider_event_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          company_id: string
          created_at: string
          currency: string
          id: string
          invoice_id: string | null
          paid_at: string | null
          provider: string | null
          provider_payment_id: string | null
          status: string
          subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          company_id: string
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string | null
          paid_at?: string | null
          provider?: string | null
          provider_payment_id?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          company_id?: string
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string | null
          paid_at?: string | null
          provider?: string | null
          provider_payment_id?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          code: string
          created_at: string
          currency: string
          description: string
          features: Json
          id: string
          interval: string
          limits: Json
          name: string
          price_cents: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          currency?: string
          description?: string
          features?: Json
          id?: string
          interval?: string
          limits?: Json
          name: string
          price_cents?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          currency?: string
          description?: string
          features?: Json
          id?: string
          interval?: string
          limits?: Json
          name?: string
          price_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          company_id: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          provider: string | null
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          company_id: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          company_id?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          company_id: string
          error_message: string | null
          finished_at: string | null
          id: string
          provider: string
          records_created: number | null
          records_failed: number | null
          records_processed: number | null
          records_updated: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["sync_status"] | null
        }
        Insert: {
          company_id: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          provider: string
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["sync_status"] | null
        }
        Update: {
          company_id?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          provider?: string
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["sync_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          company_id: string
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          company_id: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          company_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_id: string
          created_at: string | null
          email: string
          id: string
          job_title: string | null
          last_seen_at: string | null
          name: string
          presence: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_id: string
          created_at?: string | null
          email: string
          id: string
          job_title?: string | null
          last_seen_at?: string | null
          name: string
          presence?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_id?: string
          created_at?: string | null
          email?: string
          id?: string
          job_title?: string | null
          last_seen_at?: string | null
          name?: string
          presence?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      audit_action:
        | "CREATE"
        | "UPDATE"
        | "DELETE"
        | "ASSOCIATE"
        | "DISASSOCIATE"
        | "SYNC"
        | "SYNC_FAILED"
      record_status: "active" | "inactive" | "blocked" | "pending"
      sync_status: "running" | "completed" | "failed" | "partial"
      user_role: "admin" | "manager" | "operator" | "viewer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      audit_action: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "ASSOCIATE",
        "DISASSOCIATE",
        "SYNC",
        "SYNC_FAILED",
      ],
      record_status: ["active", "inactive", "blocked", "pending"],
      sync_status: ["running", "completed", "failed", "partial"],
      user_role: ["admin", "manager", "operator", "viewer"],
    },
  },
} as const
