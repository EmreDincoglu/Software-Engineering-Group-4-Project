import React from "react";
import './UserSignupBox.css';

async function createUser(userData) {
    let response = await fetch('http://localhost:5000/createUser', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:3000/',
        },
        body: JSON.stringify(userData)
    });
    if (!response.ok) {return {success: false, fail_message: "NetworkError: "+response.statusText};}
    let res_data = await response.json();
    if (!res_data) {return {success: false, fail_message: "Bad Response Body"};}
    if (!res_data.success) {
        if (res_data.duplicate_email && res_data.duplicate_username) {
            return {success: false, fail_message: "Email and Username are both already in use"};
        }else if (res_data.duplicate_email) {
            return {success: false, fail_message: "Email is already in use"};
        }else if (res_data.duplicate_username) {
            return {success: false, fail_message: "Username is already in use"};
        }
    }
    let user = res_data.user;
    if (!user) {return {success: false, fail_message: "Body contained no User"};}
    if (!user.session_id || !user._id) {return {success: false, fail_message: "Invalid User Format returned"};}
    return {success: true, session_id: user.session_id, user_id: user._id};
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
            // store cookies
            this.props.setCookie('session_id', result.session_id, { path: '/' });
            this.props.setCookie('user_id', result.user_id, { path: '/' });
            // redirect to homepage
        });
        event.preventDefault();
    }

    render() {
        return (<form onSubmit={this.handleSubmit}>
            <label>
                Username:
                <input type="text" value={this.state.username} field="username" onChange={this.fieldChangeHandler} />
            </label>
            <label>
                Password:
                <input type="password" value={this.state.password} field="password" onChange={this.fieldChangeHandler} />
            </label>
            <label>
                Email:
                <input type="email" value={this.state.email} field="email" onChange={this.fieldChangeHandler} />
            </label>
            <label>
                First Name:
                <input type="text" value={this.state.first_name} field="first_name" onChange={this.fieldChangeHandler} />
            </label>
            <label>
                Last Name:
                <input type="text" value={this.state.last_name} field="last_name" onChange={this.fieldChangeHandler} />
            </label>
            <label>
                Age:
                <input type="number" value={this.state.age} field="age" onChange={this.fieldChangeHandler} />
            </label>
            <input type="submit" value="Submit" />
        </form>);
    }
}

export default UserSignupBox;