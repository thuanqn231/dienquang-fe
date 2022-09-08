import React, { useState } from "react";
import PropTypes from "prop-types";
// material
import { Card, CardHeader, Container, Typography, Box, AppBar, Tabs, Tab } from '@material-ui/core';
import { makeStyles } from "@material-ui/styles";
// components
import Page from '../../components/Page';
import useSettings from '../../hooks/useSettings';
import { getPageName } from '../../utils/pageConfig';
import ComprehensiveStatus from './comprehensive-status/ComprehensiveStatus';

// ----------------------------------------------------------------------

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-auto-tabpanel-${index}`}
            aria-labelledby={`scrollable-auto-tab-${index}`}
            {...other}
        >
            <Box p={1}>{children}</Box>
        </Typography>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired
};

function a11yProps(index) {
    return {
        id: `scrollable-auto-tab-${index}`,
        "aria-controls": `scrollable-auto-tabpanel-${index}`
    };
}

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
        width: "100%",
        backgroundColor: theme.palette.background.paper
    },
    tab: {
        '& .MuiBox-root': {
            padding: theme.spacing(0.1, 0, 0, 0),
        },
    },
    default_tabStyle: {
        color: 'white',
        backgroundColor: theme.palette.primary.dark,
        marginRight: `${theme.spacing(0.5)} !important`
    },
    active_tabStyle: {
        backgroundColor: theme.palette.success.main,
        marginRight: `${theme.spacing(0.5)} !important`
    },
    default_tabStyleLast: {
        color: 'white',
        backgroundColor: theme.palette.primary.dark,
    },
    active_tabStyleLast: {
        backgroundColor: theme.palette.success.main
    }
}));
const pageCode = 'menu.dashboard';
export default function Dashboard() {
    const { themeStretch } = useSettings();
    const classes = useStyles();
    const [currentTab, setCurrentTab] = useState(4);

    function handleChangeTab(event, newValue) {
        setCurrentTab(newValue);
    }

    return (
        <Page title={getPageName(pageCode)} >
            <Container maxWidth={themeStretch ? false : 'xl'}>
                <Card>
                    <AppBar position="static" color="default">
                        <Tabs
                            TabIndicatorProps={{ style: { background: 'info.main' } }}
                            value={currentTab}
                            onChange={(e, value) => handleChangeTab(e, value)}
                            variant="fullWidth"
                            aria-label="nav tabs example"
                        >
                            <Tab m={0} label="Realtime Production Status" {...a11yProps(1)} className={currentTab === 0 ? classes.active_tabStyle : classes.default_tabStyle} />
                            <Tab label="Overall Equipment Effectiveness" {...a11yProps(1)} className={currentTab === 1 ? classes.active_tabStyle : classes.default_tabStyle} />
                            <Tab label="Line Labors Status" {...a11yProps(1)} className={currentTab === 2 ? classes.active_tabStyle : classes.default_tabStyle} />
                            <Tab label="Delivery Order Monitoring" {...a11yProps(1)} className={currentTab === 3 ? classes.active_tabStyle : classes.default_tabStyle} />
                            <Tab label="Comprehensive Status" {...a11yProps(0)} className={currentTab === 4 ? classes.active_tabStyleLast : classes.default_tabStyle} />
                        </Tabs>
                    </AppBar>
                    <TabPanel value={currentTab} index={0}>
                        Realtime Production Status
                    </TabPanel>
                    <TabPanel value={currentTab} index={1}>
                        Overall Equipment Effectiveness
                    </TabPanel>
                    <TabPanel value={currentTab} index={2}>
                        Line Labors Status
                    </TabPanel>
                    <TabPanel value={currentTab} index={3}>
                        Delivery Order Monitoring
                    </TabPanel>
                    <TabPanel value={currentTab} index={4} classes={{ root: classes.tab }}>
                        <CardHeader title="Comprehensive Status" sx={{ backgroundColor: 'primary.light', textAlign: 'center', p: 1, mb: 0.1 }} />
                        <ComprehensiveStatus />
                    </TabPanel>
                </Card>
            </Container>
        </Page>
    );
}
