/*
    Imports:
*/
const mongoose = require('mongoose');
const model = require('./model');
const querystring = require("querystring");
const CLIENTID = "eff8ab475b084ac6b33354f145e05a36";
const CLIENT_SECRET = "8cbad3aeb88f42b1baa8eb03ad7abd12";
const REDIRECTURI = "http://localhost:3000/spotifyAuthCallback";
/*
    Request Methods:
*/
// Create a new user, returns the user if successful
// Requires username, email, password
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

const deleteUser = async (req, res) => {
    let user = await get_user(req.cookies.session_id, req.cookies.user_id);
    if (!user) {res.json({success: false, invalid_session: true}); return;}

    // return removed user and remove user from collection
    res.send((await model.User.findByIdAndDelete(req.cookies.user_id)).toJSON());
}

// Authorize access to a user's account, returns a session_id and user _id
// Requires a username and password field
const createSession = async (req, res) => {
    let resp_data = {success: true};
    // find user
    let user = await model.User.findOne({_lc_uname: req.body.username.toLowerCase()});
    if (user == null) {
        user = await model.User.findOne({email: req.body.username.toLowerCase()});
    }
    if (user == null) {
        res.json({success: false, invalid_user: true}); return;
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
    res.json({success: true});
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
      state: user_id,
      show_dialog: 'true'
    })});
}

// Adds a spotify token to a user account. requires a spotify_token and user_id value (seperate from the ones in cookies)
const uploadSpotifyAuth = async (req, res) => {
    if (req.body.user_id != req.cookies.user_id) {res.json({sucess: false, non_matching_user_ids: true}); return;}
    const user = await get_user(req.cookies.session_id, req.cookies.user_id);
    if (!user) {res.json({success: false, invalid_session: true}); return;}
    // upload token
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
    const recipient = await model.User.findById(req.body.recipient_id.toString());
    if (!recipient) {res.json({success: false, invalid_recipient: true}); return;}
    //check if users have blocked one another
    if(await checkBlocked(user._id, recipient._id)) {res.json({success: false, blocked: true}); return;}
    // get/create model for user->recipient message database
    let messageCollectionName;
    if (user._id < recipient._id) {messageCollectionName = user._id.toString() + ":" + recipient._id.toString();}
    else {messageCollectionName = recipient._id.toString() + ":" + user._id.toString();}
    const Message = model.messageDB.model(messageCollectionName, model.messageSchema);
    // create new message
    const message = new Message({
        date: Date.now(),
        message: req.body.message,
        sender: user._id,
        recipient: recipient._id
    });
    // save message to db and return
    res.json({success: true, message: await message.save()});
}

const getMessages = async (req, res, _) => {
    // authenticate session
    const user = await get_user(req.cookies.session_id, req.cookies.user_id);
    if (!user) {res.json({success: false, invalid_session: true}); return;}
    // ensure recipient does actually exist
    const recipient = await model.User.findById(req.body.recipient_id);
    if (!recipient) {res.json({success: false, invalid_recipient: true}); return;}
    //check if users have blocked one another
    if(await checkBlocked(user._id, recipient._id)) {res.json({success: false, blocked: true}); return;}
    // get/create model for user->recipient message database
    let messageCollectionName;
    if (user._id < recipient._id) {messageCollectionName = user._id.toString() + ":" + recipient._id.toString();}
    else {messageCollectionName = recipient._id.toString() + ":" + user._id.toString();}
    //goes to the specific collection of the two users
    const collection = model.messageDB.model(messageCollectionName, model.messageSchema);
    //collection.find without any parameters gets every value in that collection and put it in an array
    var msgArr = await collection.find();
    res.json(msgArr);
}

async function createProfile(user_id) {
    //sets everything as null for the time being, this is under the assumption that the user exists but they have
    //yet to create their profile
    const newProfile = new model.Profile();
    newProfile.user_id = user_id;
    newProfile.pref_name = null;
    newProfile.age = null;
    newProfile.prompt_one = null;
    newProfile.prompt_two = null;
    newProfile.prompt_three = null;
    newProfile.answer_one = null;
    newProfile.answer_two = null;
    newProfile.answer_three = null;
    newProfile.profile_pic = null;
    await newProfile.save();
    return newProfile;
}

const getProfile = async(req, res, _) => {
    //authenticate session
    const user = await get_user(req.cookies.session_id, req.cookies.user_id);
    if (!user) {res.json({success: false, invalid_session: true}); return;}
    /*
    finds profile, if it doesn't exist, makes one automatically only if the user does exist.
    (this allows us to get null data from a profile, for instance if someone hasnt edited their profile but we know their user
    exists, then it will just send back an empty profile of data that will be filled in eventually)
    */
    console.log(user._id);
    const otherUser = await model.User.findById(req.body.user_id);
    if (!otherUser) {res.json({success: false, invalid_user: true}); return;}
    //checks to see if user is blocked, if so will not send profile data
    if (await checkBlocked(user._id, otherUser._id)) {res.json({success: false, blocked: true}); return;}
    let profile = await model.Profile.findOne({user_id: req.body.user_id});
    if (!profile) {profile = await createProfile(req.body.user_id);}
    res.json(profile);
}

const editProfile = async(req, res, _) => {
    //auth session
    const user = await get_user(req.cookies.session_id, req.cookies.user_id);
    if (!user) {res.json({success: false, invalid_session: true}); return;}
    //finds profile, if it doesn't exist it makes one
    let profile = await model.Profile.findOne({user_id: user._id});
    if (!profile) {profile = await createProfile(user._id)}
    //theres gotta be a cleaner way of doing this
    profile.pref_name = req.body.pref_name;
    profile.age = req.body.age;
    profile.prompt_one = req.body.prompt_one;
    profile.prompt_two = req.body.prompt_two;
    profile.prompt_three = req.body.prompt_three;
    profile.answer_one = req.body.response_one;
    profile.answer_two = req.body.response_two;
    profile.answer_three = req.body.response_three;
    /*
    req.body.profile_pic is this {
        data: "contentType + base64 image data"
    }
    */
    profile.profile_pic = req.body.profile_pic;
    await profile.save();
    res.json({success: true, profile});
}

const createPost = async(req, res, _) => {
    //auth session
    const user = await get_user(req.cookies.session_id, req.cookies.user_id);
    if (!user) {res.json({success: false, invalid_session: true}); return;}
    //makes the post and inserts data
    const newPost = new model.Post();
    newPost.date = Date.now();
    newPost.user_ID = user._id;
    console.log(user._id);
    newPost.desc = req.body.desc;
    newPost.likes = 0;
    newPost.song_id = req.body.song_id;
    newPost.post_image = req.body.post_image;
    //saves post
    newPost.save();
    //gets the postID so we can save it to a separate db for specific users
    let postID = newPost._id;
    const PostCollection = model.userPostDB.model(user._id.toString(), model.PostPointer);
    const postPointer = new PostCollection({
        post_id: postID
    })
    res.json({success: true, message: await postPointer.save()});
}

async function findPost(postID) {
    let post = await model.Post.findById(postID);
    return post;
}

async function checkBlocked(userID, otherUserID) {
    //checks to see if person 1 blocked person 2 and vise versa, will return true if at least one person blocked another
    const firstColl = model.userBlockedDB.model(userID.toString(), model.userPointer);
    const secondColl = model.userBlockedDB.model(otherUserID.toString(), model.userPointer);
    const firstCheck = await firstColl.findOne({user_id: otherUserID});
    const secondCheck = await secondColl.findOne({user_id: userID});
    return (firstCheck != null || secondCheck != null);
}

const likePost = async(req, res, _) => {
    //auth session
    const user = await get_user(req.cookies.session_id, req.cookies.user_id);
    if (!user) {res.json({success: false, invalid_session: true}); return;}
    //finds the post and ends it if its not a real post
    let post = await findPost(req.body.post_id.toString());
    if (!post) {res.json({success: false, message: "post does not exist"}); return;}
    const likeCollection = model.userLikedDB.model(user._id.toString(), model.likesPointer);
    let pointer = await likeCollection.findOne({post_id: post._id});
    var likeOrDislike;
    if (pointer) {
        await likeCollection.deleteOne({post_id: post._id});
        post.likes = post.likes - 1;
        await post.save();
        likeOrDislike = "disliked";
    }
    else {
        const newLikePointer = new likeCollection({
            post_id: post._id
        })
        await newLikePointer.save();
        post.likes = post.likes + 1;
        await post.save();
        likeOrDislike = "liked";
    }
    res.json({success: true, status: likeOrDislike});
}

const blockUser = async(req, res , _) => {
    //auth sess
    const user = await get_user(req.cookies.session_id, req.cookies.user_id);
    if (!user) {res.json({success: false, invalid_session: true}); return;}
    //checks to see if the user being blocked exists
    const blockedUser = await model.User.findById(req.body.user_id);
    if (!blockedUser) {res.json({success: false, invalid_user: true}); return;}
    const blockedCollection = model.userBlockedDB.model(user._id.toString(), model.userPointer);
    const foundUser = await blockedCollection.findOne({user_id: req.body.user_id});
    if (!foundUser) {
        const newBlock = new blockedCollection({
            user_id: blockedUser._id
        })
        await newBlock.save();
        res.json({success: true, blocked: true, name: blockedUser.username});
    }
    else {
        await blockedCollection.deleteOne({user_id: req.body.user_id});
        res.json({success: true, unblocked: true, name: blockedUser.username});
    }
}

const followUser = async(req, res, _) => {
    //auth sess
    const user = await get_user(req.cookies.session_id, req.cookies.user_id);
    if (!user) {res.json({success: false, invalid_session: true}); return;}
    //find user and see if they exists
    const followedUser = await model.User.findById(req.body.user_id);
    if (!followedUser) {res.json({success: false, invalid_user: true}); return;}
    //make sure one doesnt block the other
    if(await checkBlocked(user._id, followedUser._id)) {res.json({success: false, blocked: true}); return;}
    //creates collection to add or remove the follow
    const followCollection = model.userFollowDB.model(user._id.toString(), model.userPointer);
    const foundUser = await followCollection.findOne({user_id: req.body.user_id});
    if (!foundUser) {
        const newFollow = new followCollection({
            user_id: followedUser._id
        })
        await newFollow.save();
        res.json({success: true, followed: true, name: followedUser.username});
    }
    else {
        await followCollection.deleteOne({user_id: req.body.user_id});
        res.json({success: true, unfollowed: true, name: followedUser.username});
    }
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
    getMessages: getMessages,
    deleteUser: deleteUser,
    editProfile: editProfile,
    getProfile: getProfile,
    createPost: createPost,
    likePost: likePost,
    blockUser: blockUser,
    followUser: followUser,
};
