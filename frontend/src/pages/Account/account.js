import React from "react";
import "./account.css";
import {loggedInPage} from "../../lib/auth";
import {updateUser, logoutUser, deleteUser, authSpotify} from "../../lib/backend";
import {Navigate} from "react-router-dom";

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

class AccountInfo extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      goToProfile: false
    };
    this.updateProfile = this.updateProfile.bind(this);
    this.deleteProfile = this.deleteProfile.bind(this);
    this.logout = this.logout.bind(this);
    this.deleteUserAsync = this.deleteUserAsync.bind(this);
  }
  updateProfile(){
    this.setState({goToProfile: true});
  }
  async deleteUserAsync(){
    let confirmation = await window.confirm("Are you sure you want to delete your Profile?");
    if (!confirmation) {return;}
    await deleteUser();
    await this.props.updateUser();
  }
  deleteProfile(){
    this.deleteUserAsync();
  }
  logout(){
    // send request to logout backend
    logoutUser().then(result => {
      this.props.updateUser();
    });
  }
  render(){
    if (this.state.goToProfile) {return <Navigate to='/profile'/>;}
    return (<div className="account-info">
      <h1 className="section-title">Account Info</h1>
      <AccountField label="Username: " value={this.props.user.username} valueName="username" type="text" updateUser={this.props.updateUser}/>
      <AccountField label="Email: " value={this.props.user.email} valueName="email" type="email" updateUser={this.props.updateUser}/>
      <AccountField label="Password: " value={this.props.user.password} valueName="password" type="text" updateUser={this.props.updateUser}/>
      <div className="account-buttons">
        <button className="update-profile" type="button" onClick={this.updateProfile}>Update Profile</button>
        <button className="logout" type="button" onClick={this.logout}>Logout</button>
        <button className="delete-profile" type="button" onClick={this.deleteProfile}>Delete Profile</button>
      </div>
    </div>);
  }
}

class SpotifyInfo extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      spotify_username: "Loading"
    };
    this.link = this.link.bind(this);
    this.populateSpotifyData = this.populateSpotifyData.bind(this);
  }
  async populateSpotifyData(authToken) {
    // using the auth token, ask the spotify API for some user data like spotify username, most recent song.
    
  }
  componentDidMount(){
    if (this.props.user.spotify == null) {return;}
    // grab spotify api data
    this.populateSpotifyData(this.props.user.spotify.authToken);
  }
  link(){
    // start linking process
    authSpotify().then(_ => {
      this.props.updateUser();
    })
  }
  render(){
    return (<div className="spotify-info">
      <h1 className="section-title">Spotify Data</h1>
      {this.props.user.spotify == null ? <>
        <button className="spotify-link-button" type="button" onClick={this.link}>Link Spotify Account</button>
      </> : <>
        
      </>}
    </div>);
  }
}

class AccountPage extends React.Component {
  render() {
    if (this.props.authLoading) {
      return (<>
        <div className="grid-background"/>
        <h1>Loading...</h1>
      </>);
    }
    return (<>
      <div className="grid-background"></div>
      <div className="account-block">
        <AccountInfo user={this.props.user} updateUser={this.props.updateUser}/>
        <SpotifyInfo user={this.props.user} updateUser={this.props.updateUser}/>
      </div>
    </>);
  }
}
export default loggedInPage(AccountPage);

/**
function ProfilePage(){
    const [profilePic, setProfilePic] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setUploadedFile(file);
        setProfilePic(URL.createObjectURL(file));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('profilePic',uploadedFile);

        try {
            const response = await fetch('http://localhost:5000/uploadProfilePic', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (result.success) {
                alert('Profile picture uploaded successfully!');
            } else {
                alert('Error uploading profile picture');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error uploading profile picture');
        }
    }
    return (
        <><div className = "grid-background"></div>
            <div className = "profile-box-one">
                <div className = "profile-header">
            <label htmlFor="ProfilePic" className = "profile-pic-label">
                    {profilePic ? (
                        <img
                            src={profilePic}
                            alt = "Profile Preview"
                            className = "profile-pic-preview"
                        />):(<span>Upload</span>)
                    }
                </label>
                <input type = "file"
                id = "ProfilePic"
                accept = "image/*"
                onChange = { handleImageChange }
                className = "file-input"
                required
                />
                <div className="profile-info">
                    <h1>Hi! My name is </h1>
                    <div className="user-name">
                        <input type="text" class = "name-input" placeholder = "Your preferred name"
                               required/>
                    </div>
                </div>
                <div className= "age-enter">
                <h3> and I am </h3>
                <div className = "age">
                <input type = "number" class = "age-input" placeholder = "Your age"
               required/>
                </div>
                <h3> years old.</h3>
            </div>
            </div>
            <div className = "optional-prompts">
                    <div class="prompt">
                        <label for="prompt1">Choose prompt:</label>
                        <select id="prompt1">
                            <option value="" disabled selected>Pick a prompt</option>
                            <option value="1">What is your favorite hobby?</option>
                            <option value="2">What inspires you?</option>
                            <option value="3">What's your dream job?</option>
                        </select>
                        <textarea placeholder="Answer here"></textarea>
                    </div>

                    <div class="prompt">
                        <label for="prompt2">Choose prompt:</label>
                        <select id="prompt2">
                            <option value="" disabled selected>Pick a prompt</option>
                            <option value="1">Describe your ideal vacation</option>
                            <option value="2">What motivates you?</option>
                            <option value="3">What's your favorite food?</option>
                        </select>
                        <textarea placeholder="Answer here"></textarea>
                    </div>

                    <div class="prompt">
                        <label for="prompt3">Choose prompt:</label>
                        <select id="prompt3">
                            <option value="" disabled selected>Pick a prompt</option>
                            <option value="1">What are you passionate about?</option>
                            <option value="2">What is your biggest achievement?</option>
                            <option value="3">What do you want to learn next?</option>
                        </select>
                        <textarea placeholder="Answer here"></textarea>
                    </div>
                </div>
        </div>
        </>
);}*/