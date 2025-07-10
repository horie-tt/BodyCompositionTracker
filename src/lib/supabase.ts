import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create client if valid environment variables are provided
const isValidSupabaseConfig = supabaseUrl && 
                              supabaseAnonKey && 
                              supabaseUrl !== 'your_supabase_project_url' &&
                              supabaseUrl.startsWith('https://') &&
                              supabaseAnonKey.length > 10

export const supabase = isValidSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database table name
export const BODY_DATA_TABLE = 'body_data'

// Types for Supabase operations
export type Database = {
  public: {
    Tables: {
      body_data: {
        Row: {
          id: number
          date: string
          weight: number
          bmi: number | null
          body_fat: number | null
          muscle_mass: number | null
          visceral_fat: number | null
          calories: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          date: string
          weight: number
          bmi?: number | null
          body_fat?: number | null
          muscle_mass?: number | null
          visceral_fat?: number | null
          calories?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          date?: string
          weight?: number
          bmi?: number | null
          body_fat?: number | null
          muscle_mass?: number | null
          visceral_fat?: number | null
          calories?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}