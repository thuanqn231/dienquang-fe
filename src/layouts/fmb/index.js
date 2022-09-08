// material
import { useMediaQuery } from '@material-ui/core';
import { styled, useTheme } from '@material-ui/core/styles';
import { Outlet } from 'react-router-dom';
import useOffSetTop from '../../hooks/useOffSetTop';
import { useSelector } from '../../redux/store';
// components

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 60;
const APP_BAR_DESKTOP = 60;

const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden'
});

const FmbStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: 32,
  paddingTop: APP_BAR_MOBILE,
  paddingBottom: theme.spacing(0),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP,
    paddingLeft: 0,
    paddingRight: 0
  }
}));

export default function FmbLayout() {
  const isOffset = useOffSetTop(70);
  const theme = useTheme();
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const { fmb: { hideMenu } } = useSelector((state) => state.page);

  return (
    <>
      <RootStyle>
        <FmbStyle
          sx={{
            ...(!hideMenu && {
            mt: 4.5            
          }),
            transition: theme.transitions.create('margin', {
              duration: theme.transitions.duration.complex
            }),
          }}
        >
          <Outlet />
        </FmbStyle>
      </RootStyle>
    </>
  );
}
