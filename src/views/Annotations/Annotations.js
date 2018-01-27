import {
  Table,
  TableRow,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRowColumn,
} from 'material-ui/Table';
import {Link} from 'react-router';
import React, {Component} from 'react';
import AppBar from 'material-ui/AppBar';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import DropDownMenu from 'material-ui/DropDownMenu';

import {uri} from '../../config/uri';
import {get} from '../../utils/httpUtils';

import ReactTable from "react-table";

class Annotations extends Component{

  constructor(){
    super();

    this.state = {
      defaultShowAnnotationValue: 'All',
      pagination: {
        page: 1,
        pageSize: 20,
        rowCount: 0,
        pageCount: 0
      },
      annotations: []
    }
  }

  componentDidMount(){
    this._fetchData();
  }

  render(){
    return(
      <div>
        <Table>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn>Patient Name</TableHeaderColumn>
              <TableHeaderColumn>Is Annotated</TableHeaderColumn>
              <TableHeaderColumn>Tags</TableHeaderColumn>
              <TableHeaderColumn>Remarks</TableHeaderColumn>
              <TableHeaderColumn>Action</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody showRowHover={true}  displayRowCheckbox={false}>
            {
              this.state.annotations &&
                this.state.annotations.map(annotation =>
                  <TableRow key={annotation.id}>
                    <TableRowColumn>{`${annotation.patient.firstName} ${annotation.patient.lastName}`}</TableRowColumn>
                    <TableRowColumn>{`${annotation.annotationInfo != ''}`}</TableRowColumn>
                    <TableRowColumn>{annotation.tags}</TableRowColumn>
                    <TableRowColumn>{annotation.remarks}</TableRowColumn>
                    <TableRowColumn><Link to={`/annotate?image=${annotation.imageName}`} target="_blank">Annotate</Link></TableRowColumn>
                  </TableRow>
                )
            }
          </TableBody>
        </Table>
        <nav aria-label="Pagination">
          <ul className="pagination">
            {
              this.state.pagination.page != 1 &&
              <li className="page-item">
                <a className="page-link" href="#" onClick={() => this._onClickPagination(this.state.pagination.page - 1)}>Previous</a>
              </li>
            }
            <li className="page-item disabled"><a className="page-link" href="#">Total: {this.state.pagination.rowCount}</a></li>

            {
              this.state.pagination.page != this.state.pagination.pageCount &&
              <li className="page-item">
                <a className="page-link" href="#" onClick={() => this._onClickPagination(this.state.pagination.page + 1)}>Next</a>
              </li>
            }
          </ul>
        </nav>
      </div>
    );
  }

  _constructQueryParam = () => {
    let { page, pageSize } = this.state.pagination;
    return `?annotation=${this.state.defaultShowAnnotationValue}&page=${page}&pageSize=${pageSize}`;
  }

  _fetchData = () => {
    let url = uri.images + this._constructQueryParam();
    get(url)
      .then(response => this.setState({annotations: response.data, pagination: response.pagination}));
  }

  _onClickPagination = (gotoPage) => {
    let pagination = {...this.state.pagination, page: gotoPage};
    this.setState({pagination}, () => {
      this._fetchData();
    })
  }
}

export default Annotations;
