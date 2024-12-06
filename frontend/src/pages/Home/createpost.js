import React, { useState } from 'react';
import { ImageInput, createPost, loggedInPage, withNavigate } from '../../lib/default';

const SongPicker = ({ onSongSelect }) => {
    const [songQ, setSongQ] = useState('');
    const [songResults, setSongResults] = useState([]);

    const handle_search = async() => {
        const response = await fetch(`/spotify/search?query=${songQ}`);
        const data = await response.json();

        if (data.success){
            setSongResults(data.data.track.items);
        }else{
            console.log('oopsies', data.error);
            setSongResults([]);
        }
    }

    return(
        <div>
            <input
                type="text"
                value={songQ}
                onChange={(e) => setSongQ(e.target.value)}
                placeholder="What are we listening to today?"/>
            <button onClick={handle_search}>Search</button>
            {songResults.length > 0 && (
                <ul>
                    {songResults.map((track) => (
                        <li key={track.id}>
                            <button onClick={() => onSongSelect(track.id)}>
                                {track.name} by {track.artists.map(artist => artist.name).join(", ")}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

class CreatePostPage extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      posting: false,
      text: "",
      pic: null,
      song: ""
    };
    this.post = this.post.bind(this);
  }
  async post(){
    if (this.state.posting){return;}
    else if (this.state.text==="" && this.state.pic == null && this.state.song==="") {return;}
    this.setState({posting: true});
    // Post the data to the backend
    let text = this.state.text; if(text==="") {text = null;}
    let song = this.state.song; if(song==="") {song = null;}
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
  render(){
    if (this.state.posting) {return <div className='create-post'>Posting...</div>;}
    return <div className='create-post'>
      <textarea
        value={this.state.text}
        onChange={(e) => {this.setState({text: e.target.value})}}
        placeholder='What are we thinking about?'
      />
      <ImageInput 
        value={this.state.pic}
        alt="Attach Photo"
        onChange={(img) => {this.setState({pic: img})}}
        limitRes={250000}
      />
      <button onClick={this.post}>Post</button>
    </div>
  }
}
export default loggedInPage(withNavigate(CreatePostPage));
