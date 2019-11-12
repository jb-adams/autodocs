var yargs = require('yargs');
var build = require('./build');

var allCommands = yargs
    .scriptName("ga4gh-autodocs")
    .usage('$0 <command> [options]')
    .help('h')
    .alias('h', 'help')
    .command(
        'build',
        'generate documentation',
        (yargs) => {
            return yargs.options({
                "t": {
                    alias: 'type',
                    type: 'string',
                    choices: ['api'],
                    describe: 'the type of standard'
                },
                "c": {
                    alias: 'config-file',
                    type: 'string',
                    describe: 'yaml config file'
                }
            })
            .demandOption(['c', 't'], 'type and config file MUST be specified')
        },
        build
    )
    .argv

module.exports = allCommands;