import { expect } from "chai";
import { factory } from "factory-girl";

const { mock_Schema } = await import("../mock_Schema.js");

describe("mock_Schema", async () => {

    it("setting properties", () => {    
        for (let i = 0; i < 100; i++) {
            const expectedIndex = Math.floor(Math.random() * 100);
            const indexSchema = new mock_Schema({
                index: expectedIndex,
            })
            expect(indexSchema.properties.index).to.equal(expectedIndex);
        }
    });

    it("setting methods", () => {
        for (let i = 0; i < 100; i++) {
            const expectedIndex = Math.floor(Math.random() * 100);
            const indexSchema = new mock_Schema({
                index: 0,
            })
            indexSchema.methods = {
                getIndex: function () { return this.index; },
                setIndex: function (index) { this.index = index; },
            }
            expect(indexSchema.properties.index).to.equal(0);
            indexSchema.methods.setIndex.call(indexSchema, i);
            expect(indexSchema.methods.getIndex.call(indexSchema)).to.equal(i);
        }
    });

    it("setting statics", () => {
        for (let i = 0; i < 100; i++) {
            const expectedIndex = Math.floor(Math.random() * 100);
            const indexSchema = new mock_Schema({
                index: 0,
            })
            indexSchema.statics = {
                getIndex: function () { return this.index; },
                setIndex: function (index) { this.index = index; },
            }
            expect(indexSchema.properties.index).to.equal(0);
            indexSchema.statics.setIndex.call(indexSchema, i);
            expect(indexSchema.statics.getIndex.call(indexSchema)).to.equal(i);
        }
    });
});