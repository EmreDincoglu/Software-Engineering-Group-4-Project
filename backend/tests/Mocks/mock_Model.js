const { mock_Collection}  = await import("./mock_Collection.js");
const { mock_Schema } = await import ("./mock_Schema.js");


const ModelGeneratorHelperFunction = {
    set_properties: function (schema, properties_JSON) {
        let required_prop = [];
        for (let prop in schema.properties) {
            if (schema.properties[prop].required === true) required_prop.push(prop);
        }
        
        for (let prop in properties_JSON) { 
            if (required_prop.includes(prop)) required_prop.splice(required_prop.indexOf(prop), 1);
            this[prop] = properties_JSON[prop]; 
        }

        return {missing_properties: required_prop};
    },

    set_methods: function (methods_JSON) {
        for (let method in methods_JSON) this[method] = methods_JSON[method];
    },

    set_statics: function (statics_JSON) {
        for (let static_method in statics_JSON) this[static_method] = statics_JSON[static_method];
    }
};

function mock_Model_Generator(collection, schema) {

const mock_Model = class {
    static #collection = collection;

    findJSON(JSON) {
        console.log('\t\t-- findJSON called');
        return new Promise((resolve, reject) => {
            const element = collection.findMatchingJSON(JSON);
            if (element.index == null) { 
                reject('Error: No matching element found');
                return; 
            }
            resolve(element.element);
        });
    }
    findById(id) {
        console.log('\t-- findById called');
        return mock_Model.findJSON({_id: id});
    }
    findOne(JSON) {
        console.log('\t-- findOne called');
        return mock_Model.findJSON(JSON);
    }
    save() {
        console.log('\t-- save called');
        return new Promise((resolve, reject) => {
            let success = collection.save(this, {_id: model._id});
            if (!success) {
                reject('Failed to save model');
                return; 
            }
            resolve(model);
        });
    }
};

mock_Model.prototype.constructor = function(properties_JSON) {
    const missing_properties = ModelGeneratorHelperFunction.set_properties.call(this, schema, properties_JSON);
    if (missing_properties.length == 0) throw new Error("missing properties");
}
ModelGeneratorHelperFunction.set_methods.call(mock_Model.prototype, schema.methods);
ModelGeneratorHelperFunction.set_statics.call(mock_Model, schema.statics);


return mock_Model;
}


export {
    mock_Model_Generator as mock_Model_Generator,
};