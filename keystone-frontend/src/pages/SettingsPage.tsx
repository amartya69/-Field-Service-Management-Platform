import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogService } from '../services/apiService';
import type { AuditLog } from '../types';
import { useThemeContext } from '../contexts/ThemeContext';
import { useSnackbar } from 'notistack';
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
  Divider,
  Tabs,
  Tab,
  Stack,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  IconButton,
  InputAdornment,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Settings as GeneralIcon,
  Security as SecurityIcon,
  Build as OpsIcon,
  History as AuditIcon,
  Key as KeyIcon,
  ContentCopy as CopyIcon,
  Save as SaveIcon,
  Refresh as RegenerateIcon,
} from '@mui/icons-material';

export const SettingsPage: React.FC = () => {
  const { mode } = useThemeContext();
  const { enqueueSnackbar } = useSnackbar();

  // Load Audit Logs
  const { data: logs, isLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: auditLogService.getAll,
  });

  // Settings State
  const [systemName, setSystemName] = useState(localStorage.getItem('keystone_system_name') || 'Project Keystone');
  const [currency, setCurrency] = useState(localStorage.getItem('keystone_currency') || 'USD');
  const [dateFormat, setDateFormat] = useState(localStorage.getItem('keystone_date_format') || 'MM/DD/YYYY');
  const [autoDispatch, setAutoDispatch] = useState(localStorage.getItem('keystone_auto_dispatch') === 'true');
  const [smsAlerts, setSmsAlerts] = useState(localStorage.getItem('keystone_sms_alerts') !== 'false');
  const [customerBooking, setCustomerBooking] = useState(localStorage.getItem('keystone_customer_booking') !== 'false');
  const [slaHours, setSlaHours] = useState(Number(localStorage.getItem('keystone_sla_hours') || '24'));
  const [mfaEnforced, setMfaEnforced] = useState(localStorage.getItem('keystone_mfa_enforced') === 'true');
  const [ipRestriction, setIpRestriction] = useState(localStorage.getItem('keystone_ip_restriction') || '');
  const [apiKey, setApiKey] = useState(localStorage.getItem('keystone_api_key') || 'key_live_keystone_59a3c7f12e8b4a02d3f4');

  const [activeTab, setActiveTab] = useState(0);

  const handleSave = () => {
    localStorage.setItem('keystone_system_name', systemName);
    localStorage.setItem('keystone_currency', currency);
    localStorage.setItem('keystone_date_format', dateFormat);
    localStorage.setItem('keystone_auto_dispatch', String(autoDispatch));
    localStorage.setItem('keystone_sms_alerts', String(smsAlerts));
    localStorage.setItem('keystone_customer_booking', String(customerBooking));
    localStorage.setItem('keystone_sla_hours', String(slaHours));
    localStorage.setItem('keystone_mfa_enforced', String(mfaEnforced));
    localStorage.setItem('keystone_ip_restriction', ipRestriction);
    localStorage.setItem('keystone_api_key', apiKey);

    // Notify Layout to update branding dynamically
    window.dispatchEvent(new Event('keystone_settings_updated'));

    enqueueSnackbar('System settings saved successfully!', {
      variant: 'success',
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
    });
  };

  const handleRegenerateKey = () => {
    const randomHex = Array.from({ length: 20 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newKey = `key_live_keystone_${randomHex}`;
    setApiKey(newKey);
    enqueueSnackbar('New API Secret Key generated successfully!', {
      variant: 'warning',
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
    });
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    enqueueSnackbar('API key copied to clipboard!', {
      variant: 'info',
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
    });
  };

  return (
    <Box>


      <Grid container spacing={4}>
        {/* Navigation Sidebar Tabs */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card 
            sx={{ 
              p: 2, 
              borderRadius: '24px', 
              boxShadow: mode === 'light' ? '0 10px 30px rgba(0,0,0,0.02)' : '0 10px 30px rgba(0,0,0,0.2)',
              bgcolor: mode === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(23,26,35,0.5)',
              backdropFilter: 'blur(20px)',
              border: mode === 'light' ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <Tabs
              orientation="vertical"
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              sx={{
                '& .MuiTab-root': {
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  borderRadius: '14px',
                  mb: 1,
                  px: 2.5,
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  transition: 'all 400ms cubic-bezier(0.4,0,0.2,1)',
                  minHeight: 48,
                  '&.Mui-selected': {
                    color: '#818CF8',
                    background: mode === 'dark'
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(6,182,212,0.15) 100%)'
                      : 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.08) 100%)',
                    border: mode === 'dark'
                      ? '1px solid rgba(99,102,241,0.35)'
                      : '1px solid rgba(99,102,241,0.25)',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.15)',
                  },
                  '&:hover': {
                    color: '#A5B4FC',
                    background: mode === 'dark' ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)',
                  }
                },
                '& .MuiTabs-indicator': {
                  left: 0,
                  width: 4,
                  borderRadius: '4px',
                  background: 'linear-gradient(180deg, #6366F1 0%, #06B6D4 100%)',
                  boxShadow: '0 0 12px rgba(99,102,241,0.6)',
                },
              }}
            >
              <Tab icon={<GeneralIcon sx={{ mr: 1.5 }} />} iconPosition="start" label="General Preferences" />
              <Tab icon={<OpsIcon sx={{ mr: 1.5 }} />} iconPosition="start" label="Operations & Rules" />
              <Tab icon={<SecurityIcon sx={{ mr: 1.5 }} />} iconPosition="start" label="Security & Keys" />
              <Tab icon={<AuditIcon sx={{ mr: 1.5 }} />} iconPosition="start" label="System Audit Logs" />
            </Tabs>
          </Card>
        </Grid>

        {/* Configurations Forms Panel */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Card
            sx={{
              borderRadius: '24px',
              boxShadow: mode === 'light' ? '0 10px 30px rgba(0,0,0,0.03)' : '0 10px 30px rgba(0,0,0,0.3)',
              bgcolor: mode === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(23,26,35,0.65)',
              backdropFilter: 'blur(20px)',
              border: mode === 'light' ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.05)',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Tab 0: General Settings */}
              {activeTab === 0 && (
                <Stack spacing={4}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>General System Preferences</Typography>
                    <Typography variant="body2" color="text.secondary">Customize local currency display parameters, branding labels, and date formatting options.</Typography>
                  </Box>
                  <Divider />
                  
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Platform Branding Name"
                      helperText="Changes the main logo brand header dynamically in the left navigation sidebar."
                      value={systemName}
                      onChange={(e) => setSystemName(e.target.value)}
                    />

                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          select
                          fullWidth
                          label="Preferred System Currency"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                        >
                          <MenuItem value="USD">USD ($) - US Dollar</MenuItem>
                          <MenuItem value="EUR">EUR (€) - Euro</MenuItem>
                          <MenuItem value="GBP">GBP (£) - British Pound</MenuItem>
                          <MenuItem value="INR">INR (₹) - Indian Rupee</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          select
                          fullWidth
                          label="System Date Presentation"
                          value={dateFormat}
                          onChange={(e) => setDateFormat(e.target.value)}
                        >
                          <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (Standard US)</MenuItem>
                          <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (Standard UK/EU)</MenuItem>
                          <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  </Stack>
                </Stack>
              )}

              {/* Tab 1: Operational Settings */}
              {activeTab === 1 && (
                <Stack spacing={4}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Operational Rules & Dispatching</Typography>
                    <Typography variant="body2" color="text.secondary">Configure service level agreement (SLA) deadlines, technician auto-assignment parameters, and portal bookings.</Typography>
                  </Box>
                  <Divider />

                  <Stack spacing={3.5}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={autoDispatch} 
                          onChange={(e) => setAutoDispatch(e.target.checked)} 
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Enable AI Auto-Dispatch Engine</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Automatically schedules and queues pending service requests to available technicians based on skills mismatch scoring.
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start', m: 0, gap: 1 }}
                    />

                    <Divider />

                    <FormControlLabel
                      control={
                        <Switch 
                          checked={smsAlerts} 
                          onChange={(e) => setSmsAlerts(e.target.checked)} 
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>SMS Notification Broadcasts</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Dispatches text reminders to field operators instantly when critical work orders are assigned or shifted.
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start', m: 0, gap: 1 }}
                    />

                    <Divider />

                    <FormControlLabel
                      control={
                        <Switch 
                          checked={customerBooking} 
                          onChange={(e) => setCustomerBooking(e.target.checked)} 
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Allow Client Self-Booking</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Permits registered facility administrators to raise and request schedule bookings directly from the client portal dashboard.
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start', m: 0, gap: 1 }}
                    />

                    <Divider />

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Default SLA Target Deadline (Hours)</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                        Configures standard SLA resolution time limits for newly created general tickets.
                      </Typography>
                      <Slider
                        value={slaHours}
                        onChange={(_, val) => setSlaHours(val as number)}
                        valueLabelDisplay="auto"
                        step={4}
                        marks={[
                          { value: 4, label: '4h (Critical)' },
                          { value: 12, label: '12h' },
                          { value: 24, label: '24h (Standard)' },
                          { value: 48, label: '48h' },
                          { value: 72, label: '72h' },
                        ]}
                        min={4}
                        max={72}
                        sx={{ width: '90%', mx: 'auto', display: 'block' }}
                      />
                    </Box>
                  </Stack>
                </Stack>
              )}

              {/* Tab 2: Security settings */}
              {activeTab === 2 && (
                <Stack spacing={4}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Security Auditing & Access API</Typography>
                    <Typography variant="body2" color="text.secondary">Configure API connectivity tokens, enforce Multi-factor authentication, and specify secure login IP ranges.</Typography>
                  </Box>
                  <Divider />

                  <Stack spacing={3.5}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={mfaEnforced} 
                          onChange={(e) => setMfaEnforced(e.target.checked)} 
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Enforce Multi-Factor Authentication (MFA)</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Mandates all users to complete token checks on login attempts.
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start', m: 0, gap: 1 }}
                    />

                    <Divider />

                    <TextField
                      fullWidth
                      label="IP Logins Whitelist Range"
                      placeholder="e.g. 192.168.1.0/24, 10.0.0.0/16"
                      helperText="Leave empty to allow administrative logins from any external IP network range."
                      value={ipRestriction}
                      onChange={(e) => setIpRestriction(e.target.value)}
                    />

                    <Divider />

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Access Secrets Key (Platform API)</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
                        Use this credentials token to securely bind external monitoring pipelines, asset telemetry scanners, or custom triggers.
                      </Typography>
                      
                      <TextField
                        fullWidth
                        type="text"
                        value={apiKey}
                        slotProps={{
                          input: {
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position="start">
                                <KeyIcon color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <Tooltip title="Copy Token">
                                  <IconButton onClick={handleCopyKey} edge="end">
                                    <CopyIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Regenerate Token">
                                  <IconButton onClick={handleRegenerateKey} sx={{ ml: 0.5 }}>
                                    <RegenerateIcon />
                                  </IconButton>
                                </Tooltip>
                              </InputAdornment>
                            ),
                          }
                        }}
                        sx={{
                          '& .MuiInputBase-input': {
                            fontFamily: 'Consolas, monospace',
                            fontSize: '0.9rem',
                            letterSpacing: '0.05em',
                          }
                        }}
                      />
                    </Box>
                  </Stack>
                </Stack>
              )}

              {/* Tab 3: System Audit Logs */}
              {activeTab === 3 && (
                <Stack spacing={4}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Platform Transaction Audit Trail</Typography>
                    <Typography variant="body2" color="text.secondary">Review real-time operations, security status logins, and modification history logs.</Typography>
                  </Box>
                  <Divider />

                  <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Action</TableCell>
                          <TableCell>Entity</TableCell>
                          <TableCell>Entity ID</TableCell>
                          <TableCell>Performed By</TableCell>
                          <TableCell>Details / Summary</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {isLoading ? (
                          <TableRow><TableCell colSpan={6} align="center">Loading transactions log...</TableCell></TableRow>
                        ) : logs?.length === 0 ? (
                          <TableRow><TableCell colSpan={6} align="center">No system operations tracked yet.</TableCell></TableRow>
                        ) : (
                          logs?.map((l: AuditLog) => (
                            <TableRow key={l.id}>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(l.timestamp).toLocaleString()}</TableCell>
                              <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{l.action}</TableCell>
                              <TableCell>{l.entityName || 'N/A'}</TableCell>
                              <TableCell>{l.entityId || 'N/A'}</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>{l.performedBy}</TableCell>
                              <TableCell>{l.details}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              )}

              {/* Footer controls for saving changes */}
              {activeTab !== 3 && (
                <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)',
                      boxShadow: '0 4px 14px rgba(74,222,128,0.3)',
                      color: '#0F1117',
                      fontWeight: 700,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
                        boxShadow: '0 6px 20px rgba(74,222,128,0.4)',
                      }
                    }}
                  >
                    Save Configuration
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
