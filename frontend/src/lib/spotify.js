import { sendRequest } from "./default";
// Checks with the express backend to make sure user is authorized with spotify, redirecting the user to the spotify auth url if not.
// Returns {success: false, fail_message} if invalid session, and doesnt return otherwise
export async function authSpotify() {
  let result = await sendRequest({
    url: 'http://localhost:5000/user/spotify/connect/begin',
    method: 'GET',
    credentials: true,
    body: null,
    fail_conds: [
      [{success: false, invalid_session: true}, "Invalid Session"],
    ],
    desired_data: null
  });
  if (!result.success) {return result;} // invalid session
  window.location = result.data.path; // redirect to spotify auth website
}
// Tells express to finish connecting to spotify. called after spotify page redirects back to our webpage
export async function updateSpotifyToken(user, token) {
  return await sendRequest({
    url: 'http://localhost:5000/user/spotify/connect/finish',
    method: 'POST',
    credentials: true,
    body: {user_id: user, token: token},
    fail_conds: [
      [{success: false, invalid_session: true}, "Invalid Session"],
      [{success: false, non_matching_user_ids: true}, "Different user id logged in than started the spotify authentication"],
      [{success: false, account_already_in_use: true}, "Different user has already connected that spotify account"],
    ],
    desired_data: false
  });
}
// Search spotify though the backend using search param, type of data, and item limit
async function spotifySearch(search, type, limit){
  return await sendRequest({
    url: `http://localhost:5000/spotify/search?q=${encodeURIComponent(search)}&type=${encodeURIComponent(type)}&limit=${encodeURIComponent(limit)}`,
    method: 'GET',
    credentials: true,
    body: null,
    fail_conds: [
      [{success: false, invalid_user: true}, "Invalid Session"],
      [{success: false, no_spotify_account: true}, "No Connected Spotify Account"],
      [{success: false, refresh_token_failed: true}, "Failed to refresh spotify token"],
      [{success: false, search_failed: true}, "Failed to search"]
    ],
    desired_data: null
  });
}
// Searches the spotify api for searchParam. returns a list of 10 items containing {name, id, image: url}
export async function spotifySongSearch(searchParam){
  let result = await spotifySearch(searchParam, "track", "10");
  return {
    success: result.success, 
    fail_message: result.fail_message,
    genres: result.data==null? [] : result.data.tracks.items.map((item) => ({
      name: item.name,
      id: item.id,
      image: item.album!=null? (item.album.images.length>0? item.album.images[0].url : null) : null
    }))
  };
}
// Searches the spotify API for 10 artists, then grabs the genres associated from them, and returns the genres in a list
export async function spotifyGenreSearch(searchParam){
  let result = await spotifySearch(searchParam, "artist", "10");
  return {
    success: result.success, 
    fail_message: result.fail_message,
    genres: result.data==null? [] : result.data.artists.items.map((item) => (item.genres)).flat(2)
  };
}
// Searches the spotify API for 10 artists
export async function spotifyArtistSearch(searchParam, token){
  let result = await spotifySearch(searchParam, "artist", "10");
  return {
    success: result.success, 
    fail_message: result.fail_message,
    artists: result.data==null? [] : result.data.artists.items.map((item) => ({
      name: item.name,
      id: item.id,
      image: item.images.length>0? item.images[0].url : null
    }))
  };
}