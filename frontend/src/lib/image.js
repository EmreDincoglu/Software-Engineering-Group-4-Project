import React from "react";
import {Jimp} from "jimp";
import "./image.css";

export default class ImageElement extends React.Component {
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