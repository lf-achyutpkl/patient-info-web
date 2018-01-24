import React from 'react';

import {Router, Route, browserHistory} from 'react-router';

import AddPatient from './views/AddPatient';
import Dashboard from './views/Dashboard';
import Annotate from './views/Annotate';
import BatchUpload from './views/BatchUpload';

let routes = (
  <Router history={browserHistory}>
    <Route path={'/'} component={Dashboard} />
    <Route path={'/addPatient'} component={AddPatient}/>
    <Route path={'/annotate'} component={Annotate}/>
    <Route path={'/batchUpload'} component={BatchUpload}/>
  </Router>
);

export default routes;
