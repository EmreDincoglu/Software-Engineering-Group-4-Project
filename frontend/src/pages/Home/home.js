import React from "react";
import {Navigate} from "react-router-dom";
import "./home.css";

// Asks the express app for data regarding the homepage, returning the data in an object
// Gets user data, and redirects to spotify if the user has no spotify token
async function getHomepageData() {
    try {
        // get user data
        let response = await fetch('http://localhost:5000/getUserData', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000/',
            }
        });
        if (!response.ok) {return {success: false};}
        let data = await response.json();
        if (!data.success) {return {success: false};}
        let user = data.user;
        // ensure user is authorized with spotify. user is automatically redirected to spotify page if not authorized.
        response = await fetch('http://localhost:5000/authSpotify', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000/',
            }
        });
        if (!response.ok) {return {success: false};} //invalid session
        data = await response.json();
        if (!data.success && data.path != null) {
            // redirect to spotify API
            window.location = data.path;
        }
        if (!data.success) {return {success: false};}
        // home page is good to go, return the data
        return {success: true, user: user};
    } catch (err) {alert("Fetch failed: " + err); return {success: false};}
}

export default class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            redirectToLogin: false
        };
    }

    componentDidMount() {
        getHomepageData().then(result => {
            if (!result.success) {
                this.setState({redirectToLogin: true});
            }else {
                this.setState({user: result.user});
            }
        });
    }

    render() {
        if (this.state.redirectToLogin) {
            return <Navigate to='/login' />;
        }
        return (
            <div>
                <p>{this.state.user? this.state.user.username : "unknown"}</p>
            </div>
        );
    }
}