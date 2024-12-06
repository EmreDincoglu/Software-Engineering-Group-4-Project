import React from "react";
import {Jimp} from "jimp";
import "./image.css";
import { getImage, MethodCaller } from "../default";

// Crops a image square
function cropSquare(img){
  const width = img.bitmap.width;
  const height = img.bitmap.height;
  const side = Math.min(width, height);
  const x = width<height? 0 : (width-side)/2;
  const y = width<height? (height-side)/2 : 0;
  return img.crop({
    w: side-1, h: side-1, x: x, y: y
  });
}
// resizes img to size
function resize(img, size){
  return img.resize({w: size, h: size});
}
// Limits the number of pixels to res
function limit(img, res){
  const factor = Math.sqrt(res/(img.bitmap.width*img.bitmap.height));
  if (factor > 1) {return img;}
  return img.resize({w: img.bitmap.width*factor, h: img.bitmap.height*factor});
}

export class ImageInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleImageUpload = this.handleImageUpload.bind(this);
  }

  // Uploads the image, does conversion if necessary, calls onChange from props
  async handleImageUpload(event){
    event.preventDefault();
    // convert image into jimpImage
    const input_data = await event.target.files[0]?.arrayBuffer();
    let jimpImage = await Jimp.fromBuffer(input_data);
    // Format image into recognized size and shape
    if (this.props.cropSquare === true) {
      jimpImage = cropSquare(jimpImage);
    }
    if (this.props.sideLength != null) {
      jimpImage = resize(jimpImage, this.props.sideLength);
    }
    if (this.props.limitRes != null) {
      jimpImage = limit(jimpImage, this.props.limitRes);
    }
    // Convert to base64 encoding
    const uploaded_image = await jimpImage.getBase64("image/png");
    if (this.props.onChange == null) {return;}
    return this.props.onChange(uploaded_image);
  }

  render() {
    return <div className="image-input">
      <label>
        <img 
          src={this.props.value??this.props.fallback}
          alt={this.props.alt}
        />
        <input 
          type = "file"
          accept = "image/*"
          onChange = {this.handleImageUpload }
          style={{display: 'none'}}
        />
      </label>
      {
        this.props.value != null && 
        this.props.onChange != null && 
        <button className='remove-button' onClick={() => this.props.onChange(null)}>X</button>
      }
    </div>;
  }
}
export class ImageSetInput extends React.Component {
  render(){
    let photos = this.props.photos??[];
    let emptyCount = this.props.count - photos.length;
    return <>
      {photos.map((photo, i) => (<ImageInput
        key={i}
        value={photo}
        fallback={this.props.fallback??null}
        alt={"Photo " + (i+1)}
        onChange={(img) => {
          let list = photos; list[i] = img;
          this.props.onChange(list)
        }}
        cropSquare={this.props.cropSquare??null}
        sideLength={this.props.sideLength??null}
        limitRes={this.props.limitRes??null}
      />))}
      {Array(this.props.renderAll? emptyCount : 1).map((_, i) => (<ImageInput
        key={i+photos.length}
        fallback={this.props.fallback??null}
        alt={"Photo " + (i+1)}
        onChange={(img) => {
          let list = photos; list.push(img);
          this.props.onChange(list)
        }}
        cropSquare={this.props.cropSquare??null}
        sideLength={this.props.sideLength??null}
        limitRes={this.props.limitRes??null}
      />))}
    </>;
  }
}
// Renders an image defined by an Image object id placed in the image prop. loads the image asynchronously and renders when ready
export class StoredImage extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loadState: 0,
      image: null,
      id: this.props.image
    }
    this.setImage = this.setImage.bind(this);
    this.loadImage = this.loadImage.bind(this);
  }
  setImage(){
    if (this.state.id !== this.props.image){
      this.setState({loadState: 0, image: null, id: this.props.image});
    }
  }
  loadImage(){
    if (this.state.loadState !== 0) {return;}
    this.setState({loadState: 1});
    let id = this.state.id;
    getImage(id).then((result) => {
      if (id!==this.state.id){return;}
      let data = result.data??null;
      if (data != null && data.substring(0, 4) != "data"){
        data = "data:image/png;base64," + data;
      }
      this.setState({loadState: 2, image: data??null, id: id});
    });
  }
  render() {
    if (this.state.id!==this.props.image){return <MethodCaller method={this.setImage}/>;}
    if (this.state.loadState===0){return <MethodCaller method={this.loadImage}/>;}
    return <img
      className={this.props.className??null}
      alt={this.props.alt??""}
      src={this.state.image??this.props.fallback}
      key={this.props.keyVal??null}
    />;
  }
}
