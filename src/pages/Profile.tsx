import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabaseClient';
import { Typography, Button, Paper, Box, Divider, Card, CardContent, Chip, Alert, Avatar, alpha, Snackbar } from '@mui/material';
import { ALL_INTERESTS } from '../types';
import type { Post } from '../types';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArticleIcon from '@mui/icons-material/Article';
import SaveIcon from '@mui/icons-material/Save';

const categoryConfig: Record<string, { gradient: string; icon: string }> = {
  IT: { gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', icon: '💻' },
  Sport: { gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: '⚽' },
  Science: { gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', icon: '🔬' },
  Art: { gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', icon: '🎨' },
  Music: { gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: '🎵' },
  Soccer: { gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: '' },
};

const statusConfig = {
  draft: { label: 'На модерації', color: 'warning' as const, bg: '#fef3c7' },
  published: { label: 'Опубліковано', color: 'success' as const, bg: '#d1fae5' },
  rejected: { label: 'Відхилено', color: 'error' as const, bg: '#fee2e2' },
};

export default function Profile() {
  const { profile, updateInterests, updateRecommendations, user } = useAuthStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile?.interests) setSelected(profile.interests);
    if (profile?.recommendations) setSelectedRecommendations(profile.recommendations);
  }, [profile]);

  useEffect(() => {
    const fetchMyPosts = async () => {
      if (!user?.id) return;

      const { data } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });

      setMyPosts((data as Post[]) || []);
    };

    fetchMyPosts();
  }, [user?.id]);

  const handleToggle = (interest: string) => {
    setSelected((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
  };

  const handleToggleRecommendation = (category: string) => {
    setSelectedRecommendations((prev) => (prev.includes(category) ? prev.filter((i) => i !== category) : [...prev, category]));
  };

  const handleSave = async () => {
    await updateInterests(selected);
    await updateRecommendations(selectedRecommendations);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              fontSize: '2rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            }}
          >
            {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant='h4' fontWeight={700}>
              {profile?.full_name || 'Користувач'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mt: 0.5 }}>
              <EmailIcon sx={{ fontSize: 18 }} />
              <Typography>{profile?.email}</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant='h6' fontWeight={600} gutterBottom>
          Мої інтереси
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          Оберіть категорії, які вас цікавлять. Стрічка буде персоналізована під ваш вибір.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {ALL_INTERESTS.map((interest) => {
            const isSelected = selected.includes(interest);
            const config = categoryConfig[interest];
            return (
              <Chip
                key={interest}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span>{config.icon}</span>
                    <span>{interest}</span>
                    {isSelected && <CheckCircleIcon sx={{ fontSize: 16, ml: 0.5 }} />}
                  </Box>
                }
                onClick={() => handleToggle(interest)}
                sx={{
                  px: 1,
                  py: 2.5,
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: isSelected ? config.gradient : alpha('#6366f1', 0.08),
                  color: isSelected ? 'white' : 'text.primary',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: isSelected ? config.gradient : alpha('#6366f1', 0.15),
                    transform: 'scale(1.02)',
                  },
                }}
              />
            );
          })}
        </Box>

        <Button variant='contained' startIcon={<SaveIcon />} onClick={handleSave} sx={{ mt: 1 }}>
          Зберегти зміни
        </Button>

        <Snackbar
          open={saved}
          autoHideDuration={3000}
          onClose={() => setSaved(false)}
          message='Інтереси успішно збережено!'
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <ArticleIcon color='primary' />
          <Typography variant='h5' fontWeight={600}>
            Мої пости
          </Typography>
          <Chip label={myPosts.length} size='small' sx={{ ml: 1 }} />
        </Box>

        {myPosts.length === 0 ? (
          <Alert severity='info' sx={{ borderRadius: 3 }}>
            У вас поки немає створених постів. Створіть свій перший пост!
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {myPosts.map((post) => {
              const status = statusConfig[post.status];
              return (
                <Card
                  key={post.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    '&:hover': { transform: 'none', boxShadow: 'none' },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display='flex' justifyContent='space-between' alignItems='flex-start' mb={2}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant='h6' fontWeight={600}>
                          {post.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip
                            label={categoryConfig[post.category]?.icon + ' ' + post.category}
                            size='small'
                            sx={{
                              background: categoryConfig[post.category]?.gradient,
                              color: 'white',
                            }}
                          />
                        </Box>
                      </Box>
                      <Chip label={status.label} color={status.color} size='small' sx={{ fontWeight: 500 }} />
                    </Box>

                    <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                      {post.description}
                    </Typography>

                    {post.status === 'rejected' && post.rejection_reason && (
                      <Alert severity='error' sx={{ mt: 2 }}>
                        <Typography variant='subtitle2' fontWeight={600}>
                          Причина відхилення:
                        </Typography>
                        {post.rejection_reason}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
