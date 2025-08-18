import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    providers: ['google'],
    redirectTo: `${window.location.origin}/auth/callback`
  }
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          name: string | null
          is_anonymous: boolean
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          is_anonymous?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          is_anonymous?: boolean
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string | null
          category: 'fraud' | 'phishing' | 'harassment' | 'deepfake'
          title: string
          description: string
          location: string | null
          incident_date: string | null
          file_url: string | null
          reference_id: string
          status: 'pending' | 'investigating' | 'resolved'
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          category: 'fraud' | 'phishing' | 'harassment' | 'deepfake'
          title: string
          description: string
          location?: string | null
          incident_date?: string | null
          file_url?: string | null
          reference_id?: string
          status?: 'pending' | 'investigating' | 'resolved'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          category?: 'fraud' | 'phishing' | 'harassment' | 'deepfake'
          title?: string
          description?: string
          location?: string | null
          incident_date?: string | null
          file_url?: string | null
          reference_id?: string
          status?: 'pending' | 'investigating' | 'resolved'
          created_at?: string
        }
      }
      deepfakes: {
        Row: {
          id: string
          report_id: string | null
          file_url: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          report_id?: string | null
          file_url: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string | null
          file_url?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          metadata?: any
          created_at?: string
        }
      }
      blogs: {
        Row: {
          id: string
          title: string
          content: string
          author: string
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          author: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author?: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      fraud_lookups: {
        Row: {
          id: string
          report_id: string | null
          entity_type: 'email' | 'phone' | 'website'
          entity_value: string
          created_at: string
        }
        Insert: {
          id?: string
          report_id?: string | null
          entity_type: 'email' | 'phone' | 'website'
          entity_value: string
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string | null
          entity_type?: 'email' | 'phone' | 'website'
          entity_value?: string
          created_at?: string
        }
      }
    }
  }
}