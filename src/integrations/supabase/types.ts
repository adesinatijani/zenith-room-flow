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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      account_categories: {
        Row: {
          account_code: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          parent_category_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          account_code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          parent_category_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          account_code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          parent_category_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "account_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      account_entries: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          credit_amount: number | null
          debit_amount: number | null
          description: string
          entry_date: string
          id: string
          notes: string | null
          posted_at: string | null
          posted_by: string | null
          reference_number: string | null
          source_id: string | null
          source_type: string | null
          status: string
          sub_category: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description: string
          entry_date?: string
          id?: string
          notes?: string | null
          posted_at?: string | null
          posted_by?: string | null
          reference_number?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          sub_category?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string
          entry_date?: string
          id?: string
          notes?: string | null
          posted_at?: string | null
          posted_by?: string | null
          reference_number?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          sub_category?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "account_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          actual_amount: number | null
          budgeted_amount: number
          category_id: string | null
          created_at: string
          fiscal_year: number
          id: string
          name: string
          period_number: number | null
          period_type: string
          status: string
          updated_at: string
          variance: number | null
          variance_percentage: number | null
        }
        Insert: {
          actual_amount?: number | null
          budgeted_amount: number
          category_id?: string | null
          created_at?: string
          fiscal_year: number
          id?: string
          name: string
          period_number?: number | null
          period_type?: string
          status?: string
          updated_at?: string
          variance?: number | null
          variance_percentage?: number | null
        }
        Update: {
          actual_amount?: number | null
          budgeted_amount?: number
          category_id?: string | null
          created_at?: string
          fiscal_year?: number
          id?: string
          name?: string
          period_number?: number | null
          period_type?: string
          status?: string
          updated_at?: string
          variance?: number | null
          variance_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "account_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          budget: number | null
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          manager_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_departments_manager"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_access_log: {
        Row: {
          access_time: string | null
          access_type: string
          accessed_by: string | null
          accessed_fields: string[] | null
          employee_id: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          access_time?: string | null
          access_type: string
          accessed_by?: string | null
          accessed_fields?: string[] | null
          employee_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          access_time?: string | null
          access_type?: string
          accessed_by?: string | null
          accessed_fields?: string[] | null
          employee_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_access_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_loans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          employee_id: string
          expected_end_date: string | null
          id: string
          loan_amount: number
          monthly_deduction: number
          notes: string | null
          purpose: string
          remaining_amount: number
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id: string
          expected_end_date?: string | null
          id?: string
          loan_amount: number
          monthly_deduction: number
          notes?: string | null
          purpose: string
          remaining_amount: number
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id?: string
          expected_end_date?: string | null
          id?: string
          loan_amount?: number
          monthly_deduction?: number
          notes?: string | null
          purpose?: string
          remaining_amount?: number
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_loans_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_loans_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_positions: {
        Row: {
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean
          max_salary: number | null
          min_salary: number | null
          requirements: string | null
          title: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_salary?: number | null
          min_salary?: number | null
          requirements?: string | null
          title: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_salary?: number | null
          min_salary?: number | null
          requirements?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_positions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          bank_account: string | null
          created_at: string
          date_of_birth: string | null
          department_id: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_id: string
          employment_type: string
          first_name: string
          hire_date: string
          id: string
          last_name: string
          manager_id: string | null
          national_id: string | null
          notes: string | null
          phone: string | null
          position_id: string | null
          salary: number
          status: string
          total_leave_days: number | null
          updated_at: string
          used_leave_days: number | null
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          created_at?: string
          date_of_birth?: string | null
          department_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id: string
          employment_type?: string
          first_name: string
          hire_date?: string
          id?: string
          last_name: string
          manager_id?: string | null
          national_id?: string | null
          notes?: string | null
          phone?: string | null
          position_id?: string | null
          salary: number
          status?: string
          total_leave_days?: number | null
          updated_at?: string
          used_leave_days?: number | null
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          created_at?: string
          date_of_birth?: string | null
          department_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string
          employment_type?: string
          first_name?: string
          hire_date?: string
          id?: string
          last_name?: string
          manager_id?: string | null
          national_id?: string | null
          notes?: string | null
          phone?: string | null
          position_id?: string | null
          salary?: number
          status?: string
          total_leave_days?: number | null
          updated_at?: string
          used_leave_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "employee_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_reports: {
        Row: {
          created_at: string
          generated_at: string
          generated_by: string | null
          id: string
          period_end: string
          period_start: string
          report_data: Json
          report_type: string
        }
        Insert: {
          created_at?: string
          generated_at?: string
          generated_by?: string | null
          id?: string
          period_end: string
          period_start: string
          report_data: Json
          report_type: string
        }
        Update: {
          created_at?: string
          generated_at?: string
          generated_by?: string | null
          id?: string
          period_end?: string
          period_start?: string
          report_data?: Json
          report_type?: string
        }
        Relationships: []
      }
      hotel_settings: {
        Row: {
          created_at: string
          currency: string
          dark_mode: boolean | null
          date_format: string | null
          desktop_notifications: boolean | null
          email_notifications: boolean | null
          hotel_address: string | null
          hotel_description: string | null
          hotel_email: string | null
          hotel_icon: string | null
          hotel_name: string
          hotel_phone: string | null
          hotel_website: string | null
          hotel_whatsapp: string | null
          id: string
          language: string
          notifications_enabled: boolean | null
          payment_gateways: Json | null
          session_timeout: number | null
          sms_notifications: boolean | null
          tax_rate: number | null
          time_format: string | null
          timezone: string | null
          two_factor_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          dark_mode?: boolean | null
          date_format?: string | null
          desktop_notifications?: boolean | null
          email_notifications?: boolean | null
          hotel_address?: string | null
          hotel_description?: string | null
          hotel_email?: string | null
          hotel_icon?: string | null
          hotel_name?: string
          hotel_phone?: string | null
          hotel_website?: string | null
          hotel_whatsapp?: string | null
          id?: string
          language?: string
          notifications_enabled?: boolean | null
          payment_gateways?: Json | null
          session_timeout?: number | null
          sms_notifications?: boolean | null
          tax_rate?: number | null
          time_format?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          dark_mode?: boolean | null
          date_format?: string | null
          desktop_notifications?: boolean | null
          email_notifications?: boolean | null
          hotel_address?: string | null
          hotel_description?: string | null
          hotel_email?: string | null
          hotel_icon?: string | null
          hotel_name?: string
          hotel_phone?: string | null
          hotel_website?: string | null
          hotel_whatsapp?: string | null
          id?: string
          language?: string
          notifications_enabled?: boolean | null
          payment_gateways?: Json | null
          session_timeout?: number | null
          sms_notifications?: boolean | null
          tax_rate?: number | null
          time_format?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string
          cost_per_unit: number
          created_at: string
          current_quantity: number
          id: string
          item_name: string
          last_restocked: string | null
          max_threshold: number
          min_threshold: number
          supplier: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          cost_per_unit?: number
          created_at?: string
          current_quantity?: number
          id?: string
          item_name: string
          last_restocked?: string | null
          max_threshold?: number
          min_threshold?: number
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          cost_per_unit?: number
          created_at?: string
          current_quantity?: number
          id?: string
          item_name?: string
          last_restocked?: string | null
          max_threshold?: number
          min_threshold?: number
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      kitchen_orders: {
        Row: {
          created_at: string
          estimated_time: number | null
          guest_name: string
          id: string
          items: Json
          order_id: string
          priority: number
          status: string
          table_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_time?: number | null
          guest_name: string
          id?: string
          items: Json
          order_id: string
          priority?: number
          status?: string
          table_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_time?: number | null
          guest_name?: string
          id?: string
          items?: Json
          order_id?: string
          priority?: number
          status?: string
          table_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kitchen_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          applied_at: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          employee_id: string
          end_date: string
          id: string
          leave_type: string
          reason: string
          rejection_reason: string | null
          start_date: string
          status: string
          total_days: number
          updated_at: string
        }
        Insert: {
          applied_at?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id: string
          end_date: string
          id?: string
          leave_type: string
          reason: string
          rejection_reason?: string | null
          start_date: string
          status?: string
          total_days: number
          updated_at?: string
        }
        Update: {
          applied_at?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string
          rejection_reason?: string | null
          start_date?: string
          status?: string
          total_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_category: string
          item_name: string
          order_id: string
          price: number
          quantity: number
          special_instructions: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_category: string
          item_name: string
          order_id: string
          price: number
          quantity?: number
          special_instructions?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_category?: string
          item_name?: string
          order_id?: string
          price?: number
          quantity?: number
          special_instructions?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          guest_name: string
          guest_type: string
          id: string
          payment_method: string | null
          room_number: string | null
          status: string
          subtotal: number
          table_id: string | null
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          guest_name: string
          guest_type: string
          id?: string
          payment_method?: string | null
          room_number?: string | null
          status?: string
          subtotal?: number
          table_id?: string | null
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          guest_name?: string
          guest_type?: string
          id?: string
          payment_method?: string | null
          room_number?: string | null
          status?: string
          subtotal?: number
          table_id?: string | null
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_records: {
        Row: {
          base_salary: number
          bonus: number | null
          created_at: string
          employee_id: string
          gross_pay: number
          id: string
          loan_deduction: number | null
          net_pay: number
          other_deductions: number | null
          overtime_hours: number | null
          overtime_rate: number | null
          pay_period_end: string
          pay_period_start: string
          processed_at: string | null
          processed_by: string | null
          status: string
          tax_deduction: number | null
        }
        Insert: {
          base_salary: number
          bonus?: number | null
          created_at?: string
          employee_id: string
          gross_pay: number
          id?: string
          loan_deduction?: number | null
          net_pay: number
          other_deductions?: number | null
          overtime_hours?: number | null
          overtime_rate?: number | null
          pay_period_end: string
          pay_period_start: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          tax_deduction?: number | null
        }
        Update: {
          base_salary?: number
          bonus?: number | null
          created_at?: string
          employee_id?: string
          gross_pay?: number
          id?: string
          loan_deduction?: number | null
          net_pay?: number
          other_deductions?: number | null
          overtime_hours?: number | null
          overtime_rate?: number | null
          pay_period_end?: string
          pay_period_start?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          tax_deduction?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_reviews: {
        Row: {
          areas_for_improvement: string | null
          comments: string | null
          communication: number | null
          completed_at: string | null
          created_at: string
          due_date: string | null
          employee_id: string
          goals_achievement: number | null
          goals_next_period: string | null
          id: string
          leadership: number | null
          overall_rating: number | null
          review_period_end: string
          review_period_start: string
          reviewer_id: string
          status: string
          strengths: string | null
          teamwork: number | null
          updated_at: string
        }
        Insert: {
          areas_for_improvement?: string | null
          comments?: string | null
          communication?: number | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          employee_id: string
          goals_achievement?: number | null
          goals_next_period?: string | null
          id?: string
          leadership?: number | null
          overall_rating?: number | null
          review_period_end: string
          review_period_start: string
          reviewer_id: string
          status?: string
          strengths?: string | null
          teamwork?: number | null
          updated_at?: string
        }
        Update: {
          areas_for_improvement?: string | null
          comments?: string | null
          communication?: number | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          employee_id?: string
          goals_achievement?: number | null
          goals_next_period?: string | null
          id?: string
          leadership?: number | null
          overall_rating?: number | null
          review_period_end?: string
          review_period_start?: string
          reviewer_id?: string
          status?: string
          strengths?: string | null
          teamwork?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          created_by: string | null
          department: string | null
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          first_name?: string | null
          id: string
          is_active?: boolean
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurant_tables: {
        Row: {
          created_at: string
          id: string
          seats: number
          status: string
          table_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          seats?: number
          status?: string
          table_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          seats?: number
          status?: string
          table_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      room_bookings: {
        Row: {
          booking_status: string
          check_in_date: string
          check_out_date: string
          created_at: string
          guest_email: string | null
          guest_name: string
          guest_phone: string | null
          id: string
          nights: number
          payment_status: string
          room_id: string
          special_requests: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          booking_status?: string
          check_in_date?: string
          check_out_date: string
          created_at?: string
          guest_email?: string | null
          guest_name: string
          guest_phone?: string | null
          id?: string
          nights?: number
          payment_status?: string
          room_id: string
          special_requests?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          booking_status?: string
          check_in_date?: string
          check_out_date?: string
          created_at?: string
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          nights?: number
          payment_status?: string
          room_id?: string
          special_requests?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          amenities: string[] | null
          capacity: number
          created_at: string
          description: string | null
          floor_number: number | null
          id: string
          rate: number
          room_number: string
          room_type: string
          status: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          capacity?: number
          created_at?: string
          description?: string | null
          floor_number?: number | null
          id?: string
          rate?: number
          room_number: string
          room_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          capacity?: number
          created_at?: string
          description?: string | null
          floor_number?: number | null
          id?: string
          rate?: number
          room_number?: string
          room_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_recognition: {
        Row: {
          award_date: string | null
          created_at: string
          description: string | null
          employee_id: string
          id: string
          is_public: boolean | null
          month_year: string | null
          nominated_by: string | null
          recognition_type: string
          title: string
          total_votes: number | null
          votes: number | null
          voting_period: string | null
        }
        Insert: {
          award_date?: string | null
          created_at?: string
          description?: string | null
          employee_id: string
          id?: string
          is_public?: boolean | null
          month_year?: string | null
          nominated_by?: string | null
          recognition_type: string
          title: string
          total_votes?: number | null
          votes?: number | null
          voting_period?: string | null
        }
        Update: {
          award_date?: string | null
          created_at?: string
          description?: string | null
          employee_id?: string
          id?: string
          is_public?: boolean | null
          month_year?: string | null
          nominated_by?: string | null
          recognition_type?: string
          title?: string
          total_votes?: number | null
          votes?: number | null
          voting_period?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_recognition_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_recognition_nominated_by_fkey"
            columns: ["nominated_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_votes: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          voted_at: string
          voter_name: string
          voter_type: string
          voting_period: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          voted_at?: string
          voter_name: string
          voter_type: string
          voting_period: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          voted_at?: string
          voter_name?: string
          voter_type?: string
          voting_period?: string
        }
        Relationships: []
      }
      supplier_order_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          item_name: string
          order_id: string
          quantity: number
          total_price: number
          unit: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          item_name: string
          order_id: string
          quantity: number
          total_price: number
          unit?: string
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          item_name?: string
          order_id?: string
          quantity?: number
          total_price?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "supplier_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "supplier_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_orders: {
        Row: {
          created_at: string
          created_by: string | null
          delivery_date: string | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          order_number: string
          status: string
          supplier_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delivery_date?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number: string
          status?: string
          supplier_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delivery_date?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string
          status?: string
          supplier_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          order_id: string | null
          payment_date: string
          payment_method: string
          reference_number: string | null
          status: string
          supplier_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          payment_date?: string
          payment_method: string
          reference_number?: string | null
          status?: string
          supplier_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          payment_date?: string
          payment_method?: string
          reference_number?: string | null
          status?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "supplier_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string
          category: string
          contact_person: string
          created_at: string
          email: string
          id: string
          last_order_date: string | null
          name: string
          payment_terms: string | null
          phone: string
          rating: number | null
          status: string
          tax_id: string | null
          total_amount: number | null
          total_orders: number | null
          updated_at: string
        }
        Insert: {
          address: string
          category: string
          contact_person: string
          created_at?: string
          email: string
          id?: string
          last_order_date?: string | null
          name: string
          payment_terms?: string | null
          phone: string
          rating?: number | null
          status?: string
          tax_id?: string | null
          total_amount?: number | null
          total_orders?: number | null
          updated_at?: string
        }
        Update: {
          address?: string
          category?: string
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          last_order_date?: string | null
          name?: string
          payment_terms?: string | null
          phone?: string
          rating?: number | null
          status?: string
          tax_id?: string | null
          total_amount?: number | null
          total_orders?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_employee_record: {
        Args: { emp_id: string }
        Returns: boolean
      }
      can_manage_employee: {
        Args: { employee_uuid: string }
        Returns: boolean
      }
      can_view_employee_sensitive_data: {
        Args: { employee_uuid: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_employee_basic_info: {
        Args: { emp_email?: string }
        Returns: {
          department_id: string
          email: string
          employee_id: string
          employment_type: string
          first_name: string
          hire_date: string
          id: string
          last_name: string
          phone: string
          position_id: string
          status: string
          total_leave_days: number
          used_leave_days: number
        }[]
      }
      get_employee_self_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          department_id: string
          email: string
          employee_id: string
          employment_type: string
          first_name: string
          hire_date: string
          id: string
          last_name: string
          phone: string
          position_id: string
          status: string
          total_leave_days: number
          updated_at: string
          used_leave_days: number
        }[]
      }
      is_hr_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_inventory_quantity: {
        Args: { item_name_param: string; quantity_change: number }
        Returns: undefined
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
