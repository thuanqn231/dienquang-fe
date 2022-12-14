import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// material
import { Link, Typography, Box } from '@material-ui/core';
import useLocales from '../../hooks/useLocales';

// ----------------------------------------------------------------------

MenuHotProducts.propTypes = {
  tags: PropTypes.array
};

export default function MenuHotProducts({ tags, ...other }) {
  const { translate } = useLocales();
  return (
    <Box {...other}>
      <Typography variant="caption" fontWeight="fontWeightBold">
        {translate(`typo.hot_products`)}:
      </Typography>
      &nbsp;
      {tags.map((tag, index) => (
        <Link
          component={RouterLink}
          key={tag.name}
          to={tag.path}
          underline="none"
          variant="caption"
          sx={{
            color: 'text.secondary',
            transition: (theme) => theme.transitions.create('all'),
            '&:hover': { color: 'primary.main' }
          }}
        >
          {index === 0 ? tag.name : `, ${tag.name} `}
        </Link>
      ))}
    </Box>
  );
}
