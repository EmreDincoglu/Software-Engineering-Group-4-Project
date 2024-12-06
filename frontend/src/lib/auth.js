import React, {createContext} from 'react';
import {Navigate} from "react-router-dom";
import {getUser} from "./default";

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
  }
  getUserData(){
    getUser().then((result) => {
      if (!result.success) {this.setState({user: null, isLoggedIn: false});}
      else {this.setState({user: result.user, isLoggedIn: true});}
    });
  }
  componentDidMount() {
    this.getUserData();
  }
  render(){
    let values = {
      isLoggedIn: this.state.isLoggedIn,
      user: this.state.user,
      updateUser: this.getUserData
    };
    return <AuthContext.Provider value={values}>{this.props.children}</AuthContext.Provider>;
  }
}

export class AuthAwarePage extends React.Component{
  render(){
    if (this.props.authType === "user" && this.context.isLoggedIn === false) {
      return <Navigate to='/login'/>;
    } else if (this.props.authType === "anon" && this.context.isLoggedIn === true) {
      return <Navigate to='/home'/>;
    }
    return <this.props.child 
      {...this.props}
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
  return <AuthAwarePage {...props} authType="user" child={WrappedComponent}/>;
};
// Makes a page that auto redirects to home page when logged in
export const loggedOutPage = WrappedComponent => props => {
  return <AuthAwarePage {...props} authType="anon" child={WrappedComponent}/>;
};
// Makes the component aware of whether the user is logged in, but doesn't auto redirect
export const userAwarePage = WrappedComponent => props => {
  return <AuthAwarePage {...props} authType="aware" child={WrappedComponent}/>;
};
