import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import externalLinkFill from '@iconify/icons-eva/external-link-fill';
// material
import { alpha } from '@material-ui/core/styles';
import { Box, MenuItem, ListItemIcon, ListItemText, Tooltip } from '@material-ui/core';
// hooks
import useLocales from '../../hooks/useLocales';
// components
import MenuPopover from '../../components/MenuPopover';
import { MIconButton, MHidden } from '../../components/@material-extend';

// ----------------------------------------------------------------------

const externalLinks = [
  {
    link: '/pages/C002000',
    label: 'UI'
  },
  // {
  //   link: '/oi/O01010101',
  //   label: 'OI'
  // },
  {
    link: '/fmb/F01010101/FAC01',
    label: 'Production Status'
  },
  {
    link: '/fmb/F01010102/FAC01',
    label: 'Stuffing Status'
  },
  {
    link: '/fmb/F01010103/FAC01/RO01',
    label: 'Line Status'
  }
];

export default function ExternalLinkPopover() {
  const anchorRef = useRef(null);
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { allLang, currentLang, onChangeLang } = useLocales();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const isActive = (link, option) => {
    if (link.includes('/pages') && option === 'UI') return true;
    if (link.includes('/oi') && option === 'OI') return true;
    if (link.includes('/fmb/F01010101') && option === 'Production Status') return true;
    if (link.includes('/fmb/F01010102') && option === 'Stuffing Status') return true;
    if (link.includes('/fmb/F01010103') && option === 'Line Status') return true;
    return false;
  };

  return (
    <>
      <Tooltip title="External Link">
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
            color: 'common.white'
          }}
        >
          <Icon icon={externalLinkFill} width={24} height={24} />
        </MIconButton>
      </Tooltip>

      <MenuPopover open={open} onClose={handleClose} anchorEl={anchorRef.current} sx={{ py: 1 }}>
        {externalLinks.map((option) => (
          <MenuItem
            key={option.label}
            selected={isActive(pathname, option.label)}
            onClick={() => navigate(option.link)}
            sx={{ py: 1, px: 2.5 }}
          >
            <ListItemText primaryTypographyProps={{ variant: 'body1' }}>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </MenuPopover>
    </>
  );
}
