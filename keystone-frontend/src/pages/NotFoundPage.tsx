import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, Stack } from '@mui/material';
import { SentimentDissatisfied as ErrorIcon } from '@mui/icons-material';

export const NotFoundPage: React.FC = () => {
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
            <ErrorIcon sx={{ fontSize: 72, color: 'text.secondary' }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Page Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              The page layout path you requested does not exist or has been moved.
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
export default NotFoundPage;
