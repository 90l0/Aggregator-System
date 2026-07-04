import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { keyframes } from '@mui/system';
import logo from '../assets/logo.png';

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(89, 242, 198, 0.28); }
  100% { box-shadow: 0 0 0 16px rgba(89, 242, 198, 0); }
`;

function StatPill({ label, value }) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.2,
        borderRadius: 3,
        border: '1px solid rgba(255, 255, 255, 0.14)',
        bgcolor: 'rgba(255, 255, 255, 0.06)',
        transition: 'transform 220ms ease, background-color 220ms ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          bgcolor: 'rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ mt: 0.3 }}>
        {value}
      </Typography>
    </Box>
  );
}

function AuthLayout({ title, subtitle, children }) {
  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 72px)',
        display: 'grid',
        alignItems: 'center',
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 4 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 1120,
          mx: 'auto',
          borderRadius: { xs: 3, md: 5 },
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 30px 90px rgba(4, 10, 22, 0.6)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.04fr 1fr' },
            minHeight: { md: 560 },
          }}
        >
          <Box
            sx={{
              p: { xs: 3, md: 5 },
              borderBottom: { xs: '1px solid rgba(255, 255, 255, 0.14)', md: 'none' },
              borderRight: { xs: 'none', md: '1px solid rgba(255, 255, 255, 0.14)' },
              background:
                'linear-gradient(165deg, rgba(8, 21, 37, 0.75) 0%, rgba(5, 15, 27, 0.58) 100%)',
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Lyca logo"
              sx={{
                width: { xs: 98, md: 126 },
                height: 'auto',
                mb: 2.5,
                borderRadius: 2,
                filter: 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.4))',
              }}
            />
            <Typography variant="h3" sx={{ lineHeight: 1.1 }}>
              {title}
            </Typography>
            <Typography
              variant="body1"
              sx={{ mt: 2, color: 'text.secondary', maxWidth: 430, lineHeight: 1.7 }}
            >
              {subtitle}
            </Typography>
            <Stack direction="row" spacing={1.2} sx={{ mt: 3, flexWrap: 'wrap', rowGap: 1.2 }}>
              <StatPill label="Uptime" value="99.97%" />
              <StatPill label="Live Agents" value="1,240+" />
              <StatPill label="Alerts in Sync" value="< 3 sec" />
            </Stack>
            <Box
              sx={{
                mt: 3,
                px: 2,
                py: 1,
                borderRadius: 20,
                width: 'fit-content',
                border: '1px solid rgba(89, 242, 198, 0.45)',
                animation: `${pulse} 2400ms ease-out infinite`,
              }}
            >
              <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                Real-time operations cockpit
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              p: { xs: 3, md: 5 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(180deg, rgba(9, 23, 40, 0.72), rgba(6, 16, 28, 0.86))',
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 440, animation: `${float} 7000ms ease-in-out infinite` }}>
              {children}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default AuthLayout;
