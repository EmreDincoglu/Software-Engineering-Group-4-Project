import React from "react";
import {Navigate} from "react-router-dom";
import "./home.css";
import { getHomepageData } from "../../lib";

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