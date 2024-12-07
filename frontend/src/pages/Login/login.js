import React from "react";
import './login.css';
import { createUser, loginUser, loggedOutPage } from '../../lib/default';

class LoginPage extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      username: '',
      password: '',
      email: '',
      show_password: false,
      isLogin: true
    };
    this.fieldChangeHandler = this.fieldChangeHandler.bind(this);
    this.checkboxFieldChangeHandler = this.checkboxFieldChangeHandler.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.swapLogin = this.swapLogin.bind(this);
  }
  // input field onChange handlers
  fieldChangeHandler(event) {
    this.setState({[event.target.attributes.field.nodeValue]: event.target.value});
  }
  checkboxFieldChangeHandler(event) {
    this.setState({[event.target.attributes.field.nodeValue]: event.target.checked});
  }
  // Async methods to login or register a user
  async handleLogin(event) {
    event.preventDefault();
    const result = await loginUser(this.state.username, this.state.password);
    if (!result.success) {alert(result.fail_message); return;}
    this.props.updateUser();
  }
  async handleRegister(event) {
    event.preventDefault();
    const result = await createUser(this.state.username, this.state.password, this.state.email);
    if (!result.success) {alert(result.fail_message); return;}
    this.props.updateUser();
  }
  // Switch login page type
  swapLogin() {
    this.setState({
      isLogin: !this.state.isLogin,
      username: '',
      password: '',
      email: ''
    });
  }
  // render the page
  render() {
    const isLogin = this.state.isLogin;
    return <>
      <div className="grid-background"/>
      <div className="login-body">
        <form onSubmit={isLogin? this.handleLogin : this.handleRegister}>
          <h1>{isLogin? "Login" : "Sign Up"}</h1>
          {(!isLogin)&&<input 
            type="email" 
            className="input-box" 
            placeholder='Email' 
            value={this.state.email}
            field="email" 
            onChange={this.fieldChangeHandler} 
            required 
          />}
          <input 
            type="text" 
            className="input-box" 
            placeholder={isLogin? 'Username / Email' : 'Username'} 
            value={this.state.username}
            field="username" 
            onChange={this.fieldChangeHandler} 
            required 
          />
          <input 
            type={(this.state.show_password||!isLogin)? "text" : "password"} 
            className="input-box" 
            placeholder='Password' 
            value={this.state.password}
            field="password" 
            onChange={this.fieldChangeHandler} 
            required 
          />
          {isLogin&&<div className="forgot-password">
            <label>
              <input type="checkbox" field="show_password" onChange={this.checkboxFieldChangeHandler}/> 
              Show Password
            </label>
          </div>}
          <button type="submit">{this.isLogin? "Login" : "Sign Up"}</button>
          <p className="login-link">
            {this.isLogin? "Don't have an account? " : "Already have an account? "}
            <span onClick={this.swapLogin}>{this.isLogin? "Sign Up" : "Login"}</span>
          </p>
        </form>
      </div>
    </>;
  }
}
export default loggedOutPage(LoginPage);