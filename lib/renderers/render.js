var fs          = require('fs');

const render = (filename, data, handlebars) => {
    var source   = fs.readFileSync(filename,'utf8').toString();
    var template = handlebars.compile(source);
    var output = template(data);
    return output;
}

module.exports = render;
