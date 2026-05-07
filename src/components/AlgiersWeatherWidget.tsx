import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  city: string;
}

export default function AlgiersWeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Use wttr.in — free, no API key needed
        const res = await fetch('https://wttr.in/Algiers?format=j1');
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        const current = data.current_condition?.[0];
        if (!current) throw new Error('no data');
        
        setWeather({
          temp: Math.round(Number(current.temp_C)),
          description: current.weatherDesc?.[0]?.value ?? 'Unknown',
          icon: getWeatherEmoji(Number(current.weatherCode)),
          city: 'Algiers',
        });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-[#1E3A5F]/10 px-3 py-1.5 animate-pulse">
        <div className="h-4 w-4 rounded-full bg-muted" />
        <div className="h-3 w-12 rounded bg-muted" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs text-muted-foreground">
        <AlertCircle className="h-3.5 w-3.5" />
        <span>Weather unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-[#1E3A5F]/10 px-3 py-1.5">
      <span className="text-lg">{weather.icon}</span>
      <div className="flex flex-col leading-none">
        <span className="text-sm font-semibold text-foreground">{weather.temp}°C</span>
        <span className="text-[10px] capitalize text-muted-foreground">{weather.description}</span>
      </div>
    </div>
  );
}

function getWeatherEmoji(code: number): string {
  if (code === 113) return '☀️';
  if (code === 116) return '⛅';
  if ([119, 122].includes(code)) return '☁️';
  if ([176, 263, 266, 293, 296, 299, 302, 305, 308, 311, 314, 353, 356, 359].includes(code)) return '🌧️';
  if ([200, 386, 389, 392, 395].includes(code)) return '⛈️';
  if ([227, 230, 323, 326, 329, 332, 335, 338, 350, 362, 365, 368, 371, 374, 377].includes(code)) return '❄️';
  if ([143, 248, 260].includes(code)) return '🌫️';
  return '🌤️';
}
