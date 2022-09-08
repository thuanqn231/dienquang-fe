// ----------------------------------------------------------------------

export default function DataGrid(theme) {
  return {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          '& .MuiTablePagination-root': {
            borderTop: 0
          },
          '& .MuiDataGrid-toolbarContainer': {
            padding: theme.spacing(2),
            backgroundColor: theme.palette.background.neutral,
            '& .MuiButton-root': {
              marginRight: theme.spacing(1.5),
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            }
          }
        }
      }
    },
    MuiGridMenu: {
      styleOverrides: {
        root: {
          '& .MuiDataGrid-gridMenuList': {
            boxShadow: theme.customShadows.z20,
            borderRadius: 0
          },
          '& .MuiMenuItem-root': {
            ...theme.typography.body2
          }
        }
      }
    }
  };
}