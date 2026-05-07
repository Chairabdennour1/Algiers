import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/image';
import { toast } from 'sonner';
import type { Accommodation } from '@/lib/types';

const emptyForm = {
  title: '', type: 'hotel', district: '', price_per_night: 0, bedrooms: 1,
  max_guests: 2, description: '', stars: 3, amenities: '', website: '', image_keyword: '', category: 'business',
};

export default function AdminAccommodations() {
  const [items, setItems] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const { data } = await supabase.from('accommodations').select('*').order('created_at', { ascending: false });
    setItems((data ?? []) as Accommodation[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (item: Accommodation) => {
    setEditId(item.id);
    setForm({
      title: item.title, type: item.type, district: item.district,
      price_per_night: item.price_per_night, bedrooms: item.bedrooms,
      max_guests: item.max_guests, description: item.description ?? '',
      stars: item.stars ?? 3, amenities: (item.amenities ?? []).join(', '),
      website: (item as any).website ?? '', image_keyword: item.image_keyword ?? '',
      category: (item as any).category ?? 'business',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      title: form.title, type: form.type, district: form.district,
      price_per_night: Number(form.price_per_night), bedrooms: Number(form.bedrooms),
      max_guests: Number(form.max_guests), description: form.description || null,
      stars: Number(form.stars) || null,
      amenities: form.amenities ? form.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
      website: form.website || null,
      image_keyword: form.image_keyword || null,
      category: form.category || null,
    };

    if (editId) {
      const { error } = await supabase.from('accommodations').update(payload).eq('id', editId);
      if (error) { toast.error('Update failed'); return; }
      toast.success('Updated successfully');
    } else {
      const { error } = await supabase.from('accommodations').insert(payload);
      if (error) { toast.error('Failed to add: ' + error.message); return; }
      toast.success('Added successfully');
    }
    setDialogOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('accommodations').delete().eq('id', id);
    if (error) { toast.error('Delete failed'); return; }
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success('Deleted');
  };

  const typeLabel = (t: string) => {
    const map: Record<string, string> = { hotel: 'Hotel', apartment: 'Apartment', guesthouse: 'Guesthouse', hostel: 'Hostel', homestay: 'Homestay' };
    return map[t] || t;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading">Properties</h1>
            <p className="text-muted-foreground mt-1">Manage hotels, guesthouses, and apartments</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Property</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editId ? 'Edit Property' : 'Add New Property'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Name</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="guesthouse">Guesthouse</SelectItem>
                        <SelectItem value="hostel">Hostel</SelectItem>
                        <SelectItem value="homestay">Homestay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>District</Label><Input value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="luxury">Luxury</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="resort">Resort</SelectItem>
                        <SelectItem value="budget">Budget</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Stars (1-5)</Label><Input type="number" min={1} max={5} value={form.stars} onChange={e => setForm(p => ({ ...p, stars: +e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>Price/Night</Label><Input type="number" value={form.price_per_night} onChange={e => setForm(p => ({ ...p, price_per_night: +e.target.value }))} /></div>
                  <div><Label>Bedrooms</Label><Input type="number" value={form.bedrooms} onChange={e => setForm(p => ({ ...p, bedrooms: +e.target.value }))} /></div>
                  <div><Label>Guests</Label><Input type="number" value={form.max_guests} onChange={e => setForm(p => ({ ...p, max_guests: +e.target.value }))} /></div>
                </div>
                <div><Label>Website URL</Label><Input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://..." /></div>
                <div><Label>Image Keyword</Label><Input value={form.image_keyword} onChange={e => setForm(p => ({ ...p, image_keyword: e.target.value }))} placeholder="luxury-hotel" /></div>
                <div><Label>Amenities (comma-separated)</Label><Input value={form.amenities} onChange={e => setForm(p => ({ ...p, amenities: e.target.value }))} placeholder="wifi, pool, parking" /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
                <Button className="w-full" onClick={handleSave}>{editId ? 'Save Changes' : 'Add Property'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-muted rounded-xl" />)}
          </div>
        ) : (
          <div className="rounded-2xl border overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Price/Night</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{typeLabel(item.type)}</Badge></TableCell>
                    <TableCell>{item.district}</TableCell>
                    <TableCell>{formatPrice(item.price_per_night)}</TableCell>
                    <TableCell>{item.max_guests}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
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
