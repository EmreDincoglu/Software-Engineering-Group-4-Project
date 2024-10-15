const mongoose =  require('mongoose');

const userAccount = require('./models/User');

mongoose.connect('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/HeartBeatz?retryWrites=true&w=majority&appName=Cluster0'
).then(() => {
    console.log('Connected to database')
}).catch(() => {
    console.log('Connection failed')
})

async function checkUsername(username) {
    const users = mongoose.model('userAccount', userAccount.schema);
    const user = await users.findOne({username: username});
    if (user) {
        return "Username is already in use.";
    }
    return null;
}

async function checkEmail(email) {
    const users = mongoose.model('userAccount', userAccount.schema);
    const user = await users.findOne({email: email});
    if (user) {
        return "Email is already in use.";
    }
    return null;
}

const createUser = async (req, res, next) => {
    
    const createdUser = new userAccount({
        username: req.body.username.toLowerCase(),
        password: req.body.password,
        email: req.body.email.toLowerCase()
    });

    const dupeUsername = await checkUsername(createdUser.username);
    const dupeEmail = await checkEmail(createdUser.email);
    console.log(dupeUsername, dupeEmail);
    let result;

    if (dupeUsername === null && dupeEmail === null) {
        console.log("reached")
        result = await createdUser.save();
    }
    else {
        if (dupeUsername && dupeEmail) {
            result = "Username and Email in use.";
        }
        else if (dupeUsername) {
            result = dupeUsername;
        }
        else {
            result = dupeEmail;
        }
    }
    res.json(result);
}

exports.createUser = createUser;
