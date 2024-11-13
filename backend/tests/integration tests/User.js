import sinon from "sinon";
import { expect } from "chai";
import request from "supertest-as-promised";
import express from "express";

console.log("running tests");

describe('createUser', () => {
    let userDatabase;
    let mongoose;
    let app;

    before(async () => {
        console.log('1');

        const { mock_Database } = await import("../Mocks/mock_Database.js");
        const { mock_Model } = await import("../Mocks/mock_Model.js");

        console.log("1.5");
        userDatabase = new mock_Database();
        console.log('2');

        const model = await import("../../model.js");
        sinon.stub(model.User, 'findOne').callsFake(() => {
            return mock_Model.findOne(this, mock_Database);
        });
        sinon.stub(model.User, 'findById').callsFake(() => {
            return mock_Model.findById(this, userDatabase);
        });
        sinon.stub(model.User.prototype, 'save').callsFake(() => {
            return mock_Model.save(this, userDatabase);
        });

        mongoose = await import("../../mongoose.js");

        app = express();
        
        app.post('/createUser', mongoose.createUser);
        app.get('/getUserData', mongoose.getUserData);
    })
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