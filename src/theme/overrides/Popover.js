// ----------------------------------------------------------------------

export default function Popover(theme) {
  return {
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: '0 !important',
          boxShadow: theme.customShadows.z12
        }
      }
    }
  };
}
