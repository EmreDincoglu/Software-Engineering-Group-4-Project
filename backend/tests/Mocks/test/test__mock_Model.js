import { expect } from "chai";
import { factory } from "factory-girl";


describe("mock_Model", async () => {

    const { User } = await import("../../../model.js");

    const { mock_Model } = await import("../mock_Model.js");

    describe("saving", async () => {

        let database;

        before(async () => {
            const { mock_Collection } = await import("../mock_Collection.js");
            database = new mock_Collection();
        });

        it("save", async () => {
            for (let i = 0; i < 100; i++) {
                const new_user = new User({
                    
                });
            }
        });
    });
});
