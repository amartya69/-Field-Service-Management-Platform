import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

/* ─── Shared glass component overrides (mode-aware) ──────────────────────── */
const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => {
  const isDark = mode === 'dark';

  /* ── Palette tokens ── */
  const bg        = isDark ? '#0A0E1A'                    : '#F0F4FF';
  const paper     = isDark ? 'rgba(15, 23, 42, 0.70)'    : 'rgba(255,255,255,0.65)';
  const textPri   = isDark ? '#F1F5F9'                    : '#0F172A';
  const textSec   = isDark ? '#94A3B8'                    : '#475569';
  const divider   = isDark ? 'rgba(99, 102, 241, 0.12)'   : 'rgba(15,23,42,0.08)';
  const glassBlur = 'blur(40px) saturate(180%)';

  /* Card glass */
  const cardBg     = isDark ? 'rgba(15, 23, 42, 0.65)'   : 'rgba(255,255,255,0.75)';
  const cardBorder = isDark ? 'rgba(99, 102, 241, 0.18)'  : 'rgba(99,102,241,0.12)';
  const cardShadow = isDark
    ? '0 20px 60px -15px rgba(0,0,0,0.5), 0 0 30px rgba(99,102,241,0.1)'
    : '0 10px 40px -10px rgba(99,102,241,0.12), 0 2px 8px rgba(15,23,42,0.06)';

  /* Input glass */
  const inputBg     = isDark ? 'rgba(15, 23, 42, 0.8)'   : 'rgba(255,255,255,0.8)';
  const inputBorder = isDark ? 'rgba(99, 102, 241, 0.22)' : 'rgba(99,102,241,0.2)';

  /* Table */
  const tableHead   = isDark ? 'rgba(15,23,42,0.50)'     : 'rgba(240,244,255,0.9)';
  const tableRow    = isDark ? 'transparent'              : 'transparent';
  const tableHover  = isDark ? 'rgba(99,102,241,0.06)'   : 'rgba(99,102,241,0.04)';
  const tableBorder = isDark ? 'rgba(255,255,255,0.06)'  : 'rgba(99,102,241,0.08)';

  return {
    palette: {
      mode,
      primary: {
        main:         '#22C55E',
        light:        '#4ADE80',
        dark:         '#16A34A',
        contrastText: isDark ? '#0F172A' : '#0F172A',
      },
      secondary: {
        main:         '#6366F1',
        light:        '#818CF8',
        dark:         '#4338CA',
        contrastText: '#F8FAFC',
      },
      background: {
        default: bg,
        paper:   paper,
      },
      text: {
        primary:   textPri,
        secondary: textSec,
      },
      action: {
        active:   '#22C55E',
        hover:    isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)',
        selected: isDark ? 'rgba(34,197,94,0.12)'  : 'rgba(34,197,94,0.10)',
      },
      divider,
    },

    shape: { borderRadius: 20 },

    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800, fontSize: '2.75rem', letterSpacing: '-0.03em' },
      h2: { fontWeight: 800, fontSize: '2.1rem',  letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.01em' },
      h4: { fontWeight: 700, fontSize: '1.4rem',  letterSpacing: '-0.01em' },
      h5: { fontWeight: 700, fontSize: '1.2rem' },
      h6: { fontWeight: 600, fontSize: '1rem' },
      subtitle1: { fontWeight: 500, fontSize: '1rem', letterSpacing: '0.01em' },
      body1:     { fontSize: '0.95rem', lineHeight: 1.65 },
      body2:     { fontSize: '0.875rem', lineHeight: 1.55 },
      button:    { textTransform: 'none', fontWeight: 700, letterSpacing: '0.02em' },
    },

    components: {
      /* ── CSS Baseline ── */
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: bg,
            backgroundImage: isDark
              ? 'radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.12) 0%, transparent 50%), ' +
                'radial-gradient(ellipse at 80% 80%, rgba(6,182,212,0.08) 0%, transparent 50%), ' +
                'radial-gradient(ellipse at 60% 40%, rgba(34,197,94,0.06) 0%, transparent 40%)'
              : 'radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.08) 0%, transparent 50%), ' +
                'radial-gradient(ellipse at 80% 80%, rgba(6,182,212,0.06) 0%, transparent 50%), ' +
                'radial-gradient(ellipse at 60% 40%, rgba(34,197,94,0.04) 0%, transparent 40%)',
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat',
            color: textPri,
          },
        },
      },

      /* ── Card ── */
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            backgroundImage: 'none',
            backgroundColor: cardBg,
            backdropFilter: glassBlur,
            WebkitBackdropFilter: glassBlur,
            border: `1px solid ${cardBorder}`,
            boxShadow: cardShadow,
            transition: 'transform 400ms cubic-bezier(0.4,0,0.2,1), box-shadow 400ms cubic-bezier(0.4,0,0.2,1), border-color 400ms cubic-bezier(0.4,0,0.2,1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: isDark
                ? '0 0 40px rgba(99,102,241,0.15), 0 30px 60px -15px rgba(0,0,0,0.85)'
                : '0 0 30px rgba(99,102,241,0.12), 0 20px 40px -10px rgba(15,23,42,0.1)',
              borderColor: isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.25)',
            },
          },
        },
      },

      /* ── Paper (used by TableContainer, Menu, etc.) ── */
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: cardBg,
            backdropFilter: glassBlur,
            WebkitBackdropFilter: glassBlur,
            border: `1px solid ${cardBorder}`,
          },
        },
      },

      /* ── Button ── */
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            padding: '10px 28px',
            fontWeight: 700,
            fontSize: '0.9rem',
            transition: 'all 400ms cubic-bezier(0.4,0,0.2,1)',
            position: 'relative',
            overflow: 'hidden',
          },
          contained: {
            '&.MuiButton-containedPrimary': {
              background: 'linear-gradient(135deg, #22C55E 0%, #10B981 50%, #06B6D4 100%)',
              color: '#0F172A',
              fontWeight: 800,
              boxShadow: '0 8px 30px rgba(34,197,94,0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #16A34A 0%, #059669 50%, #0891B2 100%)',
                boxShadow: '0 12px 40px rgba(34,197,94,0.5)',
                transform: 'translateY(-2px)',
              },
            },
          },
          outlined: {
            '&.MuiButton-outlinedPrimary': {
              borderWidth: '1.5px',
              borderColor: 'rgba(99,102,241,0.5)',
              color: isDark ? '#A5B4FC' : '#4338CA',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                borderWidth: '1.5px',
                borderColor: 'rgba(99,102,241,0.8)',
                backgroundColor: 'rgba(99,102,241,0.08)',
                color: isDark ? '#C7D2FE' : '#4338CA',
              },
            },
          },
        },
      },

      /* ── Input ── */
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: inputBg,
            backdropFilter: 'blur(20px)',
            transition: 'all 400ms cubic-bezier(0.4,0,0.2,1)',
            color: textPri,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(99,102,241,0.5)',
            },
            '&.Mui-focused': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.95)',
              boxShadow: '0 0 0 3px rgba(99,102,241,0.2)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: '1px',
              borderColor: '#6366F1',
            },
          },
          notchedOutline: { borderColor: inputBorder },
        },
      },

      /* ── Input Label ── */
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: textSec,
            '&.Mui-focused': { color: '#818CF8' },
          },
        },
      },

      /* ── Table Cell ── */
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '14px 20px',
            borderBottom: `1px solid ${tableBorder}`,
            color: textPri,
            backgroundColor: tableRow,
          },
          head: {
            fontWeight: 700,
            color: textSec,
            backgroundColor: tableHead,
            textTransform: 'uppercase',
            fontSize: '0.72rem',
            letterSpacing: '0.07em',
          },
        },
      },

      /* ── Table Row ── */
      MuiTableRow: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: tableHover,
            },
          },
        },
      },

      /* ── Chip ── */
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
          },
        },
      },

      /* ── Drawer ── */
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? 'rgba(2,6,23,0.88)'   : 'rgba(240,244,255,0.92)',
            backdropFilter: glassBlur,
            WebkitBackdropFilter: glassBlur,
            borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.12)'}`,
          },
        },
      },

      /* ── AppBar ── */
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(2,6,23,0.82)'   : 'rgba(240,244,255,0.85)',
            backdropFilter: glassBlur,
            WebkitBackdropFilter: glassBlur,
            borderBottom: `1px solid ${isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.12)'}`,
            boxShadow: 'none',
          },
        },
      },

      /* ── Dialog ── */
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 24,
            backgroundColor: isDark ? 'rgba(15,23,42,0.85)'  : 'rgba(255,255,255,0.9)',
            backdropFilter: glassBlur,
            WebkitBackdropFilter: glassBlur,
            border: `1px solid ${cardBorder}`,
            boxShadow: isDark
              ? '0 20px 60px -15px rgba(0,0,0,0.85)'
              : '0 20px 60px -15px rgba(15,23,42,0.15)',
          },
        },
      },

      /* ── Menu ── */
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? 'rgba(15,23,42,0.92)'  : 'rgba(255,255,255,0.92)',
            backdropFilter: glassBlur,
            WebkitBackdropFilter: glassBlur,
            border: `1px solid ${cardBorder}`,
            borderRadius: 16,
          },
        },
      },

      /* ── Menu Item ── */
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: textPri,
          },
        },
      },

      /* ── Tooltip ── */
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(15,23,42,0.88)',
            border: `1px solid ${cardBorder}`,
            borderRadius: 10,
            backdropFilter: 'blur(20px)',
            fontSize: '0.8rem',
            color: '#F1F5F9',
          },
        },
      },

      /* ── Divider ── */
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: divider },
        },
      },

      /* ── Skeleton ── */
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.08)',
          },
        },
      },

      /* ── Breadcrumbs ── */
      MuiBreadcrumbs: {
        styleOverrides: {
          root: { color: textSec },
        },
      },
    },
  };
};

export const lightTheme = createTheme(getThemeOptions('light'));
export const darkTheme  = createTheme(getThemeOptions('dark'));

export const globalGlassStyle = (mode: 'light' | 'dark') => ({
  backdropFilter: 'blur(40px) saturate(180%)',
  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.75)',
  border: mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(99,102,241,0.12)',
  boxShadow: mode === 'dark'
    ? '0 20px 60px -15px rgba(0,0,0,0.7)'
    : '0 10px 40px -10px rgba(99,102,241,0.12)',
});

export const iridescentGradient = 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 25%, #06B6D4 60%, #22C55E 100%)';
export const ctaGradient        = 'linear-gradient(135deg, #22C55E 0%, #10B981 50%, #06B6D4 100%)';
export const emeraldAccent      = '#22C55E';
