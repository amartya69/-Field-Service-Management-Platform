import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, technicianService } from '../services/apiService';
import { useAppSelector } from '../store';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  TextField,
  Button,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Lock as LockIcon,
  Schedule as ClockIcon,
} from '@mui/icons-material';

export const ProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Change Password Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Load Profile Response
  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: authService.profile,
  });

  // If user is technician, load attendance and performance metrics
  const isTech = user?.role === 'ROLE_TECHNICIAN';
  const techProfileId = profile?.technicianProfile?.id;

  const { data: attendanceLogs } = useQuery({
    queryKey: ['attendanceLogs', techProfileId],
    queryFn: () => techProfileId ? technicianService.getAttendanceLogs(techProfileId) : Promise.resolve([]),
    enabled: isTech && !!techProfileId,
  });

  const { data: performance } = useQuery({
    queryKey: ['techPerformance', techProfileId],
    queryFn: () => techProfileId ? technicianService.getPerformanceStats(techProfileId) : Promise.resolve(null),
    enabled: isTech && !!techProfileId,
  });

  // Mutations
  const mutatePassword = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      setOldPassword('');
      setNewPassword('');
      setFeedback({ type: 'success', msg: 'Password updated successfully!' });
    },
    onError: (err: any) => {
      setFeedback({ type: 'error', msg: err.response?.data?.message || 'Password update failed.' });
    },
  });

  const mutateClockIn = useMutation({
    mutationFn: () => technicianService.clockIn(techProfileId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceLogs', techProfileId] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  const mutateClockOut = useMutation({
    mutationFn: () => technicianService.clockOut(techProfileId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceLogs', techProfileId] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    mutatePassword.mutate({ oldPassword, newPassword });
  };

  return (
    <Box>


      <Grid container spacing={4}>
        {/* Profile Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={4}>
            {/* Account Details */}
            <Card>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Account Information</Typography>
                <Divider sx={{ mb: 3 }} />
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Username</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{profile?.username}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email Address</Typography>
                    <Typography variant="body1">{profile?.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Access Role</Typography>
                    <Typography variant="body1">{profile?.role}</Typography>
                  </Box>
                  {profile?.customerProfile && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Company Organization</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{profile.customerProfile.companyName}</Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LockIcon color="primary" /> Security Update
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {feedback && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.msg}</Alert>}

                <form onSubmit={handlePasswordSubmit}>
                  <Stack spacing={2.5}>
                    <TextField
                      label="Current Password"
                      type="password"
                      fullWidth
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />
                    <TextField
                      label="New Password"
                      type="password"
                      fullWidth
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <Button variant="contained" type="submit" sx={{ py: 1.2 }}>
                      Update Credentials
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Technician Attendance Panel */}
        {isTech && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={4}>
              {/* Daily Shift Operations */}
              <Card>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ClockIcon color="primary" /> Daily Attendance Shift
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  {performance && (
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid size={6}>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>{performance.slaComplianceRate.toFixed(1)}%</Typography>
                          <Typography variant="caption" color="text.secondary">SLA Resolution</Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>{performance.completedWorkOrdersCount}</Typography>
                          <Typography variant="caption" color="text.secondary">Resolved Tickets</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  )}

                  <Stack direction="row" spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      onClick={() => mutateClockIn.mutate()}
                      disabled={profile?.technicianProfile?.status !== 'OFF_DUTY'}
                    >
                      Clock In (Start Shift)
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={() => mutateClockOut.mutate()}
                      disabled={profile?.technicianProfile?.status === 'OFF_DUTY'}
                    >
                      Clock Out (End Shift)
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Shift History Log */}
              <Card>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Shift History Log</Typography>
                  <Divider sx={{ mb: 2 }} />

                  {attendanceLogs && attendanceLogs.length > 0 ? (
                    <List sx={{ maxHeight: 250, overflowY: 'auto' }}>
                      {attendanceLogs.map((log) => (
                        <React.Fragment key={log.id}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{log.date}</Typography>
                                  <Chip label={log.status} color="success" size="small" variant="outlined" />
                                </Stack>
                              }
                              secondary={
                                `In: ${new Date(log.checkIn).toLocaleTimeString()} | Out: ${
                                  log.checkOut ? new Date(log.checkOut).toLocaleTimeString() : 'Active Shift'
                                }`
                              }
                            />
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No shift records found.</Typography>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
export default ProfilePage;
