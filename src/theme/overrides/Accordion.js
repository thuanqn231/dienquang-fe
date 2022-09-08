// ----------------------------------------------------------------------

export default function Accordion(theme) {
  return {
    MuiAccordion: {
      styleOverrides: {
        root: {
          '&.Mui-expanded': {
            boxShadow: theme.customShadows.z8,
            borderRadius: 0,
            margin: '1px 0'
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent'
          }
        }
      }
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(1),
          '&.Mui-disabled': {
            opacity: 1,
            color: theme.palette.action.disabled,
            '& .MuiTypography-root': {
              color: 'inherit'
            }
          },
          '&.Mui-expanded': {
            minHeight: 2
          }
        },
        expandIconWrapper: {
          color: 'inherit'
        },
        content: {
          '&.Mui-expanded': {
            margin: 0
          }
        }
      }
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: theme.spacing(0, 2, 0)
        }
      }
    }
  };
}
