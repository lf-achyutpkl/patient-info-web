import React, {Component} from 'react';
import {get, put} from '../../utils/httpUtils';
import {baseUrl, uri} from '../../config/uri';
import ImageAnnotationEdit from '../../lib/components/ImageAnnotationEdit';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import AutoComplete from 'material-ui/AutoComplete';
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
const IMAGE_WIDTH = 700;
const IMAGE_HEIGHT = 600;
const OPTIONS = [
  'Microaneurysm',
  'Haemorrhages',
  'Venous bedding ',
  'Intraretinal microvascular abnormalities(IRMA)',
  'New vessels at the disc (NVD)',
  'New vessels elsewhere (NVE)',
  'Vitreous haemorrhage',
  'Pre retinal haemorrrhage',
  'Hard exudates',
  'Retinal thickening',
];

class AnnotateEditor extends Component {

    constructor(props){
        super(props);

        this.state = {
          data: {
            items: {}
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
          <div style={{width:"62%",float:"left"}}>
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
          <div style={{width:"38%",float:"left"}}>
          <Table>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>Patient Name</TableHeaderColumn>
              <TableHeaderColumn>Tags</TableHeaderColumn>
              <TableHeaderColumn>Action</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody showRowHover displayRowCheckbox={false}  >
            {
              this.state.annotations &&
                this.state.annotations.map((annotation,index) =>
                  <TableRow key={annotation.id} >
                    <TableRowColumn><a href="#" onClick={() => this._gotoIndex(index)}>{`${annotation.patient.firstName} ${annotation.patient.lastName}`}</a></TableRowColumn>
                    <TableRowColumn style={{whiteSpace: 'normal',wordWrap: 'break-word'}}>{annotation.tags.map((tag)=>{return tag.tagName}).join(',')}</TableRowColumn>
                    <TableRowColumn>
                      <a href="#"  onClick={() => this._addTags(annotation)}>Add Tags</a>
                    </TableRowColumn>
                  </TableRow>
                )
            }
          </TableBody>
        </Table>
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

    // _fetchAnnotation = () => {
    //   get(`${uri.annotation}/${this.state.annotationIds[this.state.currentIndex]}`)
    //   .then(response => {
    //     let imageUrl = baseUrl + response.data.imageName;
    //     this.setState({ annotation: response.data, imageUrl, isLoading: false });
    //   })
    // }

  update = (data) => {
    let oldCanvas = document.getElementById('canvas');
    oldCanvas = null;
    let annotation = {...this.state.annotations[this.state.currentIndex], annotationInfo: JSON.stringify(data)};
    // this.setState({annotation}, () => {
      this._updateAnnotation(annotation);
    // })

  };

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
    localStorage.setItem(SELECTED_INDEX,JSON.stringify(this.state.currentIndex+1));
    window.location.reload()
  //  this.setState({currentIndex:this.state.currentIndex+1});
  }

  _onPrevious = () => {
    localStorage.setItem(SELECTED_INDEX,JSON.stringify(this.state.currentIndex-1));
    window.location.reload()
    // this.setState({currentIndex:this.state.currentIndex-1});
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

  _remove = (item) => {
    let data = this.state.data;
    let items = data.items;
    delete items[item.id];
    data.items = items;
    this.setState({data});
  }
  _gotoIndex=(index)=>{
    localStorage.setItem(SELECTED_INDEX,JSON.stringify(index));
    window.location.reload()
  }

  _constructQueryParam = () => {
    let { page, pageSize } = this.state.pagination;
    let batchId=this.state.currentUser.batches.length > 0 ? this.state.currentUser.batches[0].id : 0;
    return `?annotation=all&page=${page}&pageSize=${pageSize}&batchId=${batchId}&isReject=${this.state.isReject}`;
  }


  _fetchData = () => {   

    let url = uri.users+'/'+this.props.route.loggedUser.id; 
    get(url)
    .then(response => {
        this.setState({currentUser: response.data})        
        url = uri.images + this._constructQueryParam();
        get(url)
        .then(response => this.setState({annotations: response.data,  isLoading: false}));
      });

  }

  _fetchAllTags = () => {   
    let url = uri.tags;
    get(url)
      .then(response =>{
        this.setState({ tags: response.data });
        });
  }

};

export default AnnotateEditor;
