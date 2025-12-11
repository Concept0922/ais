import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Typography, Box, Alert, Paper, InputAdornment, IconButton, Chip, alpha } from '@mui/material';
import { ALL_INTERESTS } from '../types';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const categoryConfig: Record<string, { gradient: string; icon: string }> = {
  IT: { gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', icon: '💻' },
  Sport: { gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: '⚽' },
  Science: { gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', icon: '🔬' },
  Art: { gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', icon: '🎨' },
  Music: { gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: '🎵' },
};

export default function Register() {
  const signUp = useAuthStore((state) => state.signUp);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInterestChange = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInterests.length === 0) {
      setError('Оберіть хоча б один інтерес');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signUp(formData.email, formData.password, formData.fullName, selectedInterests);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Помилка реєстрації');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 5,
          width: '100%',
          maxWidth: 520,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Typography variant='h4' fontWeight={700} gutterBottom>
            Створіть акаунт
          </Typography>
          <Typography color='text.secondary'>Налаштуйте персональну стрічку новин</Typography>
        </Box>

        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component='form' onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Ім'я"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <PersonIcon color='action' />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label='Email'
            type='email'
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <EmailIcon color='action' />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label='Пароль'
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <LockIcon color='action' />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Typography variant='subtitle1' fontWeight={600} gutterBottom>
            Оберіть ваші інтереси
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Це допоможе персоналізувати вашу стрічку
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {ALL_INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
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
                  onClick={() => handleInterestChange(interest)}
                  sx={{
                    px: 1,
                    py: 2.5,
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    background: isSelected ? config.gradient : alpha('#6366f1', 0.08),
                    color: isSelected ? 'white' : 'text.primary',
                    border: isSelected ? 'none' : '2px solid transparent',
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

          <Button fullWidth variant='contained' type='submit' size='large' disabled={loading} sx={{ mb: 3, py: 1.5 }}>
            {loading ? 'Реєстрація...' : 'Зареєструватися'}
          </Button>
        </Box>

        <Typography textAlign='center' color='text.secondary'>
          Вже маєте акаунт?{' '}
          <Typography
            component={Link}
            to='/login'
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Увійти
          </Typography>
        </Typography>
      </Paper>
    </Box>
  );
}
