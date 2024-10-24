/*
    Imports:
*/
const mongoose =  require('mongoose');
const model = require('./model');
const querystring = require("querystring");
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
    // return user session in a cookie
    res.cookie('session_id', createdUser.session_id);
    res.cookie('user_id', createdUser.id);
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
    res.cookie('session_id', user.session_id);
    res.cookie('user_id', user.id);
    res.json(resp_data);
}

// returns the user, authenticating the session as well
async function get_user(session_id, user_id) {
    const user = await model.User.findById(user_id).findOne();
    if (!user) {return null;}
    if (!await user.authSession(session_id)) {return null;}
    return user;
}

// Authorize a session. the session values should be in a cookie automatically sent in the request
// returns a success bool
const authSession = async (req, res) => {
    res.json({success: await get_user(req.cookies.session_id, req.cookies.user_id) != null});
}

// Return client side user information after authorizing a session
const getUserData = async (req, res) => {
    let user = await get_user(req.cookies.session_id, req.cookies.user_id);
    if (!user) {res.json({success: false, invalid_session: true}); return;}
    res.json({
        success: true, 
        user: {username: user.username, email: user.email, first_name: user.first_name, last_name: user.last_name, age: user.age}
    });
}

// Ensure the user is authorized with spotify. redirects to spotify login page if not
const authSpotify = async (req, res) => {
    const user = await get_user(req.cookies.session_id, req.cookies.user_id);
    if (!user) {res.json({success: false, invalid_session: true}); return;}
    if (user.spotify_token) {res.json({success: true}); return;}
    // User has no spotify token, start the generation process.
    const user_id = user.id;
    const needed_scope = "user-top-read";
    res.json({success: false, path: 'https://accounts.spotify.com/authorize?' + querystring.stringify({
      response_type: 'code',
      client_id: CLIENTID,
      scope: needed_scope,
      redirect_uri: REDIRECTURI,
      state: user_id
    })});
}

// Adds a spotify token to a user account. requires a spotify_token and user_id value (seperate from the ones in cookies)
const uploadSpotifyAuth = async (req, res) => {
    if (req.body.user_id != req.cookies.user_id) {res.json({sucess: false, non_matching_user_ids: true}); return;}
    const user = await get_user(req.cookies.session_id, req.cookies.user_id);
    if (!user) {res.json({success: false, invalid_session: true}); return;}
    user.spotify_token = req.body.token;
    await user.save();
    res.json({success: true});
}

/* Sends a message between two users
Input: {
    recipient: ObjectId (_id property of recipient user),
    message: String
}
*/
const sendMessage = async (req, res, _) => {
    // authenticate session
    const user = await get_user(req.cookies.session_id, req.cookies.user_id);
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

const getMessages = async (req, res, _) => {
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
     //goes to the specific collection of the two users
     const collection = model.messageDB.model(messageCollectionName, model.messageSchema);
     //collection.find without any parameters gets every value in that collection and put it in an array
     var msgArr = collection.find();
     res.json(msgArr);
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
    sendMessage: sendMessage,
    getUserData: getUserData,
    getMessages: getMessages
};
