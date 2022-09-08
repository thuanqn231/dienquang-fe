import { isString } from 'lodash';
import PropTypes from 'prop-types';
// material
import { Box, Typography, Link, Stack } from '@material-ui/core';
//
import { MBreadcrumbs } from './@material-extend';

// ----------------------------------------------------------------------

HeaderBreadcrumbs.propTypes = {
  links: PropTypes.array,
  pageCode: PropTypes.string,
  action: PropTypes.node,
  heading: PropTypes.string,
  moreLink: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  sx: PropTypes.object
};

export default function HeaderBreadcrumbs({ links, pageCode, action, heading, moreLink = '' || [], sx, ...other }) {
  return (
    <Stack sx={sx} mb={0} mt={0} spacing={2}>
      <Stack direction="row" justifyContent={heading ? 'space-between' : 'right'} display='flex' alignItems="center">
        {heading && <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            {heading}
          </Typography>
        </Box>
        }
        <MBreadcrumbs links={links} pageCode={pageCode} {...other} />
      </Stack>
      <Stack direction="row" justifyContent='right' display='flex' alignItems="center" sx={{ marginTop: `0 !important`, marginBottom: `1 !important` }}>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Stack>

      {
        isString(moreLink) ? (
          <Link href={moreLink} target="_blank" variant="body2">
            {moreLink}
          </Link>
        ) : (
          moreLink.map((href) => (
            <Link noWrap key={href} href={href} variant="body2" target="_blank" sx={{ display: 'flex' }}>
              {href}
            </Link>
          ))
        )
      }
    </Stack >
  );
}
