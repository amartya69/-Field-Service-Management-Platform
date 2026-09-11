import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { slaService } from '../services/apiService';
import type { SlaPolicy, SlaMonitoringDTO } from '../types';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Chip,
  LinearProgress,
} from '@mui/material';

export const SlaPage: React.FC = () => {
  // Load Policies
  const { data: policies } = useQuery({
    queryKey: ['slaPolicies'],
    queryFn: slaService.getPolicies,
  });

  // Load SLA Monitoring
  const { data: monitorList, isLoading } = useQuery({
    queryKey: ['slaMonitoring'],
    queryFn: slaService.getMonitoringTimeline,
  });

  return (
    <Box>


      <Grid container spacing={4}>
        {/* SLA Configuration */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Priority Policies</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Target resolution and initial response window limits configured by operations priority rules.
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2}>
                {policies?.map((policy: SlaPolicy) => (
                  <Box key={policy.id} sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Priority: {policy.priority}</Typography>
                      <Chip label={policy.name} size="small" color="primary" variant="outlined" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Response: {policy.responseTimeHours}h | Resolution Limit: {policy.resolutionTimeHours}h
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* SLA Monitoring Timeline */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Live Tickets Resolution Monitor</Typography>
              <Divider sx={{ mb: 3 }} />

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ticket ID</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Elapsed (Hours)</TableCell>
                      <TableCell>Remaining (Hours)</TableCell>
                      <TableCell>SLA Health</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={6} align="center">Loading active trackers...</TableCell></TableRow>
                    ) : monitorList?.length === 0 ? (
                      <TableRow><TableCell colSpan={6} align="center">No active work orders to monitor.</TableCell></TableRow>
                    ) : (
                      monitorList?.map((m: SlaMonitoringDTO) => {
                        const progressPercent = Math.min((m.elapsedTimeHours / m.maxResolutionTimeHours) * 100, 100);
                        return (
                          <TableRow key={m.workOrderId}>
                            <TableCell>#{m.workOrderId}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{m.title}</TableCell>
                            <TableCell>{m.priority}</TableCell>
                            <TableCell>{m.elapsedTimeHours}h</TableCell>
                            <TableCell sx={{ color: m.isBreached ? 'error.main' : 'text.primary', fontWeight: 600 }}>
                              {m.isBreached ? 'BREACHED' : `${m.remainingTimeHours}h left`}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ width: '100px' }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={progressPercent}
                                  color={m.isBreached ? 'error' : progressPercent > 80 ? 'warning' : 'success'}
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Simple local Stack component inside file for easy imports
const Stack: React.FC<{ spacing?: number; children: React.ReactNode; direction?: any; justifyContent?: any; alignItems?: any; sx?: any; useFlexGap?: boolean; flexWrap?: any }> = ({ children, spacing, ...props }) => (
  <Box sx={{ display: 'flex', flexDirection: props.direction === 'row' ? 'row' : 'column', gap: spacing ? `${spacing * 8}px` : 0, ...props.sx }}>
    {children}
  </Box>
);
export default SlaPage;
