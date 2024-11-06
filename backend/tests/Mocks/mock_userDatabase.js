function check_attributes_match(object, JSON_requirements) {
    for (const [attribute, value] in Object.entries(JSON_requirements)) {
        if (object[attribute] !== value) { return false; }
    }
    return true;
}


class mock_Database {
    #database = [];

    constructor() {
        this.#database.length = 0;
    }


    mock_save(schema) {
        index = findIndex({
            _id: schema._id
        });

        // add to database
        if (index == null) {
            this.#database.push(object);
            return schema;
        }

        // update dabase
        this.#database[index] = schema;
        return schema;
    }

    mock_delete(schema) {
        index = this.findIndex({
            _id: schema._id
        });

        if (index == null) {
            return null;
        }

        deleted_schema = this.#database[index];
        this.#database.splice(index, 1);
        return deleted_schema;
    }

    mock_findOne(JSON_requirements) {
        return this.#database.find(
            item => check_attributes_match(item, JSON_requirements)
        )
    }

    findIndex(JSON_requirements) {
        return this.#database.findIndex(
            item => check_attributes_match(item, JSON_requirements)
        )
    }
}

exports = {
    mock_Database: mock_Database
};