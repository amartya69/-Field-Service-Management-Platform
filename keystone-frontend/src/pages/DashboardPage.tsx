import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/apiService';
import { motion } from 'framer-motion';
import { useThemeContext } from '../contexts/ThemeContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Skeleton,
  Button,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  Build as WorkOrderIcon,
  Timeline as SlaIcon,
  People as TechIcon,
  Warehouse as InventoryIcon,
  NotificationsActive as NotificationIcon,
  ArrowForward,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const COLORS = ['#4ADE80', '#22C55E', '#10B981', '#15803D', '#166534'];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useThemeContext();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardService.getStats,
  });

  const kpis = [
    {
      title: 'Total Work Orders',
      value: stats?.totalWorkOrders ?? 0,
      icon: <WorkOrderIcon sx={{ fontSize: 24, color: '#2563EB' }} />,
      desc: `${stats?.openWorkOrders ?? 0} Open • ${stats?.inProgressWorkOrders ?? 0} In Progress`,
      gradient: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(34, 197, 94, 0.02) 100%)',
    },
    {
      title: 'SLA Active Breaches',
      value: stats?.slaBreachCount ?? 0,
      icon: <SlaIcon sx={{ fontSize: 24, color: '#EF4444' }} />,
      desc: 'Active escalation alerts pending review',
      gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.02) 100%)',
    },
    {
      title: 'Active Technicians',
      value: stats?.activeTechniciansCount ?? 0,
      icon: <TechIcon sx={{ fontSize: 24, color: '#10B981' }} />,
      desc: 'Available or on-site status today',
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)',
    },
    {
      title: 'Inventory Alerts',
      value: stats?.inventoryReorderCount ?? 0,
      icon: <InventoryIcon sx={{ fontSize: 24, color: '#F59E0B' }} />,
      desc: 'Spare parts below reorder thresholds',
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.02) 100%)',
    },
  ];

  // Format Recharts data structures
  const areaData = stats?.monthlyTrends
    ? Object.keys(stats.monthlyTrends).map((key) => ({
        name: key,
        orders: stats.monthlyTrends[key],
      }))
    : [
        { name: 'Jan', orders: 12 },
        { name: 'Feb', orders: 19 },
        { name: 'Mar', orders: 25 },
        { name: 'Apr', orders: 32 },
        { name: 'May', orders: 48 },
        { name: 'Jun', orders: 55 },
      ];

  const pieData = stats?.categoryDistribution
    ? Object.keys(stats.categoryDistribution).map((key) => ({
        name: key,
        value: stats.categoryDistribution[key],
      }))
    : [
        { name: 'HVAC', value: 35 },
        { name: 'Electrical', value: 25 },
        { name: 'Plumbing', value: 20 },
        { name: 'Security', value: 15 },
        { name: 'Structural', value: 5 },
      ];

  // Mock bar chart for resource load comparison
  const barData = [
    { name: 'Mon', completed: 8, breached: 1 },
    { name: 'Tue', completed: 12, breached: 0 },
    { name: 'Wed', completed: 15, breached: 2 },
    { name: 'Thu', completed: 11, breached: 0 },
    { name: 'Fri', completed: 18, breached: 1 },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>


      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {kpis.map((kpi, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              style={{ height: '100%' }}
            >
              <Card 
                sx={{ 
                  height: '100%',
                  background: kpi.gradient,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    bgcolor: kpi.icon.props.color || 'primary.main',
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {kpi.title}
                    </Typography>
                    <Box sx={{ p: 1, borderRadius: '12px', bgcolor: mode === 'dark' ? 'rgba(15, 17, 23, 0.5)' : 'rgba(255,255,255,0.8)', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                      {kpi.icon}
                    </Box>
                  </Stack>
                  {isLoading ? (
                    <Skeleton width="50%" height={48} sx={{ my: 1 }} />
                  ) : (
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em' }}>
                      {kpi.value}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {kpi.desc}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Analytics Charts Grid */}
      <Grid container spacing={4} sx={{ mb: 5 }}>
        {/* Trend Area Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ p: 1 }}>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      Work Orders Completed Trend
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Monthly tracking of service completions and workflow metrics
                    </Typography>
                  </Box>
                  <Button 
                    size="small" 
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/work-orders')}
                  >
                    View Details
                  </Button>
                </Stack>
                <Box sx={{ height: 320, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={areaData} margin={{ left: -15, right: 10 }}>
                      <defs>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#4ADE80" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} />
                      <XAxis dataKey="name" stroke={mode === 'dark' ? '#94A3B8' : '#64748B'} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={mode === 'dark' ? '#94A3B8' : '#64748B'} fontSize={12} tickLine={false} axisLine={false} />
                      <ChartTooltip 
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
                          backgroundColor: mode === 'dark' ? 'rgba(23, 26, 35, 0.95)' : 'rgba(255,255,255,0.95)',
                          color: mode === 'dark' ? '#F8FAFC' : '#0F172A'
                        }} 
                      />
                      <Area type="monotone" dataKey="orders" stroke="#4ADE80" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Category Share Donut Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ height: '100%' }}
          >
            <Card sx={{ p: 1, height: '100%' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                  Categories Distribution
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                  Breakdown by equipment classifications
                </Typography>
                <Box sx={{ height: 180, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ outline: 'none' }} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                          backgroundColor: mode === 'dark' ? '#171A23' : '#FFFFFF'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Stat */}
                  <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                      {pieData.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700 }}>
                      Sectors
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={1.5} sx={{ mt: 3 }}>
                  {pieData.map((d, i) => (
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }} key={i}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{d.name}</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{d.value}%</Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Activity and Sub Charts Grid */}
      <Grid container spacing={4}>
        {/* Weekly Load Analysis Chart */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                Weekly Compliance Statistics
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 4 }}>
                Comparison between completed work orders and SLA breaches
              </Typography>
              <Box sx={{ height: 260, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} />
                    <XAxis dataKey="name" stroke={mode === 'dark' ? '#94A3B8' : '#64748B'} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke={mode === 'dark' ? '#94A3B8' : '#64748B'} fontSize={12} tickLine={false} axisLine={false} />
                    <ChartTooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        backgroundColor: mode === 'dark' ? '#171A23' : '#FFFFFF'
                      }} 
                    />
                    <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="breached" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Timeline Feed */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 1, height: '100%' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                Platform Activity Log
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                Live updates and operational alerts
              </Typography>
              
              <Stack spacing={3} sx={{ mt: 3, position: 'relative', pl: 1 }}>
                {/* Timeline connector bar */}
                <Box sx={{ position: 'absolute', top: 8, bottom: 8, left: 19, width: '2px', bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', zIndex: 0 }} />

                <Stack direction="row" spacing={2.5} sx={{ zIndex: 1, position: 'relative' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', bgcolor: 'success.light', color: 'success.dark', mt: 0.5 }}>
                    <InfoIcon sx={{ fontSize: 14 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Database initialized cleanly</Typography>
                    <Typography variant="caption" color="text.secondary">All Flyway migrations executed and schema seeds verified.</Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2.5} sx={{ zIndex: 1, position: 'relative' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', bgcolor: 'primary.light', color: 'primary.dark', mt: 0.5 }}>
                    <NotificationIcon sx={{ fontSize: 14 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>STOMP message broker active</Typography>
                    <Typography variant="caption" color="text.secondary">WebSocket handlers registered for real-time dispatch alerts.</Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2.5} sx={{ zIndex: 1, position: 'relative' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', bgcolor: 'warning.light', color: 'warning.dark', mt: 0.5 }}>
                    <WarningIcon sx={{ fontSize: 14 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>SLA Breach Scanner Active</Typography>
                    <Typography variant="caption" color="text.secondary">Scheduled cron mapping SLA thresholds scanning database records.</Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
