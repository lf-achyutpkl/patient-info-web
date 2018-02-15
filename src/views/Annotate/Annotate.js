import React, {Component} from 'react';
import {get, put} from '../../utils/httpUtils';
import {baseUrl, uri} from '../../config/uri';
import ImageAnnotationEdit from '../../lib/components/ImageAnnotationEdit';
import {localStorageConstants} from '../../config/localStorageConstants';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';
import RaisedButton from 'material-ui/RaisedButton';
import DropdownTreeSelect from 'react-dropdown-tree-select'
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
const OPTIONS = [
  {label: 'Microaneurysm', color: 'green'},
  {label: 'Haemorrhages', color: 'blue'},
  {label: 'Venous bedding', color: 'yellow'},
  {label: 'Intraretinal microvascular abnormalities(IRMA)', color: 'cyan'},
  {label: 'New vessels at the disc (NVD)', color: 'pink'},
  {label: 'New vessels elsewhere (NVE)', color: 'maroon'},
  {label: 'Vitreous haemorrhage', color: 'Aqua'},
  {label: 'Pre retinal haemorrrhage', color: 'Teal'},
  {label: 'Hard exudates', color: 'DARKSALMON'},
  {label: 'Retinal thickening', color: 'PURPLE'}
];

class AnnotateEditor extends Component {

    constructor(props){
        super(props);

        this.state = {
          data: {
            items:{},
          },
          currentUser:{},
          open: false,
          selectedTag:{},
          isLoading: true,
          annotations: [],
          tags:[],
          currentIndex: localStorage.getItem(SELECTED_INDEX)?JSON.parse(localStorage.getItem(SELECTED_INDEX)):0,
          imageUrl: "",
          isReject:false,
          pagination: {
            page: 1,
            pageSize: 1000,
            rowCount: 0,
            pageCount: 0
          },
          diagnosisList:[],
          diagnosisDropdownTree:[]
        }
    }

    // componentWillMount(){
    //   let previousEntries = localStorage.getItem(ANNOTATIONS);
    //   let selectedIndex = localStorage.getItem(SELECTED_INDEX);
    //   let queryParamIds = this.props.location.query.id.split(',');

    //   if(previousEntries != 'null' && previousEntries && selectedIndex){
    //     if(JSON.parse(previousEntries).toString() == queryParamIds.toString()){
    //       this.setState({currentIndex: JSON.parse(selectedIndex)})
    //     } else {
    //       localStorage.setItem(SELECTED_INDEX, 0);
    //       localStorage.setItem(ANNOTATIONS, null);
    //     }
    //   }

    //   this.setState({annotationIds: queryParamIds})
    // }

    componentDidMount(){
      this._fetchData();
      this._fetchAllTags();
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

      const dataSourceConfig = {
        text: 'tagName',
        value: 'id',
      };

      if(this.state.isLoading){
        return 'loading.....'
      }

      return (
        <div id="asdf">
         <div>
          {            
            this.state.annotations.length > 1 && this.state.currentIndex > 0 &&
            <button type="button" className="btn btn-primary"  style={{marginRight:'10px',marginBottom:'15px'}} onClick={this._onPrevious}>Previous Image</button>
          }

          {            
            this.state.annotations.length > 1 && this.state.currentIndex < this.state.annotations.length - 1 &&
            <button type="button" className="btn btn-primary" style={{marginBottom:'15px'}} onClick={this._onNext}>Next Image</button>
          }
          </div>
          <div style={{width:"82%",float:"left"}}>
          <ImageAnnotationEdit
            imageURL={ baseUrl + this.state.annotations[this.state.currentIndex].imageName}
            height={IMAGE_HEIGHT}
            width={IMAGE_WIDTH}
            update={this.update}
            data={this.state.data}
            options={OPTIONS}
            add={this._add}
            remove={this._remove}
          />
          </div>
          <div style={{width:"18%",float:"left"}}>
          <DropdownTreeSelect className="tree-dropdown" data={this.state.diagnosisDropdownTree} onChange={this._onDiagnosisChange} />
          <div>
            <label>Tags : </label>
            {this.state.annotations[this.state.currentIndex].tags.map((tag, index)=>{
              return(
              <Chip style={{display:"inline-block",marginLeft:"5px"}} key={index}>
              {tag.tagName}
              </Chip>
              )
            })
            }
            <RaisedButton label="Add Tags" primary={true} onClick={() => this._addTags(this.state.annotations[this.state.currentIndex])} style={{display:"block",marginTop:"10px"}}/>
          </div>
          <div  style={{maxHeight:"440px",overflow:"auto",marginTop:"10px"}}>
          <Table className="tags-list">
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>Patient Name</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody showRowHover displayRowCheckbox={false}  >
            {
              this.state.annotations &&
                this.state.annotations.map((annotation,index) =>
                  <TableRow key={annotation.id} style={{background:this.state.currentIndex==index?"rgba(224, 224, 223, 1)":""}}>
                    <TableRowColumn><a href="#" onClick={() => this._setAnnotationsIndex(index)}>{`${annotation.patient.firstName} ${annotation.patient.lastName}`}</a></TableRowColumn>
                  </TableRow>
                )
            }
          </TableBody>
        </Table>
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
    let annotation = {...this.state.annotations[this.state.currentIndex], annotationInfo: JSON.stringify(data)};
    // this.setState({annotation}, () => {
      this._updateAnnotation(annotation);
    // })

  };

  _getLoggedUser(){
    let user=localStorage.getItem(localStorageConstants.LOGGED_USER);
    return JSON.parse(user);
  }

  _updateAnnotation(annotation){
    put(`${uri.annotation}/${annotation.id}`,annotation).then(response=>{
      let foundIndex = this.state.annotations.findIndex(x => x.id == annotation.id);
      let newAnnotations=this.state.annotations;
      newAnnotations[foundIndex] = response.data;
      
      this.setState({annotations:newAnnotations,open: false});
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
  };

  _onNext = () => {
    this._setAnnotationsIndex(this.state.currentIndex+1);
  }

  _onPrevious = () => {
    this._setAnnotationsIndex(this.state.currentIndex-1);
  }

  _add = (item, cb) => {
    item.id = new Date().getTime();
    let data = this.state.data;
    data.items[item.id] = item;
    this.setState({
        data
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
      });
  }

  _remove = (item) => {
    let data = this.state.data;
    let items = data.items;
    delete items[item.id];
    data.items = items;
    this.setState({data});
  }

  _setAnnotationsIndex=(index)=>{
    let data = {items: {}};
    localStorage.setItem(SELECTED_INDEX,JSON.stringify(index));
    this.setState({currentIndex:index},()=>{  
      if(this.state.annotations[this.state.currentIndex].annotationInfo != null && this.state.annotations[this.state.currentIndex].annotationInfo != ""){
        data = JSON.parse(this.state.annotations[this.state.currentIndex].annotationInfo); 
      }
      this.setState({data},()=>{
        let selectedCodes=this._fetchSelectedCodeFromAnnotationInfo();
        this._resetDiagnosisList(selectedCodes);
      });
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
        this.setState({ annotations: response.data, isLoading: false,currentIndex:0 },()=>{
          if(this.state.annotations[this.state.currentIndex].annotationInfo != null && this.state.annotations[this.state.currentIndex].annotationInfo != ""){
            data = JSON.parse(this.state.annotations[this.state.currentIndex].annotationInfo);
          }
          this.setState({data:data},()=>{
            this._fetchAllDiagnosis();
          });
          });
        });
  }

  _fetchAllTags = () => {   
    let url = uri.tags;
    get(url)
      .then(response =>{
        this.setState({ tags: response.data });
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
    let url=uri.diagnosis;
    get(url)
    .then(response =>{
      this.setState({diagnosisList:response.data},()=>{
        let selectedCodes=this._fetchSelectedCodeFromAnnotationInfo();
        this._resetDiagnosisList(selectedCodes);
      })
        
      });
  }

  _resetDiagnosisList=(selectedCodes)=>{
  let data=this.state.data;
  Object.keys(data.items).forEach(itemId => {
    let item = data.items[itemId];
    if(item.type=="whole_image"){
      delete data.items[itemId];
    }
  }); 
  this.setState({data},()=>{
    let diagnosisTree=[];
    this.state.diagnosisList.forEach(element => {
      if(element.parentCode=="0"){
        let parent={label:element.name,value:element.code,checked:selectedCodes.includes(element.code),expanded:true};
        if(parent.checked){
          this._addWholeImageAnnotation(parent);
        }
        let childrens=[];
        this.state.diagnosisList.forEach((children)=>{
                      if(children.parentCode===element.code){
                        let childItem={label:children.name,value:children.code,checked:selectedCodes.includes(children.code)};
                        childrens.push(childItem);
                        if(childItem.checked){
                          this._addWholeImageAnnotation(childItem);
                        }
                      }
                    });
        parent.children=childrens;            
        diagnosisTree.push(parent);            
      }
      
    });
    this.setState({ diagnosisDropdownTree: diagnosisTree });
  });
 
}

  _onDiagnosisChange=(currentNode, selectedNodes) => { 
      let selectedCodes=[];
      if(currentNode._parent && currentNode.checked==true){
        selectedNodes=selectedNodes.filter(node=>{
          return node._parent != currentNode._parent;
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

};

export default AnnotateEditor;
