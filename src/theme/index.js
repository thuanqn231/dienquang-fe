import PropTypes from 'prop-types';

import { useMemo } from 'react';
// material
import { CssBaseline } from '@material-ui/core';
import { SnackbarProvider, useSnackbar } from 'notistack5';

import { createTheme, ThemeProvider, StyledEngineProvider } from '@material-ui/core/styles';
// hooks
import useSettings from '../hooks/useSettings';

//
import shape from './shape';
import palette from './palette';
import typography from './typography';
import breakpoints from './breakpoints';
import GlobalStyles from './globalStyles';
import componentsOverride from './overrides';
import shadows, { customShadows } from './shadows';
import { SnackbarUtilsConfigurator } from '../core/wrapper/Notistack';

// ----------------------------------------------------------------------

ThemeConfig.propTypes = {
  children: PropTypes.node
};

export default function ThemeConfig({ children }) {
  const { themeMode, themeDirection } = useSettings();
  const isLight = themeMode === 'light';

  const themeOptions = useMemo(
    () => ({
      palette: isLight ? { ...palette.light, mode: 'light' } : { ...palette.dark, mode: 'dark' },
      shape,
      typography,
      breakpoints,
      direction: themeDirection,
      shadows: isLight ? shadows.light : shadows.dark,
      customShadows: isLight ? customShadows.light : customShadows.dark
    }),
    [isLight, themeDirection]
  );

  const theme = createTheme(themeOptions);
  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles />
        <SnackbarProvider
          maxSnack={10}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
        >
          <SnackbarUtilsConfigurator />
          {children}
        </SnackbarProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
