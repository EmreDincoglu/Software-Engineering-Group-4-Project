import { expect } from "chai";
import { factory } from "factory-girl";

function check_JSON_attributes_match(object, JSON) {
    for (let attribute in JSON) {
        if (object[attribute] !== JSON[attribute]) { return false; }
    }
    return true;
}

describe("mock_Collection", () => {

    let print_collection = false;

    // for commandline parsing stuff
    //  p :: print
    //      c :: collection
    //
    //  >>> ... -- ... p ... c ... // prints collection
    before(() => {
        const args = process.argv.slice(3);
        if (args.includes('p')) { 
            if (args.includes('c')) {
                print_collection = true; 
            }
        }
    });

    describe("modification", () => {
        let collection;
        
        before(async () => {
            const { mock_Collection } = await import("../mock_Collection.js");
            collection = new mock_Collection();
        });

        afterEach(() => {
            if (print_collection) { collection.print(); }
        });

        it("push", () => {
            let e0, e1, e2, e3, e4;
            e0 = { name: "e0", __v: "1.0" };
            e1 = { name: "e1", __v: "1.0" };
            e2 = { name: "e2", __v: "1.0" };
            e3 = { name: "e3", __v: "1.0" };
            e4 = { name: "e4", __v: "1.0" };

            let E0 = collection.push(e0);
                expect(collection.length()).to.equal(1);
            let E1 = collection.push(e1);
                expect(collection.length()).to.equal(2);
            let E2 = collection.push(e2);
                expect(collection.length()).to.equal(3);
            let E3 = collection.push(e3);
                expect(collection.length()).to.equal(4);
            let E4 = collection.push(e4);
                expect(collection.length()).to.equal(5);

            expect(E0).to.equal(e0);
            expect(E1).to.equal(e1);
            expect(E2).to.equal(e2);
            expect(E3).to.equal(e3);
            expect(E4).to.equal(e4);
        });

        it("update -- element", () => {
            let e0, e1, e2;
            e0 = collection.at(0);
            e1 = collection.at(1);
            e2 = collection.at(2);

            let success;
            success = collection.update(e0, { name: "e0", __v: "1.1" });
            expect(success).to.be.true;
            success = collection.update(e1, { name: "e1", __v: "1.1" });
            expect(success).to.be.true;
            success = collection.update(e2, { name: "e2", __v: "1.1" });
            expect(success).to.be.true;

            let dne = { name: "dne" };
            success = collection.update(dne, { name: "exists", __v: "1.0" });
            expect(success).to.be.false;
        });

        it("update -- index", () => {
            let success;
            success = collection.updateIndex(0, { name: "e0", __v: "1.2" });
            expect(success).to.be.true;
            success = collection.updateIndex(1, { name: "e1", __v: "1.2" });
            expect(success).to.be.true;
            success = collection.updateIndex(3, { name: "e3", __v: "1.1" });
            expect(success).to.be.true;

            success = collection.updateIndex(-1, { name: "null", __v: "1.0" });
            expect(success).to.be.false;
            success = collection.updateIndex(5, { name: "null", __v: "1.0" });
            expect(success).to.be.false;
        });

        it("delete -- element", () => {
            let e0 = collection.at(0);
            
            let success;
            success = collection.delete(e0);
            expect(success).to.be.true;
            success = collection.delete(e0);
            expect(success).to.be.false;

            let e1 = collection.at(1);
            success = collection.delete(e1);
            expect(success).to.be.true;
            success = collection.delete(e1);
            expect(success).to.be.false;

            success = collection.delete({ name: "dne", __v: "1.0"});
            expect(success).to.be.false;
        });

        it("delete -- index", () => {
            let success;
            success = collection.deleteIndex(2);
            expect(success).to.be.true;
            success = collection.deleteIndex(-1);
            expect(success).to.be.false;
            success = collection.deleteIndex(2);
            expect(success).to.be.false;
            success = collection.deleteIndex(0);
            expect(success).to.be.true;
        });

        it("save", () => {
            let success;
            let new_element, updated_element; 
            
            updated_element = {name: "e3", __v: "1.2", index: "0"};
            success = collection.save(updated_element, {name: updated_element.name});
            expect(success).to.be.true;
            expect(collection.length()).to.equal(1);
            expect(check_JSON_attributes_match(collection.at(0), updated_element)).to.be.true;
            
            new_element = {name: "e6", __v: "1.0", index: "1"};
            success = collection.save(new_element, {name: new_element.name});
            expect(success).to.be.true;
            expect(collection.length()).to.equal(2);
            expect(check_JSON_attributes_match(collection.at(1), new_element)).to.be.true

            new_element = {name: "e7", __v: "1.0", index: "2"};
            success = collection.save(new_element, {name: new_element.name});
            expect(success).to.be.true;
            expect(collection.length()).to.equal(3);
            expect(check_JSON_attributes_match(collection.at(2), new_element)).to.be.true

            updated_element = {name: "e6", __v: "1.3", index: "1"};
            success = collection.save(updated_element, {name: updated_element.name});
            expect(success).to.be.true;
            expect(collection.length()).to.equal(3);
            expect(check_JSON_attributes_match(collection.at(1), updated_element)).to.be.true;
        });
    });

    describe("finding elements", () => {
        let collection;
        
        before(async () => {
            const { mock_Collection } = await import("../mock_Collection.js");
            collection = new mock_Collection();

            // add a bunch of elements
            factory.define("el", Object, () => { return {
                // n is 1-indexed
                name: factory.sequence("el.name", (n) => `e${n-1}`),
                __v: "1.0",
                index: factory.sequence("el.index", (n) => n-1)
            };
            });

            for (let i = 0; i < 100; i++) {
                let new_element = await factory.build("el");
                collection.push(new_element);
            }

            if (print_collection) { collection.print(); }
        });

        it("at", () => {
            let N = Math.floor(Math.random() * 75);
            for (let i = 0; i < N; i++) {
                let n = Math.floor(Math.random() * 100);
                expect(check_JSON_attributes_match(collection.at(n), {name: `e${n}`, index: n})).to.be.true;
            }
        });

        it("contains", () => {
            let N = Math.floor(Math.random() * 75);
            for (let i = 0; i < N; i++) {
                let n = Math.floor(Math.random() * 100);
                expect(collection.contains(collection.at(n))).to.be.true;
            }
            expect(collection.contains(null)).to.be.false;
            expect(collection.contains({name: null, __v: "1.0", index: 100})).to.be.false;
        });

        it("findMatchingJSON", () => {
            let N = Math.floor(Math.random() * 75);
            for (let i = 0; i < N; i++) {
                let n = Math.floor(Math.random() * 150);
                if (100 <= n  && n < 125) {
                    expect(collection.findMatchingJSON({name: `e${n}`}).index).to.be.null;
                    expect(collection.findMatchingJSON({name: `e${n}`}).element).to.be.null;
                    continue;
                }
                if (125 <= n  && n  < 150) {
                    expect(collection.findMatchingJSON({index: n}).index).to.be.null;
                    expect(collection.findMatchingJSON({index: n}).element).to.be.null;
                    continue
                }
                if (0 <= n  && n  < 50) {
                    expect(collection.findMatchingJSON({name: `e${n}`}).index).to.equal(n);
                    expect(collection.findMatchingJSON({name: `e${n}`}).element).to.equal(collection.at(n));
                    continue;
                }
                if (50 <= n  && n  < 100) {
                    expect(collection.findMatchingJSON({index: n}).index).to.equal(n);
                    expect(collection.findMatchingJSON({index: n}).element).to.equal(collection.at(n));
                    continue;
                }
            }
            expect(collection.findMatchingJSON({__v: "1.0"}).index).to.equal(0);
            expect(collection.findMatchingJSON({name: "e10", __v: "1.0"}).index).to.equal(10);
            expect(collection.findMatchingJSON({name: "e11", __v: "1.1"}).index).to.be.null;
            expect(collection.findMatchingJSON({index: 79, __v: "1.0"}).index).to.equal(79);
            expect(collection.findMatchingJSON({index: 79, __v: "1.001"}).index).to.be.null;
        });
    });
});