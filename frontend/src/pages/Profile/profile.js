import React from 'react';
import {Link, Navigate} from "react-router-dom";
import moment from 'moment';
import {loggedInPage} from '../../lib/auth';
import {withParams, withNavigate} from '../../lib/default';
import {getProfile, followUser as followUserBackend, blockUser as blockUserBackend, unfollowUser as unfollowUserBackend} from '../../lib/backend';
import './profile.css';
import { UserDisplay } from '../../lib/user';
import { PostDisplay } from '../../lib/post';

// State of the profile.
const state = {
  LOADING: 0, // User's profile is currently being accessed from the backend.
  LOADED: 1, // User's profile has been aqcuired and is ready for display
  BLOCKED: 2, // You or the other user have each other blocked
  INVALID_USER: 3, //User does not exist
  NOT_CREATED: 4 // User has not created the profile yet.
};

// Given a birthdate, calculates an age as of today 
function calculate_age(birthdate){
  if (birthdate == null) {return null;}
  let years = moment(Date.now()).diff(moment(new Date(birthdate)), 'years');
  return Math.floor(years);
}

// Get day month year birthday string from date
function get_birthday_string(birthdate){
  if (birthdate == null) {return null;}
  return (new Date(birthdate)).toDateString().substring(4);
}

// Get a string for a list of items, returns null if list is [] or null
function get_list_string(list) {
  if (list == null || list.length === 0) {return null;}
  return list.join(", ");
}

// Returns html to display data with label, returns null when data is null
function displayInfoItem(label, data){
  if (data == null) {return null;}
  return <div className='profile-info-item'>
    <span>{label}</span>
    <span>{data}</span>
  </div>;
}

class ProfilePage extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      // current state of profile loading
      state: state.LOADING,
      // id of the current user we are looking at. Null if we are looking at our own profile
      user: "unset",
      // profile data of the requested user.
      profile: null,
      goToCreate: false
    };
    this.update = this.update.bind(this);
    this.followUser = this.followUser.bind(this);
    this.blockUser = this.blockUser.bind(this);
    this.messageUser = this.messageUser.bind(this);
    this.renderFollowingList = this.renderFollowingList.bind(this);
    this.renderFollowerList = this.renderFollowerList.bind(this);
    this.renderPosts = this.renderPosts.bind(this);
    this.renderProfilePictures = this.renderProfilePictures.bind(this);
    this.renderProfile = this.renderProfile.bind(this);
    this.renderMessage = this.renderMessage.bind(this);
  }
  // Called when the page is loaded or changed. Makes sure the correct profile is loaded
  async update(){
    // Get the requested user from the 'user' query param. null (meaning the logged in users profile) if no 'user' query param is set.
    let user = this.props.params.get('user')??null;
    // if our requested user hasn't changed, nothing to do, return;
    if (this.state.user === user) {return;}
    // if we are looking at our own profile get the profile from the user prop.
    if (user === null) {
      this.setState({
        user: user, 
        // Null profile means it has not been created
        state: (this.props.user.profile == null) ? state.NOT_CREATED : state.LOADED, 
        profile: this.props.user.profile??null
      });
      return;
    }
    // update our state to loading
    this.setState({user: user, state: state.LOADING, profile: null});
    // Asynchronously get profile from backend
    const profile = await getProfile(user);
    // Only update the user prop if we are still looking for that user
    if (this.state.user !== user) {return;}
    // update the profile data and state
    this.setState({user: user, state: state[profile.fail_state??"LOADED"], profile: profile.profile??null});
  }
  componentDidUpdate(){
    this.update();
  }
  componentDidMount() {
    this.update();
  }
  async followUser(){
    if (this.props.user.following.includes(this.state.user)) {
      await unfollowUserBackend(this.state.user);
    }else {
      await followUserBackend(this.state.user);
    }
    this.props.updateUser();
  }
  async blockUser(){
    await blockUserBackend(this.state.user);
    this.props.updateUser();
  }
  async messageUser(){
    this.props.navigate("/message?user=" + this.state.user);
  }
  renderFollowingList(){
    return <div className='profile-following'>
      <h1>Followed Users</h1>
      {(this.state.profile.following??[]).map((id) => (<UserDisplay 
        user={id}
        alt="User"
        fallback="/default_user.png"
        clickable={true}
      />))}
    </div>;
  }
  renderFollowerList(){
    return <div className='profile-following'>
      <h1>Followers</h1>
      {(this.state.profile.followers??[]).map((id) => (<UserDisplay 
        user={id}
        alt="User"
        fallback="/default_user.png"
        clickable={true}
      />))}
    </div>;
  }
  renderPosts(){
    return <div className='profile-posts-body'>
      <h1>Posts</h1>
      <div className='profile-posts'>
        {this.state.profile.posts??[].map((id, i) => (<PostDisplay
          post={id}
        />))}
      </div>
    </div>;
  }
  renderProfilePictures(){
    return <>{(this.state.profile.photos??[]).map((photo, i) => (<img
      className='profile-photo'
      key={i}
      src={photo}
      alt={"Photo " + (i+1)}
    />))}</>;
  }
  renderProfile(editable){
    let profile = this.state.profile;
    return <div className='profile'>
      <div className='profile-info'>
        <div className='profile-bio'>
          <div className='profile-header'>
            <img 
              className='profile-picture'
              src={profile.profile_pic??"/default_user.png"}
              alt="Profile"
            />
            <div className='profile-name'>
              <h1>{profile.name}</h1>
              <h2>@{this.props.user.username}</h2>
            </div>
          </div>
          <div className='profile-age'>
            {displayInfoItem("Age: ", calculate_age(profile.birthday))}
            {displayInfoItem("Birthday: ", get_birthday_string(profile.birthday))}
          </div>
          <div className='profile-gender'>
            {displayInfoItem("Gender: ", profile.gender)}
            {displayInfoItem("Sexual Orientation: ", profile.sexuality)}
            {displayInfoItem("Preferred Genders: ", get_list_string(profile.gender_pref))}
          </div>
        </div>
        <div className='profile-spotify-pictures'>
          <div className='profile-spotify'>
            {displayInfoItem("Favorite Genres: ", get_list_string(profile.genres))}
            {displayInfoItem("Favorite Artists: ", get_list_string(profile.artists))}
          </div>
          <div className='profile-pictures'>
            {this.renderProfilePictures()}
          </div>
        </div>
      </div>
      <div className='profile-buttons'>
        {editable? (
          <button 
            className='profile-edit-button'
            onClick={() => {this.setState({goToCreate: true})}}
          >Edit Profile</button>
        ) : (<>
          <button onClick={this.followUser}>{
            this.props.user.following.includes(this.state.user)? "Unfollow User" : "Follow User"
          }</button>
          <button id="block"  onClick={this.blockUser}>Block User</button>
          <button id="message"  onClick={this.messageUser}>Message User</button>
        </>)}
      </div>
    </div>;
  }
  renderMessage(){
    if (this.state.state === state.NOT_CREATED && this.state.user === null) {
      return <div className='profile-message' id="normal">
        <h1>You have not yet created your profile.</h1>
        <Link to="/profile-creation">Create Now!</Link>
      </div>;
    }
    if (this.state.state === state.LOADING) {
      return <div className='profile-message' id="loading">
        <h1>Loading...</h1>
      </div>;
    }
    let message = "";
    switch (this.state.state) {
      case state.INVALID_USER:
        message = "User not found";
        break;
      case state.BLOCKED:
        message = "Unable to view profile. You or this user have blocked the other.";
        break;
      case state.NOT_CREATED:
        message = "This user has not yet created their profile.";
        break;
      default:
    }
    return <div className='profile-message' id={(this.state.state === state.NOT_CREATED)? "normal" : "error"}>
      <h1>{message}</h1>
      <button onClick={() => {this.props.setParams({})}}>Go To Your Profile</button>
    </div>;
  }
  render() {
    if (this.state.goToCreate) {return <Navigate to='/profile-creation'/>;}
    if (this.state.state === state.LOADED) {return <div className='profile-page'>
      <div className='grid-background'/>
      {this.renderProfile(this.state.user===null)}
      {this.renderFollowingList()}
      {this.renderFollowerList()}
      {this.renderPosts()}
    </div>;}
    return this.renderMessage();
  }
}
const WrappedProfilePage = loggedInPage(withParams(withNavigate(ProfilePage)));
export {WrappedProfilePage as ProfilePage};
export {default as ProfileCreationPage} from './profile-creation';