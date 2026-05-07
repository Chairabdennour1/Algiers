import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import AccommodationCard from '@/components/AccommodationCard';
import type { Accommodation } from '@/lib/types';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useReviewCounts } from '@/hooks/useReviewCounts';
import heroImage from '@/assets/hero-algiers.jpg';
import logoImage from '@/assets/logo-algiers-tourism.png';
import hotelsSectionImg from '@/assets/hotels-section.jpg';
import apartmentsSectionImg from '@/assets/apartments-section.jpg';

const HOTEL_TYPE = 'hotel';
const BUDGET_TYPES = ['guesthouse', 'hostel', 'apartment', 'homestay'];

export default function HomePage() {
  const [hotels, setHotels] = useState<Accommodation[]>([]);
  const [budget, setBudget] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [h, b] = await Promise.all([
        supabase.from('accommodations').select('*').eq('type', HOTEL_TYPE).order('rating', { ascending: false }).limit(6),
        supabase.from('accommodations').select('*').in('type', BUDGET_TYPES).order('rating', { ascending: false }).limit(6),
      ]);
      setHotels((h.data ?? []) as Accommodation[]);
      setBudget((b.data ?? []) as Accommodation[]);
      setLoading(false);
    }
    load();
  }, []);

  const allIds = useMemo(() => [...hotels, ...budget].map(a => a.id), [hotels, budget]);
  const reviewStats = useReviewCounts(allIds);

  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="shimmer rounded-2xl h-80" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <img src={heroImage} alt="Panoramic view of Algiers" className="absolute inset-0 w-full h-full object-cover scale-105 animate-float" style={{ animationDuration: '20s' }} width={1920} height={800} />
        {/* Logo watermark overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08]">
          <img src={logoImage} alt="" className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] object-contain" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/90 dark:from-background/40 dark:via-background/60 dark:to-background/95" />
        <div className="relative z-10 container text-center space-y-8 px-4 pt-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 mb-4 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-xs font-medium text-primary-foreground uppercase tracking-wider">Live Bookings Available</span>
          </div>
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <p className="text-sm md:text-base font-medium uppercase tracking-[0.3em] text-primary-foreground/80">Welcome to Algiers</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading tracking-tight text-primary-foreground text-balance leading-[1.1] drop-shadow-2xl">
              Discover the best<br className="hidden md:block" /> accommodations in Algiers
            </h1>
            <p className="text-base md:text-lg text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed font-light">
              Luxury hotels, guesthouses, and furnished apartments in Algeria's capital.
            </p>
          </div>
          <div className="max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '200ms' }}>
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="container py-20">
        <Tabs defaultValue="hotels" className="space-y-12">
          <div className="text-center space-y-4 mb-8">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Explore</p>
            <h2 className="text-3xl md:text-4xl font-heading">Find Your Perfect Stay</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Browse our curated selection of premium accommodations in Algiers</p>
          </div>
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2 h-14 rounded-xl p-1 bg-muted/50">
            <TabsTrigger value="hotels" className="text-sm font-semibold rounded-lg data-[state=active]:shadow-md transition-all duration-300">🏨 Hotels (Luxury & Business)</TabsTrigger>
            <TabsTrigger value="budget" className="text-sm font-semibold rounded-lg data-[state=active]:shadow-md transition-all duration-300">🏡 Guesthouses & Rentals</TabsTrigger>
          </TabsList>

          {/* Hotels Tab */}
          <TabsContent value="hotels" className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex items-start gap-5">
                <div className="hidden md:block relative">
                  <img src={hotelsSectionImg} alt="Hotels" className="w-24 h-24 rounded-2xl object-cover shadow-card" loading="lazy" width={800} height={600} />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10"></div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent mb-2">Collection</p>
                  <h2 className="text-3xl md:text-4xl font-heading">Best Hotels in Algiers</h2>
                  <p className="text-muted-foreground mt-2 leading-relaxed">Top-rated establishments for your stay</p>
                </div>
              </div>
              <Link to="/search?type=hotel">
                <Button variant="ghost" className="gap-2 group/btn hover:bg-primary/5 transition-all duration-300">
                  See all <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </div>
            {loading ? <SkeletonGrid /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((h, i) => (
                  <div key={h.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <AccommodationCard accommodation={h} reviewCount={reviewStats[h.id]?.count} avgRating={reviewStats[h.id]?.avg} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex items-start gap-5">
                <div className="hidden md:block relative">
                  <img src={apartmentsSectionImg} alt="Guesthouses" className="w-24 h-24 rounded-2xl object-cover shadow-card" loading="lazy" width={800} height={600} />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10"></div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent mb-2">Collection</p>
                  <h2 className="text-3xl md:text-4xl font-heading">Guesthouses & Rentals</h2>
                  <p className="text-muted-foreground mt-2 leading-relaxed">Budget-friendly accommodations for travelers</p>
                </div>
              </div>
              <Link to="/search?type=budget">
                <Button variant="ghost" className="gap-2 group/btn hover:bg-primary/5 transition-all duration-300">
                  See all <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </div>
            {loading ? <SkeletonGrid /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {budget.map((a, i) => (
                  <div key={a.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <AccommodationCard accommodation={a} reviewCount={reviewStats[a.id]?.count} avgRating={reviewStats[a.id]?.avg} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <Footer />
    </div>
  );
}
