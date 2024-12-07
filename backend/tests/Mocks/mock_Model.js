import { mock_Collection} from "./mock_Collection.js";
import { mock_Schema } from "./mock_Schema.js";


const ModelGeneratorHelperFunction = {
    set_properties: function (schema, properties_JSON) {
        let required_prop = [];
        for (let prop in schema.properties) {
            if (schema.properties[prop].hasOwnProperty("required") && 
                schema.properties[prop].required === true) 
                
                required_prop.push(prop);
        }
        
        for (let prop in properties_JSON) { 
            if (required_prop.includes(prop)) required_prop.splice(required_prop.indexOf(prop), 1);
            this[prop] = properties_JSON[prop]; 
        }

        return {missing_properties: required_prop};
    },

    apply_properties: function (properties_JSON) {
        function apply_properties_to(instance, properties) {
            for (let property_name in properties) {
                if (property_name == "type" || property_name == "required") continue;

                const property = properties[property_name];
                instance[property_name] = Array.isArray(property) ? [] : {};

                if (typeof property === "object" && 
                    property !== null &&
                    property.constructor === Object
                ) apply_properties_to(instance[property_name], property);
            }
            return instance;
        }

        apply_properties_to(this, properties_JSON);
    },

    set_methods: function (methods_JSON) {
        for (let method in methods_JSON) 
            this[method] = methods_JSON[method];
    },

    set_statics: function (statics_JSON) {
        for (let static_method in statics_JSON) 
            this[static_method] = statics_JSON[static_method];
    },
};

const id_generator = function *() {
    let i = 0;
    while(true) yield i++;
}

function mock_Model_Generator(collection, schema) {

const mock_Model = class {
    static #collection = collection;
    static #id_generator = id_generator();

    #_id = mock_Model.#id_generator.next().value;

    constructor(properties_JSON) {
        ModelGeneratorHelperFunction.apply_properties.call(this, schema.properties);
        const missing_properties = ModelGeneratorHelperFunction.set_properties.call(this, schema, properties_JSON).missing_properties;
        if (missing_properties.length != 0) throw new Error("missing properties");
    }

    static findJSON(JSON) {
        return new Promise((resolve, reject) => {
            const element = collection.findMatchingJSON(JSON);
            if (element.index == null) { 
                resolve(null);
            }
            resolve(element.element);
        });
    }
    static findById(id) {
        return mock_Model.findJSON({_id: id});
    }
    static findOne(JSON) {
        return mock_Model.findJSON(JSON);
    }
    save() {
        return new Promise((resolve, reject) => {
            let success = collection.save(this, {_id: this._id});
            if (!success) {
                reject('Failed to save model');
                return; 
            }
            resolve(this);
        });
    }

    get id() { return this.#_id; }
    get _id() { return this.#_id; }

    static get collection() { return mock_Model.#collection; }
};

ModelGeneratorHelperFunction.set_methods.call(mock_Model.prototype, schema.methods);
ModelGeneratorHelperFunction.set_statics.call(mock_Model, schema.statics);


return mock_Model;
}


export {
    mock_Model_Generator as mock_Model_Generator,
    ModelGeneratorHelperFunction as ModelGeneratorHelperFunction,
};