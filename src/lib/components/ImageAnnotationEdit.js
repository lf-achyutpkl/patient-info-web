import React from 'react';

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
    this.mouseOut = this.mouseOut.bind(this);
    this.enableAnnModalEdit = this.enableAnnModalEdit.bind(this);
    this.showAnnCreateModal = this.showAnnCreateModal.bind(this);
    this.handleAnnModalSearchChange = this.handleAnnModalSearchChange.bind(
      this,
    );
    this.getOptions = this.getOptions.bind(this);
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

      this.showAnnModal(itemId);
    });

    canvas.on('mouse:out', ({ e }) => {});

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

    let showAnnCreateModal = this.showAnnCreateModal;

    let rectangle = new Rectangle({
      canvas,
      showAnnCreateModal,
      eventController,
    });
    let circle = new Circle({
      canvas,
      showAnnCreateModal,
      eventController,
    });

    rectangle.init({
      afterDraw: this.addItem,
    });

    circle.init({
      afterDraw: this.addItem,
    });

    this.canvas = canvas;
    this.rectangle = rectangle;
    this.circle = circle;
    this.loadState();
  }

  shouldComponentUpdate(props, nextState) {
    return true;
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
    }
  }

  hideAnnModal() {
    console.log('hide modal');
    let selectedItemId = null;
    this.selectedItemId = selectedItemId;

    let annModal = { ...this.state.annModal };
    annModal.text = '';
    annModal.display = 'none';
    annModal.searchText = '';
    this.setState({ annModal });
  }

  showAnnModal(itemId) {
    console.log('show modal');
    console.log(itemId, this.data);

    let selectedItemId = itemId;
    this.selectedItemId = selectedItemId;

    let item = this.data.items[itemId];
    if (!item) return;
    let { top, left, height, caption } = item;

    let annModal = { ...this.state.annModal };
    annModal.position.top = top + height;
    annModal.position.left = left;
    annModal.text = caption;
    annModal.display = 'block';
    annModal.isEdit = !caption;
    annModal.searchText = '';

    this.setState({ annModal });
  }

  showAnnCreateModal(e) {
    let annModal = { ...this.state.annModal };
    annModal.position.top = e.target.top + e.target.height;
    annModal.position.left = e.target.left;
    annModal.text = '';
    annModal.display = 'block';
    annModal.isEdit = true;

    this.setState({ annModal });

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
      this.data.items[this.selectedItemId]['caption'] = option;
      this.hideAnnModal();
    };
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
    let data = this.props.data || {items: {}};

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

  handleAnnModalSearchChange(e) {
    let annModal = { ...this.state.annModal, searchText: e.target.value };
    this.setState({ annModal });
  }

  getOptions() {
    return this.props.options.filter(option => {
      return (
        option
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
          {!annModal.isEdit && (
            <button className="edit-button" onClick={this.enableAnnModalEdit}>Edit</button>
          )}
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
                  <li key={index} onClick={this.saveAnn(option)}>
                    {option}
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
