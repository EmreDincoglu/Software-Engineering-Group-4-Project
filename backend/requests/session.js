// Imports -----------------------------
import {User} from '../model.js';
import {user_request} from '../lib.js';
// Export --------------------------------
export function add_requests(app){
    //session
    app.post('/session/create', createSession);
    app.get('/session/end', endSession);
    app.get('/session/auth', authSession);
}
// Requests ---------------------------------
// Authorize access to a user's account, returns a session_id and user _id
// Requires a username and password field. username can be the username or email
const createSession = async (req, res) => {
    let resp_data = {success: true};
    // find user
    let user = await User.findOne({_lc_uname: req.body.username.toLowerCase()});
    if (user == null) {
        user = await User.findOne({email: req.body.username.toLowerCase()});
    }
    if (user == null) {
        res.json({success: false, invalid_user: true}); return;
    }
    // check password
    if (user.password != req.body.password) {
        resp_data.success = false; resp_data.invalid_password = true; res.json(resp_data); return;
    }
    // generate session and return success
    await user.generateSession(res);
    res.json({success: true});
}
// ends a session by erasing the session cookies
const endSession = async (_, res) => {
    res.cookie('session_id', "", {maxAge: 1});
    res.cookie('user_id', "", {maxAge: 1});
    res.json({success: true});
}
// Authorize a session. the session values should be in a cookie automatically sent in the request
// returns a success bool. user_request automatically authenticates a session, so this method only gets called when auth is successful
const authSession = user_request(async (_, res, user) => {
    res.json({success: true});
});