import "./home.css";
import { loggedInPage, getPostList, MethodCaller, PostDisplay, withNavigate } from "../../lib/default";
import React from 'react';

class PostingPage extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      loadState: 0,
      posts: [],
    };
    this.getPosts = this.getPosts.bind(this);
  }
  async getPosts(){
    if (this.state.loadState !== 0) {return;}
    this.setState({loadState: 1});
    let posts = (await getPostList()).posts??[];
    posts.splice(10);
    this.setState({loadState: 2, posts: posts});
  }
  render(){
    if (this.state.loadState===0) {return <MethodCaller method={this.getPosts}/>;}
    return <div className="posting-page">
      <button className="post-button" onClick={() => {this.props.navigate("/create-post")}}>Make a Post</button>
      {this.state.posts.length===0? <h2>{
        this.state.loadState===2? "No Posts Yet" : "Loading"
      }</h2>: <div className="post-list">{
        (this.state.posts).map((id, i) => <div key={i}><PostDisplay user={this.props.user} post={id}/></div>)
      }</div>}
    </div>;
  }
}
export default loggedInPage(withNavigate(PostingPage));
