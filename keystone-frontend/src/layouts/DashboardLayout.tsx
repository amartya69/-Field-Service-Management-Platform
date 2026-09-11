import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logoutSuccess } from '../store/authSlice';
import { useThemeContext } from '../contexts/ThemeContext';
import { useSocketContext } from '../contexts/SocketContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  workOrderService,
  technicianService,
  inventoryService,
  reportService,
  authService,
} from '../services/apiService';

import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Badge,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  InputBase,
  Breadcrumbs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Stack,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Build as BuildIcon,
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  QrCodeScanner as AssetIcon,
  Warehouse as InventoryIcon,
  Warning as SlaIcon,
  Assessment as ReportIcon,
  Notifications as BellIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  AccountCircle as ProfileIcon,
  ExitToApp as LogoutIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  Badge as TechIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  ShoppingCart as ShoppingCartIcon,
  CloudDownload as ExportIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

export const DashboardLayout: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useThemeContext();
  const { notifications, clearNotifications } = useSocketContext();

  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  // Dialog open states
  const [openWorkOrder, setOpenWorkOrder] = useState(false);
  const [openTechnician, setOpenTechnician] = useState(false);
  const [openInventory, setOpenInventory] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [openExport, setOpenExport] = useState(false);

  // Form states for New Work Order
  const [woTitle, setWoTitle] = useState('');
  const [woDescription, setWoDescription] = useState('');
  const [woPriority, setWoPriority] = useState('MEDIUM');
  const [woLocation, setWoLocation] = useState('');
  const [woTechId, setWoTechId] = useState<string>('');

  // Form states for Add Technician
  const [techUsername, setTechUsername] = useState('');
  const [techEmail, setTechEmail] = useState('');
  const [techPassword, setTechPassword] = useState('');
  const [techName, setTechName] = useState('');
  const [techSkills, setTechSkills] = useState('General Maintenance');
  const [techContact, setTechContact] = useState('');

  // Form states for Purchase Order
  const [poNumber, setPoNumber] = useState('');
  const [vendorName, setVendorName] = useState('');

  // Fetch Technicians for Work Order assignment
  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: technicianService.getAll,
    enabled: !!(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_DISPATCHER'),
  });

  // Pre-generate PO number when PO dialog opens
  useEffect(() => {
    if (openInventory) {
      setPoNumber('PO-' + Math.floor(10000 + Math.random() * 90000));
    }
  }, [openInventory]);

  // Mutations
  const mutateCreateWorkOrder = useMutation({
    mutationFn: workOrderService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
      enqueueSnackbar('Work Order created successfully!', { variant: 'success' });
      setOpenWorkOrder(false);
      // Reset state
      setWoTitle('');
      setWoDescription('');
      setWoPriority('MEDIUM');
      setWoLocation('');
      setWoTechId('');
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to create Work Order', { variant: 'error' });
    }
  });

  const mutateCreateTechnician = useMutation({
    mutationFn: authService.signup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      enqueueSnackbar('Technician registered successfully!', { variant: 'success' });
      setOpenTechnician(false);
      // Reset state
      setTechUsername('');
      setTechEmail('');
      setTechPassword('');
      setTechName('');
      setTechSkills('General Maintenance');
      setTechContact('');
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to register Technician', { variant: 'error' });
    }
  });

  const mutateCreatePo = useMutation({
    mutationFn: inventoryService.createPurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      enqueueSnackbar('Inventory Purchase Order raised successfully!', { variant: 'success' });
      setOpenInventory(false);
      setVendorName('');
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to raise Purchase Order', { variant: 'error' });
    }
  });

  const [open, setOpen] = useState(true);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElNotif, setAnchorElNotif] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemName, setSystemName] = useState(localStorage.getItem('keystone_system_name') || 'KEYSTONE');

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSystemName(localStorage.getItem('keystone_system_name') || 'KEYSTONE');
    };
    window.addEventListener('keystone_settings_updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('keystone_settings_updated', handleSettingsUpdate);
    };
  }, []);

  const toggleDrawer = () => setOpen(!open);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleOpenNotifMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElNotif(event.currentTarget);
  const handleCloseNotifMenu = () => setAnchorElNotif(null);

  const handleLogout = () => {
    dispatch(logoutSuccess());
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['ROLE_ADMIN', 'ROLE_DISPATCHER', 'ROLE_TECHNICIAN', 'ROLE_CUSTOMER', 'ROLE_AUDITOR'] },
    { text: 'Customer Portal', icon: <BuildIcon />, path: '/customer-portal', roles: ['ROLE_CUSTOMER'] },
    { text: 'Work Orders', icon: <BuildIcon />, path: '/work-orders', roles: ['ROLE_ADMIN', 'ROLE_DISPATCHER', 'ROLE_TECHNICIAN', 'ROLE_AUDITOR'] },
    { text: 'Dispatch Center', icon: <CalendarIcon />, path: '/dispatch', roles: ['ROLE_ADMIN', 'ROLE_DISPATCHER'] },
    { text: 'Technicians', icon: <TechIcon />, path: '/technicians', roles: ['ROLE_ADMIN', 'ROLE_DISPATCHER'] },
    { text: 'Customers', icon: <PeopleIcon />, path: '/customers', roles: ['ROLE_ADMIN', 'ROLE_DISPATCHER', 'ROLE_AUDITOR'] },
    { text: 'Assets', icon: <AssetIcon />, path: '/assets', roles: ['ROLE_ADMIN', 'ROLE_DISPATCHER', 'ROLE_TECHNICIAN', 'ROLE_CUSTOMER', 'ROLE_AUDITOR'] },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory', roles: ['ROLE_ADMIN', 'ROLE_DISPATCHER', 'ROLE_TECHNICIAN', 'ROLE_AUDITOR'] },
    { text: 'SLA Policies', icon: <SlaIcon />, path: '/sla', roles: ['ROLE_ADMIN', 'ROLE_DISPATCHER'] },
    { text: 'Reports', icon: <ReportIcon />, path: '/reports', roles: ['ROLE_ADMIN', 'ROLE_DISPATCHER', 'ROLE_AUDITOR'] },
    { text: 'Notifications', icon: <BellIcon />, path: '/notifications', roles: ['ROLE_ADMIN', 'ROLE_DISPATCHER', 'ROLE_TECHNICIAN', 'ROLE_CUSTOMER', 'ROLE_AUDITOR'] },
    { text: 'Platform Settings', icon: <SettingsIcon />, path: '/settings', roles: ['ROLE_ADMIN', 'ROLE_AUDITOR'] },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  // Generate dynamic breadcrumbs based on route
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    if (pathnames.length === 0) return null;

    return (
      <Breadcrumbs aria-label="breadcrumb" sx={{ display: { xs: 'none', md: 'flex' } }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
          <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
          Home
        </Link>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const label = value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

          return last ? (
            <Typography key={to} color="text.primary" sx={{ fontWeight: 600 }}>
              {label}
            </Typography>
          ) : (
            <Link key={to} to={to} style={{ color: 'inherit', textDecoration: 'none' }}>
              {label}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sticky AppBar — Liquid Glass */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: (theme) =>
              theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          }),
          boxShadow: 'none',
          background: mode === 'dark' ? 'rgba(2,6,23,0.82)' : 'rgba(240,244,255,0.85)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderBottom: mode === 'dark'
            ? '1px solid rgba(99,102,241,0.15)'
            : '1px solid rgba(99,102,241,0.12)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              edge="start"
              sx={{ color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
            
            {/* Breadcrumbs */}
            {getBreadcrumbs()}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Global Search Bar — Liquid Glass */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.06)',
                backdropFilter: 'blur(20px)',
                border: mode === 'dark'
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(99,102,241,0.15)',
                borderRadius: '14px',
                px: 1.5,
                py: 0.5,
                width: { xs: 150, sm: 260 },
                transition: 'all 400ms cubic-bezier(0.4,0,0.2,1)',
                '&:focus-within': {
                  borderColor: 'rgba(99,102,241,0.4)',
                  boxShadow: '0 0 0 3px rgba(99,102,241,0.15)',
                  background: mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.09)',
                },
              }}
            >
              <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
              <InputBase
                placeholder="Global Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  color: 'text.primary',
                  fontSize: '0.875rem',
                  width: '100%',
                  '& input::placeholder': { color: 'text.secondary', opacity: 1 },
                }}
              />
            </Box>

            {/* Theme Toggle */}
            <IconButton
              onClick={toggleTheme}
              sx={{
                color: 'text.secondary',
                background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.06)',
                border: mode === 'dark' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(99,102,241,0.12)',
                borderRadius: '12px',
                transition: 'all 300ms ease',
                '&:hover': {
                  color: '#818CF8',
                  background: 'rgba(99,102,241,0.12)',
                  borderColor: 'rgba(99,102,241,0.3)',
                },
              }}
            >
              {mode === 'dark' ? <LightIcon /> : <DarkIcon />}
            </IconButton>

            {/* Notification Bell */}
            <IconButton
              onClick={handleOpenNotifMenu}
              sx={{
                color: 'text.secondary',
                background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.06)',
                border: mode === 'dark' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(99,102,241,0.12)',
                borderRadius: '12px',
                transition: 'all 300ms ease',
                '&:hover': {
                  color: '#818CF8',
                  background: 'rgba(99,102,241,0.12)',
                  borderColor: 'rgba(99,102,241,0.3)',
                },
              }}
            >
              <Badge badgeContent={notifications.length} color="error">
                <BellIcon />
              </Badge>
            </IconButton>

            {/* Notifications Menu */}
            <Menu
              anchorEl={anchorElNotif}
              open={Boolean(anchorElNotif)}
              onClose={handleCloseNotifMenu}
              slotProps={{
                paper: {
                  sx: {
                    width: 340,
                    maxHeight: 450,
                    borderRadius: '20px',
                    mt: 1.5,
                    border: mode === 'light' ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 20px 45px rgba(0,0,0,0.1)',
                  }
                },
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Notification Board</Typography>
                {notifications.length > 0 && (
                  <ListItemButton onClick={clearNotifications} sx={{ p: 0, color: 'primary.main', fontSize: '0.85rem', maxWidth: 'fit-content' }}>
                    Clear all
                  </ListItemButton>
                )}
              </Box>
              <Divider />
              {notifications.length === 0 ? (
                <MenuItem sx={{ py: 4, justifyContent: 'center', color: 'text.secondary' }}>
                  No active notifications
                </MenuItem>
              ) : (
                notifications.map((n, i) => (
                  <MenuItem key={i} sx={{ whiteSpace: 'normal', py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.04)' }} onClick={() => { handleCloseNotifMenu(); navigate('/notifications'); }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{n.message}</Typography>
                      <Typography variant="caption" color="text.secondary">Just now</Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
              <Divider />
              <MenuItem onClick={() => { handleCloseNotifMenu(); navigate('/notifications'); }} sx={{ justifyContent: 'center', color: 'primary.main', fontWeight: 600 }}>
                View all notifications
              </MenuItem>
            </Menu>

            {/* Profile Dropdown */}
            <Tooltip title="User Profile">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5 }}>
                <Avatar
                  sx={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #4206ceff 40%, #06B6D4 75%, #22C55E 100%)',
                    backgroundSize: '300% 300%',
                    animation: 'iridescentShift 5s ease infinite',
                    color: '#F8FAFC',
                    fontWeight: 800,
                    width: 36,
                    height: 36,
                    fontSize: '0.9rem',
                  }}
                >
                  {user?.username.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              slotProps={{
                paper: {
                  sx: {
                    width: 220,
                    borderRadius: '16px',
                    mt: 1.5,
                    border: mode === 'light' ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 20px 45px rgba(0,0,0,0.1)',
                  }
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{user?.username}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'lowercase' }}>
                  {user?.role.replace('ROLE_', '')}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
                <ListItemIcon><ProfileIcon fontSize="small" /></ListItemIcon>
                My Account
              </MenuItem>
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/settings'); }}>
                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                Preferences
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                Log Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar — Liquid Glass */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : 76,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 76,
            boxSizing: 'border-box',
            borderRight: mode === 'dark'
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(99,102,241,0.12)',
            background: mode === 'dark' ? 'rgba(2,6,23,0.88)' : 'rgba(240,244,255,0.92)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            ...(!open && {
              width: 76,
              overflowX: 'hidden',
              transition: (theme) =>
                theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
            }),
          },
        }}
      >
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', px: 2 }}>
          {open && (
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 30%, #06B6D4 65%, #22C55E 100%)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'iridescentShift 5s ease infinite',
              }}
            >
              {systemName}
            </Typography>
          )}
          <IconButton
            onClick={toggleDrawer}
            sx={{
              color: 'text.secondary',
              borderRadius: '10px',
              transition: 'all 300ms ease',
              '&:hover': { color: '#818CF8', background: 'rgba(99,102,241,0.1)' },
            }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Toolbar>
        <Divider />

        <List sx={{ px: 1.5, py: 2, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
          {filteredMenuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 46,
                    justifyContent: open ? 'initial' : 'center',
                    px: 1.8,
                    borderRadius: '14px',
                    background: active
                      ? mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(6,182,212,0.15) 100%)'
                        : 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.08) 100%)'
                      : 'transparent',
                    border: active
                      ? mode === 'dark'
                        ? '1px solid rgba(99,102,241,0.3)'
                        : '1px solid rgba(99,102,241,0.25)'
                      : '1px solid transparent',
                    color: active ? '#818CF8' : 'text.secondary',
                    boxShadow: active ? '0 4px 20px rgba(99,102,241,0.15)' : 'none',
                    transition: 'all 400ms cubic-bezier(0.4,0,0.2,1)',
                    mb: 0.2,
                    '&:hover': {
                      background: active
                        ? mode === 'dark'
                          ? 'linear-gradient(135deg, rgba(99,102,241,0.32) 0%, rgba(6,182,212,0.2) 100%)'
                          : 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(6,182,212,0.12) 100%)'
                        : mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.06)',
                      color: active ? '#A5B4FC' : 'text.primary',
                      borderColor: active ? 'rgba(99,102,241,0.45)' : 'rgba(99,102,241,0.1)',
                      transform: active ? 'none' : 'translateX(3px)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: active ? '#818CF8' : 'text.secondary',
                      transition: 'color 400ms ease',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{
                        fontSize: '0.875rem',
                        fontWeight: active ? 700 : 500,
                        letterSpacing: active ? '0.01em' : 0,
                        color: active ? '#818CF8' : 'text.primary',
                      }}>
                        {item.text}
                      </Typography>
                    }
                    sx={{ opacity: open ? 1 : 0, transition: 'opacity 300ms ease' }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Main Content Area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          px: { xs: 2, md: 4 }, 
          pb: { xs: 2, md: 4 }, 
          pt: { xs: 11, md: 13 }, 
          width: '100%', 
          overflowX: 'hidden',
          minHeight: '100vh',
        }}
      >
        {/* Quick Actions Row — Liquid Glass */}
        {user && (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_DISPATCHER' || user.role === 'ROLE_AUDITOR') && (
          <Box sx={{ mb: 4 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              sx={{
                alignItems: 'center',
                flexWrap: 'wrap',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                borderRadius: '20px',
                p: 2.5,
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden',
                gap: 1.5,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0, left: '20%', right: '20%',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), rgba(6,182,212,0.3), transparent)',
                },
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', mr: 1 }}>
                Quick Actions:
              </Typography>
              {(user.role === 'ROLE_ADMIN' || user.role === 'ROLE_DISPATCHER') && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenWorkOrder(true)}
                    sx={{
                      borderRadius: '12px',
                      fontWeight: 700,
                      borderColor: 'rgba(34,197,94,0.35)',
                      color: '#4ADE80',
                      backdropFilter: 'blur(10px)',
                      background: 'rgba(34,197,94,0.06)',
                      transition: 'all 400ms cubic-bezier(0.4,0,0.2,1)',
                      '&:hover': { borderColor: '#22C55E', background: 'rgba(34,197,94,0.12)', transform: 'translateY(-1px)' },
                    }}
                  >
                    New Work Order
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setOpenTechnician(true)}
                    sx={{
                      borderRadius: '12px',
                      fontWeight: 700,
                      borderColor: 'rgba(99,102,241,0.35)',
                      color: '#818CF8',
                      backdropFilter: 'blur(10px)',
                      background: 'rgba(99,102,241,0.06)',
                      transition: 'all 400ms cubic-bezier(0.4,0,0.2,1)',
                      '&:hover': { borderColor: '#6366F1', background: 'rgba(99,102,241,0.12)', transform: 'translateY(-1px)' },
                    }}
                  >
                    Add Technician
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => setOpenInventory(true)}
                    sx={{
                      borderRadius: '12px',
                      fontWeight: 700,
                      borderColor: 'rgba(245,158,11,0.35)',
                      color: '#FCD34D',
                      backdropFilter: 'blur(10px)',
                      background: 'rgba(245,158,11,0.06)',
                      transition: 'all 400ms cubic-bezier(0.4,0,0.2,1)',
                      '&:hover': { borderColor: '#F59E0B', background: 'rgba(245,158,11,0.12)', transform: 'translateY(-1px)' },
                    }}
                  >
                    Raise Inventory Request
                  </Button>
                </>
              )}
              {(user.role === 'ROLE_ADMIN' || user.role === 'ROLE_DISPATCHER' || user.role === 'ROLE_AUDITOR') && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<ReportIcon />}
                    onClick={() => setOpenReport(true)}
                    sx={{
                      borderRadius: '12px',
                      fontWeight: 700,
                      borderColor: 'rgba(139,92,246,0.35)',
                      color: '#C4B5FD',
                      backdropFilter: 'blur(10px)',
                      background: 'rgba(139,92,246,0.06)',
                      transition: 'all 400ms cubic-bezier(0.4,0,0.2,1)',
                      '&:hover': { borderColor: '#8B5CF6', background: 'rgba(139,92,246,0.12)', transform: 'translateY(-1px)' },
                    }}
                  >
                    Generate Report
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ExportIcon />}
                    onClick={() => setOpenExport(true)}
                    sx={{
                      borderRadius: '12px',
                      fontWeight: 700,
                      borderColor: 'rgba(6,182,212,0.35)',
                      color: '#67E8F9',
                      backdropFilter: 'blur(10px)',
                      background: 'rgba(6,182,212,0.06)',
                      transition: 'all 400ms cubic-bezier(0.4,0,0.2,1)',
                      '&:hover': { borderColor: '#06B6D4', background: 'rgba(6,182,212,0.12)', transform: 'translateY(-1px)' },
                    }}
                  >
                    Export Data
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        )}

        <Outlet />

        {/* Dialog: New Work Order */}
        <Dialog open={openWorkOrder} onClose={() => setOpenWorkOrder(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: 800 }}>Create New Work Order</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Work Order Title"
                fullWidth
                required
                value={woTitle}
                onChange={(e) => setWoTitle(e.target.value)}
              />
              <TextField
                label="Description"
                fullWidth
                required
                multiline
                rows={3}
                value={woDescription}
                onChange={(e) => setWoDescription(e.target.value)}
              />
              <TextField
                select
                label="Priority"
                fullWidth
                required
                value={woPriority}
                onChange={(e) => setWoPriority(e.target.value)}
              >
                <MenuItem value="LOW">Low Priority</MenuItem>
                <MenuItem value="MEDIUM">Medium Priority</MenuItem>
                <MenuItem value="HIGH">High Priority</MenuItem>
                <MenuItem value="CRITICAL">Critical Priority</MenuItem>
              </TextField>
              <TextField
                label="Location / Customer Address"
                fullWidth
                required
                value={woLocation}
                onChange={(e) => setWoLocation(e.target.value)}
              />
              <TextField
                select
                label="Assign Technician (Optional)"
                fullWidth
                value={woTechId}
                onChange={(e) => setWoTechId(e.target.value)}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {technicians?.map((tech: any) => (
                  <MenuItem key={tech.id} value={tech.id}>
                    {tech.name} ({tech.skills})
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenWorkOrder(false)} color="inherit">Cancel</Button>
            <Button 
              variant="contained" 
              color="success"
              onClick={() => {
                if (!woTitle || !woDescription || !woLocation) {
                  enqueueSnackbar('Please fill all required fields', { variant: 'warning' });
                  return;
                }
                mutateCreateWorkOrder.mutate({
                  title: woTitle,
                  description: woDescription,
                  priority: woPriority,
                  location: woLocation,
                  technicianId: woTechId ? Number(woTechId) : null,
                  status: 'OPEN'
                });
              }}
              disabled={mutateCreateWorkOrder.isPending}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog: Add Technician */}
        <Dialog open={openTechnician} onClose={() => setOpenTechnician(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: 800 }}>Add New Technician</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Username"
                    fullWidth
                    required
                    value={techUsername}
                    onChange={(e) => setTechUsername(e.target.value)}
                    helperText="Between 3 and 20 characters"
                    error={techUsername.length > 0 && (techUsername.length < 3 || techUsername.length > 20)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    required
                    value={techPassword}
                    onChange={(e) => setTechPassword(e.target.value)}
                    helperText="Between 6 and 40 characters"
                    error={techPassword.length > 0 && (techPassword.length < 6 || techPassword.length > 40)}
                  />
                </Grid>
              </Grid>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                value={techEmail}
                onChange={(e) => setTechEmail(e.target.value)}
              />
              <TextField
                label="Full Name"
                fullWidth
                required
                value={techName}
                onChange={(e) => setTechName(e.target.value)}
              />
              <TextField
                label="Skills Portfolio (Comma separated)"
                fullWidth
                required
                value={techSkills}
                onChange={(e) => setTechSkills(e.target.value)}
                placeholder="e.g. Electrical, HVAC, Plumbing"
              />
              <TextField
                label="Contact Number"
                fullWidth
                value={techContact}
                onChange={(e) => setTechContact(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenTechnician(false)} color="inherit">Cancel</Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                if (!techUsername || !techEmail || !techPassword || !techName || !techSkills) {
                  enqueueSnackbar('Please fill all required fields', { variant: 'warning' });
                  return;
                }
                if (techUsername.length < 3 || techUsername.length > 20) {
                  enqueueSnackbar('Username must be between 3 and 20 characters', { variant: 'warning' });
                  return;
                }
                if (techPassword.length < 6 || techPassword.length > 40) {
                  enqueueSnackbar('Password must be between 6 and 40 characters', { variant: 'warning' });
                  return;
                }
                mutateCreateTechnician.mutate({
                  username: techUsername,
                  email: techEmail,
                  password: techPassword,
                  name: techName,
                  skills: techSkills,
                  contactNumber: techContact,
                  role: 'technician'
                });
              }}
              disabled={mutateCreateTechnician.isPending}
            >
              Register
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog: Raise Inventory Request */}
        <Dialog open={openInventory} onClose={() => setOpenInventory(false)} fullWidth maxWidth="xs">
          <DialogTitle sx={{ fontWeight: 800 }}>Raise Inventory Request (PO)</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Purchase Order Number"
                fullWidth
                disabled
                value={poNumber}
              />
              <TextField
                label="Vendor Name"
                fullWidth
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. Acme Industrial Supply"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenInventory(false)} color="inherit">Cancel</Button>
            <Button 
              variant="contained" 
              color="warning"
              onClick={() => {
                if (!vendorName) {
                  enqueueSnackbar('Please provide a Vendor Name', { variant: 'warning' });
                  return;
                }
                mutateCreatePo.mutate({
                  orderNumber: poNumber,
                  vendorName,
                  status: 'PENDING',
                  items: []
                });
              }}
              disabled={mutateCreatePo.isPending}
            >
              Raise PO
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog: Generate Report */}
        <Dialog open={openReport} onClose={() => setOpenReport(false)} fullWidth maxWidth="xs">
          <DialogTitle sx={{ fontWeight: 800 }}>Generate Operations Reports</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Select a summary dashboard or performance scorecard report to compile.
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  reportService.downloadDashboardCsv();
                  enqueueSnackbar('Dashboard overview report generated!', { variant: 'info' });
                }}
                sx={{ py: 1.5, textTransform: 'none', fontWeight: 600 }}
              >
                Dashboard Overview Summary
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  reportService.downloadTechnicianCsv();
                  enqueueSnackbar('Technician performance scorecard generated!', { variant: 'info' });
                }}
                sx={{ py: 1.5, textTransform: 'none', fontWeight: 600 }}
              >
                Technician Performance Scorecard
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenReport(false)} color="inherit">Close</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog: Export Data */}
        <Dialog open={openExport} onClose={() => setOpenExport(false)} fullWidth maxWidth="xs">
          <DialogTitle sx={{ fontWeight: 800 }}>Export Registry Data</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Download complete CSV table backups of system registries.
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  reportService.downloadTechnicianCsv();
                  enqueueSnackbar('Exported Technicians roster!', { variant: 'info' });
                }}
                sx={{ py: 1.5, textTransform: 'none', fontWeight: 600 }}
              >
                Export Technicians Roster
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  reportService.downloadCustomerCsv();
                  enqueueSnackbar('Exported Customers directory!', { variant: 'info' });
                }}
                sx={{ py: 1.5, textTransform: 'none', fontWeight: 600 }}
              >
                Export Customers Directory
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  reportService.downloadInventoryCsv();
                  enqueueSnackbar('Exported Inventory Ledger!', { variant: 'info' });
                }}
                sx={{ py: 1.5, textTransform: 'none', fontWeight: 600 }}
              >
                Export Inventory Catalog
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenExport(false)} color="inherit">Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
