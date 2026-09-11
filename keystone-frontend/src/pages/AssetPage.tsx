import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetService, customerService } from '../services/apiService';
import type { Asset } from '../types';
import { useThemeContext } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
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
  MenuItem,
  Grid,
} from '@mui/material';
import { Add as AddIcon, QrCode as QrIcon } from '@mui/icons-material';

export const AssetPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { mode } = useThemeContext();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [model, setModel] = useState('');
  const [customerId, setCustomerId] = useState<number | ''>('');

  // Load Assets
  const { data: assets, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: assetService.getAll,
  });

  // Load Customer profiles for association
  const { data: customers } = useQuery({
    queryKey: ['customerProfiles'],
    queryFn: customerService.getAllProfiles,
  });

  const createAssetMutation = useMutation({
    mutationFn: assetService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setOpenDialog(false);
      setName('');
      setSerialNumber('');
      setModel('');
      setCustomerId('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerId) {
      createAssetMutation.mutate({
        name,
        serialNumber,
        model,
        customerProfileId: customerId,
        maintenanceHistory: '',
      });
    }
  };

  return (
    <Box>


      <Grid container spacing={4}>
        {/* Asset List */}
        <Grid size={{ xs: 12, md: 7 }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ p: 1, borderRadius: '24px' }}>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>Tracked Assets</Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)} sx={{ borderRadius: '12px' }}>
                    Register Asset
                  </Button>
                </Stack>
                <Divider sx={{ mb: 3, opacity: 0.5 }} />

                <TableContainer component={Paper} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)', background: 'transparent' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Model</TableCell>
                        <TableCell>Serial</TableCell>
                        <TableCell>Owner</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {isLoading ? (
                        <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}>Loading assets…</TableCell></TableRow>
                      ) : assets?.length === 0 ? (
                        <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}>No assets registered.</TableCell></TableRow>
                      ) : (
                        assets?.map((a) => (
                          <TableRow
                            key={a.id}
                            hover
                            selected={selectedAsset?.id === a.id}
                            onClick={() => setSelectedAsset(a)}
                            sx={{
                              cursor: 'pointer',
                              '&.Mui-selected': { bgcolor: mode === 'light' ? 'rgba(37,99,235,0.08)' : 'rgba(56,189,248,0.08)', '&:hover': { bgcolor: mode === 'light' ? 'rgba(37,99,235,0.12)' : 'rgba(56,189,248,0.12)' } }
                            }}
                          >
                            <TableCell sx={{ fontWeight: 600 }}>{a.name}</TableCell>
                            <TableCell>{a.model}</TableCell>
                            <TableCell>{a.serialNumber}</TableCell>
                            <TableCell>{a.customerProfile?.companyName ?? '—'}</TableCell>
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

        {/* Details & QR Panel */}
        <Grid size={{ xs: 12, md: 5 }}>
          <AnimatePresence mode="wait">
            {selectedAsset ? (
              <motion.div
                key={selectedAsset.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Card sx={{ p: 2, borderRadius: '24px' }}>
                  <CardContent>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Asset Details</Typography>
                    <Divider sx={{ mb: 2.5, opacity: 0.5 }} />
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Name</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedAsset.name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Serial Number</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedAsset.serialNumber}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Model / Variant</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedAsset.model}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Owner Profile</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedAsset.customerProfile?.companyName ?? '—'}</Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}><QrIcon color="primary"/> Live QR Identifier</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'action.hover' }}>
                        <img
                          src={assetService.getQrCodeUrl(selectedAsset.id)}
                          alt={`QR for ${selectedAsset.name}`}
                          style={{ width: 180, height: 180, objectFit: 'contain', borderRadius: 8 }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                        Scan to open maintenance checklists or create work tickets instantly.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <Card sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body1" color="text.secondary">Select an asset from the ledger to view specifications.</Typography>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Grid>
      </Grid>

      {/* Register Asset Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} slotProps={{ paper: { sx: { borderRadius: '24px', p: 2, width: '100%', maxWidth: 460 } } }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Register New Asset
            <Button onClick={() => setOpenDialog(false)} sx={{ minWidth: 'auto', p: 0 }} variant="text">✕</Button>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField label="Asset Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} required />
            <TextField label="Serial Number" fullWidth value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} required />
            <TextField label="Model / Specification" fullWidth value={model} onChange={(e) => setModel(e.target.value)} required />
            <TextField
              select
              label="Customer Owner"
              fullWidth
              value={customerId}
              onChange={(e) => setCustomerId(Number(e.target.value))}
              required
            >
              {customers?.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.companyName}</MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenDialog(false)} sx={{ borderRadius: '10px' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: '10px' }}>Register Asset</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AssetPage;
