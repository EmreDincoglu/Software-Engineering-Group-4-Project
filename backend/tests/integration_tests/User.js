import sinon from "sinon";
import { expect } from "chai";
import request from "supertest-as-promised";
import express from "express";

import { mock_Connection } from "../Mocks/mock_Connection.js";
import { mock_Model_Generator } from "../Mocks/mock_Model.js";
import { mock_Collection } from "../Mocks/mock_Collection.js";
import { mock_Schema } from "../Mocks/mock_Schema.js";  

import mongoose from "mongoose";

describe('createUser', () => {
    let app;

    before(async () => {
        console.log(1);
        sinon.stub(mongoose, "createConnection").callsFake((...args) => {
            return new mock_Connection();
        });
        console.log(2);
        sinon.stub(mongoose, 'Schema').callsFake((...args) => {
            return new mock_Schema(...args);
        });
        console.log(3);
        const { add_requests } = await import("../../requests/default.js");

        app = express();
        
        add_requests(app);
    });

    it('creating a user [success]', async () => {
        let req = {}; req.body = {
            username: 'user1',
            password: 'password',
            email: 'user1@email'
        };
        
        const resp = await request(app).post('/createUser').send(req);
        expect(resp.data.success).to.be.true;
        expect(resp.data.duplicate_email).to.be.false;
        expect(resp.data.duplicate_username).to.be.false;
    });

    it('creating a user [unsuccess]', async () => {
        let req1 = {}; req1.body = {
            username: 'user2',
            password: 'password',
            email: 'user2@email'
        };
        let req2 = {}; req2.body = {
            username: 'user2',
            password: 'password',
            email: 'user2@email'
        };
        let req3 = {}; req3.body = {
            username: 'user_',
            password: 'password',
            email: 'user2@email'
        };
        let req4 = {}; req4.body = {
            username: 'user2',
            password: 'password',
            email: 'user2@email'
        };
       
        const resp1 = await request(app).post('/createUser').send(req1);
        expect(resp1.data.success).to.be.true;
        expect(resp1.data.duplicate_email).to.be.false;
        expect(resp1.data.duplicate_username).to.be.false;

        const resp2 = await request(app).post('/createUser').send(req2);
        expect(resp2.data.success).to.be.false;
        expect(resp2.data.duplicate_email).to.be.false;
        expect(resp2.data.duplicate_username).to.be.true;

        const resp3 = await request(app).post('/createUser').send(req3);
        expect(resp3.data.success).to.be.false;
        expect(resp3.data.duplicate_email).to.be.true;
        expect(resp3.data.duplicate_username).to.be.false;

        const resp4 = await request(app).post('/createUser').send(req4);
        expect(resp4.data.success).to.be.false;
        expect(resp4.data.duplicate_email).to.be.true;
        expect(resp4.data.duplicate_username).to.be.true;
    });

    after(async () => {
        sinon.restore();
    });
});