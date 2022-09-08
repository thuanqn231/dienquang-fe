import { Box, Card, Container, Link, Stack, Typography } from '@material-ui/core';
// material
import { alpha, styled } from '@material-ui/core/styles';
import { Link as RouterLink } from 'react-router-dom';
import { MHidden } from '../../components/@material-extend';
import { RegisterForm } from '../../components/authentication/register';
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
  minWidth: 'calc(100vw*2/3)',
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

export default function Register() {
  const { translate } = useLocales();

  return (
    <RootStyle title={`${translate(`signup.signup`)}  | Điện Quang`}>
      <HeaderStyle>
        <RouterLink to="/">
          <Logo />
        </RouterLink>
        <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>
          <LanguagePopover />
          <Logo />
        </Stack>
      </HeaderStyle>
      <MHidden width="mdDown">
        <SectionStyle>
          <img
            style={{ minHeight: '100%' }}
            src="/static/img/company-background/Dienquang.jpg"
            alt={translate(`signup.signup`)}
          />
        </SectionStyle>
      </MHidden>

      <Container maxWidth="sm">
        <ContentStyle>
          <Stack direction="row" alignItems="center" sx={{ mb: 5 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                {translate(`signup.signup_statement`)}
              </Typography>
            </Box>
          </Stack>

          <RegisterForm />

          <Typography variant="body2" align="center" sx={{ color: 'text.secondary', mt: 3 }}>
            {translate(`signup.signup_agree`)}&nbsp;
            <Link underline="always" color="text.primary" href="#">
              {translate(`signup.terms_of_service`)}
            </Link>
            &nbsp;{translate(`common.and`)}&nbsp;
            <Link underline="always" color="text.primary" href="#">
              {translate(`signup.privacy_policy`)}
            </Link>
            .
          </Typography>
        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
