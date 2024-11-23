// Imports -----------------------------
import {User, Profile} from '../model.js';
import {user_request} from '../lib.js';
// Export --------------------------------
export function add_requests(app){
    app.get('/user/profile/get', getProfile);
    app.put('/user/profile/edit', editProfile);
}
// Helper Methods ------------------------------
async function checkBlocked(userA, userB) {
    return userA.checkBlocked(userB._id) || userB.checkBlocked(userA._id);
}
// Returns obj with only the entries specified by keys
function getSubset(obj, keys) {
    return keys.reduce((acc, key) => {
        if (obj.hasOwnProperty(key)) {
            acc[key] = obj[key];
        }
        return acc;
    }, {});
}
// Requests ---------------------------------
// Gets the profile of a user, creating a blank one if it has not already been created.
// uses user_id to decide which profile to return
const getProfile = user_request(async(req, res, self) => {
    /*
    finds profile, if it doesn't exist, makes one automatically only if the user does exist.
    (this allows us to get null data from a profile, for instance if someone hasnt edited their profile but we know their user
    exists, then it will just send back an empty profile of data that will be filled in eventually)
    */
    const user = await User.findById(req.body.user_id);
    if (!user) {res.json({success: false, invalid_user: true}); return;}
    //checks to see if user is blocked, if so will not send profile data
    if (await checkBlocked(user, self)) {res.json({success: false, blocked: true}); return;}
    // Gets/creates the profile
    let profile = await Profile.findOne({user_id: req.body.user_id});
    if (!profile) {
        profile = Profile.create_new();
        await profile.save();
    }
    res.json({success: true, profile: profile});
});
// Edit the users profile
const editProfile = user_request(async(req, res, user) => {
    //finds profile, if it doesn't exist it makes one
    let profile = await Profile.findOne({user_id: user._id});
    if (!profile) {profile = Profile.create_new(user._id);}
    // get the profile data from the body
    const data = getSubset(req.body, [
        "pref_name", "age", "birthday", "gender", "sexual_orientation",
        "gender_preference", "relationship_goals", "favorite_genres",
        "favorite_artists", "photos", "profile_pic"
    ]);
    // overwrite profile entries with data
    profile = {...profile, ...data};
    await profile.save();
    res.json({success: true, profile: profile});
});