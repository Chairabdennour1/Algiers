const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const apiKey = Deno.env.get('OPENWEATHERMAP_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const trimmedKey = apiKey.trim()
  console.log(`API key length: ${trimmedKey.length}, first 4 chars: ${trimmedKey.substring(0, 4)}`)

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=36.7538&lon=3.0588&appid=${trimmedKey}&units=metric&lang=en`
    const res = await fetch(url)

    if (!res.ok) {
      const errorBody = await res.text()
      console.error(`OpenWeatherMap error [${res.status}]: ${errorBody}`)
      throw new Error(`OpenWeatherMap API error [${res.status}]`)
    }

    const data = await res.json()

    const weather = {
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name,
    }

    return new Response(JSON.stringify(weather), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Weather fetch error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch weather data' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
