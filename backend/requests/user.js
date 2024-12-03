// Imports -----------------------------
import {Profile, SpotifyAccount, User} from '../model.js';
import {user_request} from '../lib.js';
import { getSpotifyData } from './spotify.js';
import { getProfileData } from './profile.js';
// Export --------------------------------
export function add_requests(app){
    //user
    app.post('/user/create', createUser);
    app.delete('/user/delete', deleteUser);
    app.get('/user/get', getUserData);
    app.put('/user/update', updateAccount);
    app.post('/user/block', blockUser);
    app.post('/user/follow', followUser);
    app.get('user/follower-following', getFollowersAndFollowing);
    app.post('/user/unfollow', unfollowUser);
}
// Helper Methods ------------------------------
async function checkBlocked(userA, userB) {
    return userA.checkBlocked(userB._id) || userB.checkBlocked(userA._id);
}
// Requests ---------------------------------
// Create a new user, returns the user if successful
// Requires username, email, password
const createUser = async (req, res) => {
    // Create the new user
    const newUser = User.create_new(req.body);
    // create return object and check for email and username uniqueness
    let resp_data = {};
    resp_data.duplicate_email = !(await newUser.checkUniqueEmail());
    resp_data.duplicate_username = !(await newUser.checkUniqueUsername());
    resp_data.success = !resp_data.duplicate_email && !resp_data.duplicate_username;
    if (!resp_data.success) {res.json(resp_data); return;}
    // put the user into the database. technically not required since generateSession also saves the user
    await newUser.save();
    // Create a login session for the user, stores cookies in res
    await newUser.generateSession(res);
    // return success
    res.send(resp_data);
};
// Deletes the logged in user
const deleteUser = user_request(async (req, res, user) => {
    // Remove user from db and reset the session cookies on the frontend
    let id = user._id;
    await User.deleteOne(user);
    await SpotifyAccount.findByIdAndDelete(id);
    await Profile.delete_full(id);
    // Could do a lot more here, but this is the bare minimum
    res.cookie('session_id', "", {maxAge: 1});
    res.cookie('user_id', "", {maxAge: 1});
    res.json({success: true});
});
// Return client side user information for a logged in user
const getUserData = user_request(async (_, res, user) => {
    const spotify_data = await getSpotifyData(user._id);
    let profile_data = await getProfileData(user);
    res.json({
        success: true, 
        user: {
            username: user.username, 
            email: user.email,
            password: user.password,
            spotify: spotify_data,
            profile: profile_data,
            followed: user.followed,
            blocked: user.blocked,
            posts: user.posts,
            liked: user.liked
        }
    });
});
// Updates attributes of a user account.
// Only updates username, email, and password
const updateAccount = user_request(async (req, res, user) => {
    // update values
    if (req.body.username != null) {
        user.username = req.body.username;
        user._lc_uname = req.body.username.toLowerCase();
    }
    if (req.body.email != null) {
        user.email = req.body.email.toLowerCase();
    }
    if (req.body.password != null) {
        user.password = req.body.password;
    }
    // check for uniqueness
    let resp = {duplicate_email: await user.checkUniqueEmail(), duplicate_username: await user.checkUniqueUsername()};
    resp.success = !resp.duplicate_email && !resp.duplicate_username;
    if (!resp.success) {res.json(resp); return;}
    // update user
    await user.save();
    res.json({success: true});
});
// Block a user specified by user_id
const blockUser = user_request(async(req, res, user) => {
    //checks to see if the user being blocked exists
    const blockedUser = await User.findById(req.body.user_id);
    if (!blockedUser) {res.json({success: false, invalid_user: true}); return;}
    // Block the user here. Maybe make it a toggle like the like post function?
    const index = user.blocked.indexOf(blockedUser._id);
    var blocked;
    if (index > -1){
        user.blocked.splice(index, 1);
        blocked = false;
    }
    else {
        user.blocked.push(blockedUser._id);
        blocked = true;
    }
    await user.save();
    res.json({success: true, blocked: blocked});
});
// Follow a user specified by user_id
const followUser = user_request(async(req, res, user) => {
    //find user and see if they exists
    const followedUser = await User.findById(req.body.user_id);
    if (!followedUser) {res.json({success: false, invalid_user: true}); return;}
    //make sure one doesnt block the other
    if(await checkBlocked(user, followedUser)) {res.json({success: false, blocked: true}); return;}
    // Follow the user here. Maybe make it a toggle like the like post function?
    if (!user.following.includes(followedUser._id)) {
        user.following.push(followedUser._id);
        followedUser.followers.push(user._id);
        await user.save();
        await followedUser.save();
        res.json({ success: true });
    } else {
        res.json({ success: false, already_following: true });
    }
});

const unfollowUser = user_request(async (req, res, user) => {
    const unfollowedUser = await User.findById(req.body.user_id);
    if (!unfollowedUser) { res.json({ success: false, invalid_user: true }); return; }

    // Remove from following and followers lists
    user.following = user.following.filter(id => !id.equals(unfollowedUser._id));
    unfollowedUser.followers = unfollowedUser.followers.filter(id => !id.equals(user._id));

    await user.save();
    await unfollowedUser.save();

    res.json({ success: true });
});

const getFollowersAndFollowing = user_request(async(req,res,user) => {
    try{
        const followers = await User.find({ _id: { $in: user.follows}})
        const following = await User.find({ _id: {$in:user.followed}})
        res.json({
            success: true,
            followers,
            following
        })
    }catch(error){
        console.error("error fetching conversations", error);
        res.status(500).json({success: false, error: "Server error"});
    }
});
