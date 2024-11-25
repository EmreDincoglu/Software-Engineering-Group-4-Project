import React from 'react';
import {loggedInPage} from '../../lib/auth';
import {calculate_age, withParams} from '../../lib/default';
import {getProfile} from '../../lib/backend';
import {Navigate} from "react-router-dom";

// State of the profile.
const state = {
  LOADING: 0, // User's profile is currently being accessed from the backend.
  LOADED: 1, // User's profile has been aqcuired and is ready for display
  BLOCKED: 2, // You or the other user have each other blocked
  INVALID_USER: 3, //User does not exist
  NOT_CREATED: 4 // User has not created the profile yet.
};

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
    };
    this.update = this.update.bind(this);
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
  renderProfile(editable){
    let profile = this.state.profile;
    return <>
      <div className='grid-background'/>
      <div className='profile'>
        <h1>{profile.pref_name??this.props.user.username}</h1>
        <div className = "basic-info">
          <h2> Age: {calculate_age(profile.birthday)}</h2>
          <h2> Relationship Goals: {profile.relationship_goals}</h2>
          <h2> Gender: {profile.gender}</h2>
          <h2> Sexual Orientation: {profile.sexual_orientation}</h2>
          <h2> Birthday: {(new Date(profile.birthday)).toDateString()}</h2>
        </div>
        <div className="music-section">
          <h2> Favorite Genres: {profile.favorite_genres}</h2>
          <h2> Favorite Artists: {profile.favorite_artists}</h2>
        </div>
        {editable&&
          <button onClick={() => {this.setState({state: state.NOT_CREATED})}}>
            Edit Profile
          </button>
        }
      </div>
    </>;
  }
  render() {
    switch (this.state.state){
      case state.LOADING:
        return <h1>Loading...</h1>;
      case state.INVALID_USER:
        return <h1>User not found.</h1>
      case state.BLOCKED:
        return <h1>Unable to view profile. You or this user have blocked the other.</h1>
      case state.NOT_CREATED:
        if (this.state.user === null) {return <Navigate to="/profile-creation"/>;}
        return <h1>This user has not yet created their profile.</h1>
      default:
    }
    // Display Profile:
    return this.renderProfile(this.state.user === null);
  }
}
const WrappedProfilePage = loggedInPage(withParams(ProfilePage));
export {WrappedProfilePage as ProfilePage};
export {default as ProfileCreationPage} from './profile-creation';