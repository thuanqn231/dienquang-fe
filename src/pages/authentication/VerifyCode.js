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
import { VerifyCodeForm } from '../../components/authentication/verify-code';
import useLocales from '../../hooks/useLocales';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  padding: theme.spacing(12, 0)
}));

// ----------------------------------------------------------------------

export default function VerifyCode() {
  const { translate } = useLocales();
  return (
    <RootStyle title="Verify | Minimal UI">
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
            {translate(`typo.please_check_your_email`)}
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            {translate(`typo.we_have_emailed_a_6_digit_confirmation_code_to_your_email_please_enter_the_code_in_below_box_to_verify_your_email`)}
          </Typography>

          <Box sx={{ mt: 5, mb: 3 }}>
            <VerifyCodeForm />
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
