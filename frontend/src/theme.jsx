import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    text: {
      primary: '#fff',
      secondary: '#d4d4d4ff',
    },
    background: {
      default: '#121212',
      paper: '#1d1d1d',
    },
    success: {
      main: '#2e9231ff',
    },
    error: {
      main: '#d83b30ff',
      light: '#cf5047ff',
      dark: '#af0404ff',
    }
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',     
    },
    background: {
      default: '#ffffff',
      paper: '#ffffffff',
    },
    success: {
      main: '#63c768ff',
      light: '#c8e6c9',
      dark: '#4caf50',
      contrastText: '#000000',
    },
    error: {
      main: '#f06451ff',
      light: '#f57e6eff',
      dark: '#f44336',
      contrastText: '#000000',
    },
  },
});
