// material
import { useMediaQuery } from '@material-ui/core';
import { styled, useTheme } from '@material-ui/core/styles';
import { Outlet } from 'react-router-dom';
// redux
import { useSelector } from '../../redux/store';
// components
import MainNavbar from './MainNavbar';

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 60;
const APP_BAR_DESKTOP = 60;

const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden'
});

const MainStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: 32,
  paddingTop: APP_BAR_MOBILE * 3,
  paddingBottom: theme.spacing(0),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP * 3,
    paddingLeft: 0,
    paddingRight: 0
  }
}));

export default function MainLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const { hideMenu } = useSelector((state) => state.page);

  return (
    <>
      <RootStyle>
        <MainNavbar />
        <MainStyle
          sx={{
            paddingTop: `${(isDesktop ? APP_BAR_DESKTOP : APP_BAR_MOBILE) * (hideMenu ? 1.85 : 2.5)}px!important`,
            transition: theme.transitions.create('margin', {
              duration: theme.transitions.duration.complex
            }),
          }}
        >
          <Outlet />
        </MainStyle>
      </RootStyle>
    </>
  );
}
