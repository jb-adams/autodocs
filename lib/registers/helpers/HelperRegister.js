var Filter      = require('handlebars.filter')
var globalHelpers = require('../../helpers/globalHelpers');

class HelperRegister {

    constructor(handlebars) {
        this.handlebars = handlebars;
        Filter.registerHelper(this.handlebars);
        this.helperRegistry = [];
        Object.keys(globalHelpers).forEach(funcKey => {
            var globalRegister = [funcKey, globalHelpers[funcKey]];
            this.helperRegistry.push(globalRegister);
        })
    }

    registerHelper(name, func) {
        this.handlebars.registerHelper(name, func);
    }

    registerAllHelpers() {
        this.helperRegistry.forEach(helper => {
            var [name, func] = helper;
            this.registerHelper(name, func);
        })
    }
}

module.exports = HelperRegister;
