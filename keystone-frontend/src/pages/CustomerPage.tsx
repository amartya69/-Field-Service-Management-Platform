import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services/apiService';
import type { CustomerProfile } from '../types';
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
  Stack,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon,
  ContactPhone as ContactIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export const CustomerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { mode } = useThemeContext();
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [openBuildingDialog, setOpenBuildingDialog] = useState(false);

  // New Profile Form
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');

  // New Building Form
  const [buildingName, setBuildingName] = useState('');
  const [buildingAddress, setBuildingAddress] = useState('');

  // Load Customers
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['customerProfiles'],
    queryFn: customerService.getAllProfiles,
  });

  // Load Buildings
  const { data: buildings } = useQuery({
    queryKey: ['buildings', selectedCustomer?.id],
    queryFn: () => selectedCustomer ? customerService.getBuildings(selectedCustomer.id) : Promise.resolve([]),
    enabled: !!selectedCustomer,
  });

  // Load Contacts
  const { data: contacts } = useQuery({
    queryKey: ['contacts', selectedCustomer?.id],
    queryFn: () => selectedCustomer ? customerService.getContacts(selectedCustomer.id) : Promise.resolve([]),
    enabled: !!selectedCustomer,
  });

  // Mutations
  const mutateCreateProfile = useMutation({
    mutationFn: customerService.createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerProfiles'] });
      setOpenProfileDialog(false);
      setCompanyName('');
      setAddress('');
    },
  });

  const mutateCreateBuilding = useMutation({
    mutationFn: ({ profileId, payload }: { profileId: number; payload: any }) =>
      customerService.createBuilding(profileId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings', selectedCustomer?.id] });
      setOpenBuildingDialog(false);
      setBuildingName('');
      setBuildingAddress('');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutateCreateProfile.mutate({ companyName, address, status: 'ACTIVE' });
  };

  const handleBuildingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer) {
      mutateCreateBuilding.mutate({
        profileId: selectedCustomer.id,
        payload: { name: buildingName, address: buildingAddress },
      });
    }
  };

  return (
    <Box>


      <Grid container spacing={4}>
        {/* Customer List */}
        <Grid size={{ xs: 12, md: 7 }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ p: 1 }}>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>Registered Organizations</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenProfileDialog(true)}
                    sx={{ borderRadius: '14px' }}
                  >
                    New Profile
                  </Button>
                </Stack>
                <Divider sx={{ mb: 3, opacity: 0.5 }} />

                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    borderRadius: '16px', 
                    overflow: 'hidden', 
                    boxShadow: 'none', 
                    border: '1px solid',
                    borderColor: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
                    background: 'transparent'
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Company Name</TableCell>
                        <TableCell>Address</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {isLoading ? (
                        <TableRow><TableCell colSpan={3} align="center" sx={{ py: 3 }}>Loading directory...</TableCell></TableRow>
                      ) : profiles?.length === 0 ? (
                        <TableRow><TableCell colSpan={3} align="center" sx={{ py: 3 }}>No customer profiles registered.</TableCell></TableRow>
                      ) : (
                        profiles?.map((p) => (
                          <TableRow
                            key={p.id}
                            hover
                            selected={selectedCustomer?.id === p.id}
                            onClick={() => setSelectedCustomer(p)}
                            sx={{ 
                              cursor: 'pointer',
                              '&.Mui-selected': {
                                bgcolor: mode === 'light' ? 'rgba(37,99,235,0.08)' : 'rgba(56,189,248,0.08)',
                                '&:hover': {
                                  bgcolor: mode === 'light' ? 'rgba(37,99,235,0.12)' : 'rgba(56,189,248,0.12)',
                                }
                              }
                            }}
                          >
                            <TableCell sx={{ fontWeight: 700 }}>{p.companyName}</TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{p.address}</TableCell>
                            <TableCell><Chip label={p.status} size="small" color={p.status === 'ACTIVE' ? 'success' : 'default'} sx={{ fontWeight: 700, borderRadius: '8px' }} /></TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Buildings & Contacts Panel */}
        <Grid size={{ xs: 12, md: 5 }}>
          <AnimatePresence mode="wait">
            {selectedCustomer ? (
              <motion.div
                key={selectedCustomer.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Stack spacing={3}>
                  {/* Buildings Card */}
                  <Card sx={{ p: 1 }}>
                    <CardContent>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon color="primary" />
                          Buildings
                        </Typography>
                        <Button size="small" startIcon={<AddIcon />} onClick={() => setOpenBuildingDialog(true)} sx={{ borderRadius: '8px' }}>Add Building</Button>
                      </Stack>
                      <Divider sx={{ mb: 2.5, opacity: 0.5 }} />
                      
                      {buildings && buildings.length > 0 ? (
                        <Stack spacing={2}>
                          {buildings.map((b) => (
                            <Box key={b.id} sx={{ p: 2, borderRadius: '12px', bgcolor: mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{b.name}</Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{b.address}</Typography>
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No building infrastructure listed.</Typography>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contacts Card */}
                  <Card sx={{ p: 1 }}>
                    <CardContent>
                      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ContactIcon color="primary" />
                        Contacts Directory
                      </Typography>
                      <Divider sx={{ mb: 2.5, opacity: 0.5 }} />
                      
                      {contacts && contacts.length > 0 ? (
                        <Stack spacing={2}>
                          {contacts.map((c) => (
                            <Box key={c.id} sx={{ p: 2, borderRadius: '12px', bgcolor: mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{c.name} ({c.role})</Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{c.email} • {c.phone}</Typography>
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No corporate contacts mapped.</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Stack>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Select an organization from the directory to review locations and directory details.
                  </Typography>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Grid>
      </Grid>

      {/* Dialog for New Customer Profile */}
      <Dialog 
        open={openProfileDialog} 
        onClose={() => setOpenProfileDialog(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: '24px', p: 2, width: '100%', maxWidth: 460 }
          }
        }}
      >
        <form onSubmit={handleProfileSubmit}>
          <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Create Customer Profile
            <IconButton onClick={() => setOpenProfileDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField label="Company Name" fullWidth value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            <TextField label="Address" fullWidth value={address} onChange={(e) => setAddress(e.target.value)} required />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenProfileDialog(false)} sx={{ borderRadius: '10px' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: '10px' }}>Create Profile</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog for New Building */}
      <Dialog 
        open={openBuildingDialog} 
        onClose={() => setOpenBuildingDialog(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: '24px', p: 2, width: '100%', maxWidth: 460 }
          }
        }}
      >
        <form onSubmit={handleBuildingSubmit}>
          <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Add Building Infrastructure
            <IconButton onClick={() => setOpenBuildingDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField label="Building Name" fullWidth value={buildingName} onChange={(e) => setBuildingName(e.target.value)} required />
            <TextField label="Building Address" fullWidth value={buildingAddress} onChange={(e) => setBuildingAddress(e.target.value)} required />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenBuildingDialog(false)} sx={{ borderRadius: '10px' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: '10px' }}>Add Building</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CustomerPage;
