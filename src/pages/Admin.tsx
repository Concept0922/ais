import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabaseClient';
import { useRecommendations } from '../hooks/useRecommendations';
import type { Post } from '../types';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const categoryConfig: Record<string, { gradient: string; icon: string }> = {
  IT: { gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', icon: '💻' },
  Sport: { gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: '⚽' },
  Science: { gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', icon: '🔬' },
  Art: { gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', icon: '🎨' },
  Music: { gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: '🎵' },
};

export default function Admin() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const { generateForAllUsers } = useRecommendations();
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [openReject, setOpenReject] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [generatingRecs, setGeneratingRecs] = useState(false);

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      navigate('/');
    }
  }, [profile, navigate]);

  const fetchDrafts = async () => {
    const { data } = await supabase.from('posts').select('*').eq('status', 'draft').order('created_at', { ascending: false });
    setDrafts((data as Post[]) || []);
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleApprove = async (id: number) => {
    await supabase.from('posts').update({ status: 'published' }).eq('id', id);
    fetchDrafts();
  };

  const openRejectDialog = (id: number) => {
    setSelectedPostId(id);
    setOpenReject(true);
  };

  const handleRejectConfirm = async () => {
    if (selectedPostId) {
      await supabase
        .from('posts')
        .update({
          status: 'rejected',
          rejection_reason: reason,
        })
        .eq('id', selectedPostId);

      setOpenReject(false);
      setReason('');
      fetchDrafts();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleGenerateRecommendations = async () => {
    setGeneratingRecs(true);
    const result = await generateForAllUsers();
    setGeneratingRecs(false);
    setSnackbar({
      open: true,
      message: `Рекомендації згенеровано для ${result.success} користувачів`,
      severity: 'success',
    });
  };

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdminPanelSettingsIcon sx={{ color: 'primary.main' }} />
            <Typography variant='h4' fontWeight={700}>
              Панель модерації
            </Typography>
            {drafts.length > 0 && <Chip label={drafts.length} color='warning' size='small' sx={{ fontWeight: 600 }} />}
          </Box>
          <Button
            variant='contained'
            startIcon={<AutoAwesomeIcon />}
            onClick={handleGenerateRecommendations}
            disabled={generatingRecs}
            sx={{
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #db2777 0%, #7c3aed 100%)',
              },
            }}
          >
            {generatingRecs ? 'Генерація...' : 'Згенерувати рекомендації'}
          </Button>
        </Box>
        <Typography color='text.secondary'>Перегляньте та модеруйте нові публікації</Typography>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {drafts.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography variant='h5' fontWeight={600} gutterBottom>
            Все чисто!
          </Typography>
          <Typography color='text.secondary'>Наразі немає постів, що очікують на модерацію</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {drafts.map((post) => {
            const config = categoryConfig[post.category] || categoryConfig.IT;
            return (
              <Card key={post.id}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                  {post.image_url && (
                    <CardMedia
                      component='img'
                      sx={{
                        width: { xs: '100%', md: 280 },
                        height: { xs: 200, md: 'auto' },
                        objectFit: 'cover',
                      }}
                      image={post.image_url}
                      alt={post.title}
                    />
                  )}
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant='h5' fontWeight={600} gutterBottom>
                          {post.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip
                            label={config.icon + ' ' + post.category}
                            size='small'
                            sx={{
                              background: config.gradient,
                              color: 'white',
                              fontWeight: 500,
                            }}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                            <AccessTimeIcon sx={{ fontSize: 16 }} />
                            <Typography variant='caption'>{formatDate(post.created_at)}</Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Chip label='На модерації' color='warning' size='small' sx={{ fontWeight: 500 }} />
                    </Box>

                    <Typography color='text.secondary' sx={{ mb: 3, lineHeight: 1.7 }}>
                      {post.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant='contained'
                        color='success'
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleApprove(post.id)}
                        sx={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        }}
                      >
                        Опублікувати
                      </Button>
                      <Button variant='outlined' color='error' startIcon={<CancelIcon />} onClick={() => openRejectDialog(post.id)}>
                        Відхилити
                      </Button>
                    </Box>
                  </CardContent>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}

      <Dialog open={openReject} onClose={() => setOpenReject(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Причина відхилення</DialogTitle>
        <DialogContent>
          <Typography color='text.secondary' sx={{ mb: 2 }}>
            Вкажіть причину, чому цей пост не може бути опублікований. Автор побачить це повідомлення.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder='Наприклад: Невідповідний контент, порушення правил спільноти...'
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenReject(false)} color='inherit'>
            Скасувати
          </Button>
          <Button onClick={handleRejectConfirm} variant='contained' color='error' disabled={!reason.trim()}>
            Відхилити пост
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
