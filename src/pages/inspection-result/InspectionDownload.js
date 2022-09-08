import { useEffect, useState } from 'react';
import { Autocomplete, Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import useLocales from '../../hooks/useLocales';
import { UploadMultiFile } from '../../components/upload';

InspectionDownload.propTypes = {
  isView: PropTypes.bool,
  onCancel: PropTypes.func,
  currentData: PropTypes.array
};

export default function InspectionDownload({ onCancel, isView, currentData }) {
  const [files, setFiles] = useState();
  const { translate, currentLang } = useLocales();
  useEffect(() => {
    setFiles(currentData.attachedFiles);
  }, [currentData]);
  return (
    <Card sx={{ pb: 1, height: 'auto', minHeight: { xs: '20vh' } }}>
      <Stack sx={{ px: 1, py: 2 }} spacing={{ xs: 2, sm: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography sx={{ mb: 2 }} variant="h6">
            {translate(`typo.file_attachment`)}
          </Typography>
        </Stack>
        <UploadMultiFile
          accept=".jpeg, .jpg, .png"
          sx={{ mb: 2 }}
          showPreview={false}
          files={files}
          disabled={isView}
          isView={isView}
          isDownload="true"
        />
      </Stack>
      <Stack direction="row" justifyContent="right" display="flex" alignItems="center" sx={{ py: 1 }}>
        <Button type="button" variant="outlined" color="inherit" onClick={onCancel} sx={{ mr: 1 }}>
        {translate(`button.close`)}
        </Button>
      </Stack>
    </Card>
  );
}
