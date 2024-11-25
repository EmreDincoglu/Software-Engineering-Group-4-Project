// Imports --------------------------
import moment from 'moment';
import { stringify } from "querystring";
import { send_encoded_request, user_request } from '../lib.js';
import { SpotifyAccount, User } from '../model.js';
// Constants ---------------------------
const CLIENTID = "eff8ab475b084ac6b33354f145e05a36";
const CLIENT_SECRET = "8cbad3aeb88f42b1baa8eb03ad7abd12";
const CLIENT_ENCODED = (new Buffer.from(CLIENTID + ':' + CLIENT_SECRET).toString('base64'));
const REDIRECTURI = "http://localhost:3000/spotifyAuthCallback";
const SCOPE = "user-top-read streaming";
// Export ----------------------------
export function add_requests(app) {
    app.get('/user/spotify/connect/begin', connectSpotify);
    app.post('/user/spotify/connect/finish', finishConnection);
}
// given a user, gets the SpotifyAccount model from the db corresponding to it
export async function getSpotifyData(user) {
    return SpotifyAccount.findOne({user: user._id});
}
// Schema methods ----------------------------
async function refresh(model) {
    // check to see if token is > 40 minutes old
    if (moment(Date.now()).diff(moment(model.date), 'minutes') <= 40.0) {return {success: true};}
    // Try to refresh token
    let response = await send_encoded_request(
        "https://accounts.spotify.com/api/token",
        "POST",
        {// headers
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + CLIENT_ENCODED
        },
        {// body
            grant_type: 'refresh_token',
            refresh_token: model.refresh_token
        }
    );
    if (!response.success) {
        await SpotifyAccount.deleteMany({user: this.user});
        return {success: false, fetch_failed: true, fail_message: response.fail_message};
    }
    if (response.data.access_token == null || response.data.refresh_token == null) {
        await SpotifyAccount.deleteMany({user: this.user});
        return {success: false, no_tokens_recieved: true};
    }
    model.access_token = response.data.access_token;
    model.refresh_token = response.data.refresh_token;
    model.date = Date.now();
    await model.save();
    return {success: true};
}
// Requests ---------------------
// Starts a connection process to the spotify api
const connectSpotify = user_request(async (_, res, user) => {
    await SpotifyAccount.deleteMany({user: user._id});
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
    if (await getSpotifyData(user) != null) {res.json({success: false, already_connected: true}); return;}
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
        user: req.body.user_id,
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        date: Date.now()
    });
    await spotify_doc.save();
    res.json({success: true});
});