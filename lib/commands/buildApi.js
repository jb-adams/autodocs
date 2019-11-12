var fs          = require('fs'),
    Handlebars  = require('handlebars'),
    yaml        = require('js-yaml');

var ApiPartialRegister  = require('../registers/partials/ApiPartialRegister'),
    ApiHelperRegister   = require('../registers/helpers/ApiHelperRegister'),
    OpenAPIConverter    = require('../converters/OpenAPIConverter'),
    render              = require('../renderers/render');

const buildApi = argv => {
    var partialRegister = new ApiPartialRegister(Handlebars);
    partialRegister.registerAllPartials();
    var helperRegister = new ApiHelperRegister(Handlebars);
    helperRegister.registerAllHelpers();

    // load config file, convert oai object
    var cfg = yaml.safeLoad(fs.readFileSync(argv.c, 'utf-8'))
    var convertedOai = new OpenAPIConverter(cfg.oaiFile).convertForDocs();

    var data = {
        oai: convertedOai,
        preOaiMdFps: cfg.preOaiFiles,
        postOaiMdFps: cfg.postOaiFiles
    }

    var result = render('templates/apidoc.html', data, Handlebars);
    fs.writeFileSync('build/foo.html', result);
}

module.exports = buildApi;