// Imports -----------------------------
import {User, Profile} from '../model.js';
import {upload_image, upload_images, user_request} from '../lib.js';
// Export --------------------------------
export function add_requests(app){
    app.get('/user/profile/get', getProfile);
    app.put('/user/profile/edit', editProfile);
}
// given a user, gets the Profile document
export async function getProfileData(user) {
    let profile = await Profile.findById(user._id);
    if (profile==null) {return null};
    profile = await profile.getData();
    profile.username = user.username;
    profile.followed = user.followed;
    profile.blocked = user.blocked;
    profile.posts = user.posts;
    profile.liked = user.liked;
    return profile;
}
// Helper Methods ------------------------------
async function checkBlocked(userA, userB) {
    return userA.checkBlocked(userB._id) || userB.checkBlocked(userA._id);
}
// Requests ---------------------------------
// Gets the profile of a user. requires user: ObjectId
const getProfile = user_request(async(req, res, self) => {
    const user = await User.findById(req.query.user).catch((err) => {
       return null;
    });
    if (user == null) {res.json({success: false, invalid_user: true}); return;}
    //checks to see if user is blocked, if so will not send profile data
    if (await checkBlocked(user, self)) {res.json({success: false, blocked: true}); return;}
    // Gets/creates the profile
    let profile = getProfileData(user);
    if (profile == null) {res.json({success: false, not_created: true}); return;}
    // return profile
    res.json({success: true, profile: profile});
});
// Edit the users profile
const editProfile = user_request(async(req, res, user) => {
    //finds profile, if it doesn't exist it makes one
    let profile = await Profile.findById(user._id);
    if (profile == null) {profile = Profile.create_new(user._id);}
    // Overwrite profile data from body
    for (const key of Profile.get_standard_keys()){
        if (req.body[key] != null) {profile[key] = req.body[key];}
    }
    // Overwrite profile images
    if (req.body.photos != null) {profile.photos = await upload_images(req.body.photos);}
    if (req.body.profile_pic != null) {profile.profile_pic = await upload_image(req.body.profile_pic);}
    // Save the profile
    await profile.save();
    res.json({success: true});
});