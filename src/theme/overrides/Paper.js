// ----------------------------------------------------------------------

export default function Paper() {
  return {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '0 !important',
          backgroundImage: 'none'
        }
      }
    }
  };
}
