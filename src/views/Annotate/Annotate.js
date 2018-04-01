import React, {Component} from 'react';
import {get, put,destroy} from '../../utils/httpUtils';
import {baseUrl, uri} from '../../config/uri';
import ImageAnnotationEdit from '../../lib/components/ImageAnnotationEdit';
import {localStorageConstants} from '../../config/localStorageConstants';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';
import RaisedButton from 'material-ui/RaisedButton';
import DropdownTreeSelect from 'react-dropdown-tree-select'
import TextField from 'material-ui/TextField';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import PropTypes from 'prop-types';
import {
  Table,
  TableRow,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRowColumn,
} from 'material-ui/Table';

const ANNOTATIONS = 'annotation';
const SELECTED_INDEX = 'selectedIndex';
const IMAGE_WIDTH = 900;
const IMAGE_HEIGHT = 600;
function TabContainer(props) {
  return (
    <div style={{ padding: 8 * 3 }}>
      {props.children}
    </div>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

class AnnotateEditor extends Component {

    constructor(props){
        super(props);

        this.state = {
          data: {
            items:{},
          },
          currentUser:{},
          open: false,
          confirmation_open:false,
          selectedTag:{},
          isLoading: true,
          annotations: [],
          filteredAnnotation:[],
          tags:[],
          currentIndex:0,
          imageUrl: "",
          isReject:false,
          pagination: {
            page: 1,
            pageSize: 1000,
            rowCount: 0,
            pageCount: 0
          },
          diagnosisList:[],
          diagnosisDropdownTree:[],
          hasChanges:false,
          goToIndex:0,
          options:[],
          noToPrefetch:5,          
          selectItemId:0,
          value:"0",
          canEdit:false
        }
    }

    componentDidMount(){
      let index=localStorage.getItem("currentIndex_"+this.props.location.query.batchId)? JSON.parse(localStorage.getItem("currentIndex_"+this.props.location.query.batchId)):0
      this.setState({currentIndex:index});
      this._fetchData();
      this._fetchAllTags();
      this._fetchOptions();
      this._fetchUser();
    }

    tabChange = (value) => {
      this.setState({ value });
    };

    shouldComponentUpdate(){
      return true;
    }

    /**
     * ImageAnnotationEdit Props:
     * imageURL
     * height
     * width
     * update
     * data
     * options
     */
    render(){

      const actions = [
        <FlatButton
          label="Cancel"
          primary={true}
          onClick={this._handleClose}
        />,
        <FlatButton
        label="Add Tag"
        primary={true}
        keyboardFocused={true}
        onClick={this._addTagToAnnotation}
      />,
      ];

      const actions_confirmation = [
        <FlatButton
          label="Cancel"
          primary={true}
          onClick={this._handleConfirmationClose}
        />,
          <FlatButton
          label="Proceed"
          primary={true}
          keyboardFocused={true}
          onClick={this._setAnnotationsIndex}
        />,
      ];

      const dataSourceConfig = {
        text: 'tagName',
        value: 'id',
      };

      if(this.state.isLoading){
        return 'loading.....'
      }

      return (
        <div id="asdf">
        
          <div style={{width:"82%",float:"left"}}>
          <div>
        
            <button type="button" className="btn btn-primary" disabled={this.state.annotations.length > 1 && this.state.currentIndex == 0}  style={{marginRight:'10px',marginBottom:'15px'}} onClick={this._onPrevious}>Previous Image</button>

            <button type="button" className="btn btn-primary" disabled={this.state.annotations.length > 1 && this.state.currentIndex >= this.state.annotations.length} style={{marginBottom:'15px'}} onClick={this._onNext}>Next Image</button>
 

          {            
            this.state.annotations.length > 0  &&
            <button type="button" className="btn btn-danger" style={{marginBottom:'15px',marginRight:"35px",float:"right"}} onClick={()=>this._updateAnnotation(this.state.annotations[this.state.currentIndex],true)}>Reject</button>
          }

          <label style={{marginLeft:"10px"}}>{ this.state.annotations[this.state.currentIndex].patient.imageName } {this.state.annotations[this.state.currentIndex].patient.lastName}</label>
          </div>
          <ImageAnnotationEdit
            imageURL={ baseUrl + this.state.annotations[this.state.currentIndex].imageName}
            height={IMAGE_HEIGHT}
            width={IMAGE_WIDTH}
            update={this.update}
            data={this.state.data}
            selectItemId={this.state.selectItemId}
            options={this.state.options}
            // add={this._add}
            // remove={this._remove}
            canEdit={this.state.canEdit}
          />
          </div>
          <div style={{width:"18%",float:"left"}}>
          <DropdownTreeSelect className="tree-dropdown" data={this.state.diagnosisDropdownTree} onChange={this._onDiagnosisChange} />
          <div>
            {this.state.annotations[this.state.currentIndex].tags.length > 0 &&
              <label>Tags : </label>
            }
            {this.state.annotations[this.state.currentIndex].tags.map((tag, index)=>{
              return(
              <Chip style={{display:"inline-block",marginLeft:"5px"}} key={index} onRequestDelete={()=>this._deleteTags(tag.id,this.state.annotations[this.state.currentIndex].id)}>
              {tag.tagName}
              </Chip>
              )
            })
            }
            <RaisedButton label="Add Tags" primary={true} onClick={() => this._addTags(this.state.annotations[this.state.currentIndex])} style={{display:"block",marginTop:"10px"}}/>
          </div>

        <div className="tabContainer">
            <Tabs value={this.state.value} onChange={this.tabChange}>
              <Tab value="0" label="Images" />
              <Tab value="1" label="Annotations" />
            </Tabs>
          {this.state.value === "0" && <TabContainer>

           <TextField
            style={{maxWidth:"200px"}}
            hintText="Filter Image"
            onChange={(e) => this._filterPatient(e)}
          />
          <div id="scrollable-container"  style={{maxHeight:"440px",overflow:"auto",marginTop:"10px"}}>
          
          <Table id="tags-list" >
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>Images</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody showRowHover displayRowCheckbox={false}  >
            {
              this.state.filteredAnnotation &&
                this.state.filteredAnnotation.map((annotation,index) =>
                  <TableRow key={annotation.id} id={this.state.currentIndex==index?"activeIndex":""} style={{background:this.state.currentIndex==index?"rgba(224, 224, 223, 1)":""}}>
                    <TableRowColumn><a href="javascript:void(0);" onClick={() => this._goToIndex(index)}>{`${annotation.patient.firstName} ${annotation.patient.lastName}`}</a></TableRowColumn>
                  </TableRow>
                )
            }
          </TableBody>
        </Table>
          </div>

          </TabContainer>}
          {this.state.value === "1" && <TabContainer>
          <div className="annotation-container"  style={{maxHeight:"440px",overflow:"auto",marginTop:"10px"}}>
          <Table id="annotation-list" >
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>Annotations</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody showRowHover displayRowCheckbox={false}  >
            {
              this.state.data &&

              Object.keys(this.state.data.items).map((itemId) =>{
               return this.state.data.items[itemId].type != "whole_image" ?
                  <TableRow key={itemId} style={{background:this.state.selectItemId==itemId?"rgba(224, 224, 223, 1)":""}}>
                    <TableRowColumn><a href="javascript:void(0);" onClick={() => this._selectAnnotation(itemId)}>{`${this.state.canEdit?'':this.state.data.items[itemId].stroke+' - '} ${this.state.data.items[itemId].caption}`}</a></TableRowColumn>
                  </TableRow>
              :
              ""
              })
            }
          </TableBody>
        </Table>
            </div>
          </TabContainer>}
        </div>

          </div>
          
          <Dialog
          title={this.state.selectedAnnotation && this.state.selectedAnnotation.patient.firstName+' '+this.state.selectedAnnotation.patient.lastName}
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this._handleClose}
          >
            <div className="add-tag-dialog">
            <AutoComplete
              floatingLabelText="Search Tags"
              filter={AutoComplete.noFilter}
              openOnFocus={false}
              dataSource={this.state.tags}
              filter={AutoComplete.caseInsensitiveFilter}
              dataSourceConfig={dataSourceConfig}
              // onNewRequest={this._addTagToAnnotation}
              onUpdateInput={this._selectTag}
            />

            </div>
        </Dialog>
        </div>
      );
    }

  update = (data) => {
    let oldCanvas = document.getElementById('canvas');
    oldCanvas = null;   

    Object.keys(data.items).forEach(itemId => {
      let item = data.items[itemId];      
      if(item.type!="whole_image" && !item.caption){        
        delete data.items[itemId];
      }
    });

    let annotation = {...this.state.annotations[this.state.currentIndex], annotationInfo: JSON.stringify(data)};
      this._updateAnnotation(annotation,false);

  };

  _getLoggedUser(){
    let user=localStorage.getItem(localStorageConstants.LOGGED_USER);
    return JSON.parse(user);
  }

  _updateAnnotation(annotation,isReject=false){
    if(isReject){
      annotation.isReject=true;
    }
    put(`${uri.annotation}/${annotation.id}`,annotation).then(response=>{
     
      let foundIndex = this.state.annotations.findIndex(x => x.id == annotation.id);
      let newAnnotations=this.state.annotations;
      newAnnotations[foundIndex] = response.data;   
      this.setState({annotations:newAnnotations,open: false});
     
      if(isReject){
        this.setState({currentIndex:this.state.currentIndex==this.state.annotations.length-1?0:this.state.currentIndex+1});
      }
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
    this._updateAnnotation(annotation);
    if(this.state.selectedTag.id==0){
      this.state.selectedTag={};
      this._fetchAllTags();
    }
    }
    else{
      alert("Tag cannot be empty.");
    }
  }

  _addTags=(annotation)=>{

    this.setState({open: true,selectedAnnotation:annotation});
  }

  _handleClose = () => {
    this.setState({open: false});
  }

  _handleConfirmationClose = () => {
    this.setState({confirmation_open: false});
  }

  _onNext = () => { 
    this._setAnnotationsIndex(this.state.currentIndex+1);
  }

  _onPrevious = () => {
      this._setAnnotationsIndex(this.state.currentIndex-1);
  }

  _goToIndex = (index) => {
      this._setAnnotationsIndex(index);
  }

  _add = (item, cb) => {
    item.id = new Date().getTime();
    let data = this.state.data;
    data.items[item.id] = item;    
    this.setState({
        data:data
    }, () => {
      cb && cb(item.id);
    });
  }

  _addWholeImageAnnotation = (node) => {
      let item={};
      item.id = new Date().getTime();
      item.type="whole_image";
      item.diagnosisCaption=node.label;
      item.diagnosisCode=node.value;
      let data = this.state.data;
      data.items[item.id] = item;
      this.setState({data},()=>{
          this.update(data);
      });
  }

  _remove = (item) => {
    let data = this.state.data;
    let items = data.items;
    delete items[item.id];
    data.items = items;
    this.setState({data});
  }

  _setAnnotationsIndex=(index=0)=>{
    let data = {items: {}};
    localStorage.setItem("currentIndex_"+this.props.location.query.batchId,JSON.stringify(index)); 
      this._prefetchImage(); 
      if(this.state.annotations[index].annotationInfo != null && this.state.annotations[index].annotationInfo != ""){
        data = JSON.parse(this.state.annotations[index].annotationInfo); 
      }
      this.setState({data,currentIndex:index,selectItemId:0},()=>{
        let selectedCodes=this._fetchSelectedCodeFromAnnotationInfo();
        this._resetDiagnosisList(selectedCodes);        
      });
  }

  _constructQueryParam = () => {
    let { page, pageSize } = this.state.pagination;
    let batchId=this.props.location.query.batchId;
    return `?annotation=all&page=${page}&pageSize=${pageSize}&batchId=${batchId}&isReject=${this.state.isReject}`;
  }


  _fetchData = () => { 
    let url = uri.images + this._constructQueryParam();
    let data = {items: {}};
    get(url)
      .then(response =>{
        this.setState({ annotations: response.data,filteredAnnotation:response.data, isLoading: false},()=>{
          this._prefetchImage();
          localStorage.removeItem('viewportTransform');
          if(this.state.annotations[this.state.currentIndex].annotationInfo != null && this.state.annotations[this.state.currentIndex].annotationInfo != ""){
            data = JSON.parse(this.state.annotations[this.state.currentIndex].annotationInfo);
          }
          this.setState({data},()=>{
            this._fetchAllDiagnosis();            
            this._scrollToCurrentIndex();
          });
          });
        });
  }

  _fetchUser = () => { 
    let userId=0;
    if(this.props.route.loggedUser){
      userId=this.props.route.loggedUser && this.props.route.loggedUser.id;
    }else{
      userId=this._getLoggedUser().id;
    } 
    let url = uri.users+'/'+userId; 
    get(url)
    .then(response => {
      response.data.batches.forEach((batch)=>{
        if(batch.id == this.props.location.query.batchId){
          this.setState({canEdit: true});  
        }
      })  
      });
   }

   _getLoggedUser(){
    let user=localStorage.getItem(localStorageConstants.LOGGED_USER);
    return JSON.parse(user);
  }

  _fetchAllTags = () => {   
    let url = uri.tags;
    get(url)
      .then(response =>{
        this.setState({ tags: response.data });
        });
  }

  _fetchOptions=()=>{
    let url = uri.annotationLabels+'/image_annotation';;
    get(url)
      .then(response =>{
        this.setState({ options: response.data });
        });
  }

  _fetchSelectedCodeFromAnnotationInfo=()=>{
    let selectedCodes=[];
    let data=this.state.data;
    Object.keys(data.items).forEach(itemId => {
      let item = data.items[itemId];
      if(item.type=="whole_image"){
        selectedCodes.push(item.diagnosisCode);
      }
    });
    return selectedCodes;
  }

  _fetchAllDiagnosis=(selectedCodes)=>{

    let url=uri.annotationLabels+'/whole_image_annotation';
    let diagnosisList=localStorage.getItem(localStorageConstants.WHOLE_IMAGE_LABEL);
    diagnosisList=diagnosisList?JSON.parse(diagnosisList):null;
    if(diagnosisList){
      this.setState({diagnosisList:diagnosisList},()=>{
        let selectedCodes=this._fetchSelectedCodeFromAnnotationInfo();
        this._resetDiagnosisList(selectedCodes);
      })        
    }
    else{
      get(url)
    .then(response =>{
      this.setState({diagnosisList:response.data},()=>{
        let selectedCodes=this._fetchSelectedCodeFromAnnotationInfo();
        this._resetDiagnosisList(selectedCodes);
      })        
      });
    }
  }

  _resetDiagnosisList=(selectedCodes)=>{
  let data=this.state.data;
  Object.keys(data.items).forEach(itemId => {
    let item = data.items[itemId];
    if(item.type=="whole_image"){
      delete data.items[itemId];
    }
  });

    let diagnosisTree=[];
    let diagnosisList=this.state.diagnosisList?this.state.diagnosisList:[];
    diagnosisList.forEach(element => {
      if(element.parentId===0){
        let parent={label:element.displayLabel,value:element.value,checked:selectedCodes.includes(element.value),expanded:true};
        if(parent.checked){
          setTimeout(()=>{ this._addWholeImageAnnotation(parent); }, 1000);          
        }
        let childrens=[];
        diagnosisList.forEach((children)=>{
                      if(children.parentId==parseInt(element.id)){
                        let childItem={label:children.displayLabel,value:children.value,checked:selectedCodes.includes(children.value)};
                        childrens.push(childItem);
                        if(childItem.checked){
                          setTimeout(()=> { this._addWholeImageAnnotation(childItem); }, 1000);
                        }
                      }
                    });
        parent.children=childrens;            
        diagnosisTree.push(parent);            
      }
      
    });
    this.setState({ diagnosisDropdownTree: diagnosisTree,data });
 
}

  _onDiagnosisChange=(currentNode, selectedNodes) => { 
      let selectedCodes=[];
      if(currentNode._parent && currentNode.checked==true){
        selectedNodes=selectedNodes.filter(node=>{
          return (node._parent && node._parent != currentNode._parent) || node.value==currentNode.value ;
        });
      }

      selectedNodes.forEach(node=>{
        selectedCodes.push(node.value);
      });

      if(!selectedCodes.includes(currentNode.value) && currentNode.checked==true){
        selectedCodes.push(currentNode.value);
      }
      this._resetDiagnosisList(selectedCodes);
  }

  _filterPatient=(e)=>{
    let filteredDataList=[];
    if(e && e.target.value){
      filteredDataList =  this.state.annotations.filter(image => image.patient.firstName.toLowerCase().startsWith(e.target.value.toLowerCase())  );
    }
    else{
      filteredDataList=this.state.annotations;
    }
    this.setState({filteredAnnotation: filteredDataList});
  }

  _prefetchImage=()=>{
    for(let i=0;i<this.state.noToPrefetch;i++){
      if((this.state.currentIndex+i) < this.state.annotations.length){
          const img = document.createElement('img');
          img.src = baseUrl + this.state.annotations[this.state.currentIndex + i].imageName; // Assigning the img src immediately requests the image
      }
    }
  }

  _scrollToCurrentIndex=()=>{
    let topPos = document.getElementById('activeIndex').offsetTop;
    document.getElementById('scrollable-container').scrollTop = topPos-10;
  }

  _deleteTags=(tagId,imageId)=>{
    let url = uri.tags+"/"+tagId+"/"+imageId;
    destroy(url)
      .then(response =>{
          let foundIndex = this.state.annotations.findIndex(x => x.id == imageId);
          let newAnnotations=this.state.annotations;
          let newTags=this.state.annotations[foundIndex].tags.filter(x=>x.id !=tagId);    
          newAnnotations[foundIndex].tags=newTags;
          this.setState({annotations:newAnnotations});
        });
  }

  _selectAnnotation=(itemId)=>{
    this.setState({selectItemId:itemId});
  }


};



export default AnnotateEditor;
