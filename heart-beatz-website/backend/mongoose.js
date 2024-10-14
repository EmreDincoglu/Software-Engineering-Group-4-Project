const mongoose =  require('mongoose');

const userAccount = require('./models/User');

mongoose.connect('mongodb+srv://dincoglue:aT8C5J5D6Jw6wWfW@cluster0.e7oni.mongodb.net/HeartBeatz?retryWrites=true&w=majority&appName=Cluster0'
).then(() => {
    console.log('Connected to database')
}).catch(() => {
    console.log('Connection failed')
})

const createUser = async (req, res, next) => {
    
    const createdUser = new userAccount({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    });
    console.log(createdUser.username, createdUser.password, createdUser.email);
    
    const result = await createdUser.save();
    res.json(result);
}

exports.createUser = createUser;
