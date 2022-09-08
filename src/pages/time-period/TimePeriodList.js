import { Box, Button, DialogActions, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { useEffect, useRef, useState } from 'react';
import { DialogDragable } from '../../components/animate';
import { deleteSelectedData, loadSelectedData } from '../../core/helper';
import { DthMessage } from '../../core/wrapper';
import useLocales from '../../hooks/useLocales';
import OneTableLayout from '../layout/OneTableLayout';
import { BASE_URL, gridConfigs, initSearchParams, isRenderAllOrgChart, pageCode } from './helper';
import TimePeriodRegistrationForm from './TimePeriodRegistrationForm';

// ----------------------------------------------------------------------

export default function TimePeriodList() {
  const { translate } = useLocales();
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [currentTimePeriod, setCurrentTimePeriod] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [selectedtimePeriodId, setSelectedtimePeriodId] = useState(null);
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
        disabled: !selectedtimePeriodId,
        onClick: () => onClickModify()
      },
      {
        funcType: 'DELETE',
        label: translate(`button.delete`),
        disabled: !selectedtimePeriodId,
        onClick: () => onClickDelete()
      }
    ]
  }

  useEffect(async () => {
    if (selectedtimePeriodId) {
      const data = await loadSelectedData(BASE_URL, selectedtimePeriodId);
      setCurrentTimePeriod({
        factoryPk: data.factoryPk,
        factory: data?.pk?.factoryCode,
        year: data.year.code,
        month: data.month,
        week: data.week,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        state: data.state
      });
    } else {
      setCurrentTimePeriod({});
    }
  }, [selectedtimePeriodId]);

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

  const onRowSelected = (selectedNodes) => {
    const rowCount = selectedNodes.length;
    if (rowCount === 0) {
      setSelectedtimePeriodId(null);
    }
    if (rowCount === 1) {
      const timePeriodId = selectedNodes[0].data.factoryPk;
      setSelectedtimePeriodId(timePeriodId);
    }
  };

  const onClickAdd = () => {
    setIsEdit(false);
    handleOpenModal();
  };

  const onClickModify = () => {
    if (!selectedtimePeriodId) {
      selectWarning();
    } else {
      setIsEdit(true);
      handleOpenModal();
    }
  };

  const onClickDelete = () => {
    if (!selectedtimePeriodId) {
      selectWarning();
    } else {
      setIsEdit(true);
      handleOpenDeleteModal();
    }
  };

  const selectWarning = () => {
    DthMessage({ variant: 'warning', message: translate(`message.please_select_1_time_period`) });
  }

  const handleDeleteTimePeriod = async () => {
    setSubmitting(true);
    try {
      const res = await deleteSelectedData(BASE_URL, selectedtimePeriodId);
      if (res.httpStatusCode === 200) {
        setSubmitting(false);
        DthMessage({ variant: 'success', message: translate(`message.time_period_delete_successful`) });
        handleCloseDeleteModal();
        onLoadData();
      }
    } catch (error) {
      setSubmitting(false);
      console.error(error);
    }
  };

  const onLoadData = () => {
    if (layoutRef.current) {
      layoutRef.current.onLoadData();
    }
  }

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
        title={`Time Period ${isEdit ? translate(`typo.modify`) : translate(`typo.registration`)}`}
        maxWidth="lg"
        open={isOpenActionModal}
        onClose={handleCloseModal}
      >
        <TimePeriodRegistrationForm
          isEdit={isEdit}
          currentData={currentTimePeriod}
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
          <LoadingButton type="button" variant="contained" onClick={handleDeleteTimePeriod} loading={isSubmitting}>
            {translate(`button.delete`)}
          </LoadingButton>
        </DialogActions>
      </DialogDragable>
    </>
  );
}