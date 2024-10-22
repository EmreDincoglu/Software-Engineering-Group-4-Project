/*
    Imports:
*/
const mongoose =  require('mongoose');
const model = require('./model');
const CLIENTID = "eff8ab475b084ac6b33354f145e05a36";
const CLIENT_SECRET = "8cbad3aeb88f42b1baa8eb03ad7abd12";
const REDIRECTURI = "http://localhost:3000/spotifyAuthCallback";
/*
    Request Methods:
*/
// Create a new user, returns the user if successful
// Requires username, email, first_name, last_name, password, and age fields
const createUser = async (req, res) => {
    // parse input into a userModel object
    req.body.email = req.body.email.toLowerCase();
    req.body._lc_uname = req.body.username.toLowerCase();
    // Create the new user
    const createdUser = new model.User(req.body);
    // create return object and check for email and username uniqueness
    let resp_data = {};
    resp_data.duplicate_email = !(await createdUser.checkUniqueEmail());
    resp_data.duplicate_username = !(await createdUser.checkUniqueUsername());
    resp_data.success = !resp_data.duplicate_email && !resp_data.duplicate_username;
    if (!resp_data.success) {res.send(resp_data); return;}
    // put the user into the database. technically not required since generateSession also saves the user
    await createdUser.save();
    // create a new session for the user
    await createdUser.generateSession();
    // return user
    resp_data.user = createdUser;
    res.send(resp_data);
}

// Authorize access to a user's account, returns a session_id and user _id
// Requires a username and password field
const createSession = async (req, res) => {
    let resp_data = {success: true};
    // find user
    const user = await model.User.findOne({_lc_uname: req.body.username.toLowerCase()});
    if (!user) {
        resp_data.success = false; resp_data.invalid_username = true; res.json(resp_data); return;
    }
    // check password
    if (user.password != req.body.password) {
        resp_data.success = false; resp_data.invalid_password = true; res.json(resp_data); return;
    }
    // generate session
    await user.generateSession();
    // return session
    resp_data.session = user.session_id;
    resp_data.user = user._id;
    res.json(resp_data);
}

// returns the user, authenticating the session as well
async function get_user(session_id, user_id) {
    const user = await model.User.findById(user_id).findOne();
    if (!user) {return null;}
    if (!await user.authSession(session_id)) {return null;}
    return user;
}

// Authorize a session. requires a session_id and user _id
// returns a success bool
const authSession = async (req, res) => {
    res.json({success: await get_user(req.body.session, req.body.user) != null});
}

// Ensure the user is authorized with spotify. redirects to spotify login page if not
// requires a session_id and user _id
const authSpotify = async (req, res) => {
    const user = await get_user(req.body.session, req.body.user);
    if (!user) {res.json({success: false, invalid_session: true}); return;}
    if (user.spotify_token) {res.json({success: true}); return;}
    // User has no spotify token, start the generation process.
    const state = user._id;
    const scope = "user-top-read";
    res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify({
      response_type: 'code',
      client_id: CLIENTID,
      scope: scope,
      redirect_uri: REDIRECTURI,
      state: state
    }));
}

// Adds a spotify token to a user account. requires a session_id, user _id, and spotify_token
const uploadSpotifyAuth = async (req, res) => {
    const user = await get_user(req.body.session, req.body.user);
    if (!user) {res.json({success: false, invalid_session: true}); return;}
    user.spotify_token = req.body.spotify_token;
    await user.save();
    res.json({success: true});
}

/* Sends a message between two users
Input: {
    session: Number (session_id property of users),
    user: ObjectId (_id property of users),
    recipient: ObjectId (_id property of recipient user),
    message: String
}
*/
const sendMessage = async (req, res, _) => {
    // authenticate session
    const user = await get_user(req.body.session, req.body.user);
    if (!user) {res.json({success: false, invalid_session: true}); return;}
    // ensure recipient does actually exist
    const recipient = await model.User.findById(req.body.recipient).findOne();
    if (!recipient) {res.json({success: false, invalid_recipient: true}); return;}
    // get/create model for user->recipient message database
    let messageCollectionName;
    if (user._lc_uname < recipient._lc_uname) {messageCollectionName = user._lc_uname + ":" + recipient._lc_uname;}
    else {messageCollectionName = recipient._lc_uname + ":" + user._lc_uname;}
    const Message = model.messageDB.model(messageCollectionName, model.messageSchema);
    // create new message
    const message = new Message({
        date: Date.now(),
        message: req.body.message,
        sender: user._lc_uname,
        recipient: recipient._lc_uname
    });
    // save message to db and return
    res.json({success: true, message: await message.save()});
}

/*
    Export Methods for server.js
*/
module.exports = {
    createUser: createUser,
    createSession: createSession,
    authSession: authSession,
    authSpotify: authSpotify,
    uploadSpotifyAuth: uploadSpotifyAuth,
    sendMessage: sendMessage
};
