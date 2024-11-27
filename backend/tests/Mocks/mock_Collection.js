function check_JSON_attributes_match(object, JSON) {
    for (let attribute in JSON) {
        if (object[attribute] !== JSON[attribute]) { return false; }
    }
    return true;
}


class mock_Collection {
    collection = [];

    constructor() {
        // clear database
        this.collection.length = 0;
    }

    print() {
        console.log("\t\t -- collection [mock] --");
        console.log(`\t\t\t >>> length :: ${this.length()} <<<`);
        this.collection.forEach((element, index) => {
            let element_JSON_str = Object.entries(element).map(([key, value]) => `${key} : ${value}`);
            console.log(`\t\t > ${index} :: { ${element_JSON_str.join(", ")} }`);
        });
    }

    length() {
        return this.collection.length;
    }

    at(index) {
        if (index == null || index < 0 || index >= this.length()) {
            return null;
        }
        return this.collection.at(index);
    }

    contains(element) {
        let index = this.collection.findIndex((_element) => _element === element);

        if (index == null || index < 0 || index > this.length()) { return false; }
        return true;
    }

    findMatchingJSON(JSON) {
        // defaults
        let [element, index] = [null, null];

        // find element matching required JSON attributes
        for (let i = 0; i < this.collection.length; i++) {
            // elemebt found
            if (check_JSON_attributes_match(this.collection[i], JSON)) {
                index = i;
                element = this.collection[i];
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
        let index = this.collection.findIndex((_element) => check_JSON_attributes_match(_element, identifier));

        if (index == null || index < 0 || index >= this.length()) {
            this.push(element);
            return true;
        }
        return this.updateIndex(index, element);
    }

    push(element) {
        this.collection.push(element);
        return element;
    }

    delete(element) {
        // find index of element
        let index = this.collection.findIndex((_element) => _element === element);

        return this.deleteIndex(index);
    }
    deleteIndex(index) {
        // index DNE, so cannot remove from database
        if (index == null || index < 0 || index >= this.length()) {
            return false; // successfully removed from database
        }

        // remove from database
        this.collection.splice(index, 1);
        return true;
    }

    update(element, updated_element) {
        // find index of element
        let index = this.collection.findIndex((_element) => _element == element);
        return this.updateIndex(index, updated_element);
    }
    updateIndex(index, updated_element) {
        // index DNE, so cannot update element
        if (index == null || index < 0 || index >= this.length()) {
            return false; // failed to update database
        }

        // update element
        this.collection[index] = updated_element;
        return true;
    }
}

export {
    mock_Collection as mock_Collection,
};