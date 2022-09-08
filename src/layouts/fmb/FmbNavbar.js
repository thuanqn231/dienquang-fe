import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import arrowIosUpwardFill from '@iconify/icons-eva/arrow-ios-upward-fill';
import { Icon } from '@iconify/react';
import { AppBar, Box, Container, IconButton, Stack, Toolbar, Tooltip, Typography } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import { createStyles, makeStyles } from '@material-ui/styles';
// material
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// components
import { updateProductionStatusDate, updateStuffingStatusDate, updateLineStatusDate } from '../../redux/slices/fmb';
import { updateHideMenuFmb } from '../../redux/slices/page';
import { useDispatch, useSelector } from '../../redux/store';

import Timer from '../../components/Timer';
import { DthDatePicker } from '../../core/wrapper';
// hooks
import useOffSetTop from '../../hooks/useOffSetTop';
import { fDate } from '../../utils/formatTime';
import ExternalLinkPopover from '../main/ExternalLinkPopover';
import LanguagePopover from '../main/LanguagePopover';
import MenuDesktop from '../main/MenuDesktop';

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 60;
const APP_BAR_DESKTOP = 60;

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  minHeight: APP_BAR_MOBILE,
  maxHeight: APP_BAR_MOBILE,
  backgroundImage: `linear-gradient(to right, #23365a, #192c3c, #192c3c, #192c3c, #23365a)`,
  color: theme.palette.common.white,
  border: `solid 1px ${theme.palette.grey[500_8]}`,
  paddingLeft: 0,
  paddingRight: 0,
  transition: theme.transitions.create(['height', 'background-color'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter
  }),
  [theme.breakpoints.up('md')]: {
    minHeight: APP_BAR_DESKTOP,
    maxHeight: APP_BAR_DESKTOP
  }
}));

const ToolbarStyleMenu = styled(Toolbar)(({ theme }) => ({
  minHeight: APP_BAR_MOBILE / 1.5,
  maxHeight: APP_BAR_MOBILE / 1.5,
  border: `solid 1px ${theme.palette.grey[500_8]}`,
  transition: theme.transitions.create(['height', 'background-color'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter
  }),
  [theme.breakpoints.up('md')]: {
    minHeight: APP_BAR_DESKTOP / 1.5,
    maxHeight: APP_BAR_DESKTOP / 1.5
  }
}));

const useStyles = makeStyles((theme) =>
  createStyles({
    notchedOutline: {
      borderWidth: '1px',
      borderColor: 'yellow !important',
      color: 'white'
    },
    input: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '1.2em'
    }
  })
);

// ----------------------------------------------------------------------

FmbNavbar.propTypes = {
  page: PropTypes.string,
  title: PropTypes.string
};

export default function FmbNavbar({ page, title }) {
  const dispatch = useDispatch();
  const isOffset = useOffSetTop(60);
  const {
    [page]: { prodDate }
  } = useSelector((state) => state.fmb);
  const classes = useStyles();
  const {
    fmb: { hideMenu }
  } = useSelector((state) => state.page);
  const [actionTooltip, setActionTooltip] = useState('Show');

  useEffect(() => {
    setActionTooltip(hideMenu ? 'Show' : 'Hide');
  }, [hideMenu]);

  return (
    <AppBar sx={{ boxShadow: 0, bgcolor: 'white' }}>
      <ToolbarStyle
        disableGutters
        sx={{
          ...(isOffset && {
            bgcolor: `background.default`
          })
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <DthDatePicker
            name="prodDate"
            value={prodDate}
            minDate="2017-01-01"
            onChange={(newValue) => {
              const prodDate = fDate(newValue);
              if (page === 'productionStatus') {
                dispatch(updateProductionStatusDate(prodDate));
              }
              if (page === 'stuffingStatus') {
                dispatch(updateStuffingStatusDate(prodDate));
              }
              if (page === 'lineStatus') {
                dispatch(updateLineStatusDate(prodDate));
              }
            }}
            sx={{ border: '1px solid white', color: 'white', width: '8%' }}
            size="small"
            InputProps={{
              classes: {
                input: classes.input
              }
            }}
          />

          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="h2" sx={{ color: 'common.white', mx: 0.5, textTransform: 'uppercase' }} noWrap>
            {title}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" alignItems="center" spacing={0}>
            <ExternalLinkPopover />
            <LanguagePopover showLabel={false} />
            <Timer />
            <Tooltip title={`${actionTooltip} Menu`}>
              <IconButton
                onClick={() => {
                  dispatch(updateHideMenuFmb(!hideMenu));
                }}
                sx={{ color: 'common.white' }}
              >
                <Icon icon={hideMenu ? arrowIosDownwardFill : arrowIosUpwardFill} width={24} height={24} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Container>
      </ToolbarStyle>
      {!hideMenu && (
        <ToolbarStyleMenu
          disableGutters
          sx={{
            ...(isOffset && {
              bgcolor: `background.default`
            })
          }}
        >
          <Container
            maxWidth={false}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <MenuDesktop key="menu-desktop" isOffset={isOffset} isHome={false} />
          </Container>
        </ToolbarStyleMenu>
      )}
    </AppBar>
  );
}
