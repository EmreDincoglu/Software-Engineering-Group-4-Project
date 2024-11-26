// Imports -----------------------------
import {Post} from '../model.js';
import {user_request} from '../lib.js';
// Export --------------------------------
export function add_requests(app){
    app.post('/post/create', createPost);
    //likePost and block user are like a switch, if you call likePost and its already liked it will unlike it and vise versa
    app.post('/post/like', likePost);
}
// Requests ---------------------------------
// Create a post. uses desc: String, song_id: String, post_image: String
const createPost = user_request(async(req, res, user) => {
    //makes the post
    const newPost = new Post({
        user_ID: user._id,
        date: Date.now(),
        likes: 0,
        desc: req.body.desc,
        song_id: req.body.song_id,
        post_image: req.body.post_image
    });
    newPost.save();
    // Add newPost._id to the users posts list.   

    res.json({success: true});
});
// Likes a post specified by post_id: ObjectId
const likePost = user_request(async(req, res, user) => {
    //finds the post and ends it if its not a real post
    let post = await Post.findById(req.body.post_id);
    if (!post) {res.json({success: false, post_not_found: true}); return;}
    // Add the post's _id to the users like posts list. Make it a toggle, so if it already is in the list, remove it.

    //res.json({success: true, liked: ?});
});