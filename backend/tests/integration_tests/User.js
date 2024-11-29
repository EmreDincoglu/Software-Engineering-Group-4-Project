import sinon from "sinon";
import { expect } from "chai";
import express from "express";
import request from "supertest-as-promised";
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
const { json } = bodyParser;

import { mock_Connection } from "../Mocks/mock_Connection.js";
import { mock_Schema } from "../Mocks/mock_Schema.js";  
import mongoose from "mongoose";



const mongoose_stubs = {
    createConnection: function (...args) {
        return new mock_Connection();
    },
    Schema: function () {
        return mock_Schema;
    }
}

sinon.replace(mongoose, 'createConnection', mongoose_stubs.createConnection);
sinon.replace(mongoose, 'Schema', mongoose_stubs.Schema());

const { add_requests } = await import('../../requests/default.js');

describe('createUser', () => {
    let app;

    before(() => {
        app = express();
        app.use(json());
        app.use(cookieParser());

        add_requests(app);
    });

    it('creating a user [success]', async () => {

        let req = {
            username: 'user1',
            password: 'password',
            email: 'user1@email'
        };
        const resp = (await request(app).post('/user/create').send(req));
        expect(resp.body.success).to.be.true;
        expect(resp.body.duplicate_email).to.be.false;
        expect(resp.body.duplicate_username).to.be.false;
    });

    it('creating a user [unsuccess]', async () => {
        let req1 = {
            username: 'user2',
            password: 'password',
            email: 'user2@email'
        };
        let req2 = {
            username: 'user2',
            password: 'password',
            email: 'user_@email'
        };
        let req3 = {
            username: 'user_',
            password: 'password',
            email: 'user2@email'
        };
        let req4 = {
            username: 'user2',
            password: 'password',
            email: 'user2@email'
        };
       
        const resp1 = await request(app).post('/user/create').send(req1);
        expect(resp1.body.success).to.be.true;
        expect(resp1.body.duplicate_email).to.be.false;
        expect(resp1.body.duplicate_username).to.be.false;

        const resp2 = await request(app).post('/user/create').send(req2);
        expect(resp2.body.success).to.be.false;
        expect(resp2.body.duplicate_email).to.be.false;
        expect(resp2.body.duplicate_username).to.be.true;

        const resp3 = await request(app).post('/user/create').send(req3);
        expect(resp3.body.success).to.be.false;
        expect(resp3.body.duplicate_email).to.be.true;
        expect(resp3.body.duplicate_username).to.be.false;

        const resp4 = await request(app).post('/user/create').send(req4);
        expect(resp4.body.success).to.be.false;
        expect(resp4.body.duplicate_email).to.be.true;
        expect(resp4.body.duplicate_username).to.be.true;
    });

    after(async () => {
        sinon.restore();
    });
});