import {Image, User} from './model.js';
// Does a fetch request, returns {success: bool, ...}
// If successful, returns a body parameter, if not returns a couple of failure state
export async function send_request(url, method, headers, body) {
    try {
        let response = await fetch(url, {
            method: method,
            headers: headers,
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            return {success: false, fail_message: "HTTP Error: " + response.statusText};
        }
        let data = await response.json();
        if (!data) {return {success: false, fail_message: "Invalid response body"};}
        return {success: true, data: data};
    } catch(err) {
        return {success: false, fail_message: "Fetch request panicked"};
    }
}
// Does a fetch request, returns {success: bool, ...}
// If successful, returns a body parameter, if not returns a couple of failure state
export async function send_encoded_request(url, method, headers, body) {
    try {
        let response = await fetch(url, {
            method: method,
            headers: headers,
            body: new URLSearchParams(body)
        });
        if (!response.ok) {
            return {success: false, fail_message: "HTTP Error: " + response.statusText};
        }
        let data = await response.json();
        if (!data) {return {success: false, fail_message: "Invalid response body"};}
        return {success: true, data: data};
    } catch(err) {
        return {success: false, fail_message: "Fetch request panicked"};
    }
}
// returns the user, authenticating the session as well
export async function get_user(session_id, user_id) {
    const user = await User.findById(user_id).findOne();
    if (user == null) {return;}
    if (!await user.authSession(session_id)) {return;}
    return user;
}
// Wraps a method into a user request, which automatically authenticates a session and passes the user to the wrapped function
export function user_request(method) {
    return async (req, res) => {
        let user = await get_user(req.cookies.session_id, req.cookies.user_id);
        if (user == null) {res.json({success: false, invalid_session: true}); return;}
        return await method(req, res, user);
    };
}
// given image data, creates a new image document and returns the id, null if no data is passed in
export async function upload_image(data) {
    if (data == null) {return null;}
    let image = await Image.convert(data);
    return image._id;
}
// Given a list of image data, returns a list of Image document id's
export async function upload_images(list) {
    let images = await Image.convert_list(list);
    return images.map((image) => image._id);
}
// Given an image document id, return the image data
export async function download_image(id) {
    if (id == null) {return null;}
    let img = await Image.get(id);
    if (img == null) {return null;}
    return img.data;
}
// Given a list of image document ids, returns a list of image data
export async function download_images(list) {
    let data = [];
    let images = await Image.get_list(list);
    for(const img of images){
        if (img != null) {data.push(img.data);}
    }
    return data;
}