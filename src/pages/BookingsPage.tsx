import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarDays, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface BookingWithAccommodation {
  id: string;
  check_in: string;
  check_out: string;
  guests: number;
  adults: number;
  children: number;
  room_count: number;
  total_price: number;
  status: string;
  created_at: string;
  accommodations: { title: string; type: string; district: string } | null;
}

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithAccommodation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth/login'); return; }
    async function load() {
      const { data } = await supabase.from('bookings')
        .select('id, check_in, check_out, guests, adults, children, room_count, total_price, status, created_at, accommodations(title, type, district)')
        .eq('user_id', user!.id).order('created_at', { ascending: false });
      setBookings((data ?? []) as BookingWithAccommodation[]);
      setLoading(false);
    }
    load();
  }, [user, authLoading, navigate]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) toast.error('Échec de l\'annulation');
    else { setBookings(prev => prev.filter(b => b.id !== id)); toast.success('Réservation annulée'); }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col"><Navbar />
        <div className="container py-8 flex-1"><div className="animate-pulse space-y-4">
          <div className="bg-muted rounded h-8 w-48" /><div className="bg-muted rounded-xl h-64" />
        </div></div><Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold">Mes Réservations</h1>
          <p className="text-muted-foreground font-body mt-1">Gérez vos réservations d'hébergements</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-heading font-semibold">Aucune réservation</p>
            <p className="text-muted-foreground mt-1 font-body">Explorez les hébergements disponibles à Alger</p>
            <Button className="mt-4 font-body" onClick={() => navigate('/search')}>Explorer</Button>
          </div>
        ) : (
          <div className="rounded-2xl border overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-body">Propriété</TableHead>
                  <TableHead className="font-body">Type</TableHead>
                  <TableHead className="font-body">Arrivée</TableHead>
                  <TableHead className="font-body">Départ</TableHead>
                  <TableHead className="font-body">Chambres</TableHead>
                  <TableHead className="font-body">Voyageurs</TableHead>
                  <TableHead className="font-body">Total</TableHead>
                  <TableHead className="font-body">Statut</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium font-body">{b.accommodations?.title ?? 'Inconnu'}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize font-body">{b.accommodations?.type === 'hotel' ? 'Hôtel' : b.accommodations?.type === 'guesthouse' ? 'Maison d\'hôtes' : 'Appart.'}</Badge></TableCell>
                    <TableCell className="font-body">{format(new Date(b.check_in), 'd MMM yyyy', { locale: fr })}</TableCell>
                    <TableCell className="font-body">{format(new Date(b.check_out), 'd MMM yyyy', { locale: fr })}</TableCell>
                    <TableCell className="font-body">{b.room_count}</TableCell>
                    <TableCell className="font-body">{b.adults} ad. {b.children > 0 ? `+ ${b.children} enf.` : ''}</TableCell>
                    <TableCell className="font-semibold font-body">{formatPrice(b.total_price)}</TableCell>
                    <TableCell><Badge variant={b.status === 'confirmed' ? 'default' : 'secondary'} className="capitalize font-body">{b.status === 'confirmed' ? 'Confirmé' : b.status === 'cancelled' ? 'Annulé' : b.status}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
