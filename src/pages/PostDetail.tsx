import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Box, Typography, Chip, Button, Card, CardMedia, CardContent, Paper, Skeleton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { Post } from '../types';

const categoryConfig: Record<string, { gradient: string; icon: string }> = {
  IT: { gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', icon: '💻' },
  Sport: { gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: '⚽' },
  Science: { gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', icon: '🔬' },
  Art: { gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', icon: '🎨' },
  Music: { gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: '🎵' },
  Soccer: { gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: '' },
};

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      const { data } = await supabase.from('posts').select('*').eq('id', id).single();

      setPost(data as Post);
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Skeleton variant='rectangular' height={400} sx={{ borderRadius: 4, mb: 3 }} />
        <Skeleton variant='text' width='60%' height={48} />
        <Skeleton variant='text' width='100%' />
        <Skeleton variant='text' width='80%' />
      </Box>
    );
  }

  if (!post) {
    return (
      <Paper sx={{ p: 6, mt: 4, textAlign: 'center' }}>
        <Typography variant='h5' fontWeight={600} gutterBottom>
          Пост не знайдено
        </Typography>
        <Typography color='text.secondary' sx={{ mb: 3 }}>
          Можливо, цей пост був видалений або ви перейшли за невірним посиланням
        </Typography>
        <Button variant='contained' startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
          Повернутися до стрічки
        </Button>
      </Paper>
    );
  }

  const config = categoryConfig[post.category] || categoryConfig.IT;

  return (
    <Box sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 3, color: 'text.secondary' }}>
        Назад до стрічки
      </Button>

      <Card sx={{ overflow: 'hidden' }}>
        {post.image_url && <CardMedia component='img' height='450' image={post.image_url} alt={post.title} sx={{ objectFit: 'cover' }} />}
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Typography variant='h3' fontWeight={700} sx={{ flex: 1, mr: 2 }}>
              {post.title}
            </Typography>
            <Chip
              label={config.icon + ' ' + post.category}
              sx={{
                background: config.gradient,
                color: 'white',
                fontWeight: 600,
                px: 1,
                py: 2.5,
                fontSize: '1rem',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4, color: 'text.secondary' }}>
            <AccessTimeIcon sx={{ fontSize: 20 }} />
            <Typography variant='body2'>Опубліковано: {formatDate(post.created_at)}</Typography>
          </Box>

          <Typography
            variant='body1'
            sx={{
              fontSize: '1.15rem',
              lineHeight: 1.9,
              color: 'text.primary',
            }}
          >
            {post.description}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
