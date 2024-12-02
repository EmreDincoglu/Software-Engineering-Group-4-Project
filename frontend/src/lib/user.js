import React from "react";
import "./user.css";
import { getProfile } from "./backend";
import {useNavigate} from "react-router-dom"

class UserDisplayInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      icon: null,
    };
    this.grabUserData = this.grabUserData.bind(this);
  }

  async grabUserData(){
    let result = await getProfile(this.props.user);
    if (!result.success) {return;}
    this.setState({
      username: result.profile.username??null,
      icon: result.profile.profile_pic??null
    });
  }

  componentDidMount(){
    this.grabUserData()
  }

  render() {
    return <div className="user-display">
      <label>
        <div className="user-display-render">
          <img 
            className="user-display-icon"
            src={this.state.icon??this.props.fallback}
            alt={this.props.alt}
          />
          <span className="user-display-name">{this.state.username??"Loading..."}</span>
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