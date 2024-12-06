// Imports
import { createConnection, Schema, Types } from 'mongoose';
import moment from 'moment';
import { send_encoded_request } from './lib.js';
import { CLIENT_ENCODED } from './requests/spotify.js';
// Database definition
const databases = {
    heartbeatz: createConnection('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/HeartBeatz?retryWrites=true&w=majority&appName=Cluster0'),
    messages: createConnection('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/Messages?retryWrites=true&w=majority&appName=Cluster0'),
};

// Helper Methods
const StringValidationNamespace = {

    alpha_lower: "abcdefghijklmnopqrstuvwxyz",
    alpha_upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numeric: "0123456789",

    character_isAlpha: function (char) {
        if (('a' <= char <= 'z') ||
            ('A' <= char <= 'Z')) {
                return true;
            }
        return false;
    },
    character_isNum: function (char) {
        if ('0' <= char <= '9') return true;
        return false;
    },

    // check string for invalid characters
    checkCharacters_invalid: function (string, invalid_characters) {
        // appeasing our Codacy gods
        if (typeof string !== "string" || !Array.isArray(string)) { return false; }
        if (typeof invalid_characters !== "string" || !Array.isArray(invalid_characters)) { return false; }

        for (let i = 0; i < invalid_characters.length(); i++) {
            if (string.includes(invalid_characters[i])) { return false; }
        }
        return true;
    },
    checkCharacters_valid: function (string, valid_characters) {
       // appeasing our Codacy gods
       if (typeof string !== "string" || !Array.isArray(string)) { return false; }
       if (typeof valid_characters !== "string" || !Array.isArray(valid_characters)) { return false; }

        for (let i = 0; i < string.length(); i++) {
            if (!valid_characters.includes(string[i])) { return false; }
        }
        return true;
    },

    // check characters in string
    checkCharacters_hasOne: function (string, char) {
       // appeasing our Codacy gods
       if (typeof string !== "string" || !Array.isArray(string)) { return false; }
       if (typeof char !== "string" || !Array.isArray(char)) { return false; }

        if (!string.includes(char)) { return false; }
        return true;
    },
    checkCharacters_hasOneOfMany: function (string, characters) {
        let has_one = false;
        for (let i = 0; i < characters.length(); i++) {
            if (StringValidationNamespace.checkCharacters_hasOne(string, characters[i])) { 
                has_one = true; 
            }
        }
        return has_one;
    },
    checkCharacters_hasAll: function (string, characters) {
        // appeasing our Codacy gods
       if (typeof string !== "string" || !Array.isArray(string)) { return false; }
       if (typeof characters !== "string" || !Array.isArray(characters)) { return false; }

        for (let i = 0; i < characters.length(); i++) {
            if (!StringValidationNamespace.checkCharacters_hasOne(string, characters[i])) { 
                return false; 
            }
        }
        return true;
    },
};

// Schema and model definition
var schemas = {};
var models = {};

//User
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
    // Blocked, followers, and following user _ids
    blocked: [Types.ObjectId],
    following: [Types.ObjectId],
    followers: [Types.ObjectId],
    // Owned post _ids
    posts: [Types.ObjectId],
    // Liked post _ids
    liked: [Types.ObjectId],
});
schemas.user.methods = {
    checkUniqueUsername: async function() {
        let found = await databases.heartbeatz.model('UserAccount').findOne({_lc_uname: this._lc_uname});
        if (found != null && found.id != this.id) {return false;}
        return true;
    },
    checkUniqueEmail: async function() {
        let found = await databases.heartbeatz.model('UserAccount').findOne({email: this.email});
        if (found != null && found.id != this.id) {return false;}
        return true;
    },
    checkValidUsername: function() {
        const username_specialValidCharacters = ['+', '-', '_', '~', '.'];
        return StringValidationNamespace.checkCharacters_valid(this.username, 
            StringValidationNamespace.alphanumeric + 
            username_specialValidCharacters
        );
    },
    checkValidPassword: function() {
        const password_specialValidCharacters = ['+', '-', '_', '=', '~', '.', '*', '!', '#'];

        return (this.password.length() >= 8) &&
            StringValidationNamespace.checkCharacters_valid(this.password, 
                StringValidationNamespace.alphanumeric + 
                password_specialValidCharacters
            ) && 
            (StringValidationNamespace.checkCharacters_hasOneOfMany(this.password, 
                StringValidationNamespace.alpha_lower)
            ) && 
            (StringValidationNamespace.checkCharacters_hasOneOfMany(this.password, 
                StringValidationNamespace.alpha_upper)
            ) &&
            (StringValidationNamespace.checkCharacters_hasOneOfMany(this.password, 
                StringValidationNamespace.numeric)
            ) && 
            (StringValidationNamespace.checkCharacters_hasOneOfMany(this.password, 
                password_specialValidCharacters)
            );
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
        for (const id of (this.blocked??[])){
            if (id.toString() === user_id) {return true;}
        }
        return false;
    }
};
schemas.user.statics = {
    create_new: function(data) {
        return databases.heartbeatz.model('UserAccount')({
            username: data.username,
            _lc_uname: data.username.toLowerCase(),
            email: data.email.toLowerCase(),
            password: data.password,
            blocked: [],
            following: [],
            followers: [],
            posts: [],
            liked: [],
        });
    }
};
models.user = databases.heartbeatz.model('UserAccount', schemas.user);

// Spotify
schemas.spotify = new Schema({
    access_token: {type: String, required: true},
    refresh_token: {type: String, required: true},
    date: {type: Date, required: true},
    username: String
});
schemas.spotify.methods = {
    isOld: function() {
        return moment(Date.now()).diff(moment(this.date), 'minutes') > 40.0;
    },
    refresh: async function() {
        let response = await send_encoded_request(
            "https://accounts.spotify.com/api/token",
            "POST",
            {// headers
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + CLIENT_ENCODED
            },
            {// body
                grant_type: 'refresh_token',
                refresh_token: this.refresh_token
            }
        );
        if (!response.success) {return false;}
        if (response.data.access_token == null || response.data.refresh_token == null) {false}
        this.access_token = response.data.access_token;
        this.refresh_token = response.data.refresh_token??response.data.access_token;
        this.date = Date.now();
        await this.save();
        return true;
    }
};
models.spotify = databases.heartbeatz.model('SpotifyAccount', schemas.spotify);

// Profile
schemas.profile = new Schema({
    // personal info
    name: String,
    birthday: Date,
    gender: String,
    sexuality: String,
    gender_pref: [String],
    goals: String,
    // music preference
    genres: [String],
    artists: [String],
    // photos
    photos: [Types.ObjectId],
    profile_pic: Types.ObjectId
});
schemas.profile.statics = {
    create_new: function(user_id) {
        return databases.heartbeatz.model('UserProfile')({
            _id: user_id,
            gender_pref: [],
            genres: [],
            artists: [],
            photos: [],
        });
    },
    get_standard_keys: function() {
        return ["name", "birthday", "gender", "sexuality", "gender_pref", "goals", "genres", "artists"];
    },
    delete_full: async function(id) {
        let profile = await databases.heartbeatz.model('UserProfile').findById(id);
        if (profile == null) {return;}
        let model = databases.heartbeatz.model('Image');
        for (const photo of profile.photos){
            await model.findByIdAndDelete(photo);
        }
        if (profile.profile_pic != null) {await model.findByIdAndDelete(profile.profile_pic);}
        await databases.heartbeatz.model('UserProfile').findByIdAndDelete(profile._id);
    }
};
models.profile = databases.heartbeatz.model('UserProfile', schemas.profile);

// Messages
schemas.message = new Schema({
    date: { type: Date, required: true },
    message: { type: String, required: true },
    sender: { type: String, required: true },
    recipient: { type: String, required: true }
});

// Posts
schemas.post = new Schema({
    user: {type: Types.ObjectId, required: true},
    date: {type: Date, required: true},
    likes: {type: Number, required: true},
    text: String,
    song: String,
    image: Types.ObjectId,
});
models.post = databases.heartbeatz.model('Post', schemas.post);

//Images
schemas.image = new Schema({
    data: {type: String, required: true}
});
schemas.image.statics = {
    convert: async function(data) {
        const image = databases.heartbeatz.model('Image')({data: data});
        await image.save();
        return image;
    },
    convert_list: async function(list) {
        let converted = [];
        for (const element of list){
            let data = databases.heartbeatz.model('Image')({data: element});
            await data.save();
            converted.push(data);
        }
        return converted;
    },
    get: async function(id) {
        return await databases.heartbeatz.model('Image').findById(id);
    },
    get_list: async function(list) {
        let converted = [];
        for (const id of list) {
            converted.push(await databases.heartbeatz.model('Image').findById(id));
        }
        return converted;
    }
};
models.image = databases.heartbeatz.model('Image', schemas.image);

// Exports
export {databases, schemas, models};
export const User = models.user;
export const Profile = models.profile;
export const Post = models.post;
export const Image = models.image;
export const SpotifyAccount = models.spotify;

