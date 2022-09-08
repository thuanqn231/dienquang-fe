import { Box, Button, Card, Container, Grid } from '@material-ui/core';
import PropTypes from 'prop-types';
// components
import Page from '../../components/Page';
// hooks
import useSettings from '../../hooks/useSettings';
import { useSelector } from '../../redux/store';

// ----------------------------------------------------------------------

SearchPage.propTypes = {
  pageTitle: PropTypes.string,
  searchConfig: PropTypes.node,
  dataConfig: PropTypes.node.isRequired,
  onInquiry: PropTypes.func
};
export default function SearchPage(props) {
  const { themeStretch } = useSettings();
  const { pageTitle } = props;
  const { searchConfig } = props;
  const { dataConfig } = props;
  const { onInquiry } = props;
  const { commonCodes } = useSelector((state) => state.common);
  return (
    <Page title={`${pageTitle}  | Điện Quang`}>
      <Container sx={{ px: `0px !important` }} maxWidth={themeStretch ? false : 'xl'}>
        <Grid container spacing={0} sx={{ px: 0, height: `calc(100vh - 64px)` }}>
          {searchConfig && (
            <Grid item xs={12} md={2}>
              <Card sx={{ py: 1, px: 1, borderRadius: '0px', height: { md: `calc(100vh - 100px)` }, overflow: 'auto' }}>
                <Box sx={{ mb: 5 }}>{searchConfig}</Box>
              </Card>
              <Card sx={{ p: 0, height: '36px', borderRadius: '0px' }}>
                <Button onClick={() => onInquiry()} variant="contained" sx={{ width: '100%', height: '100%' }}>
                  Inquiry
                </Button>
              </Card>
            </Grid>
          )}
          <Grid item xs={12} md={searchConfig ? 10 : 12}>
            {dataConfig}
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
