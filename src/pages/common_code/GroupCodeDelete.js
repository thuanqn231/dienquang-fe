/* eslint-disable react/prop-types */
import { Box, Button, DialogActions, Typography } from '@material-ui/core';
// material
import { LoadingButton } from '@material-ui/lab';
import { useSnackbar } from 'notistack5';
import { forwardRef, useImperativeHandle, useState } from 'react';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { DialogAnimate } from '../../components/animate';
import { mutate } from '../../core/api';
// hooks
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// ----------------------------------------------------------------------

const CommonCodeDelete = forwardRef(({ onReload, SELECTEDID }, ref) => {
  const { updateCommonDropdown } = useAuth();
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [isSubmitting, setSubmitting] = useState(false);
  useImperativeHandle(ref, () => ({
    async openDialogReference() {
      await setDialogOpen();
    }
  }));
  const { translate } = useLocales();

  const setDialogOpen = () => {
    setIsOpenDialog(true);
  };

  const closeDialog = () => {
    setIsOpenDialog(false);
  };

  const onHandleDelete = async () => {
    setSubmitting(true);
    try {
      await mutate({
        url: `/v1/common_code/${SELECTEDID}`,
        method: 'delete',
        featureCode: 'user.delete'
      })
        .then(() => {
          setSubmitting(false);
          enqueueSnackbar('Delete success', { variant: 'success' });
          closeDialog();
          updateCommonDropdown();
          onReload();
        })
        .catch((error) => {
          setSubmitting(false);
          console.error(error);
        });
    } catch (error) {
      setSubmitting(false);
      console.error(error);
    }
  };
  return (
    <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenDialog} onClose={closeDialog}>
      <Typography variant="subtitle1" align="center">
        {translate(`typo.do_you_want_to_delete`)}
      </Typography>
      <DialogActions>
        <Box sx={{ flexGrow: 1 }} />
        <Button type="button" variant="outlined" color="inherit" onClick={closeDialog}>
          {translate(`button.no`)}
        </Button>
        <LoadingButton type="button" variant="contained" onClick={onHandleDelete} loading={isSubmitting}>
          {translate(`button.yes`)}
        </LoadingButton>
      </DialogActions>
    </DialogAnimate>
  );
});

export default CommonCodeDelete;
