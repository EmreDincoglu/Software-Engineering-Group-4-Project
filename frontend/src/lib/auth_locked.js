import React from "react";
import {Navigate} from "react-router-dom";
import { getUser } from "./backend";

// wraps a component to have user data as a prop.
export const withUserAuth = WrappedComponent => props => {
    return <AuthLockedPage child={WrappedComponent}/>;
};
// wraps a component to be aware of whether the user is logged in. Doesnt auto redirect to login when not logged in
export const withUserAwareness = WrappedComponent => props => {
    return <AuthAwarePage child={WrappedComponent}/>;
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

class AuthAwarePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            logged_in: null
        };
        this.getUserData = this.getUserData.bind(this);
    }

    async getUserData(){
        let result = await getUser();
        if (result.success) {
            this.setState({user: result.user, logged_in: true});
        } else {
            this.setState({logged_in: false});
        }
    }

    componentDidMount() {
        this.getUserData();
    }

    render() {
        return <this.props.child user={this.state.user} loading={this.state.logged_in==null} logged_in={this.state.logged_in}/>;
    }
}
