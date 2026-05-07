import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Star } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, accommodations(title)')
      .order('created_at', { ascending: false });
    setReviews(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) { toast.error('Delete failed'); return; }
    setReviews(prev => prev.filter(r => r.id !== id));
    toast.success('Review deleted');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading">Reviews</h1>
          <p className="text-muted-foreground mt-1">All user reviews</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-muted rounded-xl" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-semibold">No reviews yet</p>
          </div>
        ) : (
          <div className="rounded-2xl border overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.accommodations?.title ?? '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{r.comment || '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(r.created_at), 'd MMM yyyy')}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="text-destructive hover:text-destructive">
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
