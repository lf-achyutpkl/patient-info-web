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

class Annotations extends Component{

  constructor(){
    super();

    this.state = {
      annotations: []
    }
  }

  componentDidMount(){
    get(uri.annotations)
      .then(response => this.setState({annotations: response.data}, () =>{
        this.state.annotations.forEach(annotation => console.log(typeof annotation.annotationInfo))
      }));
  }

  render(){
    return(
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
                  <TableRowColumn><Link to={`/annotate?image=${annotation.imageName}`}>Annotate</Link></TableRowColumn>
                </TableRow>
              )
          }
        </TableBody>
      </Table>
    );
  }
}

export default Annotations;
