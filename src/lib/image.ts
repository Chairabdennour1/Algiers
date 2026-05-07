// Reliable Unsplash image URLs using the photos API format
const UNSPLASH_IMAGES: Record<string, string> = {
  'sofitel-luxury-hotel': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
  'historic-luxury-hotel': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop',
  'beach-resort-hotel': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop',
  'modern-business-hotel': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop',
  'panoramic-city-hotel': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop',
  'boutique-hotel-garden': 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&h=400&fit=crop',
  'modern-hotel-city': 'https://images.unsplash.com/photo-1606402179428-a57976d71fa4?w=600&h=400&fit=crop',
  'golden-hotel-modern': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
  'business-hotel-elegant': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop',
  'hilton-hotel-modern': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop',
  'city-center-hotel': 'https://images.unsplash.com/photo-1618773928121-c32f48dc17e0?w=600&h=400&fit=crop',
  'budget-hotel-clean': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
  'night-hotel-comfortable': 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop',
  'classic-european-hotel': 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=600&h=400&fit=crop',
  'modern-apartment-city': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop',
  'spacious-apartment-family': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop',
  'family-apartment-cozy': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
  'large-apartment-suburban': 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=400&fit=crop',
  'compact-apartment-metro': 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&h=400&fit=crop',
  'waterfront-apartment-luxury': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
  'spacious-residence-bright': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
  'villa-apartment-elegant': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop',
  'cozy-studio-apartment': 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=400&fit=crop',
  'beach-apartment-relaxed': 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=400&fit=crop',
};

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
];

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop';

export function getAccommodationImage(keyword: string | null): string {
  if (!keyword) return DEFAULT_IMAGE;
  return UNSPLASH_IMAGES[keyword] || DEFAULT_IMAGE;
}

export function getAccommodationImages(keyword: string | null, count = 4): string[] {
  const main = getAccommodationImage(keyword);
  return [main, ...GALLERY_IMAGES.slice(0, count - 1)];
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(price) + ' DZD';
}
