import { add_requests as add_user_requests } from './user.js';
import { add_requests as add_session_requests } from './session.js';
import { add_requests as add_spotify_requests } from './spotify.js';
import { add_requests as add_message_requests } from './message.js';
import { add_requests as add_posting_requests } from './post.js';
import { add_requests as add_profile_requests } from './profile.js';
import {Image} from '../model.js';
import { user_request } from '../lib.js';

export function add_requests(app){
    add_user_requests(app);
    add_session_requests(app);
    add_spotify_requests(app);
    add_message_requests(app);
    add_posting_requests(app);
    add_profile_requests(app);
    app.get('/image/get', getImage);
}

// Return client side user information for a logged in user
const getImage = user_request(async (req, res, _) => {
    try {
        let img = await Image.findById(req.query.image);
        if (img == null) {res.json({success: false, invalid_image: true}); return;}
        res.json({success: true, image: img.data});
    } catch(err) {
        res.json({success: false, invalid_body: true});
    }
});