import React from 'react';
import { ImageInput, createPost, loggedInPage, spotifySongSearch, withNavigate, SongDisplay } from '../../lib/default';
import AsyncSelect from 'react-select/async';
import makeAnimated from 'react-select/animated';
import './createpost.css';

class CreatePostPage extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      posting: false,
      text: "",
      pic: null,
      song: null
    };
    this.post = this.post.bind(this);
    this.songSearch = this.songSearch.bind(this);
  }
  async post(){
    if (this.state.posting){return;}
    else if (this.state.text==="" && this.state.pic == null && this.state.song==="") {return;}
    this.setState({posting: true});
    // Post the data to the backend
    let text = this.state.text; if(text==="") {text = null;}
    let song = this.state.song; if(song!=null) {song = song.value.id;}
    let pic = this.state.pic;
    let result = await createPost(text, pic, song);
    // interpret success
    if (!result.success) {
      alert("Failed to create post: " + result.fail_message);
      this.setState({posting: false});
      return;
    }
    this.props.navigate("/home");
  }
  async songSearch(query) {
    let result = await spotifySongSearch(query);
    if (!result.success) {return [];}
    return result.songs.map((song) => ({value: song, label: <SongDisplay song={song}/>}));
  }
  render(){
    if (this.state.posting) {return <div className='create-post'>Posting...</div>;}
    return <div className='create-post'>
      <textarea
        value={this.state.text}
        onChange={(e) => {this.setState({text: e.target.value})}}
        placeholder='What are we thinking about?'
      />
      <AsyncSelect
        className={"song-input"}
        components={makeAnimated()}
        loadOptions={(val, callback) => {
          this.songSearch(val).then((result) => {callback(result)});
        }}
        value={this.state.song}
        onChange={(value) => {this.setState({song: value});}}
        placeholder="What are we listening to?"
        cacheOptions
      />
      <ImageInput 
        value={this.state.pic}
        alt="What are we looking at?"
        onChange={(img) => {this.setState({pic: img})}}
        limitRes={250000}
      />
      <div className='create-post-buttons'>
        <button onClick={this.post}>Post</button>
        <button onClick={() => {
          this.setState({text: "", pic: null, song: null});
        }}>Clear</button>
      </div>
    </div>
  }
}
export default loggedInPage(withNavigate(CreatePostPage));
