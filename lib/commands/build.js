var buildApi = require('./buildApi');

const build = argv => {
    var buildMethodByType = {
        api: buildApi
    }
    buildMethodByType[argv.type](argv);
}

module.exports = build;