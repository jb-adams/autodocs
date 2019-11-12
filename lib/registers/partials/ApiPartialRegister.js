var PartialRegister = require('./PartialRegister');

class ApiPartialRegister extends PartialRegister {

    constructor(handlebars) {
        super(handlebars);
        this.partialRegistry = [
            ['header', 'header.html'],
            ['footer', 'footer.html'],
            ['navbar', 'navbar.html'],
            ['sidebar', 'sidebar.html']
        ]
    }

}

module.exports = ApiPartialRegister;