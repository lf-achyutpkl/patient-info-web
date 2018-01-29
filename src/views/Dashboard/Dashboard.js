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
import {get} from '../../utils/httpUtils';

class Dashboard extends Component{

  constructor(){
    super();

    this.state = {
      pagination: {
        page: 1,
        pageSize: 20,
        rowCount: 0,
        pageCount: 0
      },
      patients: []
    }
  }

  componentDidMount(){
    this._fetchData();
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
        {
          this.state.patients.length !== 0 &&
          <nav aria-label="Pagination">
            <ul className="pagination">
              {
                this.state.pagination.page !== 1 &&
                <li className="page-item">
                  <a className="page-link" href="#" onClick={() => this._onClickPagination(this.state.pagination.page - 1)}>Previous</a>
                </li>
              }
              <li className="page-item disabled"><a className="page-link" href="#">Total: {this.state.pagination.rowCount}</a></li>

              {
                this.state.pagination.page !== this.state.pagination.pageCount &&
                <li className="page-item">
                  <a className="page-link" href="#" onClick={() => this._onClickPagination(this.state.pagination.page + 1)}>Next</a>
                </li>
              }
            </ul>
          </nav>
        }
      </div>

    );
  }

  _constructQueryParam = () => {
    let { page, pageSize } = this.state.pagination;
    return `?page=${page}&pageSize=${pageSize}`;
  }

  _fetchData = () => {
    let url = uri.patients + this._constructQueryParam();
    get(url).then(response => this.setState({patients: response.data, pagination: response.pagination}));
  }

  _onClickPagination = (gotoPage) => {
    let pagination = {...this.state.pagination, page: gotoPage};
    this.setState({pagination}, () => {
      this._fetchData();
    })
  }
}

export default Dashboard;
