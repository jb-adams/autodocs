var HelperRegister          = require('./HelperRegister'),
    md2HtmlMain             = require('../../helpers/md2HtmlMain'),
    md2HtmlSidebar          = require('../../helpers/md2HtmlSidebar');

class ApiHelperRegister extends HelperRegister {

    constructor(handlebars) {
        super(handlebars);
        var newRegistries = [
            ['md2HtmlMain', md2HtmlMain],
            ['md2HtmlSidebar', md2HtmlSidebar]
        ]

        newRegistries.forEach(registry => this.helperRegistry.push(registry));
    }
}

module.exports = ApiHelperRegister;