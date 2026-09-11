import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, Stack } from '@mui/material';
import { Warning as AccessIcon } from '@mui/icons-material';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%', textAlign: 'center', p: 3 }}>
        <CardContent>
          <Stack spacing={3} sx={{ alignItems: 'center' }}>
            <AccessIcon sx={{ fontSize: 72, color: 'error.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You do not hold the required authorization credentials or role clearance to view this platform page.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard')}
              sx={{ px: 4, py: 1.2, borderRadius: 2 }}
            >
              Return to Dashboard
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
export default UnauthorizedPage;
