const { mock_Collection } = await import ("./mock_Collection.js");
const { mock_Model_Generator } = await import ("./mock_Model.js");

class mock_Connection {
    #database = {};

    constructor() {
        this.#database = {};
    }

    model(name, schema) {
        if (name in this.#database) return this.#database[name];

        const newCollection = new mock_Collection();
        const new_mock_Model = mock_Model_Generator(newCollection, schema);
        this.#database[name] = new_mock_Model;
        return this.#database[name];
    }
};

export {
    mock_Connection as mock_Connection,
};