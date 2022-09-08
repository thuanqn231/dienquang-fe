import { Link as RouterLink } from 'react-router-dom';
// material
import { styled } from '@material-ui/core/styles';
import { Button, Typography, Container } from '@material-ui/core';
// components
import Page from '../components/Page';
//
import { MaintenanceIllustration } from '../assets';
import useLocales from '../hooks/useLocales';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  minHeight: '100%',
  display: 'flex',
  alignItems: 'center',
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(10)
}));

// ----------------------------------------------------------------------

export default function Maintenance() {
  const { translate } = useLocales();
  return (
    <RootStyle title="Maintenance | Điện Quang">
      <Container sx={{ textAlign: 'center' }}>
        <Typography variant="h3" paragraph>
          {translate(`typo.website_currently_under_maintenance`)}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          {translate(`typo.we_are_currently_working_hard_on_this_page`)}
        </Typography>

        <MaintenanceIllustration sx={{ my: 10, height: 240 }} />

        <Button variant="contained" size="large" component={RouterLink} to="/">
          {translate(`button.go_to_home`)}
        </Button>
      </Container>
    </RootStyle>
  );
}
