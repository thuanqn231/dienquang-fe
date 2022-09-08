import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// material
import { styled } from '@material-ui/core/styles';
import { Box, Button, Container, Typography } from '@material-ui/core';
// layouts
import LogoOnlyLayout from '../../layouts/LogoOnlyLayout';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Page from '../../components/Page';
import { ForgotPasswordForm } from '../../components/authentication/forgot-password';
//
import { SentIcon } from '../../assets';
import useLocales from '../../hooks/useLocales';
import { useDispatch, useSelector } from '../../redux/store';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(12, 0)
}));

// ----------------------------------------------------------------------

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { translate } = useLocales();
  const dispatch = useDispatch();
  const { info } = useSelector(state => state.resetPasswordManagement);

  return (
    <RootStyle title="Reset Password | Minimal UI">
      <LogoOnlyLayout />

      <Container>
        <Box sx={{ maxWidth: 480, mx: 'auto' }}>
          {!sent ? (
            <>
              <Typography variant="h3" paragraph>
                {translate(`typo.forgot_your_password`)}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 5 }}>
                {translate(`typo.please_enter_the_email_address_associated_with_your_account_and_We_will_email_you_a_link_to_reset_your_password`)}
              </Typography>

              <ForgotPasswordForm onSent={() => setSent(true)} onGetEmail={(value) => setEmail(value)} />

              <Button fullWidth size="large" component={RouterLink} to={PATH_AUTH.login} sx={{ mt: 1 }}>
                {translate(`button.back`)}
              </Button>
            </>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <SentIcon sx={{ mb: 5, mx: 'auto', height: 160 }} />

              <Typography variant="h3" gutterBottom>
                {translate(`typo.request_sent_successfully`)}
              </Typography>
              <Typography>
                {translate(`typo.we_have_sent_a_confirmation_email_to`)} &nbsp;
                <strong>{email}</strong>
                <br />
                {translate(`typo.please_check_your_email`)}
              </Typography>

              <Button size="large" variant="contained" component={RouterLink} to={PATH_AUTH.verify} sx={{ mt: 5 }}>
                {translate(`button.verify`)}
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </RootStyle>
  );
}
