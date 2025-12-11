export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  interests: string[] | null;
  recommendations: string[] | null;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Post {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string | null;
  created_at: string;
  status: 'draft' | 'published' | 'rejected';
  rejection_reason?: string;
}

export type Category = 'IT' | 'Sport' | 'Science' | 'Art' | 'Music' | 'Soccer';
export const ALL_INTERESTS: Category[] = ['IT', 'Sport', 'Science', 'Art', 'Music', 'Soccer'];
