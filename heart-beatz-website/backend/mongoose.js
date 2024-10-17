const mongoose =  require('mongoose');

const userAccount = require('./models/User');
const message = require('./models/Messages');

const userdatabase = mongoose.createConnection('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/HeartBeatz?retryWrites=true&w=majority&appName=Cluster0');

const messageDatabase = mongoose.createConnection('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/Messages?retryWrites=true&w=majority&appName=Cluster0');

const userModel = userdatabase.model('useraccounts', userAccount);


async function checkUsername(username) {
    const user = await userModel.findOne({username: username});
    console.log(user);
    if (user) {
        return true;
    }
    return false;
}

async function checkEmail(email) {
    const user = await userModel.findOne({email: email});
    console.log(user);
    if (user) {
        return true;
    }
    return false;
}

const createUser = async (req, res, next) => {
    
    const createdUser = new userModel({
        username: req.body.username.toLowerCase(),
        password: req.body.password,
        email: req.body.email.toLowerCase(),
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        age: req.body.age
    });

    const dupeUsername = await checkUsername(createdUser.username);
    const dupeEmail = await checkEmail(createdUser.email);
    let result;
    console.log(dupeUsername, dupeEmail);
    if (!dupeUsername && !dupeEmail) {
        result = await createdUser.save();
    }
    else {
        if (dupeUsername && dupeEmail) {
            result = "Username and Email in use.";
        }
        else if (dupeUsername) {
            result = "Username in use.";
        }
        else {
            result = "Email in use.";
        }
    }
    res.json(result);
}

const sendMessage = async (req, res, next) => {

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

exports.createUser = createUser;
exports.sendMessage = sendMessage;
