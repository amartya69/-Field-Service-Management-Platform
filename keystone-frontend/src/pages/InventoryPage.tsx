import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/apiService';
import { StockMapViewer } from '../components/StockMapViewer';


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
  Tabs,
  Tab,
} from '@mui/material';
import { Add as AddIcon, LibraryAddCheck as CheckIcon } from '@mui/icons-material';

export const InventoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [openPartDialog, setOpenPartDialog] = useState(false);
  const [openPoDialog, setOpenPoDialog] = useState(false);

  // New Part Form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [price, setPrice] = useState(0);
  const [reorder, setReorder] = useState(5);

  // New PO Form
  const [vendorName, setVendorName] = useState('');
  const [poNumber, setPoNumber] = useState('');

  // Load Inventory data
  const { data: parts, isLoading: partsLoading } = useQuery({ queryKey: ['spareParts'], queryFn: inventoryService.getParts });
  const { data: warehouses } = useQuery({ queryKey: ['warehouses'], queryFn: inventoryService.getWarehouses });
  const { data: stocks } = useQuery({ queryKey: ['inventoryStocks'], queryFn: inventoryService.getStocks });
  const { data: purchaseOrders } = useQuery({ queryKey: ['purchaseOrders'], queryFn: inventoryService.getPurchaseOrders });

  // Mutations
  const mutateCreatePart = useMutation({
    mutationFn: inventoryService.createPart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spareParts'] });
      setOpenPartDialog(false);
      setName('');
      setCode('');
      setPrice(0);
      setReorder(5);
    },
  });

  const mutateCreatePo = useMutation({
    mutationFn: inventoryService.createPurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      setOpenPoDialog(false);
      setVendorName('');
      setPoNumber('');
    },
  });

  const mutatePoStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      inventoryService.updatePurchaseOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: ['spareParts'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryStocks'] });
    },
  });

  const mutateUpdateStock = useMutation({
    mutationFn: inventoryService.updateStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryStocks'] });
      queryClient.invalidateQueries({ queryKey: ['spareParts'] });
    },
  });

  const handleUpdateStock = (warehouseId: number, partId: number, newQty: number) => {
    mutateUpdateStock.mutate({ warehouseId, sparePartId: partId, quantity: newQty });
  };


  const handlePartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutateCreatePart.mutate({ name, code, unitPrice: price, reorderPoint: reorder, stockLevel: 0 });
  };

  const handlePoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutateCreatePo.mutate({ orderNumber: poNumber, vendorName, status: 'PENDING', createdAt: new Date().toISOString() });
  };

  return (
    <Box>


      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Spare Parts Catalog" />
          <Tab label="Warehouses & Stock Maps" />
          <Tab label="Purchase Orders" />
        </Tabs>
      </Box>

      {/* Tab 0: Spare Parts Catalog */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Parts List</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenPartDialog(true)}>New Part</Button>
            </Stack>
            <Divider sx={{ mb: 3 }} />

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Part Name</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Stock Level</TableCell>
                    <TableCell>Reorder Point</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partsLoading ? (
                    <TableRow><TableCell colSpan={6} align="center">Loading spare parts...</TableCell></TableRow>
                  ) : parts?.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align="center">No parts recorded.</TableCell></TableRow>
                  ) : (
                    parts?.map((p) => {
                      const lowStock = p.stockLevel <= p.reorderPoint;
                      return (
                        <TableRow key={p.id}>
                          <TableCell sx={{ fontWeight: 600 }}>{p.code}</TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>${p.unitPrice.toFixed(2)}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: lowStock ? 'error.main' : 'text.primary' }}>{p.stockLevel}</TableCell>
                          <TableCell>{p.reorderPoint}</TableCell>
                          <TableCell>
                            <Chip
                              label={lowStock ? 'REORDER REQUIRED' : 'IN STOCK'}
                              color={lowStock ? 'error' : 'success'}
                              size="small"
                            />
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
      )}

      {/* Tab 1: Warehouses & Stock Maps */}
      {tabValue === 1 && (
        <StockMapViewer
          warehouses={warehouses}
          parts={parts}
          stocks={stocks}
          onUpdateStock={handleUpdateStock}
        />
      )}


      {/* Tab 2: Purchase Orders */}
      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Purchase Orders Log</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenPoDialog(true)}>New PO</Button>
            </Stack>
            <Divider sx={{ mb: 3 }} />

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>PO Number</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Created Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchaseOrders?.length === 0 ? (
                    <TableRow><TableCell colSpan={5} align="center">No purchase orders listed.</TableCell></TableRow>
                  ) : (
                    purchaseOrders?.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{po.orderNumber}</TableCell>
                        <TableCell>{po.vendorName}</TableCell>
                        <TableCell>{new Date(po.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={po.status}
                            color={
                              po.status === 'RECEIVED'
                                ? 'success'
                                : po.status === 'ORDERED'
                                ? 'primary'
                                : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {po.status === 'PENDING' && (
                            <Button size="small" onClick={() => mutatePoStatus.mutate({ id: po.id, status: 'ORDERED' })}>Order</Button>
                          )}
                          {po.status === 'ORDERED' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckIcon />}
                              onClick={() => mutatePoStatus.mutate({ id: po.id, status: 'RECEIVED' })}
                            >
                              Receive Stocks
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Dialog for New Part */}
      <Dialog open={openPartDialog} onClose={() => setOpenPartDialog(false)}>
        <form onSubmit={handlePartSubmit}>
          <DialogTitle>Register Spare Part</DialogTitle>
          <DialogContent sx={{ minWidth: 350, display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField label="Part Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} required />
            <TextField label="Part Code" fullWidth value={code} onChange={(e) => setCode(e.target.value)} required />
            <TextField label="Price ($)" type="number" fullWidth value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
            <TextField label="Reorder Threshold" type="number" fullWidth value={reorder} onChange={(e) => setReorder(Number(e.target.value))} required />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPartDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Register</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog for New PO */}
      <Dialog open={openPoDialog} onClose={() => setOpenPoDialog(false)}>
        <form onSubmit={handlePoSubmit}>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogContent sx={{ minWidth: 350, display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField label="PO Number" fullWidth value={poNumber} onChange={(e) => setPoNumber(e.target.value)} required />
            <TextField label="Vendor Name" fullWidth value={vendorName} onChange={(e) => setVendorName(e.target.value)} required />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPoDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
export default InventoryPage;
