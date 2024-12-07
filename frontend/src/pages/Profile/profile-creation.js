import React from 'react';
import AsyncSelect from 'react-select/async';
import makeAnimated from 'react-select/animated';
import {
  loggedInPage, MethodCaller, getImage, updateProfile, ImageInput, spotifyGenreSearch, spotifyArtistSearch
} from '../../lib/default';
import {Navigate} from "react-router-dom";
import './profile-creation.css';

// Given an event, return the target value
function getTargetVal(e) {return e.target.value;}
// converts a value into the corresponding type with some hard coded rules
function convert(val, type) {
  if (type === "text") {return val}
  if (type === "date") {
    if (val == null) {return null;}
    return (new Date(val)).toISOString().slice(0, 10);
  }
  return val;
}
// Returns a function which pipes a into b
function pipe(a, b) {return (val) => b(a(val));}

// mapping from step to step number
const steps = {
  name: 0,
  birthday: 1,
  gender: 2,
  sexuality: 3,
  gender_pref: 4,
  goals: 5,
  genres: 6,
  artists: 7,
  photos: 8,
  profile_pic: 9,
  save: 10,
  redirect: 11
};
// Holds the form setup for each step
const stepData = [
  {
    prompt: <h2>What Is Your Name?</h2>,
    name: "name",
    input: "normal",
    type: "text",
    placeholder: "Preferred Name"
  }, {
    prompt: <h2>When Were You Born?</h2>,
    name: "birthday",
    input: "normal",
    type: "date",
  }, {
    prompt: <h2>What Is Your Gender?</h2>,
    name: "gender",
    input: "radio",
    options: ["Man", "Woman", "Other"]
  }, {
    prompt: <h2>What Is Your Sexual Orientation</h2>,
    name: "sexuality",
    input: "radio",
    options: ["Straight", "Gay", "Bisexual", "Pansexual"]
  }, {
    prompt: <h2>What Is Your Gender Preference</h2>,
    name: "gender_pref",
    input: "checkbox",
    options: ["Man", "Woman", "Other"]
  }, {
    prompt: <h2>What Are Your Goals For A Relationship</h2>,
    name: "goals",
    input: "radio",
    options: ["Long-Term", "Short-Term", "Other"]
  }, {
    prompt: <h2>What Are Your Top 3 Favorite Music Genres?</h2>,
    name: "genres",
    input: "genre",
    placeholder: "Select Your Favorite Genres"
  }, {
    prompt: <h2>What Are Your Top 3 Favorite Music Artists?</h2>,
    name: "artists",
    input: "artist",
    placeholder: "Select Your Favorite Artists"
  }, {
    prompt: <h2>Upload Up To 9 Of Your Favorite Photos.</h2>,
    name: "photos",
    input: "photo_set",
    count: 9,
    // 14mb limit, 4 bytes per pixel, 3.5M pixel limit, lowered to 2.6M due to 33% base64 overhead
    limitRes: 250000
  }, {
    prompt: <h2>Upload A Profile Picture.</h2>,
    name: "profile_pic",
    input: "photo",
    cropSquare: true,
    sideLength: 512
  },
];

class ProfileCreationPage extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      step: steps.name,
      profile: props.user.profile??{},
    };
    this.downloadImages = this.downloadImages.bind(this);

    this.step = this.step.bind(this);
    this.saveProfile = this.saveProfile.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.replaceList = this.replaceList.bind(this);
    this.addToList = this.addToList.bind(this);
    this.removeIndexList = this.removeIndexList.bind(this);
    this.toggleList = this.toggleList.bind(this);

    this.renderNormalInput = this.renderNormalInput.bind(this);
    this.renderRadioInput = this.renderRadioInput.bind(this);
    this.renderCheckboxInput = this.renderCheckboxInput.bind(this);
    this.renderGenreInput = this.renderGenreInput.bind(this);
    this.renderArtistInput = this.renderArtistInput.bind(this);
    this.renderPhotoSetInput = this.renderPhotoSetInput.bind(this);
    this.renderPhotoInput = this.renderPhotoInput.bind(this);
    this.renderMethods = {
      normal: this.renderNormalInput,
      radio: this.renderRadioInput,
      checkbox: this.renderCheckboxInput,
      genre: this.renderGenreInput,
      artist: this.renderArtistInput,
      photo_set: this.renderPhotoSetInput,
      photo: this.renderPhotoInput
    };

    this.genreSearch = this.genreSearch.bind(this);
    this.getGenreOptions = this.getGenreOptions.bind(this);
    this.artistSearch = this.artistSearch.bind(this);
    this.getArtistOptions = this.getArtistOptions.bind(this);

    this.renderStepContent = this.renderStepContent.bind(this);
    this.renderNavButtons = this.renderNavButtons.bind(this);
  }
  // Downloading images from database
  async downloadImages(){
    let newProfile = this.state.profile;
    if (newProfile.profile_pic != null) {
      let image = await getImage(newProfile.profile_pic);
      newProfile.profile_pic = image.data??"";
    }
    newProfile.photos = newProfile.photos??[];
    for(let i = 0; i < newProfile.photos.length; i++) {
      let image = await getImage(newProfile.photos[i]);
      newProfile.photos[i] = image.data??"";
    }
    this.setState({profile: newProfile});
  }
  componentDidMount(){
    this.downloadImages();
  }
  // Return a method which adds delta to step. used by next and prev buttons
  step(delta) {
    return () => {
      if (this.state.step+delta === steps.save) {
        this.saveProfile();
      }else {
        this.setState({step: this.state.step + delta});   
      }
    };
  }
  // Saves the profile by sending the current profile state to the backends
  async saveProfile() {
    if (this.state.step === steps.save) {return;}
    this.setState({step: steps.save});
    let result = await updateProfile(this.state.profile);
    if (!result.success) {this.props.updateUser(); return;}
    this.setState({step: steps.redirect});
  }
  // Returns a method which replaces a specific index of a list with the input element.
  replaceList(name, index) {
    return (element) => {
      let list = this.state.profile[name]; 
      if (element == null) {list.splice(index, 1);}
      else {list[index] = element; }
      return list;
    }
  }
  // Returns a method which adds an element to a list.
  addToList(name, checkDup) {
    return (element) => {
      let list = this.state.profile[name]??[]; 
      if (checkDup && list.includes(element)) {return;}
      list.push(element);
      return list;
    }
  }
  // Returns a method which removes a element at index from a list
  removeIndexList(name, index) {
    return () => {
      let list = this.state.profile[name];
      list = list.splice(index, 1);
      return list;
    }
  }
  // Returns a method which adds/removes an element from a list
  toggleList(name) {
    return (element) => {
      let list = this.state.profile[name]??[];
      if (list.includes(element)) {console.log(list + "A" + element); list.splice(list.indexOf(element), 1); return list;}
      console.log(list + "B" + element);
      list.push(element);
      return list;
    }
  }
  // returns a function which sets this.state.profile."[name]" to the value returned by func(event).
  handleChange(name, func){
    return (event) => {this.setState({profile: {...this.state.profile, [name]: func(event)}});}
  }
  // Renders a normal input box
  renderNormalInput(config){
    return <input
      className={config.class??"pc-step-normal-input"}
      id={config.type}
      type={config.type}
      value={convert(this.state.profile[config.name], config.type)}
      onChange={this.handleChange(config.name, getTargetVal)}
      placeholder={config.placeholder}
    />;
  }
  // Renders a select one radio input box
  renderRadioInput(config){
    return <div className={config.class??"pc-step-radio-input"}>
      {config.options.map((option, i) => (
        <label key={i}>
          <input
            type="radio"
            name={config.name}
            value={option}
            checked={this.state.profile[config.name] === option? true : false}
            onChange={this.handleChange(config.name, getTargetVal)}
          />
          {option}
        </label>
      ))}
    </div>;
  }
  // Renders a select one radio input box
  renderCheckboxInput(config){
    return <div className={config.class??"pc-step-checkbox-input"}>
      {config.options.map((option, i) => (
        <label key={i}>
          <input
            type="checkbox"
            name={config.name}
            value={option}
            checked={(this.state.profile[config.name]??[]).includes(option)}
            onChange={this.handleChange(config.name, pipe(getTargetVal, this.toggleList(config.name)))}
          />
          {option}
        </label>
      ))}
    </div>;
  }
  convertOptions(opts) {
    return opts.map((opt) => (opt.value));
  }
  // Genre search stuff
  async genreSearch(search) {
    let result = await spotifyGenreSearch(search);
    if (!result.success) {return [];}
    return result.genres.map((genre) => ({value: genre, label: genre}));
  }
  getGenreOptions() {
    return (this.state.profile.genres??[]).map((genre) => ({value: genre, label: genre}));
  }
  renderGenreInput(config){
    return <AsyncSelect
      className={config.class??"pc-step-select-input"}
      components={makeAnimated()}
      loadOptions={(val, callback) => {
        this.genreSearch(val).then((result) => {callback(result)});
      }}
      value={this.getGenreOptions(config.data_source, config.name)}
      onChange={this.handleChange(config.name, this.convertOptions)}
      placeholder={config.placeholder}
      isMulti
      cacheOptions
    />;
  }
  // Artist Search Stuff
  async artistSearch(search) {
    let result = await spotifyArtistSearch(search);
    if (!result.success) {return [];}
    return result.artists.map((artist) => ({value: artist.name, label: artist.name}));
  }
  getArtistOptions() {
    return (this.state.profile.artists??[]).map((artist) => ({value: artist, label: artist}));
  }
  renderArtistInput(config){
    return <AsyncSelect
      className={config.class??"pc-step-select-input"}
      components={makeAnimated()}
      loadOptions={(val, callback) => {
        this.artistSearch(val).then((result) => {callback(result)});
      }}
      value={this.getArtistOptions(config.data_source, config.name)}
      onChange={this.handleChange(config.name, this.convertOptions)}
      placeholder={config.placeholder}
      isMulti
      cacheOptions
    />;
  }
  // Renders a set of photo inputs
  renderPhotoSetInput(config){
    const photoList = this.state.profile[config.name]??[];
    return <div className={config.class??"pc-step-photo-set-input"}>
      {photoList.map((photo, i) => (<ImageInput
        keyVal={i}
        value={photo}
        alt={"Photo " + (i+1)}
        onChange={this.handleChange(config.name, this.replaceList(config.name, i))}
        cropSquare={config.cropSquare??null}
        sideLength={config.sideLength??null}
        limitRes={config.limitRes??null}
      />))}
      {photoList.length < config.count && <ImageInput
        alt={"Photo " + (photoList.length+1)}
        onChange={this.handleChange(config.name, this.addToList(config.name))}
        cropSquare={config.cropSquare??null}
        sideLength={config.sideLength??null}
        limitRes={config.limitRes??null}
      />}
    </div>;
  }
  // Renders a single photo input.
  renderPhotoInput(config){
    return <div className={config.class??"pc-step-photo-input"}><ImageInput
      className={config.class??"pc-step-photo-input"}
      value={this.state.profile[config.name]??null}
      alt={config.placeholder??"Photo Upload"}
      onChange={this.handleChange(config.name, (x) => x)}
      cropSquare={config.cropSquare??null}
      sideLength={config.sideLength??null}
      limitRes={config.limitRes??null}
    /></div>;
  }
  // Renders the step form based on the step state
  renderStepContent(){
    if (this.props.user.spotify == null && (this.state.step === steps.artists || this.state.step === steps.genres)) {
      return <div className='pc-step'>
        <div className='pc-step-prompt'>
          {stepData[this.state.step].prompt}
        </div>
        <div className='pc-step-input'>
          No Spotify Account found. Go to the account page to connect your Spotify Account.
        </div>
      </div>
    }
    return <div className='pc-step'>
      <div className='pc-step-prompt'>
        {stepData[this.state.step].prompt}
      </div>
      <div className='pc-step-input'>
        {this.renderMethods[
          stepData[this.state.step].input
        ](stepData[this.state.step])}
      </div>
    </div>
  }
  // Renders the navigation buttons
  renderNavButtons(){
    return <div className='pc-navigation'>
      {this.state.step > 0 && <button id="nav" onClick={this.step(-1)}>Back</button>}
      <button 
        onClick={this.step(1)}
        id={this.state.step < steps.save-1 ? "nav" : "save"}
      >{
        this.state.step < steps.save-1 ? "Next" : "Save"}
      </button>
      <button id="cancel" onClick={() => {this.setState({step: steps.redirect});}}>
        Cancel
      </button>
    </div>;
  }
  // Renders everything
  render() {
    if (this.state.step === steps.redirect) {
      return <>
        <Navigate to='/profile'/>
        <MethodCaller method={this.props.updateUser}/>
      </>;
    }
    if (this.state.step === steps.save) {
      return <h1>Saving...</h1>;
    }
    return (<>
      <div className='grid-background'/>
      <div className="profile-creation">
        {this.renderStepContent()}
        {this.renderNavButtons()}
      </div>
    </>);
  }
}
export default loggedInPage(ProfileCreationPage);