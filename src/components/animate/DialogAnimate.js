import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
// material
import { Dialog, DialogContent, Typography, Divider, DialogTitle, Stack } from '@material-ui/core';
import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
//
import { varFadeInUp } from './variants';
import { MIconButton } from '../@material-extend';

// ----------------------------------------------------------------------

DialogAnimate.propTypes = {
  open: PropTypes.bool.isRequired,
  animate: PropTypes.object,
  onClose: PropTypes.func,
  height: PropTypes.string,
  maxWidth: PropTypes.string,
  children: PropTypes.node.isRequired
};

export default function DialogAnimate({ open = false, title, animate, height, onClose, children, maxWidth, ...other }) {
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
          PaperComponent={motion.div}
          PaperProps={{
            sx: {
              borderRadius: 0,
              bgcolor: 'background.paper'
            },
            ...(animate || varFadeInUp)
          }}
          {...other}
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 0, pr: 1, pl: 1 }}>
              <Typography variant="h5">{title}</Typography>
              <MIconButton onClick={onClose}>
                <Icon icon={closeFill} width={20} height={20} />
              </MIconButton>
            </Stack>
          </DialogTitle>
          <Divider sx={{ mb: 1 }} />
          <DialogContent style={{ height: (height || 'auto') }}>

            {children}
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
