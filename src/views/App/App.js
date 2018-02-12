import React from 'react';
import NavBar from '../../components/NavBar';

const App = (props) => {
  return(
    <div>
      <NavBar/>
      <div className="container">
        {props.children}
      </div>
    </div>
  );
}

export default App;
