import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { loginSuccess } from '../store/authSlice';
import { authService } from '../services/apiService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowForward } from '@mui/icons-material';

/* ─── Validation Schema ──────────────────────────────────────────────────── */
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});
type LoginSchemaType = z.infer<typeof loginSchema>;

/* ─── Liquid Blob ────────────────────────────────────────────────────────── */
interface BlobProps {
  color: string;
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  duration: string;
  delay?: string;
  opacity?: number;
  anim?: string;
}
const Blob: React.FC<BlobProps> = ({
  color, size, top, left, right, bottom,
  duration, delay = '0s', opacity = 0.3, anim = 'morphBlob1',
}) => (
  <Box
    sx={{
      position: 'absolute',
      width: size,
      height: size,
      top, left, right, bottom,
      background: color,
      filter: 'blur(80px)',
      opacity,
      animation: `${anim} ${duration} ease-in-out infinite`,
      animationDelay: delay,
      zIndex: 0,
      pointerEvents: 'none',
    }}
  />
);

const DEMO_ACCOUNTS = [
  { label: 'Admin', username: 'admin', password: 'admin123', color: '#818CF8', icon: '👑' },
  { label: 'Dispatcher', username: 'dispatcher', password: 'dispatch123', color: '#38BDF8', icon: '📋' },
  { label: 'Technician', username: 'marcus', password: 'tech123', color: '#34D399', icon: '🛠️' },
  { label: 'Customer', username: 'spacex', password: 'customer123', color: '#F472B6', icon: '🏢' },
];

/* ─── Login Page ─────────────────────────────────────────────────────────── */
export const LoginPage: React.FC = () => {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const [showPwd, setShowPwd]       = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaType>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginSchemaType) => {
    setErrorMsg(null);
    try {
      const response = await authService.login(data);
      dispatch(
        loginSuccess({
          user: {
            id:       response.id,
            username: response.username,
            email:    response.email,
            role:     response.role as any,
          },
          token:        response.token,
          refreshToken: response.refreshToken,
        })
      );
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.response?.data?.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleQuickLogin = async (acc: typeof DEMO_ACCOUNTS[0]) => {
    setValue('username', acc.username, { shouldValidate: true });
    setValue('password', acc.password, { shouldValidate: true });
    await onSubmit({ username: acc.username, password: acc.password });
  };


  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#020617',
        p: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Liquid Blob Background ──────────────────────────────────── */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Blob
          color="radial-gradient(circle, rgba(99,102,241,0.9), rgba(139,92,246,0.4) 60%, transparent)"
          size={600}
          top="-20%"
          right="-20%"
          duration="20s"
          delay="0s"
          opacity={0.28}
          anim="morphBlob1"
        />
        <Blob
          color="radial-gradient(circle, rgba(6,182,212,0.9), rgba(34,197,94,0.4) 60%, transparent)"
          size={500}
          bottom="-15%"
          left="-15%"
          duration="16s"
          delay="3s"
          opacity={0.22}
          anim="morphBlob2"
        />
        <Blob
          color="radial-gradient(circle, rgba(139,92,246,0.7), rgba(99,102,241,0.3) 60%, transparent)"
          size={350}
          top="50%"
          left="30%"
          duration="24s"
          delay="7s"
          opacity={0.14}
          anim="morphBlob3"
        />
        {/* Grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </Box>

      {/* ── Login Card ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.34, 1.1, 0.64, 1] }}
        style={{ zIndex: 1, width: '100%', maxWidth: 480 }}
      >
        <Box
          sx={{
            width: '100%',
            p: { xs: 3, sm: 5 },
            borderRadius: '32px',
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(50px) saturate(200%)',
            WebkitBackdropFilter: 'blur(50px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            boxShadow: '0 0 80px rgba(99,102,241,0.12), 0 40px 80px -20px rgba(0,0,0,0.85)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0, left: '10%', right: '10%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.8), rgba(6,182,212,0.6), rgba(34,197,94,0.4), transparent)',
            },
          }}
        >
          {/* ── Logo Mark ─────────────────────────────────────────── */}
          <Stack spacing={2} sx={{ alignItems: 'center', mb: 5, textAlign: 'center' }}>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 40%, #06B6D4 75%, #22C55E 100%)',
                  backgroundSize: '300% 300%',
                  animation: 'iridescentShift 4s ease infinite',
                  boxShadow: '0 12px 40px rgba(99,102,241,0.45)',
                  fontSize: '1.75rem',
                  fontWeight: 900,
                  color: '#F8FAFC',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  letterSpacing: '-0.03em',
                  userSelect: 'none',
                }}
              >
                K
              </Box>
            </motion.div>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  mb: 0.5,
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6 40%, #06B6D4 70%, #22C55E)',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'iridescentShift 5s ease infinite',
                }}
              >
                Project Keystone
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569' }}>
                Access the field service management platform
              </Typography>
            </Box>
          </Stack>

          {/* ── Error Alert ───────────────────────────────────────── */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: '14px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#FCA5A5',
                  '& .MuiAlert-icon': { color: '#EF4444' },
                }}
              >
                {errorMsg}
              </Alert>
            </motion.div>
          )}

          {/* ── Quick Demo Login Chips ─────────────────────────────── */}
          <Box sx={{ mb: 4, p: 2, borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, display: 'block', mb: 1.5, textAlign: 'center', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              ⚡ 1-Click Quick Demo Login
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <Button
                  key={acc.label}
                  size="small"
                  onClick={() => handleQuickLogin(acc)}
                  disabled={isSubmitting}
                  sx={{
                    borderRadius: '12px',
                    px: 1.8,
                    py: 0.8,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: '#F8FAFC',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${acc.color}40`,
                    backdropFilter: 'blur(10px)',
                    transition: 'all 200ms ease',
                    '&:hover': {
                      background: `${acc.color}25`,
                      borderColor: acc.color,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 14px ${acc.color}30`,
                    },
                  }}
                >
                  <span style={{ marginRight: 6 }}>{acc.icon}</span> {acc.label}
                </Button>
              ))}
            </Stack>
          </Box>

          {/* ── Form ─────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Username"
                id="login-username"
                {...register('username')}
                error={!!errors.username}
                helperText={errors.username?.message}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(20px)',
                    '& input': { color: '#F1F5F9' },
                  },
                  '& .MuiFormHelperText-root': { color: '#F87171' },
                }}
              />

              <TextField
                fullWidth
                id="login-password"
                type={showPwd ? 'text' : 'password'}
                label="Password"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(20px)',
                    '& input': { color: '#F1F5F9' },
                  },
                  '& .MuiFormHelperText-root': { color: '#F87171' },
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPwd(!showPwd)}
                          edge="end"
                          aria-label={showPwd ? 'Hide password' : 'Show password'}
                          sx={{ color: '#475569', '&:hover': { color: '#818CF8' }, transition: 'color 300ms ease' }}
                        >
                          {showPwd ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Forgot password */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
                <Typography
                  variant="body2"
                  id="forgot-password-link"
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 700,
                    color: '#6366F1',
                    transition: 'color 300ms ease',
                    '&:hover': { color: '#818CF8' },
                  }}
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot Password?
                </Typography>
              </Box>

              {/* Submit button */}
              <Button
                type="submit"
                id="login-submit"
                fullWidth
                size="large"
                disabled={isSubmitting}
                endIcon={!isSubmitting ? <ArrowForward /> : undefined}
                sx={{
                  py: 1.9,
                  fontSize: '1rem',
                  borderRadius: '16px',
                  background: isSubmitting
                    ? 'rgba(99,102,241,0.3)'
                    : 'linear-gradient(135deg, #22C55E 0%, #10B981 50%, #06B6D4 100%)',
                  color: '#0F172A',
                  fontWeight: 800,
                  boxShadow: isSubmitting ? 'none' : '0 8px 30px rgba(34,197,94,0.35)',
                  transition: 'all 400ms cubic-bezier(0.4,0,0.2,1)',
                  '&:hover:not(:disabled)': {
                    boxShadow: '0 12px 40px rgba(34,197,94,0.5)',
                    transform: 'translateY(-2px)',
                  },
                  '&.Mui-disabled': { color: '#475569' },
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={22} sx={{ color: '#818CF8' }} />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Stack>
          </form>

          {/* ── Divider ───────────────────────────────────────────── */}
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>
              Secured by Keystone Auth
            </Typography>
            <Box sx={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          </Box>

          {/* ── Customer portal link ──────────────────────────────── */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#334155' }}>
              Are you a customer?{' '}
              <Box
                component="span"
                id="customer-portal-link"
                onClick={() => navigate('/portal/login')}
                sx={{
                  color: '#6366F1',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'color 300ms ease',
                  '&:hover': { color: '#818CF8' },
                }}
              >
                Access Customer Portal
              </Box>
            </Typography>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default LoginPage;
