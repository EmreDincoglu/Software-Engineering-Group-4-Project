import React from 'react';
import { useSearchParams } from 'react-router-dom';
/*
    Create a user on express and interpret the result
*/
export async function createUser(userData) {
    try {
        let response = await fetch('http://localhost:5000/createUser', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000/',
            },
            body: JSON.stringify(userData)
        });
        if (!response.ok) {return {success: false, fail_message: "HTTP Error: " + response.statusText};}
        let res_data = await response.json();
        if (!res_data) {return {success: false, fail_message: "Bad Response Body"};}
        if (!res_data.success) {
            if (res_data.duplicate_email && res_data.duplicate_username) {
                return {success: false, fail_message: "Email and Username are both already in use"};
            }else if (res_data.duplicate_email) {
                return {success: false, fail_message: "Email is already in use"};
            }else if (res_data.duplicate_username) {
                return {success: false, fail_message: "Username is already in use"};
            }
        }
        return {success: true};
    } catch (err) {return {success: false, fail_message: "Fetch Failed: " + err};}
}
/*
    Login to an existing user on express, get a session, interpret success result
*/
export async function loginUser(userData) {
    try {
        let response = await fetch('http://localhost:5000/createSession', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000/',
            },
            body: JSON.stringify({username: userData.username, password: userData.password})
        });
        if (!response.ok) {return {success: false, fail_message: "HTTP Error: " + response.statusText};}
        let res_data = await response.json();
        if (!res_data) {return {success: false, fail_message: "Bad Response Body"};}
        if (res_data.invalid_username) {
            return {success: false, fail_message: "Incorrect Username"};
        }else if (res_data.invalid_password) {
            return {success: false, fail_message: "Incorrect Password"};
        }
        return {success: true};
    } catch (err) {return {success: false, fail_message: "Fetch Failed: " + err};}
}
// Asks the express app for data regarding the homepage, returning the data in an object
// Gets user data, and redirects to spotify if the user has no spotify token
export async function getHomepageData() {
    try {
        // get user data
        let response = await fetch('http://localhost:5000/getUserData', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000/',
            }
        });
        if (!response.ok) {return {success: false};}
        let data = await response.json();
        if (!data.success) {return {success: false};}
        let user = data.user;
        // ensure user is authorized with spotify. user is automatically redirected to spotify page if not authorized.
        response = await fetch('http://localhost:5000/authSpotify', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000/',
            }
        });
        if (!response.ok) {return {success: false};} //invalid session
        data = await response.json();
        if (!data.success && data.path != null) {
            // redirect to spotify API
            window.location = data.path;
        }
        if (!data.success) {return {success: false};}
        // home page is good to go, return the data
        return {success: true, user: user};
    } catch (err) {alert("Fetch failed: " + err); return {success: false};}
}
// Asks the express app for data regarding the homepage, returning the data in an object
// Gets user data, and redirects to spotify if the user has no spotify token
export async function updateSpotifyToken(sendData) {
    try {
        // send token to express
        let response = await fetch('http://localhost:5000/uploadSpotifyAuth', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000/',
            },
            body: JSON.stringify(sendData)
        });
        if (!response || !response.ok) {return {sucess: false, error_message: "HTTP Error: " + response.statusText};}
        let data = await response.json();
        if (!data) {return {success: false, error_message: "Invalid fetch response body"};}
        if (data.success) {return {success: true};}
        if (data.invalid_session) {return {success: false, error_message: "Invalid Session"};}
        if (data.non_matching_user_ids) {return {success: false, error_message: "Different user id logged in than started the spotify authentication"};}
        if (data.account_already_in_use) {return {success: false, error_message: "Different user has already connected that spotify account"};}
    } catch (err) {alert("Fetch failed: " + err); return {success: false};}
}
// Wraps a component to have search params from the url
export const withRouter = WrappedComponent => props => {
    // eslint-disable-next-line
    const [searchParams, _] = useSearchParams();

    return (<WrappedComponent {...props} params={searchParams}/>);
};