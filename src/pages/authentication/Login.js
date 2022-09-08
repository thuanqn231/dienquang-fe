import { Box, Card, Container, Stack, Typography } from '@material-ui/core';
// material
import { alpha, styled } from '@material-ui/core/styles';
import { Link as RouterLink } from 'react-router-dom';
import { MHidden } from '../../components/@material-extend';
import { LoginForm } from '../../components/authentication/login';
import Logo from '../../components/Logo';
// components
import Page from '../../components/Page';
import useLocales from '../../hooks/useLocales';
import LanguagePopover from '../../layouts/main/LanguagePopover';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  },
  backgroundColor: alpha(theme.palette.grey[400], 0.48)
}));

const HeaderStyle = styled('header')(({ theme }) => ({
  top: 0,
  zIndex: 9,
  lineHeight: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  padding: theme.spacing(1),
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    alignItems: 'flex-start'
  }
}));

const SectionStyle = styled(Card)(() => ({
  width: '100%',
  minWidth: 'calc(100vw*3/4)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  opacity: 0.5
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0)
}));

// ----------------------------------------------------------------------

export default function Login() {
  const { translate } = useLocales();

  return (
    <RootStyle title={`${translate(`login.login`)}  | Điện Quang`}>
      <HeaderStyle>
        <RouterLink to="/">
          <Logo />
        </RouterLink>
        <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>
          <LanguagePopover color="#5a646c" />
          <Logo />
        </Stack>
      </HeaderStyle>
      <MHidden width="mdDown">
        <SectionStyle>
          <img
            style={{ minHeight: '100%' }}
            src="/static/img/company-background/Dienquang.jpg"
            alt={translate(`login.login`)}
          />
        </SectionStyle>
      </MHidden>
      <Container maxWidth="sm">
        <ContentStyle>
          <Stack direction="row" alignItems="center" sx={{ mb: 5 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                {translate(`login.login_statement`)}
              </Typography>
            </Box>
          </Stack>
          <LoginForm />
        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
