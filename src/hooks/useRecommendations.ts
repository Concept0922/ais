import { supabase } from '../lib/supabaseClient';
import type { Category } from '../types';

const recommendationMap: Record<Category, Category[]> = {
  IT: ['Science', 'Art'],
  Sport: ['Music', 'Art'],
  Science: ['IT', 'Art'],
  Art: ['Music', 'Science'],
  Music: ['Art', 'Sport'],
  Soccer: ['Sport', 'Music'],
};

export const useRecommendations = () => {
  const generateRecommendations = async (userId: string, interests: string[]): Promise<string[]> => {
    if (!interests || interests.length === 0) return [];

    const recommendedCategories = new Set<string>();

    interests.forEach((interest) => {
      const recs = recommendationMap[interest as Category];
      if (recs) {
        recs.forEach((rec) => {
          if (!interests.includes(rec)) {
            recommendedCategories.add(rec);
          }
        });
      }
    });

    const recommendations = Array.from(recommendedCategories).slice(0, 3);

    const {} = await supabase.from('profiles').update({ recommendations }).eq('id', userId);

    return recommendations;
  };

  const generateForAllUsers = async (): Promise<{ success: number; failed: number }> => {
    const { data: profiles, error } = await supabase.from('profiles').select('id, interests');

    if (error || !profiles) {
      console.error('Error fetching profiles:', error);
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;

    for (const profile of profiles) {
      const result = await generateRecommendations(profile.id, profile.interests || []);
      if (result.length > 0 || profile.interests?.length === 0) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  };

  return {
    generateRecommendations,
    generateForAllUsers,
  };
};
