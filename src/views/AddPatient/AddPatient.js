import axios from 'axios';
import React, {Component} from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import {GridList, GridTile} from 'material-ui/GridList';
import LinearProgress from 'material-ui/LinearProgress';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

import {uri} from '../../config/uri';
import styles from './styles';

class AddPatient extends Component{

  constructor(){
    super();

    this.state = {
      isLoading: false,
      data: {
        firstName: '',
        middleName: '',
        lastName: '',
        gender: 'male',
        annotations: []
      },
      images: [],
      previewImages: []
    }
  }

  render(){
    return(
      <div>
        {this.state.isLoading &&
          <div
            style={{position: 'absolute', top: 0, left: 0, width: '100%', opacity: 0.2, zIndex: 1200, background: 'grey', height: '100%'}}
          >
            <LinearProgress mode="indeterminate" color="black"/>
          </div>
        }

        <div>
          <h1>Add Patient Info</h1>
          <TextField
            name='firstName'
            value={this.state.data.firstName}
            floatingLabelText='First Name'
            onChange={(e) => this._handleInputChange(e)}
          />
          <TextField
            name='middleName'
            value={this.state.data.middleName}
            floatingLabelText='Middle Name'
            onChange={(e) => this._handleInputChange(e)}
          />
          <TextField
            name='lastName'
            value={this.state.data.lastName}
            floatingLabelText='Last Name'
            onChange={(e) => this._handleInputChange(e)}
          />

          <RadioButtonGroup
            name="gender"
            defaultSelected={this.state.data.gender}
            onChange={(e) => this._handleInputChange(e)}
          >

            <RadioButton
              value="female"
              label="Female"
              style={styles.radioButton}
            />
            <RadioButton
              value="male"
              label="Male"
              style={styles.radioButton}
            />
          </RadioButtonGroup>

          <input type="file" name="file" onChange={(e) => this._handleFileUpload(e)}/>

          <RaisedButton
            label="Save"
            primary={true}
            style={{marginBottom: 20, marginTop: 20}}
            onClick={() => this._saveData()}
            disabled={this.state.isLoading}
          />

          <GridList
            cellHeight={180}
            style={styles.gridList}
          >
            { this.state.previewImages &&
                this.state.previewImages.map((image, index) => (
                <GridTile
                  key={index}
                >
                  <img src={image}/>
                </GridTile>
              ))
            }
          </GridList>

        </div>

      </div>

    );
  }

  _handleFileUpload = (e) => {
    e.preventDefault();

    let image = e.target.files[0];
    if(this._isValidImage(image)){
      let baseEncode = this._generatePerviewImage(image);

      let newImages = this.state.images.concat([image]);

      this.setState({images: newImages});
    } else {
      alert('This is not valid image type');
    }
  }

  _isValidImage = (image) => {
    // console.log(image)
    return image.type.match('image');
  }

  _generatePerviewImage = (image) => {
    let reader = new FileReader();

    reader.onload = (e) => {
      let newPreviewImages = this.state.previewImages.concat([e.target.result]);
      this.setState({previewImages: newPreviewImages});
    }
    reader.readAsDataURL(image);
  }

  _handleInputChange = (e) => {
    let {name, value } = e.target;
    let data = {...this.state.data, [name]:value};
    this.setState({data})
  }

  _saveData = () => {
    if(this.state.data.firstName.trim() === '' || this.state.data.lastName.trim() === '') {
      alert('Please fill required fields');
      return;
    }

    this.setState({isLoading: true});
    const config = {
      headers: {
          'content-type': 'multipart/form-data'
        }
    }
    let data = new FormData();
    this.state.images.forEach && this.state.images.forEach(image => data.append('files', image))

    axios.post(uri.uploadImages, data, config).then(({data}) => {
      let images = [];
      data.data && data.data.forEach(image => {
        let annotation = {imageName: image.filename, annotationInfo: ''};
        images.push(annotation);
      });

      let patientInfo = {...this.state.data, annotations: images};


      axios.post(uri.patients, patientInfo).then(({data}) => {
        this.setState({isLoading: false});
        this.props.router.push('/');
      })
    })
  }
}

export default AddPatient;
