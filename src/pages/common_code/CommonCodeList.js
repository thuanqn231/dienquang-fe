/* eslint-disable react-hooks/exhaustive-deps */
import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import { makeStyles } from '@material-ui/styles';
import { Icon } from '@iconify/react';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
  Tooltip,
  IconButton
} from '@material-ui/core';
import { useDemoData } from '@material-ui/x-grid-data-generator';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'notistack5';
import { useEffect, useRef, useState } from 'react';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { MIconButton } from '../../components/@material-extend';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { query } from '../../core/api';
import { Dropdown, DthButtonPermission } from '../../core/wrapper';
import useSettings from '../../hooks/useSettings';
import useLocales from '../../hooks/useLocales';
import useAuth from '../../hooks/useAuth';
// redux
import { useDispatch, useSelector } from '../../redux/store';
// utils
import { fDateTime } from '../../utils/formatTime';
import { getPageName } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';
import CommonCodeDelete from './CommonCodeDelete';
import CommonCodeForm from './CommonCodeForm';
import CommonCodeModify from './CommonCodeModify';
import GroupCodeDelete from './GroupCodeDelete';
import GroupCodeForm from './GroupCodeForm';
import GroupCodeModify from './GroupCodeModify';

// ----------------------------------------------------------------------
const pageCode = 'menu.system.systemConfiguration.parametter.commonCode.commonCode';
const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function OperationHierarchyList() {
  const classes = useStyles();
  const { user } = useAuth();
  const operationHierachyID = useSelector((state) => state.common.operationHierachy);
  const { themeAgGridClass } = useSettings();
  const [gridApi, setGridApi] = useState(null);
  const [columnApi, setColumnApi] = useState(null);
  const [sortChange, setSortChange] = useState({
    columnSort: 'dteLogI',
    sort: 'Desc'
  });
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedCommonId, setSelectedCommonId] = useState(null);
  const [stateValue, setStateValue] = useState({
    code: null,
    name: null
  });
  const GroupCodeFormref = useRef(null);
  const GroupCodeModifyref = useRef(null);
  const CommonCodeDeleteref = useRef(null);
  const GroupCodeDeleteref = useRef(null);
  const CommonCodeFormref = useRef(null);
  const CommonCodeModifyref = useRef(null);
  const { translate } = useLocales();

  const { data } = useDemoData({
    dataSet: 'Commodity',
    rowLength: 1000,
    maxColumns: 6
  });
  const dispatch = useDispatch();
  const initialState = {
    groupId: '',
    groupName: '',
    code: '',
    name: '',
    rank: '',
    state: 'RUNNING',
    stateCommon: 'RUNNING'
  };
  const [searchParams, setSearchParams] = useState({
    groupId: '',
    groupName: '',
    code: '',
    name: '',
    rank: '',
    state: 'RUNNING',
    stateCommon: 'RUNNING'
  });
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [rowData, setRowData] = useState([]);
  const [commonCodeList, setCommonCodeList] = useState([]);
  const [hideFilters, setHideFilters] = useState(false);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const actionTooltip = hideFilters ? 'Show' : 'Hide';

  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 1) {
      setSelectedId(event.api.getSelectedNodes()[0].data.code.toString());
      setStateValue((preValue) => ({
        ...preValue,
        code: event.api.getSelectedNodes()[0].data.code,
        name: event.api.getSelectedNodes()[0].data.name
      }));
    } else {
      setSelectedId(null);
      setStateValue((preValue) => ({
        ...preValue,
        code: null,
        name: null
      }));
    }
  };
  const onCommonCodeSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 1) {
      setSelectedCommonId(event.api.getSelectedNodes()[0].data.code.toString());
    } else {
      setSelectedCommonId(null);
    }
  };

  useEffect(() => {
    if (stateValue.code) {
      getListCommonCode();
    } else {
      setCommonCodeList(null);
    }
  }, [stateValue]);

  const onInquiry = () => {
    onLoadData();
    if (stateValue.code) {
      getListCommonCode();
    }
  };
  const handleChangeSearchConfig = (event) => {
    setSearchParams(() => ({
      ...searchParams,
      [event.target.name]: `${event.target.value}`
    }));
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setColumnApi(params.columnApi);
  };

  useEffect(() => {
    if (gridApi) {
      onLoadData();
    }
  }, [gridApi]);

  useEffect(() => {
    if (gridApi) {
      onLoadData();
    }
  }, [sortChange]);

  useEffect(() => {
    if (gridApi) {
      onLoadData();
    }
  }, [operationHierachyID]);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      const newRows = await loadServerRows(page, data);

      if (!active) {
        return;
      }
      setRows(newRows);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [page, data]);

  function loadServerRows(page, data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data.rows.slice(page * 25, (page + 1) * 25));
      }, Math.random() * 500 + 100); // simulate network latency
    });
  }

  const onLoadData = () => {
    getListGroupCode();
  };


  const getListGroupCode = async () => {
    const updateData = (data) => {
      setRowData(data);
    };
    const groupParams = {
      code: searchParams.groupId,
      name: searchParams.groupName,
      rank: searchParams.rank,
      groupId: 'D000000',
    };
    if (searchParams.state) {
      groupParams.state = searchParams.state
    }
    query({
      url: '/v1/common_code/search',
      featureCode: 'user.create',
      params: {
        commonCode: JSON.stringify(groupParams),
        paging: JSON.stringify({
          page: 0,
          size: 1
        })
      }
    })
      .then((res) => {
        updateData(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const getListCommonCode = async () => {
    const updateData = (data) => {
      setCommonCodeList(data);
    };
    const CommonParams = {
      code: searchParams.code,
      name: searchParams.name,
      rank: searchParams.rank,
      groupId: stateValue.code,
    };
    if (searchParams.stateCommon) {
      CommonParams.state = CommonParams.stateCommon
    }
    query({
      url: '/v1/common_code/search',
      featureCode: 'user.create',
      params: {
        commonCode: JSON.stringify(CommonParams),
        paging: JSON.stringify({
          page: 0,
          size: 1
        })
      }
    })
      .then((res) => {
        updateData(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const onClickAdd = () => {
    GroupCodeFormref.current.openDialogReference();
  };

  const onClickAddCommonCode = () => {
    CommonCodeFormref.current.openDialogReference();
  };

  const onReload = () => {
    onLoadData();
    setSelectedId(null);
    setStateValue((preValue) => ({
      ...preValue,
      code: null,
      name: null
    }));
  };
  const onReloadCommonCode = () => {
    getListCommonCode();
    setSelectedCommonId(null);
  };
  const onClickModify = () => {
    if (selectedId !== null) {
      GroupCodeModifyref.current.openDialogReference();
    } else {
      enqueueSnackbar(translate(`message.please_select_row_data!`), {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    }
  };
  const onClickModifyCommonCode = () => {
    if (selectedCommonId !== null) {
      CommonCodeModifyref.current.openDialogReference();
    } else {
      enqueueSnackbar(translate(`message.please_select_row_data!`), {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    }
  };

  const onClickDelete = () => {
    if (selectedId !== null) {
      GroupCodeDeleteref.current.openDialogReference();
    } else {
      enqueueSnackbar(translate(`message.please_select_row_data!`), {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    }
  };

  const onClickDeleteCommonCode = () => {
    if (selectedId !== null) {
      CommonCodeDeleteref.current.openDialogReference();
    } else {
      enqueueSnackbar(translate(`message.please_select_row_data!`), {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    }
  };

  const handleParseSelectedTree = (selected) => {
    setParseSelectedTree(selected);
  };

  const resetSearchParam = () => {
    setSearchParams(initialState);
  };

  const ACCORDIONS = [
    {
      heading: `Organization`,
      defaultExpanded: true,
      detail: <OrganizationTree parseSelected={handleParseSelectedTree} />,
      maxHeight: '30vh'
    },
    {
      value: `panel3`,
      heading: `Search`,
      isClearFilter: true,
      defaultExpanded: true,
      detail: (
        <>
          <Typography variant="h5">{translate(`typo.group_info`)}</Typography>
          <TextField
            size="small"
            fullWidth
            id="groupId"
            name="groupId"
            label="Group Code"
            value={searchParams.groupId}
            onChange={handleChangeSearchConfig}
            sx={{ mt: 1, mb: 1 }}
          />

          <TextField
            size="small"
            fullWidth
            id="groupName"
            name="groupName"
            label="Group Name"
            value={searchParams.groupName}
            onChange={handleChangeSearchConfig}
            sx={{ mt: 1, mb: 1 }}
          />

          <Dropdown
            id="state"
            name="state"
            label="Use(Y/N)"
            sx={{ mt: 1, mb: 1 }}
            onChange={handleChangeSearchConfig}
            options={[
              { value: 'RUNNING', label: 'Y' },
              { value: 'HIDDEN', label: 'N' }
            ]}
            value={searchParams.state}
            size="small"
          />

          <Typography variant="h5">{translate(`typo.common_info`)}</Typography>
          <TextField
            size="small"
            fullWidth
            id="code"
            name="code"
            label="Common Code"
            value={searchParams.code}
            onChange={handleChangeSearchConfig}
            sx={{ mt: 1, mb: 1 }}
          />

          <TextField
            size="small"
            fullWidth
            id="name"
            name="name"
            label="Common Name"
            value={searchParams.name}
            onChange={handleChangeSearchConfig}
            sx={{ mt: 1, mb: 1 }}
          />

          <Dropdown
            id="stateCommon"
            name="stateCommon"
            label="Use(Y/N)"
            sx={{ mt: 1, mb: 1 }}
            onChange={handleChangeSearchConfig}
            options={[
              { value: 'RUNNING', label: 'Y' },
              { value: 'HIDDEN', label: 'N' }
            ]}
            value={searchParams.stateCommon}
            size="small"
          />
        </>
      )
    }
  ];

  const formartState = ({ value }) => {
    if (value === 'RUNNING') {
      return 'Y';
    }
    return 'N';
  };

  const dateTimeFormatter = ({ value }) => fDateTime(value);

  return (
    <Page title={getPageName(pageCode)}>
      <Container sx={{ px: `0px !important` }} maxWidth={false}>
        <Grid container spacing={0} sx={{ px: 0, height: `calc(100vh - 254px)` }}>
          {!hideFilters && (
            <Grid item xs={12} md={2}>
              <Card sx={{ py: 1, px: 1, borderRadius: '0px', height: { md: `calc(100vh - 190px)` }, overflow: 'auto' }}>
                <Box sx={{ mb: 5 }}>
                  {ACCORDIONS.map((accordion, index) => (
                    <Accordion
                      key={accordion.value}
                      disabled={index === 2}
                      defaultExpanded={accordion.defaultExpanded}
                      sx={{
                        ...(accordion.maxHeight && {
                          maxHeight: accordion.maxHeight,
                          overflowY: 'auto'
                        })
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<Icon icon={arrowIosDownwardFill} width={20} height={20} />}
                        classes={{ content: classes.customAccordionSummary }}
                      >
                        <Typography variant="subtitle1">{accordion.heading}</Typography>
                        {accordion.isClearFilter && (
                          <>
                            {' '}
                            <Button onClick={stopPropagation}>
                              <a href="#" onClick={resetSearchParam}>
                                {translate(`button.clearFilter`)}
                              </a>
                            </Button>
                          </>
                        )}
                      </AccordionSummary>
                      <AccordionDetails>{accordion.detail}</AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </Card>
              <Card sx={{ p: 0, height: '36px', borderRadius: '0px' }}>
                <Button onClick={() => onInquiry()} variant="contained" sx={{ width: '100%', height: '100%' }}>
                  {translate(`button.inquiry`)}
                </Button>
              </Card>
            </Grid>
          )}
          <Grid item xs={12} md={hideFilters ? 12 : 10}>
            <Card sx={{ pr: 1, borderRadius: '0px', height: '35px' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 0 }}>
                <Tooltip title={`${actionTooltip} Filters`}>
                  <IconButton onClick={handleHideFilters}>{hideFilters ? <LastPage /> : <FirstPage />}</IconButton>
                </Tooltip>
                <HeaderBreadcrumbs activeLast pageCode={pageCode} />
              </Stack>
            </Card>

            <Grid container spacing={0} sx={{ px: 0, height: `calc(100vh - 185px)` }}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    p: 1,
                    borderRadius: '0px',
                    display: 'row',
                    height: '100%',
                    minHeight: { xs: `calc((80vh - 100px))` }
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="h5"> </Typography>
                    <Stack
                      direction="row"
                      justifyContent="right"
                      display="flex"
                      alignItems="center"
                      sx={{ marginTop: `0 !important`, marginBottom: `1 !important` }}
                    >
                      <DthButtonPermission
                        sx={{ marginLeft: 1 }}
                        variant="contained"
                        onClick={onClickAdd}
                        size="small"
                        label="Register"
                        pageCode={pageCode}
                        widgetCode={pageCode}
                        funcType="CREATE"
                      />
                      <DthButtonPermission
                        sx={{ marginLeft: 1 }}
                        variant="contained"
                        onClick={onClickModify}
                        size="small"
                        label="Modify"
                        pageCode={pageCode}
                        widgetCode={pageCode}
                        funcType="UPDATE"
                        disabled={!selectedId}
                      />
                      <DthButtonPermission
                        sx={{ marginLeft: 1 }}
                        variant="contained"
                        onClick={onClickDelete}
                        size="small"
                        label="Delete"
                        pageCode={pageCode}
                        widgetCode={pageCode}
                        funcType="DELETE"
                        disabled={!selectedId}
                      />
                    </Stack>
                    <GroupCodeForm ref={GroupCodeFormref} onReload={onReload} />
                    <GroupCodeModify ref={GroupCodeModifyref} SELECTEDID={selectedId} onReload={onReload} />
                    <GroupCodeDelete ref={GroupCodeDeleteref} SELECTEDID={selectedId} onReload={onReload} />

                    <CommonCodeForm
                      ref={CommonCodeFormref}
                      GROUPID={stateValue.code}
                      GROUPNAME={stateValue.name}
                      onReload={onReloadCommonCode}
                    />
                    <CommonCodeModify
                      ref={CommonCodeModifyref}
                      SELECTEDID={selectedCommonId}
                      onReload={onReloadCommonCode}
                    />
                    <CommonCodeDelete
                      ref={CommonCodeDeleteref}
                      SELECTEDID={selectedCommonId}
                      onReload={onReloadCommonCode}
                    />
                  </Stack>
                  <div className={themeAgGridClass} style={{ height: '95%', width: '100%', overflowY: 'auto' }}>
                    <AgGridReact
                      defaultColDef={{
                        filter: true,
                        flex: 1,
                        sortable: true,
                        minWidth: 100,
                        resizable: true
                      }}
                      rowData={rowData}
                      onGridReady={onGridReady}
                      rowSelection="single"
                      // onRowSelected={onRowSelected}
                      onSelectionChanged={onSelectionChanged}
                    >
                      <AgGridColumn
                        filter={false}
                        sort={false}
                        checkboxSelection
                        flex
                        maxWidth="40"
                        cellClass="vertical-middle"
                      />
                      <AgGridColumn
                        field="row_index"
                        headerName="No."
                        valueGetter="node.rowIndex + 1"
                        flex
                        initialWidth="80"
                        cellClass="vertical-middle"
                        headerClass="vertical-middle"
                      />
                      <AgGridColumn
                        field="code"
                        headerName="Group Code"
                        cellClass="vertical-middle ag-left-aligned-cell"
                      />
                      <AgGridColumn
                        field="name"
                        headerName="Group Name"
                        cellClass="vertical-middle ag-left-aligned-cell"
                      />
                      <AgGridColumn
                        field="usrLogI"
                        headerName="Create By"
                        cellClass="vertical-middle ag-left-aligned-cell"
                      />
                      <AgGridColumn
                        field="dteLogI"
                        headerName="Create Date"
                        cellClass="vertical-middle"
                        cellRendererFramework={dateTimeFormatter}
                      />
                      <AgGridColumn
                        field="usrLogU"
                        headerName="Change By"
                        cellClass="vertical-middle ag-left-aligned-cell"
                      />
                      <AgGridColumn
                        field="dteLogU"
                        headerName="Change Date"
                        cellClass="vertical-middle"
                        cellRendererFramework={dateTimeFormatter}
                      />
                    </AgGridReact>
                  </div>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Card
                  sx={{
                    p: 1,
                    borderRadius: '0px',
                    display: 'row',
                    height: '100%',
                    width: 'calc((100% ))',
                    minHeight: { xs: `calc((80vh - 100px)/2)` }
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="h5"> </Typography>
                    <Stack
                      direction="row"
                      justifyContent="right"
                      display="flex"
                      alignItems="center"
                      sx={{ marginTop: `0 !important`, marginBottom: `1 !important` }}
                    >
                      <DthButtonPermission
                        sx={{ marginLeft: 1 }}
                        variant="contained"
                        onClick={onClickAddCommonCode}
                        size="small"
                        label="Register"
                        disabled={!selectedId}
                        pageCode={pageCode}
                        widgetCode={pageCode}
                        funcType="CREATE"
                      />
                      <DthButtonPermission
                        sx={{ marginLeft: 1 }}
                        variant="contained"
                        onClick={onClickModifyCommonCode}
                        size="small"
                        label="Modify"
                        pageCode={pageCode}
                        widgetCode={pageCode}
                        funcType="UPDATE"
                        disabled={!selectedCommonId}
                      />
                      <DthButtonPermission
                        sx={{ marginLeft: 1 }}
                        variant="contained"
                        onClick={onClickDeleteCommonCode}
                        size="small"
                        label="Delete"
                        pageCode={pageCode}
                        widgetCode={pageCode}
                        funcType="DELETE"
                        disabled={!selectedCommonId}
                      />
                    </Stack>
                  </Stack>
                  <div className={themeAgGridClass} style={{ height: '95%', width: '100%' }}>
                    <AgGridReact
                      defaultColDef={{
                        filter: true,
                        flex: 1,
                        sortable: true,
                        minWidth: 150,
                        resizable: true
                      }}
                      rowData={commonCodeList}
                      onGridReady={onGridReady}
                      rowSelection="single"
                      // onRowSelected={onRowSelected}
                      onSelectionChanged={onCommonCodeSelectionChanged}
                    >
                      <AgGridColumn
                        filter={false}
                        sort={false}
                        checkboxSelection
                        flex
                        maxWidth="30"
                        cellClass="vertical-middle"
                      />
                      <AgGridColumn
                        field="row_index"
                        headerName="No."
                        valueGetter="node.rowIndex + 1"
                        flex
                        maxWidth="80"
                        cellClass="vertical-middle"
                        headerClass="vertical-middle"
                      />
                      <AgGridColumn
                        field="code"
                        headerName="Common Code"
                        initialWidth="150"
                        cellClass="vertical-middle ag-left-aligned-cell"
                      />
                      <AgGridColumn
                        field="name"
                        headerName="Common Name"
                        cellClass="vertical-middle ag-left-aligned-cell"
                      />
                      <AgGridColumn
                        field="state"
                        headerName="Use (Y/N)"
                        cellClass="vertical-middle"
                        cellRendererFramework={formartState}
                      />
                      <AgGridColumn
                        field="description"
                        headerName="Description"
                        cellClass="vertical-middle ag-left-aligned-cell"
                      />
                      <AgGridColumn
                        field="remark"
                        headerName="Remark"
                        cellClass="vertical-middle ag-left-aligned-cell"
                      />
                      <AgGridColumn
                        field="usrLogI"
                        headerName="Create By"
                        cellClass="vertical-middle ag-left-aligned-cell"
                      />
                      <AgGridColumn
                        field="dteLogI"
                        headerName="Create Date"
                        cellClass="vertical-middle"
                        cellRendererFramework={dateTimeFormatter}
                      />
                      <AgGridColumn
                        field="usrLogU"
                        headerName="Change By"
                        cellClass="vertical-middle ag-left-aligned-cell"
                      />
                      <AgGridColumn
                        field="dteLogU"
                        headerName="Change Date"
                        cellClass="vertical-middle"
                        cellRendererFramework={dateTimeFormatter}
                      />
                    </AgGridReact>
                  </div>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
