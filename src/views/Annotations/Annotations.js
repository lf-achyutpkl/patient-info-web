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
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import DropDownMenu from 'material-ui/DropDownMenu';

import {uri} from '../../config/uri';
import {get} from '../../utils/httpUtils';

class Annotations extends Component{

  constructor(){
    super();

    this.state = {
      defaultShowAnnotationValue: 'all',
      pagination: {
        page: 1,
        pageSize: 20,
        rowCount: 0,
        pageCount: 0
      },
      annotations: [],
      selectedIndexes: []
    }
  }

  componentDidMount(){
    this._fetchData();
  }

  render(){
    return(
      <div>
        <DropDownMenu value={this.state.defaultShowAnnotationValue} onChange={this._handleDropDownChange}>
          <MenuItem value={'all'} primaryText="Display All Images" />
          <MenuItem value={'true'} primaryText="Display Annotated Images" />
          <MenuItem value={'false'} primaryText="Display Images Without Annotation" />
        </DropDownMenu>

        {
          this.state.selectedIndexes.length != 0 &&
            <div style={{float: 'right', marginTop: '15px'}}>
              <Link className="btn btn-primary" to={`/annotate${this._redirectToEditor()}`}>Start Batch Annotating</Link>
            </div>
        }

        <Table>
          <TableHeader displaySelectAll={false}  adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>Select</TableHeaderColumn>
              <TableHeaderColumn>Patient Name</TableHeaderColumn>
              <TableHeaderColumn>Is Annotated</TableHeaderColumn>
              <TableHeaderColumn>Tags</TableHeaderColumn>
              <TableHeaderColumn>Remarks</TableHeaderColumn>
              <TableHeaderColumn>Action</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody showRowHover  displayRowCheckbox={false}>
            {
              this.state.annotations &&
                this.state.annotations.map(annotation =>
                  <TableRow key={annotation.id}>
                    <TableRowColumn>
                    <Checkbox
                      checked={this.state.selectedIndexes.includes(annotation.id)}
                      onCheck={() => this._manageBatchUpdate(annotation.id)}
                    />
                    </TableRowColumn>
                    <TableRowColumn>{`${annotation.patient.firstName} ${annotation.patient.lastName}`}</TableRowColumn>
                    <TableRowColumn>{`${annotation.annotationInfo != ''}`}</TableRowColumn>
                    <TableRowColumn>{annotation.tags}</TableRowColumn>
                    <TableRowColumn>{annotation.remarks}</TableRowColumn>
                    <TableRowColumn><Link to={`/annotate?id=${annotation.id}`} target="_blank">Annotate</Link></TableRowColumn>
                  </TableRow>
                )
            }
          </TableBody>
        </Table>

        {
          this.state.annotations.length != 0 &&
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
        }


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

  _handleDropDownChange = (event, index, value) => {
    this.setState({defaultShowAnnotationValue: value}, () => {
      this._fetchData();
    });
  }

  _manageBatchUpdate = (annotationId) => {
    let selectedIndexes = [];
    if(this.state.selectedIndexes.includes(annotationId)){
      const index = this.state.selectedIndexes.indexOf(annotationId);
      selectedIndexes = [...this.state.selectedIndexes];
      selectedIndexes.splice(index, 1);
    } else {
      selectedIndexes = this.state.selectedIndexes.concat([annotationId])
    }
    this.setState({selectedIndexes});
  }

  _redirectToEditor = () => {
    return `?id=${this.state.selectedIndexes.join(',')}`;
  }
}

export default Annotations;
