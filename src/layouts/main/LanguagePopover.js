import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import baselineLanguage from '@iconify/icons-ic/baseline-language';
// material
import { alpha } from '@material-ui/core/styles';
import { Box, MenuItem, ListItemIcon, ListItemText } from '@material-ui/core';
// hooks
import useLocales from '../../hooks/useLocales';
// components
import MenuPopover from '../../components/MenuPopover';
import { MIconButton, MHidden } from '../../components/@material-extend';

// ----------------------------------------------------------------------

LanguagePopover.propTypes = {
  showLabel: PropTypes.bool,
  color: PropTypes.string
};

LanguagePopover.defaultProps = {
  showLabel: true,
  color: 'common.white'
};

export default function LanguagePopover({ showLabel, color }) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { allLang, currentLang, onChangeLang } = useLocales();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChangeLang = (value) => {
    onChangeLang(value);
    handleClose();
  };

  return (
    <>
      <MIconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          mx: 1,
          padding: 0,
          height: 30,
          ...(open && {
            bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.focusOpacity)
          }),
          color
        }}
      >
        {
          showLabel &&
          <MHidden width="xlDown">
            <ListItemText primaryTypographyProps={{ variant: 'body2', color }}>{currentLang.label}</ListItemText>
          </MHidden>
        }
        <Icon icon={baselineLanguage} width={24} height={24} />
      </MIconButton>

      <MenuPopover open={open} onClose={handleClose} anchorEl={anchorRef.current} sx={{ py: 1 }}>
        {allLang.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === currentLang.value}
            onClick={() => handleChangeLang(option.value)}
            sx={{ py: 1, px: 2.5 }}
          >
            <ListItemIcon>
              <Box component="img" alt={option.label} src={option.icon} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ variant: 'body2' }}>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </MenuPopover>
    </>
  );
}
