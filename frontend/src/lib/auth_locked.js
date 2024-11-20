import React from "react";
import {Navigate} from "react-router-dom";
import { getUser } from "./backend";

// Wraps a component to have search params from the url
export const withUserAuth = WrappedComponent => props => {
    return <AuthLockedPage child={WrappedComponent}/>;
};

class AuthLockedPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            redirectToLogin: false
        };
        this.getUserData = this.getUserData.bind(this);
    }

    async getUserData(){
        let result = await getUser();
        if (result.success) {
            this.setState({user: result.user});
        } else {
            this.setState({redirectToLogin: true});
        }
        return (result.success);
    }

    componentDidMount() {
        this.getUserData();
    }

    render() {
        if (this.state.redirectToLogin) {
            return <Navigate to='/login'/>;
        }
        return <this.props.child user={this.state.user} loading={this.state.user==null}/>;
    }
}
