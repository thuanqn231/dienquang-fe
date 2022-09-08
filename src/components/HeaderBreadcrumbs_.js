import { isString, isUndefined, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import barChart2Fill from '@iconify/icons-eva/bar-chart-2-fill';
// material
import { Box, Typography, Link, Stack, Icon } from '@material-ui/core';
//
import { MBreadcrumbs } from './@material-extend';

// ----------------------------------------------------------------------

HeaderBreadcrumbs.propTypes = {
  links: PropTypes.array,
  action: PropTypes.node,
  heading: PropTypes.string,
  moreLink: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  sx: PropTypes.object
};

export default function HeaderBreadcrumbs({ links, action, heading, moreLink = '' || [], sx, ...other }) {
  return (
    <Stack sx={sx} mb={1} spacing={2}>
      <Stack direction="row" alignItems="center">
        <Box sx={{ flexGrow: 1 }}>
          {
            !isEmpty(heading) &&
            <>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" sx={{ ml: 1, mt: 1 }} gutterBottom>
                  {heading}
                </Typography>
              </Stack>
            </>

          }
        </Box>
        {!isEmpty(links) && <MBreadcrumbs links={links} {...other} />}

      </Stack>
      {action && <Box sx={{ flexShrink: 0, marginTop: 0 }}>{action}</Box>}
      {isString(moreLink) ? (
        <Link href={moreLink} target="_blank" variant="body2">
          {moreLink}
        </Link>
      ) : (
        moreLink.map((href) => (
          <Link noWrap key={href} href={href} variant="body2" target="_blank" sx={{ display: 'flex' }}>
            {href}
          </Link>
        ))
      )}
    </Stack>
  );
}
