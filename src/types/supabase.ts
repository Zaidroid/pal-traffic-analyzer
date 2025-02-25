export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      traffic_updates: {
        Row: {
          id: string
          message: string
          timestamp: string
          cities: string[] | null
          traffic_status: Json | null
          checkpoint_status: Json | null
          incidents: string[] | null
        }
        Insert: {
          id?: string
          message: string
          timestamp?: string
          cities?: string[] | null
          traffic_status?: Json | null
          checkpoint_status?: Json | null
          incidents?: string[] | null
        }
        Update: {
          id?: string
          message?: string
          timestamp?: string
          cities?: string[] | null
          traffic_status?: Json | null
          checkpoint_status?: Json | null
          incidents?: string[] | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}