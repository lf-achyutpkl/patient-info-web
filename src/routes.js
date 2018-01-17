import React from 'react';

import {Router, Route, browserHistory} from 'react-router';

import AddPatient from './views/AddPatient';
import Dashboard from './views/Dashboard';

let routes = (
  <Router history={browserHistory}>
    <Route path={'/'} component={Dashboard} />
    <Route path={'/addPatient'} component={AddPatient}/>
  </Router>
);

export default routes;
