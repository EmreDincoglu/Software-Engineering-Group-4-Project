import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
export async function sendRequest(config) {
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

// Wraps a component to have search params from the url
export const withParams = WrappedComponent => props => {
  const [searchParams, setSearchParams] = useSearchParams();
  return (<WrappedComponent {...props} params={searchParams} setParams={setSearchParams}/>);
};
// Wraps a component to have a navigate param. a function to switch pages
export const withNavigate = WrappedComponent => props => {
  const navigate = useNavigate();
  return <WrappedComponent {...props} navigate={navigate}/>;
};
// Component to call a method during rendering without react complaining
export const MethodCaller = props => {
  props.method();
  return <></>;
}

//Rexports
export {
  loggedInPage, 
  loggedOutPage, 
  userAwarePage
} from './auth';
export {
  authSpotify, 
  updateSpotifyToken, 
  getSong,
  spotifySongSearch, 
  spotifyGenreSearch, 
  spotifyArtistSearch
} from './spotify';
export {
  getUser,
  createUser,
  deleteUser,
  updateUser,
  followUser,
  unfollowUser,
  blockUser
} from './user';
export {
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  createPost,
  likePost,
  getPost,
  getPostList,
  getMessages,
  sendMessage,
  getImage
} from './backend';
export {ImageInput, ImageSetInput, StoredImage} from './components/image';
export {PostDisplay} from './components/post';
export {UserDisplay} from './components/user';
export {SongDisplay} from './components/song';