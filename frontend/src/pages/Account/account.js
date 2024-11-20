import React from "react";
import "./account.css";
import default_user from "../../assets/default_user.png";
import ImageElement from "../../lib/image";
import { withUserAuth } from "../../lib/auth_locked";

class AccountPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profile_image: null,
      username: null,
      email: null,
      password: null,
      first_name: null,
      last_name: null,
      age: null,
      bio: null,
      updating_account: false,
      show_password: false
    };
    this.handleAccountFieldChange = this.handleAccountFieldChange.bind(this);
    this.setAccountIcon = this.setAccountIcon.bind(this);
    this.togglePasswordVisibility = this.togglePasswordVisibility.bind(this);
    this.startUpdating = this.startUpdating.bind(this);
    this.stopUpdating = this.stopUpdating.bind(this);
    this.finishUpdating = this.finishUpdating.bind(this);
  }

  handleAccountFieldChange(event) {
    this.setState({[event.target.attributes.field.nodeValue]: event.target.value});
  }

  setAccountIcon(data) {
    this.setState({profile_image: data});
  }

  togglePasswordVisibility(event) {
    this.setState({show_password: event.target.checked});
  }

  startUpdating() {
    this.setState({
      profile_image: this.props.user.profile_image,
      username: this.props.user.username,
      email: this.props.user.email,
      password: this.props.user.password,
      first_name: this.props.user.first_name,
      last_name: this.props.user.last_name,
      age: this.props.user.age,
      bio: this.props.user.bio,
      updating_account: true,
    });
  }

  stopUpdating() {
    this.setState({updating_account: false});
  }

  finishUpdating() {
    // Send new profile data to express
    // Tell parent to re-request user data
    // set updating to false
    this.setState({updating_account: false});
  }

  render() {
    let source = this.props.user;
    if (this.state.updating_account) {source = this.state}

    if (this.props.loading || source == null) {
      return (<>
        <div className = "grid-background"></div>
        <h1>Loading...</h1>
      </>);
    }

    return (<>
      <div className="grid-background"></div>
      <div className="account-block">
        <h1>Account</h1>
        <div className="account-icon">
          <ImageElement default_state={{
            fallback: default_user, 
            editable: this.state.updating_account, 
            alt_text: "Profile Icon",
            cropped_size: 512,
            data: source.profile_image ?? null
          }} onImageUpload={this.setAccountIcon}/>
        </div>
        <label className="account-uname">
          Username: 
          <input type="text" 
            readOnly={this.state.updating_account? false : true} 
            field="username" 
            value={source.username} 
            onChange={this.handleAccountFieldChange}
          />
        </label>
        <div className="account-email">
          Email: 
          <input type="text" 
            readOnly={this.state.updating_account? false : true} 
            field="email" 
            value={source.email} 
            onChange={this.handleAccountFieldChange}
          />
        </div>
        <div className="account-password">
          <div>
            Password: 
            <input type={this.state.show_password ? "text" : "password"} 
              readOnly={this.state.updating_account? false : true} 
              field="password" 
              value={source.password} 
              onChange={this.handleAccountFieldChange}
            />
          </div>
          <label>
            <input type="checkbox" onChange={this.togglePasswordVisibility}/> 
            Show Password
          </label>
        </div>
        <div className="account-name">
          First: 
          <input type="text" 
            readOnly={this.state.updating_account? false : true} 
            field="first_name" 
            placeholder="N/A"
            value={source.first_name} 
            onChange={this.handleAccountFieldChange}
          />
          Last: 
          <input type="text" 
            readOnly={this.state.updating_account? false : true} 
            field="last_name" 
            placeholder="N/A"
            value={source.last_name} 
            onChange={this.handleAccountFieldChange}
          />
        </div>
        <div className="account-age">
          Age: 
          <input type="number" 
            readOnly={this.state.updating_account? false : true} 
            field="age" 
            placeholder="N/A"
            value={source.age} 
            onChange={this.handleAccountFieldChange}
          />
        </div>
        <div className="account-bio">
          Bio: 
          <input type="text" 
            readOnly={this.state.updating_account? false : true} 
            field="bio" 
            placeholder=""
            value={source.bio} 
            onChange={this.handleAccountFieldChange}
          />
        </div>
        <div className="update-account-button">
          {this.state.updating_account? <>
            <button type="button" onClick={this.stopUpdating}>Cancel</button>
            <button type="button" onClick={this.finishUpdating}>Save</button>
          </>:<>
            <button type="button" onClick={this.startUpdating}>Update Profile</button>
          </>}
        </div>
      </div>
    </>);
  }
}

export default withUserAuth(AccountPage);
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
