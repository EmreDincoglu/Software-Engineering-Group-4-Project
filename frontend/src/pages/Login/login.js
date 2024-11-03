import React from "react";
import './login.css';
import { createUser, loginUser } from '../../lib/backend';
import { Navigate } from "react-router-dom";

export default class LoginPage extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      username: '',
      password: '',
      email: '',
      show_password: false,
      isLogin: true,
      redirectToHomepage: false
    };
    this.fieldChangeHandler = this.fieldChangeHandler.bind(this);
    this.checkboxFieldChangeHandler = this.checkboxFieldChangeHandler.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.swapLogin = this.swapLogin.bind(this);
  }

  fieldChangeHandler(event) {
    this.setState({[event.target.attributes.field.nodeValue]: event.target.value});
  }
  checkboxFieldChangeHandler(event) {
    this.setState({[event.target.attributes.field.nodeValue]: event.target.checked});
  }
  async handleLogin(event) {
    event.preventDefault();
    const creds = {username: this.state.username, password: this.state.password};
    const result = await loginUser(creds);
    if (!result.success) {alert(result.fail_message); return;}
    this.setState({redirectToHomepage: true});
  }
  async handleRegister(event) {
    event.preventDefault();
    const creds = {username: this.state.username, password: this.state.password, email: this.state.email};
    const result = await createUser(creds);
    if (!result.success) {alert(result.fail_message); return;}
    this.setState({redirectToHomepage: true});
  }
  swapLogin() {
    this.setState({
      isLogin: !this.state.isLogin,
      username: '',
      password: '',
      email: ''
    });
  }

  render() {
    if (this.state.redirectToHomepage) {return <Navigate to='/home'/>;}
    if (this.state.isLogin) { return (<>
      <div className= "grid-background"></div>
      <div className="login-body">
        <form onSubmit={this.handleLogin}>
          <h1>Login</h1>
          <input 
            type="text" 
            className="input-box" 
            placeholder='Username / Email' 
            value={this.state.username}
            field="username" 
            onChange={this.fieldChangeHandler} 
            required 
          />
          <input 
            type={this.state.show_password? "text" : "password"} 
            className="input-box" 
            placeholder='Password' 
            value={this.state.password}
            field="password" 
            onChange={this.fieldChangeHandler} 
            required 
          />
          <div className="forgot-password">
            <label>
              <input type="checkbox" field="show_password" onChange={this.checkboxFieldChangeHandler}/> 
              Show Password
            </label>
            <span>Forgot Password</span>
          </div>
          <button type="submit">Login</button>
          <p className="register-link">
            Don't have an account?
            <span onClick={this.swapLogin}> Sign Up</span>
          </p>
        </form>
      </div>
    </>);}else { return (<>
      <div className = "grid-background"></div>
      <div className="login-body">
        <form onSubmit={this.handleRegister}>
          <h1>Sign Up</h1>
          <input 
            type="email" 
            className="input-box" 
            placeholder='Email' 
            value={this.state.email}
            field="email" 
            onChange={this.fieldChangeHandler} 
            required 
          />
          <input 
            type="text" 
            className="input-box" 
            placeholder='Username'
            value={this.state.username}
            field="username" 
            onChange={this.fieldChangeHandler} 
            required 
          />
          <input 
            type="text" 
            className="input-box" 
            placeholder='Password' 
            value={this.state.password}
            field="password" 
            onChange={this.fieldChangeHandler} 
            required 
          />
          <button type="submit">Sign Up</button>
          <p className="login-link">
            Already have an account? 
            <span onClick={this.swapLogin}> Login</span>
          </p>
        </form>
      </div>
    </>);}
  }
}
