// Imports -----------------------------
import {Post, User} from '../model.js';
import {upload_image, user_request} from '../lib.js';
// Export --------------------------------
export function add_requests(app){
    app.post('/post/create', createPost);
    //likePost and block user are like a switch, if you call likePost and its already liked it will unlike it and vise versa
    app.post('/post/like', likePost);
    app.get('/post/get', getPost);
    app.get('/post/getAll', getAllPosts);
}
// Helper Methods ------------------------------
async function checkBlocked(userA, userB) {
    return userA.checkBlocked(userB._id) || userB.checkBlocked(userA._id);
}
// Requests ---------------------------------
// Create a post. uses desc: String, song_id: String, post_image: String
const createPost = user_request(async(req, res, user) => {
    //makes the post
    const newPost = new Post({
        user: user._id,
        date: Date.now(),
        likes: 0,
        text: req.body.text,
        song: req.body.song,
        image: await upload_image(req.body.image)
    });
    newPost.save();
    // Add newPost._id to the users posts list.   
    user.posts.push(newPost._id);
    user.save()
    res.json({success: true});
});
// Likes a post specified by post_id: ObjectId
const likePost = user_request(async(req, res, user) => {
    //finds the post and ends it if its not a real post
    let post = await Post.findById(req.body.post_id);
    if (!post) {res.json({success: false, post_not_found: true}); return;}
    // Add the post's _id to the users like posts list. Make it a toggle, so if it already is in the list, remove it.
    const index = user.liked.indexOf(post._id);
    var liked;
    if (index > -1) {
        user.liked.splice(index, 1);
        liked = false;
    }
    else {
        user.liked.push(post._id);
        liked = true;
    }
    await user.save();
    res.json({success: true, liked: liked});
    //res.json({success: true, liked: ?});
});
// Get a specific post. Requires user and poster not blocked. Post id in "post" query
const getPost = user_request(async (req, res, user) => {
    let post = await Post.findById(req.query.post);
    if (post == null) {res.json({success: false, invalid_post: true}); return;}
    let poster = await User.findById(post.user);
    if (poster == null) {res.json({success: false, invalid_poster: true}); return;}
    if (checkBlocked(user, poster)) {res.json({success: false, blocked: true}); return;}
    // get post image
    if (post.image != null) {
        post.image = await Image.findById(post.image);
        if (post.image != null) {post.image = post.image.data;}
        else {post.image = null;}
    }
    res.json({success: true, post: post});
});
// Returns sorted list of posts by posting date
const getAllPosts = user_request(async (req ,res) => {
    try{
        const posts = await Post.find().sort({date:-1});
        res.json({succes: true,posts});
    }catch{
        console.error("error fetching psots:", error);
        res.status(500).json({success: false, error: "Server error"});
    }
})
