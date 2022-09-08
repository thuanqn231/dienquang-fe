import { Box, Button, DialogActions, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { useEffect, useRef, useState } from 'react';
import { DialogDragable } from '../../components/animate';
import { deleteSelectedData, loadSelectedData } from '../../core/helper';
import { DthMessage } from '../../core/wrapper';
import useLocales from '../../hooks/useLocales';
import OneTableLayout from '../layout/OneTableLayout';
import EquipmentGroupRegistrationForm from './EquipmentGroupRegistrationForm';
import { BASE_URL, gridConfigs, initSearchParams, isRenderAllOrgChart, pageCode } from './helper';

// ----------------------------------------------------------------------

export default function EquipmentGroupList() {
  const { translate } = useLocales();
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [currentEquipmentGroup, setCurrentEquipmentGroup] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [selectedEquipmentGroupId, setSelectedEquipmentGroupId] = useState(null);
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
        disabled: !selectedEquipmentGroupId,
        onClick: () => onClickModify()
      },
      {
        funcType: 'DELETE',
        label: translate(`button.delete`),
        disabled: !selectedEquipmentGroupId,
        onClick: () => onClickDelete()
      }
    ]
  }

  useEffect(async () => {
    if (selectedEquipmentGroupId) {
      const data = await loadSelectedData(BASE_URL, selectedEquipmentGroupId);
      setCurrentEquipmentGroup({
        factoryPk: data.factoryPk,
        factory: data.pk.factoryCode,
        paramCode: data.code,
        paramName: data.name,
        remark: data.remark,
        state: data.state
      });
    } else {
      setCurrentEquipmentGroup({});
    }
  }, [selectedEquipmentGroupId]);

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
      setSelectedEquipmentGroupId(null);
    }
    if (rowCount === 1) {
      const equipmentGroupId = selectedNodes[0].data.factoryPk;
      setSelectedEquipmentGroupId(equipmentGroupId);
    }
  };

  const onClickAdd = () => {
    setIsEdit(false);
    handleOpenModal();
  };

  const selectWarning = () => {
    DthMessage({ variant: 'warning', message: translate(`message.please_select_1_equipment_group`) });
  }

  const onClickModify = () => {
    if (!selectedEquipmentGroupId) {
      selectWarning();
    } else {
      setIsEdit(true);
      handleOpenModal();
    }
  };

  const onClickDelete = () => {
    if (!selectedEquipmentGroupId) {
      selectWarning();
    } else {
      setIsEdit(true);
      handleOpenDeleteModal();
    }
  };

  const handleDeleteEquipmentGroup = async () => {
    setSubmitting(true);
    try {
      const res = await deleteSelectedData(BASE_URL, selectedEquipmentGroupId);
      if (res.httpStatusCode === 200) {
        setSubmitting(false);
        DthMessage({ variant: 'success', message: translate(`message.equipment_group_delete_successful`) });
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
        title={`Equipment Group ${isEdit ? translate(`typo.modify`) : translate(`typo.registration`)}`}
        maxWidth="lg"
        open={isOpenActionModal}
        onClose={handleCloseModal}
      >
        <EquipmentGroupRegistrationForm
          isEdit={isEdit}
          currentData={currentEquipmentGroup}
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
          <LoadingButton type="button" variant="contained" onClick={handleDeleteEquipmentGroup} loading={isSubmitting}>
            {translate(`button.delete`)}
          </LoadingButton>
        </DialogActions>
      </DialogDragable>
    </>
  );
}
