import React, { useState } from 'react';
import { reportService } from '../services/apiService';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Download as DownloadIcon, Description as FileIcon } from '@mui/icons-material';

export const ReportPage: React.FC = () => {
  const [loadingReport, setLoadingReport] = useState<string | null>(null);

  const triggerExport = async (name: string, fn: () => Promise<void>) => {
    setLoadingReport(name);
    try {
      await fn();
    } catch (err) {
      console.error('Failed to export CSV report:', err);
    } finally {
      setLoadingReport(null);
    }
  };

  const reportCards = [
    {
      name: 'dashboard',
      title: 'Operations Dashboard Summary',
      desc: 'Export current work order counts, customer listings totals, and overall asset counts.',
      action: reportService.downloadDashboardCsv,
    },
    {
      name: 'technician',
      title: 'Technician Performance Scorecard',
      desc: 'Export average repair completion times, resolved work orders count, and SLA compliance ratios.',
      action: reportService.downloadTechnicianCsv,
    },
    {
      name: 'customer',
      title: 'Customer Infrastructure Directory',
      desc: 'Export registered client profiles, mapped buildings totals, sites, and emergency contact details.',
      action: reportService.downloadCustomerCsv,
    },
    {
      name: 'inventory',
      title: 'Warehouse Stock Balance Log',
      desc: 'Export spare parts catalog prices, stock quantity levels, and reorder critical markers.',
      action: reportService.downloadInventoryCsv,
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>


      <Grid container spacing={4}>
        {reportCards.map((report) => (
          <Grid size={{ xs: 12, sm: 6 }} key={report.name}>
            <Card sx={{ height: '100%', p: 1 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'action.selected', color: 'primary.main', width: 48, height: 48 }}>
                      <FileIcon />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {report.title}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Typography variant="body2" color="text.secondary" sx={{ minHeight: '60px' }}>
                    {report.desc}
                  </Typography>
                </Stack>
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={loadingReport === report.name ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                    onClick={() => triggerExport(report.name, report.action)}
                    disabled={loadingReport !== null}
                    sx={{ py: 1.2 }}
                  >
                    {loadingReport === report.name ? 'Compiling Report...' : 'Download CSV'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Local Avatar inside file for clean import mapping
const Avatar: React.FC<{ children: React.ReactNode; sx?: any }> = ({ children, sx }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      ...sx,
    }}
  >
    {children}
  </Box>
);
export default ReportPage;
