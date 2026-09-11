import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/apiService';
import type { Notification } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeContext } from '../contexts/ThemeContext';
import { useSnackbar } from 'notistack';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  IconButton,
  List,
  ListItem,
  CircularProgress,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Notifications as BellIcon,
  DoneAll as MarkAllIcon,
  MarkEmailUnread as UnreadIcon,
  CheckCircleOutlined as CheckedIcon,
  AccessTime as ClockIcon,
} from '@mui/icons-material';

export const NotificationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { mode } = useThemeContext();
  const { enqueueSnackbar } = useSnackbar();
  
  // Filter State: 'all' | 'unread'
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Load all notifications
  const { data: allNotifications, isLoading } = useQuery({
    queryKey: ['notificationsList'],
    queryFn: notificationService.getAll,
  });

  // Mark single notification as read
  const mutateRead = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
      enqueueSnackbar('Notification marked as read.', { variant: 'success' });
    },
  });

  // Mark all as read
  const mutateReadAll = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
      enqueueSnackbar('All notifications marked as read.', { variant: 'success' });
    },
  });

  // Filter logic
  const notifications = allNotifications || [];
  const filtered = filter === 'unread' 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Box>
      {/* Header section */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, gap: 2 }}
      >


        {unreadCount > 0 && (
          <Button
            variant="outlined"
            startIcon={<MarkAllIcon />}
            onClick={() => mutateReadAll.mutate()}
            sx={{
              borderRadius: '12px',
              px: 3,
              py: 1.2,
              fontWeight: 600,
              textTransform: 'none',
              borderColor: mode === 'light' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'transparent',
              }
            }}
          >
            Mark All as Read
          </Button>
        )}
      </Stack>

      <Grid container spacing={4}>
        {/* Navigation Sidebar Panel */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card 
            sx={{ 
              p: 2, 
              borderRadius: '24px', 
              boxShadow: mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(99,102,241,0.08)',
              background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(99,102,241,0.12)',
            }}
          >
            <Stack spacing={1}>
              <Button
                fullWidth
                variant={filter === 'all' ? 'contained' : 'text'}
                onClick={() => setFilter('all')}
                startIcon={<BellIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  borderRadius: '14px',
                  py: 1.5,
                  px: 2.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  color: filter === 'all' ? '#818CF8' : 'text.secondary',
                  background: filter === 'all'
                    ? mode === 'dark'
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(6,182,212,0.15) 100%)'
                      : 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.08) 100%)'
                    : 'transparent',
                  border: filter === 'all'
                    ? '1px solid rgba(99,102,241,0.3)'
                    : '1px solid transparent',
                  boxShadow: filter === 'all' ? '0 4px 20px rgba(99,102,241,0.15)' : 'none',
                  transition: 'all 400ms cubic-bezier(0.4,0,0.2,1)',
                  '&:hover': {
                    background: filter === 'all'
                      ? mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(99,102,241,0.32) 0%, rgba(6,182,212,0.2) 100%)'
                        : 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(6,182,212,0.12) 100%)'
                      : mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.06)',
                  }
                }}
              >
                All Messages ({notifications.length})
              </Button>
              <Button
                fullWidth
                variant={filter === 'unread' ? 'contained' : 'text'}
                onClick={() => setFilter('unread')}
                startIcon={<UnreadIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  borderRadius: '14px',
                  py: 1.5,
                  px: 2.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  color: filter === 'unread' ? '#818CF8' : 'text.secondary',
                  background: filter === 'unread'
                    ? mode === 'dark'
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(6,182,212,0.15) 100%)'
                      : 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.08) 100%)'
                    : 'transparent',
                  border: filter === 'unread'
                    ? '1px solid rgba(99,102,241,0.3)'
                    : '1px solid transparent',
                  boxShadow: filter === 'unread' ? '0 4px 20px rgba(99,102,241,0.15)' : 'none',
                  transition: 'all 400ms cubic-bezier(0.4,0,0.2,1)',
                  '&:hover': {
                    background: filter === 'unread'
                      ? mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(99,102,241,0.32) 0%, rgba(6,182,212,0.2) 100%)'
                        : 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(6,182,212,0.12) 100%)'
                      : mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.06)',
                  }
                }}
              >
                Unread Alerts ({unreadCount})
              </Button>
            </Stack>
          </Card>
        </Grid>

        {/* Notifications List Panel */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Card
            sx={{
              borderRadius: '24px',
              boxShadow: mode === 'light' ? '0 10px 30px rgba(0,0,0,0.03)' : '0 10px 30px rgba(0,0,0,0.3)',
              bgcolor: mode === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(23,26,35,0.65)',
              backdropFilter: 'blur(20px)',
              border: mode === 'light' ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.05)',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                  <CircularProgress color="primary" />
                </Box>
              ) : filtered.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, opacity: 0.7 }}>
                  <BellIcon sx={{ fontSize: 48, mb: 2, color: 'text.secondary' }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>All Caught Up!</Typography>
                  <Typography variant="body2" color="text.secondary">No notifications found matching this filter.</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  <AnimatePresence initial={false}>
                    {filtered.map((n: Notification, idx) => (
                      <motion.div
                        key={n.id || idx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ListItem
                          disablePadding
                          sx={{
                            mb: 2,
                            borderRadius: '16px',
                            border: '1px solid',
                            borderColor: n.isRead 
                              ? (mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)')
                              : (mode === 'light' ? 'rgba(34,197,94,0.15)' : 'rgba(74,222,128,0.15)'),
                            bgcolor: n.isRead
                              ? 'transparent'
                              : (mode === 'light' ? 'rgba(34,197,94,0.02)' : 'rgba(74,222,128,0.02)'),
                            boxShadow: n.isRead ? 'none' : '0 4px 20px rgba(0,0,0,0.02)',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateX(3px)',
                              borderColor: mode === 'light' ? 'rgba(34,197,94,0.3)' : 'rgba(74,222,128,0.3)',
                            }
                          }}
                        >
                          <Stack 
                            direction="row" 
                            spacing={2.5} 
                            sx={{ width: '100%', p: 2.5, alignItems: 'center', justifyContent: 'space-between' }}
                          >
                            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                              {/* Read/Unread pulse indicator */}
                              <Box 
                                sx={{ 
                                  width: 10, 
                                  height: 10, 
                                  borderRadius: '50%', 
                                  bgcolor: n.isRead ? 'text.disabled' : '#22C55E',
                                  boxShadow: n.isRead ? 'none' : '0 0 10px #22C55E',
                                }} 
                              />
                              
                              <Box>
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    fontWeight: n.isRead ? 500 : 700,
                                    color: n.isRead ? 'text.secondary' : 'text.primary',
                                  }}
                                >
                                  {n.message}
                                </Typography>
                                
                                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.8, color: 'text.secondary' }}>
                                  <ClockIcon sx={{ fontSize: 13 }} />
                                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                    {new Date(n.createdAt).toLocaleString()}
                                  </Typography>
                                </Stack>
                              </Box>
                            </Stack>

                            {!n.isRead && (
                              <Tooltip title="Mark as read">
                                <IconButton 
                                  color="success" 
                                  onClick={() => mutateRead.mutate(n.id)}
                                  sx={{ 
                                    bgcolor: mode === 'light' ? 'rgba(34,197,94,0.06)' : 'rgba(74,222,128,0.08)',
                                    '&:hover': {
                                      bgcolor: mode === 'light' ? 'rgba(34,197,94,0.15)' : 'rgba(74,222,128,0.15)',
                                    }
                                  }}
                                >
                                  <CheckedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </ListItem>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NotificationPage;
