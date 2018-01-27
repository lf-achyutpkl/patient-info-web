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

import {uri} from '../../config/uri';

class Dashboard extends Component{

  constructor(){
    super();

    this.state = {
      patients: []
    }
  }

  componentDidMount(){
    axios.get(uri.patients).then(response => this.setState({patients: response.data}));
  }

  render(){
    return(
      <div>
        <h1>Patient Info</h1>

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
