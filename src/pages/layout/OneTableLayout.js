
import arrowIosDownwardOutline from '@iconify/icons-eva/arrow-ios-downward-outline';
import arrowIosUpwardOutline from '@iconify/icons-eva/arrow-ios-upward-outline';
import { Icon } from '@iconify/react';
import { Box, Button, Card, Container, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Tooltip, Typography } from '@material-ui/core';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import { isEmpty, isUndefined } from 'lodash-es';
import PropTypes from 'prop-types';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Resize, ResizeHorizon, ResizeVertical } from "react-resize-layout";
import { ActionButtons, SearchConditions } from '.';
import { MIconButton } from '../../components/@material-extend';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import AgGrid from '../../core/wrapper/AgGrid';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import useSettings from '../../hooks/useSettings';
import { setSelectedWidget, updateSearchParams } from '../../redux/slices/page';
import { useDispatch, useSelector } from '../../redux/store';
import { clearGridData, setGridDataSource } from '../../utils/gridUtils';
import { getGridConfig, getPageName, parseOrgSearchAll, parseOrgSearchFactory } from '../../utils/pageConfig';


const OneTableLayout = forwardRef((props, ref) => {
    const { pageCode, isRenderAllOrgChart, gridConfigs, initSearchParams, actionButtons, onRowSelected } = props;
    const { selectedWidget, searchParams } = useSelector((state) => state.page);
    const { themeAgGridClass } = useSettings();
    const dispatch = useDispatch();
    const { translate, currentLang } = useLocales();
    const { userGridConfig, funcPermission, user } = useAuth();
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [columns, setColumns] = useState(null);
    const [hideFilters, setHideFilters] = useState(false);
    const [actionTooltip, setActionTooltip] = useState('Hide');
    const [isChangedTableConfig, setChangedTableConfig] = useState(false);
    const [pageSelectedWidget, setPageSelectedWidget] = useState(selectedWidget[pageCode]);
    const [listOfWidgets, setListOfWidgets] = useState([]);
    const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
    const [isOpenOrgTree, setOpenOrgTree] = useState(true);
    const [isOpenWidget, setOpenWidget] = useState(true);
    const [isOpenSearch, setOpenSearch] = useState(true);
    const [widgetHeight, setWidgetHeight] = useState('fit-content');
    const [orgTreeHeight, setOrgTreeHeight] = useState('fit-content');
    const [selectedWidgetCode, setSelectedWidgetCode] = useState('');
    const [tableCode, setTableCode] = useState();
    const [searchUrl, setSearchUrl] = useState();

    useImperativeHandle(ref, () => ({
        async onLoadData() {
            await onLoadData();
        }
    }));

    useEffect(() => {
        const currentPage = funcPermission.filter((permission) => permission.code === pageCode);
        if (!isEmpty(currentPage) && !isEmpty(currentPage[0].widgets)) {
            const activeWidgets = currentPage[0].widgets.filter((widget) => widget.permissions.includes('READ'));
            setListOfWidgets(activeWidgets);
            if (!isEmpty(activeWidgets) && isUndefined(pageSelectedWidget)) {
                dispatch(
                    setSelectedWidget(
                        {
                            ...selectedWidget,
                            [pageCode]:
                            {
                                widgetCode: activeWidgets[0].code,
                                widgetName: activeWidgets[0].name
                            }
                        }
                    )
                );
            }
        }
    }, [funcPermission]);

    useEffect(() => {
        if (tableCode) {
            const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
            tableConfigs.forEach((column) => {
                column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
            });
            setColumns(tableConfigs);
        }
    }, [userGridConfig, tableCode]);

    useEffect(() => {
        if (!isEmpty(selectedWidgetCode)) {
            setTableCode(gridConfigs[selectedWidgetCode].tableCode);
            setSearchUrl(gridConfigs[selectedWidgetCode].searchUrl);
        }
    }, [selectedWidgetCode]);

    useEffect(() => {
        if (gridApi && searchUrl) {
            onLoadData();
        }
    }, [gridApi, searchUrl]);

    useEffect(() => {
        let _orgTreeHeight = 'fit-content';
        if (isRenderAllOrgChart) {
            _orgTreeHeight = '35%'
        }
        setOrgTreeHeight(_orgTreeHeight);
    }, [isRenderAllOrgChart]);

    useEffect(() => {
        setSelectedWidgetCode(pageSelectedWidget?.widgetCode)
    }, [pageSelectedWidget]);

    useEffect(() => {
        let _widgetHeight = 'fit-content';
        if (listOfWidgets.length > 3) {
            _widgetHeight = '20%'
        }
        setWidgetHeight(_widgetHeight);
    }, [listOfWidgets]);

    useEffect(() => {
        if (!isUndefined(initSearchParams[selectedWidgetCode])) {
            const currentWidgetSearchParams = {};
            initSearchParams[selectedWidgetCode].forEach((search) => {
                if (search.type === 'checkboxs') {
                    search.list.forEach((checkbox) => {
                        let value = checkbox.defaultValue;
                        if (!isUndefined(searchParams[selectedWidgetCode]) && !isUndefined(searchParams[selectedWidgetCode][checkbox.id])) {
                            value = searchParams[selectedWidgetCode][checkbox.id];
                        }
                        currentWidgetSearchParams[checkbox.id] = value;
                    })
                } else {
                    let value = search.defaultValue;
                    if (!isUndefined(searchParams[selectedWidgetCode]) && !isUndefined(searchParams[selectedWidgetCode][search.id])) {
                        value = searchParams[selectedWidgetCode][search.id];
                    }
                    currentWidgetSearchParams[search.id] = value;
                }
            });
            dispatch(updateSearchParams({
                ...searchParams,
                [selectedWidgetCode]: currentWidgetSearchParams
            }));
        }
    }, [initSearchParams, selectedWidgetCode]);

    useEffect(() => {
        if (columns) {
            const tableConfigs = [...columns];
            tableConfigs.forEach((column) => {
                column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
            });
            setColumns(tableConfigs);
        }
    }, [currentLang]);

    useEffect(() => {
        setPageSelectedWidget(selectedWidget[pageCode]);
    }, [selectedWidget]);

    useEffect(() => {
        setActionTooltip(hideFilters ? 'Show' : 'Hide');
    }, [hideFilters]);

    const handleHideFilters = () => {
        setHideFilters(!hideFilters);
    };

    const resetSearchParam = () => {
        if (!isUndefined(initSearchParams[selectedWidgetCode])) {
            const currentWidgetSearchParams = {};
            initSearchParams[selectedWidgetCode].forEach((search) => {
                currentWidgetSearchParams[search.id] = search.defaultValue;
            });
            dispatch(updateSearchParams({
                ...searchParams,
                [selectedWidgetCode]: currentWidgetSearchParams
            }));
        }
    }

    const handleChangeOpenOrgTree = () => {
        setOpenOrgTree(!isOpenOrgTree);
    };

    const handleChangeOpenWidget = () => {
        setOpenWidget(!isOpenWidget);
    };

    const handleChangeOpenSearch = () => {
        setOpenSearch(!isOpenSearch);
    };

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        params.api.addGlobalListener((type, event) => {
            if (['columnPinned', 'columnMoved', 'columnVisible'].indexOf(type) >= 0) {
                handleChangeTableConfig(true);
            }
        });
    };

    const onSelectionChanged = async (event) => {
        if (onRowSelected instanceof Function) {
            onRowSelected(event.api.getSelectedNodes());
        }
    }

    const clearSelectionChanged = async (event) => {
        if (onRowSelected instanceof Function) {
            onRowSelected([]);
        }
    }

    const onInquiry = () => {
        onLoadData();
    };

    const onLoadData = () => {
        clearSelectionChanged();
        const requestParams = {};
        buildSearchParams(requestParams);
        try {
            setGridDataSource(gridApi, searchUrl, requestParams)
        } catch (error) {
            clearGridData(gridApi);
            console.error(error);
        }
    };

    const buildSearchParams = (requestParams) => {
        if (isRenderAllOrgChart) {
            parseOrgSearchAll(requestParams, parseSelectedTree);
        } else {
            parseOrgSearchFactory(requestParams, parseSelectedTree);
        }
        if(!isUndefined(initSearchParams[selectedWidgetCode]) && !isEmpty(initSearchParams[selectedWidgetCode])) {
            initSearchParams[selectedWidgetCode].forEach((item) => {
                if (item.type === 'checkboxs') {
                    item.list.forEach((checkbox) => {
                        if (!isUndefined(searchParams[selectedWidgetCode]) && !isUndefined(searchParams[selectedWidgetCode][checkbox.id]) && searchParams[selectedWidgetCode][checkbox.id]) {
                            requestParams[checkbox.id] = searchParams[selectedWidgetCode][checkbox.id];
                        }
                    })
                }
                if (item.type !== 'checkboxs' && !isUndefined(searchParams[selectedWidgetCode]) && !isUndefined(searchParams[selectedWidgetCode][item.id]) && !isEmpty(searchParams[selectedWidgetCode][item.id])) {
                    requestParams[item.id] = searchParams[selectedWidgetCode][item.id];
                }
            });
        }
    }

    const handleParseSelectedTree = (selected) => {
        setParseSelectedTree(selected);
    };

    const onClickWidget = (widgetCode, widgetName) => {
        dispatch(
            setSelectedWidget(
                {
                    ...selectedWidget,
                    [pageCode]:
                    {
                        widgetCode,
                        widgetName
                    }
                }
            )
        );
    };

    const handleChangeTableConfig = (status) => {
        setChangedTableConfig(status);
    };

    return (
        <Page title={getPageName(pageCode)}>
            <Container sx={{ px: `0px !important` }} maxWidth={false}>
                <Card sx={{ py: 1, px: 1, borderRadius: '0px', height: { md: `calc(100vh - 150px)` }, overflow: 'auto' }}>
                    <Resize handleWidth='5px'>
                        <ResizeHorizon
                            width={hideFilters ? '0' : "14%"}
                            className="containerLeft"
                        >
                            <Card sx={{ py: 1, px: 1, borderRadius: '0px', height: { md: `calc(100% - 36px)` } }}>
                                <Box>
                                    <Resize handleWidth='5px'>
                                        <ResizeVertical height={isOpenOrgTree ? orgTreeHeight : "5%"} minHeight='10%' className="containerCenterTop">
                                            <Card sx={{ height: '100%' }}>
                                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 0, pr: 1, pl: 1 }}>
                                                    <Typography variant="subtitle1">Organization</Typography>
                                                    <MIconButton onClick={handleChangeOpenOrgTree}>
                                                        <Icon icon={isOpenOrgTree ? arrowIosUpwardOutline : arrowIosDownwardOutline} width={20} height={20} />
                                                    </MIconButton>
                                                </Stack>
                                                {
                                                    isOpenOrgTree && (
                                                        <Box sx={{ height: '85%', overflow: 'auto', px: 1 }}>
                                                            <OrganizationTree
                                                                renderAll={isRenderAllOrgChart}
                                                                parseSelected={handleParseSelectedTree}
                                                            />
                                                        </Box>
                                                    )
                                                }
                                            </Card>
                                        </ResizeVertical>
                                        <ResizeVertical height={isOpenWidget ? widgetHeight : "5%"} minHeight='10%' className="containerCenterBottom">
                                            <Card sx={{ height: '100%' }}>
                                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 0, pr: 1, pl: 1 }}>
                                                    <Typography variant="subtitle1">Widgets</Typography>
                                                    <MIconButton onClick={handleChangeOpenWidget}>
                                                        <Icon icon={isOpenWidget ? arrowIosUpwardOutline : arrowIosDownwardOutline} width={20} height={20} />
                                                    </MIconButton>
                                                </Stack>
                                                {
                                                    isOpenWidget && (
                                                        <Box sx={{ height: '75%', overflow: 'auto', px: 1 }}>
                                                            <List>
                                                                {listOfWidgets.map((element) => {
                                                                    const isActive = selectedWidgetCode === element.code;
                                                                    return (
                                                                        <ListItem key={element.code}>
                                                                            <ListItemButton
                                                                                sx={{
                                                                                    px: 1,
                                                                                    height: 48,
                                                                                    typography: 'body2',
                                                                                    color: 'text.secondary',
                                                                                    textTransform: 'capitalize',
                                                                                    ...(isActive && {
                                                                                        color: 'text.primary',
                                                                                        fontWeight: 'fontWeightMedium',
                                                                                        bgcolor: 'action.selected'
                                                                                    })
                                                                                }}
                                                                                onClick={() => onClickWidget(element.code, element.name)}
                                                                            >
                                                                                <ListItemText primary={element.name} />
                                                                            </ListItemButton>
                                                                        </ListItem>
                                                                    );
                                                                })}
                                                            </List>
                                                        </Box>
                                                    )
                                                }
                                            </Card>
                                        </ResizeVertical>
                                        <ResizeVertical height={isOpenSearch ? "45%" : "5%"} minHeight='10%' className="containerCenterBottom">
                                            <Card sx={{ height: '100%' }}>
                                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 0, pr: 1, pl: 1 }}>
                                                    <Typography variant="subtitle1">Search</Typography>

                                                    <Stack direction="row" alignItems="right" sx={{ py: 0, px: 0 }}>
                                                        <Button>
                                                            <a href="#" onClick={resetSearchParam}>
                                                                {translate(`button.clearFilter`)}
                                                            </a>
                                                        </Button>
                                                        <MIconButton onClick={handleChangeOpenSearch}>
                                                            <Icon icon={isOpenSearch ? arrowIosUpwardOutline : arrowIosDownwardOutline} width={20} height={20} />
                                                        </MIconButton>
                                                    </Stack>
                                                </Stack>
                                                {
                                                    isOpenSearch && (
                                                        <Box sx={{ height: '90%', overflow: 'auto', px: 1 }}>
                                                            <SearchConditions initSearchParams={initSearchParams} selectedWidgetCode={selectedWidgetCode} />
                                                        </Box>
                                                    )
                                                }
                                            </Card>
                                        </ResizeVertical>
                                    </Resize>
                                </Box>
                            </Card>
                            <Card sx={{ p: 0, height: '36px', borderRadius: '0px' }}>
                                <Button variant="contained" sx={{ width: '100%', height: '100%' }} onClick={onInquiry}>
                                    Inquiry
                                </Button>
                            </Card>
                        </ResizeHorizon>
                        <ResizeHorizon
                            width="86%"
                            minWidth="86%"
                            className="containerCenter"
                        >
                            <Card sx={{ pr: 1, borderRadius: '0px', height: '60px' }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 0 }}>
                                    <Tooltip title={`${actionTooltip} Filters`}>
                                        <IconButton onClick={handleHideFilters}>{hideFilters ? <LastPage /> : <FirstPage />}</IconButton>
                                    </Tooltip>

                                    <HeaderBreadcrumbs
                                        activeLast
                                        pageCode={pageCode}
                                        action={
                                            <ActionButtons
                                                gridApi={gridApi}
                                                pageCode={pageCode}
                                                tableCode={tableCode}
                                                actionButtons={actionButtons}
                                                selectedWidgetCode={selectedWidgetCode}
                                                isChangedTableConfig={isChangedTableConfig}
                                                handleChangeTableConfig={handleChangeTableConfig}
                                            />
                                        }
                                    />
                                </Stack>
                            </Card>
                            <Card
                                sx={{
                                    p: 1,
                                    borderRadius: '0px',
                                    display: 'row',
                                    height: 'calc(100% - 60px)',
                                    minHeight: { xs: `calc((80vh - 100px))` }
                                }}
                            >
                                <AgGrid
                                    columns={columns}
                                    pagination
                                    className={themeAgGridClass}
                                    onGridReady={onGridReady}
                                    onSelectionChanged={onSelectionChanged}
                                    rowSelection="single"
                                    width="100%"
                                    height="100%"
                                />
                            </Card>
                        </ResizeHorizon>
                    </Resize>
                </Card>
            </Container>
        </Page >
    )
})
export default OneTableLayout;

OneTableLayout.propTypes = {
    pageCode: PropTypes.string,
    isRenderAllOrgChart: PropTypes.bool,
    gridConfigs: PropTypes.object,
    initSearchParams: PropTypes.object,
    actionButtons: PropTypes.object,
    onRowSelected: PropTypes.func
};