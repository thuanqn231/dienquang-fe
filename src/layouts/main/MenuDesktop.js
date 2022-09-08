import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import homeFill from '@iconify/icons-eva/home-fill';
import arrowIosUpwardFill from '@iconify/icons-eva/arrow-ios-upward-fill';
import { Icon } from '@iconify/react';
import { Box, Divider, Grid, Link, List, ListItem, ListSubheader, Popover, Stack } from '@material-ui/core';
// material
import { styled, alpha } from '@material-ui/core/styles';
import { isUndefined, isEmpty } from 'lodash-es';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { NavLink as RouterLink, useLocation } from 'react-router-dom';

// ----------------------------------------------------------------------

const LinkStyle = styled(Link)(({ theme }) => ({
  ...theme.typography.h6,
  width: 'max-content',
  color: theme.palette.text.primary,
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(2),
  transition: theme.transitions.create('opacity', {
    duration: theme.transitions.duration.shortest
  }),
  '&:hover': {
    opacity: 0.48,
    textDecoration: 'none'
  }
}));

// ----------------------------------------------------------------------

IconBullet.propTypes = {
  type: PropTypes.oneOf(['subheader', 'item'])
};

function IconBullet({ type = 'item' }) {
  return (
    <Box sx={{ width: 24, height: 16, display: 'flex', alignItems: 'center' }}>
      <Box
        component="span"
        sx={{
          ml: '2px',
          width: 4,
          height: 4,
          borderRadius: '50%',
          bgcolor: 'currentColor',
          ...(type !== 'item' && { ml: 0, width: 8, height: 2, borderRadius: 2 })
        }}
      />
    </Box>
  );
}

MenuDesktopItem.propTypes = {
  item: PropTypes.object,
  pathname: PropTypes.string,
  isHome: PropTypes.bool,
  isOffset: PropTypes.bool,
  isOpen: PropTypes.bool,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  openId: PropTypes.string
};

const RenderSubMenu = ({ menuItems, marginLeft, pathname }) => {
  const subMenuItems = menuItems.map((item) => {
    const { name, subFeatures, description, code, permissions, kind } = item;
    if (isUndefined(subFeatures) || isEmpty(subFeatures) || (!isEmpty(subFeatures) && description.includes("/pages"))) {
      return (
        permissions.includes("READ") && kind === "MENU" &&
        <ListItem
          key={code}
          to={description}
          component={RouterLink}
          underline="none"
          sx={{
            p: 0,
            mt: 0.5,
            typography: 'body2',
            color: 'text.secondary',
            ml: marginLeft,
            transition: (theme) => theme.transitions.create('color'),
            '&:hover': {
              color: 'text.primary',
              bgcolor: (theme) => alpha(theme.palette.grey[500_32], 0.48)
            },
            ...(description === pathname && {
              color: 'text.primary',
              bgcolor: (theme) => alpha(theme.palette.grey[500_32], 0.48)
            })
          }}
        >
          <>
            <IconBullet />
            {name}
          </>
        </ListItem>
      )
    }
    const newMarginLeft = marginLeft + 1;
    const subMenu = <RenderSubMenu menuItems={subFeatures} marginLeft={newMarginLeft} pathname={pathname} />;
    return (
      permissions.includes("READ") && kind === "MENU" &&
      <>
        <ListSubheader
          disableSticky
          disableGutters
          key={code}
          sx={{
            display: 'flex',
            lineHeight: 'unset',
            alignItems: 'center',
            color: 'text.primary',
            typography: 'subtitle2',
            ml: marginLeft
          }}
        >
          <IconBullet type="subheader" /> {name}
        </ListSubheader>
        {subMenu}
        <Divider />
      </>
    );
  });


  return (
    <>
      {subMenuItems}
    </>
  )
}

RenderSubMenu.propTypes = {
  menuItems: PropTypes.array,
  pathname: PropTypes.string,
  marginLeft: PropTypes.number
};

function MenuDesktopItem({ item, pathname, isOpen, isHome, openId, isOffset, onOpen, onClose, isActive }) {
  const { name, description, subFeatures, code } = item;
  const isOpenPopover = openId === code && isOpen;

  if (!isEmpty(subFeatures)) {
    return (
      <div key={code}>
        <LinkStyle
          key={code}
          onClick={() => onOpen(code)}
          sx={{
            display: 'flex',
            cursor: 'pointer',
            alignItems: 'center',
            ...((isHome || isOffset) && { color: 'common.white' }),
            ...(isOpenPopover && { opacity: 0.48 }),
            ...(isActive && { color: 'primary.main', fontWeight: 'bold' })
          }}
        >
          {name}
          <Box
            component={Icon}
            icon={isOpenPopover ? arrowIosUpwardFill : arrowIosDownwardFill}
            sx={{ ml: 0.5, width: 16, height: 16 }}
          />
        </LinkStyle>

        <Popover
          open={isOpenPopover}
          key={`pop-${openId}`}
          anchorReference="anchorPosition"
          anchorPosition={{ top: 120, left: 0 }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          onClose={onClose}
          PaperProps={{
            sx: {
              px: 1,
              pt: 1,
              pb: 1,
              right: 16,
              margin: 'auto',
              borderRadius: 2,
              boxShadow: (theme) => theme.customShadows.z24,
              top: '96px !important',
              maxHeight: `calc(100% - 15vh)`
            }
          }}
        >
          <Grid container spacing={3}>
            {
              subFeatures.map((level2) => {
                const { name, subFeatures, code, permissions, kind } = level2;

                return (

                  permissions.includes("READ") && kind === "MENU" &&
                  <Grid key={code} item xs={12} md={2} >
                    <List disablePadding>
                      <ListSubheader
                        key={code}
                        disableSticky
                        disableGutters
                        sx={{
                          display: 'flex',
                          lineHeight: 'unset',
                          alignItems: 'center',
                          color: 'text.primary',
                          typography: 'h6'
                        }}
                      >
                        <IconBullet type="subheader" /> {name}
                      </ListSubheader>
                      <Divider sx={{ borderBottomWidth: 'medium', borderColor: (theme) => theme.palette.grey[500_32] }} />

                      {
                        !isEmpty(subFeatures) && <RenderSubMenu menuItems={subFeatures} marginLeft={1} pathname={pathname} />
                      }

                    </List>
                  </Grid>
                );
              })}
          </Grid>
        </Popover>
      </div >
    );
  }

  if (name === 'Dashboard') {
    return (
      <ListItem
        key={code}
        to={description}
        component={RouterLink}
        underline="none"
        sx={{
          pr: 2,
          mt: 0.25,
          ...((isHome || isOffset) && { color: 'common.white' }),
          ...(isActive && { color: 'primary.main' })
        }}
      >
        <Icon icon={homeFill} width={22} height={22} />
      </ListItem>
    );
  }

  return (
    <LinkStyle
      key={code}
      to={description}
      component={RouterLink}
      sx={{
        ...((isHome || isOffset) && { color: 'common.white' }),
        ...(isActive && { color: 'primary.main' })
      }}
    >
      {name}
    </LinkStyle>
  );
}

MenuDesktop.propTypes = {
  isOffset: PropTypes.bool,
  isHome: PropTypes.bool
};

const findRootMenu = value => object =>
  Object.values(object).some(v => v === value || v && typeof v === 'object' && findRootMenu(value)(v));

const filterRootMenu = (array, value) => array.filter(findRootMenu(value));

export default function MenuDesktop({ isOffset, isHome }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [openId, setOpenId] = useState(null);
  const userPermission = localStorage.getItem('userPermission');
  const navConfig = JSON.parse(userPermission);
  const currentRootMenu = filterRootMenu(navConfig, pathname);

  useEffect(() => {
    if (open) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleOpen = (id) => {
    handleClose();
    setOpenId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Stack direction="row">
      {navConfig.filter((nav) => nav.permissions.includes("READ")).map((link) => {
        const { code, permissions, kind } = link;
        const isActive = currentRootMenu && currentRootMenu[0]?.code === code;
        return (
          permissions.includes("READ") && kind === "MENU" &&
          <>
            <MenuDesktopItem
              key={code}
              item={link}
              pathname={pathname}
              isOpen={open}
              openId={openId}
              onOpen={handleOpen}
              onClose={handleClose}
              isOffset={isOffset}
              isHome={isHome}
              isActive={isActive}
            />
            <Divider orientation="vertical" flexItem />
          </>
        )
      }
      )}
    </Stack>
  );
}
