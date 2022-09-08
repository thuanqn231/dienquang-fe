// ----------------------------------------------------------------------

export default function Table(theme) {
  return {
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
            '&:hover': {
              backgroundColor: theme.palette.action.hover
            }
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(224, 224, 224, 1)"
        },
        head: {
          color: theme.palette.text.secondary,
          backgroundColor: theme.palette.background.neutral,
          '&:first-of-type': {
            paddingLeft: theme.spacing(3),
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            boxShadow: `inset 8px 0 0 ${theme.palette.background.paper}`
          },
          '&:last-of-type': {
            paddingRight: theme.spacing(3),
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            boxShadow: `inset -8px 0 0 ${theme.palette.background.paper}`
          }
        },
        stickyHeader: {
          backgroundColor: theme.palette.background.paper,
          backgroundImage: `linear-gradient(to bottom, ${theme.palette.background.neutral} 0%, ${theme.palette.background.neutral} 100%)`
        },
        body: {
          '&:first-of-type': {
            paddingLeft: theme.spacing(3)
          },
          '&:last-of-type': {
            paddingRight: theme.spacing(3)
          }
        }
      }
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          borderTop: `solid 1px ${theme.palette.divider}`
        },
        toolbar: {
          height: 64
        },
        select: {
          '&:focus': {
            borderRadius: 0
          }
        },
        selectIcon: {
          width: 20,
          height: 20,
          marginTop: 2
        }
      }
    }
  };
}
