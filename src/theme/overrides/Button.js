// ----------------------------------------------------------------------

export default function Button(theme) {
  return {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          '&:hover': {
            boxShadow: 'none'
          }
        },
        sizeLarge: {
          height: 48
        },
        // contained
        containedInherit: {
          color: theme.palette.grey[800],
          boxShadow: theme.customShadows.z8,
          '&:hover': {
            backgroundColor: theme.palette.grey[400]
          }
        },
        containedPrimary: {
          boxShadow: theme.customShadows.primary
        },
        containedSecondary: {
          boxShadow: theme.customShadows.secondary
        },
        containedInfo: {
          boxShadow: theme.customShadows.info
        },
        containedSuccess: {
          boxShadow: theme.customShadows.success
        },
        containedWarning: {
          boxShadow: theme.customShadows.warning
        },
        containedError: {
          boxShadow: theme.customShadows.error
        },
        // outlined
        outlinedInherit: {
          border: `1px solid ${theme.palette.grey[500_32]}`,
          '&:hover': {
            backgroundColor: theme.palette.action.hover
          }
        },
        textInherit: {
          '&:hover': {
            backgroundColor: theme.palette.action.hover
          }
        }
      }
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          padding: theme.spacing(0),
          '&.MuiListItemButton-root': {
            padding: theme.spacing(0, 1),
          },
          '&.MuiAccordionSummary-root': {
            padding: theme.spacing(1, 1),
          }
        }
      }
    }
  };
}
