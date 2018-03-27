import React from 'react';
import {Router, Route, browserHistory} from 'react-router';

import App from './views/App';
import Annotate from './views/Annotate';
import Dashboard from './views/Dashboard';
import Login from './views/Login';
import Annotates from './views/Annotations';
import AddPatient from './views/AddPatient';
import ManageBatch from './views/ManageBatch';
import jwt from 'jsonwebtoken';
import {localStorageConstants} from './config/localStorageConstants';

function requireAuth(nextState, replace) { 
  let token = localStorage.getItem(localStorageConstants.USER_TOKEN);
  if (!token) {
    replace({
      pathname: '/login'
    })
  }
  else{
    localStorage.setItem(localStorageConstants.LOGGED_USER,JSON.stringify(jwt.decode(token)));
  }
}

function deleteToken(nextState, replace) { 
  localStorage.removeItem(localStorageConstants.USER_TOKEN);
  localStorage.removeItem(localStorageConstants.LOGGED_USER);
}

function getLoggedUser(){
  let user=localStorage.getItem(localStorageConstants.LOGGED_USER);
  return JSON.parse(user);
}

let routes = (
  <Router history={browserHistory}>  
    <Route path={'/login'} component={Login} onEnter={deleteToken} />
    <Route component={App} onEnter={requireAuth} >
      {/* <Route path={'/'} component={Dashboard} /> */}
      <Route path={'/addPatient'} component={AddPatient}/>
      <Route path={'/annotate'} component={Annotate} loggedUser={getLoggedUser()}/>
      <Route path={'/'} component={Annotates} loggedUser={getLoggedUser()}/>
      <Route path={'/manageBatch'} component={ManageBatch}/>
    </Route>
  </Router>
);

export default routes;
