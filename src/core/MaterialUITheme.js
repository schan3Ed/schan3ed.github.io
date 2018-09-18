import { createMuiTheme } from '@material-ui/core/styles';

export const MaterialUITheme = createMuiTheme({
    palette: {
        common: {
            black: '#2b2b2b',
        },
        primary: {
            light: '#64dba5',
            main: '#51d79a',
            dark: '#3dd28f',
            contrastText: '#fff',
          },
          secondary: {
            light: '#db6a64',
            main: '#d75751',
            dark: '#d2453d',
            contrastText: '#fff',
        },
    },
    typography: {
        fontFamily: [
            'MuseoSans500',
            'Roboto',
            'Arial',
            'sans-serif',
        ].join(','),
        fontSize: 15,
    }
  });