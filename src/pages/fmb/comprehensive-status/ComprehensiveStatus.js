// material
import { Card, Grid, Stack } from '@material-ui/core';
import { isEmpty } from 'lodash-es';
import PropTypes from 'prop-types';
import MachineStatus from './MachineStatus';

// ----------------------------------------------------------------------
ComprehensiveStatus.propTypes = {
  currentData: PropTypes.object
};
export default function ComprehensiveStatus({ currentData }) {
  const list = [];
  for (let i = 0; i < 12; i += 1) {
    let data = [];
    if (!isEmpty(currentData[i])) {
      data = currentData[i];
      //   console.log('dataaccc', data);
    }
    list.push(
      <Grid item xs={12} md={3}>
        <Card sx={{ height: '29vh' }}>
          <Stack direction="row" spacing={1} sx={{ height: '100%' }}>
            <Grid item xs={12} md={12}>
              <MachineStatus currentData={data} />
            </Grid>
          </Stack>
        </Card>
      </Grid>
    );
  }
  return (
    <Grid container spacing={1}>
      {list}
    </Grid>
  );
}
