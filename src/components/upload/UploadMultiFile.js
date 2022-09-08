import closeFill from '@iconify/icons-eva/close-fill';
import fileFill from '@iconify/icons-eva/file-fill';
import { Icon } from '@iconify/react';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Stack,
  Typography
} from '@material-ui/core';
// material
import { alpha, styled } from '@material-ui/core/styles';
import { AnimatePresence, motion } from 'framer-motion';
import { isString } from 'lodash';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
// utils
import { fData } from '../../utils/formatNumber';
//
import { MIconButton } from '../@material-extend';
import { varFadeInRight } from '../animate';
import useLocales from '../../hooks/useLocales';

// ----------------------------------------------------------------------

const DropZoneStyle = styled('div')(({ theme }) => ({
  outline: 'none',
  display: 'flex',
  textAlign: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(5, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey[500_32]}`,
  '&:hover': { opacity: 0.72, cursor: 'pointer' },
  [theme.breakpoints.up('md')]: { textAlign: 'left', flexDirection: 'row' }
}));

// ----------------------------------------------------------------------

UploadMultiFile.propTypes = {
  error: PropTypes.bool,
  showPreview: PropTypes.bool,
  files: PropTypes.array,
  onRemove: PropTypes.func,
  onRemoveAll: PropTypes.func,
  sx: PropTypes.object,
  isDownload: PropTypes.bool
};

export default function UploadMultiFile({
  isDownload,
  isUploadImage,
  isView,
  error,
  showPreview = false,
  files,
  onRemove,
  onRemoveAll,
  sx,
  ...other
}) {
  const hasFile = files && files.length > 0;
  const { translate } = useLocales();

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    ...other
  });

  const onDownLoadFile = (fileName, downloadUrl) => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = downloadUrl;
    link.click();
  };

  const ShowRejectionItems = () => (
    <Paper
      variant="outlined"
      sx={{
        py: 1,
        px: 2,
        mt: 3,
        borderColor: 'error.light',
        bgcolor: (theme) => alpha(theme.palette.error.main, 0.08)
      }}
    >
      {fileRejections.map(({ file, errors }) => {
        const { path, size } = file;
        return (
          <Box key={path} sx={{ my: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {path} - {fData(size)}
            </Typography>
            {errors.map((e) => (
              <Typography key={e.code} variant="caption" component="p">
                - {e.message}
              </Typography>
            ))}
          </Box>
        );
      })}
    </Paper>
  );

  return (
    <Box sx={{ width: '100%', ...sx }}>
      {!isDownload && (
        <DropZoneStyle
          {...getRootProps()}
          sx={{
            ...(isDragActive && { opacity: 0.72 }),
            ...((isDragReject || error) && {
              color: 'error.main',
              borderColor: 'error.light',
              bgcolor: 'error.lighter'
            }),
            p: 0
          }}
        >
          <input {...getInputProps()} />
          <Box sx={{ p: 2, ml: { md: 2 } }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {translate(`typo.drop_files_here_or_click`)}&nbsp;
              <Typography variant="body2" component="span" sx={{ color: 'primary.main', textDecoration: 'underline' }}>
                {translate(`typo.browse`)}
              </Typography>
              &nbsp;{translate(`typo.through_your_computer`)}
            </Typography>
          </Box>
        </DropZoneStyle>
      )}

      {fileRejections.length > 0 && <ShowRejectionItems />}
      {hasFile && !isView && (
        <Stack direction="row" justifyContent="flex-end">
          <Button onClick={onRemoveAll} sx={{ mr: 1.5 }} size="small">
            Remove all
          </Button>
        </Stack>
      )}
      <List disablePadding sx={{ ...(hasFile && { mb: 1 }) }}>
        {files && (
          <AnimatePresence>
            {files.map((file) => {
              const { name, size, preview } = file;
              const key = isString(file) ? file : name;

              if (showPreview) {
                return (
                  <ListItem
                    key={key}
                    component={motion.div}
                    {...varFadeInRight}
                    sx={{
                      p: 0,
                      m: 0.5,
                      width: 80,
                      height: 80,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'inline-flex'
                    }}
                  >
                    <Paper
                      variant="outlined"
                      component="img"
                      src={isString(file) ? file : preview}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }}
                    />
                    {!isView && (
                      <Box sx={{ top: 6, right: 6, position: 'absolute' }}>
                        <MIconButton
                          size="small"
                          onClick={() => onRemove(file)}
                          sx={{
                            p: '2px',
                            color: 'common.white',
                            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                            '&:hover': {
                              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48)
                            }
                          }}
                        >
                          <Icon icon={closeFill} />
                        </MIconButton>
                      </Box>
                    )}
                  </ListItem>
                );
              }

              return (
                <ListItem
                  key={key}
                  component={motion.div}
                  {...varFadeInRight}
                  sx={{
                    my: 0.25,
                    py: 0.25,
                    px: 2,
                    border: (theme) => `solid 1px ${theme.palette.divider}`,
                    bgcolor: 'background.paper',
                    '&:hover': {
                      cursor: isDownload && 'pointer'
                    }
                  }}
                  onClick={isView && (() => onDownLoadFile(name, file.downloadUrl))}
                >
                  <ListItemIcon>
                    <Icon icon={fileFill} width={16} height={16} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${isString(file) ? file : name || file.originName} (${
                      isString(file) ? '' : fData(size)
                    })`}
                    // secondary={isString(file) ? '' : fData(size)}
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  {!isView && (
                    <ListItemSecondaryAction>
                      <MIconButton edge="end" size="small" onClick={() => onRemove(file)}>
                        <Icon icon={closeFill} />
                      </MIconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              );
            })}
          </AnimatePresence>
        )}
      </List>
    </Box>
  );
}
