import {
  Table,
  TableRow,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRowColumn,
} from 'material-ui/Table';
import axios from 'axios';
import React, {Component} from 'react';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';

class Dashboard extends Component{

  constructor(){
    super();

    this.state = {
      patients: []
    }
  }

  componentDidMount(){
    axios.get('http://localhost:8848/api/patients').then(response => this.setState({patients: response.data}));
  }

  render(){
    return(
      <div className="container">
        <AppBar
          title='Patient Information'
          iconElementRight={<FlatButton label="+ Add Patient Info" onClick={() => this.props.router.push('addPatient')}/>}
        />
        <Table>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn>Patient ID</TableHeaderColumn>
              <TableHeaderColumn>First Name</TableHeaderColumn>
              <TableHeaderColumn>Middle Name</TableHeaderColumn>
              <TableHeaderColumn>Last Name</TableHeaderColumn>
              <TableHeaderColumn>Gender</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody showRowHover={true}  displayRowCheckbox={false}>
            {
              this.state.patients && this.state.patients.map(patient =>
                <TableRow key={patient.id}>
                <TableRowColumn>{patient.id}</TableRowColumn>
                <TableRowColumn>{patient.firstName}</TableRowColumn>
                <TableRowColumn>{patient.middleName}</TableRowColumn>
                <TableRowColumn>{patient.lastName}</TableRowColumn>
                <TableRowColumn>{patient.gender}</TableRowColumn>
              </TableRow>
              )
            }
          </TableBody>
        </Table>


      </div>

    );
  }


}

export default Dashboard;
