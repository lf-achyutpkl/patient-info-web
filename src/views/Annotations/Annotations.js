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
import Checkbox from 'material-ui/Checkbox';
import DropDownMenu from 'material-ui/DropDownMenu';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import {baseUrl,uri,} from '../../config/uri';
import {localStorageConstants} from '../../config/localStorageConstants';
import {get,post,put} from '../../utils/httpUtils';
import AutoComplete from 'material-ui/AutoComplete';
import ReactImageMagnify from 'react-image-magnify';

class Annotations extends Component{

  constructor(){
    super();

    this.state = {
      defaultShowAnnotationValue: 'all',
      defaultTagValue:0,
      currentUser:{},
      tags:[],
      isReject:false,
      open: false,
      selectedPatientName:'',
      selectedImageUrl:'',
      selectedBatchId:0,
      pagination: {
        page: 1,
        pageSize: 20,
        rowCount: 0,
        pageCount: 0
      },
      annotations: [],
      selectedIndexes: [],
      selectedTag:{},
    }
  }

  componentDidMount(){   
    this._fetchData();
    this._fetchAllTags();
  }

  componentDidUpdate(){
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 400);
  }

  render(){
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this._handleClose}
      />
    ];

    const dataSourceConfig = {
      text: 'tagName',
      value: 'id',
    };

    const customContentStyle = {
      width: '90%',
      maxWidth: 'none'      
    };

    return(
      <div>
        <DropDownMenu value={this.state.selectedBatchId} onChange={this._selectBatch}>
          <MenuItem value={0} primaryText="Select Batch" />
          {                          
            this.state.currentUser.batches && this.state.currentUser.batches.map(batch=>
              <MenuItem key={batch.id} value={parseInt(batch.id)} primaryText={batch.batchName} />
            )
          }
        </DropDownMenu>

        <DropDownMenu value={this.state.defaultShowAnnotationValue} onChange={this._handleDropDownChange}>
          <MenuItem value={'all'} primaryText="Display All Images" />
          <MenuItem value={'true'} primaryText="Display Annotated Images" />
          <MenuItem value={'false'} primaryText="Display Images Without Annotation" />
          <MenuItem value={'reject'} primaryText="Display Rejected Images" />
        </DropDownMenu>

        <DropDownMenu value={this.state.defaultTagValue} onChange={this._changeTag}>
          <MenuItem value={0} primaryText="Display All Tags" />
          {
            this.state.tags.map(tag=>
              <MenuItem key={tag.id} value={parseInt(tag.id)} primaryText={tag.tagName} />
            )
          }
        </DropDownMenu>

        {                  
          this.state.annotations.length != 0 &&
            <div style={{float: 'right', marginTop: '15px',marginLeft:'10px'}}>             
              <Link className="btn btn-primary" to={`/annotate?batchId=${this.state.selectedBatchId}`}>Start Annotation</Link>
            </div>
        }

        <Table>
          <TableHeader displaySelectAll={false}  adjustForCheckbox={false}>
            <TableRow>
              {/* <TableHeaderColumn style={{ width:'100px' }}>Select</TableHeaderColumn> */}
              <TableHeaderColumn>Patient Name</TableHeaderColumn>
              {/* <TableHeaderColumn>Is Annotated</TableHeaderColumn> */}
              <TableHeaderColumn>Tags</TableHeaderColumn>
              {/* <TableHeaderColumn>Remarks</TableHeaderColumn> */}
              <TableHeaderColumn>Action</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody showRowHover  displayRowCheckbox={false}>
            {
              this.state.annotations &&
                this.state.annotations.map(annotation =>
                  <TableRow key={annotation.id}>
                    {/* <TableRowColumn>
                    <Checkbox
                      checked={this.state.selectedIndexes.includes(annotation.id)}
                      onCheck={() => this._manageBatchUpdate(annotation.id)}
                    />
                    </TableRowColumn> */}
                    <TableRowColumn>{`${annotation.patient.firstName} ${annotation.patient.lastName}`}</TableRowColumn>
                    {/* <TableRowColumn>{`${annotation.annotationInfo != ''}`}</TableRowColumn> */}
                    <TableRowColumn>{annotation.tags.map((tag)=>{return tag.tagName}).join(',')}</TableRowColumn>
                    {/* <TableRowColumn>{annotation.remarks}</TableRowColumn> */}
                    <TableRowColumn>
                      <a href="#" style={{marginRight:"10px"}} onClick={() => this._updateAnnotation(annotation,true)}>{annotation.isReject==false?'Reject' : 'Accept'}</a>
                      <a href="#" onClick={() => this._previewImage(annotation)}>Preview</a>
                    </TableRowColumn>
                  </TableRow>
                )
            }
          </TableBody>
        </Table>

        <Dialog
          title={this.state.selectedPatientName}
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this._handleClose}
          contentStyle={customContentStyle}
          bodyClassName="image-preview"
        >
        <div style={{overflow:"scroll",maxHeight:"400px"}}>
        <div style={{width:"60%",display:"inline-block"}}>
        <ReactImageMagnify {...{
          smallImage: {
              alt: this.state.selectedPatientName,
              isFluidWidth: true,
              src: this.state.selectedImageUrl,
              srcSet: [
                  `${this.state.selectedImageUrl} 687w`,
                  `${this.state.selectedImageUrl} 770w`,
                  `${this.state.selectedImageUrl} 861w`,
                  `${this.state.selectedImageUrl} 955w`
              ].join(', '),
              sizes: '(max-width: 480px) 30vw, 80vw'
          },
          largeImage: {
              alt: '',
              src: this.state.selectedImageUrl,
              width: 1200,
              height: 1800
          }
      }} />
          {/* <img width="100%" src={this.state.selectedImageUrl} />           */}
        </div>
        <div className="add-tag-dialog" style={{width:"40%",display:"inline-block",paddingLeft:"20px",verticalAlign:"top"}}>
            <AutoComplete
              floatingLabelText="Search Tags"
              filter={AutoComplete.noFilter}
              openOnFocus={false}
              dataSource={this.state.tags}
              filter={AutoComplete.caseInsensitiveFilter}
              dataSourceConfig={dataSourceConfig}
              onUpdateInput={this._selectTag}
            />
            <FlatButton
              label="Add Tag"
              primary={true}
              keyboardFocused={true}
              onClick={this._addTagToAnnotation}
            />

        </div>
        </div>
       
        </Dialog>

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

  _selectBatch=(event, index, value)=>{
    this.setState({selectedBatchId:value}, () => {
      this._fetchImagesByBranch();
    });
  }

  _constructQueryParam = () => {  
    let { page, pageSize } = this.state.pagination;
    let batchId=this.state.currentUser.batches.length > 0 ? this.state.currentUser.batches[0].id : 0;
    return `?annotation=${this.state.isReject?'all':this.state.defaultShowAnnotationValue}&page=${page}&pageSize=${pageSize}&batchId=${this.state.selectedBatchId}&isReject=${this.state.isReject}&tagId=${this.state.defaultTagValue}`;
  }

  _fetchData = () => { 
    let userId=0;
    if(this.props.route.loggedUser){
      userId=this.props.route.loggedUser && this.props.route.loggedUser.id;
    }else{
      userId=this._getLoggedUser().id;
    } 
    let url = uri.users+'/'+userId; 
    get(url)
    .then(response => {
        this.setState({currentUser: response.data},()=>{
        if(this.state.currentUser.batches.length > 0){ 
            this.setState({selectedBatchId:parseInt(this.state.currentUser.batches[0].id) },()=>{
              this._fetchImagesByBranch();
            });         
            
         }
         else{
           alert("No Batch Found.");
         }

        });
        

      });
   }

   _fetchImagesByBranch = () =>{
      let url = uri.images + this._constructQueryParam();
      get(url)
      .then(response => this.setState({annotations: response.data, pagination: response.pagination}))
   }

  _fetchAllTags = () => {   
    let url = uri.tags;
    get(url)
      .then(response =>{
        this.setState({ tags: response.data });
        });
  }

  _selectTag=(tagName)=>{
    let tag=this.state.tags.find(t=>{return t.tagName.trim()==tagName.trim()});
    if(!tag){
      tag={id:"0",tagName:tagName.trim()};
    }
    this.setState({selectedTag:tag});
  }

  _addTagToAnnotation=()=>{
    if(this.state.selectedTag && this.state.selectedTag.tagName){
    let annotation=this.state.selectedAnnotation;
    annotation.tags.push(this.state.selectedTag);
    this._updateAnnotation(annotation,false);
    if(this.state.selectedTag.id==0){
      this.state.selectedTag={};
      this._fetchAllTags();
    }
    }
    else{
      alert("Tag cannot be empty.");
    }
  }

  _updateAnnotation=(annotation,fromReject=false)=>{ 
    if(fromReject){
      annotation.isReject=!annotation.isReject;
    }   
    put(`${uri.annotation}/${annotation.id}`,annotation).then(response=>{
      let foundIndex = this.state.annotations.findIndex(x => x.id == annotation.id);
      let newAnnotations=this.state.annotations;
      newAnnotations[foundIndex] = response.data;

      if(fromReject){
      newAnnotations=this.state.annotations.filter(res=>{
                return res.id != annotation.id;
              });
      }
     
      this.setState({annotations:newAnnotations,open: false});
    });
    
  }

  _getLoggedUser(){
    let user=localStorage.getItem(localStorageConstants.LOGGED_USER);
    return JSON.parse(user);
  }

  // _updateAnnotation=(annotation)=>{
  //   annotation.isReject=!annotation.isReject;
  //   put(`${uri.annotation}/${annotation.id}`, annotation).then(response=>{
  //     if(response.data){
  //       let newAnnotations=this.state.annotations.filter(res=>{
  //         return res.id != annotation.id;
  //       });
  //       this.setState({
  //         annotations:newAnnotations 
  //       }) 
  //     }
  //   });
  // }

  _previewImage=(annotation)=>{
    let imageUrl=baseUrl + annotation.imageName;
    this.setState({open: true,selectedImageUrl:imageUrl,selectedPatientName:annotation.patient.firstName+' '+annotation.patient.lastName,selectedAnnotation:annotation});
    
  }

  _handleClose = () => {
    this.setState({open: false});
  };

  _onClickPagination = (gotoPage) => {
    let pagination = {...this.state.pagination, page: gotoPage};
    this.setState({pagination}, () => {
      this._fetchData();
    })
  }

  _handleDropDownChange = (event, index, value) => {
      this.setState({defaultShowAnnotationValue:value,isReject:value=='reject'?true:false}, () => {
        this._fetchImagesByBranch();
       });
  }

  _changeTag = (event, index, value) => {
    this.setState({defaultTagValue:value}, () => {
      this._fetchImagesByBranch();
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

}

export default Annotations;
