// Imports
import { createConnection, Schema, Types } from 'mongoose';
import moment from 'moment';
// Database definition
const databases = {
    users: createConnection('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/HeartBeatz?retryWrites=true&w=majority&appName=Cluster0'),
    messages: createConnection('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/Messages?retryWrites=true&w=majority&appName=Cluster0'),
    posts: createConnection('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/userPosts?retryWrites=true&w=majority&appName=Cluster0'),
    liked: createConnection('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/userLiked?retryWrites=true&w=majority&appName=Cluster0'),
    blocked: createConnection('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/userBlocked?retryWrites=true&w=majority&appName=Cluster0'),
    follows: createConnection('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/userFriends?retryWrites=true&w=majority&appName=Cluster0')
};

// Schema and model definition
var schemas = {};
var models = {};

// Users
schemas.user = new Schema({
    username: { type: String, required: true},
    // lowercase version of username, used for uniqueness of usernames
    _lc_uname: {type: String, required: true},
    password: { type: String, required: true },
    email: { type: String, required: true},
    session: {
        sid: Number,
        date: Date,
    },
    // Blocked and followed user _ids
    blocked: [Types.ObjectId],
    followed: [Types.ObjectId],
    // Owned post _ids
    posts: [Types.ObjectId],
    // Liked post _ids
    liked: [Types.ObjectId],
});
schemas.user.methods = {
    checkUniqueUsername: async function() {
        let found = await databases.users.model('UserAccount').findOne({_lc_uname: this._lc_uname});
        if (found != null && found.id != this.id) {return false;}
        return true;
    },
    checkUniqueEmail: async function() {
        let found = await databases.users.model('UserAccount').findOne({email: this.email});
        if (found != null && found.id != this.id) {return false;}
        return true;
    },
    generateSession: async function(res) {
        this.session.sid = Math.floor(Math.random() * 10000000);
        this.session.date = Date.now();
        await this.save();
        res.cookie('session_id', this.session.sid);
        res.cookie('user_id', this.id);
    },
    authSession: async function(session_id) {
        if (this.session.sid != session_id) {return false;}
        //delete old sessions
        if(moment(Date.now()).diff(moment(this.session.date), 'days') > 1.0){
            this.session.sid = null;
            this.session.date = null;
            await this.save();
            return false;
        }
        await this.save();
        return true;
    },
    // Determines if this user has blocked user_id
    checkBlocked: async function(user_id) {
        return (this.blocked??[]).includes(user_id);
    }
};
schemas.user.statics = {
    create_new: function(data) {
        return databases.users.model('UserAccount')({
            username: data.username,
            _lc_uname: data.username.toLowerCase(),
            email: data.email.toLowerCase(),
            password: data.password,
            blocked: [],
            followed: [],
            posts: [],
            liked: [],
        });
    }
};
models.user = databases.users.model('UserAccount', schemas.user);

// Spotify
schemas.spotify = new Schema({
    user: {type: Types.ObjectId, required: true},
    access_token: {type: String, required: true},
    refresh_token: {type: String, required: true},
    date: {type: Date, required: true},
});
models.spotify = databases.users.model('SpotifyAccount', schemas.spotify);

// Profile
schemas.profile = new Schema({
    user_id: {type: Types.ObjectId, required: true},
    pref_name: String,
    age: Number,
    birthday: Date,
    gender: String,
    sexual_orientation: String,
    gender_preference: [String],
    relationship_goals: String,
    favorite_genres: [String],
    favorite_artists: [String],
    photos: [String],
    profile_pic: String
});
schemas.profile.statics = {
    create_new: function(user_id) {
        return databases.users.model('UserProfile').new({
            user_id: user_id,
            gender_preference: [],
            favorite_genres: [],
            favorite_artists: [],
            photos: [],
        });
    }
};
models.profile = databases.users.model('UserProfile', schemas.profile);

// Messages
schemas.message = new Schema({
    date: { type: Date, required: true },
    message: { type: String, required: true },
    sender: { type: String, required: true },
    recipient: { type: String, required: true }
});

// Posts
schemas.post = new Schema({
    user_ID: {type: Types.ObjectId, required: true},
    date: {type: Date, required: true},
    likes: {type: Number, required: true},
    desc: String,
    song_id: String,
    post_image: String
});
models.post = databases.posts.model('Post', schemas.post);

// Exports
export {databases, schemas, models};
export const User = models.user;
export const Profile = models.profile;
export const Post = models.post;
export const SpotifyAccount = models.spotify;

