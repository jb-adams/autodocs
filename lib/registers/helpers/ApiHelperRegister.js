var HelperRegister          = require('./HelperRegister'),
    md2HtmlMainHelper       = require('../../helpers/md2HtmlMainHelper'),
    md2HtmlSidebarHelper    = require('../../helpers/md2HtmlSidebarHelper');

class ApiHelperRegister extends HelperRegister {

    constructor(handlebars) {
        super(handlebars);
        this.helperRegistry.push(['md2HtmlMainHelper', md2HtmlMainHelper]);
        this.helperRegistry.push(
            ['md2HtmlSidebarHelper', md2HtmlSidebarHelper]);
    }
}

module.exports = ApiHelperRegister;