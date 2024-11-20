import React from "react";
import "./home.css";
import "../../lib/auth_locked";
import {withUserAuth} from "../../lib/auth_locked";

class HomePage extends React.Component {
    render() {
        if (this.props.loading) {
            return (<>
                <div className = "grid-background"></div>
                <h1>Loading...</h1>
            </>);
        }
        if (this.props.user!=null) {
            return (
                <div className="grid-background">
                    <div className="title">
                        <h1> Welcome {this.props.user.username}!</h1>
                    </div>
                </div>
            );
        }
    }
}
export default withUserAuth(HomePage);
