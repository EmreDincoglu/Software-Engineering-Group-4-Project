import React from "react";
import "./post.css";
import { getPost, StoredImage, MethodCaller, UserDisplay, likePost } from "../default";

function dateString(date){
  date = new Date(date);
  const time = date.toLocaleTimeString();
  const day = date.toLocaleDateString();
  return time + " " + day;
}

export class PostDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadState: 0,
      post: null,
      id: this.props.post
    };
    this.setPost = this.setPost.bind(this);
    this.loadPost = this.loadPost.bind(this);
    this.like = this.like.bind(this);
  }
  setPost(){
    if (this.state.id !== this.props.post) {
      this.setState({loadState: 0, post: null, id: this.props.post});
    }
  }
  loadPost(){
    if (this.state.loadState !== 0) {return;}
    this.setState({loadState: 1});
    let id = this.state.id;
    getPost(id).then((result) => {
      if (id!==this.state.id){return;}
      this.setState({loadState: 2, post: result.post??null, id: id});
    });
  }
  like(){
    if (this.state.loadState!==2){return}
    likePost(this.state.id).then((result) => {
      if (!result.success) {return;}
      let post = this.state.post;
      post.likes = result.data.likes;
      post.liked = result.data.liked;
      this.setState({post: post});
    });
  }
  render() {
    if (this.state.id!==this.props.post){return <MethodCaller method={this.setPost}/>;}
    if (this.state.loadState===0){return <MethodCaller method={this.loadPost}/>;}
    if (this.state.post == null && this.state.loadState === 2) {
      return <div className="post-display">Invalid Post</div>;
    }else if (this.state.post == null ){
      return <div className="post-display">Loading...</div>;
    }
    return <div className="post-display">
      <div className="post-user-likes">
        <UserDisplay 
          user={this.state.post.user}
          alt="User"
          fallback="/default_user.png"
          clickable={true}
        />
        <div className="post-likes">
          <button className="post-like-button" onClick={this.like}>
            {this.state.post.liked? "Liked" : "Like"}
          </button>
          <p>{this.state.post.likes}</p>
        </div>
      </div>
      <p className="post-date">Posted: {dateString(this.state.post.date)}</p>
      {this.state.post.song!=null&&<div className="post-song">
        <p>{this.state.post.song}</p>
      </div>}
      {this.state.post.image!=null&&<StoredImage 
        className="post-image"
        alt="post"
        image={this.state.post.image}
      />}
      <p className="post-text">{this.state.post.text??null}</p>
    </div>;
  }
}