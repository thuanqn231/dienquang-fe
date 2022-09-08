import { Box, Button, DialogActions, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { useEffect, useRef, useState } from 'react';
import { DialogDragable } from '../../components/animate';
import { deleteSelectedData, loadSelectedData } from '../../core/helper';
import { DthMessage } from '../../core/wrapper';
import useLocales from '../../hooks/useLocales';
import OneTableLayout from '../layout/OneTableLayout';
import EquipmentIDRegistrationForm from './EquipmentIDRegistrationForm';
import { BASE_URL, gridConfigs, initSearchParams, isRenderAllOrgChart, pageCode } from './helper';

// ----------------------------------------------------------------------

export default function EquipmentIDList() {
  const { translate } = useLocales();
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [currentEquipmentID, setCurrentEquipmentID] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [selectedEquipmentIDId, setSelectedEquipmentIDId] = useState(null);
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
        disabled: !selectedEquipmentIDId,
        onClick: () => onClickModify()
      },
      {
        funcType: 'DELETE',
        label: translate(`button.delete`),
        disabled: !selectedEquipmentIDId,
        onClick: () => onClickDelete()
      }
    ]
  }

  useEffect(async () => {
    if (selectedEquipmentIDId) {
      const data = await loadSelectedData(BASE_URL, selectedEquipmentIDId);
      const attachedFiles = data?.attachedFiles?.map(file => ({
        isReload: true,
        ...file
      }))
      setCurrentEquipmentID({
        factoryPk: data.factoryPk,
        factory: data.pk.factoryCode,
        state: data.state,
        equipCode: data.equipmentCode.factoryPk,
        equipID: data.code,
        equipIDName: data.name,
        equipIDSpec: data.equipmentSpec,
        equipIDPlant: data.equipmentPlant.factoryPk,
        equipTeam: data.equipmentTeam.factoryPk,
        equipGroup: data.equipmentGroup.factoryPk,
        equipPart: data.equipmentPart.factoryPk,
        equipLine: data.equipmentLine.factoryPk,
        equipProcess: data.equipmentProcess.factoryPk,
        equipWS: data.equipmentWorkStation.factoryPk,
        equipSeqLine: data.equipmentSeqByLine,
        equipSeqEquip: data.equipmentSeqByEquip,
        lossMngt: data.lossMngt,
        mchMngt: data.mchMngt,
        equipSerial: data.equipmentSerial,
        equipAsset: data.equipmentAsset,
        equipModel: data.equipmentModel,
        rfidCode: data.rfidCode,
        equipStatus: data.equipmentStatus.code,
        attachedFiles,
        remark: data.remark
      });
    } else {
      setCurrentEquipmentID({});
    }
  }, [selectedEquipmentIDId]);

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
      setSelectedEquipmentIDId(null);
    }
    if (rowCount === 1) {
      const equipmentIDId = selectedNodes[0].data.factoryPk;
      setSelectedEquipmentIDId(equipmentIDId);
    }
  };

  const onClickAdd = () => {
    setIsEdit(false);
    handleOpenModal();
  };

  const selectWarning = () => {
    DthMessage({ variant: 'warning', message: translate(`message.please_select_1_equipment_ID`) });
  }

  const onClickModify = () => {
    if (!selectedEquipmentIDId) {
      selectWarning();
    } else {
      setIsEdit(true);
      handleOpenModal();
    }
  };

  const onClickDelete = () => {
    if (!selectedEquipmentIDId) {
      selectWarning();
    } else {
      setIsEdit(true);
      handleOpenDeleteModal();
    }
  };

  const handleDeleteEquipmentID = async () => {
    setSubmitting(true);
    try {
      const res = await deleteSelectedData(BASE_URL, selectedEquipmentIDId);
      if (res.httpStatusCode === 200) {
        setSubmitting(false);
        DthMessage({ variant: 'success', message: translate(`message.equipment_ID_delete_successful`) });
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
        title={`Equipment ID ${isEdit ? translate(`typo.modify`) : translate(`typo.registration`)}`}
        maxWidth="lg"
        open={isOpenActionModal}
        onClose={handleCloseModal}
      >
        <EquipmentIDRegistrationForm
          isEdit={isEdit}
          currentData={currentEquipmentID}
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
          <LoadingButton type="button" variant="contained" onClick={handleDeleteEquipmentID} loading={isSubmitting}>
            {translate(`button.delete`)}
          </LoadingButton>
        </DialogActions>
      </DialogDragable>
    </>
  );
}
