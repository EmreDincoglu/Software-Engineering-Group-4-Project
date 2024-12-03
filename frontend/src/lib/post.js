import React from "react";
import "./post.css";
import { getPost } from "./backend";
import { UserDisplay } from "./user";

export class PostDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      poster: null,
      date: null,
      likes: null,
      liked: false,
      text: null,
      song: null,
      image: null
    };
    this.grabPostData = this.grabPostData.bind(this);
  }

  async grabPostData(){
    let result = await getPost(this.props.post);
    if (!result.success) {return;}
    this.setState({
      loading: false,
      poster: result.post.user,
      date: result.post.date,
      likes: result.post.likes,
      liked: this.props.user.likes.includes(this.props.post),
      text: result.post.text??null,
      song: result.post.song??null,
      image: result.post.image??null
    });
  }

  componentDidMount(){
    this.grabPostData()
  }

  render() {
    return <div className="post-display">
      <UserDisplay 
        user={this.state.poster}
        alt="User"
        fallback="/default_user.png"
        clickable={true}
      />
    </div>;
  }
}