// Imports -----------------------------
import {User, databases, schemas} from '../model.js';
import {user_request} from '../lib.js';
// Export --------------------------------
export function add_requests(app){
    app.get('/message/get', getMessages);
    app.post('/message/send', sendMessage);
}
// Helper Methods ------------------------------
async function checkBlocked(userA, userB) {
    return userA.checkBlocked(userB._id.toString()) || userB.checkBlocked(userA._id.toString());
}
// Requests ---------------------------------
// Sends a message to a specified user
// Requires recipient: ObjectId and message: String
const sendMessage = user_request(async (req, res, user) => {
    // ensure recipient does actually exist
    const recipient = await User.findById(req.body.recipient);
    if (!recipient) {res.json({success: false, invalid_recipient: true}); return;}
    //check if users have blocked one another
    if(await checkBlocked(user, recipient)) {res.json({success: false, blocked: true}); return;}
    // get/create model for user->recipient message database
    let messageCollectionName;
    if (user._id < recipient._id) {messageCollectionName = user._id.toString() + ":" + recipient._id.toString();}
    else {messageCollectionName = recipient._id.toString() + ":" + user._id.toString();}
    const Message = databases.messages.model(messageCollectionName, schemas.message);
    // create new message
    const message = new Message({
        date: Date.now(),
        message: req.body.message,
        sender: user._id,
        recipient: recipient._id
    });
    // save message to db and return
    res.json({success: true, message: await message.save()});
});
// Gets the messages between the current user and recipient: ObjectId
const getMessages = user_request(async (req, res, user) => {
    // ensure recipient does actually exist
    const recipient = await User.findById(req.query.user);
    if (!recipient) {res.json({success: false, invalid_recipient: true}); return;}
    //check if users have blocked one another
    if(await checkBlocked(user, recipient)) {res.json({success: false, blocked: true}); return;}
    // get/create model for user->recipient message database
    let messageCollectionName;
    if (user._id < recipient._id) {messageCollectionName = user._id.toString() + ":" + recipient._id.toString();}
    else {messageCollectionName = recipient._id.toString() + ":" + user._id.toString();}
    //goes to the specific collection of the two users
    const Message = databases.messages.model(messageCollectionName, schemas.message);
    //collection.find without any parameters gets every value in that collection and put it in an array
    var msgArr = await Message.find();
    res.json({success: true, messages: msgArr});
});
