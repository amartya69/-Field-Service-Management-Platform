import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Chip,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Warehouse as WarehouseIcon,
  GridView as GridViewIcon,
  Map as MapIcon,
  LocationOn as LocationOnIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutlined as ErrorIcon,
  Search as SearchIcon,
  Layers as LayersIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import type { SparePart, Warehouse, InventoryStock } from '../types';

interface StockMapViewerProps {
  warehouses?: Warehouse[];
  parts?: SparePart[];
  stocks?: InventoryStock[];
  onUpdateStock?: (warehouseId: number, partId: number, newQty: number) => void;
}

interface BinLocation {
  id: string;
  binCode: string;
  zone: string;
  zoneColor: string;
  partName: string;
  partCode: string;
  partId?: number;
  quantity: number;
  maxCapacity: number;
  unitPrice: number;
  reorderPoint: number;
}

const DEFAULT_ZONES = [
  { name: 'Zone A - HVAC & Filtration', color: '#6366F1', prefix: 'A' },
  { name: 'Zone B - Piping & Fluid Controls', color: '#06B6D4', prefix: 'B' },
  { name: 'Zone C - Electrical & Backup Power', color: '#8B5CF6', prefix: 'C' },
  { name: 'Zone D - Sensors & Automation', color: '#10B981', prefix: 'D' },
];

export const StockMapViewer: React.FC<StockMapViewerProps> = ({
  warehouses = [],
  parts = [],
  stocks = [],
  onUpdateStock,
}) => {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(
    warehouses[0]?.id || 1
  );
  const [viewMode, setViewMode] = useState<'blueprint' | 'geo'>('blueprint');
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState('ALL');

  // Bin detail modal state
  const [selectedBin, setSelectedBin] = useState<BinLocation | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [openBinModal, setOpenBinModal] = useState(false);

  const selectedWarehouse =
    warehouses.find((w) => w.id === selectedWarehouseId) ||
    warehouses[0] || {
      id: 1,
      name: 'Central Logistics Hub',
      location: 'Building 4, Sector 7 Industrial Park',
    };

  // Generate interactive grid bins for selected warehouse
  const generateBins = (): BinLocation[] => {
    const warehouseStocks = stocks.filter(
      (s) => s.warehouse?.id === selectedWarehouse.id
    );

    // Default rich sample bins mapped to parts
    const defaultPartList = parts.length > 0 ? parts : [
      { id: 1, name: 'HEPA Filter Air-200', code: 'PART-HEPA-200', unitPrice: 120, stockLevel: 48, reorderPoint: 10, description: '' },
      { id: 2, name: 'Copper Pipe Joint 2-inch', code: 'PART-COPPER-2IN', unitPrice: 25, stockLevel: 120, reorderPoint: 25, description: '' },
      { id: 3, name: '12V 200Ah AGM Battery', code: 'PART-BAT-12V200', unitPrice: 350, stockLevel: 8, reorderPoint: 5, description: '' },
      { id: 4, name: 'Digital Thermostat Controller', code: 'PART-THERM-BAC', unitPrice: 210, stockLevel: 15, reorderPoint: 8, description: '' },
    ];

    const bins: BinLocation[] = [];

    DEFAULT_ZONES.forEach((z, zIndex) => {
      for (let i = 1; i <= 4; i++) {
        const binCode = `${z.prefix}-${i.toString().padStart(2, '0')}`;
        const partIdx = (zIndex * 4 + (i - 1)) % defaultPartList.length;
        const matchingPart = defaultPartList[partIdx];

        // Check if there is actual stock record
        const realStock = warehouseStocks.find(
          (st) => st.sparePart?.id === matchingPart?.id
        );
        const qty = realStock
          ? realStock.quantity
          : Math.max(2, Math.floor(matchingPart.stockLevel / 2) + ((i * 7) % 15));

        bins.push({
          id: `${selectedWarehouse.id}-${binCode}`,
          binCode,
          zone: z.name,
          zoneColor: z.color,
          partName: matchingPart.name,
          partCode: matchingPart.code,
          partId: matchingPart.id,
          quantity: qty,
          maxCapacity: Math.max(qty * 1.5, matchingPart.reorderPoint * 4, 50),
          unitPrice: matchingPart.unitPrice,
          reorderPoint: matchingPart.reorderPoint,
        });
      }
    });

    return bins;
  };

  const currentBins = generateBins();

  // Filter bins
  const filteredBins = currentBins.filter((bin) => {
    const matchesSearch =
      bin.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.partCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.binCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesZone =
      zoneFilter === 'ALL' || bin.zone.startsWith(zoneFilter);

    return matchesSearch && matchesZone;
  });

  // Calculate statistics
  const totalUnits = currentBins.reduce((acc, b) => acc + b.quantity, 0);
  const totalValue = currentBins.reduce(
    (acc, b) => acc + b.quantity * b.unitPrice,
    0
  );
  const lowStockBins = currentBins.filter(
    (b) => b.quantity <= b.reorderPoint
  ).length;
  const healthScore = Math.round(
    ((currentBins.length - lowStockBins) / (currentBins.length || 1)) * 100
  );

  const handleOpenBinModal = (bin: BinLocation) => {
    setSelectedBin(bin);
    setEditQty(bin.quantity);
    setOpenBinModal(true);
  };

  const handleSaveStock = () => {
    if (selectedBin && selectedBin.partId && onUpdateStock) {
      onUpdateStock(selectedWarehouse.id, selectedBin.partId, editQty);
    }
    setOpenBinModal(false);
  };

  const getStockStatus = (qty: number, reorder: number, max: number) => {
    if (qty <= reorder) return { label: 'CRITICAL', color: '#EF4444', icon: <ErrorIcon fontSize="small" /> };
    if (qty <= reorder * 1.8) return { label: 'REORDER', color: '#F59E0B', icon: <WarningIcon fontSize="small" /> };
    if (qty >= max * 0.9) return { label: 'CAPACITY HIGH', color: '#3B82F6', icon: <CheckCircleIcon fontSize="small" /> };
    return { label: 'OPTIMAL', color: '#10B981', icon: <CheckCircleIcon fontSize="small" /> };
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* ── Top Header Controls & Warehouse Selector ──────────────── */}
      <Card
        sx={{
          mb: 4,
          borderRadius: '24px',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' } }}
          >
            {/* Title & Warehouse Selector Buttons */}
            <Box>
              <Stack direction="row" spacing={1.5} sx={{ mb: 1, alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
                    color: '#FFF',
                    boxShadow: '0 8px 20px rgba(99,102,241,0.3)',
                  }}
                >
                  <WarehouseIcon />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#F8FAFC' }}>
                    Interactive Warehouse Stock Map
                  </Typography>
                </Box>
              </Stack>

              {/* Warehouse Tabs/Pills */}
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {(warehouses.length > 0
                  ? warehouses
                  : [
                      { id: 1, name: 'Central Logistics Hub', location: 'Building 4, Sector 7' },
                      { id: 2, name: 'West Coast Distribution Depot', location: 'Bay 12, Port Way' },
                    ]
                ).map((w) => {
                  const active = w.id === selectedWarehouse.id;
                  return (
                    <Button
                      key={w.id}
                      onClick={() => setSelectedWarehouseId(w.id)}
                      startIcon={<LocationOnIcon sx={{ color: active ? '#FFF' : '#6366F1' }} />}
                      sx={{
                        borderRadius: '14px',
                        px: 2,
                        py: 0.9,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        color: active ? '#FFFFFF' : '#94A3B8',
                        background: active
                          ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${active ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)'}`,
                        boxShadow: active ? '0 8px 25px rgba(99,102,241,0.35)' : 'none',
                        transition: 'all 300ms ease',
                        '&:hover': {
                          background: active
                            ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                            : 'rgba(255, 255, 255, 0.07)',
                        },
                      }}
                    >
                      {w.name}
                    </Button>
                  );
                })}
              </Stack>
            </Box>

            {/* View Mode Toggle & Heatmap Controls */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Button
                variant={viewMode === 'blueprint' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('blueprint')}
                startIcon={<GridViewIcon />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: viewMode === 'blueprint' ? '#3B82F6' : 'transparent',
                }}
              >
                2D Floor Blueprint
              </Button>
              <Button
                variant={viewMode === 'geo' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('geo')}
                startIcon={<MapIcon />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: viewMode === 'geo' ? '#8B5CF6' : 'transparent',
                }}
              >
                Network Map
              </Button>

              <Tooltip title="Toggle Heatmap Intensity overlay">
                <Button
                  variant={heatmapMode ? 'contained' : 'outlined'}
                  color={heatmapMode ? 'secondary' : 'inherit'}
                  onClick={() => setHeatmapMode(!heatmapMode)}
                  startIcon={<LayersIcon />}
                  sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                >
                  {heatmapMode ? 'Heatmap ON' : 'Heatmap OFF'}
                </Button>
              </Tooltip>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ── Summary Stat Metrics Bar ───────────────────────────────── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Card
          sx={{
            flex: 1,
            borderRadius: '20px',
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255,255,255,0.06)',
            p: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
            Total Warehouse Units
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#F8FAFC', mt: 0.5 }}>
            {totalUnits.toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#38BDF8' }}>items</span>
          </Typography>
        </Card>

        <Card
          sx={{
            flex: 1,
            borderRadius: '20px',
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255,255,255,0.06)',
            p: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
            Total Asset Valuation
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#10B981', mt: 0.5 }}>
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        </Card>

        <Card
          sx={{
            flex: 1,
            borderRadius: '20px',
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255,255,255,0.06)',
            p: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
            Inventory Health Index
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mt: 0.5, alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: healthScore > 80 ? '#10B981' : '#F59E0B' }}>
              {healthScore}%
            </Typography>
            <Chip
              label={healthScore > 80 ? 'EXCELLENT' : 'ATTENTION NEEDED'}
              size="small"
              color={healthScore > 80 ? 'success' : 'warning'}
              sx={{ fontWeight: 700, borderRadius: '8px' }}
            />
          </Stack>
        </Card>

        <Card
          sx={{
            flex: 1,
            borderRadius: '20px',
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255,255,255,0.06)',
            p: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
            Low Stock Alerts
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: lowStockBins > 0 ? '#EF4444' : '#10B981', mt: 0.5 }}>
            {lowStockBins} <span style={{ fontSize: '0.9rem', color: '#FCA5A5' }}>bins low</span>
          </Typography>
        </Card>
      </Stack>

      {/* ── Filters & Search Bar ───────────────────────────────────── */}
      <Card
        sx={{
          mb: 4,
          borderRadius: '20px',
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          p: 2,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
          <TextField
            placeholder="Search part name, SKU code, or Bin ID (e.g. A-01)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#64748B' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                color: '#F8FAFC',
              },
            }}
          />

          <Select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            size="small"
            sx={{
              minWidth: 200,
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.03)',
              color: '#F8FAFC',
            }}
          >
            <MenuItem value="ALL">All Warehouse Zones</MenuItem>
            <MenuItem value="A">Zone A - HVAC & Filtration</MenuItem>
            <MenuItem value="B">Zone B - Piping & Fluids</MenuItem>
            <MenuItem value="C">Zone C - Electrical & Power</MenuItem>
            <MenuItem value="D">Zone D - Controls & Sensors</MenuItem>
          </Select>
        </Stack>
      </Card>

      {/* ── MAIN CONTENT VIEW ──────────────────────────────────────── */}
      {viewMode === 'blueprint' ? (
        /* ── 2D FLOOR PLAN BLUEPRINT GRID VIEW ───────────────────── */
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC', mb: 2 }}>
            Floor Plan & Rack Locations — {selectedWarehouse.name}
          </Typography>

          <Stack spacing={4}>
            {DEFAULT_ZONES.filter(
              (z) => zoneFilter === 'ALL' || z.prefix === zoneFilter
            ).map((z) => {
              const zoneBins = filteredBins.filter((b) => b.zone === z.name);
              if (zoneBins.length === 0) return null;

              return (
                <Box
                  key={z.name}
                  sx={{
                    p: 3,
                    borderRadius: '24px',
                    background: 'rgba(15, 23, 42, 0.4)',
                    border: `1px solid ${z.color}30`,
                    boxShadow: `0 10px 30px ${z.color}08`,
                  }}
                >
                  {/* Zone Header */}
                  <Stack direction="row" spacing={1.5} sx={{ mb: 2.5, alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: z.color,
                        boxShadow: `0 0 12px ${z.color}`,
                      }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#F8FAFC' }}>
                      {z.name}
                    </Typography>
                    <Chip
                      label={`${zoneBins.length} Active Bins`}
                      size="small"
                      sx={{
                        background: `${z.color}20`,
                        color: z.color,
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: `1px solid ${z.color}40`,
                      }}
                    />
                  </Stack>

                  {/* Bins Grid */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'repeat(1, 1fr)',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(4, 1fr)',
                      },
                      gap: 2,
                    }}
                  >
                    {zoneBins.map((bin) => {
                      const status = getStockStatus(
                        bin.quantity,
                        bin.reorderPoint,
                        bin.maxCapacity
                      );
                      const percent = Math.min(
                        100,
                        Math.round((bin.quantity / bin.maxCapacity) * 100)
                      );

                      const heatmapBg = heatmapMode
                        ? bin.quantity <= bin.reorderPoint
                          ? 'rgba(239, 68, 68, 0.25)'
                          : bin.quantity <= bin.reorderPoint * 1.8
                          ? 'rgba(245, 158, 11, 0.25)'
                          : 'rgba(16, 185, 129, 0.25)'
                        : 'rgba(30, 41, 59, 0.6)';

                      return (
                        <motion.div
                          key={bin.id}
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card
                            onClick={() => handleOpenBinModal(bin)}
                            sx={{
                              cursor: 'pointer',
                              borderRadius: '16px',
                              background: heatmapBg,
                              border: `1px solid ${
                                bin.quantity <= bin.reorderPoint
                                  ? 'rgba(239,68,68,0.5)'
                                  : 'rgba(255,255,255,0.08)'
                              }`,
                              boxShadow:
                                bin.quantity <= bin.reorderPoint
                                  ? '0 0 20px rgba(239,68,68,0.2)'
                                  : 'none',
                              p: 2,
                              position: 'relative',
                              overflow: 'hidden',
                              transition: 'all 250ms ease',
                              '&:hover': {
                                borderColor: z.color,
                                boxShadow: `0 8px 30px ${z.color}30`,
                              },
                            }}
                          >
                            {/* Bin Tag Badge */}
                            <Stack
                              direction="row"
                              sx={{ mb: 1.5, justifyContent: 'space-between', alignItems: 'center' }}
                            >
                              <Chip
                                label={`BIN ${bin.binCode}`}
                                size="small"
                                sx={{
                                  bgcolor: z.color,
                                  color: '#FFF',
                                  fontWeight: 800,
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                }}
                              />
                              <Chip
                                icon={status.icon}
                                label={status.label}
                                size="small"
                                sx={{
                                  bgcolor: `${status.color}20`,
                                  color: status.color,
                                  fontWeight: 800,
                                  borderRadius: '6px',
                                  fontSize: '0.65rem',
                                  border: `1px solid ${status.color}40`,
                                  '& .MuiChip-icon': { color: status.color },
                                }}
                              />
                            </Stack>

                            {/* Part Name & Code */}
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 800,
                                color: '#F8FAFC',
                                lineHeight: 1.3,
                                minHeight: 38,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {bin.partName}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: '#64748B', display: 'block', mb: 1.5 }}
                            >
                              SKU: {bin.partCode}
                            </Typography>

                            {/* Quantity Meter */}
                            <Stack
                              direction="row"
                              sx={{ mb: 0.8, justifyContent: 'space-between', alignItems: 'center' }}
                            >
                              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                                Quantity
                              </Typography>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 900,
                                  color: bin.quantity <= bin.reorderPoint ? '#EF4444' : '#F8FAFC',
                                }}
                              >
                                {bin.quantity} <span style={{ fontSize: '0.7rem', color: '#64748B' }}>/ {bin.maxCapacity}</span>
                              </Typography>
                            </Stack>

                            {/* Progress bar */}
                            <LinearProgress
                              variant="determinate"
                              value={percent}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.08)',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: status.color,
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </Card>
                        </motion.div>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
      ) : (
        /* ── REGIONAL NETWORK MAP VIEW ───────────────────────────── */
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC', mb: 2 }}>
            Regional Warehouse Network & Spatial Coverage Map
          </Typography>

          <Card
            sx={{
              borderRadius: '24px',
              background: 'radial-gradient(circle at 50% 50%, #0F172A 0%, #020617 100%)',
              border: '1px solid rgba(99,102,241,0.2)',
              p: 4,
              minHeight: 420,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                pointerEvents: 'none',
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Stack spacing={3}>
                {(warehouses.length > 0 ? warehouses : [
                  { id: 1, name: 'Central Logistics Hub', location: 'Building 4, Sector 7 Industrial Park' },
                  { id: 2, name: 'West Coast Distribution Depot', location: 'Bay 12, Terminal Port Way' },
                ]).map((wh, idx) => (
                  <motion.div
                    key={wh.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: '20px',
                        background: 'rgba(30, 41, 59, 0.5)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: idx === 0
                              ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                              : 'linear-gradient(135deg, #06B6D4, #10B981)',
                            color: '#FFF',
                            boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                          }}
                        >
                          <LocationOnIcon fontSize="large" />
                        </Box>

                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC' }}>
                            {wh.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                            📍 {wh.location}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                        <Chip
                          label="ACTIVE HUB"
                          color="success"
                          sx={{ fontWeight: 800, borderRadius: '8px' }}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setSelectedWarehouseId(wh.id);
                            setViewMode('blueprint');
                          }}
                          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                        >
                          Open Floor Blueprint
                        </Button>
                      </Stack>
                    </Box>
                  </motion.div>
                ))}
              </Stack>
            </Box>
          </Card>
        </Box>
      )}

      {/* ── BIN DETAIL & STOCK UPDATE DIALOG ───────────────────────── */}
      <Dialog
        open={openBinModal}
        onClose={() => setOpenBinModal(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              background: '#0F172A',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#F8FAFC',
              p: 1,
            },
          },
        }}
      >
        {selectedBin && (
          <>
            <DialogTitle sx={{ fontWeight: 900, fontSize: '1.25rem' }}>
              Bin Location Details — {selectedBin.binCode}
            </DialogTitle>

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  Zone
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: selectedBin.zoneColor }}>
                  {selectedBin.zone}
                </Typography>

                <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />

                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  Part Item Name
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#F8FAFC' }}>
                  {selectedBin.partName}
                </Typography>

                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 1 }}>
                  SKU Code: <span style={{ color: '#38BDF8' }}>{selectedBin.partCode}</span>
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#94A3B8' }}>
                  Adjust Current Bin Stock Level:
                </Typography>
                <TextField
                  type="number"
                  fullWidth
                  value={editQty}
                  onChange={(e) => setEditQty(Number(e.target.value))}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <InventoryIcon sx={{ color: '#6366F1' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.04)',
                      color: '#F8FAFC',
                    },
                  }}
                />
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => setOpenBinModal(false)}
                sx={{ color: '#94A3B8', fontWeight: 700 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveStock}
                startIcon={<EditIcon />}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                }}
              >
                Update Stock Quantity
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default StockMapViewer;
