import React from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import {loggedInPage} from '../../lib/auth';
import {MethodCaller} from '../../lib/default';
import {Navigate} from "react-router-dom";
import {updateProfile} from '../../lib/backend';
import {ImageInput} from '../../lib/image';
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

// Genre Options
const genre_options = [
  {value: 'pop' , label: 'Pop'},
  {value: 'rock', label: 'Rock'},
  {value: 'hip-hop', label: 'Hip Hop'},
  {value: 'rap', label: 'Rap'},
  {value: 'country', label: 'Country'},
  {value: 'randb', label: 'R&B'},
  {value: 'folk', label: 'Folk'},
  {value: 'jazz', label: 'Jazz'},
  {value: 'heavy-metal', label:"Heavy Metal"}
];
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
    input: "select",
    data_source: "genres",
    placeholder: "Select Your Favorite Genres"
  }, {
    prompt: <h2>What Are Your Top 3 Favorite Music Artists?</h2>,
    name: "artists",
    input: "select",
    data_source: "artists",
    placeholder: "Select Your Favorite Artists"
  }, {
    prompt: <h2>Upload Up To 9 Of Your Favorite Photos.</h2>,
    name: "photos",
    input: "photo_set",
    count: 9,
    // 14mb limit, 4 bytes per pixel, 3.5M pixel limit, lowered to 2.6M due to 33% base64 overhead
    limitRes: 2600000
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
      selectOptions: {
        genres: genre_options,
        artists: genre_options
      }
    };

    this.step = this.step.bind(this);
    this.saveProfile = this.saveProfile.bind(this);
    this.findOptions = this.findOptions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.replaceList = this.replaceList.bind(this);
    this.addToList = this.addToList.bind(this);
    this.removeIndexList = this.removeIndexList.bind(this);
    this.toggleList = this.toggleList.bind(this);

    this.renderNormalInput = this.renderNormalInput.bind(this);
    this.renderRadioInput = this.renderRadioInput.bind(this);
    this.renderCheckboxInput = this.renderCheckboxInput.bind(this);
    this.renderSelectInput = this.renderSelectInput.bind(this);
    this.renderPhotoSetInput = this.renderPhotoSetInput.bind(this);
    this.renderPhotoInput = this.renderPhotoInput.bind(this);
    this.renderMethods = {
      normal: this.renderNormalInput,
      radio: this.renderRadioInput,
      checkbox: this.renderCheckboxInput,
      select: this.renderSelectInput,
      photo_set: this.renderPhotoSetInput,
      photo: this.renderPhotoInput
    };

    this.renderStepContent = this.renderStepContent.bind(this);
    this.renderNavButtons = this.renderNavButtons.bind(this);
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
  // Given the name of a list in the profile data, converts the list of string to a list of options, grabbing options from the specified source
  findOptions(source, name) {
    return (this.state.profile[name]??[]).map((value) => (
      this.state.selectOptions[source].find((opt) => opt.value === value)
    ));
  }
  // Given a list of Select options, return a list of String
  convertOptions(options) {
    return options.map((opt) => opt.value);
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
  // Renders a select many input box 
  renderSelectInput(config){
    return <Select
      className={config.class??"pc-step-select-input"}
      components={makeAnimated()}
      options={this.state.selectOptions[config.data_source]}
      value={this.findOptions(config.data_source, config.name)}
      onChange={this.handleChange(config.name, this.convertOptions)}
      placeholder={config.placeholder}
      isMulti
    />;
  }
  // Renders a set of photo inputs
  renderPhotoSetInput(config){
    const photoList = this.state.profile[config.name]??[];
    return <div className={config.class??"pc-step-photo-set-input"}>
      {photoList.map((photo, i) => (<ImageInput
        key={i}
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