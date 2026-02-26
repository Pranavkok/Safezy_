export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.4';
  };
  public: {
    Tables: {
      address: {
        Row: {
          city: string;
          country: string;
          created_at: string;
          id: number;
          locality: string | null;
          state: string;
          street1: string;
          street2: string | null;
          user_id: string | null;
          worksite_id: string | null;
          zipcode: string;
        };
        Insert: {
          city: string;
          country: string;
          created_at?: string;
          id?: number;
          locality?: string | null;
          state: string;
          street1: string;
          street2?: string | null;
          user_id?: string | null;
          worksite_id?: string | null;
          zipcode: string;
        };
        Update: {
          city?: string;
          country?: string;
          created_at?: string;
          id?: number;
          locality?: string | null;
          state?: string;
          street1?: string;
          street2?: string | null;
          user_id?: string | null;
          worksite_id?: string | null;
          zipcode?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'address_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'address_worskite_id_fkey';
            columns: ['worksite_id'];
            isOneToOne: false;
            referencedRelation: 'worksite';
            referencedColumns: ['id'];
          }
        ];
      };
      blog_subscribers: {
        Row: {
          created_at: string;
          id: number;
          subscriber_email: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: never;
          subscriber_email: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: never;
          subscriber_email?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      blogs: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          image_url: string | null;
          long_description: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: never;
          image_url?: string | null;
          long_description?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: never;
          image_url?: string | null;
          long_description?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          created_at: string;
          id: number;
          item_price: number;
          product_color: string;
          product_id: string;
          product_size: string;
          quantity: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          item_price: number;
          product_color: string;
          product_id: string;
          product_size: string;
          quantity: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          item_price?: number;
          product_color?: string;
          product_id?: string;
          product_size?: string;
          quantity?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cart_items_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'product';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cart_items_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      complaint: {
        Row: {
          created_at: string;
          description: string;
          id: number;
          image: string | null;
          order_id: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: number;
          image?: string | null;
          order_id?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: number;
          image?: string | null;
          order_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'complaint_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'order';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'complaint_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      contact: {
        Row: {
          company_name: string | null;
          contact_number: string | null;
          created_at: string;
          email: string;
          first_name: string;
          id: number;
          last_name: string;
          requirements: string;
        };
        Insert: {
          company_name?: string | null;
          contact_number?: string | null;
          created_at?: string;
          email: string;
          first_name: string;
          id?: number;
          last_name: string;
          requirements: string;
        };
        Update: {
          company_name?: string | null;
          contact_number?: string | null;
          created_at?: string;
          email?: string;
          first_name?: string;
          id?: number;
          last_name?: string;
          requirements?: string;
        };
        Relationships: [];
      };
      ehs_checklist_done_questions: {
        Row: {
          checklist_user_id: number | null;
          created_at: string;
          id: number;
          is_completed: Database['public']['Enums']['checklist_options'] | null;
          question_id: number;
          remarks: string | null;
          updated_at: string;
        };
        Insert: {
          checklist_user_id?: number | null;
          created_at?: string;
          id?: number;
          is_completed?:
            | Database['public']['Enums']['checklist_options']
            | null;
          question_id: number;
          remarks?: string | null;
          updated_at?: string;
        };
        Update: {
          checklist_user_id?: number | null;
          created_at?: string;
          id?: number;
          is_completed?:
            | Database['public']['Enums']['checklist_options']
            | null;
          question_id?: number;
          remarks?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ehs_checklist_done_questions_checklist_user_id_fkey';
            columns: ['checklist_user_id'];
            isOneToOne: false;
            referencedRelation: 'ehs_checklist_users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ehs_checklist_done_questions_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'ehs_checklist_questions';
            referencedColumns: ['id'];
          }
        ];
      };
      ehs_checklist_questions: {
        Row: {
          created_at: string;
          id: number;
          question: string;
          topic_id: number;
          updated_at: string;
          weightage: number;
        };
        Insert: {
          created_at?: string;
          id?: number;
          question: string;
          topic_id: number;
          updated_at?: string;
          weightage: number;
        };
        Update: {
          created_at?: string;
          id?: number;
          question?: string;
          topic_id?: number;
          updated_at?: string;
          weightage?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'ehs_checklist_questions_topic_id_fkey';
            columns: ['topic_id'];
            isOneToOne: false;
            referencedRelation: 'ehs_checklist_topics';
            referencedColumns: ['id'];
          }
        ];
      };
      ehs_checklist_topics: {
        Row: {
          created_at: string;
          id: number;
          image_url: string | null;
          topic_name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          image_url?: string | null;
          topic_name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          image_url?: string | null;
          topic_name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ehs_checklist_users: {
        Row: {
          created_at: string;
          date: string | null;
          id: number;
          inspected_by: string | null;
          progress: Json | null;
          site_name: string | null;
          topic_id: number | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          date?: string | null;
          id?: number;
          inspected_by?: string | null;
          progress?: Json | null;
          site_name?: string | null;
          topic_id?: number | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          date?: string | null;
          id?: number;
          inspected_by?: string | null;
          progress?: Json | null;
          site_name?: string | null;
          topic_id?: number | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'ehs_checklist_users_topic_id_fkey';
            columns: ['topic_id'];
            isOneToOne: false;
            referencedRelation: 'ehs_checklist_topics';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ehs_checklist_users_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      ehs_first_principles: {
        Row: {
          created_at: string;
          description: string;
          id: number;
          image_url: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: number;
          image_url: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: number;
          image_url?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ehs_incident_analysis: {
        Row: {
          additional_comments: string | null;
          affected_entity: Json | null;
          cause_to_entity: string | null;
          corrective_actions: string[] | null;
          created_at: string;
          custom_affected_entity: string | null;
          date: string | null;
          entity_details: Json | null;
          entity_shift_date: string | null;
          entity_shift_details: string | null;
          entity_shift_end_time: string | null;
          evidence_employee_list: Json | null;
          flowchart_points: Json | null;
          id: number;
          instructions_communicated:
            | Database['public']['Enums']['confirmation']
            | null;
          investigation_team: Json | null;
          is_a_past_incident:
            | Database['public']['Enums']['confirmation']
            | null;
          is_completed: boolean | null;
          location: string | null;
          narrative: string | null;
          past_incident_remarks: string | null;
          preventive_actions: string[] | null;
          process_before_incident: string | null;
          process_frequency: string | null;
          regular_process: Database['public']['Enums']['confirmation'] | null;
          severity_level: string | null;
          team_involved: Json | null;
          title: string;
          tools_involved: Json | null;
          training_provided: Database['public']['Enums']['confirmation'] | null;
          training_remarks: string | null;
          updated_at: string;
          viva_analysis: Json | null;
          witness_designation: string | null;
          witness_name: string | null;
          witness_records: Database['public']['Enums']['confirmation'] | null;
        };
        Insert: {
          additional_comments?: string | null;
          affected_entity?: Json | null;
          cause_to_entity?: string | null;
          corrective_actions?: string[] | null;
          created_at?: string;
          custom_affected_entity?: string | null;
          date?: string | null;
          entity_details?: Json | null;
          entity_shift_date?: string | null;
          entity_shift_details?: string | null;
          entity_shift_end_time?: string | null;
          evidence_employee_list?: Json | null;
          flowchart_points?: Json | null;
          id?: number;
          instructions_communicated?:
            | Database['public']['Enums']['confirmation']
            | null;
          investigation_team?: Json | null;
          is_a_past_incident?:
            | Database['public']['Enums']['confirmation']
            | null;
          is_completed?: boolean | null;
          location?: string | null;
          narrative?: string | null;
          past_incident_remarks?: string | null;
          preventive_actions?: string[] | null;
          process_before_incident?: string | null;
          process_frequency?: string | null;
          regular_process?: Database['public']['Enums']['confirmation'] | null;
          severity_level?: string | null;
          team_involved?: Json | null;
          title: string;
          tools_involved?: Json | null;
          training_provided?:
            | Database['public']['Enums']['confirmation']
            | null;
          training_remarks?: string | null;
          updated_at?: string;
          viva_analysis?: Json | null;
          witness_designation?: string | null;
          witness_name?: string | null;
          witness_records?: Database['public']['Enums']['confirmation'] | null;
        };
        Update: {
          additional_comments?: string | null;
          affected_entity?: Json | null;
          cause_to_entity?: string | null;
          corrective_actions?: string[] | null;
          created_at?: string;
          custom_affected_entity?: string | null;
          date?: string | null;
          entity_details?: Json | null;
          entity_shift_date?: string | null;
          entity_shift_details?: string | null;
          entity_shift_end_time?: string | null;
          evidence_employee_list?: Json | null;
          flowchart_points?: Json | null;
          id?: number;
          instructions_communicated?:
            | Database['public']['Enums']['confirmation']
            | null;
          investigation_team?: Json | null;
          is_a_past_incident?:
            | Database['public']['Enums']['confirmation']
            | null;
          is_completed?: boolean | null;
          location?: string | null;
          narrative?: string | null;
          past_incident_remarks?: string | null;
          preventive_actions?: string[] | null;
          process_before_incident?: string | null;
          process_frequency?: string | null;
          regular_process?: Database['public']['Enums']['confirmation'] | null;
          severity_level?: string | null;
          team_involved?: Json | null;
          title?: string;
          tools_involved?: Json | null;
          training_provided?:
            | Database['public']['Enums']['confirmation']
            | null;
          training_remarks?: string | null;
          updated_at?: string;
          viva_analysis?: Json | null;
          witness_designation?: string | null;
          witness_name?: string | null;
          witness_records?: Database['public']['Enums']['confirmation'] | null;
        };
        Relationships: [];
      };
      ehs_news: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          image_url: string | null;
          preview_url: string | null;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          image_url?: string | null;
          preview_url?: string | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          image_url?: string | null;
          preview_url?: string | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      ehs_suggestions: {
        Row: {
          created_at: string;
          id: number;
          suggestion_type: Database['public']['Enums']['ehs_suggestion_type'];
          topic_name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          suggestion_type: Database['public']['Enums']['ehs_suggestion_type'];
          topic_name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          suggestion_type?: Database['public']['Enums']['ehs_suggestion_type'];
          topic_name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ehs_toolbox_notes: {
        Row: {
          created_at: string;
          id: number;
          note: string | null;
          toolbox_talk_id: number | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          note?: string | null;
          toolbox_talk_id?: number | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          note?: string | null;
          toolbox_talk_id?: number | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'ehs_toolbox_notes_toolbox_talk_id_fkey';
            columns: ['toolbox_talk_id'];
            isOneToOne: false;
            referencedRelation: 'ehs_toolbox_talk';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ehs_toolbox_notes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      ehs_toolbox_talk: {
        Row: {
          avg_rating: number | null;
          created_at: string;
          description: string | null;
          id: number;
          pdf_url: string | null;
          summarized: string | null;
          topic_name: string;
          updated_at: string;
        };
        Insert: {
          avg_rating?: number | null;
          created_at?: string;
          description?: string | null;
          id?: number;
          pdf_url?: string | null;
          summarized?: string | null;
          topic_name: string;
          updated_at?: string;
        };
        Update: {
          avg_rating?: number | null;
          created_at?: string;
          description?: string | null;
          id?: number;
          pdf_url?: string | null;
          summarized?: string | null;
          topic_name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ehs_toolbox_users: {
        Row: {
          best_performer: string;
          created_at: string;
          id: number;
          rating: number | null;
          superior_email: string;
          toolbox_talk_id: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          best_performer: string;
          created_at?: string;
          id?: number;
          rating?: number | null;
          superior_email: string;
          toolbox_talk_id?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          best_performer?: string;
          created_at?: string;
          id?: number;
          rating?: number | null;
          superior_email?: string;
          toolbox_talk_id?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ehs_toolbox_users_toolbox_talk_id_fkey';
            columns: ['toolbox_talk_id'];
            isOneToOne: false;
            referencedRelation: 'ehs_toolbox_talk';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ehs_toolbox_users_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      employee: {
        Row: {
          assigned_equipments: number | null;
          contact_number: string;
          created_at: string;
          department: string | null;
          designation: string | null;
          id: number;
          name: string;
          plant: string | null;
          user_id: string | null;
          worksite_id: string | null;
        };
        Insert: {
          assigned_equipments?: number | null;
          contact_number: string;
          created_at?: string;
          department?: string | null;
          designation?: string | null;
          id?: number;
          name: string;
          plant?: string | null;
          user_id?: string | null;
          worksite_id?: string | null;
        };
        Update: {
          assigned_equipments?: number | null;
          contact_number?: string;
          created_at?: string;
          department?: string | null;
          designation?: string | null;
          id?: number;
          name?: string;
          plant?: string | null;
          user_id?: string | null;
          worksite_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'employee_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'employee_worksite_id_fkey';
            columns: ['worksite_id'];
            isOneToOne: false;
            referencedRelation: 'worksite';
            referencedColumns: ['id'];
          }
        ];
      };
      images: {
        Row: {
          created_at: string;
          id: number;
          image_url: string;
          incident_analysis_id: number | null;
          product_id: string | null;
          toolbox_user_id: number | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          image_url: string;
          incident_analysis_id?: number | null;
          product_id?: string | null;
          toolbox_user_id?: number | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          image_url?: string;
          incident_analysis_id?: number | null;
          product_id?: string | null;
          toolbox_user_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'images_incident_analysis_id_fkey';
            columns: ['incident_analysis_id'];
            isOneToOne: false;
            referencedRelation: 'ehs_incident_analysis';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'images_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'product';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'images_toolbox_user_id_fkey';
            columns: ['toolbox_user_id'];
            isOneToOne: false;
            referencedRelation: 'ehs_toolbox_users';
            referencedColumns: ['id'];
          }
        ];
      };
      order: {
        Row: {
          added_to_inventory: boolean | null;
          created_at: string;
          date: string;
          estimated_delivery_date: string | null;
          id: string;
          is_delivered: boolean | null;
          is_email_sent: boolean | null;
          is_feedback_added: boolean | null;
          order_details: Json | null;
          order_status: Database['public']['Enums']['orderStatus'];
          shipping_charges: number;
          total_amount: number;
          transaction_id: number | null;
          user_id: string;
          warehouse_operator_id: string | null;
          worksite_id: string | null;
        };
        Insert: {
          added_to_inventory?: boolean | null;
          created_at?: string;
          date: string;
          estimated_delivery_date?: string | null;
          id?: string;
          is_delivered?: boolean | null;
          is_email_sent?: boolean | null;
          is_feedback_added?: boolean | null;
          order_details?: Json | null;
          order_status: Database['public']['Enums']['orderStatus'];
          shipping_charges: number;
          total_amount: number;
          transaction_id?: number | null;
          user_id: string;
          warehouse_operator_id?: string | null;
          worksite_id?: string | null;
        };
        Update: {
          added_to_inventory?: boolean | null;
          created_at?: string;
          date?: string;
          estimated_delivery_date?: string | null;
          id?: string;
          is_delivered?: boolean | null;
          is_email_sent?: boolean | null;
          is_feedback_added?: boolean | null;
          order_details?: Json | null;
          order_status?: Database['public']['Enums']['orderStatus'];
          shipping_charges?: number;
          total_amount?: number;
          transaction_id?: number | null;
          user_id?: string;
          warehouse_operator_id?: string | null;
          worksite_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'order_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: false;
            referencedRelation: 'transaction';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_warehouse_operator_id_fkey';
            columns: ['warehouse_operator_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_worksite_id_fkey';
            columns: ['worksite_id'];
            isOneToOne: false;
            referencedRelation: 'worksite';
            referencedColumns: ['id'];
          }
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          id: number;
          order_id: string;
          order_item_details: Json | null;
          price: number;
          product_color: string | null;
          product_id: string;
          product_name: string | null;
          product_size: string | null;
          quantity: number;
        };
        Insert: {
          created_at?: string;
          id?: number;
          order_id: string;
          order_item_details?: Json | null;
          price: number;
          product_color?: string | null;
          product_id: string;
          product_name?: string | null;
          product_size?: string | null;
          quantity: number;
        };
        Update: {
          created_at?: string;
          id?: number;
          order_id?: string;
          order_item_details?: Json | null;
          price?: number;
          product_color?: string | null;
          product_id?: string;
          product_name?: string | null;
          product_size?: string | null;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'order';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'product';
            referencedColumns: ['id'];
          }
        ];
      };
      price_tiers: {
        Row: {
          created_at: string;
          id: number;
          max_quantity: number;
          min_quantity: number;
          price: number;
          product_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          max_quantity: number;
          min_quantity: number;
          price: number;
          product_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          max_quantity?: number;
          min_quantity?: number;
          price?: number;
          product_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'price_tiers_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'product';
            referencedColumns: ['id'];
          }
        ];
      };
      product: {
        Row: {
          avg_rating: number | null;
          brand_name: string;
          color: Json;
          created_at: string;
          description: string;
          geographical_location: string[] | null;
          gst: number | null;
          hsn_code: string | null;
          id: string;
          image: string;
          industry_use: Json | null;
          is_deleted: boolean;
          is_out_of_stock: boolean | null;
          lead_time: Json | null;
          ppe_category: string;
          ppe_name: string;
          price: number | null;
          product_ID: string | null;
          size: Json;
          sub_category: string | null;
          training_video: string;
          use_life: number;
        };
        Insert: {
          avg_rating?: number | null;
          brand_name: string;
          color: Json;
          created_at?: string;
          description: string;
          geographical_location?: string[] | null;
          gst?: number | null;
          hsn_code?: string | null;
          id?: string;
          image: string;
          industry_use?: Json | null;
          is_deleted?: boolean;
          is_out_of_stock?: boolean | null;
          lead_time?: Json | null;
          ppe_category: string;
          ppe_name: string;
          price?: number | null;
          product_ID?: string | null;
          size: Json;
          sub_category?: string | null;
          training_video: string;
          use_life: number;
        };
        Update: {
          avg_rating?: number | null;
          brand_name?: string;
          color?: Json;
          created_at?: string;
          description?: string;
          geographical_location?: string[] | null;
          gst?: number | null;
          hsn_code?: string | null;
          id?: string;
          image?: string;
          industry_use?: Json | null;
          is_deleted?: boolean;
          is_out_of_stock?: boolean | null;
          lead_time?: Json | null;
          ppe_category?: string;
          ppe_name?: string;
          price?: number | null;
          product_ID?: string | null;
          size?: Json;
          sub_category?: string | null;
          training_video?: string;
          use_life?: number;
        };
        Relationships: [];
      };
      product_history: {
        Row: {
          assigned_date: string;
          created_at: string;
          employee_id: number;
          id: number;
          inventory_id: string;
          quantity: number;
          unassigned_date: string | null;
        };
        Insert: {
          assigned_date: string;
          created_at?: string;
          employee_id: number;
          id?: number;
          inventory_id: string;
          quantity: number;
          unassigned_date?: string | null;
        };
        Update: {
          assigned_date?: string;
          created_at?: string;
          employee_id?: number;
          id?: number;
          inventory_id?: string;
          quantity?: number;
          unassigned_date?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'product_history_employee_id_fkey';
            columns: ['employee_id'];
            isOneToOne: false;
            referencedRelation: 'employee';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'product_history_inventory_id_fkey';
            columns: ['inventory_id'];
            isOneToOne: false;
            referencedRelation: 'product_inventory';
            referencedColumns: ['id'];
          }
        ];
      };
      product_inventory: {
        Row: {
          base_quantity: number | null;
          created_at: string;
          id: string;
          order_items_id: number;
          product_category: string | null;
          product_color: string | null;
          product_id: string | null;
          product_name: string | null;
          product_quantity: number | null;
          product_size: string | null;
          user_id: string | null;
          worksite_id: string | null;
        };
        Insert: {
          base_quantity?: number | null;
          created_at?: string;
          id?: string;
          order_items_id: number;
          product_category?: string | null;
          product_color?: string | null;
          product_id?: string | null;
          product_name?: string | null;
          product_quantity?: number | null;
          product_size?: string | null;
          user_id?: string | null;
          worksite_id?: string | null;
        };
        Update: {
          base_quantity?: number | null;
          created_at?: string;
          id?: string;
          order_items_id?: number;
          product_category?: string | null;
          product_color?: string | null;
          product_id?: string | null;
          product_name?: string | null;
          product_quantity?: number | null;
          product_size?: string | null;
          user_id?: string | null;
          worksite_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'product_inventory_order_items_id_fkey';
            columns: ['order_items_id'];
            isOneToOne: false;
            referencedRelation: 'order_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'product_inventory_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'product';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'product_inventory_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'product_inventory_worksite_id_fkey';
            columns: ['worksite_id'];
            isOneToOne: false;
            referencedRelation: 'worksite';
            referencedColumns: ['id'];
          }
        ];
      };
      product_rating: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          order_id: string | null;
          product_id: string | null;
          rating: number;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          order_id?: string | null;
          product_id?: string | null;
          rating: number;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          order_id?: string | null;
          product_id?: string | null;
          rating?: number;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'product_rating_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'order';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'product_rating_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'product';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'product_rating_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      transaction: {
        Row: {
          amount: number;
          created_at: string;
          date: string;
          id: number;
          payment_gateway_transaction_id: string;
          payment_mode: string;
          transaction_status: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          date: string;
          id?: number;
          payment_gateway_transaction_id: string;
          payment_mode: string;
          transaction_status: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          date?: string;
          id?: number;
          payment_gateway_transaction_id?: string;
          payment_mode?: string;
          transaction_status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transaction_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: number;
          role: Database['public']['Enums']['app_role'];
        };
        Insert: {
          created_at?: string;
          id?: number;
          role: Database['public']['Enums']['app_role'];
        };
        Update: {
          created_at?: string;
          id?: number;
          role?: Database['public']['Enums']['app_role'];
        };
        Relationships: [];
      };
      users: {
        Row: {
          auth_id: string;
          companies_served: Json | null;
          company_name: string | null;
          contact_number: string;
          created_at: string;
          email: string;
          first_name: string;
          geographical_location: Json[] | null;
          id: string;
          industries_type: Json | null;
          is_active: boolean | null;
          is_deleted: boolean | null;
          last_name: string;
          locations_served: Json | null;
          other_industries_type: string | null;
          other_services_type: string | null;
          role_id: number | null;
          service_type: Json | null;
          total_workers: string | null;
          user_unique_code: string | null;
        };
        Insert: {
          auth_id?: string;
          companies_served?: Json | null;
          company_name?: string | null;
          contact_number: string;
          created_at?: string;
          email: string;
          first_name: string;
          geographical_location?: Json[] | null;
          id?: string;
          industries_type?: Json | null;
          is_active?: boolean | null;
          is_deleted?: boolean | null;
          last_name: string;
          locations_served?: Json | null;
          other_industries_type?: string | null;
          other_services_type?: string | null;
          role_id?: number | null;
          service_type?: Json | null;
          total_workers?: string | null;
          user_unique_code?: string | null;
        };
        Update: {
          auth_id?: string;
          companies_served?: Json | null;
          company_name?: string | null;
          contact_number?: string;
          created_at?: string;
          email?: string;
          first_name?: string;
          geographical_location?: Json[] | null;
          id?: string;
          industries_type?: Json | null;
          is_active?: boolean | null;
          is_deleted?: boolean | null;
          last_name?: string;
          locations_served?: Json | null;
          other_industries_type?: string | null;
          other_services_type?: string | null;
          role_id?: number | null;
          service_type?: Json | null;
          total_workers?: string | null;
          user_unique_code?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'users_role_id_fkey';
            columns: ['role_id'];
            isOneToOne: false;
            referencedRelation: 'user_roles';
            referencedColumns: ['id'];
          }
        ];
      };
      videos: {
        Row: {
          created_at: string;
          id: number;
          incident_analysis_id: number | null;
          updated_at: string;
          video_url: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          incident_analysis_id?: number | null;
          updated_at?: string;
          video_url: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          incident_analysis_id?: number | null;
          updated_at?: string;
          video_url?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'videos_incident_analysis_id_fkey';
            columns: ['incident_analysis_id'];
            isOneToOne: false;
            referencedRelation: 'ehs_incident_analysis';
            referencedColumns: ['id'];
          }
        ];
      };
      worksite: {
        Row: {
          contact_number: string | null;
          created_at: string;
          email: string | null;
          id: string;
          site_manager: string | null;
          site_name: string;
          unique_code: string | null;
          user_id: string | null;
        };
        Insert: {
          contact_number?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          site_manager?: string | null;
          site_name: string;
          unique_code?: string | null;
          user_id?: string | null;
        };
        Update: {
          contact_number?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          site_manager?: string | null;
          site_name?: string;
          unique_code?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'worskite_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_updated_at_trigger_for_all_tables: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      custom_access_token_hook: {
        Args: { event: Json };
        Returns: Json;
      };
      fetch_all_contractors: {
        Args: Record<PropertyKey, never>;
        Returns: {
          company_name: string;
          contact_number: string;
          email: string;
          first_name: string;
          id: string;
          last_name: string;
          total_amount: number;
          total_orders: number;
          total_workers: string;
          total_worksite: number;
        }[];
      };
      fetch_contractors: {
        Args: {
          page_number?: number;
          page_size?: number;
          search_query?: string;
          sort_by?: string;
          sort_order?: string;
        };
        Returns: {
          contact_number: string;
          email: string;
          first_name: string;
          id: string;
          is_active: boolean;
          last_name: string;
          total_amount: number;
          total_count: number;
          total_orders: number;
        }[];
      };
      get_products_with_filters: {
        Args: {
          p_page?: number;
          p_page_size?: number;
          p_ppe_category?: string;
          p_search_query?: string;
          p_sort_by?: string;
          p_sort_order?: string;
        };
        Returns: {
          brand_name: string;
          created_at: string;
          id: string;
          image: string;
          is_deleted: boolean;
          order_frequency: number;
          ppe_category: string;
          ppe_name: string;
          price: number;
          product_ID: string;
          total_count: number;
          total_orders: number;
        }[];
      };
      handle_user_claims: {
        Args: { event: Json };
        Returns: Json;
      };
    };
    Enums: {
      app_role: 'admin' | 'contractor' | 'principle' | 'warehouse_operator';
      availability_status: 'In-Stock' | 'Out-of-Stock';
      checklist_options: 'Yes' | 'No' | 'N/A';
      confirmation: 'Yes' | 'No';
      ehs_suggestion_type: 'checklist' | 'first_principle' | 'toolbox_talk';
      incident_affected_entity: 'person' | 'place' | 'machine';
      orderStatus:
        | 'Out For Delivery'
        | 'Processing'
        | 'Delivered'
        | 'Cancelled'
        | 'Returned'
        | 'Shipped'
        | 'Complaint';
      payment_mode: 'Card' | 'Net Banking' | 'Cash';
      payment_status: 'Success' | 'Failed' | 'Pending' | 'Cancelled';
      product_status: 'Assigned' | 'Unassigned' | 'Damaged';
      role_type: 'admin' | 'contractor' | 'principal_employer';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ['admin', 'contractor', 'principle', 'warehouse_operator'],
      availability_status: ['In-Stock', 'Out-of-Stock'],
      checklist_options: ['Yes', 'No', 'N/A'],
      confirmation: ['Yes', 'No'],
      ehs_suggestion_type: ['checklist', 'first_principle', 'toolbox_talk'],
      incident_affected_entity: ['person', 'place', 'machine'],
      orderStatus: [
        'Out For Delivery',
        'Processing',
        'Delivered',
        'Cancelled',
        'Returned',
        'Shipped',
        'Complaint'
      ],
      payment_mode: ['Card', 'Net Banking', 'Cash'],
      payment_status: ['Success', 'Failed', 'Pending', 'Cancelled'],
      product_status: ['Assigned', 'Unassigned', 'Damaged'],
      role_type: ['admin', 'contractor', 'principal_employer']
    }
  }
} as const;
