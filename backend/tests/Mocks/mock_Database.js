function check_JSON_attributes_match(object, JSON) {
    for (let attribute in JSON) {
        if (object[attribute] !== JSON[attribute]) { return false; }
    }
    return true;
}


class mock_Database {
    #database = [];

    constructor() {
        // clear database
        this.#database.length = 0;
    }

    print() {
        console.log("\t\t -- print --");
        this.#database.forEach((element, index) => {
            let element_JSON_str = Object.entries(element).map(([key, value]) => `${key} : ${value}`);
            console.log(`\t\t > ${index} :: { ${element_JSON_str.join(", ")} }`);
        });
    }

    length() {
        return this.#database.length;
    }

    at(index) {
        if (index == null || index < 0 || index >= this.length()) {
            return null;
        }
        return this.#database.at(index);
    }

    contains(element) {
        let index = this.#database((_element) => _element === element);

        if (index == null) { return false; }
        return true;
    }

    findMatchingJSON(JSON) {
        // defaults
        let [element, index] = [null, null];

        // find element matching required JSON attributes
        for (let i = 0; i < this.#database.length; i++) {
            // elemebt found
            if (check_JSON_attributes_match(this.#database[i], JSON)) {
                index = i;
                element = this.#database[i];
                break;
            }
        }
        
        // return [element, index] pair
        return {
            element: element,
            index: index
        };
    }

    save(element, identifier) {
        // find index of element
        let index = this.#database.findIndex((_element) => check_JSON_attributes_match(_element, identifier));

        if (index == null || index < 0 || index >= this.length()) {
            this.push(element);
            return true;
        }
        return this.updateIndex(index, element);
    }

    push(element) {
        this.#database.push(element);
        return element;
    }

    delete(element) {
        // find index of element
        let index = this.#database.findIndex((_element) => _element === element);

        return this.deleteIndex(index);
    }
    deleteIndex(index) {
        // index DNE, so cannot remove from database
        if (index == null || index < 0 || index >= this.length()) {
            return false; // successfully removed from database
        }

        // remove from database
        this.#database.splice(index, 1);
        return true;
    }

    update(element, updated_element) {
        // find index of element
        let index = this.#database.findIndex((_element) => _element == element);
        return this.updateIndex(index, updated_element);
    }
    updateIndex(index, updated_element) {
        // index DNE, so cannot update element
        if (index == null || index < 0 || index >= this.length()) {
            return false; // failed to update database
        }

        // update element
        this.#database[index] = updated_element;
        return true;
    }
}

export {
    mock_Database
};