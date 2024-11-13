import { expect } from "chai";

describe("mock_Database", () => {
    describe("modification", () => {
        let database;
        
        before(async () => {
            const { mock_Database } = await import("../mock_Database.js");
            database = new mock_Database();
        });

        afterEach(() => {
            database.print();
        });

        it("push", () => {
            let e0, e1, e2, e3, e4;
            e0 = { name: "e0", __v: "1.0" };
            e1 = { name: "e1", __v: "1.0" };
            e2 = { name: "e2", __v: "1.0" };
            e3 = { name: "e3", __v: "1.0" };
            e4 = { name: "e4", __v: "1.0" };

            let E0 = database.push(e0);
                expect(database.length()).to.equal(1);
            let E1 = database.push(e1);
                expect(database.length()).to.equal(2);
            let E2 = database.push(e2);
                expect(database.length()).to.equal(3);
            let E3 = database.push(e3);
                expect(database.length()).to.equal(4);
            let E4 = database.push(e4);
                expect(database.length()).to.equal(5);

            expect(E0).to.equal(e0);
            expect(E1).to.equal(e1);
            expect(E2).to.equal(e2);
            expect(E3).to.equal(e3);
            expect(E4).to.equal(e4);
        });

        it("updating -- element", () => {
            let e0, e1, e2;
            e0 = database.at(0);
            e1 = database.at(1);
            e2 = database.at(2);

            let success;
            success = database.update(e0, { name: "e0", __v: "1.1" });
            expect(success).to.be.true;
            success = database.update(e1, { name: "e1", __v: "1.1" });
            expect(success).to.be.true;
            success = database.update(e2, { name: "e2", __v: "1.1" });
            expect(success).to.be.true;

            let dne = { name: "dne" };
            success = database.update(dne, { name: "exists", __v: "1.0" });
            expect(success).to.be.false;
        });

        it("update -- index", () => {
            let success;
            success = database.updateIndex(0, { name: "e0", __v: "1.2" });
            expect(success).to.be.true;
            success = database.updateIndex(1, { name: "e1", __v: "1.2" });
            expect(success).to.be.true;
            success = database.updateIndex(3, { name: "e3", __v: "1.1" });
            expect(success).to.be.true;

            success = database.updateIndex(-1, { name: "null", __v: "1.0" });
            expect(success).to.be.false;
            success = database.updateIndex(5, { name: "null", __v: "1.0" });
            expect(success).to.be.false;
        });

        it("delete -- element", () => {
            let e0 = database.at(0);
            
            let success;
            success = database.delete(e0);
            expect(success).to.be.true;
            success = database.delete(e0);
            expect(success).to.be.false;

            let e1 = database.at(1);
            success = database.delete(e1);
            expect(success).to.be.true;
            success = database.delete(e1);
            expect(success).to.be.false;

            success = database.delete({ name: "dne", __v: "1.0"});
            expect(success).to.be.false;
        });

        it("delete -- index", () => {
            let success;
            success = database.deleteIndex(2);
            expect(success).to.be.true;
            success = database.deleteIndex(-1);
            expect(success).to.be.false;
            success = database.deleteIndex(2);
            expect(success).to.be.false;
            success = database.deleteIndex(0);
            expect(success).to.be.true;
        });

        it("save", () => {

            function check_JSON_attributes_match(object, JSON) {
                for (let attribute in JSON) {
                    if (object[attribute] !== JSON[attribute]) { return false; }
                }
                return true;
            }

            let success;
            let new_element, updated_element; 
            
            updated_element = {name: "e3", __v: "1.2", index: "0"};
            success = database.save(updated_element, {name: updated_element.name});
            expect(success).to.be.true;
            expect(database.length()).to.equal(1);
            expect(check_JSON_attributes_match(database.at(0), updated_element)).to.be.true;
            
            new_element = {name: "e6", __v: "1.0", index: "1"};
            success = database.save(new_element, {name: new_element.name});
            expect(success).to.be.true;
            expect(database.length()).to.equal(2);
            expect(check_JSON_attributes_match(database.at(1), new_element)).to.be.true

            new_element = {name: "e7", __v: "1.0", index: "2"};
            success = database.save(new_element, {name: new_element.name});
            expect(success).to.be.true;
            expect(database.length()).to.equal(3);
            expect(check_JSON_attributes_match(database.at(2), new_element)).to.be.true

            updated_element = {name: "e6", __v: "1.3", index: "1"};
            success = database.save(updated_element, {name: updated_element.name});
            expect(success).to.be.true;
            expect(database.length()).to.equal(3);
            expect(check_JSON_attributes_match(database.at(1), updated_element)).to.be.true;
        });
    });
});