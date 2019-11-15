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
                },
                "o": {
                    alias: 'output-file',
                    type: 'string',
                    describe: 'output file path'
                }
            })
            .demandOption(['c', 't', 'o'], 'type, config file, and output file MUST be specified')
        },
        build
    )
    .argv

module.exports = allCommands;