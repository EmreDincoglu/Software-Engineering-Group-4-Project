import React from 'react';
import {MethodCaller, getSong } from '../../lib/default';
import './song.css';

function getArtistString(list){
  return list.map((artist) => (artist.name)).join(", ");
}

export class SongDisplay extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loadState: 0,
      id: null,
      song: null
    };
    this.setSong = this.setSong.bind(this);
    this.loadSong = this.loadSong.bind(this);
  }
  setSong(){
    let id = this.props.song_id??null;
    if (this.props.song!=null) {id=this.props.song.id;}
    this.setState({loadState: 0, id: id, song: null});
  }
  loadSong(){
    if (this.state.loadState!==0){return;}
    this.setState({loadState: 1});
    if (this.props.song!=null) {
      this.setState({loadState: 2, id: this.props.song.id, song: this.props.song});
      return;
    }
    let id = this.props.song_id;
    getSong(id).then((result) => {
      if (this.props.song != null || this.props.song_id !== id) {return;}
      if (!result.success) {return;}
      this.setState({loadState: 2, id: id, song: result.data});
    });
  }
  render(){
    if ((this.props.song != null && this.state.id !== this.props.song.id) || (this.props.song==null && this.props.song_id !== this.state.id)){
      return <MethodCaller method={this.setSong}/>;
    }
    if (this.state.loadState===0) {return <MethodCaller method={this.loadSong}/>;}
    if (this.state.loadState===1) {return <div className='song-display'>Loading...</div>;}
    let image = this.props.song.image??null;
    return <div className='song-display'>
      {image!=null&&<img 
        src={image}
        alt="Song Album"
      />}
      <span>{this.state.song.name}</span>
      {this.state.song.artists.length>0&&<span>By: {
        getArtistString(this.state.song.artists)
      }</span>}
    </div>;
  }
}