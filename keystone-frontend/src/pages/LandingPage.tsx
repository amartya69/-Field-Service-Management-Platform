import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Computer as PortalIcon,
  TrendingUp,
  CheckCircle,
  ArrowForward,
} from '@mui/icons-material';

/* ─── Morphing Liquid Blob ────────────────────────────────────────────────── */
interface BlobProps {
  color: string;
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  animDuration: string;
  delay?: string;
  opacity?: number;
}

const LiquidBlob: React.FC<BlobProps> = ({
  color, size, top, left, right, bottom, animDuration, delay = '0s', opacity = 0.35,
}) => (
  <Box
    sx={{
      position: 'absolute',
      width: size,
      height: size,
      top, left, right, bottom,
      background: color,
      filter: 'blur(70px)',
      opacity,
      animation: `morphBlob1 ${animDuration} ease-in-out infinite`,
      animationDelay: delay,
      zIndex: 0,
      pointerEvents: 'none',
    }}
  />
);

/* ─── Feature Card ────────────────────────────────────────────────────────── */
interface FeatureCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, desc, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    viewport={{ once: true }}
    style={{ height: '100%' }}
  >
    <Box
      sx={{
        height: '100%',
        p: 4,
        borderRadius: '24px',
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 60px -15px rgba(0,0,0,0.5)',
        transition: 'all 400ms cubic-bezier(0.4,0,0.2,1)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        '&:hover': {
          transform: 'translateY(-6px)',
          borderColor: 'rgba(99,102,241,0.35)',
          boxShadow: '0 0 40px rgba(99,102,241,0.12), 0 30px 60px -15px rgba(0,0,0,0.7)',
          '& .feat-icon-wrap': {
            background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(6,182,212,0.15) 100%)',
          },
        },
        /* Inner top highlight */
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: '20%', right: '20%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        },
      }}
    >
      <Box
        className="feat-icon-wrap"
        sx={{
          mb: 3,
          display: 'inline-flex',
          p: 1.8,
          borderRadius: '16px',
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.2)',
          transition: 'background 400ms ease',
        }}
      >
        {icon}
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: '#F1F5F9', letterSpacing: '-0.01em' }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.7 }}>
        {desc}
      </Typography>
    </Box>
  </motion.div>
);

/* ─── Landing Page ────────────────────────────────────────────────────────── */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY   = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpa = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const features = [
    {
      title: 'Intelligent Dispatching',
      desc: 'Automated scheduling algorithms and drag-and-drop technician dispatching boards for zero-friction operations.',
      icon: <ScheduleIcon sx={{ fontSize: 28, color: '#818CF8' }} />,
    },
    {
      title: 'Real-time SLA Monitor',
      desc: 'Automated SLA scanners and notification escalations to guarantee compliance and service excellence.',
      icon: <TimelineIcon sx={{ fontSize: 28, color: '#06B6D4' }} />,
    },
    {
      title: 'Asset QR Lifecycle',
      desc: 'Maintenance audit history logs, scanning integrations, and QR code generations with full traceability.',
      icon: <BuildIcon sx={{ fontSize: 28, color: '#22C55E' }} />,
    },
    {
      title: 'Enterprise Audit Trail',
      desc: 'Platform operations logs, transaction trails, and role-based action history mapping at enterprise scale.',
      icon: <SecurityIcon sx={{ fontSize: 28, color: '#F59E0B' }} />,
    },
  ];

  const stats = [
    { title: 'Total Customers', value: '12,132', change: '+15%', color: '#22C55E' },
    { title: 'Active Assets',   value: '45,892', change: '+8%',  color: '#06B6D4' },
    { title: 'Technicians',     value: '2,982',  change: '+12%', color: '#818CF8' },
    { title: 'Uptime',          value: '99.9%',  change: '+0.1%',color: '#4ADE80' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        overflowX: 'hidden',
        bgcolor: '#020617',
        position: 'relative',
        color: '#F8FAFC',
      }}
    >
      {/* ── Liquid Blob Background Layer ──────────────────────────────── */}
      <Box sx={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <LiquidBlob
          color="radial-gradient(circle, rgba(99,102,241,0.8) 0%, rgba(139,92,246,0.4) 60%, transparent 100%)"
          size={700}
          top="-10%"
          right="-15%"
          animDuration="18s"
          delay="0s"
          opacity={0.22}
        />
        <LiquidBlob
          color="radial-gradient(circle, rgba(6,182,212,0.8) 0%, rgba(34,197,94,0.4) 60%, transparent 100%)"
          size={550}
          bottom="5%"
          left="-10%"
          animDuration="22s"
          delay="4s"
          opacity={0.18}
        />
        <LiquidBlob
          color="radial-gradient(circle, rgba(139,92,246,0.7) 0%, rgba(99,102,241,0.3) 60%, transparent 100%)"
          size={400}
          top="45%"
          left="40%"
          animDuration="16s"
          delay="8s"
          opacity={0.12}
        />
        {/* Fine grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </Box>

      {/* ── Glassmorphic Navbar ────────────────────────────────────────── */}
      <Box
        component="nav"
        sx={{
          pt: 2.5,
          pb: 2.5,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderBottom: '1px solid rgba(99,102,241,0.15)',
          background: 'rgba(2, 6, 23, 0.75)',
          boxShadow: '0 1px 0 rgba(99,102,241,0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Logo */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 30%, #06B6D4 65%, #22C55E 100%)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'iridescentShift 5s ease infinite',
              }}
            >
              KEYSTONE
            </Typography>

            {/* Nav links */}
            <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
              {['Solutions', 'Pricing', 'Contact'].map((link) => (
                <Typography
                  key={link}
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#64748B',
                    transition: 'color 300ms ease',
                    display: { xs: 'none', md: 'block' },
                    '&:hover': { color: '#A5B4FC' },
                  }}
                >
                  {link}
                </Typography>
              ))}
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #22C55E 0%, #10B981 50%, #06B6D4 100%)',
                  color: '#0F172A',
                  fontWeight: 800,
                  boxShadow: '0 4px 20px rgba(34,197,94,0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 28px rgba(34,197,94,0.45)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Sign In
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <Box ref={heroRef} sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div style={{ y: heroY, opacity: heroOpa }}>
          <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 16 }, pb: 10 }}>
            <Grid container spacing={6} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <motion.div
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  {/* Badge */}
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2.5,
                      py: 1,
                      borderRadius: '20px',
                      mb: 4,
                      background: 'rgba(99,102,241,0.1)',
                      border: '1px solid rgba(99,102,241,0.25)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <TrendingUp sx={{ color: '#818CF8', fontSize: 16 }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#818CF8',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Enterprise Field Service Platform
                    </Typography>
                  </Box>

                  {/* Headline */}
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: '2.8rem', sm: '3.8rem', md: '4.75rem' },
                      lineHeight: 1.0,
                      mb: 3,
                      letterSpacing: '-0.04em',
                      color: '#F1F5F9',
                    }}
                  >
                    Redefining Service{' '}
                    <br />
                    <Box
                      component="span"
                      sx={{
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 25%, #06B6D4 60%, #22C55E 100%)',
                        backgroundSize: '300% 300%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: 'iridescentShift 4s ease infinite',
                        textShadow: 'none',
                        filter: 'drop-shadow(0 0 30px rgba(99,102,241,0.4))',
                      }}
                    >
                      Operations.
                    </Box>
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      mb: 5,
                      fontSize: '1.1rem',
                      lineHeight: 1.75,
                      maxWidth: 560,
                      color: '#64748B',
                    }}
                  >
                    Automate technician scheduling, asset QR tracking, warehouse inventory
                    counts, and SLA compliance lifecycles on a single secure platform.
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/login')}
                      endIcon={<ArrowForward />}
                      sx={{
                        px: 4.5,
                        py: 1.8,
                        fontSize: '1rem',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #22C55E 0%, #10B981 50%, #06B6D4 100%)',
                        color: '#0F172A',
                        fontWeight: 800,
                        boxShadow: '0 8px 30px rgba(34,197,94,0.35)',
                        '&:hover': {
                          boxShadow: '0 12px 40px rgba(34,197,94,0.5)',
                          transform: 'translateY(-3px)',
                        },
                      }}
                    >
                      Access Platform
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/login')}
                      startIcon={<PortalIcon />}
                      sx={{
                        px: 4.5,
                        py: 1.8,
                        fontSize: '1rem',
                        borderRadius: '16px',
                        borderColor: 'rgba(99,102,241,0.4)',
                        color: '#A5B4FC',
                        backdropFilter: 'blur(10px)',
                        background: 'rgba(99,102,241,0.06)',
                        '&:hover': {
                          borderColor: 'rgba(99,102,241,0.7)',
                          background: 'rgba(99,102,241,0.12)',
                          transform: 'translateY(-3px)',
                        },
                      }}
                    >
                      Customer Portal
                    </Button>
                  </Stack>
                </motion.div>
              </Grid>

              {/* Hero Glass Card Mockup */}
              <Grid size={{ xs: 12, md: 5 }}>
                <motion.div
                  initial={{ scale: 0.85, opacity: 0, rotateY: 15 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  style={{ perspective: 1000 }}
                >
                  <Box
                    sx={{
                      p: 4,
                      borderRadius: '32px',
                      background: 'rgba(255,255,255,0.04)',
                      backdropFilter: 'blur(40px) saturate(200%)',
                      WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 0 60px rgba(99,102,241,0.15), 0 40px 80px -20px rgba(0,0,0,0.8)',
                      position: 'relative',
                      overflow: 'hidden',
                      animation: 'floatUp 6s ease-in-out infinite',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0, left: '10%', right: '10%',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(6,182,212,0.4), transparent)',
                      },
                    }}
                  >
                    {/* Traffic lights */}
                    <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                      {['#EF4444', '#F59E0B', '#22C55E'].map((c, i) => (
                        <Box key={i} sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: c, opacity: 0.8 }} />
                      ))}
                    </Stack>

                    {/* Mock stats row */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      {[
                        { label: 'Work Orders', value: '142', color: '#818CF8' },
                        { label: 'SLA Status',  value: '98.2%', color: '#22C55E' },
                      ].map((m) => (
                        <Grid size={{ xs: 6 }} key={m.label}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: '16px',
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.07)',
                            }}
                          >
                            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, display: 'block', mb: 0.5 }}>
                              {m.label}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: m.color }}>
                              {m.value}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Mock progress bars */}
                    <Stack spacing={2} sx={{ mb: 3 }}>
                      {[
                        { label: 'Dispatching Efficiency', pct: 92, color: '#6366F1' },
                        { label: 'Asset Utilization',      pct: 78, color: '#06B6D4' },
                        { label: 'Inventory Level',        pct: 55, color: '#22C55E' },
                      ].map((bar) => (
                        <Box key={bar.label}>
                          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>{bar.label}</Typography>
                            <Typography variant="caption" sx={{ color: bar.color, fontWeight: 700 }}>{bar.pct}%</Typography>
                          </Stack>
                          <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${bar.pct}%` }}
                              transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                              viewport={{ once: true }}
                              style={{
                                height: '100%',
                                background: `linear-gradient(90deg, ${bar.color}, rgba(255,255,255,0.6))`,
                                borderRadius: 3,
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Stack>

                    {/* CTA row */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.1))',
                        border: '1px solid rgba(99,102,241,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#A5B4FC', fontWeight: 700 }}>
                        3 SLA breaches pending
                      </Typography>
                      <Box
                        sx={{
                          px: 2,
                          py: 0.5,
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #22C55E, #06B6D4)',
                          color: '#0F172A',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        Resolve
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </Container>
        </motion.div>
      </Box>

      {/* ── Stats Strip ───────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          py: 6,
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, i) => (
              <Grid size={{ xs: 6, md: 3 }} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 1 }}
                  >
                    {stat.title}
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#F1F5F9' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: stat.color, fontWeight: 800, fontSize: '0.85rem' }}>
                      {stat.change}
                    </Typography>
                  </Stack>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Features Section ──────────────────────────────────────────── */}
      <Box sx={{ py: 16, position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#6366F1',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  display: 'block',
                  mb: 2,
                }}
              >
                ◆ Platform Capabilities
              </Typography>
            </Box>
            <Typography
              variant="h2"
              align="center"
              sx={{
                mb: 2.5,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: '#F1F5F9',
                fontSize: { xs: '2rem', md: '2.75rem' },
              }}
            >
              Smart Software for{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 40%, #06B6D4 100%)',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'iridescentShift 5s ease infinite',
                }}
              >
                Smarter Businesses
              </Box>
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{ mb: 10, maxWidth: 600, mx: 'auto', color: '#475569', lineHeight: 1.75 }}
            >
              Consolidate field workflows, track resource capacity, optimize SLA schedules, and automate reporting.
            </Typography>
          </motion.div>

          <Grid container spacing={3}>
            {features.map((feat, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <FeatureCard {...feat} delay={i * 0.1} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Pricing ───────────────────────────────────────────────────── */}
      <Box sx={{ py: 16, position: 'relative', zIndex: 1 }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            align="center"
            sx={{ mb: 10, fontWeight: 900, letterSpacing: '-0.03em', color: '#F1F5F9' }}
          >
            Plans to Suit Your Needs
          </Typography>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <Box
              sx={{
                p: { xs: 4, md: 6 },
                borderRadius: '32px',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(99,102,241,0.2)',
                boxShadow: '0 0 60px rgba(99,102,241,0.1), 0 40px 80px -20px rgba(0,0,0,0.7)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0, left: '15%', right: '15%',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.7), rgba(6,182,212,0.5), transparent)',
                },
              }}
            >
              <Grid container spacing={4} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                    Most Popular
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#F1F5F9' }}>
                    Enterprise Plan
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                    Designed for professional enterprise solutions.
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 0.5,
                      color: '#F1F5F9',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#64748B' }}>$</span>
                    79
                    <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748B' }}>/mo</span>
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={2} sx={{ mb: 4 }}>
                    {[
                      'Unlimited Custom Software',
                      'Dedicated IT Consultant',
                      'Full Cloud Solutions',
                      'Advanced Cybersecurity',
                      'Business Intelligence Suite',
                      'Dedicated Account Manager',
                    ].map((f, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CheckCircle sx={{ color: '#22C55E', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: '#CBD5E1' }}>{f}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      py: 1.8,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #22C55E 0%, #10B981 50%, #06B6D4 100%)',
                      color: '#0F172A',
                      fontWeight: 800,
                      boxShadow: '0 8px 30px rgba(34,197,94,0.35)',
                      '&:hover': {
                        boxShadow: '0 12px 40px rgba(34,197,94,0.5)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          py: 6,
          position: 'relative',
          zIndex: 1,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.01)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#334155' }}>
              © {new Date().getFullYear()} KEYSTONE Field Service Platform. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={4}>
              {['Privacy Policy', 'Terms of Service'].map((link) => (
                <Typography
                  key={link}
                  variant="body2"
                  sx={{
                    color: '#334155',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'color 300ms ease',
                    '&:hover': { color: '#818CF8' },
                  }}
                >
                  {link}
                </Typography>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
