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
import Checkbox from 'material-ui/Checkbox';
import DropDownMenu from 'material-ui/DropDownMenu';
import {baseUrl,uri,} from '../../config/uri';
import {localStorageConstants} from '../../config/localStorageConstants';
import {get,post,put} from '../../utils/httpUtils';
import RaisedButton from 'material-ui/RaisedButton';

class ManageBatch extends Component{

  constructor(){
    super();

    this.state = {
      selectedUserId: 0,
      open: false,
      pagination: {
        page: 1,
        pageSize: 20,
        rowCount: 0,
        pageCount: 0
      },
      batchList: [],
      selectedBatch:{id:0},
      userList:[]
    }
  }

  componentDidMount(){  
    this._fetchUsersList(); 
    this._fetchBatchList();
  }

  
  render(){
   

    return(
      <div>    
        <Table>
          <TableHeader displaySelectAll={false}  adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn style={{ width:'250px' }}>Batch Name</TableHeaderColumn>
              <TableHeaderColumn style={{ width:'150px' }}>Is Completed</TableHeaderColumn>
              <TableHeaderColumn style={{ width:'250px' }}>Assign To</TableHeaderColumn>
              <TableHeaderColumn>Action</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody showRowHover  displayRowCheckbox={false}>
            {
              this.state.batchList &&
                this.state.batchList.map(batch =>
                  <TableRow key={batch.id}>
                    <TableRowColumn style={{ width:'250px' }}>{batch.batchName} </TableRowColumn>
                    <TableRowColumn style={{ width:'150px' }}>   
                    <Checkbox
                      checked={batch.isCompleted}
                      onCheck={() => this._updateBatch(batch,"isCompleted")}
                    />
                    </TableRowColumn>
                    <TableRowColumn  style={{ width:'250px' }}>{batch.users.length>0 && batch.users[0].name}</TableRowColumn>
                    <TableRowColumn>
                      { this.state.selectedBatch.id==batch.id &&
                      <div style={{position:"relative"}}>
                        <DropDownMenu value={this.state.selectedUserId} style={{minWidth:"250px"}} onChange={this._selectUser}>
                        <MenuItem value={0} primaryText="Select User" />
                        {                          
                          this.state.userList.map(user=>
                            <MenuItem key={user.id} value={parseInt(user.id)} primaryText={user.name} />
                          )
                        }
                       </DropDownMenu>
                      
                        <RaisedButton  
                        style={{position:"absolute",top:"10px"}}
                        label="Update"
                        primary={true}
                        onClick={() => this._updateBatch(batch,'user')}
                        />
                      </div>
                      }
                      
                      { this.state.selectedBatch.id!=batch.id &&

                        <RaisedButton  
                        label="Assign"
                        primary={true}
                        onClick={() => this._assignUser(batch)}
                        />
                      }
                      </TableRowColumn>
                  </TableRow>
                )
            }
          </TableBody>
        </Table>

        {
          this.state.batchList.length != 0 &&
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
    return `?page=${page}&pageSize=${pageSize}`;
  }

  _fetchUsersList=()=>{
    let url = uri.users;
    get(url)
    .then(response =>{
      this.setState({ userList: response.data });
      });
  };
 
  _fetchBatchList = () => {   
    let url = uri.batches + this._constructQueryParam();
    get(url)
      .then(response =>{
        this.setState({ batchList: response.data,pagination: response.pagination });
        });
  }

  _updateBatch=(batch,source)=>{
    if(source=="isCompleted"){
      batch.isCompleted=!batch.isCompleted;
    }
    else if (this.state.selectedUserId > 0){
      batch.users=this.state.userList.filter(user=>{
        return user.id==this.state.selectedUserId;
      });
    }
    else{
      this.setState({selectedBatch:{id:0},selectedUserId:0});
      return;
    }

    put(`${uri.batches}/${batch.id}`,batch)
      .then(response =>{
        if(response.data){
          let foundIndex = this.state.batchList.findIndex(x => x.id == batch.id);
          let newBatchList = this.state.batchList;
          newBatchList[foundIndex] = batch;          
          this.setState({batchList:newBatchList,selectedBatch:{id:0},selectedUserId:0});
        }
      });
  }

  _getLoggedUser(){
    let user=localStorage.getItem(localStorageConstants.LOGGED_USER);
    return JSON.parse(user);
  }

  _onClickPagination = (gotoPage) => {
    let pagination = {...this.state.pagination, page: gotoPage};
    this.setState({pagination}, () => {
      this._fetchBatchList();
    })
  }

  _assignUser=(batch)=>{
    let userId=batch.users.length > 0 ? parseInt(batch.users[0].id) : 0;
    this.setState({selectedBatch:batch,selectedUserId:userId});
  }

  _selectUser = (event, index, value) => {
    this.setState({selectedUserId:value});
  }


 
}

export default ManageBatch;
