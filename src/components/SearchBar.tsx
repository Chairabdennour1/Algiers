import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CalendarDays, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { Accommodation } from '@/lib/types';
import { Link } from 'react-router-dom';

export default function SearchBar() {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(2);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Accommodation[]>([]);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      const q = query.trim().toLowerCase();
      const { data } = await supabase
        .from('accommodations')
        .select('*')
        .or(`title.ilike.%${q}%,district.ilike.%${q}%,type.ilike.%${q}%,city.ilike.%${q}%`)
        .limit(6);
      setResults((data ?? []) as Accommodation[]);
      setShowResults(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn.toISOString());
    if (checkOut) params.set('checkOut', checkOut.toISOString());
    params.set('guests', guests.toString());
    if (query.trim()) params.set('q', query.trim());
    navigate(`/search?${params.toString()}`);
    setShowResults(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="glass-strong rounded-2xl shadow-elevated p-3 flex flex-col md:flex-row gap-3 items-stretch md:items-center max-w-4xl mx-auto transition-all duration-300 hover:shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/80 rounded-xl flex-1 min-w-0 transition-all duration-300 focus-within:bg-muted focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Search</p>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Hotel name, location, type..."
              className="text-sm font-medium bg-transparent outline-none w-full placeholder:text-muted-foreground/60 transition-colors"
            />
          </div>
        </div>

        {/* Check-in */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 bg-muted/80 rounded-xl flex-1 text-left transition-all duration-300 hover:bg-muted focus:ring-2 focus:ring-primary/20">
              <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Check-in</p>
                <p className={cn("text-sm font-medium", !checkIn && "text-muted-foreground")}>
                  {checkIn ? format(checkIn, 'MMM d, yyyy') : 'Select date'}
                </p>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} disabled={(date) => date < new Date()} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>

        {/* Check-out */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 bg-muted/80 rounded-xl flex-1 text-left transition-all duration-300 hover:bg-muted focus:ring-2 focus:ring-primary/20">
              <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Check-out</p>
                <p className={cn("text-sm font-medium", !checkOut && "text-muted-foreground")}>
                  {checkOut ? format(checkOut, 'MMM d, yyyy') : 'Select date'}
                </p>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} disabled={(date) => date < (checkIn || new Date())} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>

        {/* Guests */}
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/80 rounded-xl transition-all duration-300 hover:bg-muted">
          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Guests</p>
            <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="text-sm font-medium bg-transparent outline-none">
              {[1,2,3,4,5,6,7,8].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
          </div>
        </div>

        <Button onClick={handleSearch} className="md:px-8 h-12 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] glow-primary hover:glow-accent">
          <Search className="h-4 w-4 mr-2" /> Search
        </Button>
      </div>

      {/* Live search results dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-3 glass-strong rounded-2xl shadow-elevated z-50 max-h-80 overflow-y-auto overflow-x-hidden scrollbar-hide animate-scale-in">
          {results.map(r => (
            <Link
              key={r.id}
              to={`/accommodation/${r.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/80 transition-all duration-200 border-b border-border/30 last:border-b-0"
              onClick={() => setShowResults(false)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.district}, {r.city} · <span className="capitalize">{r.type}</span></p>
              </div>
              <span className="text-sm font-semibold text-primary whitespace-nowrap">{r.price_per_night.toLocaleString()} DZD</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
