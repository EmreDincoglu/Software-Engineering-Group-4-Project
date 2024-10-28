import React from "react";
import './login.css';
import { createUser, loginUser } from '../../lib';
import { Navigate } from "react-router-dom";

export default class LoginPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            username: '',
            password: '',
            email: '',
            isLogin: true,
            redirectToHomepage: false
        };
        this.fieldChangeHandler = this.fieldChangeHandler.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.swapLogin = this.swapLogin.bind(this);
    }

    fieldChangeHandler(event) {
        this.setState({[event.target.attributes.field.nodeValue]: event.target.value});
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
        if (this.state.isLogin) { return (
            <>
            <div class= "grid-background"></div>
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
                        type="password" 
                        className="input-box" 
                        placeholder='Password' 
                        value={this.state.password}
                        field="password" 
                        onChange={this.fieldChangeHandler} 
                        required 
                    />
                    <div className="forgot-password">
                        <label>
                            <input type="checkbox" /> 
                            Remember me
                        </label>
                        <text>Forgot Password</text>
                    </div>
                    <button type="submit">Login</button>
                    <p className="register-link">
                        Don't have an account?
                        <text onClick={this.swapLogin}> Sign Up</text>
                    </p>
                </form>
            </div>
            </>
        );
        }else { return (
            <>
                <div class = "grid-background"></div>
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
                        <text onClick={this.swapLogin}> Login</text>
                    </p>
                </form>
            </div>
            </>
        );}
    }
}
