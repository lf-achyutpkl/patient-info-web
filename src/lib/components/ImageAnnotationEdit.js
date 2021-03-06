import React from 'react';

import Rectangle from '../utils/Rectangle';
import Circle from '../utils/Circle';
import Polygon from '../utils/Polygon';

import { fabric } from 'fabric';
import { localStorageConstants } from '../../config/localStorageConstants';
import RefreshIndicator from 'material-ui/RefreshIndicator';
const KEYCODE_ESC = 27;
const KEYCODE_CTRL = 17;

export default class ImageAnnotationEdit extends React.Component {
  constructor(props) {
    super(props);

    this.data = {
      items: {},
    };
    this.state = {
      annModal: {
        position: {
          left: 0,
          top: 0,
        },
        display: 'none',
        text: '',
        searchText: '',
      },
      hasChanged:false,
      useShortcutKey:false,
      isImageLoading:true,
      imageScaleX:0,
      imageScaleY:0
    };

    this.selectedItem = null;
    this.selectedItemId = null;

    this.enableDrawRect = this.enableDrawRect.bind(this);
    this.enableDrawCircle = this.enableDrawCircle.bind(this);
    this.enableDrawPolygon = this.enableDrawPolygon.bind(this);
    this.enableMovement = this.enableMovement.bind(this);
    // this.saveState = this.saveState.bind(this);
    this.loadState = this.loadState.bind(this);
    this.hideAnnModal = this.hideAnnModal.bind(this);
    this.showAnnModal = this.showAnnModal.bind(this);
    this.updateItem = this.updateItem.bind(this);
    this.addItem = this.addItem.bind(this);
    this.saveAnn = this.saveAnn.bind(this);
    this.resetState = this.resetState.bind(this);
    this.init = this.init.bind(this);
    this.mouseOut = this.mouseOut.bind(this);
    this.enableAnnModalEdit = this.enableAnnModalEdit.bind(this);
    this.showAnnCreateModal = this.showAnnCreateModal.bind(this);
    this.handleAnnModalSearchChange = this.handleAnnModalSearchChange.bind(
      this,
    );
    this.deleteAnn = this.deleteAnn.bind(this);
    this.getOptions = this.getOptions.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.resetZoom = this.resetZoom.bind(this);
    this.handleEscKey = this.handleEscKey.bind(this);
  }

  componentDidMount() {
    this.init();
    document.addEventListener("keydown", this.handleEscKey, false);
  }

  componentWillReceiveProps(newProps) {
    this.data=newProps.data;
    this.canvas.clear();
    this.loadState();
    if(newProps.selectItemId){
      this.selectObject(newProps.selectItemId);
    }

    if (newProps.imageURL != this.props.imageURL){
      this.props=newProps;
      this.init();
    }

    if(newProps.canEdit != this.props.canEdit){
      this.props=newProps;
    }
  }

 selectObject = function (itemId) {
   let canvas=this.canvas;
    canvas.getObjects().forEach(function(o) {
        if(o.itemId === itemId) {
          canvas.setActiveObject(o);
        }
    })
}

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleEscKey, false);
  }

  init() {
    let preElem = this.elem.querySelector('.canvas-container');
    if (preElem) this.elem.removeChild(preElem);

    let canvasElement = document.createElement('canvas');
    canvasElement.setAttribute('width', this.props.width);
    canvasElement.setAttribute('height', this.props.height);
    this.elem.appendChild(canvasElement);
    let canvas = new fabric.Canvas(canvasElement);
    canvas.selection = false;
    var panning = false;

    var img = new Image();
    var that = this;
    img.onload = function() {
        canvas.setBackgroundImage(img.src, canvas.renderAll.bind(canvas), {width: that.props.width, height: that.props.height});
        that.setState({isImageLoading:false,imageScaleX:(that.props.width/img.width),imageScaleY:(that.props.height/img.height)});
    }
    img.src = this.props.imageURL;

    this.initializeCanvasEvents(canvas);

    let showAnnCreateModal = this.showAnnCreateModal;

    let rectangle = new Rectangle({
      canvas,
      showAnnCreateModal,
    });
    let circle = new Circle({
      canvas,
      showAnnCreateModal,
    });
    let polygon = new Polygon({
      canvas,
      showAnnCreateModal,
    });

    rectangle.init({
      afterDraw: this.addItem,
    });

    circle.init({
      afterDraw: this.addItem,
    });
    polygon.init({
      afterDraw: this.addItem,
    });

    this.canvas = canvas;
    this.rectangle = rectangle;
    this.circle = circle;
    this.polygon = polygon;
    this.loadState();
  }


  initializeCanvasEvents(canvas){
    let panning = false;
    canvas.observe('object:selected', e => {
      let itemId = e.target.itemId;
      if (!itemId) return;
      this.showAnnModal(itemId);
      this.selectedItem = e.target;
      this.selectedItemId = this.selectedItem.itemId;
    });

    canvas.on('mouse:over', e => {
      // let itemId = e.target.itemId;
      // if (!itemId) return;
      // this.selectedItem = e.target;
      // this.selectedItemId = itemId;
    });

    // for image movement after zoom
    canvas.on('mouse:up', function (e) {
        panning = false;        
    });

    canvas.on('mouse:down', function (e) {
        panning = true;
    });
    canvas.on('mouse:move', function (e) {
        if (panning && e && e.e) {
            var units = 10;
            var delta = new fabric.Point(e.e.movementX, e.e.movementY);
            canvas.relativePan(delta);
        }
    });

    canvas.on('mouse:out', ({ e }) => {});

    canvas.on('object:rotating', e => {
      panning=false;
      let itemId = e.target.itemId;
      if (!itemId) return;
      this.updateItem(itemId, e);
    });

    canvas.on('object:moving', e => {
      panning=false;
      let itemId = e.target.itemId;
      if (!itemId) return;
      this.updateItem(itemId, e);
    });

    canvas.on('object:scaling', e => {
      panning=false;
      let itemId = e.target.itemId;
      if (!itemId) return;
      this.updateItem(itemId, e);
    });

  }

  shouldComponentUpdate(props, nextState) {
    return true;
  }

  clean() {       
    this.rectangle.clean();
    this.polygon.clean();
    this.circle.clean();
    this.rectangle.clean();
    this.initializeCanvasEvents(this.canvas);
  }

  enableDrawRect() {       
    if(this.props.canEdit){
    this.rectangle.clean();
    this.polygon.clean();
    this.circle.clean();
    this.rectangle.draw();
    }
  }

  enableDrawCircle() {
    if(this.props.canEdit){
    this.rectangle.clean();
    this.polygon.clean();
    this.circle.clean();
    this.circle.draw();
    }
  }

  enableDrawPolygon() {
    if(this.props.canEdit){
    this.rectangle.clean();
    this.circle.clean();
    this.polygon.clean();
    this.polygon.draw();
    }
  }

  enableMovement() {
    this.rectangle.clean();
    this.circle.clean();
    this.canvas.renderAll();
  }

  zoomIn(){
    this.canvas.setZoom(this.canvas.getZoom() *1.1);
    this.canvas.renderAll();
  }

  zoomOut() {
    let zoomScale=1;
    if((this.canvas.getZoom() * 0.9) > 1 ){
      zoomScale=this.canvas.getZoom() * 0.9;
    }
    else{
      zoomScale=1;
    }
    this.canvas.setZoom(zoomScale);
    this.canvas.renderAll();

  }

  resetZoom(){
    this.canvas.setZoom(1);
    this.canvas.renderAll();
  }

  enableAnnModalEdit() {
    let annModal = {
      ...this.state.annModal,
      isEdit: true,
    };
    this.setState({ annModal });
  }

  mouseOut(e) {
    if (!this.elem.contains(e.relatedTarget)) { 
      this.hideAnnModal();
      if(this.state.hasChanged==true){
        this.props.update(this.data);
        this.setState({hasChanged:false});
      }
    }
  }

  hideAnnModal() {
    let selectedItemId = null;
    // this.selectedItem = null;
    this.selectedItemId = selectedItemId;

    let annModal = { ...this.state.annModal };
    annModal.text = '';
    annModal.display = 'none';
    annModal.searchText = '';
    this.setState({ annModal });  
    this.clean();   
  }

  showAnnModal(itemId) {
    let selectedItemId = itemId;
    this.selectedItemId = selectedItemId;

    let item = this.data.items[itemId];
    if (!item) return;
    let { top, left, height, caption,width } = item;

    let annModal = { ...this.state.annModal };
    annModal.position.top = top-40;
    annModal.position.left = left+(width?width:0)+20;
    annModal.text = caption;
    annModal.display = 'block';
    annModal.isEdit = !caption;
    annModal.searchText = '';
    let lastSavedOption=localStorage.getItem(localStorageConstants.LAST_SAVED_OPTION);
      this.setState({ annModal },()=>{
        if(this.state.useShortcutKey && lastSavedOption){  
          this.savePreviousAnn(JSON.parse(lastSavedOption));
        }
      });
  }

  showAnnCreateModal({ top, left, height }) {
   
    let annModal = { ...this.state.annModal };
    annModal.position.top = top + height;
    annModal.position.left = left;
    annModal.text = '';
    annModal.display = 'block';
    annModal.isEdit = true;

    this.setState({ annModal });
    this.enableMovement();

    if (true) {
      return 'asdas';
    } else {
      return null;
    }
  }

  saveAnn(option) {
    
      return () => {
      if (!this.selectedItemId) return;
      let item = this.data.items[this.selectedItemId];
      if (!item) return;
      this.data.items[this.selectedItemId]['code'] = option.value;
      this.data.items[this.selectedItemId]['caption'] = option.displayLabel;
      this.data.items[this.selectedItemId]['stroke'] = option.color;
      if(this.selectedItem != null){
        this.selectedItem['stroke'] = option.color
      }      
      localStorage.setItem(localStorageConstants.LAST_SAVED_OPTION, JSON.stringify(option));
      this.setState({hasChanged:true});  
      this.canvas.clear();
      this.loadState();
      this.hideAnnModal();
    };
  }

  savePreviousAnn(option) {
   if (!this.selectedItemId) return;
   let item = this.data.items[this.selectedItemId];
   if (!item) return;
   this.data.items[this.selectedItemId]['code'] = option.value;
   this.data.items[this.selectedItemId]['caption'] = option.displayLabel;
   this.data.items[this.selectedItemId]['stroke'] = option.color;
   if(this.selectedItem != null){
     this.selectedItem['stroke'] = option.color
   }      
   this.setState({hasChanged:true,useShortcutKey:false});
   this.canvas.clear();
   this.loadState();
   this.hideAnnModal();
}

  deleteAnn() {
    let itemId = this.selectedItemId;
    let item = this.data.items[itemId];
    if (!item) return;
    delete this.data.items[itemId];
    this.canvas.clear();
    this.loadState();
    this.setState({hasChanged:true});
    this.hideAnnModal();
  }

  resetState() {
    this.setState({
      resetComponentState: true,
    });
  }

  handleEscKey(e){

    if(e.keyCode == KEYCODE_ESC) {

        let itemId = this.selectedItemId;
        let item = this.data.items[itemId];
        if(item != null && !item.caption){ // newly created item will not have caption key
          this.deleteAnn();
        } else {
          this.hideAnnModal();
        }
    }
    else if(e.keyCode == KEYCODE_CTRL) {
      this.setState({useShortcutKey:true},()=>{
        this.enableDrawRect();
      })
      
    }
  }

  addItem(item) { 
    item.imageScaleX = this.state.imageScaleX;
    item.imageScaleY = this.state.imageScaleY;
    item.id = new Date().getTime();
    this.data.items[item.id] = item;
    this.showAnnModal(item.id);
  }

  updateItem(itemId, e) {
    let target = e.target;
    if (!target) return;

    let item = { ...this.data.items[itemId] }
    item.radius = target.radius*target.scaleX;
    item.width = target.width*target.scaleX;
    item.height = target.height*target.scaleY;
    item.left = target.left;
    item.top = target.top;
    item.angle = target.angle;
    item.scaleX = 1;
    item.scaleY = 1;
    item.imageScaleX = this.state.imageScaleX;
    item.imageScaleY = this.state.imageScaleY;
    this.data.items[itemId] = item;
    this.setState({hasChanged:true});
  }


  loadState() {
    let data = this.data || { items: {} };

    let lastId = this.lastId;

    Object.keys(data.items).forEach(itemId => {
      let item = data.items[itemId];
      let shape = null;

      if (item.type === 'rectangle') {
        shape = new fabric.Rect({
          width: item.width,
          height: item.height,
          left: item.left,
          top: item.top,
          fill: 'transparent',
          stroke: item.stroke || 'red',
          angle: item.angle,
          scaleX: item.scaleX,
          scaleY: item.scaleY,
        });
      }

      if (item.type === 'circle') {
        shape = new fabric.Circle({
          radius: item.radius,
          left: item.left,
          top: item.top,
          fill: 'transparent',
          stroke: item.stroke || 'red',
          angle: item.angle,
          scaleX: item.scaleX,
          scaleY: item.scaleY,
        });
      }

      if (item.type === 'polygon') {
        shape = new fabric.Polygon(item.points, {
          top: item.top,
          left: item.left,
          fill: 'transparent',
          stroke: item.stroke || 'red',
          opacity: 1,
          hasBorders: false,
          hasControls: false,
        });
      }

      if(shape){
        shape.set('itemId', itemId);
        this.canvas.add(shape);
        lastId = lastId < itemId ? itemId : lastId;

        if(!this.props.canEdit){
          this.canvas.getObjects().forEach(function(o) {
            o.set('selectable', false);
         });

        }
      }

   

    });

    this.data = data;
  }

  handleAnnModalSearchChange(e) {
    let annModal = { ...this.state.annModal, searchText: e.target.value };
    this.setState({ annModal });
  }

  getOptions() {
    return this.props.options.filter(option => {
      return (
        option.displayLabel
          .toLowerCase()
          .indexOf(this.state.annModal.searchText.toLowerCase()) > -1
      );
    });
  }

  render() {
    let { annModal } = this.state;

    return (
      <div
        className="image-annotation-wrapper"
        ref={e => (this.elem = e)}
        onMouseOut={this.mouseOut}
      >

      {            
        this.state.isImageLoading  &&
        <RefreshIndicator
          size={50}
          left={70}
          top={0}
          loadingColor="#FF9800"
          status="loading"
          style={{display:'inline-block',position: 'absolute',margin:"250px 350px"}}
        />
      }
        <div className="image-annotation-toolbar">
          <button onClick={this.enableDrawRect}>Draw Rectangle</button>
          <button onClick={this.enableDrawCircle}>Draw Circle</button>
          <button onClick={this.enableDrawPolygon}>Draw Polygon</button>
          <button onClick={this.enableMovement}>Select Tool</button>
          <button onClick={this.zoomIn}>Zoom In</button>
          <button onClick={this.zoomOut}>Zoom Out</button>
          <button onClick={this.resetZoom}>Reset Zoom</button>
          {/* <button onClick={this.saveState}>Save</button> */}
          {/* <button onClick={this.resetState}>Reset</button> */}
        </div>
        <canvas height={this.props.height} width={this.props.width} />
        
        <div
          className="image-annotation-selection"
          style={{
            position: 'absolute',
            zIndex: 1,
            left: annModal.position.left,
            top: annModal.position.top,
            display: annModal.display,
            opacity: 1,
          }}
        >
          <p>{annModal.text}</p>
          <div style={{ display: 'inline-block' }}>
            {!annModal.isEdit && this.props.canEdit &&  (
              <button className="edit-button" onClick={this.enableAnnModalEdit}>
                Edit
              </button>
            )}
            { this.props.canEdit && (
            <button className="edit-button" onClick={this.deleteAnn}>
              Delete
            </button>
            )}
          </div>
          {annModal.isEdit && (
            <ul>
              <li>
                <input
                  type="text"
                  value={annModal.searchText}
                  onChange={this.handleAnnModalSearchChange}
                />
              </li>
              {this.getOptions().map((option, index) => {
                return (
                  <li key={index}>
                    <a href="javascript:void(0);" onClick={this.saveAnn(option)}>{option.displayLabel}</a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  }
}