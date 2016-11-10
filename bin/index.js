var fs = require('fs');
var parse = require('parse-diff');
var argv = require('minimist')(process.argv.slice(2));
var diffparser = require('../lib/parser');

var unifiedDiff = argv._[0];

if (unifiedDiff && unifiedDiff.endsWith('.diff')) {
    var config = {
        'file': argv._[0]
    };

    if (argv.filter) {
        config.filterPath = argv.filter;
    }

    if (config.dev) {
        config.developerMode = true;
    }

    diffparser.readFile(config, function(warnings) {
        if (warnings && warnings.length > 0) {
            warnings.forEach(function(item) {
                console.log(item.content.message);
            });

            var summary = warnings.length + ' warning(s) found';
            var warningsTotal = diffparser.getWarningsTotal();

            if (warningsTotal > 0) {
                var warningsFiltered = warningsTotal - warnings.length;
                summary += ', ' +
                    warningsFiltered + '/' + warningsTotal +
                    ' (' + (warningsFiltered / warningsTotal * 100).toFixed(2) + '%) ' +
                    'warnings(s) filtered';
            }

            console.log(summary + '.');
        }
    });
} else {
    help();
}

function help() {
    console.log('Usage');
    console.log('\tnode index.js path/to/diff [options]\n');
    console.log('\t--filter=[directory | filename]');
}
