/* eslint-disable react/prop-types */
import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Box, Button, DialogActions, Divider, Stack, Typography } from '@material-ui/core';
// material
import { LoadingButton } from '@material-ui/lab';
import { useSnackbar } from 'notistack5';
import { forwardRef, useImperativeHandle, useState } from 'react';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { MIconButton } from '../../components/@material-extend';
import { DialogDragable } from '../../components/animate';
import { mutate, query } from '../../core/api';
import useLocales from '../../hooks/useLocales';
// ----------------------------------------------------------------------

const FactoryDelete = forwardRef(({ onReload, FACTORYID, url }, ref) => {
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { translate, currentLang } = useLocales();
  useImperativeHandle(ref, () => ({
    async openDialogReference() {
      await setDialogOpen();
    }
  }));

  const setDialogOpen = () => {
    setIsOpenDialog(true);
  };

  const closeDialog = () => {
    setIsOpenDialog(false);
  };

  const onHandleDelete = async () => {
    setSubmitting(true);
    if (url.childUrl) {
      const currentUrl = `${url.currentUrl}Pks`;
      await query({
        url: `/v1/operation/${url.childUrl}/search`,
        featureCode: 'user.create',
        params: {
          [currentUrl]: FACTORYID,
          state: 'RUNNING'
        }
      })
        .then((res) => {
          setSubmitting(false);
          if (res.data.length === 0) {
            operationHierachyDelete();
          } else {
            enqueueSnackbar(translate(`message.lower_level_exist._you_can_not_delete_!`), {
              variant: 'warning',
              action: (key) => (
                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                  <Icon icon={closeFill} />
                </MIconButton>
              )
            });
          }
        })
        .catch((error) => {
          setSubmitting(false);
          console.error(error);
        });
    } else {
      operationHierachyDelete();
    }
  };

  const operationHierachyDelete = () => {
    try {
      mutate({
        url: `/v1/operation/${url.currentUrl}/${FACTORYID}`,
        method: 'delete',
        featureCode: 'user.delete'
      })
        .then(() => {
          setSubmitting(false);
          enqueueSnackbar('Delete success', { variant: 'success' });
          closeDialog();
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
    <DialogDragable title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenDialog} onClose={closeDialog}>
      <Typography variant="subtitle1" align="center">
        {translate(`typo.do_you_want_to_delete`)}?
      </Typography>
      <DialogActions>
        <Box sx={{ flexGrow: 1 }} />
        <Button type="button" variant="outlined" color="inherit" onClick={closeDialog}>
          {translate(`button.no`)}
        </Button>
        <LoadingButton type="button" variant="contained" onClick={onHandleDelete}>
          {translate(`button.yes`)}
        </LoadingButton>
      </DialogActions>
    </DialogDragable>
  );
});

export default FactoryDelete;
