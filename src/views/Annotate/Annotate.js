import React, {Component} from 'react';
import {get, put} from '../../utils/httpUtils';
import {baseUrl, uri} from '../../config/uri';
import ImageAnnotationEdit from '../../lib/components/ImageAnnotationEdit';

const ANNOTATIONS = 'annotation';
const SELECTED_INDEX = 'selectedIndex';
const IMAGE_WIDTH = 800;
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
          isLoading: true,
          annotationIds: [],
          currentIndex: 0,
          annotation: {},
          imageUrl: "http://www.ultrahdfreewallpapers.com/uploads/large/animals/cat-hd-wallpaper-0380.jpg"
        }
    }

    componentWillMount(){
      let previousEntries = localStorage.getItem(ANNOTATIONS);
      let selectedIndex = localStorage.getItem(SELECTED_INDEX);
      let queryParamIds = this.props.location.query.id.split(',');

      if(previousEntries != 'null' && previousEntries && selectedIndex){
        if(JSON.parse(previousEntries).toString() == queryParamIds.toString()){
          this.setState({currentIndex: JSON.parse(selectedIndex)})
        } else {
          localStorage.setItem(SELECTED_INDEX, 0);
          localStorage.setItem(ANNOTATIONS, null);
        }
      }

      this.setState({annotationIds: queryParamIds})
    }

    componentDidMount(){
      if( this.state.annotationIds && this.state.annotationIds.length > 0 ){
        this._fetchAnnotation();
      }
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
      if(this.state.isLoading){
        return 'loading.....'
      }

      return (
        <div id="asdf">
          {
            this.state.annotationIds.length > 1 && this.state.currentIndex < this.state.annotationIds.length - 1 &&
            <button type="button" className="btn btn-primary" onClick={this._onNext}>Next Image</button>
          }

          <ImageAnnotationEdit
            imageURL={this.state.imageUrl}
            height={IMAGE_HEIGHT}
            width={IMAGE_WIDTH}
            update={this.update}
            data={this.state.data}
            options={OPTIONS}
            add={this._add}
            remove={this._remove}
          />
        </div>
      );
    }

    _fetchAnnotation = () => {
      get(`${uri.annotation}/${this.state.annotationIds[this.state.currentIndex]}`)
      .then(response => {
        let imageUrl = baseUrl + response.data.imageName;
        let data = {items: {}};

        if(response.data.annotationInfo != ""){
          data = JSON.parse(response.data.annotationInfo);
        }
        this.setState({ annotation: response.data, imageUrl, data, isLoading: false }, () => {
          console.log(this.state.items)
        });
      })
    }

  update = (data) => {
    let oldCanvas = document.getElementById('canvas');
    oldCanvas = null;


    let annotation = {...this.state.annotation, annotationInfo: JSON.stringify(this.state.data)};

    // this.setState({annotation}, () => {
      put(`${uri.annotation}/${this.state.annotationIds[this.state.currentIndex]}`, annotation);
    // })

  };

  _onNext = () => {
    // this.setState({currentIndex: this.state.currentIndex + 1}, () => {
    //   this._fetchAnnotation();
    // });
    localStorage.setItem(SELECTED_INDEX, this.state.currentIndex + 1);
    localStorage.setItem(ANNOTATIONS, JSON.stringify(this.state.annotationIds));

    window.location.reload();
  }

  _add = (item) => {
    item.id = new Date().getTime();
    let data = this.state.data;
    data.items[item.id] = item;
    this.setState({
        data
    });
  }

  _remove = (item) => {
    let data = this.state.data;
    let items = data.items;
    delete items[item.id];
    data.items = items;
    this.setState({data});
  }
};

export default AnnotateEditor;
