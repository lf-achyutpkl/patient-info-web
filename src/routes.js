import React from 'react';
import {Router, Route, browserHistory} from 'react-router';

import App from './views/App';
import Annotate from './views/Annotate';
import Dashboard from './views/Dashboard';
import Annotates from './views/Annotations';
import AddPatient from './views/AddPatient';
import BatchUpload from './views/BatchUpload';

let routes = (
  <Router history={browserHistory}>
    <Route component={App}>
      <Route path={'/'} component={Dashboard} />
      <Route path={'/addPatient'} component={AddPatient}/>
      <Route path={'/annotate'} component={Annotate}/>
      <Route path={'/images'} component={Annotates}/>
      <Route path={'/batchUpload'} component={BatchUpload}/>
    </Route>
  </Router>
);

export default routes;
