
import { last, isUndefined } from 'lodash';
import PropTypes from 'prop-types';
// material
import { Link as RouterLink } from 'react-router-dom';
import { Typography, Box, Link, Breadcrumbs } from '@material-ui/core';
import { getHeaderBreadcrumbs } from '../../utils/pageConfig';

// ----------------------------------------------------------------------

LinkItem.propTypes = {
  link: PropTypes.object
};

function LinkItem({ link }) {
  const { href, name, icon } = link;
  return (
    <Link
      to={href}
      key={name}
      variant="body2"
      component={RouterLink}
      sx={{
        lineHeight: 2,
        display: 'flex',
        alignItems: 'center',
        color: 'text.primary',
        '& > div': { display: 'inherit' }
      }}
    >
      {icon && (
        <Box
          sx={{
            mr: 1,
            '& svg': { width: 20, height: 20 }
          }}
        >
          {icon}
        </Box>
      )}
      {name}
    </Link>
  );
}

MBreadcrumbs.propTypes = {
  links: PropTypes.array,
  pageCode: PropTypes.string,
  activeLast: PropTypes.bool
};

const getCurrentBreadcrumbs = (pageCode) => getHeaderBreadcrumbs(pageCode);

export default function MBreadcrumbs({ links, pageCode, activeLast = false, ...other }) {
  let currentLinks = links;
  if (!isUndefined(pageCode)) {
    currentLinks = getCurrentBreadcrumbs(pageCode);
  }
  const currentLink = last(currentLinks).name;

  const listDefault = currentLinks.map((link) => <LinkItem key={link.name} link={link} />);
  const listActiveLast = currentLinks.map((link) => (
    <div key={link.name}>
      {link.name !== currentLink ? (
        <LinkItem link={link} />
      ) : (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 260,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            color: 'text.disabled',
            textOverflow: 'ellipsis'
          }}
        >
          {currentLink}
        </Typography>
      )}
    </div>
  ));

  return (
    <Breadcrumbs separator='>' {...other}>
      {activeLast ? listDefault : listActiveLast}
    </Breadcrumbs>
  );
}
