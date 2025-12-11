import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;

  checkUser: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string, interests: string[]) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateInterests: (newInterests: string[]) => Promise<void>;
  updateRecommendations: (newRecommendations: string[]) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  checkUser: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user });
        await get().fetchProfile(session.user.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ loading: false });
    }
  },

  fetchProfile: async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (data) {
      set({ profile: data as Profile });
    }
  },

  signUp: async (email, password, fullName, interests) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        interests: interests,
      });

      if (profileError) throw profileError;

      set({ user: data.user });
      await get().fetchProfile(data.user.id);
    }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ user: data.user });
    await get().fetchProfile(data.user.id);
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  updateInterests: async (newInterests) => {
    const userId = get().user?.id;
    if (!userId) return;

    const { error } = await supabase.from('profiles').update({ interests: newInterests }).eq('id', userId);

    if (!error) {
      const currentProfile = get().profile;
      if (currentProfile) {
        set({ profile: { ...currentProfile, interests: newInterests } });
      }
    }
  },

  updateRecommendations: async (newRecommendations) => {
    const userId = get().user?.id;
    if (!userId) return;

    const { error } = await supabase.from('profiles').update({ recommendations: newRecommendations }).eq('id', userId);

    if (!error) {
      const currentProfile = get().profile;
      if (currentProfile) {
        set({ profile: { ...currentProfile, recommendations: newRecommendations } });
      }
    }
  },
}));
