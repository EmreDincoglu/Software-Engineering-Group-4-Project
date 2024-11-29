import { mock_Collection } from "./mock_Collection.js";
import { mock_Model_Generator } from "./mock_Model.js";

class mock_Connection {
    #database = {};

    constructor() {
        this.#database = {};
    }

    model(name, schema) {
        if (name in this.#database) { 
            return this.#database[name]; 
        }

        const newCollection = new mock_Collection();
        const new_mock_Model = mock_Model_Generator(newCollection, schema);

        Object.defineProperty(new_mock_Model, 'name', { value: 'mock_' + name });

        this.#database[name] = new_mock_Model;
        return this.#database[name];
    }

    get database() { return this.#database; }
};

export {
    mock_Connection as mock_Connection,
};