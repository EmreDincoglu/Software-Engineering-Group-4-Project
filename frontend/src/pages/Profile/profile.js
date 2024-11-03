import React from "react";
import {Navigate} from "react-router-dom";
import {Jimp} from "jimp";
import "./profile.css";
import { getUser } from "../../lib/backend";
import default_user from "../../assets/default_user.png";
import ImageElement from "../../lib/image";

export default class ProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      true_user: null,
      current_user: null,
      updating_profile: false,
      redirect_to_login: false
    };
    this.getIcon = this.getIcon.bind(this);
  }

  getIcon(fallback) {
    return this.state.current_user.icon ?? fallback;
  }

  componentDidMount() {
    getUser().then(result => {
      if (!result.success) {
        this.setState({redirectToLogin: true});
      }else {
        this.setState({true_user: result.user, current_user: result.user, loaded: true});
      }
    });
  }

  render() {
    if (this.state.redirect_to_login) {
      return <Navigate to='/login'/>;
    }
    if (!this.state.loaded) {
      return (<>
        <div class = "grid-background"></div>
        <h1>Loading...</h1>
      </>);
    }
    if (!this.state.updating_profile) {
      return (<>
        <div className="grid-background"></div>
        <div className="profile-block">
          <h1>Profile</h1>
          <div className="profile-uname-and-icon">
            <ImageElement default_state={{
              fallback: default_user, 
              editable: true, 
              alt_text: "Upload",
              cropped_size: 256
            }}/>
            <span>{this.state.true_user.username}</span>
          </div>
          <div className="profile-email">{this.state.true_user.email}</div>
          <div className="profile-name-age">
            <div className="profile-name">
              <span>{(this.state.true_user.first_name!=null? this.state.true_user.first_name : "?")}</span>
              <span>{(this.state.true_user.last_name!=null? this.state.true_user.last_name : "?")}</span>
            </div>
            <span className="profile-age">
              Age: {(this.state.true_user.age!=null)? this.state.true_user.age : "?"}
            </span>
          </div>
          <div className="profile-bio">{this.state.true_user.bio}</div>
        </div>
      </>);
    }else {
      return (<>
        <div className = "grid-background"></div>
      </>);
    }
  }
}
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
