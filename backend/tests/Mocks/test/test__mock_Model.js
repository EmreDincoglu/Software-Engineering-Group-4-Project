import { expect } from "chai";
import { factory } from "factory-girl";
import { mock_Schema } from "../mock_Schema.js";

const { mock_Collection } = await import("../mock_Collection.js");
const { mock_Model_Generator } = await import("../mock_Model.js");

describe("mock_Model", async () => {

    let collection;
    let IndexModel;

    before(async () => {
        collection = new mock_Collection();
        
        const IndexSchema = new mock_Schema({index: {required: true}});
        IndexSchema.methods = {
            inc: function () { 
                this.index++; 
                let cls = mock_Schema.class(this);
                cls.numOp++;
            },
            dec: function () { 
                this.index--; 
                let cls = mock_Schema.class(this);
                cls.numOp++;
            },
            nop: function () { 
                let cls = mock_Schema.class(this);
                cls.numOp++;
            },
            setIndex: function (index) { 
                this.index = index; 
                let cls = mock_Schema.class(this);
                cls.numOp++;
            },
            getIndex: function () { return this.index; },
        };
        IndexSchema.statics = {
            numOp: 0,
            get_numOp: function () { return this.numOp; }, 
        };
        IndexModel = mock_Model_Generator(collection, IndexSchema);
    });

    describe("construction", () => {

        it("has properties", () => {
            const indexModel = new IndexModel({index: 0});

            expect('index' in indexModel).to.be.true;
            expect('inc' in indexModel).to.be.true;
            expect('dec' in indexModel).to.be.true;
            expect('nop' in indexModel).to.be.true;
            expect('setIndex' in indexModel).to.be.true;
            expect('getIndex' in indexModel).to.be.true;

            expect('save' in indexModel).to.be.true;
            expect('id' in indexModel).to.be.true;
            expect('_id' in indexModel).to.be.true;
            expect(indexModel.id).to.equal(0);
            expect(indexModel._id).to.equal(0);

            expect('findJSON' in IndexModel).to.be.true;
            expect('findById' in IndexModel).to.be.true;
            expect('findOne' in IndexModel).to.be.true;
        });

        it("calling schema methods (instance + static)", () => {
            for (let i = 0; i < 100; i++) {
                let indexModel = new IndexModel({index: 0});
                expect(indexModel.getIndex()).to.equal(0);
                expect(indexModel.index).to.equal(0);
                for (let _ = 0; _ < i; _++) indexModel.inc();
                expect(indexModel.getIndex()).to.equal(i);

                expect(indexModel.id).to.equal(i+1);

                expect(IndexModel.get_numOp()).to.equal(i * (i+1) / 2);
                expect(IndexModel.numOp).to.equal(i * (i+1) / 2);
            }
        });
    });

    describe("modifying collection", () => {
        it("creating with save", async () => {
            for (let i = 0; i < 100; i++) {
                let indexModel = new IndexModel({index: 0});
                indexModel.setIndex(i);
                
                expect(await indexModel.save()).to.equal(indexModel);
            }
        });

        it("modifying with save", async () => {
            for (let i = 0; i < 50; i++) {
                let indexModel = await IndexModel.findById(101 + i);
                expect(indexModel.index).to.equal(i);
                indexModel.setIndex(i + 100);
                indexModel.save();
                let otherIndexModel = await IndexModel.findById(101 + i);
                expect(otherIndexModel.getIndex()).to.equal(i + 100);
            }
        });
    });

    describe("finding elements", () => {
        it("findJSON", async () => {
            for (let i = 0; i < 50; i++) {
                expect((await IndexModel.findJSON({id: 101 + i})).index).to.equal(i + 100);
            }
            for (let i = 51; i < 100; i++) {
                expect((await IndexModel.findJSON({index: i})).index).to.equal(i);
            }
            for (let i = 0; i < 50; i++) {
                expect((await IndexModel.findJSON({id: 101 + i, index: i + 100})).index).to.equal(i + 100);
            }
            for (let i = 51; i < 100; i++) {
                expect((await IndexModel.findJSON({id: 101 + i, index: i})).index).to.equal(i);
            }
        });

        it("findOne", async () => {
            for (let i = 0; i < 50; i++) {
                expect((await IndexModel.findOne({id: 101 + i})).index).to.equal(i + 100);
            }
            for (let i = 51; i < 100; i++) {
                expect((await IndexModel.findOne({index: i})).index).to.equal(i);
            }
        });

        it("findById", async () => {
            for (let i = 0; i < 50; i++) {
                expect((await IndexModel.findById(101 + i)).index).to.equal(i + 100);
            }
        });

        it("dne", async () => {
            for (let i = 0; i < 100; i++) {
                expect(await IndexModel.findJSON({_id: 101 + i, index: 0})).to.be.null;
                expect(await IndexModel.findOne({index: -1 * i})).to.be.null;
                expect(await IndexModel.findById(-1 * i)).to.be.null;   
            }
        });
    })
});
