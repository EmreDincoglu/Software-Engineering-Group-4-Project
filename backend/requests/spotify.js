// Imports --------------------------
import { stringify } from "querystring";
import { send_encoded_request, user_request } from '../lib.js';
import { SpotifyAccount, User } from '../model.js';
import { get_user } from '../lib.js';
// Constants ---------------------------
const CLIENTID = "eff8ab475b084ac6b33354f145e05a36";
const CLIENT_SECRET = "8cbad3aeb88f42b1baa8eb03ad7abd12";
export const CLIENT_ENCODED = (new Buffer.from(CLIENTID + ':' + CLIENT_SECRET).toString('base64'));
const REDIRECTURI = "http://localhost:3000/spotifyAuthCallback";
const SCOPE = "user-top-read streaming";
// Export ----------------------------
export function add_requests(app) {
    app.get('/user/spotify/connect/begin', connectSpotify);
    app.post('/user/spotify/connect/finish', finishConnection);
    app.get('/user/spotify/refresh', refresh);
    app.get('/spotify/search', search);
}
// given a user, gets the SpotifyAccount model from the db corresponding to it
export async function getSpotifyData(id) {
    let account = await SpotifyAccount.findById(id);
    if (account == null) {return null;}
    return account.toJSON();
}
// Helper ---------------------
// Wraps a method into a spotify request, which automatically authenticates a session, and gets the spotify doc (refreshing if needed) and passes everything to the wrapped function
export function spotify_request(method) {
    return async (req, res) => {
        let user = await get_user(req.cookies.session_id, req.cookies.user_id);
        if (user == null) {res.json({success: false, invalid_session: true}); return;}
        let spotify = await SpotifyAccount.findById(user._id);
        if (spotify == null) {res.json({success: false, no_spotify_account: true}); return;}
        if (spotify.isOld() && !await spotify.refresh()) {
            await SpotifyAccount.findByIdAndDelete(spotify._id);
            res.json({success: false, refresh_token_failed: true}); return;
        }
        return await method(req, res, user, spotify);
    };
}
// Requests ---------------------
// Starts a connection process to the spotify api
const connectSpotify = user_request(async (_, res, user) => {
    await SpotifyAccount.findByIdAndDelete(user._id);
    // start connection process
    res.json({success: true, path: 'https://accounts.spotify.com/authorize?' + stringify({
        response_type: 'code',
        client_id: CLIENTID,
        scope: SCOPE,
        redirect_uri: REDIRECTURI,
        state: user.id,
        show_dialog: 'true'
    })});
});
// Adds a spotify token to a user account. requires a spotify_token and user_id value (seperate from the ones in cookies)
const finishConnection = user_request(async (req, res, user) => {
    if (req.body.user_id != req.cookies.user_id) {
        res.json({success: false, non_matchin_user_ids: true}); return;
    }
    if (await getSpotifyData(user._id) != null) {res.json({success: false, already_connected: true}); return;}
    // convert authorization token into an access token
    let token = req.body.token;
    let response = await send_encoded_request(
        'https://accounts.spotify.com/api/token',
        "POST",
        { //Headers
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + CLIENT_ENCODED
        },
        { //Body
            code: token,
            redirect_uri: REDIRECTURI,
            grant_type: 'authorization_code'
        }
    );
    if (!response.success) {
        res.json({success: false, fetch_failed: true, fail_message: response.fail_message}); return;
    }
    // Take required data and fill it into a new spotify database entry
    let spotify_doc = new SpotifyAccount({
        _id: req.body.user_id,
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        date: Date.now()
    });
    await spotify_doc.save();
    // get username
    let result = await send_encoded_request(
        `https://api.spotify.com/v1/me`, 
        'GET', 
        {'Authorization': `Bearer ${spotify_doc.access_token}`}, 
        null
    );
    if (result.success) {
        spotify_doc.username = result.data.display_name;
        await spotify_doc.save();
    }
    res.json({success: true});
});
// refresh the spotify token and return new date and token
const refresh = spotify_request(async (_req, res, _user, spotify) => {
    res.json({success: true, date: spotify.date, token: spotify.access_token});
});
// search spotify api and return results
const search = spotify_request(async (req, res, _user, spotify) => {
    let result = await send_encoded_request(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(req.query.q)}&type=${encodeURIComponent(req.query.type)}&limit=${encodeURIComponent(req.query.limit)}`, 
        'GET', 
        {'Authorization': `Bearer ${spotify.access_token}`}, 
        null
    );
    if (!result.success) {res.json({success: false, search_failed: true}); return;}
    res.json(result.data);
});