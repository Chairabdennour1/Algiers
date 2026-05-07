import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) { setProfile(null); setLoading(false); return; }
    const { data } = await supabase
      .from('profiles')
      .select('id, user_id, display_name, avatar_url')
      .eq('user_id', user.id)
      .single();
    setProfile(data as Profile | null);
    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, [user]);

  const updateProfile = async (updates: { display_name?: string; avatar_url?: string }) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);
    if (!error) await fetchProfile();
    return { error };
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { error: new Error('Not authenticated'), url: null };
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) return { error, url: null };
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    await updateProfile({ avatar_url: publicUrl });
    return { error: null, url: publicUrl };
  };

  return { profile, loading, updateProfile, uploadAvatar, refetch: fetchProfile };
}
