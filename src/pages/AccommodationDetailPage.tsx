import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReviewsSection from '@/components/ReviewsSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAccommodationImages, formatPrice } from '@/lib/image';
import type { Accommodation } from '@/lib/types';
import { Star, MapPin, Users, BedDouble, CalendarDays, Wifi, Car, Waves, UtensilsCrossed, Dumbbell, Wind, Tv, Bath, Loader2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AMENITY_ICONS: Record<string, React.ElementType> = {
  wifi: Wifi, parking: Car, pool: Waves, restaurant: UtensilsCrossed,
  gym: Dumbbell, ac: Wind, tv: Tv, spa: Bath, kitchen: UtensilsCrossed,
};

export default function AccommodationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [availableRooms, setAvailableRooms] = useState<number | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const { data } = await supabase.from('accommodations').select('*').eq('id', id).single();
      setAccommodation(data as Accommodation | null);
      setLoading(false);
    }
    load();
  }, [id]);

  // Check availability when dates change
  const checkAvailability = useCallback(async () => {
    if (!id || !checkIn || !checkOut) {
      setAvailableRooms(null);
      return;
    }
    setCheckingAvailability(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-availability', {
        body: {
          property_id: id,
          check_in_date: format(checkIn, 'yyyy-MM-dd'),
          check_out_date: format(checkOut, 'yyyy-MM-dd'),
        },
      });
      if (error) throw error;
      setAvailableRooms(data.available_rooms);
      if (rooms > data.available_rooms) {
        setRooms(Math.max(1, data.available_rooms));
      }
    } catch {
      console.error('Failed to check availability');
      setAvailableRooms(null);
    } finally {
      setCheckingAvailability(false);
    }
  }, [id, checkIn, checkOut, rooms]);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  const images = getAccommodationImages(accommodation?.image_keyword ?? null);
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalPrice = nights > 0 ? nights * (accommodation?.price_per_night ?? 0) * rooms : 0;
  const totalGuests = adults + children;
  const maxRoomsAvailable = availableRooms ?? (accommodation?.total_rooms ?? 10);

  const handleBook = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour réserver');
      navigate('/auth/login');
      return;
    }
    if (!checkIn || !checkOut) {
      toast.error('Veuillez sélectionner les dates');
      return;
    }
    if (nights <= 0) {
      toast.error('Les dates sont invalides');
      return;
    }
    if (availableRooms !== null && availableRooms < rooms) {
      toast.error(`Seulement ${availableRooms} chambre(s) disponible(s)`);
      return;
    }

    setBooking(true);
    try {
      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        accommodation_id: id!,
        check_in: format(checkIn, 'yyyy-MM-dd'),
        check_out: format(checkOut, 'yyyy-MM-dd'),
        guests: totalGuests,
        adults,
        children,
        room_count: rooms,
        total_price: totalPrice,
        status: 'confirmed',
      });

      if (error) throw error;
      toast.success('Réservation confirmée !');
      navigate('/dashboard/bookings');
    } catch (err: any) {
      console.error('Booking error:', err);
      toast.error('Échec de la réservation. Veuillez réessayer.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col"><Navbar />
        <div className="container py-8 flex-1">
          <div className="animate-pulse space-y-4">
            <div className="bg-muted rounded-xl h-96" />
            <div className="bg-muted rounded h-8 w-1/2" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!accommodation) {
    return (
      <div className="min-h-screen flex flex-col"><Navbar />
        <div className="container py-20 text-center flex-1">
          <h1 className="text-2xl font-heading font-bold">Hébergement introuvable</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8 flex-1">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-10">
          <div className="md:col-span-3 rounded-2xl overflow-hidden aspect-[16/9]">
            <img src={images[selectedImage]} alt={accommodation.title} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 md:grid-cols-1 gap-3">
            {images.map((img, i) => (
              <button key={i} onClick={() => setSelectedImage(i)}
                className={cn("rounded-xl overflow-hidden aspect-square border-2 transition-all",
                  selectedImage === i ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-60 hover:opacity-100"
                )}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Details */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-secondary text-secondary-foreground border-0 font-body">
                  {accommodation.type === 'hotel' ? '🏨 Hôtel' : accommodation.type === 'guesthouse' ? '🏡 Maison d\'hôtes' : accommodation.type === 'hostel' ? '🛏️ Auberge' : accommodation.type === 'homestay' ? '🏠 Chez l\'habitant' : '🏠 Appartement'}
                </Badge>
                {accommodation.stars && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: accommodation.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold">{accommodation.title}</h1>
              <div className="flex items-center gap-4 mt-3 text-muted-foreground font-body">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {accommodation.district}, Alger
                </span>
                {accommodation.rating && (
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-accent text-accent" /> {Number(accommodation.rating).toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-8 py-5 border-y">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold font-body">{accommodation.max_guests}</p>
                  <p className="text-xs text-muted-foreground font-body">Voyageurs</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <BedDouble className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold font-body">{accommodation.bedrooms}</p>
                  <p className="text-xs text-muted-foreground font-body">{accommodation.bedrooms === 1 ? 'Chambre' : 'Chambres'}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-3">À propos</h2>
              <p className="text-muted-foreground leading-relaxed font-body">{accommodation.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-4">Équipements</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(accommodation.amenities ?? []).map(amenity => {
                  const Icon = AMENITY_ICONS[amenity] || Wifi;
                  return (
                    <div key={amenity} className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/70 border border-border/50">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-sm capitalize font-body">{amenity.replace('-', ' ')}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews */}
            <ReviewsSection accommodationId={accommodation.id} />
          </div>

          {/* Booking Card */}
          <div>
            <Card className="sticky top-24 shadow-elevated border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-baseline gap-1">
                  <span className="text-3xl font-heading font-bold text-primary">{formatPrice(accommodation.price_per_night)}</span>
                  <span className="text-sm text-muted-foreground font-body">/ nuit</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-left p-3 border rounded-xl hover:bg-secondary/50 transition-colors">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-medium">Arrivée</p>
                        <p className={cn("text-sm font-medium font-body mt-0.5", !checkIn && "text-muted-foreground")}>
                          {checkIn ? format(checkIn, 'd MMM', { locale: fr }) : 'Sélectionner'}
                        </p>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} disabled={(date) => date < new Date()} className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-left p-3 border rounded-xl hover:bg-secondary/50 transition-colors">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-medium">Départ</p>
                        <p className={cn("text-sm font-medium font-body mt-0.5", !checkOut && "text-muted-foreground")}>
                          {checkOut ? format(checkOut, 'd MMM', { locale: fr }) : 'Sélectionner'}
                        </p>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} disabled={(date) => date < (checkIn || new Date())} className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Availability indicator */}
                {checkIn && checkOut && (
                  <div className={cn(
                    "text-xs font-body px-3 py-2 rounded-lg text-center",
                    checkingAvailability ? "bg-muted text-muted-foreground" :
                    availableRooms !== null && availableRooms > 0 ? "bg-secondary text-primary" :
                    availableRooms === 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                  )}>
                    {checkingAvailability ? (
                      <span className="flex items-center justify-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Vérification...</span>
                    ) : availableRooms !== null ? (
                      availableRooms > 0 ? `${availableRooms} chambre(s) disponible(s)` : 'Complet pour ces dates'
                    ) : 'Disponibilité non vérifiée'}
                  </div>
                )}

                <div className="p-3 border rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-medium mb-1">Chambres</p>
                  <select value={rooms} onChange={(e) => setRooms(Number(e.target.value))}
                    className="w-full text-sm bg-transparent outline-none font-body">
                    {Array.from({ length: Math.max(1, maxRoomsAvailable) }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Chambre' : 'Chambres'}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 border rounded-xl">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-medium mb-1">Adultes</p>
                    <select value={adults} onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-full text-sm bg-transparent outline-none font-body">
                      {Array.from({ length: accommodation.max_guests * rooms }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div className="p-3 border rounded-xl">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-medium mb-1">Enfants</p>
                    <select value={children} onChange={(e) => setChildren(Number(e.target.value))}
                      className="w-full text-sm bg-transparent outline-none font-body">
                      {Array.from({ length: Math.max(0, (accommodation.max_guests * rooms) - adults) + 1 }, (_, i) => i).map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {nights > 0 && (
                  <div className="space-y-2 pt-3 border-t">
                    <div className="flex justify-between text-sm font-body">
                      <span className="text-muted-foreground">{formatPrice(accommodation.price_per_night)} × {nights} nuits × {rooms} {rooms === 1 ? 'chambre' : 'chambres'}</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span className="font-heading">Total</span>
                      <span className="text-primary font-heading">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleBook}
                  disabled={booking || !checkIn || !checkOut || nights <= 0 || (availableRooms !== null && availableRooms < rooms)}
                  className="w-full h-12 text-base font-body font-semibold"
                >
                  {booking ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Réservation en cours...</>
                  ) : (
                    <><CalendarDays className="h-4 w-4 mr-2" /> Réserver maintenant</>
                  )}
                </Button>

                {!user && (
                  <p className="text-xs text-center text-muted-foreground font-body">
                    Vous devez être connecté pour réserver
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
