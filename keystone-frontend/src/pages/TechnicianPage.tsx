import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { technicianService } from '../services/apiService';
import type { Technician, Attendance } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeContext } from '../contexts/ThemeContext';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Button,
  Chip,
  IconButton,
  Divider,
  Drawer,
  TextField,
  MenuItem,
  Skeleton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Close as CloseIcon,
  Badge as TechIcon,
  Timeline as PerformanceIcon,
  AccessTime as ClockIcon,
  Settings as EditIcon,
} from '@mui/icons-material';

export const TechnicianPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { mode } = useThemeContext();
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [techStatus, setTechStatus] = useState('');
  const [skills, setSkills] = useState('');
  const [shift, setShift] = useState('');

  // Fetch Technicians
  const { data: technicians, isLoading } = useQuery({
    queryKey: ['technicians'],
    queryFn: technicianService.getAll,
  });

  // Fetch Performance Stats
  const { data: performance } = useQuery({
    queryKey: ['techPerformance', selectedTech?.id],
    queryFn: () => selectedTech?.id ? technicianService.getPerformanceStats(selectedTech.id) : Promise.resolve(null as any),
    enabled: !!selectedTech?.id,
  });

  // Fetch Attendance Logs
  const { data: attendanceLogs } = useQuery({
    queryKey: ['techAttendance', selectedTech?.id],
    queryFn: () => selectedTech?.id ? technicianService.getAttendanceLogs(selectedTech.id) : Promise.resolve([] as Attendance[]),
    enabled: !!selectedTech?.id,
  });

  // Mutation to update details
  const mutateDetails = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      technicianService.updateDetails(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      setSelectedTech(data);
    },
  });

  // Mutation to update status
  const mutateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      technicianService.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      setSelectedTech(data);
    },
  });

  // Clock in/out
  const mutateClockIn = useMutation({
    mutationFn: (id: number) => technicianService.clockIn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techAttendance', selectedTech?.id] });
    },
  });

  const mutateClockOut = useMutation({
    mutationFn: (id: number) => technicianService.clockOut(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techAttendance', selectedTech?.id] });
    },
  });

  const handleRowClick = (tech: Technician) => {
    setSelectedTech(tech);
    setTechStatus(tech.status);
    setSkills(tech.skills || '');
    setShift(tech.shift || '');
    setDrawerOpen(true);
  };

  const handleUpdateDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTech) {
      mutateDetails.mutate({
        id: selectedTech.id,
        payload: { skills, shift },
      });
    }
  };

  const handleStatusChange = (statusVal: string) => {
    if (selectedTech) {
      setTechStatus(statusVal);
      mutateStatus.mutate({ id: selectedTech.id, status: statusVal });
    }
  };

  return (
    <Box>
      {/* Main Grid table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: '24px', 
            overflow: 'hidden',
            boxShadow: mode === 'light' ? '0 10px 30px rgba(0,0,0,0.03)' : '0 10px 30px rgba(0,0,0,0.3)',
            background: mode === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(20px)',
            border: mode === 'light' ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tech ID</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Current Status</TableCell>
                <TableCell>Primary Skills</TableCell>
                <TableCell>Assigned Shift</TableCell>
                <TableCell>System Account</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton width="40%" /></TableCell>
                    <TableCell><Skeleton width="60%" /></TableCell>
                    <TableCell><Skeleton width="50%" /></TableCell>
                    <TableCell><Skeleton width="80%" /></TableCell>
                    <TableCell><Skeleton width="50%" /></TableCell>
                    <TableCell><Skeleton width="60%" /></TableCell>
                  </TableRow>
                ))
              ) : technicians?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    No technicians found in organization register.
                  </TableCell>
                </TableRow>
              ) : (
                technicians?.map((tech: Technician) => (
                  <TableRow
                    key={tech.id}
                    hover
                    onClick={() => handleRowClick(tech)}
                    sx={{ cursor: 'pointer', transition: 'background-color 0.2s', '&:hover': { bgcolor: mode === 'light' ? 'rgba(37,99,235,0.03)' : 'rgba(56,189,248,0.03)' } }}
                  >
                    <TableCell sx={{ fontWeight: 700 }}>#{tech.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{tech.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={tech.status} 
                        size="small" 
                        color={tech.status === 'AVAILABLE' ? 'success' : tech.status === 'ON_SITE' ? 'primary' : 'default'} 
                        sx={{ fontWeight: 700, borderRadius: '8px' }}
                      />
                    </TableCell>
                    <TableCell>{tech.skills || 'N/A'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>{tech.shift || 'N/A'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{tech.user?.username || 'N/A'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>

      {/* Details Slide-out Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: { 
              width: { xs: '100%', sm: 600 }, 
              p: 4,
              borderLeft: '1px solid',
              borderColor: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
              background: mode === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
              backdropFilter: 'blur(20px)',
            },
          },
          backdrop: {
            sx: { backdropFilter: 'blur(4px)' }
          }
        }}
      >
        <AnimatePresence>
          {selectedTech && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <Box>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>
                    Technician Profile
                  </Typography>
                  <IconButton onClick={() => setDrawerOpen(false)} sx={{ bgcolor: mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)' }}>
                    <CloseIcon />
                  </IconButton>
                </Stack>
                <Divider sx={{ mb: 4 }} />

                <Stack spacing={4}>
                  {/* Basic Info */}
                  <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        bgcolor: 'primary.main', 
                        color: 'white', 
                        width: 56, 
                        height: 56,
                        borderRadius: '16px',
                        boxShadow: '0 8px 24px rgba(37,99,235,0.2)',
                      }}
                    >
                      <TechIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>{selectedTech.name}</Typography>
                      <Typography variant="body2" color="text.secondary">ID: #{selectedTech.id} • Account: {selectedTech.user?.username || 'N/A'}</Typography>
                    </Box>
                  </Stack>

                  {/* Status update */}
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1.5 }}>Operational Status</Typography>
                    <TextField
                      select
                      fullWidth
                      value={techStatus}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    >
                      <MenuItem value="AVAILABLE">Available</MenuItem>
                      <MenuItem value="ON_SITE">On Site</MenuItem>
                      <MenuItem value="OFFLINE">Offline</MenuItem>
                    </TextField>
                  </Box>

                  {/* Performance stats */}
                  {performance && (
                    <Box>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
                        <PerformanceIcon sx={{ color: 'text.secondary' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Performance Metrics</Typography>
                      </Stack>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Card variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: 'transparent' }}>
                            <Typography variant="caption" color="text.secondary">SLA Compliance Rate</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                              {(performance.slaComplianceRate ?? 100).toFixed(0)}%
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Card variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: 'transparent' }}>
                            <Typography variant="caption" color="text.secondary">Completed Jobs</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                              {performance.completedWorkOrdersCount}
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Card variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: 'transparent' }}>
                            <Typography variant="caption" color="text.secondary">Customer Rating Score</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: '#F59E0B' }}>
                              {(performance.rating ?? 0).toFixed(1)} / 5.0
                            </Typography>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Edit details form */}
                  <Box>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
                      <EditIcon sx={{ color: 'text.secondary' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Configure Portfolio details</Typography>
                    </Stack>
                    <form onSubmit={handleUpdateDetails}>
                      <Stack spacing={2.5}>
                        <TextField
                          fullWidth
                          label="Skills / Specialties"
                          placeholder="e.g. HVAC, Electrical, Plumbing"
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                        />
                        <TextField
                          fullWidth
                          label="Assigned Work Shift"
                          placeholder="e.g. Day Shift, Night Shift"
                          value={shift}
                          onChange={(e) => setShift(e.target.value)}
                        />
                        <Button type="submit" variant="contained" sx={{ borderRadius: '12px', alignSelf: 'flex-start' }}>
                          Save Details
                        </Button>
                      </Stack>
                    </form>
                  </Box>

                  <Divider />

                  {/* Attendance and Check-ins */}
                  <Box>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <ClockIcon sx={{ color: 'text.secondary' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Recent Attendance Logs</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="contained" color="success" onClick={() => mutateClockIn.mutate(selectedTech.id)} sx={{ borderRadius: '8px' }}>Clock In</Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => mutateClockOut.mutate(selectedTech.id)} sx={{ borderRadius: '8px' }}>Clock Out</Button>
                      </Stack>
                    </Stack>

                    {attendanceLogs && attendanceLogs.length > 0 ? (
                      <Stack spacing={1.5} sx={{ maxHeight: 200, overflowY: 'auto', pr: 0.5 }}>
                        {attendanceLogs.map((log) => (
                          <Card key={log.id} variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: 'transparent' }}>
                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{log.date}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Clock In: {log.checkIn ? new Date(log.checkIn).toLocaleTimeString() : 'N/A'}
                                </Typography>
                              </Box>
                              <Chip 
                                label={log.checkOut ? `Out: ${new Date(log.checkOut).toLocaleTimeString()}` : 'Shift Active'} 
                                color={log.checkOut ? 'default' : 'warning'} 
                                size="small"
                                sx={{ borderRadius: '6px', fontWeight: 600 }}
                              />
                            </Stack>
                          </Card>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No attendance logs logged yet for this technician.</Typography>
                    )}
                  </Box>
                </Stack>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Drawer>
    </Box>
  );
};

export default TechnicianPage;
