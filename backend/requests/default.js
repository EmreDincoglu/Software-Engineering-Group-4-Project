import { add_requests as add_user_requests } from './user.js';
import { add_requests as add_session_requests } from './session.js';
import { add_requests as add_spotify_requests } from './spotify.js';
import { add_requests as add_message_requests } from './message.js';
import { add_requests as add_posting_requests } from './post.js';
import { add_requests as add_profile_requests } from './profile.js';

export function add_requests(app){
    add_user_requests(app);
    add_session_requests(app);
    add_spotify_requests(app);
    add_message_requests(app);
    add_posting_requests(app);
    add_profile_requests(app);
}