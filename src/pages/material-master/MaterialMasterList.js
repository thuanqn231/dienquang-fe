import { Box, Button, DialogActions, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { useEffect, useRef, useState } from 'react';
import { DialogDragable } from '../../components/animate';
import { UploadExcelFile } from '../../components/upload';
import { stateParam } from '../../core/constants';
import { deleteSelectedData, loadSelectedData } from '../../core/helper';
import { DthMessage } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import { closeMaterialActionModal, openMaterialActionModal } from '../../redux/slices/materialMaster';
import { getUnitIdDropdown } from '../../redux/slices/unitIDManagement';
import { useDispatch, useSelector } from '../../redux/store';
import OneTableLayout from '../layout/OneTableLayout';
import { BASE_URL, gridConfigs, isRenderAllOrgChart, pageCode } from './helper';
import MaterialMasterRegistrationForm from './MaterialMasterRegistrationForm';

// ----------------------------------------------------------------------

export default function MaterialMasterList() {
  const { commonDropdown, user } = useAuth();
  const dispatch = useDispatch();
  const { translate } = useLocales();
  const { isOpenMaterialActionModal } = useSelector((state) => state.materialMaster);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [currentData, setCurrentData] = useState({});
  const [isOpenActionModal, setIsOpenActionModal] = useState(false);
  const [dialogParams, setDialogParams] = useState({
    dialogHeader: '',
    dialogMessage: '',
    dialogAction: () => {}
  });
  const [modalAction, setModalAction] = useState('Register');
  const [isSubmitting, setSubmitting] = useState(false);
  const [factories, setFactories] = useState([]);
  const layoutRef = useRef(null);


  const actionButtons = {
    [`${pageCode}.materialCode`]: [
      {
        funcType: 'CREATE',
        label: translate(`button.upload`),
        disabled: false,
        onClick: () => onClickUpload()
      },
      {
        funcType: 'CREATE',
        label: translate(`button.register`),
        disabled: false,
        onClick: () => onClickAdd()
      },
      {
        funcType: 'UPDATE',
        label: translate(`button.modify`),
        disabled: !selectedRowId,
        onClick: () => onClickModify()
      },
      {
        funcType: 'DELETE',
        label: translate(`button.delete`),
        disabled: !selectedRowId,
        onClick: () => onClickDelete()
      }
    ]
  }

  const initSearchParams = {
    [`${pageCode}.materialCode`]: [
      {
        type: 'dropdown',
        id: 'materialType',
        label: 'Material Type',
        groupId: 'D003000',
        defaultValue: ''
      },
      {
        type: 'dropdown',
        id: 'materialGroup',
        label: 'Material Group',
        options: commonDropdown.materialGroupDropdown.filter((v) => factories.includes(v.factory)),
        defaultValue: ''
      },
      {
        type: 'textfield',
        id: 'code',
        label: 'Material Code',
        defaultValue: ''
      },
      {
        type: 'textfield',
        id: 'name',
        label: 'Material Name',
        defaultValue: ''
      },
      {
        type: 'textfield',
        id: 'materialId',
        label: 'Material ID',
        defaultValue: ''
      },
      {
        type: 'textfield',
        id: 'description',
        label: 'Material Description',
        defaultValue: ''
      },
      {
        type: 'dropdown',
        id: 'mrp',
        label: 'MRP Controller',
        options: commonDropdown.mrpControllerDropdown.filter((v) => v.factory === user.factory.factoryCode),
        defaultValue: ''
      },
      {
        type: 'dropdown',
        id: 'status',
        label: 'Plan Status',
        groupId: 'D013000',
        defaultValue: ''
      },
      stateParam
    ]
  }

  useEffect(() => {
    dispatch(getUnitIdDropdown());
  }, [dispatch]);

  useEffect(async () => {
    if (selectedRowId) {
      const data = await loadSelectedData(BASE_URL, selectedRowId);
      setCurrentData({
        factoryPk: data.factoryPk,
        factory: data?.pk?.factoryCode,
        materialCode: data?.code,
        materialName: data?.name,
        materialId: data?.materialId,
        materialType: data?.materialType?.code,
        materialDescription: data?.description,
        materialSpec: data?.spec,
        materialGroup: data?.materialGroup?.factoryPk,
        domExp: data?.dom?.code,
        procType: data?.prodType?.code,
        detailProc: data?.detailProc?.code,
        purchaser: data?.purchaser,
        mrpType: data?.mrpType?.code,
        mrpController: data?.mrp?.factoryPk,
        priceControl: data?.price?.code,
        planStatus: data?.status?.code,
        qcYN: data?.qcStatus,
        defaultStock: data?.stock?.factoryPk,
        safetyStock: data?.safetyStock,
        changeCycle: data?.changeCycle,
        transitTime: data?.transitTime,
        packingSize: data?.packingSize,
        expireDay: data?.expireDay,
        mainUnit: data?.mainUnit?.factoryPk,
        convertUnit: data?.convertUnit?.factoryPk,
        convertRate: data?.convertRate,
        unitID: data?.unitID?.factoryPk,
        giUnit: data?.giUnit?.code,
        state: data?.state
      });
    } else {
      setCurrentData({});
    }
  }, [selectedRowId]);

  useEffect(() => {
    const {
      organizationalChartProduction: { factoryPks }
    } = user;
    const factories = factoryPks.map((factory) => factory.factoryCode);
    setFactories(factories);
  }, [user]);

  const handleOpenActionModal = () => {
    setIsOpenActionModal(true);
  };

  const handleCloseActionModal = () => {
    setIsOpenActionModal(false);
  };

  const onLoadData = () => {
    if (layoutRef.current) {
      layoutRef.current.onLoadData();
    }
  }

  const handleCloseModal = () => {
    dispatch(closeMaterialActionModal());
  };

  const handleOpenModal = (action) => {
    setModalAction(action);
    dispatch(openMaterialActionModal());
  };

  const onRowSelected = (selectedNodes) => {
    const rowCount = selectedNodes.length;
    if (rowCount === 0) {
      setSelectedRowId(null);
    }
    if (rowCount === 1) {
      const selectedId = selectedNodes[0].data.factoryPk;
      setSelectedRowId(selectedId);
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

  const selectWarning = () => {
    DthMessage({ variant: 'warning', message: `${translate('message.please_select_1')} Material Code` });
  }

  const onClickModify = () => {
    if (!selectedRowId) {
      selectWarning();
    } else {
      setIsEdit(true);
      handleOpenModal('Modify');
    }
  };

  const onClickDelete = () => {
    if (!selectedRowId) {
      selectWarning();
    } else {
      setDialogParams({
        dialogHeader: 'Delete',
        dialogMessage: 'Do you want to Delete?',
        dialogAction: () => handleDelete()
      });
      handleOpenActionModal();
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await deleteSelectedData(BASE_URL, selectedRowId);
      if (res.httpStatusCode === 200) {
        setSubmitting(false);
        DthMessage({ variant: 'success', message: `Material Code ${translate('message.was_delete_successfully')}` });
        handleCloseActionModal();
        onLoadData();
      }
    } catch (error) {
      setSubmitting(false);
      console.error(error);
    }
  };

  return (
    <>
      <OneTableLayout
        ref={layoutRef}
        pageCode={pageCode}
        isRenderAllOrgChart={isRenderAllOrgChart}
        gridConfigs={gridConfigs}
        initSearchParams={initSearchParams}
        actionButtons={actionButtons}
        onRowSelected={onRowSelected}
      />
      <DialogDragable
        title={`Material Code ${modalAction}`}
        maxWidth={['Upload'].includes(modalAction) ? 'sm' : "xl"}
        open={isOpenMaterialActionModal}
        onClose={handleCloseModal}
      >
        {(modalAction === 'Register' || modalAction === 'Modify') && (
          <MaterialMasterRegistrationForm
            isEdit={isEdit}
            currentData={currentData}
            onCancel={handleCloseModal}
            onLoadData={onLoadData}
          />
        )}
        {modalAction === 'Upload' && (
          <UploadExcelFile onCancel={handleCloseModal} onLoadData={onLoadData} templateCode="MATERIAl_TEMPLATE_1" />
        )}
      </DialogDragable>
      <DialogDragable
        title={dialogParams.dialogHeader}
        maxWidth="sm"
        open={isOpenActionModal}
        onClose={handleCloseActionModal}
      >
        <Typography variant="subtitle1" align="center">
          {dialogParams.dialogMessage}
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
  );
}
