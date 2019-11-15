var axios       = require('axios'),
    fs          = require('fs'),
    Handlebars  = require('handlebars'),
    yaml        = require('js-yaml');

var ApiPartialRegister  = require('../registers/partials/ApiPartialRegister'),
    ApiHelperRegister   = require('../registers/helpers/ApiHelperRegister'),
    OpenAPIConverter    = require('../converters/OpenAPIConverter'),
    render              = require('../renderers/render');

const loadFromUrl = async (url) => {
    var urlS = url.split("/");
    var identifier = urlS[urlS.length - 1].split('.')[0];
    var response = await axios.get(url);
    return {
        "identifier": identifier,
        "data": response.data
    };
}

const buildApi = argv => {
    var partialRegister = new ApiPartialRegister(Handlebars);
    partialRegister.registerAllPartials();
    var helperRegister = new ApiHelperRegister(Handlebars);
    helperRegister.registerAllHelpers();

    // load config file, convert oai object
    var cfg = yaml.safeLoad(fs.readFileSync(argv.c, 'utf-8'))

    /* create an overall list of promise functions that will:
       asynchronously request the OpenAPI Spec
       asynchronously request the Pre-OpenAPI Markdown files
       asynchronously request the Post-OpenAPI Markdown files
    */
    var allPromiseFuncs = [];
    // add loading the OpenAPI spec to async functions list
    allPromiseFuncs.push(async () => loadFromUrl(cfg.oaiUrl));
    // add loading Pre-OpenAPI Markdown files to async functions list
    var preOaiMdFuncs = [];
    cfg.preOaiMdUrls.forEach(url => {
        preOaiMdFuncs.push(async () => loadFromUrl(url));
    });
    // add loading Post-OpenAPI Markdown files to async functions list
    var postOaiMdFuncs = [];
    cfg.postOaiMdUrls.forEach(url => {
        postOaiMdFuncs.push(async () => loadFromUrl(url));
    });
    // concatenate all
    allPromiseFuncs = allPromiseFuncs.concat(preOaiMdFuncs);
    allPromiseFuncs = allPromiseFuncs.concat(postOaiMdFuncs);

    Promise.all(allPromiseFuncs.map(f => f()))
        .then(values => {
            var data = {
                oai: new OpenAPIConverter(values[0].data).convertForDocs(),
                preOaiMds: values.slice(1, 1 + cfg.preOaiMdUrls.length),
                postOaiMds: values.slice(1 + cfg.preOaiMdUrls.length)
            }
            var result = render('templates/apidoc.html', data, Handlebars);
            fs.writeFileSync(argv.o, result);
        })
        .catch(error => {
            console.log(error);
        })
}

module.exports = buildApi;