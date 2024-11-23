import React, {createContext} from 'react';
import {Navigate} from "react-router-dom";
import {getUser} from "./backend";

const AuthContext = createContext();

// Component which sets up the user data. place at top of component heirarchy so all components can access the user auth data
export class AuthProvider extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: null,
            user: null
        };
        this.getUserData = this.getUserData.bind(this);
        this.updateUser = this.updateUser.bind(this);
    }
    async getUserData(){
        let result = await getUser();
        if (result.success) {
            this.setState({user: result.user, isLoggedIn: true});
        } else {
            this.setState({user: null, isLoggedIn: false});
        }
    }
    componentDidMount() {
        this.getUserData();
    }
    updateUser() {
        this.setState({user: null, isLoggedIn: null});
        this.getUserData();
    }
    render(){
        let values = {
            isLoggedIn: this.state.isLoggedIn,
            user: this.state.user,
            updateUser: this.updateUser
        };
        return (<AuthContext.Provider value={values}>
            {this.props.children}
        </AuthContext.Provider>);
    }
}

class AuthAwarePage extends React.Component {
    render() {
        if (this.props.authType === "user" && this.context.isLoggedIn === false) {
            return <Navigate to='/login'/>;
        } else if (this.props.authType === "anon" && this.context.isLoggedIn === true) {
            return <Navigate to='/home'/>;
        }
        return <this.props.child 
            user={this.context.user} 
            isLoggedIn={this.context.isLoggedIn} 
            authLoading={this.context.isLoggedIn == null}
            updateUser={this.context.updateUser}
        />;
    }
}
AuthAwarePage.contextType = AuthContext;

// Makes a page that auto redirects to login when not logged in
export const loggedInPage = WrappedComponent => props => {
    return <AuthAwarePage authType="user" child={WrappedComponent}/>;
};
// Makes a page that auto redirects to home page when logged in
export const loggedOutPage = WrappedComponent => props => {
    return <AuthAwarePage authType="anon" child={WrappedComponent}/>;
};
// Makes the component aware of whether the user is logged in, but doesn't auto redirect
export const userAwarePage = WrappedComponent => props => {
    return <AuthAwarePage authType="aware" child={WrappedComponent}/>;
};
