import { Box, Button, DialogActions, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { isEmpty } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import { DialogDragable } from '../../components/animate';
import { UploadExcelFile } from '../../components/upload';
import { createUpdateData, deleteSelectedData, loadSelectedData } from '../../core/helper';
import { DthMessage } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import { closeUserInfoActionModal, openUserInfoActionModal } from '../../redux/slices/userManagement';
import { useDispatch, useSelector } from '../../redux/store';
import OneTableLayout from '../layout/OneTableLayout';
import AuthorityRegistrationForm from './AuthorityRegistrationForm';
import { BASE_URL, getWidgetCode, gridConfigs, initSearchParams, isRenderAllOrgChart, pageCode } from './helper';
import UserRegistrationForm from './UserRegistrationForm';

// ----------------------------------------------------------------------

export default function UserInformationList() {
  const { translate } = useLocales();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { isOpenUserInfoActionModal } = useSelector((state) => state.userManagement.userInformation);
  const { selectedWidget } = useSelector((state) => state.page);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState({});
  const [isOpenActionModal, setIsOpenActionModal] = useState(false);
  const [dialogParams, setDialogParams] = useState({
    dialogHeader: '',
    dialogMessage: '',
    dialogAction: () => { }
  });
  const [isOpenUserUploadModal, setIsOpenUserUploadModal] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const pageSelectedWidget = selectedWidget[pageCode];
  const layoutRef = useRef(null);

  const actionButtons = {
    [getWidgetCode('userInfo')]: [
      {
        funcType: 'CREATE',
        label: translate(`button.upload`),
        disabled: false,
        onClick: () => handleOpenUploadModal()
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
        disabled: !selectedUserId,
        onClick: () => onClickModify()
      },
      {
        funcType: 'EXECUTE',
        label: translate(`button.lock`),
        disabled: !selectedUserId || currentUser.userState === 'BLOCKED',
        onClick: () => onClickLock()
      },
      {
        funcType: 'EXECUTE',
        label: translate(`button.unlock`),
        disabled: !selectedUserId || currentUser.userState !== 'BLOCKED',
        onClick: () => onClickUnlock()
      },
      {
        funcType: 'DELETE',
        label: translate(`button.delete`),
        disabled: !selectedUserId,
        onClick: () => onClickDelete()
      }
    ],
    [getWidgetCode('userAuthorization')]: [
      {
        funcType: 'UPDATE',
        label: translate(`button.grantAuthority`),
        disabled: !selectedUserId,
        onClick: () => onClickModify()
      },
    ],
  };

  useEffect(async () => {
    if (selectedUserId) {
      const data = await loadSelectedData(BASE_URL, selectedUserId);
      const { organizationalChartProduction } = data;
      let factoryPks = [user.factory.factoryPk];
      let plantPks = [];
      let teamPks = [];
      let groupPks = [];
      let partPks = [];
      if (!isEmpty(organizationalChartProduction.factoryPks)) {
        factoryPks = organizationalChartProduction.factoryPks.map((factoryPk) => `${factoryPk.factoryCode}-${factoryPk.id}`)
      }
      if (!isEmpty(organizationalChartProduction.plantPks)) {
        plantPks = organizationalChartProduction.plantPks.map((factoryPk) => `${factoryPk.factoryCode}-${factoryPk.id}`)
      }
      if (!isEmpty(organizationalChartProduction.teamPks)) {
        teamPks = organizationalChartProduction.teamPks.map((factoryPk) => `${factoryPk.factoryCode}-${factoryPk.id}`)
      }
      if (!isEmpty(organizationalChartProduction.groupPks)) {
        groupPks = organizationalChartProduction.groupPks.map((factoryPk) => `${factoryPk.factoryCode}-${factoryPk.id}`)
      }
      if (!isEmpty(organizationalChartProduction.partPks)) {
        partPks = organizationalChartProduction.partPks.map((factoryPk) => `${factoryPk.factoryCode}-${factoryPk.id}`)
      }
      setCurrentUser({
        ...data,
        factoryPks,
        plantPks,
        teamPks,
        groupPks,
        partPks,
      });
    } else {
      setCurrentUser({});
    }
  }, [selectedUserId]);


  const handleOpenActionModal = () => {
    setIsOpenActionModal(true);
  };

  const handleCloseActionModal = () => {
    setIsOpenActionModal(false);
  };

  const handleCloseModal = () => {
    dispatch(closeUserInfoActionModal());
  };

  const handleOpenModal = () => {
    dispatch(openUserInfoActionModal());
  };

  const handleCloseUploadModal = () => {
    setIsOpenUserUploadModal(false);
  };

  const handleOpenUploadModal = () => {
    setIsOpenUserUploadModal(true);
  };

  const onRowSelected = (selectedNodes) => {
    const rowCount = selectedNodes.length;
    if (rowCount === 0) {
      setSelectedUserId(null);
    }
    if (rowCount === 1) {
      const userId = selectedNodes[0].data.factoryPk;
      setSelectedUserId(userId);
    }
  };

  const onClickAdd = () => {
    setIsEdit(false);
    handleOpenModal();
  };

  const onClickModify = () => {
    if (!selectedUserId) {
      selectWarning();
    } else {
      setIsEdit(true);
      handleOpenModal();
    }
  };

  const onClickLock = () => {
    if (!selectedUserId) {
      selectWarning();
    } else {
      setDialogParams({
        dialogHeader: 'Lock',
        dialogMessage: 'Do you want to Lock?',
        dialogAction: () => handleLockUser()
      });
      handleOpenActionModal();
    }
  };

  const selectWarning = () => {
    DthMessage({ variant: 'warning', message: translate(`message.please_select_1_user`) });
  }

  const onClickUnlock = () => {
    if (!selectedUserId) {
      selectWarning();
    } else {
      setDialogParams({
        dialogHeader: 'Unlock',
        dialogMessage: 'Do you want to Unlock?',
        dialogAction: () => handleUnlockUser()
      });
      handleOpenActionModal();
    }
  };

  const onClickDelete = () => {
    if (!selectedUserId) {
      selectWarning();
    } else {
      setDialogParams({
        dialogHeader: 'Delete',
        dialogMessage: 'Do you want to Delete?',
        dialogAction: () => handleDeleteUser()
      });
      handleOpenActionModal();
    }
  };

  const handleLockUser = async () => {
    setSubmitting(true);
    try {
      const updateParams = {
        factoryPk: selectedUserId,
        userState: 'BLOCKED'
      }
      const response = await createUpdateData(`${BASE_URL}/update`, 'user', updateParams);
      if (response.httpStatusCode === 200) {
        setSubmitting(false);
        handleCloseActionModal();
        onLoadData();
        DthMessage({ variant: 'success', message: translate(`message.lock_user_successful`) });
      }
    } catch (error) {
      setSubmitting(false);
      console.error(error);
    }
  };

  const handleUnlockUser = async () => {
    setSubmitting(true);
    try {
      const updateParams = {
        factoryPk: selectedUserId,
        userState: 'VALID'
      }
      const response = await createUpdateData(`${BASE_URL}/update`, 'user', updateParams);
      if (response.httpStatusCode === 200) {
        setSubmitting(false);
        handleCloseActionModal();
        onLoadData();
        DthMessage({ variant: 'success', message: translate(`message.unlock_user_successful`) });
      }
    } catch (error) {
      setSubmitting(false);
      console.error(error);
    }
  };

  const handleDeleteUser = async () => {
    setSubmitting(true);
    try {
      const res = await deleteSelectedData(BASE_URL, selectedUserId);
      if (res.httpStatusCode === 200) {
        DthMessage({ variant: 'success', message: translate(`message.delete_user_successful`) });
        setSubmitting(false);
        handleCloseActionModal();
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
        title={pageSelectedWidget?.widgetName === 'User Info' ? translate(`typo.user_registration`) : translate(`typo.authoriry_registration`)}
        maxWidth="lg"
        open={isOpenUserInfoActionModal}
        onClose={handleCloseModal}
      >
        {pageSelectedWidget?.widgetName === 'User Info' && (
          <UserRegistrationForm
            isEdit={isEdit}
            currentData={currentUser}
            onCancel={handleCloseModal}
            onLoadData={onLoadData}
          />
        )}
        {pageSelectedWidget?.widgetName === 'User Authorization' && (
          <AuthorityRegistrationForm
            isEdit={isEdit}
            currentData={currentUser}
            onCancel={handleCloseModal}
            onLoadData={onLoadData}
          />
        )}
      </DialogDragable>
      <DialogDragable
        title={translate(`typo.user_information_upload`)}
        maxWidth="sm"
        open={isOpenUserUploadModal}
        onClose={handleCloseUploadModal}
      >
        <UploadExcelFile
          onCancel={handleCloseUploadModal}
          onLoadData={onLoadData}
          templateCode="USER_TEMPLATE_1"
        />
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
