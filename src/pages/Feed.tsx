import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabaseClient';
import {
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Typography,
  Chip,
  Button,
  Alert,
  Box,
  Stack,
  Tooltip,
  Fade,
  Skeleton,
} from '@mui/material';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TuneIcon from '@mui/icons-material/Tune';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import type { Post } from '../types';

const categoryColors: Record<string, string> = {
  IT: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  Sport: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  Science: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  Art: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
  Music: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
};

export default function Feed() {
  const { profile, updateInterests } = useAuthStore();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [recommendedPosts, setRecommendedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.interests || profile.interests.length === 0) {
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .in('category', profile.interests!)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      setPosts((data as Post[]) || []);
      setLoading(false);
    };

    const fetchRecommendations = async () => {
      if (!profile?.recommendations || profile.recommendations.length === 0) return;

      const { data } = await supabase
        .from('posts')
        .select('*')
        .in('category', profile.recommendations!)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3);

      setRecommendedPosts((data as Post[]) || []);
    };

    fetchPosts();
    fetchRecommendations();
  }, [profile?.interests, profile?.recommendations]);

  const handleNotInterested = async (categoryToRemove: string) => {
    if (!profile?.interests) return;
    const newInterests = profile.interests.filter((i) => i !== categoryToRemove);
    await updateInterests(newInterests);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
  };

  if (!profile?.interests || profile.interests.length === 0) {
    return (
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <TuneIcon sx={{ fontSize: 50, color: 'white' }} />
        </Box>
        <Typography variant='h5' fontWeight={600} gutterBottom>
          Налаштуйте свої інтереси
        </Typography>
        <Typography color='text.secondary' sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
          Оберіть теми, які вас цікавлять, щоб отримувати персоналізовану стрічку новин
        </Typography>
        <Button variant='contained' size='large' onClick={() => navigate('/profile')} sx={{ px: 4 }}>
          Перейти до налаштувань
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <WhatshotIcon sx={{ color: 'primary.main' }} />
          <Typography variant='h4' fontWeight={700}>
            Ваша стрічка
          </Typography>
        </Box>
        <Typography color='text.secondary'>Персоналізований контент на основі ваших інтересів</Typography>

        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          {profile.interests.map((interest) => (
            <Chip
              key={interest}
              label={interest}
              size='small'
              sx={{
                background: categoryColors[interest] || categoryColors.IT,
                color: 'white',
                fontWeight: 500,
              }}
            />
          ))}
        </Box>
      </Box>

      {recommendedPosts.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AutoAwesomeIcon sx={{ color: 'secondary.main' }} />
            <Typography variant='h5' fontWeight={600}>
              Рекомендації для вас
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            {recommendedPosts.map((post) => (
              <Card
                key={post.id}
                sx={{
                  flex: 1,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: 'secondary.light',
                  background: 'linear-gradient(135deg, rgba(236,72,153,0.05) 0%, rgba(139,92,246,0.05) 100%)',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
                onClick={() => navigate(`/post/${post.id}`)}
              >
                {post.image_url && (
                  <CardMedia component='img' height='120' image={post.image_url} alt={post.title} sx={{ objectFit: 'cover' }} />
                )}
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant='subtitle1' fontWeight={600} sx={{ flex: 1, mr: 1 }}>
                      {post.title}
                    </Typography>
                    <Chip
                      label={post.category}
                      size='small'
                      sx={{
                        background: categoryColors[post.category] || categoryColors.IT,
                        color: 'white',
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {post.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      {loading ? (
        <Stack spacing={3}>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton variant='rectangular' height={200} />
              <CardContent>
                <Skeleton variant='text' width='60%' height={32} />
                <Skeleton variant='text' width='100%' />
                <Skeleton variant='text' width='80%' />
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : posts.length === 0 ? (
        <Alert severity='info' sx={{ borderRadius: 3 }}>
          Поки немає постів за вашими інтересами. Спробуйте пізніше!
        </Alert>
      ) : (
        <Stack spacing={3}>
          {posts.map((post, index) => (
            <Fade in timeout={300 + index * 100} key={post.id}>
              <Card
                sx={{
                  overflow: 'hidden',
                  '&:hover': {
                    '& .card-media': {
                      transform: 'scale(1.05)',
                    },
                  },
                }}
              >
                <CardActionArea onClick={() => navigate(`/post/${post.id}`)}>
                  {post.image_url && (
                    <Box sx={{ overflow: 'hidden' }}>
                      <CardMedia
                        className='card-media'
                        component='img'
                        height='220'
                        image={post.image_url}
                        alt={post.title}
                        sx={{
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease',
                        }}
                      />
                    </Box>
                  )}
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant='h5' fontWeight={600} sx={{ flex: 1, mr: 2 }}>
                        {post.title}
                      </Typography>
                      <Chip
                        label={post.category}
                        size='small'
                        sx={{
                          background: categoryColors[post.category] || categoryColors.IT,
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                    <Typography color='text.secondary' sx={{ mb: 2, lineHeight: 1.7 }}>
                      {post.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                      <AccessTimeIcon sx={{ fontSize: 16 }} />
                      <Typography variant='caption'>{formatDate(post.created_at)}</Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>

                <Box sx={{ px: 3, pb: 2, pt: 0 }}>
                  <Tooltip title={`Приховати категорію "${post.category}"`}>
                    <Button
                      startIcon={<NotInterestedIcon />}
                      size='small'
                      color='inherit'
                      onClick={() => handleNotInterested(post.category)}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'error.main',
                          backgroundColor: 'error.light',
                        },
                      }}
                    >
                      Не цікаво
                    </Button>
                  </Tooltip>
                </Box>
              </Card>
            </Fade>
          ))}
        </Stack>
      )}
    </Box>
  );
}
