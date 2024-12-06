// Imports -----------------------------
import {Post, User, Image} from '../model.js';
import {upload_image, user_request} from '../lib.js';
import multer from 'multer';
import { mongo } from 'mongoose';
const upload = multer({ storage: multer.memoryStorage() })
// Export --------------------------------
export function add_requests(app){
    app.post('/post/create', upload.single('image'), createPost);
    //likePost and block user are like a switch, if you call likePost and its already liked it will unlike it and vise versa
    app.post('/post/like', likePost);
    app.get('/post/get', getPost);
    app.get('/post/getAll', getAllPosts);
    app.get('/post/getPostStream', getPostStream);
}
// Helper Methods ------------------------------
async function checkBlocked(userA, userB) {
    return userA.checkBlocked(userB._id) || userB.checkBlocked(userA._id);
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
    let post = await Post.findById(req.query.post).populate('image');
    if (post == null) {res.json({success: false, invalid_post: true}); return;}
    let poster = await User.findById(post.user);
    if (poster == null) {res.json({success: false, invalid_poster: true}); return;}
    if (checkBlocked(user, poster)) {res.json({success: false, blocked: true}); return;}
    // get post image
    if (post.image != null) {
        post.image = post.image.data.toString('base64');
    }else {post.image = null;}
    res.json({success: true, post: post});
});
// Returns sorted list of posts by posting date
const getAllPosts = user_request(async (req ,res) => {
    try{
        const posts = await Post.find().sort({date:-1});

        const recentposts = await Promise.all(
            posts.map(async (post) => {
                const postObj = post.toObject();
                if (post.image){
                    const imageDoc = await Image.findById(post.image);
                    postObj.image = imageDoc ? imageDoc.data : null;
                }
                return postObj;
            })
        )
        res.json({success: true,posts: recentposts});
        console.log(posts.text);
    }catch(error){
        console.error("error fetching posts:", error);
        res.status(500).json({success: false, error: "Server error"});
    }
})
//send -1 to start at the beginning of the feed, and youll get the 3 latest posts 
//will also return a position number so you can send in that value next time to get the next 3
//was gonna add blocking but we hit the rate limit so its gonna be hard to test when it takes 2 minutes to recieve 10 megs
const getPostStream = user_request(async (req, res, user) => {
    const posts = [];
    let total = req.body.position;
    try{
        if (total == -1) {
            total = await Post.countDocuments({});
        }
        console.log(total);
        while (posts.length < 3) {
            const post = await Post.findOne().skip(total-1);
            const postObj = post.toObject();
            if (post.image) {
                const imageData = await Image.findById(post.image);
                postObj.image = imageData ? imageData.data : null;
            }
            posts.push(postObj);
            total--;
            if (total < 0) break;
        }
    }catch(error){
        console.error("error fetching posts:", error);
        res.status(500).json({success: false, error: "Server error"});
    }
    res.json({success: true, posts: posts, position: total});
})
