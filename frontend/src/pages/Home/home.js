import React from "react";
import "./home.css";
import { loggedInPage } from "../../lib/auth";

class HomePage extends React.Component {
    render() {
        return (
            <div className="grid-background">
                <div className="title">
                    <h1> Welcome {this.props.user.username}!</h1>
                </div>
            </div>
        );
    }
}
export default loggedInPage(HomePage);
