import React, {Component} from 'react';
import {get, put} from '../../utils/httpUtils';
import {baseUrl, uri} from '../../config/uri';
import ImageAnnotationEdit from '../../lib/components/ImageAnnotationEdit';

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
          isLoading: true,
          annotationId: props.location.query.id,
          annotation: {},
          imageUrl: "http://www.ultrahdfreewallpapers.com/uploads/large/animals/cat-hd-wallpaper-0380.jpg"
        }
    }

    componentDidMount(){
      if(this.state.annotationId){
        get(`${uri.annotation}/${this.state.annotationId}`)
          .then(response => {
            let imageUrl = baseUrl + response.data.imageName;
            console.log(this.state.annotation.annotationInfo)
            this.setState({annotation: response.data, imageUrl, isLoading: false});
          })
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
        <div>
          <ImageAnnotationEdit
            imageURL={this.state.imageUrl}
            height={IMAGE_HEIGHT}
            width={IMAGE_WIDTH}
            update={this.update}
            data={JSON.parse(this.state.annotation.annotationInfo || null)}
            options={OPTIONS}
          />
        </div>
      );
    }

  update = (data) => {
    let annotation = {...this.state.annotation, annotationInfo: JSON.stringify(data)};
    // this.setState({annotation}, () => {
      put(`${uri.annotation}/${this.state.annotationId}`, annotation);
    // })

  };
};

export default AnnotateEditor;
