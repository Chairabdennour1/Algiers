import type { Database } from '@/integrations/supabase/types';

export type Accommodation = Database['public']['Tables']['accommodations']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
