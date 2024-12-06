import React from "react";
import "./user.css";
import { getProfile, StoredImage, MethodCaller } from "../default";
import {useNavigate} from "react-router-dom"

class UserDisplayInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadState: 0,
      user: null,
      id: this.props.user
    };
    this.setUser = this.setUser.bind(this);
    this.loadUser = this.loadUser.bind(this);
  }
  setUser(){
    if (this.state.id !== this.props.user) {
      this.setState({loadState: 0, user: null, id: this.props.user});
    }
  }
  loadUser(){
    if (this.state.loadState !== 0) {return;}
    this.setState({loadState: 1});
    let id = this.state.id;
    getProfile(id).then((result) => {
      if (id!==this.state.id){return;}
      this.setState({
        loadState: 2, 
        user: result.profile??null, 
        id: id
      });
    });
  }
  render() {
    if (this.state.id!==this.props.user){return <MethodCaller method={this.setUser}/>;}
    if (this.state.loadState===0){return <MethodCaller method={this.loadUser}/>;}
    
    let user = this.state.user??{
      username: this.state.loadState===2? "Unknown" : "Loading...", 
      profile_pic: null
    };
    
    return <div className="user-display">
      <label>
        <div className="user-display-render">
          <StoredImage
            className="user-display-icon"
            image={user.profile_pic??null}
            alt={this.props.alt}
            fallback={this.props.fallback}
          />
          <span className="user-display-name">{user.username}</span>
        </div>
        {this.props.clickable? 
          <button className="user-display-button" onClick={() => {
            this.props.navigate("/profile?user=" + this.props.user)
          }}/>:
          <button className="user-display-button"/>
        }
      </label>
    </div>;
  }
}
export const UserDisplay = (props) => {
  const navigate = useNavigate();
  return <UserDisplayInner {...props} navigate={navigate}/>;
}