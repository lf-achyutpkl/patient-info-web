import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import 'bootstrap/dist/css/bootstrap.css'

import Routes from './routes';

ReactDOM.render(<MuiThemeProvider> {Routes} </MuiThemeProvider>, document.getElementById('root'));
