import { Box, Button, DialogActions, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { useEffect, useRef, useState } from 'react';
import { DialogDragable } from '../../components/animate';
import { stateParam } from '../../core/constants';
import { deleteSelectedData, loadSelectedData } from '../../core/helper';
import { DthMessage } from '../../core/wrapper';
import useLocales from '../../hooks/useLocales';
import { getBizPartnerCodeDropdown, getBizPartnerGroupDropdown } from '../../redux/slices/bizPartnerManagement';
import { useDispatch, useSelector } from '../../redux/store';
import OneTableLayout from '../layout/OneTableLayout';
import BusinessPartnerCodeRegistrationForm from './BusinessPartnerCodeRegistrationForm';
import { BASE_URL_CODE as BASE_URL, gridConfigsCode as gridConfigs, isRenderAllOrgChart, pageCodeCode as pageCode } from './helper';

// ----------------------------------------------------------------------

export default function BusinessPartnerCodeList() {
  const dispatch = useDispatch();
  const { translate } = useLocales();
  const { bizPartnerGroupDropdown } = useSelector((state) => state.bizPartnerManagement);
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [currentBizCode, setCurrentBizCode] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [selectedBizCodeId, setSelectedBizCodeId] = useState(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const layoutRef = useRef(null);

  const initSearchParams = {
    [pageCode]: [
      {
        type: 'dropdown',
        id: 'partnerGroup',
        label: 'Biz. Group',
        options: bizPartnerGroupDropdown,
        defaultValue: ''
      },
      {
        type: 'dropdown',
        id: 'type',
        label: 'Biz. Type',
        groupId: 'D028000',
        defaultValue: ''
      },
      {
        type: 'textfield',
        id: 'code',
        label: 'Biz. Partner Code',
        defaultValue: ''
      },
      {
        type: 'textfield',
        id: 'englishName',
        label: 'English Name',
        defaultValue: ''
      },
      {
        type: 'textfield',
        id: 'nationalName',
        label: 'English Name',
        defaultValue: ''
      },
      {
        type: 'dropdown',
        id: 'tradeType',
        label: 'Trade Type',
        groupId: 'D029000',
        defaultValue: ''
      },
      {
        type: 'textfield',
        id: 'tax',
        label: 'Tax Code',
        defaultValue: ''
      },
      stateParam
    ]
  }

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
        disabled: !selectedBizCodeId,
        onClick: () => onClickModify()
      },
      {
        funcType: 'DELETE',
        label: translate(`button.delete`),
        disabled: !selectedBizCodeId,
        onClick: () => onClickDelete()
      }
    ]
  }

  useEffect(() => {
    dispatch(getBizPartnerGroupDropdown());
    dispatch(getBizPartnerCodeDropdown())
  }, [dispatch]);

  useEffect(async () => {
    if (selectedBizCodeId) {
      const data = await loadSelectedData(BASE_URL, selectedBizCodeId);
      setCurrentBizCode({
        factoryPk: data.factoryPk,
        factory: data.pk.factoryCode,
        partnerGroup: data?.partnerGroup?.factoryPk,
        type: data?.type?.code,
        code: data.code,
        englishName: data.englishName,
        nationalName: data.nationalName,
        tradeType: data?.tradeType?.code,
        paymentTerm: data?.paymentTerm?.code,
        incoterm: data?.incoterm?.code,
        vat: data?.vat?.code,
        taxCode: data.taxCode,
        currency: data.currency?.code,
        phone: data.phone,
        fax: data.fax,
        address: data.address,
        taxAddress: data.taxAddress,
        email: data.email,
        representative: data.representative,
        pic: data.pic,
        state: data.state
      });
    } else {
      setCurrentBizCode({});
    }
  }, [selectedBizCodeId]);

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
      setSelectedBizCodeId(null);
    }
    if (rowCount === 1) {
      const bizCodeId = selectedNodes[0].data.factoryPk;
      setSelectedBizCodeId(bizCodeId);
    }
  }

  const onClickAdd = () => {
    setIsEdit(false);
    handleOpenModal();
  };

  const onClickModify = () => {
    if (!selectedBizCodeId) {
      selectWarning();
    } else {
      setIsEdit(true);
      handleOpenModal();
    }
  };

  const onClickDelete = () => {
    if (!selectedBizCodeId) {
      selectWarning();
    } else {
      setIsEdit(true);
      handleOpenDeleteModal();
    }
  };

  const selectWarning = () => {
    DthMessage({ variant: 'warning', message: translate(`message.please_select_1_business_partner_code`) });
  }

  const handleDeleteBizCode = async () => {
    setSubmitting(true);
    try {
      const res = await deleteSelectedData(BASE_URL, selectedBizCodeId);
      if (res.httpStatusCode === 200) {
        setSubmitting(false);
        DthMessage({ variant: 'success', message: translate(`message.business_partner_code_was_deleted_successfully`) });
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
        title={`${translate(`typo.business_partner_code`)}  ${isEdit ? translate(`typo.modify`) : translate(`typo.register`)}`}
        maxWidth="lg"
        open={isOpenActionModal}
        onClose={handleCloseModal}
      >
        <BusinessPartnerCodeRegistrationForm
          isEdit={isEdit}
          currentData={currentBizCode}
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
          <LoadingButton type="button" variant="contained" onClick={handleDeleteBizCode} loading={isSubmitting}>
            {translate(`button.delete`)}
          </LoadingButton>
        </DialogActions>
      </DialogDragable>
    </>
  );
}
