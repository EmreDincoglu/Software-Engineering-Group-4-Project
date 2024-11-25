// Imports -----------------------------
import {User, Profile} from '../model.js';
import {user_request} from '../lib.js';
// Export --------------------------------
export function add_requests(app){
    app.get('/user/profile/get', getProfile);
    app.put('/user/profile/edit', editProfile);
}
// given a user, gets the SpotifyAccount model from the db corresponding to it
export async function getProfileData(user) {
    return Profile.findOne({user: user._id});
}
// Helper Methods ------------------------------
async function checkBlocked(userA, userB) {
    return userA.checkBlocked(userB._id) || userB.checkBlocked(userA._id);
}
// Copies any keys from source into dest and returns dest.
function copySubset(dest, source, keys) {
    keys.forEach(key => {
        if (source.hasOwnProperty(key)) {
            dest[key] = source[key];
        }
    });
    return dest;
}
// Requests ---------------------------------
// Gets the profile of a user. requires user_id: ObjectId
const getProfile = user_request(async(req, res, self) => {
    /*
    finds profile, if it doesn't exist, makes one automatically only if the user does exist.
    (this allows us to get null data from a profile, for instance if someone hasnt edited their profile but we know their user
    exists, then it will just send back an empty profile of data that will be filled in eventually)
    */
    const user = await User.findById(req.body.user_id);
    if (user == null) {res.json({success: false, invalid_user: true}); return;}
    //checks to see if user is blocked, if so will not send profile data
    if (await checkBlocked(user, self)) {res.json({success: false, blocked: true}); return;}
    // Gets/creates the profile
    const profile = await Profile.findOne({user: req.body.user_id});
    if (profile == null) {res.json({success: false, not_created: true}); return;}
    res.json({success: true, profile: profile});
});
// Edit the users profile
const editProfile = user_request(async(req, res, user) => {
    //finds profile, if it doesn't exist it makes one
    let profile = await Profile.findOne({user: user._id});
    if (profile == null) {profile = Profile.create_new(user._id);}
    // get the profile data from the body and write into profile
    profile = copySubset(profile, req.body.data, [
        "pref_name", "birthday", "gender", "sexual_orientation",
        "gender_preference", "relationship_goals", "favorite_genres",
        "favorite_artists", "photos", "profile_pic"
    ]);
    await profile.save();
    res.json({success: true});
});