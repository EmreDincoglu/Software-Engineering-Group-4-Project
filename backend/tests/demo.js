import {expect} from "chai";


console.log("running demo tests");

describe('demo tests', () => {
    before(() => {
        console.log("running before demo tests");
    })
    it('test 1', async () => {
        console.log("demo test 1");
        let a = 1;
        expect(a == 1);
    });
    it('test 2', async () => {
        let a = 1;
        expect(a).to.equal(1);
    });
    after(() => {
        console.log("running after demo tests");
    });
})