import {
  Table,
  TableRow,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRowColumn,
} from 'material-ui/Table';
import React, {Component} from 'react';
import AppBar from 'material-ui/AppBar';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import AutoComplete from 'material-ui/AutoComplete';
import DropDownMenu from 'material-ui/DropDownMenu';

class Annotations extends Component{

  render(){
    return(
      <div className="container">
        <AppBar
          title='Images'
          iconElementRight={
            <div>
              <FlatButton label="Add Patient" onClick={() => this.props.router.push('addPatient')}/>
              <FlatButton label="Dashboard" onClick={() => this.props.router.push('/')}/>
            </div>
            }
        />
        <AutoComplete
          hintText="Search Tag"
          dataSource={['1','2','3','11','1111']}
          onUpdateInput={() => console.log('searching...')}
        />

        <Table>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn>Image Name</TableHeaderColumn>
              <TableHeaderColumn>Is Annotated</TableHeaderColumn>
              <TableHeaderColumn>Tags</TableHeaderColumn>
              <TableHeaderColumn>Remarks</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody showRowHover={true}  displayRowCheckbox={false}>
            <TableRow key={1}>
              <TableRowColumn>Left Ear</TableRowColumn>
              <TableRowColumn>Yes</TableRowColumn>
              <TableRowColumn>dr, adf</TableRowColumn>
              <TableRowColumn>Test</TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }
}

export default Annotations;
