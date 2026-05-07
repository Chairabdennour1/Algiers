import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/image';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('id, check_in, check_out, guests, total_price, created_at, user_id, accommodations(title, type)')
      .order('created_at', { ascending: false });
    setBookings(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) { toast.error('Delete failed'); return; }
    setBookings(prev => prev.filter(b => b.id !== id));
    toast.success('Booking deleted');
  };

  const typeLabel = (t: string) => {
    const map: Record<string, string> = { hotel: 'Hotel', apartment: 'Apartment', guesthouse: 'Guesthouse', hostel: 'Hostel', homestay: 'Homestay' };
    return map[t] || t;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading">Bookings</h1>
          <p className="text-muted-foreground mt-1">All user bookings</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-muted rounded-xl" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-semibold">No bookings yet</p>
          </div>
        ) : (
          <div className="rounded-2xl border overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.accommodations?.title ?? '—'}</TableCell>
                    <TableCell>{typeLabel(b.accommodations?.type)}</TableCell>
                    <TableCell>{format(new Date(b.check_in), 'd MMM yyyy')}</TableCell>
                    <TableCell>{format(new Date(b.check_out), 'd MMM yyyy')}</TableCell>
                    <TableCell>{b.guests}</TableCell>
                    <TableCell className="font-semibold">{formatPrice(b.total_price)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(b.created_at), 'd MMM yyyy')}</TableCell>
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
    </DashboardLayout>
  );
}
