import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { workOrderService, customerRequestService } from '../services/apiService';
import type { WorkOrder, WorkOrderStatus, WorkOrderPriority, RequestAttachment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeContext } from '../contexts/ThemeContext';
import {
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
  TextField,
  MenuItem,
  Stack,
  Button,
  Pagination,
  Drawer,
  Chip,
  IconButton,
  Divider,
  Input,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Schedule as ClockIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Layers as LayersIcon,
  FileOpen as FileIcon,
} from '@mui/icons-material';

export const WorkOrderPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { mode } = useThemeContext();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Fetch Work Orders
  const { data: woPage, isLoading } = useQuery({
    queryKey: ['workOrders', search, status, priority, page, size],
    queryFn: () =>
      workOrderService.getAll({
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
        page: page - 1,
        size,
      }),
  });

  // Fetch Attachments query
  const { data: attachments, refetch: refetchAttachments } = useQuery({
    queryKey: ['attachments', selectedOrder?.customerRequest?.id],
    queryFn: () =>
      selectedOrder?.customerRequest?.id
        ? customerRequestService.getAttachments(selectedOrder.customerRequest.id)
        : Promise.resolve([] as RequestAttachment[]),
    enabled: !!selectedOrder?.customerRequest?.id,
  });

  // Lifecycle Mutations
  const mutateLifecycle = useMutation({
    mutationFn: ({ id, action }: { id: number; action: string }) => {
      switch (action) {
        case 'accept': return workOrderService.accept(id);
        case 'reject': return workOrderService.reject(id);
        case 'start': return workOrderService.start(id);
        case 'pause': return workOrderService.pause(id);
        case 'complete': return workOrderService.complete(id);
        case 'verify': return workOrderService.verify(id);
        case 'close': return workOrderService.close(id);
        case 'cancel': return workOrderService.cancel(id);
        default: throw new Error('Invalid lifecycle action');
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
      setSelectedOrder(data);

      const actionLabels: Record<string, string> = {
        accept: 'Work order accepted successfully!',
        reject: 'Work order rejected/unassigned.',
        start: 'Work order job started!',
        pause: 'Work order job paused.',
        complete: 'Work order marked as completed!',
        verify: 'Customer verification recorded successfully!',
        close: 'Work order closed successfully!',
        cancel: 'Work order cancelled.'
      };

      const message = actionLabels[variables.action] || 'Action completed successfully!';
      enqueueSnackbar(message, { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to update work order status', { variant: 'error' });
    }
  });

  // File Upload Mutation
  const mutateUpload = useMutation({
    mutationFn: ({ reqId, file }: { reqId: number; file: File }) =>
      customerRequestService.uploadAttachment(reqId, file),
    onSuccess: () => {
      setUploadFile(null);
      refetchAttachments();
      enqueueSnackbar('File uploaded successfully!', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to upload attachment', { variant: 'error' });
    }
  });

  const handleActionClick = (action: string) => {
    if (selectedOrder) {
      mutateLifecycle.mutate({ id: selectedOrder.id, action });
    }
  };

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrder?.customerRequest?.id && uploadFile) {
      mutateUpload.mutate({ reqId: selectedOrder.customerRequest.id, file: uploadFile });
    }
  };

  const handleRowClick = (wo: WorkOrder) => {
    setSelectedOrder(wo);
    setDrawerOpen(true);
  };

  const getPriorityColor = (p: WorkOrderPriority) => {
    switch (p) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'primary';
      default: return 'default';
    }
  };

  const getStatusColor = (s: WorkOrderStatus) => {
    switch (s) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'info';
      case 'CANCELLED': return 'error';
      case 'OPEN': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>


      {/* Filters bar */}
      <Card sx={{ mb: 4, p: 1.5 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search by title, location..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              slotProps={{
                input: {
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }
              }}
              sx={{ flexGrow: 1 }}
            />
            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="OPEN">Open</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </TextField>
            <TextField
              select
              label="Priority"
              value={priority}
              onChange={(e) => { setPriority(e.target.value); setPage(1); }}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All Priorities</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="CRITICAL">Critical</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

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
            boxShadow: mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.8)' : '0 10px 30px rgba(0,0,0,0.03)',
            background: mode === 'dark' ? 'rgba(23, 26, 35, 0.75)' : 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px)',
            border: mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.4)',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>WO ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Assigned Tech</TableCell>
                <TableCell>Scheduled Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton width="40%" /></TableCell>
                    <TableCell><Skeleton width="75%" /></TableCell>
                    <TableCell><Skeleton width="50%" /></TableCell>
                    <TableCell><Skeleton width="50%" /></TableCell>
                    <TableCell><Skeleton width="60%" /></TableCell>
                    <TableCell><Skeleton width="50%" /></TableCell>
                    <TableCell><Skeleton width="60%" /></TableCell>
                  </TableRow>
                ))
              ) : woPage?.content?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                      No active work orders matched this criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                woPage?.content?.map((wo: WorkOrder) => (
                  <TableRow
                    key={wo.id}
                    hover
                    onClick={() => handleRowClick(wo)}
                    sx={{ cursor: 'pointer', transition: 'background-color 0.2s', '&:hover': { bgcolor: mode === 'dark' ? 'rgba(74, 222, 128, 0.08)' : 'rgba(34, 197, 94, 0.08)' } }}
                  >
                    <TableCell sx={{ fontWeight: 700 }}>#{wo.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{wo.title}</TableCell>
                    <TableCell>
                      <Chip 
                        label={wo.priority} 
                        size="small" 
                        color={getPriorityColor(wo.priority)} 
                        sx={{ fontWeight: 700, borderRadius: '8px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={wo.status} 
                        size="small" 
                        color={getStatusColor(wo.status)}
                        sx={{ fontWeight: 700, borderRadius: '8px' }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{wo.location}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{wo.assignedTechnician?.name || 'Unassigned'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                      {wo.scheduledDate ? new Date(wo.scheduledDate).toLocaleString() : 'Unscheduled'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>

      {/* Pagination */}
      {woPage && (
        <Stack direction="row" sx={{ mt: 4, justifyContent: 'center' }}>
          <Pagination
            count={woPage.totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: '10px',
              }
            }}
          />
        </Stack>
      )}

      {/* Details Slide-out Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: { 
              width: { xs: '100%', sm: 580 }, 
              p: 4,
              borderLeft: '1px solid',
              borderColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              background: mode === 'dark' ? 'rgba(23, 26, 35, 0.95)' : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
            },
          },
          backdrop: {
            sx: { backdropFilter: 'blur(4px)' }
          }
        }}
      >
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <Box>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>
                    Work Order Details
                  </Typography>
                  <IconButton onClick={() => setDrawerOpen(false)} sx={{ bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                    <CloseIcon />
                  </IconButton>
                </Stack>
                <Divider sx={{ mb: 4 }} />

                <Stack spacing={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{selectedOrder.title}</Typography>
                  </Box>

                  <Stack direction="row" spacing={3}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</Typography>
                      <Box sx={{ mt: 1 }}><Chip label={selectedOrder.priority} color={getPriorityColor(selectedOrder.priority)} sx={{ fontWeight: 700, borderRadius: '8px' }} /></Box>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</Typography>
                      <Box sx={{ mt: 1 }}><Chip label={selectedOrder.status} color={getStatusColor(selectedOrder.status)} sx={{ fontWeight: 700, borderRadius: '8px' }} /></Box>
                    </Box>
                  </Stack>

                  <Box>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
                      <LayersIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Description</Typography>
                    </Stack>
                    <Typography variant="body1" color="text.secondary" sx={{ bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', p: 2, borderRadius: '12px', lineHeight: 1.6 }}>
                      {selectedOrder.description}
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                      <LocationIcon sx={{ color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Location Address</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedOrder.location}</Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                      <ClockIcon sx={{ color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Scheduled Execution</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {selectedOrder.scheduledDate ? new Date(selectedOrder.scheduledDate).toLocaleString() : 'Unscheduled'}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                      <PersonIcon sx={{ color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Assigned Technician</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedOrder.assignedTechnician?.name || 'Unassigned'}</Typography>
                      </Box>
                    </Stack>
                  </Stack>

                  {/* Lifecycle Actions */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Platform State Machine Control</Typography>
                    <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                      {selectedOrder.status === 'OPEN' && (
                        <>
                          <Button variant="contained" color="primary" onClick={() => handleActionClick('accept')} sx={{ borderRadius: '12px' }}>Accept</Button>
                          <Button variant="outlined" color="error" onClick={() => handleActionClick('reject')} sx={{ borderRadius: '12px' }}>Reject</Button>
                          <Button variant="contained" color="secondary" onClick={() => handleActionClick('start')} sx={{ borderRadius: '12px' }}>Start Job</Button>
                        </>
                      )}
                      {selectedOrder.status === 'IN_PROGRESS' && (
                        <>
                          <Button variant="outlined" onClick={() => handleActionClick('pause')} sx={{ borderRadius: '12px' }}>Pause</Button>
                          <Button variant="contained" color="success" onClick={() => handleActionClick('complete')} sx={{ borderRadius: '12px' }}>Complete</Button>
                        </>
                      )}
                      {selectedOrder.status === 'COMPLETED' && (
                        <>
                          <Button variant="contained" color="info" onClick={() => handleActionClick('verify')} sx={{ borderRadius: '12px' }}>Verify</Button>
                          <Button variant="contained" color="primary" onClick={() => handleActionClick('close')} sx={{ borderRadius: '12px' }}>Close WO</Button>
                        </>
                      )}
                      {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'COMPLETED' && (
                        <Button variant="outlined" color="error" onClick={() => handleActionClick('cancel')} sx={{ borderRadius: '12px' }}>Cancel</Button>
                      )}
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Request Attachments */}
                  {selectedOrder.customerRequest && (
                    <Box>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
                        <FileIcon sx={{ color: 'text.secondary' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Service Attachments</Typography>
                      </Stack>

                      <form onSubmit={handleFileUpload} style={{ marginBottom: '20px' }}>
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                          <Input
                            type="file"
                            onChange={(e: any) => setUploadFile(e.target.files?.[0] || null)}
                            sx={{ flexGrow: 1 }}
                          />
                          <Button
                            variant="contained"
                            type="submit"
                            disabled={!uploadFile}
                            startIcon={<UploadIcon />}
                            sx={{ borderRadius: '12px' }}
                          >
                            Upload
                          </Button>
                        </Stack>
                      </form>

                      {attachments && attachments.length > 0 ? (
                        <Stack spacing={1.5}>
                          {attachments.map((att) => (
                            <Card key={att.id} variant="outlined" sx={{ p: 2, borderRadius: '14px', border: '1px solid rgba(0,0,0,0.06)' }}>
                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{att.fileName}</Typography>
                                <Button
                                  size="small"
                                  onClick={() => {
                                    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
                                    window.open(`${apiBase}/uploads/${att.filePath.split(/[\\/]/).pop()}`);
                                  }}
                                  sx={{ borderRadius: '8px' }}
                                >
                                  Download
                                </Button>
                              </Stack>
                            </Card>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No active request attachments uploaded yet.</Typography>
                      )}
                    </Box>
                  )}
                </Stack>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Drawer>
    </Box>
  );
};

export default WorkOrderPage;
