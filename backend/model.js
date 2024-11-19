const mongoose = require('mongoose');
const moment = require('moment');

const userDatabase = mongoose.createConnection('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/HeartBeatz?retryWrites=true&w=majority&appName=Cluster0');
const messageDatabase = mongoose.createConnection('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/Messages?retryWrites=true&w=majority&appName=Cluster0');
const userPosts = mongoose.createConnection('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/userPosts?retryWrites=true&w=majority&appName=Cluster0');
const userLiked = mongoose.createConnection('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/userLiked?retryWrites=true&w=majority&appName=Cluster0');
const userBlocked = mongoose.createConnection('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/userBlocked?retryWrites=true&w=majority&appName=Cluster0');
const userFollows = mongoose.createConnection('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/userFriends?retryWrites=true&w=majority&appName=Cluster0');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true},
    // lowercase version of username, used for uniqueness of usernames
    _lc_uname: {type: String, required: true},
    password: { type: String, required: true },
    email: { type: String, required: true},
    first_name: String,
    last_name: String,
    age: Number,
    birthday: Date,
    spotify_token: String,
    session_id: Number,
    session_date: Date
});

userSchema.methods = {
    checkUniqueUsername: async function() {
        if (await userDatabase.model('UserAccount').findOne({_lc_uname: this._lc_uname})) {return false;}
        return true;
    },
    checkUniqueEmail: async function() {
        if (await userDatabase.model('UserAccount').findOne({email: this.email})) {return false;}
        return true;
    },
    generateSession: async function() {
        this.session_id = Math.floor(Math.random() * 10000000);
        this.session_date = Date.now();
        await this.save();
    },
    authSession: async function(session_id) {
        if (this.session_id != session_id) {return false;}
        // Delete old session
        let start = this.session_date;
        if (!start) {
            this.session_id = null;
            await this.save();
            return false;
        }
        if (moment(Date.now()).diff(moment(start), 'days') > 1.0) {
            this.session_id = null;
            this.session_date = null;
            await this.save();
            return false;
        }
        return true;
    }
};

const imageSchema = new mongoose.Schema({
    //data stores the actual image, and also stores the content type
    data: String
}) 

const messageSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    message: { type: String, required: true },
    sender: { type: String, required: true },
    recipient: { type: String, required: true }
});

const profileSchema = new mongoose.Schema({
    user_id: {type: mongoose.ObjectId, required: true},
    pref_name: String,
    age: Number,
    birthday: Date,
    gender: String,
    sexual_orientation: String,
    gender_preference: [String],
    relationship_goals: String,
    favorite_genres: [String],
    favorite_artists: [String],
    photos: [imageSchema],
    profile_pic: imageSchema

});

const postSchema = new mongoose.Schema({
    user_ID: {type: mongoose.ObjectId, required: true},
    date: {type: Date, required: true},
    desc: String,
    likes: {type: Number, required: true},
    song_id: String,
    post_image: imageSchema
});
//I just realized that these two schemas are duplicates and I had no reason in making both of them, I could have reused them
//for this project since were almost do
const userPostPointer = new mongoose.Schema({
    post_id: {type: mongoose.ObjectId, required: true}
})

const userLikedPointer = new mongoose.Schema({
    post_id: {type: mongoose.ObjectId, required: true}
})

const userPointer = new mongoose.Schema({
    user_id: {type: mongoose.ObjectId, required: true}
})


const ProfileModel = userDatabase.model('profileData', profileSchema);
const UserModel = userDatabase.model('UserAccount', userSchema);
const PostModel = userDatabase.model('postData', postSchema);

module.exports = {
    //models
    User: UserModel,
    Profile: ProfileModel,
    Post: PostModel,

    //databases
    messageDB: messageDatabase,
    userPostDB: userPosts,
    userLikedDB: userLiked,
    userBlockedDB: userBlocked,
    userFollowDB: userFollows,

    //schemas
    PostPointer: userPostPointer,
    messageSchema: messageSchema,
    likesPointer: userLikedPointer,
    userPointer: userPointer
};

