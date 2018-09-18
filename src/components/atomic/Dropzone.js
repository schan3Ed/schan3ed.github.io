import React, { Component, Fragment } from 'react';
import _Dropzone from 'react-dropzone';
import Icon from '@material-ui/core/Icon';
import Button from './Button';
import Typography from '@material-ui/core/Typography';
import * as loadImage from 'blueimp-load-image';
var dataURLtoBlob = require('dataurl-to-blob');
var getOrientedImage = require('exif-orientation-image');
var findOrientation = require('exif-orientation');

export default class Dropzone extends Component {
    constructor(props) {
        super(props);
        this.state = {rotation: 0}
        this.zone = React.createRef();
    }

    render() {
        let {onDrop, onClearDrop, source, ...other } = this.props;
        let newOnDrop = (file)  => {
            let rotation = 0;
            findOrientation(file[0],(err,orientation) => {
                if (err) {
                    this.setState({rotation})
                    console.log(err);
                    return;
                }
                rotation = orientation.rotate;
                this.setState({rotation})
            });
            onDrop(file);
        }
        return (
            <div className="dropzone">
                <_Dropzone ref={(node) => { this.zone = node; }} onDrop={newOnDrop} className="drop-box" multiple={false} {...other}>
                    <div className={`placeholder ${source?'hidden':''}`}>
                        <Icon className="splash-icon">photo</Icon>
                        <Typography variant="subheading" className="splash-text">
                            click or drag to upload photo
                        </Typography>
                    </div>
                    <img className="drop-img" style={{transform: `rotate(${this.state.rotation}deg) scale(10)`}} src={source}/>
                    <Button variant="contained" color="secondary" onClick={(e) => onClearDrop(e) } className={`drop-clear-button ${source? '':'hidden'}`}>
                        <Icon className="icon">delete</Icon>
                    </Button>
                </_Dropzone>
                <Button variant="outlined" color="primary" onClick={() => { this.zone.open() }} className="drop-open-button">
                    Upload Photo
                </Button>
            </div>
        )
    }
}