import React from "react";
import { Navigate } from "react-router-dom";
import { updateSpotifyToken } from "../../lib/backend";
import { loggedInPage } from "../../lib/auth";
import { withParams } from "../../lib/default";

class SpotifyCallbackPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirectToHomepage: false
        };
        this.updateSpotify = this.updateSpotify.bind(this);
    }
    async updateSpotify() {
        //get url params
        let state = this.props.params.get('state');
        let code = this.props.params.get('code');
        let error = this.props.params.get('error');
        if (error != null) {
            alert("Spotify Returned Error: " + error);
        }else {
            //ask express to update spotify code
            let result = await updateSpotifyToken({user_id: state, token: code});
            if (!result.success) {
                alert("Failed: " + result.error_message);
            }
        }
        this.setState({redirectToHomepage: true});
        await this.props.updateUser();
    }
    componentDidMount() {
        this.updateSpotify();
    }

    render() {
        if (this.state.redirectToHomepage) {
            return <Navigate to='/home' />;
        }
        return (<></>);
    }
}
export default loggedInPage(withParams(SpotifyCallbackPage));