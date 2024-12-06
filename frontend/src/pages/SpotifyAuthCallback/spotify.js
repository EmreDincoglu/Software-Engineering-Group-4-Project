import React from "react";
import {updateSpotifyToken, loggedInPage, withParams, withNavigate} from '../../lib/default';

class SpotifyCallbackPage extends React.Component {
  componentDidMount() {
    // get url params
    let state = this.props.params.get('state');
    let code = this.props.params.get('code');
    let error = this.props.params.get('error');
    // Alert user if spotify returned error
    if (error!=null) {
      alert("Spotify Returned Error: " + error);
      this.props.navigate("/home");
      return;
    }
    // Upload the token, alerting user on failure, then redirect to homepage
    updateSpotifyToken(state, code).finally((result) => {
      if (!result.success) {
        alert("Failed: " + result.error_message);
        this.props.navigate("/home");
      }else {
        this.props.navigate("/home");
        this.props.updateUser();
      }
    });
  }
  render() {return <></>;}
}
export default loggedInPage(withParams(withNavigate(SpotifyCallbackPage)));