var fs          = require('fs'),
    path        = require('path');

class PartialRegister {

    constructor(handlebars) {
        this.handlebars = handlebars;
        this.installDir = path.dirname(path.dirname(path.dirname(__dirname)));
        this.partialsDir = path.resolve(
            this.installDir, "templates", "partials");

        this.partialRegistry = [];
    }

    readPartialFile(filename) {
        return fs.readFileSync(
            path.resolve(this.partialsDir, filename),
            {encoding: 'utf-8'}
        );
    }

    registerPartial(name, filename) {
        this.handlebars.registerPartial(name, this.readPartialFile(filename))
    }

    registerAllPartials() {
        this.partialRegistry.forEach(partial => {
            var [name, filename] = partial;
            this.registerPartial(name, filename);
        });
    }
}

module.exports = PartialRegister;
