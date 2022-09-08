import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@material-ui/core/styles';
// material
import { Box, Button, Typography, Container } from '@material-ui/core';
// components
import Page from '../components/Page';
import { SeverErrorIllustration } from '../assets';
import useLocales from '../hooks/useLocales';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(10)
}));

// ----------------------------------------------------------------------

export default function Page500() {
  const { translate } = useLocales();
  return (
    <RootStyle title="500 Internal Server Error | Điện Quang">
      <Container>
        <Box sx={{ maxWidth: 480, margin: 'auto', textAlign: 'center' }}>
          <Typography variant="h3" paragraph>
            {translate(`typo.500_internal_server_error`)}
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            {translate(`typo.there_was_an_error_please_try_again_later`)}
          </Typography>

          <SeverErrorIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />

          <Button to="/" size="large" variant="contained" component={RouterLink}>
            {translate(`button.go_to_home`)}
          </Button>
        </Box>
      </Container>
    </RootStyle>
  );
}
