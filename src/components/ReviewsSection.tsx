import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface Props {
  accommodationId: string;
}

export default function ReviewsSection({ accommodationId }: Props) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('accommodation_id', accommodationId)
      .order('created_at', { ascending: false });
    setReviews((data ?? []) as Review[]);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, [accommodationId]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleSubmit = async () => {
    if (!user) { toast.error('Connectez-vous pour laisser un avis'); return; }
    if (rating === 0) { toast.error('Veuillez sélectionner une note'); return; }
    
    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      accommodation_id: accommodationId,
      user_id: user.id,
      rating,
      comment: comment.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      toast.success('Avis publié !');
      setRating(0);
      setComment('');
      loadReviews();
    }
  };

  const handleDelete = async (reviewId: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (error) toast.error('Erreur lors de la suppression');
    else { setReviews(prev => prev.filter(r => r.id !== reviewId)); toast.success('Avis supprimé'); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold">Avis des voyageurs</h2>
          <div className="flex items-center gap-2 mt-1">
            {avgRating && (
              <>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-semibold font-body">{avgRating}</span>
                </div>
                <span className="text-muted-foreground font-body text-sm">·</span>
              </>
            )}
            <span className="text-sm text-muted-foreground font-body">
              {reviews.length} {reviews.length === 1 ? 'avis' : 'avis'}
            </span>
          </div>
        </div>
      </div>

      {/* Add review form */}
      {user && (
        <div className="bg-secondary/50 rounded-2xl p-6 space-y-4 border border-border/50">
          <h3 className="font-heading font-semibold">Laisser un avis</h3>
          
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'fill-accent text-accent'
                      : 'text-border'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-muted-foreground font-body">
                {rating}/5
              </span>
            )}
          </div>

          <Textarea
            placeholder="Partagez votre expérience... (optionnel)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="resize-none font-body"
            rows={3}
          />

          <Button onClick={handleSubmit} disabled={submitting || rating === 0} className="font-body">
            {submitting ? 'Publication...' : 'Publier l\'avis'}
          </Button>
        </div>
      )}

      {!user && (
        <p className="text-sm text-muted-foreground font-body bg-secondary/50 rounded-xl p-4 text-center">
          <a href="/auth/login" className="text-primary font-semibold hover:underline">Connectez-vous</a> pour laisser un avis
        </p>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-muted animate-pulse rounded-xl h-24" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-muted-foreground font-body py-8">
          Aucun avis pour le moment. Soyez le premier !
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-card rounded-xl border p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating ? 'fill-accent text-accent' : 'text-border'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground font-body mt-0.5">
                      {format(new Date(review.created_at), 'd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
                {user?.id === review.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(review.id)}
                    className="text-xs text-destructive hover:text-destructive font-body"
                  >
                    Supprimer
                  </Button>
                )}
              </div>
              {review.comment && (
                <p className="text-sm text-foreground/80 font-body leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
