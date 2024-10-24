import React from "react";
import {Navigate} from "react-router-dom";
import { updateSpotifyToken, withRouter } from "../../lib";

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