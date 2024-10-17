/*
    Imports:
*/
const mongoose =  require('mongoose');
const userAccount = require('./models/User');
const message = require('./models/Messages');
/*
    Mongo setup
*/
const userdatabase = mongoose.createConnection('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/HeartBeatz?retryWrites=true&w=majority&appName=Cluster0');
const messageDatabase = mongoose.createConnection('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/Messages?retryWrites=true&w=majority&appName=Cluster0');

const userModel = userdatabase.model('useraccounts', userAccount);

/*
    Request Methods:
*/

async function checkUsername(username) {
    const user = await userModel.findOne({username: username});
    if (user) {
        console.log(`Username ${username} is in use by user: ${user}`);
        return true;
    }
    return false;
}

async function checkEmail(email) {
    const user = await userModel.findOne({email: email});
    if (user) {
        console.log(`Email ${email} is in use by user: ${user}`);
        return true;
    }
    return false;
}

const createUser = async (req, res, _) => {
    // parse input into a userModel object
    req.body.username = req.body.username.toLowerCase();
    req.body.email = req.body.email.toLowerCase();
    const createdUser = new userModel(req.body);
    // create return object and check for email and username uniqueness
    let resp_data = {success: true};
    if (await checkEmail(createdUser.email)) {resp_data.success = false; resp_data.duplicate_email = true;}
    if (await checkUsername(createdUser.email)) {resp_data.success = false; resp_data.duplicate_username = true;}
    // if username and email are unique, send the user to the database and add the user to the return object
    if (resp_data.success) {
        resp_data.user = await createdUser.save();
    }
    // return the data back to react
    res.json(resp_data);
}

const sendMessage = async (req, res, _) => {

    if (!await checkUsername(req.body.sender.toLowerCase()) || !await checkUsername(req.body.recipient.toLowerCase())) {
        res.json("User doesn't exist");
    }

    let messageChain
    if (req.body.sender < req.body.recipient) {
        messageChain = req.body.sender + " " + req.body.recipient;
    }
    else {
        messageChain = req.body.recipient + " " +  req.body.sender;
    }
    
    const now = new Date();

    const messageModel = messageDatabase.model(messageChain, message);

    const sentMessage = messageModel({
        date: now,
        message: req.body.message,
        sender: req.body.sender.toLowerCase(),
        recipient: req.body.recipient.toLowerCase()
    });

    result = await sentMessage.save();
    res.json(result);
}

/*
    Export Methods for server.js
*/

exports.createUser = createUser;
exports.sendMessage = sendMessage;
