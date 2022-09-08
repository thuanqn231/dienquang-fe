// material
import { Box, Container, IconButton, Tab, Tabs, Toolbar, useMediaQuery } from '@material-ui/core';
import { styled, useTheme } from '@material-ui/core/styles';
import CloseIcon from "@material-ui/icons/Close";
import { forEach } from 'lodash';
import { useEffect, useState } from 'react';
import { NavLink as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useOffSetTop from '../../hooks/useOffSetTop';
// components
import OINavbar from './OINavbar';

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 60;
const APP_BAR_DESKTOP = 60;

const RootStyle = styled('div')({
    display: 'flex',
    minHeight: '100%',
    overflow: 'hidden'
});

const OIStyle = styled('div')(({ theme }) => ({
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

export default function OILayout() {
    const isOffset = useOffSetTop(70);
    const theme = useTheme();
    const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('lg'));
    const [hideMenu, setHideMenu] = useState(false);

    return (
        <>
            <RootStyle>
                <OINavbar hideMenu={hideMenu} setHideMenu={setHideMenu} />
                <OIStyle
                    sx={{
                        transition: theme.transitions.create('margin', {
                            duration: theme.transitions.duration.complex
                        }),
                    }}
                >
                    <Outlet />
                </OIStyle>
            </RootStyle>
        </>
    );
}
