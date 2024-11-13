const { mock_Database}  = await import("./mock_Database.js");

class mock_Model {
    static findJSON(JSON, database) {
        console.log('\t\t-- findJSON called');
        return new Promise((resolve, reject) => {
            const element = database.findMatchingJSON(JSON);
            if (element.index == null) { 
                reject('Error: No matching element found'); 
            }
            resolve(element.element);
        });
    }
    static findById(id, database) {
        console.log('\t-- findById called');
        return mock_Model.findJSON({_id: id}, database);
    }
    static findOne(JSON, database) {
        console.log('\t-- findOne called');
        return mock_Model.findJSON(JSON, database);
    }
    static save(model, database) {
        console.log('\t-- save called');
        return new Promise((resolve, reject) => {
            let success = database.save(model);
            if (!success) {
                reject('Failed to save model');
            }
            resolve(model);
        });
    }
}

export {
    mock_Model
};