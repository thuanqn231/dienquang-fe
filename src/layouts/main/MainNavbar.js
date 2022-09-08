import axios from 'axios';
import { getUnixTime } from 'date-fns';
import fileExcelFilled from '@iconify/icons-ant-design/file-excel-filled';
import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import arrowIosUpwardFill from '@iconify/icons-eva/arrow-ios-upward-fill';
import infoFill from '@iconify/icons-eva/info-fill';
import { Icon } from '@iconify/react';
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  Tab,
  Tabs,
  FormControlLabel,
  Switch
} from '@material-ui/core';
// material
import { useEffect, useState } from 'react';
import { styled } from '@material-ui/core/styles';
import DeviceHub from '@material-ui/icons/DeviceHub';
import CloseIcon from '@material-ui/icons/Close';
import { NavLink as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { MHidden } from '../../components/@material-extend';
// components
import Logo from '../../components/Logo';
// hooks
import useOffSetTop from '../../hooks/useOffSetTop';
import useAuth from '../../hooks/useAuth';
import { query } from '../../core/api';
// redux
import { updateActiveTab, updateHideMenu, setSelectedWidget } from '../../redux/slices/page';
import { useDispatch, useSelector } from '../../redux/store';
import AccountPopover from './AccountPopover';
import LanguagePopover from './LanguagePopover';
import ExternalLinkPopover from './ExternalLinkPopover';
import navConfig from './MenuConfig';
//
import MenuDesktop from './MenuDesktop';
import MenuMobile from './MenuMobile';
import NotificationsPopover from './NotificationsPopover';
import SearchPage from './SearchPage';
import useLocales from '../../hooks/useLocales';

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 60;
const APP_BAR_DESKTOP = 60;

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  minHeight: APP_BAR_MOBILE,
  maxHeight: APP_BAR_MOBILE,
  backgroundImage: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main}, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
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

const TabStyle = styled(Toolbar)(({ theme }) => ({
  minHeight: APP_BAR_MOBILE * 0.8,
  maxHeight: APP_BAR_MOBILE * 0.8,
  border: `solid 1px ${theme.palette.grey[500_8]}`,
  backgroundColor: theme.palette.grey[500_16],
  transition: theme.transitions.create(['height', 'background-color'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter
  }),
  [theme.breakpoints.up('md')]: {
    minHeight: APP_BAR_DESKTOP * 0.8,
    maxHeight: APP_BAR_DESKTOP * 0.8
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

const ToolbarShadowStyle = styled('div')(({ theme }) => ({
  left: 0,
  right: 0,
  bottom: 0,
  height: 12,
  zIndex: -1,
  margin: 'auto',
  borderRadius: '50%',
  position: 'absolute',
  width: `calc(100% - 48px)`,
  boxShadow: theme.customShadows.z8
}));

const SearchbarStyle = styled('div')(({ theme }) => ({
  zIndex: 99,
  width: theme.spacing(40),
  alignItems: 'center'
}));

// ----------------------------------------------------------------------

export default function MainNavbar() {
  const isOffset = useOffSetTop(60);
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { funcPermission } = useAuth();
  const { activeTabs, hideMenu, selectedWidget } = useSelector((state) => state.page);
  const [currentTab, setCurrentTab] = useState(activeTabs[0].path);
  const [isSearchWidget, setIsSearchWidget] = useState(true);
  const [actionTooltip, setActionTooltip] = useState('Hide');
  const { translate } = useLocales();

  const handleChange = (event, value) => {
    setCurrentTab(value);
  };

  useEffect(() => {
    setActionTooltip(hideMenu ? 'Show' : 'Hide');
  }, [hideMenu]);

  useEffect(() => {
    if (pathname !== '/') {
      setCurrentTab(pathname);
      if (activeTabs.length === 1) {
        updateActiveTab(updateTab(activeTabs));
      }
      const newTabIndex = funcPermission.findIndex((tab) => pathname.includes(tab.path));
      if (activeTabs.find((obj) => obj.path.includes(pathname)) !== undefined) {
        const currentTabIndex = activeTabs.findIndex((tab) => tab.path.includes(pathname));
        const newActive = {
          ...activeTabs[currentTabIndex],
          path: pathname
        };
        const updatedTabs = activeTabs.filter((tab, index) => index !== currentTabIndex);
        dispatch(updateActiveTab(updateTab([...updatedTabs, newActive])));
      }
      if (
        activeTabs.find((obj) => obj.path.includes(pathname)) === undefined &&
        newTabIndex !== -1 &&
        funcPermission[newTabIndex].name
      ) {
        let updatedTabs = [];
        if (activeTabs.length === 10) {
          updatedTabs = activeTabs.filter((tab, index) => index !== 1);
        } else {
          updatedTabs = activeTabs;
        }
        dispatch(
          updateActiveTab(
            updateTab([
              ...updatedTabs,
              {
                path: pathname,
                pageCode: funcPermission[newTabIndex].code,
                label: funcPermission[newTabIndex].name,
                closeable: true
              }
            ])
          )
        );
      }
    }
  }, [pathname]);

  const handleClose = (tabToDelete) => {
    const tabToDeleteIndex = activeTabs.findIndex((tab) => tab.path === tabToDelete);
    const updatedTabs = activeTabs.filter((tab, index) => index !== tabToDeleteIndex);
    dispatch(updateActiveTab(updateTab(updatedTabs)));

    const updatedWidget = Object.keys(selectedWidget)
      .filter((key) => key !== activeTabs[tabToDeleteIndex].pageCode)
      .reduce((obj, key) => {
        obj[key] = selectedWidget[key];
        return obj;
      }, {});

    dispatch(setSelectedWidget(updatedWidget));

    if (pathname.includes(tabToDelete)) {
      const previousTab = activeTabs[tabToDeleteIndex - 1] || activeTabs[tabToDeleteIndex + 1] || {};
      navigate(previousTab.path);
      setCurrentTab(previousTab.path);
    }
  };

  const updateTab = (tabs) => {
    const newTab = [];
    if (tabs.length === 1) {
      newTab.push({
        pageCode: 'menu.dashboard',
        path: tabs[0].path,
        label: tabs[0].label,
        closeable: false
      });
    } else {
      tabs.forEach((tab, index) => {
        newTab.push({
          pageCode: tab.pageCode,
          path: tab.path,
          label: tab.label,
          closeable: true
        });
      });
    }
    return newTab;
  };

  const handleExcelExport = async () => {
    const response = await query({
      url: '/v1/user/exportExcel',
      featureCode: 'user.create'
    });
    if (response.data) {
      const { data } = response;
      const accessToken = window.localStorage.getItem('accessToken');
      // query({
      //   url: `/v1/file-storage/static/download?filePath=${data.relativePath}`,
      //   featureCode: 'user.create'
      // });
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      axios.defaults.headers.common.FeatureCode = `user.create`;
      const link = document.createElement('a');
      link.target = '_blank';
      link.download = `${data.fileName}_${getUnixTime(new Date())}.${data.contentType}`;
      const url = `/v1/file-storage/static/download?filePath=${encodeURIComponent(data.relativePath)}`;
      await axios
        .get(url, {
          responseType: 'blob'
        })
        .then((res) => {
          link.href = URL.createObjectURL(new Blob([res.data], { type: data.contentType }));
          link.click();
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

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
          <RouterLink to="/">
            <Logo />
          </RouterLink>
          <Typography variant="h3" sx={{ color: 'common.white', mx: 0.5, fontStyle: 'italic' }} noWrap>
            {translate(`typo.DIENQUANG_MES`)}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" alignItems="center" spacing={0}>
            <FormControlLabel
              control={
                <Switch
                  checked={isSearchWidget}
                  onChange={(e) => setIsSearchWidget(e.target.checked)}
                  name="isSearchWidget"
                  color="success"
                />
              }
              label={`By ${isSearchWidget ? 'Widget' : 'Screen'}`}
            />
            <MHidden width="mdDown">
              <SearchbarStyle>
                <SearchPage isSearchWidget={isSearchWidget} />
              </SearchbarStyle>
            </MHidden>
            <ExternalLinkPopover />
            {/* <Tooltip title='Organization Chart'>
              <IconButton sx={{ color: 'common.white' }}>
                <DeviceHub />
              </IconButton>
            </Tooltip>
            <Tooltip title='Info'>
              <IconButton sx={{ color: 'common.white' }}>
                <Icon icon={infoFill} width={24} height={24} />
              </IconButton>
            </Tooltip>
            <Tooltip title='Excel Export'>
              <IconButton sx={{ color: 'common.white' }} onClick={handleExcelExport}>
                <Icon icon={fileExcelFilled} width={24} height={24} />
              </IconButton>
            </Tooltip> */}
            {/* <NotificationsPopover /> */}
            <LanguagePopover sx={{ mr: 10 }} />
            {/* <Divider orientation="vertical" flexItem variant="middle" sx={{ borderWidth: '1px', borderColor: 'common.white' }} /> */}
            <AccountPopover sx={{ ml: 10 }} />
            <Tooltip title={`${actionTooltip} Menu`}>
              <IconButton
                onClick={() => {
                  dispatch(updateHideMenu(!hideMenu));
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
            {/* <Box sx={{ flexGrow: 1 }} /> */}
            <MHidden width="mdDown">
              <MenuDesktop key="menu-desktop" isOffset={isOffset} isHome={isHome} />
            </MHidden>
            <MHidden width="mdUp">
              <MenuMobile key="menu-mobile" isOffset={isOffset} isHome={isHome} navConfig={navConfig} />
            </MHidden>
          </Container>
        </ToolbarStyleMenu>
      )}
      <TabStyle
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
            alignItems: 'center'
          }}
        >
          <Tabs onChange={handleChange} value={currentTab}>
            {activeTabs.map((tab) => (
              <Box
                value={tab.path}
                key={tab.path}
                component="span"
                sx={{
                  paddingLeft: (theme) => theme.spacing(1),
                  paddingRight: (theme) => theme.spacing(1),
                  borderRight: (theme) => `solid 1px ${theme.palette.grey[500_32]} `,
                  bgcolor: (theme) => theme.palette.grey[500_16],
                  ...(pathname.includes(tab.path) && {
                    bgcolor: (theme) => theme.palette.primary.main,
                    color: (theme) => theme.palette.common.white
                  })
                }}
              >
                <Tab
                  key={tab.path}
                  value={tab.path}
                  label={` ${tab.label} `}
                  component={RouterLink}
                  to={tab.path}
                  sx={{
                    marginRight: '0px !important',
                    ...(pathname.includes(tab.path) && {
                      color: (theme) => theme.palette.common.white
                    })
                  }}
                />
                {tab.closeable && (
                  <IconButton
                    component="div"
                    onClick={() => handleClose(tab.path)}
                    sx={{
                      ...(pathname.includes(tab.path) && {
                        color: (theme) => theme.palette.common.white
                      })
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </Box>
            ))}
          </Tabs>
        </Container>
      </TabStyle>
      {isOffset && <ToolbarShadowStyle />}
    </AppBar>
  );
}
