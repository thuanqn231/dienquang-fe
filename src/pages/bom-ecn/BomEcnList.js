import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Container,
  DialogActions,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@material-ui/core';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import { LoadingButton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/styles';
import { get, isEmpty, isUndefined } from 'lodash-es';
import { useSnackbar } from 'notistack5';
import { useEffect, useState } from 'react';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogDragable } from '../../components/animate';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { UploadExcelFile } from '../../components/upload';
import { mutate, query } from '../../core/api';
import { Dropdown, DthButtonPermission, DthDatePicker, DthRadioButton } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
// hooks
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import useSettings from '../../hooks/useSettings';
import { getBizPartnerCodeDropdown } from '../../redux/slices/bizPartnerManagement';
import {
  closeBOMActionModal,
  openBOMActionModal, resetSearchParams, setSearchParams
} from '../../redux/slices/bomEcnManagement';
import { getApprovedBOMDropdown, getMaterialDropdown } from '../../redux/slices/materialMaster';
import { setSelectedWidget } from '../../redux/slices/page';
// redux
import { useDispatch, useSelector } from '../../redux/store';
// utils
import { toStringCaseCapitalize } from '../../utils/formatString';
import { fDate } from '../../utils/formatTime';
import { getGridConfig, getPageName } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';
// ----------------------------------------------------------------------
import ApprovalCreate from '../approval/ApprovalCreate';
import { DocumentRequestTypeEnum, RequestParameterTypeEnum } from '../approval/constants';
import BOMRegistrationForm from './BOMRegistrationForm';
import ECNRegistrationForm from './ECNRegistrationForm';
import { generateBOMMarkup, generateECNMarkup } from './helper';

// ----------------------------------------------------------------------

const pageCode = 'menu.masterData.production.productionMasterData.materialMaster.bomInfo';
const tableBOMCode = 'bomInfoList';
const tableECNCode = 'ecnInfoList';
const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function BomEcnList() {
  const classes = useStyles();
  const { themeAgGridClass } = useSettings();
  const { translate, currentLang } = useLocales();
  const { funcPermission, userGridConfig, updateAgGridConfig, user } = useAuth();
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { searchParams, isOpenBOMActionModal } = useSelector((state) => state.bomEcnManagement);
  const { bizPartnerCodeDropdown } = useSelector((state) => state.bizPartnerManagement);
  const { selectedWidget } = useSelector((state) => state.page);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [currentData, setCurrentData] = useState({});
  const [currentBOM, setCurrentBOM] = useState({});
  const [isOpenActionModal, setIsOpenActionModal] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [columns, setColumns] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [dialogParams, setDialogParams] = useState({
    dialogHeader: '',
    dialogMessage: '',
    dialogAction: () => { }
  });
  const [modalAction, setModalAction] = useState('Register');
  const [hideFilters, setHideFilters] = useState(false);
  const [isAllowEdit, setIsAllowEdit] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [openCompose, setOpenCompose] = useState(false);
  const [approvalEditor, setApprovalEditor] = useState('');
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const [submissionIds, setSubmissionIds] = useState([]);
  const pageSelectedWidget = selectedWidget[pageCode];
  const [excludesStatus, setExcludesStatus] = useState(pageSelectedWidget?.widgetName === 'BOM Info' ? ['', 'SAVED', 'APPROVING'] : []);
  const [approvalRequestParameters, setApprovalRequestParameters] = useState([]);
  const [isSubmitting, setSubmitting] = useState(false);


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
    dispatch(getMaterialDropdown());
    dispatch(getApprovedBOMDropdown());
    dispatch(getBizPartnerCodeDropdown());
  }, [dispatch]);

  useEffect(() => {
    if (pageSelectedWidget?.widgetName !== '') {
      const tableCode = pageSelectedWidget?.widgetName === 'BOM Info' ? tableBOMCode : tableECNCode;
      const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
      tableConfigs.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      });
      setColumns(tableConfigs);
    }
  }, [userGridConfig, selectedWidget]);

  useEffect(() => {
    if (columns) {
      const tableCode = pageSelectedWidget?.widgetName === 'BOM Info' ? tableBOMCode : tableECNCode;
      const tableConfigs = [...columns];
      tableConfigs.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      });
      setColumns(tableConfigs);
    }
  }, [currentLang]);

  useEffect(() => {
    let excludes = [];
    let currentBomStatus = searchParams.bomStatus;
    if (pageSelectedWidget?.widgetName === 'BOM Info' && searchParams.searchBy === 'top') {
      excludes = ['', 'SAVED', 'APPROVING'];
      currentBomStatus = 'APPROVED';
    }
    const _search = {
      ...searchParams,
      bomStatus: currentBomStatus
    };
    dispatch(setSearchParams(_search));
    setExcludesStatus(excludes);
    if (gridApi) {
      onLoadData();
    }
  }, [selectedWidget]);

  useEffect(() => {
    if (gridApi && bizPartnerCodeDropdown) {
      onLoadData();
    }
  }, [gridApi, bizPartnerCodeDropdown]);

  useEffect(() => {
    if (!isEmpty(approvalRequestParameters)) {
      setOpenCompose(true);
    }
  }, [approvalRequestParameters])

  useEffect(() => {
    const requestParameters = buildRequestParameters();
    setApprovalRequestParameters(requestParameters);
  }, [submissionIds])

  const generateECNHtml = async (data) => {
    const allChildCodesECN = await getAllECNChildCodeByParent(data, 'SAVED');

    if (!isEmpty(allChildCodesECN?.data)) {
      const _submissionIds = allChildCodesECN?.data.map((data) => data.factoryPk);
      setSubmissionIds(_submissionIds);
    }
    return generateECNMarkup(allChildCodesECN?.data, bizPartnerCodeDropdown);
  };

  const getAllECNChildCodeByParent = async (parent, ecStatus) => {
    const allChildCodesECN = await query({
      url: '/v1/bom/ecr/search',
      featureCode: 'user.create',
      params: {
        factoryCode: parent?.factory,
        ecNo: parent?.ecNo,
        materialCode: parent?.parentCode?.code,
        materialName: parent?.parentCode?.name,
        status: ecStatus,
        ecVersionParent: parent?.ecVersionParent
      }
    });
    return allChildCodesECN;
  };

  const generateBOMHtml = async (data) => {
    const allChildCodes = await getAllBOMChildCodesByParent(data, 'SAVED');
    if (!isEmpty(allChildCodes?.data)) {
      const _submissionIds = allChildCodes?.data.map((data) => data.factoryPk);
      setSubmissionIds(_submissionIds);
    }
    return generateBOMMarkup(allChildCodes?.data, bizPartnerCodeDropdown);
  };

  const getAllBOMChildCodesByParent = async (parent, bomStatus) => {
    const allChildCodes = await query({
      url: '/v1/bom/bom/search',
      featureCode: 'user.create',
      params: {
        factoryCode: searchParams.factory,
        searchBy: 'parent',
        materialCode: parent.parentCode.code,
        materialName: parent.parentCode.name,
        bomVersionParent: parent.bomVersionParent,
        bomStatus,
        state: 'RUNNING'
      }
    });
    return allChildCodes;
  };

  const onSubmitApprovalSuccess = async (approvalId) => {
    setApprovalRequestParameters([]);
    const submissionDto = submissionIds.map((id) => ({
      factoryPk: id,
      bomStatus: 'APPROVING',
      approval: {
        factoryPk: approvalId
      }
    }));
    await handleUpdateStatus(submissionDto);
  };

  const handleUpdateStatus = async (updateDto) => {
    let uri = 'ecr';
    let param = 'ecrList';
    if (pageSelectedWidget?.widgetName === 'BOM Info') {
      uri = 'bom';
      param = 'bomList';
    }
    await mutate({
      url: `/v1/bom/${uri}/update-v2`,
      data: {
        [param]: updateDto
      },
      method: 'post',
      featureCode: 'user.create'
    }).catch((error) => {
      console.error(error);
    });
    onLoadData();
  };

  const onSubmitBOM = async () => {
    if (!selectedRowId) {
      enqueueSnackbar(`Please select 1 ${pageSelectedWidget?.widgetName}`, {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else {
      const editorValue =
        pageSelectedWidget?.widgetName === 'BOM Info'
          ? await generateBOMHtml(currentBOM)
          : await generateECNHtml(currentBOM);
      setApprovalEditor(editorValue);

    }
  };

  const buildRequestParameters = () =>
    submissionIds.map((id) => ({
      value: id,
      type: RequestParameterTypeEnum.INTERNAL_ENTITY_ID,
    }));


  const getDocumentRequestTypeEnum = () =>
    pageSelectedWidget?.widgetName === 'BOM Info'
      ? DocumentRequestTypeEnum.BOM
      : DocumentRequestTypeEnum.ECR;

  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };

  const actionTooltip = hideFilters ? 'Show' : 'Hide';

  const handleOpenActionModal = () => {
    setIsOpenActionModal(true);
  };

  const handleCloseActionModal = () => {
    setIsOpenActionModal(false);
  };

  const handleChangeSearchConfig = (event) => {
    const { target: { name, value } } = event;
    let currentBomStatus = searchParams.bomStatus;
    if (name === 'searchBy') {
      if (value === 'top') {
        setExcludesStatus(['', 'SAVED', 'APPROVING']);
        currentBomStatus = 'APPROVED';
      } else {
        setExcludesStatus([]);
      }
    }
    const _search = {
      ...searchParams,
      bomStatus: currentBomStatus,
      [name]: `${value}`
    };
    dispatch(setSearchParams(_search));
  };

  const handleChangeDateSearchConfig = (name, value) => {
    const _search = {
      ...searchParams,
      [name]: `${value}`
    };
    dispatch(setSearchParams(_search));
  };

  const onInquiry = () => {
    // if (searchParams.searchBy !== 'top' && !searchParams.materialCode && !searchParams.materialName) {
    //   enqueueSnackbar(translate(`message.please_input_material_code`), {
    //     variant: 'warning',
    //     action: (key) => (
    //       <MIconButton size="small" onClick={() => closeSnackbar(key)}>
    //         <Icon icon={closeFill} />
    //       </MIconButton>
    //     )
    //   });
    // } else {
    //   onLoadData();
    // }
    onLoadData();
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

  const updateData = (data) => {
    setRowData(data);
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    params.api.addGlobalListener((type, event) => {
      if (['columnPinned', 'columnMoved', 'columnVisible', 'columnResized'].indexOf(type) >= 0) {
        setIsChangedTableConfig(true);
      }
    });
  };

  const onLoadData = async () => {
    setSelectedRowId(null);
    let response = [];
    switch (pageSelectedWidget?.widgetName) {
      case 'BOM Info':
        response = await onLoadDataBOM();
        break;
      case 'ECN Info':
        response = await onLoadDataECN();
        break;
      default:
        break;
    }
    updateData(response);
  };

  const onLoadDataBOM = async () => {
    const response = await query({
      url: '/v1/bom/bom/search',
      featureCode: 'user.create',
      params: {
        factoryCode: searchParams.factory,
        searchBy: searchParams.searchBy,
        materialCode: searchParams.materialCode,
        // materialName: searchParams.materialName,
        version: searchParams.version,
        from: fDate(searchParams.from),
        to: fDate(searchParams.to),
        bomStatus: searchParams.bomStatus,
        state: searchParams.state,
        factoryPks: parseSelectedTree.factoryIds
      },
      timeout: 60000
    });
    const { data } = response;
    data.forEach((row) => {
      let supplierDisplay = '';
      if (row?.supplier) {
        supplierDisplay = row.supplier.split(' | ').map((v) => get(bizPartnerCodeDropdown.find((o = {}) => o.value === v), 'label')).join(' | ');
      }
      row.supplier = supplierDisplay;
    });
    return data || [];
  };

  const onLoadDataECN = async () => {
    const response = await query({
      url: '/v1/bom/ecr/search',
      featureCode: 'user.create',
      params: {
        factoryCode: searchParams.factory,
        materialCode: searchParams.materialCode,
        // materialName: searchParams.materialName,
        version: searchParams.version,
        from: fDate(searchParams.from),
        to: fDate(searchParams.to),
        status: searchParams.bomStatus,
        state: searchParams.state,
        factoryPks: parseSelectedTree.factoryIds
      },
      timeout: 60000
    });
    const { data } = response;
    data.forEach((row) => {
      let supplierDisplay = '';
      if (row?.supplier) {
        supplierDisplay = row.supplier.split(' | ').map((v) => get(bizPartnerCodeDropdown.find((o = {}) => o.value === v), 'label')).join(' | ');
      }
      row.supplier = supplierDisplay;
    });
    return data || [];
  };

  const handleCloseModal = () => {
    dispatch(closeBOMActionModal());
  };

  const handleOpenModal = (action) => {
    setModalAction(action);
    dispatch(openBOMActionModal());
  };

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedRowId(null);
      setIsAllowEdit(false);
      setCurrentData(null);
    }
    if (rowCount === 1) {
      const selectedId = event.api.getSelectedNodes()[0].data.factoryPk;
      setSelectedRowId(selectedId);
      const { bomStatus } = event.api.getSelectedNodes()[0].data;
      let isAllowEdit = false;
      if (bomStatus === 'SAVED') {
        isAllowEdit = true;
      }
      setIsAllowEdit(isAllowEdit);
      if (pageSelectedWidget?.widgetName === 'BOM Info') {
        handleSelectionBOM(selectedId);
      } else {
        handleSelectionECN(selectedId);
      }
      //
    }
  };

  const handleSelectionBOM = (BOMId) => {
    if (BOMId) {
      query({
        url: `/v1/bom/bom/${BOMId}`,
        featureCode: 'user.create'
      })
        .then((res) => {
          const { data } = res;
          setCurrentBOM(data);
          setCurrentData({
            factoryPk: data.factoryPk,
            factory: data.pk.factoryCode,
            parentMaterialCode: data.parentCode.factoryPk,
            parentVersion: data.bomVersionParent,
            parentMaterialDescription: data.parentCode.description,
            parentMaterialId: data.parentCode.materialId,
            parentMaterialName: data.parentCode.name,
            parentMaterialValue: data.parentCode.code,
            parentTestQty: data.testQtyParent,
            parentMaterialSpec: data.parentCode.spec,
            parentEffectiveDate: data.validFrom,
            parentState: data.stateParent,
            childMaterialCode: data.childCode.factoryPk,
            childMaterialValue: data.childCode.code,
            childStandQty: data.standQty,
            childVersion: data.bomVersion,
            childMaterialDescription: data.childCode.description,
            childMaterialId: data.childCode.materialId,
            childMaterialName: data.childCode.name,
            childUnit: data.childCode.mainUnit.code,
            childMaterialSpec: data.childCode.spec,
            childDevStatus: data.devStatus.code,
            childRevisionDrawing: data.revisionDrawing,
            childRemark: data.remark,
            childSupplier: data.supplier,
            childState: data.state,
            childLoss: data.loss,
            childCalType: data.calType,
            childTestQty: data.testQty
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const handleSelectionECN = (ECNId) => {
    if (ECNId) {
      query({
        url: `/v1/bom/ecr/${ECNId}`,
        featureCode: 'user.create'
      })
        .then((res) => {
          const { data } = res;
          setCurrentBOM(data);
          setCurrentData({
            factoryPk: data.factoryPk,
            factory: data.pk.factoryCode,
            ecType: data.ecType,
            ecNo: data.ecNo,
            bomId: data.bomId.factoryPk,
            validFrom: data.validFrom,
            validTo: data.validTo,
            parentMaterialCode: data.parentCode.factoryPk,
            parentVersion: data.ecVersionParent,
            parentMaterialDescription: data.parentCode.description,
            parentUnit: data.parentCode.mainUnit.code,
            parentMaterialId: data.parentCode.materialId,
            parentMaterialName: data.parentCode.name,
            parentMaterialValue: data.parentCode.code,
            parentTestQty: data.testQtyParent,
            parentMaterialSpec: data.parentCode.spec,
            parentState: data.stateParent,
            childMaterialCode: data.childCode.factoryPk,
            childStandQty: data.standQty,
            childVersion: data.ecVersion,
            childMaterialDescription: data.childCode.description,
            childMaterialId: data.childCode.materialId,
            childMaterialName: data.childCode.name,
            childMaterialValue: data.childCode.code,
            childUnit: data.childCode.mainUnit.code,
            childMaterialSpec: data.childCode.spec,
            childDevStatus: data.devStatus.code,
            childRevisionDrawing: data.revisionDrawing,
            childRemark: data.remark,
            childSupplier: data.supplier,
            childState: data.state,
            childLoss: data.loss,
            childCalType: data.calType,
            childTestQty: data.testQty
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const onClickAdd = () => {
    setIsEdit(false);
    handleOpenModal('Register');
  };

  const onClickUpload = () => {
    setIsEdit(false);
    handleOpenModal('Upload');
  };

  const onClickModify = () => {
    if (!selectedRowId) {
      enqueueSnackbar(`Please select 1 ${pageSelectedWidget?.widgetName}`, {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else if (isAllowEdit) {
      setIsEdit(true);
      handleOpenModal('Modify');
    } else {
      enqueueSnackbar(`${pageSelectedWidget?.widgetName} is in Approving, can't modify`, {
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
    if (!selectedRowId) {
      enqueueSnackbar(`Please select 1 ${pageSelectedWidget?.widgetName}`, {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else if (isAllowEdit) {
      setDialogParams({
        dialogHeader: 'Delete',
        dialogMessage: 'Do you want to Delete?',
        dialogAction: () => handleDelete()
      });
      handleOpenActionModal();
    } else {
      enqueueSnackbar(
        `${pageSelectedWidget?.widgetName} is ${toStringCaseCapitalize(currentBOM?.bomStatus)}, can't Delete`,
        {
          variant: 'warning',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          )
        }
      );
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    let uri = 'ecr';
    if (pageSelectedWidget?.widgetName === 'BOM Info') {
      uri = 'bom';
    }
    await mutate({
      url: `/v1/bom/${uri}/${selectedRowId}`,
      method: 'delete',
      featureCode: 'user.delete'
    }).then((res) => {
      if (res.httpStatusCode === 200) {
        setSubmitting(false);
        handleCloseActionModal();
        onLoadData();
        enqueueSnackbar(`Delete ${pageSelectedWidget?.widgetName} Successful`, {
          variant: 'success',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          )
        });
      }
    }).catch((error) => {
      setSubmitting(false);
      console.error(error);
    });
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
      detail: <OrganizationTree parseSelected={handleParseSelectedTree} />,
      maxHeight: '30vh'
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
      isClearFilter: true,
      defaultExpanded: true,
      detail: (
        <>
          {
            pageSelectedWidget?.widgetName === 'BOM Info' &&
            <DthRadioButton
              name="searchBy"
              label="Search By"
              options={[
                { value: 'top', label: 'Top', props: { size: 'small' } },
                { value: 'parent', label: 'Parent', props: { size: 'small' } },
                { value: 'child', label: 'Child', props: { size: 'small' } }
              ]}
              onChange={handleChangeSearchConfig}
              value={searchParams.searchBy}
            />
          }
          <TextField
            id="materialCode"
            name="materialCode"
            label="Material Code"
            sx={{ my: 1 }}
            fullWidth
            value={searchParams.materialCode}
            onChange={handleChangeSearchConfig}
            size="small"
          />
          {/* <TextField
            id="materialName"
            name="materialName"
            label="Material Name"
            sx={{ my: 1 }}
            fullWidth
            value={searchParams.materialName}
            onChange={handleChangeSearchConfig}
            size="small"
          /> */}
          <TextField
            id="version"
            name="version"
            label="Version"
            sx={{ my: 1 }}
            fullWidth
            value={searchParams.version}
            onChange={handleChangeSearchConfig}
            size="small"
          />
          <DthDatePicker
            name="from"
            label="Valid From"
            value={searchParams.from}
            onChange={(newValue) => {
              handleChangeDateSearchConfig('from', newValue);
            }}
            sx={{ my: 1 }}
            fullWidth
            size="small"
          />
          <DthDatePicker
            name="to"
            label="Valid To"
            value={searchParams.to}
            onChange={(newValue) => {
              handleChangeDateSearchConfig('to', newValue);
            }}
            sx={{ my: 1 }}
            fullWidth
            size="small"
          />
          <Dropdown
            id="bomStatus"
            name="bomStatus"
            label="Status"
            value={searchParams.bomStatus}
            onChange={handleChangeSearchConfig}
            options={[
              { value: 'SAVED', label: 'SAVED' },
              { value: 'APPROVING', label: 'APPROVING' },
              { value: 'APPROVED', label: 'APPROVED' }
            ]}
            excludes={excludesStatus}
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

  const onSaveTableConfig = () => {
    const _columns = gridApi.getColumnDefs();
    updateGridConfig(_columns);
    setColumns(_columns);
    setIsChangedTableConfig(false);
  };

  const updateGridConfig = async (_columns) => {
    const tableCode = pageSelectedWidget?.widgetName === 'BOM Info' ? tableBOMCode : tableECNCode;
    mutate({
      url: '/v1/user/ag-grid-configuration/update',
      data: [
        {
          agGridId: tableCode,
          featureCode: pageCode,
          agGridConfig: JSON.stringify(_columns)
        }
      ],
      method: 'post',
      featureCode: 'user.create'
    })
      .then((res) => {
        if (res.httpStatusCode === 200) {
          updateAgGridConfig();
          enqueueSnackbar(translate(`message.update_grid_configuration_successful`), {
            variant: 'success',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

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
                  {translate('button.inquiry')}
                </Button>
              </Card>
            </Grid>
          )}
          <Grid item xs={12} md={hideFilters ? 12 : 10}>
            <>
              <Card sx={{ pr: 1, borderRadius: '0px', height: '60px' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 0 }}>
                  <Tooltip title={`${actionTooltip} Filters`}>
                    <IconButton onClick={handleHideFilters}>{hideFilters ? <LastPage /> : <FirstPage />}</IconButton>
                  </Tooltip>

                  <HeaderBreadcrumbs
                    activeLast
                    pageCode={pageCode}
                    action={
                      <>
                        {pageSelectedWidget?.widgetName === 'BOM Info' && (
                          <DthButtonPermission
                            sx={{ marginLeft: 1 }}
                            variant="contained"
                            onClick={onClickUpload}
                            size="small"
                            label={translate(`button.upload`)}
                            pageCode={pageCode}
                            widgetCode={pageSelectedWidget?.widgetCode}
                            funcType="CREATE"
                          />
                        )}
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
                          disabled={!selectedRowId || !isAllowEdit}
                          label={translate(`button.modify`)}
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="UPDATE"
                        />
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={onClickDelete}
                          size="small"
                          disabled={!selectedRowId || !isAllowEdit}
                          label={translate(`button.delete`)}
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="DELETE"
                        />
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={onSubmitBOM}
                          size="small"
                          disabled={!selectedRowId || !isAllowEdit}
                          label={translate(`button.submit`)}
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="EXECUTE"
                        />
                        {isChangedTableConfig && (
                          <DthButtonPermission
                            sx={{ marginLeft: 1 }}
                            variant="outlined"
                            onClick={onSaveTableConfig}
                            size="small"
                            label={translate(`button.saveConfig`)}
                            pageCode={pageCode}
                            widgetCode={pageSelectedWidget?.widgetCode}
                            funcType="READ"
                          />
                        )}
                      </>
                    }
                  />
                </Stack>
              </Card>
              <Card
                sx={{
                  p: 1,
                  borderRadius: '0px',
                  display: 'flex',
                  height: 'calc(100% - 60px)',
                  minHeight: { xs: `calc(80vh - 100px)` }
                }}
              >
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
              </Card>
              <DialogDragable
                title={`${pageSelectedWidget?.widgetName}  ${modalAction}`}
                maxWidth={['Upload'].includes(modalAction) ? 'sm' : 'lg'}
                open={isOpenBOMActionModal}
                onClose={handleCloseModal}
              >
                {pageSelectedWidget?.widgetName === 'BOM Info' &&
                  (modalAction === 'Register' || modalAction === 'Modify') && (
                    <BOMRegistrationForm
                      isEdit={isEdit}
                      currentData={currentData}
                      onCancel={handleCloseModal}
                      onLoadData={onLoadData}
                    />
                  )}
                {pageSelectedWidget?.widgetName === 'ECN Info' &&
                  (modalAction === 'Register' || modalAction === 'Modify') && (
                    <ECNRegistrationForm
                      isEdit={isEdit}
                      currentData={currentData}
                      onCancel={handleCloseModal}
                      onLoadData={onLoadData}
                    />
                  )}
                {modalAction === 'Upload' && (
                  <UploadExcelFile onCancel={handleCloseModal} onLoadData={onLoadData} templateCode="BOM_TEMPLATE_1" />
                )}
              </DialogDragable>
              <DialogDragable title={translate(`typo.delete`)} maxWidth="sm" open={isOpenActionModal} onClose={handleCloseActionModal}>
                <Typography variant="subtitle1" align="center">
                  {translate(`typo.are_you_sure_to_delete`)}
                </Typography>
                <DialogActions>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button type="button" variant="outlined" color="inherit" onClick={handleCloseActionModal}>
                    {translate(`button.no`)}
                  </Button>
                  <LoadingButton type="button" variant="contained" onClick={dialogParams.dialogAction} loading={isSubmitting}>
                    {dialogParams.dialogHeader}
                  </LoadingButton>
                </DialogActions>
              </DialogDragable>
            </>
          </Grid>
        </Grid>
      </Container>
      {!isUndefined(currentBOM?.parentCode?.code) && (
        <ApprovalCreate
          documentRequestType={getDocumentRequestTypeEnum()}
          requestParameters={approvalRequestParameters}
          isOpenCompose={openCompose}
          onCloseCompose={() => setOpenCompose(false)}
          defaultTitle={`${pageSelectedWidget?.widgetName} Approval for Model ${currentBOM.parentCode.code}`}
          defaultEditor={approvalEditor}
          onSubmitSuccess={onSubmitApprovalSuccess}
        />
      )}
    </Page>
  );
}
