import React from 'react';
import moment from 'moment';
import {
  loggedInPage, withNavigate, withParams, MethodCaller,
  getProfile, followUser as followUserBackend, blockUser as blockUserBackend, unfollowUser as unfollowUserBackend,
  UserDisplay, PostDisplay, StoredImage
} from '../../lib/default';
import './profile.css';

// State of the profile.
const failStates = {
  INVALID_SESSION: 0,
  BLOCKED: 1, // You or the other user have each other blocked
  INVALID_USER: 2, //User does not exist
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
// Render a list of user ids as UserDisplays
function renderUserList(list) {
  return <>{list.map((id) => (<UserDisplay 
    user={id}
    alt="User"
    fallback="/default_user.png"
    clickable={true}
  />))}</>;
}
// Render a list of photos
function renderPhotoList(list){
  return <>{list.map((photo, i) => (<StoredImage
    className='profile-photo'
    key={i}
    image={photo}
    alt={"Photo " + (i+1)}
  />))}</>;
}

class ProfilePage extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loadState: 0,
      failState: 3,
      id: null,
      profile: null
    };
    this.getUser = this.getUser.bind(this);
    this.setUser = this.setUser.bind(this);
    this.loadUser = this.loadUser.bind(this);
    this.followUser = this.followUser.bind(this);
    this.blockUser = this.blockUser.bind(this);
    this.messageUser = this.messageUser.bind(this);
    this.renderProfile = this.renderProfile.bind(this);
  }
  async getUser(id) {
    if (id==null) {
      return this.props.user.profile
    }
    let result = await getProfile(id);
    if (!result.success) {
      return {failState: failStates[result.fail_state]};
    }
    return result.profile;
  }
  setUser(){
    this.setState({
      loadState: 0, 
      profile: null, 
      failState: "", 
      id: this.props.params.get('user')??null
    });
  }
  loadUser(){
    if (this.state.loadState !== 0) {return;}
    this.setState({loadState: 1});
    // begin loading the profile
    let id = this.state.id;
    this.getUser(id).then((result) => {
      if (this.state.id !== id){return;}
      if (result.failState != null){
        this.setState({loadState: 2, profile: null, failState: result.failState});
      }
      this.setState({loadState: 2, profile: result, failState: -1});
    });
  }
  // follow/unfollow/block user
  async followUser(){
    if (this.props.user.following.includes(this.state.id)) {
      await unfollowUserBackend(this.state.id);
    }else {
      await followUserBackend(this.state.id);
    }
    this.setState({loadState: 0});
    this.props.updateUser();
  }
  async blockUser(){
    await blockUserBackend(this.state.id);
    this.setState({loadState: 0});
    this.props.updateUser();
  }
  // redirect to message page
  async messageUser(){
    this.props.navigate("/messages?user=" + this.state.id);
  }
  // Render the profile
  renderProfile(editable){
    let profile = this.state.profile;
    return <div className='profile'>
      <div className='profile-info'>
        <div className='profile-bio'>
          <div className='profile-header'>
            <StoredImage 
              className='profile-picture'
              image={profile.profile_pic??null}
              alt="Profile"
              fallback="/default_user.png"
            />
            <div className='profile-name'>
              <h1>{profile.name}</h1>
              <h2>@{profile.username}</h2>
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
            {renderPhotoList(profile.photos??[])}
          </div>
        </div>
      </div>
      <div className='profile-buttons'>
        {editable? (
          <button 
            className='profile-edit-button'
            onClick={() => {this.props.navigate('/profile-creation')}}
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
  render(){
    if (this.state.id !== (this.props.params.get('user')??null)){
      return <MethodCaller method={this.setUser}/>;
    }
    if (this.state.loadState===0) {
      return <MethodCaller method={this.loadUser}/>;
    } else if (this.state.loadState===1) {
      return <div className='profile-message' id="loading">
        <h1>Loading...</h1>
      </div>;
    } else if (this.state.failState===failStates.INVALID_SESSION) {
      return <MethodCaller method={this.props.updateUser}/>;
    } else if (this.state.failState===failStates.BLOCKED) {
      return <div className='profile-message' id="normal">
        <h1>Unable to view profile. You or this user have blocked the other.</h1>
        <button onClick={() => {this.props.setParams({})}}>Go To Your Profile</button>
      </div>;
    } else if (this.state.failState===failStates.INVALID_USER) {
      return <div className='profile-message' id="error">
        <h1>User not found</h1>
        <button onClick={() => {this.props.setParams({})}}>Go To Your Profile</button>
      </div>;
    }
    return <div className='profile-page'>
      <div className='grid-background'/>
      {this.renderProfile(this.state.id==null)}
      <div className='profile-follows'>
        <h1>Followed Users</h1>
        {renderUserList(this.state.profile.following??[])}
      </div>
      <div className='profile-follows'>
        <h1>Followers</h1>
        {renderUserList(this.state.profile.followers??[])}
      </div>
      <div className='profile-posts-body'>
        <h1>Posts</h1>
        <div className='profile-posts'>
          {(this.state.profile.posts??[]).map((id, i) => <div key={i}>
            <PostDisplay user={this.props.user} post={id}/>
          </div>)}
        </div>
      </div>
    </div>;
  }
}
const WrappedProfilePage = loggedInPage(withParams(withNavigate(ProfilePage)));
export {WrappedProfilePage as ProfilePage};
export {default as ProfileCreationPage} from './profile-creation';