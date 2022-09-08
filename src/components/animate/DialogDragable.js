import PropTypes from 'prop-types';
import { useState } from 'react';
import Draggable from 'react-draggable';
import { motion, AnimatePresence } from 'framer-motion';
import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
// material
import { Dialog, DialogContent, Divider, Paper, DialogTitle, Stack, Typography } from '@material-ui/core';
//
import { varFadeInUp } from './variants';
import { MIconButton } from '../@material-extend';

// ----------------------------------------------------------------------

DialogDragable.propTypes = {
  open: PropTypes.bool.isRequired,
  animate: PropTypes.object,
  onClose: PropTypes.func,
  height: PropTypes.string,
  maxWidth: PropTypes.string,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  disableClose: PropTypes.bool
};

function PaperComponent(props) {
  const [deltaPosition, setDeltaPosition] = useState({ x: 0, y: 0 });
  const [activeDrags, setActiveDrags] = useState(0);

  const onStart = () => {
    const _activeDrags = activeDrags + 1;
    setActiveDrags(_activeDrags);
  };

  const onStop = () => {
    const _activeDrags = activeDrags - 1;
    setActiveDrags(_activeDrags);
  };

  const handleDrag = (e, ui) => {
    const { x, y } = deltaPosition;
    setDeltaPosition(
      {
        x: x + ui.deltaX,
        y: y + ui.deltaY,
      });
  };

  const dragHandlers = { onStart, onStop };
  return (
    <Draggable
      onDrag={handleDrag}
      {...dragHandlers}
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

export default function DialogDragable({ open = false, title, animate, height, onClose, children, maxWidth, disableClose = false, ...other }) {
  return (
    <AnimatePresence>
      {open && (
        <Dialog
          fullWidth
          maxWidth={maxWidth}
          open={open}
          onClose={(event, reason) => {
            if (reason !== 'backdropClick') {
              onClose(event, reason);
            }
          }}
          disableEscapeKeyDown
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
          PaperProps={{
            sx: {
              borderRadius: 0,
              bgcolor: 'background.paper'
            },
            ...(animate || varFadeInUp)
          }}
          {...other}
        >
          <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 0, pr: 1, pl: 1 }}>
              <Typography variant="h5">{title}</Typography>
              <MIconButton disabled={disableClose} onClick={onClose}>
                <Icon icon={closeFill} width={20} height={20} />
              </MIconButton>
            </Stack>
          </DialogTitle>
          <Divider />
          <DialogContent style={{ height: (height || 'auto') }}>

            {children}
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
