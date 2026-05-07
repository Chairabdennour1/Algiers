import { useEffect, useState, useMemo } from 'react';
import { useReviewCounts } from '@/hooks/useReviewCounts';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AccommodationCard from '@/components/AccommodationCard';
import type { Accommodation } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPrice } from '@/lib/image';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

const AMENITY_OPTIONS = ['wifi', 'pool', 'kitchen', 'parking', 'ac', 'spa', 'gym', 'restaurant'];
const BUDGET_TYPES = ['guesthouse', 'hostel', 'apartment', 'homestay'];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);

  // Hotel filters
  const [priceRange, setPriceRange] = useState([0, 40000]);
  const [bedrooms, setBedrooms] = useState<string>('any');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Budget filters
  const [budgetType, setBudgetType] = useState<string>('all');
  const [budgetSearch, setBudgetSearch] = useState('');
  const [budgetSort, setBudgetSort] = useState<string>('rating');
  const [hotelSearch, setHotelSearch] = useState('');

  const paramType = searchParams.get('type');
  const paramQ = searchParams.get('q') || '';
  const defaultTab = paramType === 'budget' ? 'budget' : 'hotels';

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('accommodations').select('*').order('rating', { ascending: false });
      setAccommodations((data ?? []) as Accommodation[]);
      setLoading(false);
    }
    load();
  }, []);

  const allIds = useMemo(() => accommodations.map(a => a.id), [accommodations]);
  const reviewStats = useReviewCounts(allIds);

  // Strictly separate hotels from budget types
  const hotels = useMemo(() => accommodations.filter(a => a.type === 'hotel'), [accommodations]);
  const budgetItems = useMemo(() => accommodations.filter(a => BUDGET_TYPES.includes(a.type)), [accommodations]);

  // Hotel filtering — only filters within hotels, never shows budget items
  const filteredHotels = useMemo(() => {
    let result = hotels;
    const guestsParam = searchParams.get('guests');
    const searchQ = hotelSearch.trim().toLowerCase() || paramQ.toLowerCase();
    result = result.filter(a => a.price_per_night >= priceRange[0] && a.price_per_night <= priceRange[1]);
    if (bedrooms !== 'any') result = result.filter(a => a.bedrooms >= Number(bedrooms));
    if (amenities.length > 0) result = result.filter(a => amenities.every(am => (a.amenities ?? []).includes(am)));
    if (guestsParam) result = result.filter(a => a.max_guests >= Number(guestsParam));
    if (searchQ) result = result.filter(a => a.title.toLowerCase().includes(searchQ) || a.district.toLowerCase().includes(searchQ));
    return result;
  }, [hotels, priceRange, bedrooms, amenities, searchParams, hotelSearch, paramQ]);

  // Budget filtering & sorting — only filters within budget items
  const filteredBudget = useMemo(() => {
    let result = budgetItems;
    if (budgetType !== 'all') result = result.filter(a => a.type === budgetType);
    if (budgetSearch.trim()) {
      const q = budgetSearch.toLowerCase();
      result = result.filter(a => a.title.toLowerCase().includes(q) || a.district.toLowerCase().includes(q));
    }
    result = [...result].sort((a, b) => {
      if (budgetSort === 'stars') return (b.stars ?? 0) - (a.stars ?? 0);
      return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    });
    return result;
  }, [budgetItems, budgetType, budgetSearch, budgetSort]);

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev => prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]);
  };

  const HotelFilters = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-semibold">Search</Label>
        <Input placeholder="Hotel name or district..." value={hotelSearch} onChange={e => setHotelSearch(e.target.value)} className="mt-2" />
      </div>
      <div>
        <Label className="text-sm font-semibold">Price Range: {formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}</Label>
        <Slider min={0} max={40000} step={500} value={priceRange} onValueChange={setPriceRange} className="mt-3" />
      </div>
      <div>
        <Label className="text-sm font-semibold">Bedrooms</Label>
        <Select value={bedrooms} onValueChange={setBedrooms}>
          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-semibold">Amenities</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {AMENITY_OPTIONS.map(am => (
            <label key={am} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={amenities.includes(am)} onCheckedChange={() => toggleAmenity(am)} />
              <span className="capitalize">{am}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const BudgetFilters = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-semibold">Search</Label>
        <Input placeholder="Name or district..." value={budgetSearch} onChange={e => setBudgetSearch(e.target.value)} className="mt-2" />
      </div>
      <div>
        <Label className="text-sm font-semibold">Type</Label>
        <Select value={budgetType} onValueChange={setBudgetType}>
          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="guesthouse">Guesthouse</SelectItem>
            <SelectItem value="hostel">Hostel</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="homestay">Homestay</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-semibold">Sort by</Label>
        <Select value={budgetSort} onValueChange={setBudgetSort}>
          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Rating (highest)</SelectItem>
            <SelectItem value="stars">Stars (highest)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8 flex-1">
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="h-11">
              <TabsTrigger value="hotels" className="font-semibold text-sm">🏨 Hotels</TabsTrigger>
              <TabsTrigger value="budget" className="font-semibold text-sm">🏡 Guesthouses & Rentals</TabsTrigger>
            </TabsList>
            <Button variant="outline" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
            </Button>
          </div>

          {/* Hotels Tab */}
          <TabsContent value="hotels">
            <p className="text-muted-foreground text-sm mb-4">{filteredHotels.length} hotels found</p>
            <div className="flex gap-8">
              <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-24 bg-card rounded-xl border p-5">
                  <h3 className="font-semibold mb-4">Filters</h3>
                  <HotelFilters />
                </div>
              </aside>
              {showFilters && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden">
                  <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-card border-l p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Filters</h3>
                      <button onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></button>
                    </div>
                    <HotelFilters />
                  </div>
                </div>
              )}
              <div className="flex-1">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="bg-muted animate-pulse rounded-xl h-80" />)}
                  </div>
                ) : filteredHotels.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-lg font-medium">No hotels found</p>
                    <p className="text-muted-foreground mt-1">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredHotels.map((a, i) => (
                      <div key={a.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                        <AccommodationCard accommodation={a} reviewCount={reviewStats[a.id]?.count} avgRating={reviewStats[a.id]?.avg} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget">
            <p className="text-muted-foreground text-sm mb-4">{filteredBudget.length} accommodations found</p>
            <div className="flex gap-8">
              <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-24 bg-card rounded-xl border p-5">
                  <h3 className="font-semibold mb-4">Filters</h3>
                  <BudgetFilters />
                </div>
              </aside>
              {showFilters && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden">
                  <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-card border-l p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Filters</h3>
                      <button onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></button>
                    </div>
                    <BudgetFilters />
                  </div>
                </div>
              )}
              <div className="flex-1">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="bg-muted animate-pulse rounded-xl h-80" />)}
                  </div>
                ) : filteredBudget.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-lg font-medium">No accommodations found</p>
                    <p className="text-muted-foreground mt-1">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredBudget.map((a, i) => (
                      <div key={a.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                        <AccommodationCard accommodation={a} reviewCount={reviewStats[a.id]?.count} avgRating={reviewStats[a.id]?.avg} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
