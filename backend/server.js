/*
    Imports:
*/

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongo = require('./mongoose.js');
const multer = require('multer');
const upload = multer({dest: 'uploads/'})
/*
    App Definition:
*/

const app = express();
const multer = require('multer');
const upload = multer({ dest: 'uploads/'});

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({origin: ['http://localhost:3000', 'http://localhost:3000/login', 'http://localhost:3000/home'], credentials: true}));

/*
    Request Definitions:
*/

app.get('/authSession', mongo.authSession);
app.get('/getUserData', mongo.getUserData);
app.get('/authSpotify', mongo.authSpotify);
app.get('/getMessages', mongo.getMessages);
app.get('/getProfile', mongo.getProfile);

app.post('/createUser', mongo.createUser);
app.post('/createSession', mongo.createSession);
app.post('/uploadSpotifyAuth', mongo.uploadSpotifyAuth);
app.post('/sendMessage', mongo.sendMessage);
app.post('/createPost', mongo.createPost);
//likePost and block user are like a switch, if you call likePost and its already liked it will unlike it and vise versa
app.post('/likePost', mongo.likePost);
app.post('/blockUser', mongo.blockUser);
app.post('/followUser', mongo.followUser);

app.delete('/deleteUser', mongo.deleteUser);

app.put('/endSession', mongo.endSession);
app.put('/editProfile', mongo.editProfile);
<<<<<<< Updated upstream
app.post('/uploadPhotos', upload.array('photos', 9),(req,res) => {
    try{
        const Ppath = req.files.map(file => file.path);
        res.status(200).json({ success: true, photos: Ppath});
    }catch (error){
        console.error('Error uploading photos:', error);
        res.status(500).json({ success: false, message: 'Photo upload failed'});
    }
=======
app.put('/uploadPhotos', upload.array('photos',9),(req,res)=>{
try{
    const photoPaths = req.files.map(file => file.path);
    res.status(200).json({success: true, photos: photoPaths});
}catch(error){
    console.log(error);
    res.status(500).json({ success: false, message: 'oopsie'})
}
>>>>>>> Stashed changes
})
app.put('/updateUser', mongo.updateUser)

/*
    App Start:
*/

app.listen(5000, () => {
    console.log(`Express server listening on port 5000`)
});
