import Dropzone from 'react-dropzone';
import React, {Component} from 'react';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import LinearProgress from 'material-ui/LinearProgress';

class BatchUpload extends Component{

  constructor() {
    super()

    this.state = {
      accepted: [],
      rejected: []
    }
  }

  render(){
    return(
      <div className="container">
        {this.state.isLoading &&
          <div
            style={{position: 'absolute', top: 0, left: 0, width: '100%', opacity: 0.2, zIndex: 1200, background: 'grey', height: '100%'}}
          >
            <LinearProgress mode="indeterminate" color="black"/>
          </div>
        }

        <AppBar
          title='Add Patient Information'
          iconElementRight={<FlatButton label="Dashboard" onClick={() => this.props.router.push('/')}/>}
        />
        <div>
          <Dropzone
            accept="image/jpeg, image/png"
            onDrop={(accepted, rejected) => { this.setState({ accepted, rejected }); }}
          >
            <p>Try dropping some files here, or click to select files to upload.</p>
            <p>Only *.jpeg and *.png images will be accepted</p>
          </Dropzone>
        </div>
        <aside>
          <h2>Accepted files</h2>
          <ul>
            {
              this.state.accepted.map(f => <li key={f.name}>{f.name} - {f.size} bytes</li>)
            }
          </ul>
          <h2>Rejected files</h2>
          <ul>
            {
              this.state.rejected.map(f => <li key={f.name}>{f.name} - {f.size} bytes</li>)
            }
          </ul>
        </aside>
      </div>
    );
  }
}

export default BatchUpload;
