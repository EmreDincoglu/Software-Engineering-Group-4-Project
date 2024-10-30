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
            return <Navigate to='/login'/>;
        }
        if (this.state.user) {
            return (
                <div class="grid-background">
                    <div className="title">
                        <h1> Welcome {this.state.user.username}!</h1>
                    </div>
                </div>
            );
        }
        return (<>
            <div class = "grid-background"></div>
            <h1>Loading...</h1>
        </>);
    }
}
