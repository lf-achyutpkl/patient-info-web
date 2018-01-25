import React from 'react';

import CaptionController from '../utils/CaptionController';
import EventController from '../utils/EventController';
import Rectangle from '../utils/Rectangle';
import Circle from '../utils/Circle';

import { fabric } from 'fabric';

let eventController = new EventController();

export default class ImageAnnotationEdit extends React.Component {
  constructor(props) {
    super(props);

    this.data = {
      items: [],
    };
    this.annModal = {
      position: {
        left: 0,
        top: 0,
      },
      elem: null,
      inputElem: null,
    };
    this.selectedItemId = null;

    this.enableDrawRect = this.enableDrawRect.bind(this);
    this.enableDrawCircle = this.enableDrawCircle.bind(this);
    this.enableMovement = this.enableMovement.bind(this);
    this.saveState = this.saveState.bind(this);
    this.loadState = this.loadState.bind(this);
    this.hideAnnModal = this.hideAnnModal.bind(this);
    this.showAnnModal = this.showAnnModal.bind(this);
    this.updateItem = this.updateItem.bind(this);
    this.addItem = this.addItem.bind(this);
    this.saveAnn = this.saveAnn.bind(this);
    this.resetState = this.resetState.bind(this);
    this.init = this.init.bind(this);
  }

  componentDidMount() {
   this.init();
  }

  componentWillReceiveProps() {
    this.init();
  }

  init() {
      let canvas = new fabric.Canvas(this.canvasElement);

      canvas.observe('object:selected', function(e) {
          if (e.target.caption) {
              console.log(e.target.caption, 111);
          }
      });

      canvas.on('mouse:over', e => {
          let itemId = e.target.itemId;
          if (!itemId) this.hideAnnModal();

          this.showAnnModal(itemId);
      });

      canvas.on('mouse:out', e => {
          this.hideAnnModal();
      });

      canvas.on('object:rotating', e => {
          let itemId = e.target.itemId;
          if (!itemId) return;

          this.updateItem(itemId, e);
      });

      canvas.on('object:moving', e => {
          let itemId = e.target.itemId;
          if (!itemId) return;
          this.updateItem(itemId, e);
      });

      canvas.on('object:scaling', e => {
          let itemId = e.target.itemId;
          if (!itemId) return;
          this.updateItem(itemId, e);
      });

      let annModal = {
          ...this.annModal,
          elem: this.$annModal,
          inputElem: this.$annModalInput,
      };

      let captionController = new CaptionController({ modal: this.$annModal });

      let rectangle = new Rectangle({
          canvas,
          captionController,
          eventController,
      });
      let circle = new Circle({ canvas, captionController, eventController });

      rectangle.init({
          afterDraw: this.addItem,
      });

      circle.init({
          afterDraw: this.addItem,
      });

      this.canvas = canvas;
      this.annModal = annModal;
      this.rectangle = rectangle;
      this.circle = circle;
      this.captionController = captionController;
      this.loadState();
  }

  shouldComponentUpdate(props, nextState) {
    return nextState.resetComponentState;
  }

  enableDrawRect() {
    this.rectangle.clean();
    this.circle.clean();
    this.rectangle.draw();
  }

  enableDrawCircle() {
    this.rectangle.clean();
    this.circle.clean();
    this.circle.draw();
  }

  enableMovement() {
    this.rectangle.clean();
    this.circle.clean();
    this.canvas.getObjects().forEach(function(o) {
      console.log('herer', o);
      eventController.enableEvents(o);
    });
  }

  hideAnnModal() {
    console.log('hide modal');
    let selectedItemId = null;
    let annModal = { ...this.annModal };

    annModal.elem.style.opacity = 0;
    annModal.elem.style.pointerEvents = 'none';
    annModal.inputElem.value = null;

    this.annModal = annModal;
    this.selectedItemId = selectedItemId;
  }

  showAnnModal(itemId) {
    console.log('show modal');
    console.log(itemId, this.data);

    let selectedItemId = itemId;

    let item = this.data.items[itemId];
    if (!item) return;
    let { top, left, height, caption } = item;

    let annModal = { ...this.annModal };
    annModal.position.top = top;
    annModal.position.left = left;

    annModal.elem.style.left = left + 'px';
    annModal.elem.style.top = top + height - 7 + 'px';
    annModal.elem.style.opacity = 1;
    annModal.elem.style.pointerEvents = 'auto';

    annModal.inputElem.value = caption || null;

    this.annModal = annModal;
    this.selectedItemId = selectedItemId;
  }

  saveAnn() {
    if (!this.selectedItemId) return;
    let item = this.data.items[this.selectedItemId];
    if (!item) return;

    this.data.items[this.selectedItemId][
      'caption'
    ] = this.annModal.inputElem.value;

    this.hideAnnModal();
  }

  resetState() {
    this.setState({
      resetComponentState: true,
    });
  }

  addItem(item) {
    this.data.items[item.id] = item;
  }

  updateItem(itemId, e) {
    let target = e.target;
    if (!target) return;

    let item = { ...this.data.items[itemId] };

    item.width = target.width;
    item.height = target.height;
    item.left = target.left;
    item.top = target.top;
    item.angle = target.angle;
    item.scaleX = target.scaleX;
    item.scaleY = target.scaleY;

    this.data.items[itemId] = item;
  }

  saveState() {
    if (this.props.update) this.props.update(this.data);
  }

  loadState() {
    let data = this.props.data;

    let lastId = this.lastId;

    Object.keys(data.items) && Object.keys(data.items).forEach(itemId => {
      let item = data.items[itemId];
      let shape = null;

      if (item.type === 'rectangle') {
        shape = new fabric.Rect({
          width: item.width,
          height: item.height,
          left: item.left,
          top: item.top,
          fill: 'transparent',
          stroke: 'red',
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
          stroke: 'red',
          angle: item.angle,
          scaleX: item.scaleX,
          scaleY: item.scaleY,
        });
      }

      shape.set('itemId', itemId);

      this.canvas.add(shape);
      lastId = lastId < itemId ? itemId : lastId;
    });

    this.data = data;
  }

  render() {
    return (
      <div className="image-annotation-wrapper">
        <div className="image-annotation-toolbar">
          <button onClick={this.enableDrawRect}>Draw Rectangle</button>
          <button onClick={this.enableDrawCircle}>Draw Circle</button>
          <button onClick={this.enableMovement}>Select Tool</button>
          <button onClick={this.saveState}>Save</button>
          <button onClick={this.resetState}>Reset</button>
        </div>
        <img
          src={this.props.imageURL}
          height={this.props.height}
          width={this.props.width}
        />
        <canvas
          height="600"
          width="800"
          id="canvas"
          ref={input => {
            this.canvasElement = input;
          }}
        />
        <div
          className="annotorious-editor"
          ref={input => {
            this.$annModal = input;
          }}
          style={{
            position: 'absolute',
            zIndex: 1,
            left: '0px',
            top: '0px',
            pointerEvents: 'none',
          }}
        >
          <form>
            <textarea
              className="annotorious-editor-text goog-textarea"
              placeholder="Add a Comment..."
              tabIndex="1"
              style={{
                overflowY: 'hidden',
                overflowX: 'auto',
                boxSizing: 'border-box',
                height: '17px',
                paddingBottom: '0px',
              }}
              rows="1"
              ref={input => {
                this.$annModalInput = input;
              }}
            />
            <div className="annotorious-editor-button-container">
              <a
                className="annotorious-editor-button annotorious-editor-button-cancel"
                href="javascript:void(0);"
                tabIndex="3"
              >
                Delete
              </a>
              <a
                className="annotorious-editor-button annotorious-editor-button-save"
                href="javascript:void(0);"
                tabIndex="2"
                onClick={this.saveAnn}
              >
                Save
              </a>
            </div>
          </form>
          <div
            style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              width: '5px',
              height: '100%',
              cursor: 'e-resize',
            }}
          />
        </div>
      </div>
    );
  }
}
