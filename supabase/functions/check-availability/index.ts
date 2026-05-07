import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { property_id, check_in_date, check_out_date } = await req.json()

    if (!property_id || !check_in_date || !check_out_date) {
      return new Response(JSON.stringify({ error: 'Missing required fields: property_id, check_in_date, check_out_date' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get total rooms for this property
    const { data: property, error: propError } = await supabase
      .from('accommodations')
      .select('total_rooms')
      .eq('id', property_id)
      .single()

    if (propError || !property) {
      return new Response(JSON.stringify({ error: 'Property not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const totalRooms = property.total_rooms ?? 10

    // Count rooms booked during the requested date range (overlapping bookings)
    const { data: bookings, error: bookError } = await supabase
      .from('bookings')
      .select('room_count')
      .eq('accommodation_id', property_id)
      .neq('status', 'cancelled')
      .lt('check_in', check_out_date)
      .gt('check_out', check_in_date)

    if (bookError) {
      console.error('Bookings query error:', bookError)
      return new Response(JSON.stringify({ error: 'Failed to check availability' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const bookedRooms = (bookings ?? []).reduce((sum, b) => sum + (b.room_count || 1), 0)
    const availableRooms = Math.max(0, totalRooms - bookedRooms)

    return new Response(JSON.stringify({
      property_id,
      total_rooms: totalRooms,
      booked_rooms: bookedRooms,
      available_rooms: availableRooms,
      check_in_date,
      check_out_date,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Availability check error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
