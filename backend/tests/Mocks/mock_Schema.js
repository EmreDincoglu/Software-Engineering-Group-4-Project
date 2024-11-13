class mock_Schema {
    #required_properties = [];

    constructor(JSON_properties) {
        this.addJSON(JSON_properties);
    }

    addJSON(JSON_properties) {
        for (const [attribute, value] in Object.entries(JSON_requirements)) {
            // in form :: `propertiy_name`: `property_type`
            if (value.type == null) { this[attribute] = {type: value}; continue; }
            // in form :: `property_name`: `{ type: `property_type`, ... }`
            this[attribute] = value;
        }
        this.#update_requiredProperties();

        return this;
    }
    #update_requiredProperties() {
        for (const [property_name, property_value] in Object.entries(this)) {
            if (this[property_name].required === true) { this.#required_properties.push(property_name); }
        }
        return this;
    }

    get required() {
        return this.#required_properties;
    }

    set methods(method_dict) {
        for (const [method_name, method_function] in Object.entries(method_dict)) {
            this[method_name] = method_function;
        }
    }
}

json