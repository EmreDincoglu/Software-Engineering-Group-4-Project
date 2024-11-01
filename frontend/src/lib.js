import React from 'react';
import { useSearchParams } from 'react-router-dom';
import isMatch from 'lodash.ismatch';

/**
 * Sends a http request to url, returning {success: true, data} if successful, and {success: false, fail_message} if not.
 * fail_conds: a list of [object, fail_message] tuples, which correlate a subset of a response body, to a specific fail message. 
 * Each fail_cond will be checked against the response, and if object is a subset of the response data, fail_message will be returned
 * If no fail_conds match, the method returns a success, with either the entire response body, or the property named by the desired_data input.
 * 
 * config: {
 *  url: string,
 *  method: 'POST' or 'GET',
 *  credentials: bool,
 *  body: null, or {},
 *  fail_conds: [[{}, ""], ...],
 *  desired_data: null, or false, or prop_name
 * }
 */
async function sendRequest(config) {
    try{
        let response = await fetch(config.url, {
            method: config.method,
            credentials: config.credentials? 'include' : 'omit',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000/',
            },
            body: config.body == null? null : JSON.stringify(config.body)
        });
        if (!response.ok) {return {success: false, fail_message: ("Http Error: " + response.statusText)};}
        let data = await response.json();
        if (!data) {return {success: false, fail_message: "Invalid fetch response body"};}
        for (const [subset, msg] of config.fail_conds) {
            if (isMatch(data, subset)) {return {success: false, fail_message: msg};}
        }
        if (config.desired_data === false) {return {success: true};}
        if (config.desired_data == null) {return {success: true, data: data};}
        return {success: true, data: data[config.desired_data]};
    }catch(err) {
        return {success: false, fail_message: ("Fetch Failed with error: " + err)};
    }
}

/**
 * Returns {success: true, user} if session is valid, and {success: false, fail_message} if not
 */
export async function getUser() {
    let result = await sendRequest({
        url: 'http://localhost:5000/getUserData',
        method: 'GET',
        credentials: true,
        body: null,
        fail_conds: [
            [{success: false, invalid_session: true}, "Invalid Session"],
        ],
        desired_data: "user"
    });
    return {success: result.success, fail_message: result.fail_message, user: result.data};
}
/*
    Create a user on express and interpret the result
*/
export async function createUser(userData) {
    return await sendRequest({
        url: 'http://localhost:5000/createUser',
        method: 'POST',
        credentials: true,
        body: userData,
        fail_conds: [
            [{success: false, duplicate_email: true, duplicate_username: true}, "Email and Username are both already in use"],
            [{success: false, duplicate_email: true, duplicate_username: false}, "Email is already in use"],
            [{success: false, duplicate_email: false, duplicate_username: true}, "Username is already in use"],
        ],
        desired_data: false
    });
}
/*
    Login to an existing user on express, get a session, interpret success result
*/
export async function loginUser(userData) {
    return await sendRequest({
        url: 'http://localhost:5000/createSession',
        method: 'POST',
        credentials: true,
        body: {username: userData.username, password: userData.password},
        fail_conds: [
            [{invalid_username: true}, "Invalid User"],
            [{invalid_password: true}, "Incorrect Password"],
        ],
        desired_data: false
    });
}
// Checks with the express backend to make sure user is authorized with spotify, redirecting the user to the spotify auth url if not.
// Returns {success: true} if authorized, {success: false, fail_message} if invalid session, and doesnt return otherwise
export async function authSpotify() {
    let result = await sendRequest({
        url: 'http://localhost:5000/authSpotify',
        method: 'GET',
        credentials: true,
        body: null,
        fail_conds: [
            [{success: false, invalid_session: true}, "Invalid Session"],
        ],
        desired_data: null
    });
    if (!result.success) {return result;} // invalid session
    if (result.data.success) {return {success: true};} // user is already authorized with spotify
    window.location = result.data.path; // redirect to spotify auth website
}
// Asks the express app for data regarding the homepage, returning the data in an object
// Gets user data, and redirects to spotify if the user has no spotify token
export async function updateSpotifyToken(sendData) {
    return await sendRequest({
        url: 'http://localhost:5000/uploadSpotifyAuth',
        method: 'POST',
        credentials: true,
        body: sendData,
        fail_conds: [
            [{success: false, invalid_session: true}, "Invalid Session"],
            [{success: false, non_matching_user_ids: true}, "Different user id logged in than started the spotify authentication"],
            [{success: false, account_already_in_use: true}, "Different user has already connected that spotify account"],
        ],
        desired_data: false
    });
}

// Wraps a component to have search params from the url
export const withRouter = WrappedComponent => props => {
    // eslint-disable-next-line
    const [searchParams, _] = useSearchParams();

    return (<WrappedComponent {...props} params={searchParams}/>);
};