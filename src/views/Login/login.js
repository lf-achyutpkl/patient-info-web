import React, {Component} from 'react';
import { post} from '../../utils/httpUtils';
import {baseUrl, uri} from '../../config/uri';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

const USER_TOKEN = 'userToken';

class Login extends Component {

    constructor(props){
        super(props);

        this.state = {
          email:'',
          password:''
        }
    }

componentDidMount(){
  localStorage.clear();
 }

  render(){

    return(
        <div >
        <MuiThemeProvider>
          <AppBar
            style={{textAlign:'center'}}
            showMenuIconButton={false}
            title="Login"
           />
           <div className="container" style={{width:'300px'}}>
           <TextField
             type="email"
             hintText="Enter your Email Address"
             floatingLabelText="Email"
             onChange = {(event,newValue) => this.setState({email:newValue})}
             />
           <br/>
             <TextField
               type="password"
               hintText="Enter your Password"
               floatingLabelText="Password"
               onChange = {(event,newValue) => this.setState({password:newValue})}
               />
             <br/>
             <RaisedButton label="Submit" primary={true} style={style} onClick={(event) => this.handleClick(event)}/>
         </div>
         </MuiThemeProvider>
      </div>

    );
  }

  handleClick(event){
    if(!this.state.email || !this.state.password){
        alert("Email and Password are required.");
        return;
    } 
    var payload={
        "emailId":this.state.email,
        "password":this.state.password
        }
    post(`${uri.authenticate}`, payload)
    .then(response=> {
        if(response.data){
            localStorage.setItem(USER_TOKEN, response.data);
            window.location.href='/';
        }
    })
    .catch(error=> {
       alert("Email and Password combination does not match.");
    });
    }
}
const style = {
    margin: 15,
   };
export default Login;