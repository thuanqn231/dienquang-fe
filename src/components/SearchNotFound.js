import PropTypes from 'prop-types';
// material
import { Paper, Typography } from '@material-ui/core';
import useLocales from '../hooks/useLocales';

// ----------------------------------------------------------------------

SearchNotFound.propTypes = {
  searchQuery: PropTypes.string
};

export default function SearchNotFound({ searchQuery = '', ...other }) {
  const { translate } = useLocales();
  return (
    <Paper {...other}>
      <Typography gutterBottom align="center" variant="subtitle1">
        {translate(`typo.notFound1`)}
      </Typography>
      <Typography variant="body2" align="center">
        {
          `${translate(`typo.notFound2`)} &nbsp;
          <strong>&quot;{searchQuery}&quot;</strong>. ${translate(`typo.checkingTypo`)}`
        }
      </Typography>
    </Paper>
  );
}
