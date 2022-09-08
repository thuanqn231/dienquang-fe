import { Box, Button, DialogActions, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { useEffect, useState, useRef } from 'react';
import { DialogDragable } from '../../components/animate';
import { deleteSelectedData, loadSelectedData } from '../../core/helper';
import { DthMessage } from '../../core/wrapper';
import useLocales from '../../hooks/useLocales';
import OneTableLayout from '../layout/OneTableLayout';
import { BASE_URL, gridConfigs, initSearchParams, isRenderAllOrgChart, pageCode } from './helper';
import MRPRegistrationForm from './MRPRegistrationForm';

// ----------------------------------------------------------------------

export default function MRPControllerList() {
  const { translate } = useLocales();
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [currentMRP, setCurrentMRP] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [selectedMRPId, setSelectedMRPId] = useState(null);
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
        disabled: !selectedMRPId,
        onClick: () => onClickModify()
      },
      {
        funcType: 'DELETE',
        label: translate(`button.delete`),
        disabled: !selectedMRPId,
        onClick: () => onClickDelete()
      }
    ]
  }

  useEffect(async () => {
    if (selectedMRPId) {
      const data = await loadSelectedData(BASE_URL, selectedMRPId);
      setCurrentMRP({
        factoryPk: data.factoryPk,
        factory: data.pk.factoryCode,
        mrpCode: data.code,
        mrpName: data.name,
        description: data.description,
        state: data.state
      });
    } else {
      setCurrentMRP({});
    }
  }, [selectedMRPId]);

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
      setSelectedMRPId(null);
    }
    if (rowCount === 1) {
      const mrpId = selectedNodes[0].data.factoryPk;
      setSelectedMRPId(mrpId);
    }
  };

  const onClickAdd = () => {
    setIsEdit(false);
    handleOpenModal();
  };

  const selectWarning = () => {
    DthMessage({ variant: 'warning', message: translate(`message.please_select_1_mrp`) });
  }

  const onClickModify = () => {
    if (!selectedMRPId) {
      selectWarning();
    } else {
      setIsEdit(true);
      handleOpenModal();
    }
  };

  const onClickDelete = () => {
    if (!selectedMRPId) {
      selectWarning();
    } else {
      setIsEdit(true);
      handleOpenDeleteModal();
    }
  };

  const handleDeleteMRP = async () => {
    setSubmitting(true);
    try {
      const res = await deleteSelectedData(BASE_URL, selectedMRPId);
      if (res.httpStatusCode === 200) {
        setSubmitting(false);
        DthMessage({ variant: 'success', message: translate(`message.mrp_delete_successful`) });
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
        title={`MRP Controller ${isEdit ? translate(`typo.modify`) : translate(`typo.registration`)}`}
        maxWidth="lg"
        open={isOpenActionModal}
        onClose={handleCloseModal}
      >
        <MRPRegistrationForm
          isEdit={isEdit}
          currentData={currentMRP}
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
          <LoadingButton type="button" variant="contained" onClick={handleDeleteMRP} loading={isSubmitting}>
            {translate(`button.delete`)}
          </LoadingButton>
        </DialogActions>
      </DialogDragable>

    </>
  );
}
