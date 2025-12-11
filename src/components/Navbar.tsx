import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton, useTheme, alpha } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function Navbar() {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const NavButton = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <Button
      component={Link}
      to={to}
      startIcon={icon}
      sx={{
        color: 'white',
        mx: 0.5,
        px: 2,
        py: 1,
        borderRadius: 2,
        backgroundColor: isActive(to) ? alpha('#fff', 0.2) : 'transparent',
        '&:hover': {
          backgroundColor: alpha('#fff', 0.15),
        },
      }}
    >
      {label}
    </Button>
  );

  return (
    <AppBar
      position='sticky'
      elevation={0}
      sx={{
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Box
          component={Link}
          to='/'
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            mr: 4,
          }}
        >
          <AutoAwesomeIcon sx={{ color: 'white', mr: 1, fontSize: 28 }} />
          <Typography
            variant='h5'
            sx={{
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-0.5px',
            }}
          >
            SmartFeed
          </Typography>
        </Box>

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex' }}>
              <NavButton to='/' icon={<HomeIcon />} label='Стрічка' />
              <NavButton to='/create' icon={<AddIcon />} label='Створити' />
              <NavButton to='/profile' icon={<PersonIcon />} label='Профіль' />
              {profile?.role === 'admin' && <NavButton to='/admin' icon={<AdminPanelSettingsIcon />} label='Модерація' />}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <IconButton
                onClick={handleLogout}
                sx={{
                  color: 'white',
                  '&:hover': { backgroundColor: alpha('#fff', 0.1) },
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', ml: 'auto', gap: 1 }}>
            <Button
              component={Link}
              to='/login'
              sx={{
                color: 'white',
                '&:hover': { backgroundColor: alpha('#fff', 0.1) },
              }}
            >
              Вхід
            </Button>
            <Button
              component={Link}
              to='/register'
              variant='contained'
              sx={{
                background: 'white',
                color: theme.palette.primary.main,
                fontWeight: 600,
                '&:hover': {
                  background: alpha('#fff', 0.9),
                },
              }}
            >
              Реєстрація
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
