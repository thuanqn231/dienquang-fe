import { Box, Button, DialogActions, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { useEffect, useRef, useState } from 'react';
import { DialogDragable } from '../../components/animate';
import { deleteSelectedData, loadSelectedData } from '../../core/helper';
import { DthMessage } from '../../core/wrapper';
import useLocales from '../../hooks/useLocales';
import { getBizPartnerCodeDropdown } from '../../redux/slices/bizPartnerManagement';
import { useDispatch } from '../../redux/store';
import OneTableLayout from '../layout/OneTableLayout';
import EquipmentCodeRegistrationForm from './EquipmentCodeRegistrationForm';
import { BASE_URL, gridConfigs, initSearchParams, isRenderAllOrgChart, pageCode } from './helper';

// ----------------------------------------------------------------------

export default function EquipmentCodeList() {
  const dispatch = useDispatch();
  const { translate } = useLocales();
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [currentEquipmentCode, setCurrentEquipmentCode] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [selectedEquipmentCodeId, setSelectedEquipmentCodeId] = useState(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const layoutRef = useRef(null);

  const actionButtons = {
    [pageCode]: [
      {
        funcType: 'CREATE',
        label: translate(`button.register`),
        disabled: false,
        onClick: () => onClickAdd()
      },
      {
        funcType: 'UPDATE',
        label: translate(`button.modify`),
        disabled: !selectedEquipmentCodeId,
        onClick: () => onClickModify()
      },
      {
        funcType: 'DELETE',
        label: translate(`button.delete`),
        disabled: !selectedEquipmentCodeId,
        onClick: () => onClickDelete()
      }
    ]
  }

  useEffect(async () => {
    if (selectedEquipmentCodeId) {
      const data = await loadSelectedData(BASE_URL, selectedEquipmentCodeId);
      const attachedFiles = data?.attachedFiles?.map(file => ({
        isReload: true,
        ...file
      }))
      setCurrentEquipmentCode({
        factoryPk: data?.factoryPk,
        factory: data?.pk?.factoryCode,
        state: data?.state,
        equipGroup: data?.equipmentGroup?.factoryPk,
        equipType: data?.equipmentType?.code,
        equipCode: data?.code,
        equipName: data?.name,
        equipSpec: data?.equipmentSpec,
        unit: data?.unit?.factoryPk,
        vendor: data?.vendor?.factoryPk !== 'null-null' ? data?.vendor?.factoryPk : null,
        maker: data?.maker?.factoryPk !== 'null-null' ? data?.maker?.factoryPk : null,
        attachedFiles,
        remark: data?.remark
      });
    } else {
      setCurrentEquipmentCode({});
    }
  }, [selectedEquipmentCodeId]);

  useEffect(() => {
    dispatch(getBizPartnerCodeDropdown());
  }, [dispatch]);

  const handleOpenDeleteModal = () => {
    setIsOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setIsOpenDeleteModal(false);
  };

  const handleCloseModal = () => {
    setOpenActionModal(false);
  };

  const handleOpenModal = () => {
    setOpenActionModal(true);
  };

  const onLoadData = () => {
    if (layoutRef.current) {
      layoutRef.current.onLoadData();
    }
  }

  const onRowSelected = (selectedNodes) => {
    const rowCount = selectedNodes.length;
    if (rowCount === 0) {
      setSelectedEquipmentCodeId(null);
    }
    if (rowCount === 1) {
      const equipmentCodeId = selectedNodes[0].data.factoryPk;
      setSelectedEquipmentCodeId(equipmentCodeId);
    }
  };

  const onClickAdd = () => {
    setIsEdit(false);
    handleOpenModal();
  };

  const selectWarning = () => {
    DthMessage({ variant: 'warning', message: translate(`message.please_select_1_equipment_code`) });
  }

  const onClickModify = () => {
    if (!selectedEquipmentCodeId) {
      selectWarning();
    } else {
      setIsEdit(true);
      handleOpenModal();
    }
  };

  const onClickDelete = () => {
    if (!selectedEquipmentCodeId) {
      selectWarning();
    } else {
      setIsEdit(true);
      handleOpenDeleteModal();
    }
  };

  const handleDeleteEquipmentCode = async () => {
    setSubmitting(true);
    try {
      const res = await deleteSelectedData(BASE_URL, selectedEquipmentCodeId);
      if (res.httpStatusCode === 200) {
        setSubmitting(false);
        DthMessage({ variant: 'success', message: translate(`message.equipment_code_delete_successful`) });
        handleCloseDeleteModal();
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
        title={`Equipment Code ${isEdit ? translate(`typo.modify`) : translate(`typo.registration`)}`}
        maxWidth="lg"
        open={isOpenActionModal}
        onClose={handleCloseModal}
      >
        <EquipmentCodeRegistrationForm
          isEdit={isEdit}
          currentData={currentEquipmentCode}
          onCancel={handleCloseModal}
          onLoadData={onLoadData}
        />
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
          <LoadingButton type="button" variant="contained" onClick={handleDeleteEquipmentCode} loading={isSubmitting}>
            {translate(`button.delete`)}
          </LoadingButton>
        </DialogActions>
      </DialogDragable>
    </>
  );
}
