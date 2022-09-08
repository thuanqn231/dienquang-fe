import closeFill from '@iconify/icons-eva/close-fill';
import fileFill from '@iconify/icons-eva/file-fill';
import { Icon } from '@iconify/react';
import { isEmpty, isString } from 'lodash';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
// material
import { alpha, styled } from '@material-ui/core/styles';
import { AnimatePresence, motion } from 'framer-motion';
import { Paper, Box, Typography, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@material-ui/core';
// utils
import { fData } from '../../utils/formatNumber';
import { varFadeInRight } from '../animate';
import useLocales from '../../hooks/useLocales';

import { MIconButton } from '../@material-extend';
// ----------------------------------------------------------------------

const DropZoneStyle = styled('div')(({ theme }) => ({
  outline: 'none',
  display: 'flex',
  overflow: 'hidden',
  textAlign: 'center',
  position: 'relative',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(1, 0),
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create('padding'),
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey[500_32]}`,
  '&:hover': {
    opacity: 0.72,
    cursor: 'pointer'
  },
  [theme.breakpoints.up('md')]: { textAlign: 'left', flexDirection: 'row' }
}));

// ----------------------------------------------------------------------

UploadSingleFile.propTypes = {
  error: PropTypes.bool,
  file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  sx: PropTypes.object
};

export default function UploadSingleFile({ error, file, onRemove, sx, ...other }) {
  const hasFile = !isEmpty(file);
  const { translate } = useLocales();
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple: false,
    ...other
  });

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
            &nbsp;{translate(`typo.thorough_your_machine`)}
          </Typography>
        </Box>
      </DropZoneStyle>

      {fileRejections.length > 0 && <ShowRejectionItems />}
      {hasFile && <List disablePadding sx={{ ...(hasFile && { mb: 1 }) }}>
        <AnimatePresence>
          <ListItem
            key={file.name}
            component={motion.div}
            {...varFadeInRight}
            sx={{
              my: 0.25,
              py: 0.25,
              px: 2,
              border: (theme) => `solid 1px ${theme.palette.divider}`,
              bgcolor: 'background.paper'
            }}
          >
            <ListItemIcon>
              <Icon icon={fileFill} width={16} height={16} />
            </ListItemIcon>
            <ListItemText
              primary={`${file.name} (${fData(file.size)})`}
              primaryTypographyProps={{ variant: 'subtitle2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
            <ListItemSecondaryAction>
              <MIconButton edge="end" size="small" onClick={() => onRemove()}>
                <Icon icon={closeFill} />
              </MIconButton>
            </ListItemSecondaryAction>
          </ListItem>
        </AnimatePresence>
      </List>
      }
    </Box>
  );
}
