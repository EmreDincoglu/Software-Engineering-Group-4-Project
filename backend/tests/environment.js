import sinon from "sinon";

import { mock_Connection } from "./Mocks/mock_Connection.js";
import { mock_Schema } from "./Mocks/mock_Schema.js";  
import mongoose from "mongoose";


export const open_test_environment = function() {
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
};
export const close_test_environment = function() {
    sinon.restore();
}