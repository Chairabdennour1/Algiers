import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ReviewStats {
  [accommodationId: string]: { count: number; avg: number };
}

export function useReviewCounts(accommodationIds: string[]) {
  const [stats, setStats] = useState<ReviewStats>({});

  useEffect(() => {
    if (accommodationIds.length === 0) return;

    async function load() {
      const { data } = await supabase
        .from('reviews')
        .select('accommodation_id, rating');

      if (!data) return;

      const map: ReviewStats = {};
      for (const row of data) {
        const id = row.accommodation_id;
        if (!map[id]) map[id] = { count: 0, avg: 0 };
        map[id].count++;
        map[id].avg += row.rating;
      }
      for (const id of Object.keys(map)) {
        map[id].avg = map[id].avg / map[id].count;
      }
      setStats(map);
    }
    load();
  }, [accommodationIds.join(',')]);

  return stats;
}
