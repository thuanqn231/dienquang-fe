import { Icon } from '@iconify/react';
import { Link as RouterLink } from 'react-router-dom';
import arrowIosBackFill from '@iconify/icons-eva/arrow-ios-back-fill';
// material
import { styled } from '@material-ui/core/styles';
import { Box, Button, Link, Container, Typography } from '@material-ui/core';
// layouts
import LogoOnlyLayout from '../../layouts/LogoOnlyLayout';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Page from '../../components/Page';
import { ResetPasswordForm } from '../../components/authentication/reset-password';
import useLocales from '../../hooks/useLocales';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  padding: theme.spacing(12, 0)
}));

// ----------------------------------------------------------------------

export default function ResetPassword() {
  const { translate } = useLocales();
  return (
    <RootStyle title="Reset Password">
      <LogoOnlyLayout />

      <Container>
        <Box sx={{ maxWidth: 480, mx: 'auto' }}>
          <Button
            size="small"
            component={RouterLink}
            to={PATH_AUTH.login}
            startIcon={<Icon icon={arrowIosBackFill} width={20} height={20} />}
            sx={{ mb: 3 }}
          >
            {translate(`button.back`)}
          </Button>

          <Typography variant="h3" paragraph>
            {translate(`typo.please_insert_your_new_password`)}
          </Typography>


          <Box sx={{ mt: 5, mb: 3 }}>
            <ResetPasswordForm />
          </Box>

          <Typography variant="body2" align="center">
            {translate(`typo.don’t_have_a_code`)} &nbsp;
            <Link variant="subtitle2" underline="none" onClick={() => { }}>
              {translate(`typo.resend_code`)}
            </Link>
          </Typography>
        </Box>
      </Container>
    </RootStyle>
  );
}
