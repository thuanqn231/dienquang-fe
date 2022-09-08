import { Box, Button, DialogActions, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { useEffect, useRef, useState } from 'react';
import { DialogDragable } from '../../components/animate';
import { deleteSelectedData, loadSelectedData } from '../../core/helper';
import { DthMessage } from '../../core/wrapper';
import useLocales from '../../hooks/useLocales';
import OneTableLayout from '../layout/OneTableLayout';
import BusinessPartnerGroupRegistrationForm from './BusinessPartnerGroupRegistrationForm';
import { BASE_URL_GROUP as BASE_URL, gridConfigsGroup as gridConfigs, initSearchParamsGroup as initSearchParams, isRenderAllOrgChart, pageCodeGroup as pageCode } from './helper';

// ----------------------------------------------------------------------

export default function BusinessPartnerGroupList() {
  const { translate } = useLocales();
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [currentBizGroup, setCurrentBizGroup] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [selectedBizGroupId, setSelectedBizGroupId] = useState(null);
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
        disabled: !selectedBizGroupId,
        onClick: () => onClickModify()
      },
      {
        funcType: 'DELETE',
        label: translate(`button.delete`),
        disabled: !selectedBizGroupId,
        onClick: () => onClickDelete()
      }
    ]
  }

  useEffect(async () => {
    if (selectedBizGroupId) {
      const data = await loadSelectedData(BASE_URL, selectedBizGroupId);
      setCurrentBizGroup({
        factoryPk: data.factoryPk,
        factory: data.pk.factoryCode,
        code: data.code,
        name: data.name,
        description: data.description,
        state: data.state
      });
    } else {
      setCurrentBizGroup({});
    }
  }, [selectedBizGroupId]);

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

  const onRowSelected = async (selectedNodes) => {
    const rowCount = selectedNodes.length;
    if (rowCount === 0) {
      setSelectedBizGroupId(null);
    }
    if (rowCount === 1) {
      const bizGroupId = selectedNodes[0].data.factoryPk;
      setSelectedBizGroupId(bizGroupId);
    }
  };

  const onClickAdd = () => {
    setIsEdit(false);
    handleOpenModal();
  };

  const onClickModify = () => {
    if (!selectedBizGroupId) {
      DthMessage({ variant: 'warning', message: translate(`message.please_select_1_business_partner_group`) });
    } else {
      setIsEdit(true);
      handleOpenModal();
    }
  };

  const onClickDelete = () => {
    if (!selectedBizGroupId) {
      DthMessage({ variant: 'warning', message: translate(`message.please_select_1_business_partner_group`) });
    } else {
      setIsEdit(true);
      handleOpenDeleteModal();
    }
  };

  const handleDeleteBizGroup = async () => {
    setSubmitting(true);
    try {
      const res = await deleteSelectedData(BASE_URL, selectedBizGroupId);
      if (res.httpStatusCode === 200) {
        setSubmitting(false);
        DthMessage({ variant: 'success', message: translate(`message.business_partner_group_was_deleted_successfully`) });
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
        title={`${translate(`typo.business_partner_group`)}  ${isEdit ? translate(`typo.modify`) : translate(`typo.register`)}`}
        maxWidth="lg"
        open={isOpenActionModal}
        onClose={handleCloseModal}
      >
        <BusinessPartnerGroupRegistrationForm
          isEdit={isEdit}
          currentData={currentBizGroup}
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
          <LoadingButton type="button" variant="contained" onClick={handleDeleteBizGroup} loading={isSubmitting}>
            {translate(`button.delete`)}
          </LoadingButton>
        </DialogActions>
      </DialogDragable>
    </>
  );
}
