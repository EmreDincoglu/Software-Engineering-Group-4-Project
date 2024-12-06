import React from "react";
import "./account.css";
import { withNavigate, loggedInPage, updateUser, logoutUser, deleteUser, authSpotify } from "../../lib/default";

// Editable field of the users account.
class AccountField extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      updated_value: null,
      updating: false
    };
    this.updateValue = this.updateValue.bind(this);
    this.startUpdate = this.startUpdate.bind(this);
    this.cancelUpdate = this.cancelUpdate.bind(this);
    this.finishUpdate = this.finishUpdate.bind(this);
  }
  updateValue(event){
    this.setState({updated_value: event.target.value});
  }
  startUpdate() {
    this.setState({
      updated_value: this.props.value,
      updating: true
    });
  }
  cancelUpdate() {
    this.setState({updating: false});
  }
  finishUpdate() {
    let values = {[this.props.valueName]: this.state.updated_value};
    this.setState({updating: false});
    updateUser(values).then(result => {
      if (result.success) {
        this.props.updateUser();
      } else {
        alert(result.fail_message);
      }
    });
  }
  render(){
    return (<div className="account-field">
      <span className="account-field-label">{this.props.label}</span>
      {this.state.updating? <>
        <input className="account-field-value" type={this.props.type} value={this.state.updated_value} onChange={this.updateValue}/>
        <div className="account-field-buttons">
          <button type="button" onClick={this.finishUpdate}>✅</button>
          <button type="button" onClick={this.cancelUpdate}>🚫</button>
        </div>
      </> : <>
        <span className="account-field-value">{this.props.value}</span>
        <div className="account-field-buttons">
          <button id="with-border" type="button" onClick={this.startUpdate}>Edit</button>
        </div>
      </>}
    </div>);
  }
}
// Renders all account  info
class AccountInfo extends React.Component {
  render(){
    return <div className="account-info">
      <h1 className="section-title">Account Info</h1>
      <AccountField label="Username: " value={this.props.user.username} valueName="username" type="text" updateUser={this.props.updateUser}/>
      <AccountField label="Email: " value={this.props.user.email} valueName="email" type="email" updateUser={this.props.updateUser}/>
      <AccountField label="Password: " value={this.props.user.password} valueName="password" type="text" updateUser={this.props.updateUser}/>
      <div className="account-buttons">
        <button className="update-profile" type="button" onClick={() => {
          this.props.navigate("/profile-creation")
        }}>Update Profile</button>
        <button className="logout" type="button" onClick={() => {
          logoutUser().then(() => {this.props.updateUser()})
        }}>Logout</button>
        <button className="delete-profile" type="button" onClick={() => {
          if (!window.confirm("Are you sure you want to delete your Profile?")) {return;}
          deleteUser().then(() => {this.props.updateUser()})
        }}>Delete Profile</button>
      </div>
    </div>;
  }
}
// Renders all spotify Info
class SpotifyInfo extends React.Component{
  constructor(props){
    super(props);
    this.link = this.link.bind(this);
  }
  // Starts the spotify Account Link Process
  link(){
    // start linking process
    authSpotify().then((result) => {
      if (!result.success) {alert("Spotify Linking Failed: " + result.fail_message);}
      this.props.updateUser();
    })
  }
  render(){
    if (this.props.user.spotify==null){return <div className="spotify-info">
      <h1 className="section-title">Spotify Data</h1>
      <button className="spotify-link-button" type="button" onClick={this.link}>Link Spotify Account</button>
    </div>;}
    return <div className="spotify-info">
      <h1 className="section-title">Spotify Data</h1>

    </div>;
  }
}
// Renders account + spotify info
class AccountPage extends React.Component {
  render() {
    return <>
      <div className="grid-background"></div>
      <div className="account-block">
        <AccountInfo user={this.props.user} updateUser={this.props.updateUser} navigate={this.props.navigate}/>
        <SpotifyInfo user={this.props.user} updateUser={this.props.updateUser}/>
      </div>
    </>;
  }
}
export default loggedInPage(withNavigate(AccountPage));
