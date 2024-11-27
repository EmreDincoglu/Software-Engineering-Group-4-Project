import { expect } from "chai";
import { factory } from "factory-girl";

import { mock_Model_Generator } from "../mock_Model.js";
import { mock_Schema } from "../mock_Schema.js";
import { mock_Collection } from "../mock_Collection.js";
import { mock_Connection } from "../mock_Connection.js"


describe("mock_Connection", async () => {
    let connection;

    let schema1, schema2, schema3;

    before(async () => {
        connection = new mock_Connection();

        schema1 = new mock_Schema({
            a: {required: false},
            b: {required: false},
        });

        schema2 = new mock_Schema({
            a: {required: false},
        });
        schema2.methods = {
            getA: function() { return this.a; }
        }
        
        schema3 = new mock_Schema({
            a: {required: true}
        })
        schema3.statics = {
            get1: function() { return 1; }
        }
    });

    let model1; let model2; let model3;

    it("creating models", () => {
        model1 = connection.model("model1", schema1);
        const inst1 = new model1({a: 1, b: 2});
        expect('a' in inst1).to.be.true;
        expect('b' in inst1).to.be.true;
        expect('save' in inst1).to.be.true;
        expect('findJSON' in model1).to.be.true;
        expect('findOne' in model1).to.be.true;
        expect('findById' in model1).to.be.true;

        model2 = connection.model("model2", schema2);
        const inst2 = new model2({a: 1, b: 2});
        expect('a' in inst2).to.be.true;
        expect('getA' in inst2).to.be.true;
        expect('save' in inst2).to.be.true;
        expect('findJSON' in model2).to.be.true;
        expect('findOne' in model2).to.be.true;
        expect('findById' in model2).to.be.true;

        model3 = connection.model("model3", schema3);
        const inst3 = new model3({a: 1});
        expect('a' in inst3).to.be.true;
        expect('save' in inst3).to.be.true;
        expect('get1' in model3).to.be.true;
        expect('findJSON' in model3).to.be.true;
        expect('findOne' in model3).to.be.true;
        expect('findById' in model3).to.be.true;
    });

    let other_model1, other_model2, other_model3;
    it("getting models", () => {
        other_model1 = connection.model("model1", schema1);
        expect(other_model1).to.equal(model1);

        
        other_model2 = connection.model("model2", schema2);
        expect(other_model2).to.equal(model2);
        
        other_model3 = connection.model("model3", schema3);
        expect(other_model3).to.equal(model3);
    });
});