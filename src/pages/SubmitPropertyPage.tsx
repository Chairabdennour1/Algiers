import { useState, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2, CheckCircle } from 'lucide-react';

export default function SubmitPropertyPage() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    property_name: '',
    property_type: '',
    location: '',
    price: '',
    image_url: '',
    description: '',
  });

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    setGoogleLoading(false);
    if (error) {
      toast.error(error.message || 'Google sign-in failed');
    } else {
      toast.success('Connected with Google!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in with Google first');
      return;
    }
    if (!form.property_name || !form.property_type || !form.location || !form.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('property_submissions' as any).insert({
      user_id: user.id,
      property_name: form.property_name,
      property_type: form.property_type,
      location: form.location,
      price: parseFloat(form.price),
      image_url: form.image_url || null,
      description: form.description || null,
    } as any);
    setLoading(false);
    if (error) {
      toast.error('Submission failed: ' + error.message);
    } else {
      setSubmitted(true);
      toast.success('Property submitted for review!');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center border-0 shadow-elevated">
            <CardContent className="pt-10 pb-8 space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-heading">Submission Received!</h2>
              <p className="text-muted-foreground">Your property has been submitted for review. Our team will review it and it will appear on the site once approved.</p>
              <Button onClick={() => navigate('/')} className="mt-4">Back to Home</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container max-w-2xl py-12 px-4">
        <Card className="border-0 shadow-elevated">
          <CardHeader className="text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl font-heading">Submit Your Property</CardTitle>
            <CardDescription>List your hotel, apartment, or guesthouse on Algiers Tourism</CardDescription>
          </CardHeader>
          <CardContent>
            {!user ? (
              <div className="text-center space-y-4 py-6">
                <p className="text-muted-foreground">You must sign in with Google to submit a property.</p>
                <Button onClick={handleGoogleSignIn} disabled={googleLoading} className="h-11">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {googleLoading ? 'Connexion...' : 'Se connecter avec Google'}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label>Property Name *</Label>
                  <Input placeholder="e.g. Hotel El Aurassi" value={form.property_name} onChange={e => setForm(f => ({ ...f, property_name: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Property Type *</Label>
                  <Select value={form.property_type} onValueChange={v => setForm(f => ({ ...f, property_type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="guesthouse">Guesthouse</SelectItem>
                      <SelectItem value="hostel">Hostel</SelectItem>
                      <SelectItem value="homestay">Homestay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input placeholder="e.g. Bab El Oued, Algiers" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Price per Night (DZD) *</Label>
                  <Input type="number" min="0" placeholder="e.g. 8000" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input placeholder="https://example.com/photo.jpg" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe your property..." rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Property'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
