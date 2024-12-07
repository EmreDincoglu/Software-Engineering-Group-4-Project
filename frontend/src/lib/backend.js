import { sendRequest } from "./default";
/**
 * Authentication Requests
 */
// Logs in the user using the userData
export async function loginUser(username, password) {
    return await sendRequest({
        url: 'http://localhost:5000/session/create',
        method: 'POST',
        credentials: true,
        body: {username: username, password: password},
        fail_conds: [
            [{invalid_user: true}, "Invalid User"],
            [{invalid_password: true}, "Incorrect Password"],
        ],
        desired_data: false
    });
}
// Logs out the user. Does not require being logged in
export async function logoutUser(){
    return await sendRequest({
        url: 'http://localhost:5000/session/end',
        method: 'GET',
        credentials: true,
        body: null,
        fail_conds: [],
        desired_data: false
    });
}
/**
 * Profile Requests
 */
// Gets a specific user profile. returns {success: true, profile} or {success:false, fail_message}
export async function getProfile(user_id) {
    let result = await sendRequest({
        url: "http://localhost:5000/user/profile/get?user=" + user_id,
        method: 'GET',
        credentials: true,
        fail_conds: [
            [{success: false, invalid_session: true}, "INVALID_SESSION"],
            [{success: false, invalid_user: true}, "INVALID_USER"],
            [{success: false, blocked: true}, "BLOCKED"],
        ],
        desired_data: "profile"
    });
    return {success: result.success, fail_state: result.fail_message, profile: result.data};
}
// updates the users profile using profile_data
export async function updateProfile(profile_data) {
    let result = await sendRequest({
        url: 'http://localhost:5000/user/profile/edit',
        method: 'PUT',
        credentials: true,
        body: profile_data,
        fail_conds: [
            [{success: false, invalid_session: true}, "Invalid Session"],
        ],
        desired_data: false
    });
    return {success: result.success, fail_state: result.fail_message};
}
/**
 * Post Requests
 */
export async function createPost(text, image, song) {
    return await sendRequest({
        url: 'http://localhost:5000/post/create',
        method: 'POST',
        credentials: true,
        body: {text: text, image: image, song: song},
        fail_conds: [
            [{success: false, invalid_session: true}, "Invalid Session"],
        ],
        desired_data: false
    });
}
export async function likePost(post_id){
    return await sendRequest({
        url: 'http://localhost:5000/post/like',
        method: 'POST',
        credentials: true,
        body: {post_id: post_id},
        fail_conds: [
            [{success: false, invalid_session: true}, "Invalid Session"],
            [{success: false, post_not_found: true}, "Post not Found"]
        ],
        desired_data: null
    });
}
// Returns a post from a post id
export async function getPost(post_id){
    let result = await sendRequest({
        url: `http://localhost:5000/post/get?post=${encodeURIComponent(post_id)}`,
        method: 'GET',
        credentials: true,
        fail_conds: [
            [{success: false, invalid_session: true}, "Invalid Session"],
            [{success: false, invalid_post: true}, "Post not found"],
            [{success: false, invalid_poster: true}, "Poster not found"],
            [{success: false, blocked: true}, "Blocked User"]
        ],
        desired_data: "post"
    });
    return {success: result.success, fail_state: result.fail_message, post: result.data};
}
// Returns a lsit of post ids sorted by date
export async function getPostList(){
    let result = await sendRequest({
        url: `http://localhost:5000/post/getAll`,
        method: 'GET',
        credentials: true,
        fail_conds: [
            [{success: false, invalid_session: true}, "Invalid Session"],
        ],
        desired_data: "posts"
    });
    return {success: result.success, fail_state: result.fail_message, posts: result.data};
}
/**
 * Messages
 */
export async function getMessages(user_id){
    return await sendRequest({
        url: `http://localhost:5000/message/get?user=${encodeURIComponent(user_id)}`,
        method: 'GET',
        credentials: true,
        fail_conds: [
            [{success: false, invalid_session: true}, "Invalid Session"],
            [{success: false, invalid_recipient: true}, "Invalid Recipient"],
            [{success: false, blocked: true}, "Blocked User"],
        ],
        desired_data: "messages"
    });
}
export async function sendMessage(recipient, message){
    return await sendRequest({
        url: `http://localhost:5000/message/send`,
        method: 'POST',
        credentials: true,
        body: {recipient: recipient, message: message},
        fail_conds: [
            [{success: false, invalid_session: true}, "Invalid Session"],
            [{success: false, invalid_recipient: true}, "Invalid Recipient"],
            [{success: false, blocked: true}, "Blocked User"],
        ],
        desired_data: false
    });
}
/**
 * Image
 */
export async function getImage(image){
    return await sendRequest({
        url: `http://localhost:5000/image/get?image=${encodeURIComponent(image)}`,
        method: 'GET',
        credentials: true,
        fail_conds: [
            [{success: false, invalid_session: true}, "Invalid Session"],
            [{success: false, invalid_image: true}, "Image not found"],
        ],
        desired_data: "image"
    });
}