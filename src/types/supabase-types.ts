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
      leads: {
        Row: {
          id: string
          name: string
          company_name: string
          mobile: string | null
          email: string | null
          products_interested: string | null
          bd_representative: string | null
          date_of_last_interaction: string | null
          remark: string | null
          website: string | null
          location: string | null
          proposal_shared: boolean | null
          next_interaction_date: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          company_name: string
          mobile?: string | null
          email?: string | null
          products_interested?: string | null
          bd_representative?: string | null
          date_of_last_interaction?: string | null
          remark?: string | null
          website?: string | null
          location?: string | null
          proposal_shared?: boolean | null
          next_interaction_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          company_name?: string
          mobile?: string | null
          email?: string | null
          products_interested?: string | null
          bd_representative?: string | null
          date_of_last_interaction?: string | null
          remark?: string | null
          website?: string | null
          location?: string | null
          proposal_shared?: boolean | null
          next_interaction_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      partners: {
        Row: {
          id: string
          company_name: string
          contact_person: string | null
          nature_of_contract: string | null
          bd_representative: string | null
          email: string | null
          contact_number: string | null
          status: string | null
          business_remark: string | null
          internal_remark: string | null
          engagement_letter_sent: boolean | null
          acceptance_status: string | null
          engagement_letter_reference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name: string
          contact_person?: string | null
          nature_of_contract?: string | null
          bd_representative?: string | null
          email?: string | null
          contact_number?: string | null
          status?: string | null
          business_remark?: string | null
          internal_remark?: string | null
          engagement_letter_sent?: boolean | null
          acceptance_status?: string | null
          engagement_letter_reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          contact_person?: string | null
          nature_of_contract?: string | null
          bd_representative?: string | null
          email?: string | null
          contact_number?: string | null
          status?: string | null
          business_remark?: string | null
          internal_remark?: string | null
          engagement_letter_sent?: boolean | null
          acceptance_status?: string | null
          engagement_letter_reference?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          company_name: string
          mobile: string | null
          email: string | null
          address: string | null
          bd_representative: string | null
          city: string | null
          country: string | null
          engagement_details: string | null
          remark: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          company_name: string
          mobile?: string | null
          email?: string | null
          address?: string | null
          bd_representative?: string | null
          city?: string | null
          country?: string | null
          engagement_details?: string | null
          remark?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          company_name?: string
          mobile?: string | null
          email?: string | null
          address?: string | null
          bd_representative?: string | null
          city?: string | null
          country?: string | null
          engagement_details?: string | null
          remark?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      interactions: {
        Row: {
          id: string
          lead_id: string | null
          partner_id: string | null
          client_id: string | null
          type: string
          date: string
          description: string | null
          outcome: string | null
          next_steps: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id?: string | null
          partner_id?: string | null
          client_id?: string | null
          type: string
          date: string
          description?: string | null
          outcome?: string | null
          next_steps?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string | null
          partner_id?: string | null
          client_id?: string | null
          type?: string
          date?: string
          description?: string | null
          outcome?: string | null
          next_steps?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
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