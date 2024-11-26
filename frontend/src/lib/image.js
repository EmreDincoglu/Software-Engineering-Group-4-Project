import React from "react";
import {Jimp} from "jimp";
import "./image.css";

export class ProfileImageElement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editable: false,
      alt_text: "",
      data: null,
      fallback: null,
      data_changed: false,
      cropped_size: null
    };
    this.handleImageUpload = this.handleImageUpload.bind(this);
  }

  componentDidMount(){
    this.setState(this.props.default_state);
  }

  async handleImageUpload(event){
    event.preventDefault();
    const input_data = await event.target.files[0]?.arrayBuffer();
    let jimpImage = await Jimp.fromBuffer(input_data);
    if (this.state.cropped_size != null) {
      const width = jimpImage.bitmap.width;
      const height = jimpImage.bitmap.height;
      const side = Math.min(width, height);
      const x = width<height? 0 : (width-side)/2;
      const y = width<height? (height-side)/2 : 0;
      jimpImage = jimpImage.crop({
        w: side-1, h: side-1, x: x, y: y
      });
      jimpImage = jimpImage.resize({w: this.state.cropped_size, h: this.state.cropped_size});
    }
    const uploaded_image = await jimpImage.getBase64("image/png");
    this.setState({data: uploaded_image, data_changed: true});
    if (this.props.onImageUpload != null) {await this.props.onImageUpload(uploaded_image);}
  }

  render() {
    return (this.state.editable? <div className="image-element">
      <label>
        <img 
          alt={this.state.alt_text ?? ""}
          src={this.state.data ?? this.state.fallback}
          className="image-display"
        />
        <input 
          type = "file"
          accept = "image/*"
          onChange = { this.handleImageUpload }
          className = "image-input"
          required
        />
      </label>
    </div>:<div className="image-element">
      <img 
        alt={this.state.alt_text ?? "Img"} 
        src={this.state.data ?? this.state.fallback}
        className="image-display"
      />
    </div>);
  }
}

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
      jimpImage = cropSquare(jimpImage, this.props.cropSquare);
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
          onChange = { this.handleImageUpload }
          style={{display: 'none'}}
        />
      </label>
    </div>;
  }
}