import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/apiService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useThemeContext } from '../contexts/ThemeContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { LockReset } from '@mui/icons-material';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useThemeContext();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordSchemaType) => {
    setFeedback(null);
    if (!token) {
      setFeedback({ type: 'error', msg: 'Invalid or missing password reset token.' });
      return;
    }

    try {
      await authService.resetPassword({ token, password: data.password });
      setFeedback({
        type: 'success',
        msg: 'Your password has been successfully reset. Redirecting to login...',
      });
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        msg: err.response?.data?.message || 'Password reset failed.',
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: mode === 'dark' ? '#0F1117' : '#F4F5F7',
        p: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Mesh Elements */}
      <Box
        sx={{
          position: 'absolute',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74,222,128,0.15) 0%, rgba(34,197,94,0.05) 75%)',
          filter: 'blur(60px)',
          top: '15%',
          left: '15%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 450,
          height: 450,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(74,222,128,0.05) 75%)',
          filter: 'blur(70px)',
          bottom: '10%',
          right: '15%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ zIndex: 1, width: '100%', maxWidth: 460 }}
      >
        <Card
          sx={{
            width: '100%',
            p: { xs: 2, sm: 4 },
            borderRadius: '28px',
            backdropFilter: 'blur(24px)',
            backgroundColor: mode === 'dark' ? 'rgba(23, 26, 35, 0.75)' : 'rgba(255, 255, 255, 0.75)',
            border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: mode === 'dark' 
              ? '0 30px 60px -15px rgba(0,0,0,0.8), 0 1px 3px 0 rgba(0,0,0,0.4)' 
              : '0 30px 60px -15px rgba(15,23,42,0.08), 0 1px 3px 0 rgba(15,23,42,0.02)',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Stack spacing={3} sx={{ alignItems: 'center', mb: 4, textAlign: 'center' }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  background: 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)', 
                  color: '#0F1117', 
                  width: 56, 
                  height: 56,
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(74,222,128,0.3)',
                }}
              >
                <LockReset sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em', color: mode === 'dark' ? '#F8FAFC' : '#0F1117' }}>
                  Reset Password
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Specify a new secure access credential for this platform
                </Typography>
              </Box>
            </Stack>

            {feedback && (
              <Alert severity={feedback.type} sx={{ mb: 3, borderRadius: '12px' }}>
                {feedback.msg}
              </Alert>
            )}

            {!token ? (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
                Reset token is missing or has expired. Please verify your email link.
              </Alert>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3.5}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />

                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm Password"
                    {...register('confirmPassword')}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    sx={{ py: 1.8, fontSize: '1rem', borderRadius: '16px' }}
                  >
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
                  </Button>
                </Stack>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default ResetPasswordPage;
