import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerRequestService } from '../services/apiService';
import { useThemeContext } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  MenuItem,
  Grid,
} from '@mui/material';
import { Send as SendIcon, ContactSupport } from '@mui/icons-material';

export const CustomerPortalPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { mode } = useThemeContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('HVAC');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Load My Requests
  const { data: myRequests, isLoading } = useQuery({
    queryKey: ['myCustomerRequests'],
    queryFn: customerRequestService.getMyRequests,
  });

  const mutateCreate = useMutation({
    mutationFn: customerRequestService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCustomerRequests'] });
      setTitle('');
      setDescription('');
      setFeedbackMsg('Your request has been registered and is under review.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    mutateCreate.mutate({ title, description, category });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'info';
      case 'REJECTED': return 'error';
      case 'COMPLETED': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>


      <Grid container spacing={4}>
        {/* Raise Request Form */}
        <Grid size={{ xs: 12, md: 5 }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ p: 1 }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Submit Support Ticket</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                  Complete this form to flag facility or hardware issues. Dispatchers review submissions in real-time.
                </Typography>
                <Divider sx={{ mb: 3.5, opacity: 0.5 }} />

                {feedbackMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{feedbackMsg}</Alert>}

                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      label="Brief Summary"
                      placeholder="e.g. Elevator trap down in Tower B"
                      fullWidth
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />

                    <TextField
                      select
                      label="Service Category"
                      fullWidth
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <MenuItem value="HVAC">HVAC & Heating</MenuItem>
                      <MenuItem value="Electrical">Electrical Power & Outlets</MenuItem>
                      <MenuItem value="Plumbing">Water Leakage & Plumbing</MenuItem>
                      <MenuItem value="Security">Security Access & Alarms</MenuItem>
                      <MenuItem value="Structural">Structural & General Facility</MenuItem>
                    </TextField>

                    <TextField
                      label="Detailed Problem Description"
                      placeholder="Specify locate info, timestamps, symptoms..."
                      fullWidth
                      multiline
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />

                    <Button
                      variant="contained"
                      type="submit"
                      endIcon={<SendIcon />}
                      sx={{ py: 1.5, borderRadius: '14px' }}
                    >
                      Submit Ticket
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Track Tickets List */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>
            {/* Tickets Ledger */}
            <Card sx={{ p: 1 }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Ticket History Ledger</Typography>
                <Divider sx={{ mb: 2.5, opacity: 0.5 }} />

                {isLoading ? (
                  <Typography variant="body1" align="center" sx={{ py: 4 }}>Loading active requests...</Typography>
                ) : myRequests?.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 6 }}>
                    No service requests submitted yet.
                  </Typography>
                ) : (
                  <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {myRequests?.map((req) => (
                      <React.Fragment key={req.id}>
                        <ListItem 
                          sx={{ 
                            p: 2.5, 
                            borderRadius: '16px', 
                            bgcolor: mode === 'light' ? 'rgba(0,0,0,0.015)' : 'rgba(255,255,255,0.015)',
                            border: '1px solid',
                            borderColor: mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)'
                          }}
                        >
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{req.title}</Typography>
                                <Chip label={req.status} size="small" color={getStatusColor(req.status)} sx={{ fontWeight: 700, borderRadius: '6px' }} />
                              </Stack>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6, mb: 1.5 }}>
                                  {req.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 500 }}>
                                  Category: {req.category} • Logged: {new Date(req.createdAt).toLocaleString()}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>

            {/* Support Box */}
            <Card sx={{ background: 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)', color: 'white', border: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
                  <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.15)' }}>
                    <ContactSupport sx={{ fontSize: 36 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: '#FFFFFF' }}>Emergency Response</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.5 }}>
                      Experiencing critical water floods, elevator traps, or power hazards? Dial our dispatch emergency lines immediately.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerPortalPage;
