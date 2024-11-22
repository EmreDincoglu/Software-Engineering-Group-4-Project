// Imports
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
const {json} = bodyParser;
import { add_requests } from './requests/default.js';
// App Setup
const app = express();
app.use(json());
app.use(cookieParser());
app.use(cors({origin: ['http://localhost:3000', 'http://localhost:3000/login', 'http://localhost:3000/home'], credentials: true}));
// Http request setup
add_requests(app);
// App start
app.listen(5000, () => {
    console.log(`Express server listening on port 5000`)
});