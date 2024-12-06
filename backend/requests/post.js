// Imports -----------------------------
import {Post, User, Image} from '../model.js';
import {upload_image, user_request} from '../lib.js';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() })
// Export --------------------------------
export function add_requests(app){
    app.post('/post/create', upload.single('image'), createPost);
    //likePost and block user are like a switch, if you call likePost and its already liked it will unlike it and vise versa
    app.post('/post/like', likePost);
    app.get('/post/get', getPost);
    app.get('/post/getAll', getAllPosts);
}
// Helper Methods ------------------------------
async function checkBlocked(userA, userB) {
    return userA.checkBlocked(userB._id.toString()) || userB.checkBlocked(userA._id.toString());
}
// Requests ---------------------------------
// Create a post. uses desc: String, song_id: String, post_image: String
const createPost = user_request(async(req, res, user) => {
    //handle image upload
    try {
        let imageId = null;
        if (req.file) {
            const base64String = req.file.buffer.toString('base64');
            imageId = await upload_image(base64String);
        }
        //makes the post
        const newPost = new Post({
            user: user._id,
            date: Date.now(),
            likes: 0,
            text: req.body.text,
            song: req.body.song_id,
            image: imageId,
        });
        // Add newPost._id to the users posts list.
        await newPost.save();
        user.posts.push(newPost._id);
        await user.save()
        res.json({success: true, post: newPost});
    }catch(error){
        console.error('Error creating post : ', error);
        res.status(500).json({success: false, error: "Server error"});
    }
});
// Likes a post specified by post_id: ObjectId
const likePost = user_request(async(req, res, user) => {
    //finds the post and ends it if its not a real post
    const post = await Post.findById(req.body.post_id);
    if (!post) {res.json({success: false, post_not_found: true}); return;}
    // Add the post's _id to the users like posts list. Make it a toggle, so if it already is in the list, remove it.
    const index = user.liked.indexOf(post._id);
    let liked;
    if (index > -1) {
        user.liked.splice(index, 1);
        post.likes -= 1;
        liked = false;
    }
    else {
        user.liked.push(post._id);
        post.likes += 1;
        liked = true;
    }
    await user.save();
    await post.save();
    res.json({success: true, liked: liked, likes: post.likes});
    //res.json({success: true, liked: ?});
});
// Get a specific post. Requires user and poster not blocked. Post id in "post" query
const getPost = user_request(async (req, res, user) => {
    // get post
    let post = await Post.findById(req.query.post);
    if (post == null) {res.json({success: false, invalid_post: true}); return;}
    // ensure poster has not blocked user
    let poster = await User.findById(post.user);
    if (poster == null) {res.json({success: false, invalid_poster: true}); return;}
    if (await checkBlocked(user, poster)) {res.json({success: false, blocked: true}); return;}
    // return post data
    res.json({success: true, post: {
        user: post.user,
        date: post.date,
        likes: post.likes,
        liked: poster.liked.includes(post._id),
        text: post.text??null,
        song: post.song??null,
        image: post.image??null,
    }});
});
// Returns sorted list of posts by posting date
const getAllPosts = user_request(async (_, res, user) => {
    const posts = await Post.find().sort({date:-1});
    let converted = [];
    for(const post of posts){
        let poster = await User.findById(post.user);
        if (poster==null) {continue;}
        if (await checkBlocked(poster, user)) {continue;}
        converted.push(post._id);
    }
    res.json({success: true, posts: converted});
})
