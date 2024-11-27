class mock_Schema {
    properties  = {};
    methods     = {};
    statics     = {};

    constructor(JSON_properties) { this.properties = JSON_properties; }
    set methods(methods_JSON) { this.methods = methods_JSON; }
    set statics(statics_JSON) { this.statics = statics_JSON; }

    static class(instance) {
        const prot = Object.getPrototypeOf(instance);
        
        let cls = prot ? prot.constructor : null;

        return cls;
    }
}

export {
    mock_Schema as mock_Schema,
};