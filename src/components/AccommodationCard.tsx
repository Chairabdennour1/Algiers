import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAccommodationImage, formatPrice } from '@/lib/image';
import type { Accommodation } from '@/lib/types';

interface Props {
  accommodation: Accommodation;
  reviewCount?: number;
  avgRating?: number;
}

export default function AccommodationCard({ accommodation, reviewCount, avgRating }: Props) {
  const { id, title, type, district, price_per_night, rating, stars, image_keyword, category } = accommodation;
  const displayRating = avgRating ?? (rating ? Number(rating) : null);

  return (
    <Link to={`/accommodation/${id}`} className="block group card-3d">
      <Card className="overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 h-full border-0 bg-card card-3d-hover">
        <div className="relative aspect-[4/3] overflow-hidden img-zoom">
          <img
            src={getAccommodationImage(image_keyword)}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Badge className="absolute top-3 left-3 bg-card/90 text-foreground backdrop-blur-sm border-0 font-body text-xs font-medium shadow-lg">
            {type === 'hotel' ? '🏨 Hôtel' : type === 'guesthouse' ? '🏡 Maison d\'hôtes' : type === 'hostel' ? '🛏️ Auberge' : type === 'homestay' ? '🏠 Chez l\'habitant' : '🏠 Appartement'}
          </Badge>
          {displayRating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-card/90 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-lg">
              <Star className="h-3 w-3 fill-accent text-accent" />
              <span className="text-xs font-semibold font-body">{displayRating.toFixed(1)}</span>
              {reviewCount !== undefined && reviewCount > 0 && (
                <span className="text-xs text-muted-foreground font-body">({reviewCount})</span>
              )}
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2.5">
          <h3 className="font-heading font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-xs font-body">{district}, Alger</span>
          </div>
          <div className="flex items-center gap-2">
            {stars && (
              <div className="flex gap-0.5">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                ))}
              </div>
            )}
            {category && (
              <Badge variant="outline" className="text-[10px] font-body capitalize px-1.5 py-0">
                {category}
              </Badge>
            )}
          </div>
          <div className="pt-1 flex items-baseline gap-1">
            <span className="font-heading text-lg font-bold text-primary">{formatPrice(price_per_night)}</span>
            <span className="text-xs text-muted-foreground font-body">/ nuit</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
