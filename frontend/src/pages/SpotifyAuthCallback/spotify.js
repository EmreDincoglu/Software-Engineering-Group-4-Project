import React from "react";
import {Navigate} from "react-router-dom";
import withRouter from "../../withRouter";

// Asks the express app for data regarding the homepage, returning the data in an object
// Gets user data, and redirects to spotify if the user has no spotify token
async function updateSpotifyToken(sendData) {
    try {
        // send token to express
        let response = await fetch('http://localhost:5000/uploadSpotifyAuth', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000/',
            },
            body: JSON.stringify(sendData)
        });
        if (!response || !response.ok) {return {sucess: false, error_message: "HTTP Error: " + response.statusText};}
        let data = await response.json();
        if (!data) {return {success: false, error_message: "Invalid fetch response body"};}
        if (data.success) {return {success: true};}
        if (data.invalid_session) {return {success: false, error_message: "Invalid Session"};}
        if (data.non_matching_user_ids) {return {success: false, error_message: "Different user id logged in than started the spotify authentication"};}
    } catch (err) {alert("Fetch failed: " + err); return {success: false};}
}

class SpotifyCallbackPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirectToHomepage: false,
            redirectToLogin: false
        };
    }

    componentDidMount() {
        //get url params
        let state = this.props.params.get('state');
        let code = this.props.params.get('code');
        let error = this.props.params.get('error');
        if (error != null) {
            this.setState({redirectToLogin: true});
            alert("Spotify Returned Error: " + error);
        }
        //ask express to update spotify code
        updateSpotifyToken({user_id: state, token: code}).then(result => {
            if (!result.success) {
                alert("Failed: " + result.error_message);
                this.setState({redirectToLogin: true});
                return;
            }
            this.setState({redirectToHomepage: true});
        });
    }

    render() {
        if (this.state.redirectToLogin) {
            return <Navigate to='/login' />;
        }
        if (this.state.redirectToHomepage) {
            return <Navigate to='/home' />;
        }
        return (<></>);
    }
}

export default withRouter(SpotifyCallbackPage);