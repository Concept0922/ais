import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Paper, Alert, Chip, alpha, InputAdornment, Card, CardMedia } from '@mui/material';
import { ALL_INTERESTS } from '../types';
import CreateIcon from '@mui/icons-material/Create';
import TitleIcon from '@mui/icons-material/Title';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';

const categoryConfig: Record<string, { gradient: string; icon: string }> = {
  IT: { gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', icon: '💻' },
  Sport: { gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: '⚽' },
  Science: { gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', icon: '🔬' },
  Art: { gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', icon: '🎨' },
  Music: { gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: '🎵' },
};

export default function CreatePost() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ title: '', description: '', category: 'IT', image_url: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('posts').insert({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      image_url: formData.image_url,
      user_id: user?.id,
      status: 'draft',
    });

    setLoading(false);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CreateIcon sx={{ color: 'primary.main' }} />
          <Typography variant='h4' fontWeight={700}>
            Створити пост
          </Typography>
        </Box>
        <Typography color='text.secondary'>Поділіться цікавою новиною з спільнотою</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        <Paper sx={{ p: 4, flex: 1 }}>
          <Alert severity='info' sx={{ mb: 3, borderRadius: 2 }}>
            Ваш пост буде перевірено модератором перед публікацією
          </Alert>

          <Box component='form' onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label='Заголовок'
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <TitleIcon color='action' />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label='Текст новини'
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={5}
              required
              sx={{ mb: 3 }}
            />

            <Typography variant='subtitle2' fontWeight={600} gutterBottom>
              Категорія
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {ALL_INTERESTS.map((interest) => {
                const isSelected = formData.category === interest;
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
                    onClick={() => setFormData({ ...formData, category: interest })}
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
                      },
                    }}
                  />
                );
              })}
            </Box>

            <TextField
              fullWidth
              label='URL картинки (опціонально)'
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              sx={{ mb: 3 }}
              placeholder='https://example.com/image.jpg'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <ImageIcon color='action' />
                  </InputAdornment>
                ),
              }}
            />

            <Button fullWidth variant='contained' type='submit' size='large' disabled={loading} startIcon={<SendIcon />} sx={{ py: 1.5 }}>
              {loading ? 'Відправка...' : 'Відправити на модерацію'}
            </Button>
          </Box>
        </Paper>

        <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }}>
          <Typography variant='subtitle2' fontWeight={600} gutterBottom color='text.secondary'>
            Попередній перегляд
          </Typography>
          <Card>
            <CardMedia component='img' height='200' image={formData.image_url} alt='Preview' sx={{ objectFit: 'cover' }} />
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant='h5' fontWeight={600}>
                  {formData.title || 'Заголовок поста'}
                </Typography>
                <Chip
                  label={formData.category}
                  size='small'
                  sx={{
                    background: categoryConfig[formData.category]?.gradient,
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
              </Box>
              <Typography color='text.secondary'>{formData.description || 'Текст вашого поста буде тут...'}</Typography>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
