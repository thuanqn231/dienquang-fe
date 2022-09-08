import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import { Icon } from '@iconify/react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary, Backdrop, Box,
  Button,
  Card, CircularProgress, Container,
  DialogActions,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/styles';
import { AgGridReact } from 'ag-grid-react';
import { isEmpty, isUndefined } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
// components
import { DialogDragable } from '../../components/animate';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { mutate, query } from '../../core/api';
import { Dropdown, DthButtonPermission, DthMessage } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
// hooks
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import useSettings from '../../hooks/useSettings';
// redux
import { setSelectedWidget } from '../../redux/slices/page';
import { resetSearchParams, setRoleInfoSearchParams } from '../../redux/slices/roleManagement';
import { useDispatch, useSelector } from '../../redux/store';
// utils
import { getGridConfig, getPageName, parseOrgSearchFactory } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';
// ----------------------------------------------------------------------
import CreateAuthorizeForm from './CreateAuthorizeForm';
import RoleRegistrationForm from './RoleRegistrationForm';

const pageCode = 'menu.system.authorizationManagement.userAuthorization.roleMaster.roleMaster';
const tableCode = 'roleMaterList';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function RoleMasterList() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { themeAgGridClass } = useSettings();
  const { funcPermission, user, userGridConfig } = useAuth();
  const { searchParams } = useSelector((state) => state.roleManagement.roleInformation);
  const { selectedWidget } = useSelector((state) => state.page);
  const [rowData, setRowData] = useState(null);
  const [columns, setColumns] = useState(null);
  const [rowDataAuthor, setRowDataAuthor] = useState([]);
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [isOpenAuthModal, setOpenAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState('create');
  const [currentRole, setCurrentRole] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const pageSelectedWidget = selectedWidget[pageCode];
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [gridApiAuths, setGridApiAuths] = useState(null);
  const [gridColumnApiAuths, setGridColumnApiAuths] = useState(null);
  const [featureGroupPermission, setFeatureGroupPermission] = useState(null);
  const [isChangedAuth, setChangedAuth] = useState(false);
  const [selectedAuth, setSelectedAuth] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [allowCreateAuth, setAllowCreateAuth] = useState(false);

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
    const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
    tableConfigs.forEach((column) => {
      column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
    });
    setColumns(tableConfigs);
  }, [userGridConfig]);

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
    if (gridApiAuths) {
      gridApiAuths.sizeColumnsToFit();
    }
  }, [gridApiAuths]);
  const autoGroupColumnDef = useMemo(() => (
    {
      headerName: 'Page Name', width: 300,
      cellRendererParams: {
        suppressCount: true,
      },
    }
  ), []);

  const getDataPath = useMemo(() => (data) => data.pageName, []);

  useEffect(() => {
    const _rowData = [];
    const permissionLoop = (nodes, _rowData, currentNodes) => {
      nodes.forEach((node) => {
        const _currentNodes = [...currentNodes];
        _currentNodes.push(node.name);
        _rowData.push({
          pageName: _currentNodes,
          code: node.code,
          name: node.name,
          description: node.description,
          read: node.permissions.includes('READ'),
          create: node.permissions.includes('CREATE'),
          update: node.permissions.includes('UPDATE'),
          delete: node.permissions.includes('DELETE'),
          execute: node.permissions.includes('EXECUTE')
        });
        if (!isEmpty(node.subFeatures)) {
          permissionLoop(node.subFeatures, _rowData, _currentNodes);
        }
      })
    }
    if (featureGroupPermission) {
      // parseFeatureGroupPermission();
      const userPermission = featureGroupPermission.subFeatures;
      userPermission.forEach((node) => {
        const currentNodes = [node.name];
        _rowData.push({
          pageName: [node.name],
          code: node.code,
          name: node.name,
          description: node.description,
          read: node.permissions.includes('READ'),
          create: node.permissions.includes('CREATE'),
          update: node.permissions.includes('UPDATE'),
          delete: node.permissions.includes('DELETE'),
          execute: node.permissions.includes('EXECUTE')
        });
        if (!isEmpty(node.subFeatures)) {
          permissionLoop(node.subFeatures, _rowData, currentNodes);
        }
      });
    }
    setRowDataAuthor(_rowData)
  }, [featureGroupPermission]);

  const handleOpenDeleteModal = () => {
    setIsOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setIsOpenDeleteModal(false);
  };

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const onInquiry = () => {
    onLoadData();
  };

  const handleChangeSearchConfig = (event) => {
    const _search = {
      ...searchParams,
      [event.target.name]: `${event.target.value}`
    };
    dispatch(setRoleInfoSearchParams(_search));
  };

  const updateData = (data) => {
    setRowData(data);
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    onLoadData();
  };

  const onGridReadyAuths = (params) => {
    setGridApiAuths(params.api);
    setGridColumnApiAuths(params.columnApi);
  };

  const onLoadData = () => {
    const params = {
      code: searchParams.roleCode,
      name: searchParams.roleName,
      state: searchParams.state
    };
    parseOrgSearchFactory(params, parseSelectedTree);
    query({
      url: '/v1/profile/search',
      featureCode: 'user.create',
      params
    })
      .then((res) => {
        setSelectedRoleId(null);
        setSelectedAuth(null);
        updateData(res.data);
        setRowDataAuthor([])
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleCloseModal = () => {
    setOpenActionModal(false);
  };

  const handleOpenModal = () => {
    setOpenActionModal(true);
  };

  const handleCloseAuthModal = () => {
    setOpenAuthModal(false);
  };

  const handleOpenAuthModal = (action) => {
    setOpenAuthModal(true);
    setAuthAction(action)
  };

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedRoleId(null);
      setFeatureGroupPermission(null);
      setChangedAuth(false);
      setSelectedAuth(null);
    }
    if (rowCount === 1) {
      const roleId = event.api.getSelectedNodes()[0].data.factoryPk;
      setSelectedRoleId(roleId);
      if (roleId) {
        query({
          url: `/v1/profile/${roleId}`,
          featureCode: 'user.create'
        })
          .then((res) => {
            const { data } = res;
            setFeatureGroupPermission(data.featureGroupPermission);
            setCurrentRole({
              factoryPk: data.factoryPk,
              factory: data.pk.factoryCode,
              role_code: data.code,
              role_name: data.name,
              description: data.description,
              featureGroupPermission: data.featureGroupPermission
            });
          })
          .catch((error) => {
            console.error(error);
          });
      }
      //
    }
  };


  const onSelectionChangedAuth = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedAuth(null);
      setAllowCreateAuth(false);
    }
    if (rowCount === 1) {
      const _selectedAuth = event.api.getSelectedNodes()[0].data;
      if (_selectedAuth.pageName.length < 6) {
        setSelectedAuth(_selectedAuth);
        setAllowCreateAuth(true);
      } else {
        setSelectedAuth(null);
      }
    }
  }

  const onClickAdd = () => {
    setIsEdit(false);
    handleOpenModal();
  };

  const onClickModify = () => {
    if (!selectedRoleId) {
      DthMessage({variant:'warning', message: translate(`message.please_select_1_role`)});
    } else {
      setIsEdit(true);
      handleOpenModal();
    }
  };

  const onClickDelete = () => {
    if (!selectedRoleId) {
      DthMessage({variant:'warning', message: translate(`message.please_select_1_role`)});
    } else {
      setIsEdit(true);
      handleOpenDeleteModal();
    }
  };

  const handleDeleteRole = async () => {
    setSubmitting(true);
    await mutate({
      url: `/v1/profile/${selectedRoleId}`,
      method: 'delete',
      featureCode: 'user.delete'
    }).then((res) => {
      if (res.httpStatusCode === 200) {
        setSubmitting(false);
        DthMessage({variant:'success', message: translate(`message.role_delete_successful`)});
        handleCloseDeleteModal();
        onLoadData();
      }
    }).catch((error) => {
      setSubmitting(false);
      console.error(error);
    });
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

  const handleParseSelectedTree = (selected) => {
    setParseSelectedTree(selected);
  };

  const resetSearchParam = () => {
    dispatch(resetSearchParams());
  };

  const ACCORDIONS = [
    {
      value: `panel1`,
      heading: `Organization`,
      defaultExpanded: true,
      detail:
        <OrganizationTree
          parseSelected={handleParseSelectedTree}
        />,
      maxHeight: '35vh'
    },
    {
      value: `panel2`,
      heading: `Widget`,
      defaultExpanded: true,
      detail: (
        <List>
          {listOfWidgets.map((element) => {
            const isActive = pageSelectedWidget?.widgetCode === element.code;
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
      )
    },
    {
      value: `panel3`,
      heading: `Search`,
      defaultExpanded: true,
      isClearFilter: true,
      detail: (
        <>
          <TextField
            fullWidth
            id="roleCode"
            name="roleCode"
            label="Role Code"
            value={searchParams.roleCode}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            fullWidth
            id="roleName"
            name="roleName"
            label="Role Name"
            value={searchParams.roleName}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="state"
            name="state"
            label="Use (Y/N)"
            value={searchParams.state}
            onChange={handleChangeSearchConfig}
            options={[
              { value: 'RUNNING', label: 'Y' },
              { value: 'HIDDEN', label: 'N' }
            ]}
            sx={{ my: 1 }}
            size="small"
          />
        </>
      )
    }
  ];

  const SwitchRenderer = (props) => (
    `<input type="checkbox" ${props.value ? 'checked' : ''}>`
  );

  const [columnDefs, setColumnDefs] = useState([
    { field: 'name', headerName: translate(`data_grid.uiAuthorize.name`), hide: true },
    { field: 'code', headerName: translate(`data_grid.uiAuthorize.code`), hide: true },
    { field: 'description', headerName: 'Url' },
    { field: 'read', headerName: translate(`data_grid.uiAuthorize.read`), cellRenderer: SwitchRenderer, width: 100 },
    { field: 'create', headerName: translate(`data_grid.uiAuthorize.create`), cellRenderer: SwitchRenderer, width: 100 },
    { field: 'update', headerName: translate(`data_grid.uiAuthorize.update`), cellRenderer: SwitchRenderer, width: 100 },
    { field: 'delete', headerName: translate(`data_grid.uiAuthorize.delete`), cellRenderer: SwitchRenderer, width: 100 },
    { field: 'execute', headerName: translate(`data_grid.uiAuthorize.execute`), cellRenderer: SwitchRenderer, width: 100 }
  ]);

  const onCellClicked = (api) => {
    const { column: { colId }, data: { code }, value } = api;
    if (['read', 'create', 'update', 'delete', 'execute'].includes(colId) && gridApiAuths) {
      const changedValue = !value;
      const currentAuths = [...rowDataAuthor];
      const changedAuths = currentAuths.filter((auth) => auth.code.includes(code)).map((auth) => auth.code);
      gridApiAuths.forEachNode((node) => {
        if (changedAuths.includes(node.data.code)) {
          node.setDataValue(colId, changedValue);
        }
      });
      setChangedAuth(true);
    }
  }

  const getRowId = (params) => params.data.code;

  const parsePermission = (permission, data) => {
    if (data.read) permission.push('READ');
    if (data.create) permission.push('CREATE');
    if (data.update) permission.push('UPDATE');
    if (data.delete) permission.push('DELETE');
    if (data.execute) permission.push('EXECUTE');
  }

  const handleSaveAuths = (nodes) => {
    setSubmitting(true);
    const type = 'featureGroupPermission';
    const kind = 'MENU';
    const lv1s = nodes.filter((node) => node.pageName.length === 1);
    const lv1Permissions = [];
    lv1s.forEach((lv1) => {
      const permitsLv1 = [];
      parsePermission(permitsLv1, lv1);
      const lv1Node = {
        type,
        kind,
        name: lv1.name,
        code: lv1.code,
        description: lv1.description,
        permissions: permitsLv1
      }
      const lv2Permissions = [];
      const lv2s = nodes.filter((node) => node.pageName.length === 2 && node.code.includes(lv1.code));
      lv2s.forEach((lv2) => {
        const permitsLv2 = [];
        parsePermission(permitsLv2, lv2);
        const lv2Node = {
          type,
          kind,
          name: lv2.name,
          code: lv2.code,
          description: lv2.description,
          permissions: permitsLv2
        }
        const lv3Permissions = [];
        const lv3s = nodes.filter((node) => node.pageName.length === 3 && node.code.includes(lv2.code));
        lv3s.forEach((lv3) => {
          const permitsLv3 = [];
          parsePermission(permitsLv3, lv3);
          const lv3Node = {
            type,
            kind,
            name: lv3.name,
            code: lv3.code,
            description: lv3.description,
            permissions: permitsLv3
          }
          const lv4Permissions = [];
          const lv4s = nodes.filter((node) => node.pageName.length === 4 && node.code.includes(lv3.code));
          lv4s.forEach((lv4) => {
            const permitsLv4 = [];
            parsePermission(permitsLv4, lv4);
            const lv4Node = {
              type,
              kind,
              name: lv4.name,
              code: lv4.code,
              description: lv4.description,
              permissions: permitsLv4
            }
            const lv5Permissions = [];
            const lv5s = nodes.filter((node) => node.pageName.length === 5 && node.code.includes(lv4.code));
            lv5s.forEach((lv5) => {
              const permitsLv5 = [];
              parsePermission(permitsLv5, lv5);
              const lv5Node = {
                type,
                kind,
                name: lv5.name,
                code: lv5.code,
                description: lv5.description,
                permissions: permitsLv5
              }
              const lv6Permissions = [];
              const lv6s = nodes.filter((node) => node.pageName.length === 6 && node.code.includes(lv5.code));
              lv6s.forEach((lv6) => {
                const permitsLv6 = [];
                parsePermission(permitsLv6, lv6);
                const lv6Node = {
                  type,
                  kind: 'TAB',
                  name: lv6.name,
                  code: lv6.code,
                  description: lv6.description,
                  permissions: permitsLv6,
                  subFeatures: []
                }
                lv6Permissions.push(lv6Node);
              });
              lv5Node.subFeatures = lv6Permissions;
              lv5Permissions.push(lv5Node);
            });
            lv4Node.subFeatures = lv5Permissions;
            lv4Permissions.push(lv4Node);
          });
          lv3Node.subFeatures = lv4Permissions;
          lv3Permissions.push(lv3Node);
        });
        lv2Node.subFeatures = lv3Permissions;
        lv2Permissions.push(lv2Node);
      })
      lv1Node.subFeatures = lv2Permissions;
      lv1Permissions.push(lv1Node);
    });
    const permissions = {
      type,
      kind: 'ROOT',
      permissions: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'EXECUTE'],
      name: 'root',
      code: 'root',
      description: '',
      subFeatures: lv1Permissions
    }
    mutate({
      url: '/v1/profile/update',
      data: {
        factoryPk: selectedRoleId,
        code: currentRole.role_code,
        name: currentRole.role_name,
        description: currentRole.description,
        featureGroupPermission: permissions
      },
      method: 'post',
      featureCode: 'user.create'
    }).then((res) => {
      if (res.httpStatusCode === 200) {
        if (selectedRoleId === user?.role?.id) {
          localStorage.setItem('userPermission', JSON.stringify(lv1Permissions));
          window.location.reload();
        } else {
          setChangedAuth(false);
          const params = {
            force: true
          };
          setRowDataAuthor(nodes)
          gridApiAuths.refreshCells(params);
        }
        setSubmitting(false);
        handleCloseConfirmModal();
        DthMessage({variant:'success', message: translate(`message.authorization_were_updated_successfully`)});
      }
    }).catch((error) => {
      setSubmitting(false);
      console.error(error);
    });

  }

  const onClickSaveAuth = () => {
    const nodes = [];
    gridApiAuths.forEachNode((node) => {
      nodes.push(node.data);
    });
    handleSaveAuths(nodes);
  }

  return (
    <Page title={getPageName(pageCode)}>
      <Container sx={{ px: `0px !important` }} maxWidth={false}>
        <Grid container spacing={0} sx={{ px: 0, height: `calc(100vh - 254px)` }}>
          <Grid item xs={12} md={2}>
            <Card sx={{ py: 1, px: 1, borderRadius: '0px', height: { md: `calc(100vh - 190px)` }, overflow: 'auto' }}>
              <Box sx={{ mb: 5 }}>
                {ACCORDIONS.map((accordion, index) => (
                  <Accordion
                    key={accordion.value}
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
          <Grid item xs={12} md={10}>
            <>
              <Card sx={{ pr: 1, borderRadius: '0px', height: '25px' }}>
                <HeaderBreadcrumbs activeLast pageCode={pageCode} />
              </Card>
              {pageSelectedWidget?.widgetName === 'Role Info' && (
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
                        <Typography variant="h5">{translate(`typo.role_information`)}</Typography>
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
                            label={translate(`button.register`)}
                            pageCode={pageCode}
                            widgetCode={pageSelectedWidget?.widgetCode}
                            funcType="CREATE"
                          />
                          <DthButtonPermission
                            sx={{ marginLeft: 1 }}
                            variant="contained"
                            onClick={onClickModify}
                            size="small"
                            label={translate(`button.modify`)}
                            disabled={!selectedRoleId}
                            pageCode={pageCode}
                            widgetCode={pageSelectedWidget?.widgetCode}
                            funcType="UPDATE"
                          />
                          <DthButtonPermission
                            sx={{ marginLeft: 1 }}
                            variant="contained"
                            onClick={onClickDelete}
                            size="small"
                            disabled={!selectedRoleId}
                            label={translate(`button.delete`)}
                            pageCode={pageCode}
                            widgetCode={pageSelectedWidget?.widgetCode}
                            funcType="DELETE"
                          />
                        </Stack>
                      </Stack>
                      <div className={themeAgGridClass} style={{ height: '95%', width: '100%', overflowY: 'auto' }}>
                        <AgGrid
                          columns={columns}
                          rowData={rowData}
                          className={themeAgGridClass}
                          onGridReady={onGridReady}
                          onSelectionChanged={onSelectionChanged}
                          rowSelection="single"
                          width="100%"
                          height="100%"
                        />
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
                        minHeight: { xs: `calc((80vh - 100px))` }
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="h5">{translate(`typo.UI_authorization`)}</Typography>
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
                            onClick={() => handleOpenAuthModal('create')}
                            size="small"
                            label='Create Sub Level'
                            disabled={!allowCreateAuth}
                            pageCode={pageCode}
                            widgetCode={pageSelectedWidget?.widgetCode}
                            funcType="EXECUTE"
                          />
                          <DthButtonPermission
                            sx={{ marginLeft: 1 }}
                            variant="contained"
                            onClick={() => setIsOpenConfirmModal(true)}
                            size="small"
                            label={translate(`button.save`)}
                            disabled={!isChangedAuth}
                            pageCode={pageCode}
                            widgetCode={pageSelectedWidget?.widgetCode}
                            funcType="EXECUTE"
                          />
                        </Stack>
                      </Stack>
                      <div className={themeAgGridClass} style={{ height: '95%', width: '100%' }}>
                        <AgGridReact
                          rowData={rowDataAuthor}
                          columnDefs={columnDefs}
                          defaultColDef={{
                            flex: true,
                            resizable: true,
                            rowGroup: false,
                            rowGroupIndex: null,
                            pivot: false,
                            pivotIndex: null,
                            aggFunc: null,
                            sort: null,
                            sortIndex: null,
                            cellClass: "vertical-middle",
                            pinned: null,
                            sortable: false,
                            filter: false,
                            minWidth: 50
                          }}
                          autoGroupColumnDef={autoGroupColumnDef}
                          treeData
                          animateRows
                          groupDefaultExpanded={0}
                          getDataPath={getDataPath}
                          onCellClicked={onCellClicked}
                          getRowId={getRowId}
                          onGridReady={onGridReadyAuths}
                          rowSelection='single'
                          onSelectionChanged={onSelectionChangedAuth}
                          suppressRowClickSelection={false}
                        />
                      </div>
                    </Card>
                  </Grid>
                </Grid>
              )}
              <DialogDragable
                title={`Role ${isEdit ? 'Modify' : 'Registration'}`}
                maxWidth="lg"
                open={isOpenActionModal}
                onClose={handleCloseModal}
              >
                <RoleRegistrationForm
                  isEdit={isEdit}
                  currentData={currentRole}
                  onCancel={handleCloseModal}
                  onLoadData={onLoadData}
                />
              </DialogDragable>
              <DialogDragable
                title='Create Sub Authorization'
                maxWidth="lg"
                open={isOpenAuthModal}
                onClose={handleCloseAuthModal}
              >
                {
                  authAction === 'create' && (
                    <CreateAuthorizeForm
                      isEdit={isEdit}
                      currentData={currentRole}
                      onCancel={handleCloseAuthModal}
                      gridApiAuths={gridApiAuths}
                      selectedAuth={selectedAuth}
                      handleSaveAuths={handleSaveAuths}
                    />
                  )
                }
              </DialogDragable>
              <DialogDragable title={translate(`typo.delete`)} maxWidth="sm" open={isOpenDeleteModal} onClose={handleCloseDeleteModal}>
                <Typography variant="subtitle1" align="center">
                  {translate(`typo.are_you_sure_to_delete`)}
                </Typography>
                <DialogActions>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button type="button" variant="outlined" color="inherit" onClick={handleCloseDeleteModal}>
                    {translate(`button.no`)}
                  </Button>
                  <LoadingButton type="button" variant="contained" onClick={handleDeleteRole} loading={isSubmitting} loadingIndicator='Processing...'>
                    {translate(`button.delete`)}
                  </LoadingButton>
                </DialogActions>
              </DialogDragable>
              <DialogDragable title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
                <Typography variant="subtitle1" align="center">
                  {translate(`typo.are_you_sure_to_modify_authorization`)}?
                </Typography>
                <DialogActions>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
                    {translate(`button.no`)}
                  </Button>
                  <LoadingButton type="button" variant="contained" onClick={onClickSaveAuth} loading={isSubmitting} loadingIndicator='Processing...'>
                    {translate(`button.yes`)}
                  </LoadingButton>
                </DialogActions>
              </DialogDragable>
            </>
          </Grid>
        </Grid>
      </Container>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSubmitting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Page>
  );
}
