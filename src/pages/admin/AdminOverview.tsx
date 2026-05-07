import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CalendarDays, Star, DollarSign } from 'lucide-react';
import { formatPrice } from '@/lib/image';

export default function AdminOverview() {
  const [stats, setStats] = useState({ accommodations: 0, bookings: 0, reviews: 0, revenue: 0 });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [acc, book, rev] = await Promise.all([
        supabase.from('accommodations').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id, total_price', { count: 'exact' }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
      ]);

      const revenue = (book.data ?? []).reduce((s: number, b: any) => s + (b.total_price || 0), 0);

      setStats({
        accommodations: acc.count ?? 0,
        bookings: book.count ?? 0,
        reviews: rev.count ?? 0,
        revenue,
      });

      const { data: recent } = await supabase
        .from('bookings')
        .select('id, check_in, check_out, total_price, guests, created_at, accommodations(title)')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentBookings(recent ?? []);
    }
    load();
  }, []);

  const cards = [
    { title: 'Properties', value: stats.accommodations, icon: Building2, color: 'text-primary' },
    { title: 'Bookings', value: stats.bookings, icon: CalendarDays, color: 'text-accent' },
    { title: 'Reviews', value: stats.reviews, icon: Star, color: 'text-yellow-500' },
    { title: 'Revenue', value: formatPrice(stats.revenue), icon: DollarSign, color: 'text-green-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading">Overview</h1>
          <p className="text-muted-foreground mt-1">Site statistics summary</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Card key={card.title} className="border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm">No bookings yet</p>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{b.accommodations?.title ?? 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{b.check_in} → {b.check_out} · {b.guests} guests</p>
                    </div>
                    <span className="font-semibold text-sm">{formatPrice(b.total_price)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
