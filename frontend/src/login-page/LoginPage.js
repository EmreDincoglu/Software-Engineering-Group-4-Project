import React from "react";
import './LoginPage.css';
import {createUser, loginUser} from './lib';

class UserLoginBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
        };

        this.fieldChangeHandler = this.fieldChangeHandler.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    fieldChangeHandler(event) {
        this.setState({[event.target.attributes.field.nodeValue]: event.target.value});
    }

    handleSubmit(event) {
        loginUser(this.state).then(result => {
            if (!result.success) {
                console.log(result);
                alert(result.fail_message);
                return;
            }
            // redirect to homepage
        });
        event.preventDefault();
    }

    render() {
        return (<div className = 'container'>
            <form onSubmit={this.handleSubmit}>
                <h1>Login</h1>
                <div className="input-box">
                    <input type="text" placeholder='Username' value = {this.state.username} field="username" onChange ={this.fieldChangeHandler} required/>
                </div>
                <div className="input-box">
                    <input type="password" placeholder='Password' value = {this.state.password} field="password" onChange ={this.fieldChangeHandler} required/>
                </div>
                <button type="submit" value="Submit">Login</button>
            </form>
        </div>);
    }
}

class UserSignupBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            age: 0
        };

        this.fieldChangeHandler = this.fieldChangeHandler.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    fieldChangeHandler(event) {
        this.setState({[event.target.attributes.field.nodeValue]: event.target.value});
    }

    handleSubmit(event) {
        createUser(this.state).then(result => {
            if (!result.success) {
                console.log(result);
                alert(result.fail_message);
                return;
            }
            // redirect to homepage

        });
        event.preventDefault();
    }

    render() {
        return (<div className = 'container'>
            <form onSubmit={this.handleSubmit}>
                <h1>Register</h1>
                <div className="input-box">
                    <input type="text" placeholder='Username' value = {this.state.username} field="username" onChange ={this.fieldChangeHandler} required/>
                </div>
                <div className="input-box">
                    <input type="text" placeholder='Password' value = {this.state.password} field="password" onChange ={this.fieldChangeHandler} required/>
                </div>
                <div className="input-box">
                    <input type="email" placeholder='Email' value = {this.state.email} field="email" onChange ={this.fieldChangeHandler} required/>
                </div>
                <div className="input-box">
                    <input type="text" placeholder='First Name' value = {this.state.first_name} field="first_name" onChange ={this.fieldChangeHandler} required/>
                </div>
                <div className="input-box">
                    <input type="text" placeholder='Last Name' value = {this.state.last_name} field="last_name" onChange ={this.fieldChangeHandler} required/>
                </div>
                <div className="number-input-box">
                    <label>Age: </label>
                    <input type="number" value = {this.state.age} field="age" onChange ={this.fieldChangeHandler} required/>
                </div>
                <button type="submit" value="Submit">Register</button>
            </form>
        </div>);
    }
}

export default function LoginPage() {
    return (
        <div className='app-body'>
        <div className='login-box'><UserLoginBox/></div>
        <div className='login-box'><UserSignupBox/></div>
        </div>
    )
}

