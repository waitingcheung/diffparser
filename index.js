var fs = require('fs');
var parse = require('parse-diff');
var argv = require('minimist')(process.argv.slice(2));

var warningsTotal = 0;
var unifiedDiff = argv._[0];

if (unifiedDiff && unifiedDiff.endsWith('.diff')) {
    readFile(argv._[0], function(warnings) {
        if (warnings && warnings.length > 0) {
            warnings.forEach(function(item) {
                console.log(item.content.message);
            });

            var summary = warnings.length + ' warning(s) found';

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

function readFile(file, callback) {
    fs.readFile(file, "utf-8", function(err, data) {
        if (err) {
            console.error(err);
            callback(undefined);
        }
        findBug(data, function(warnings) {
            callback(warnings);
        });
    });
}

function findBug(diff, callback) {

    // Store New Warnings \ Old Warnings
    var warnings = [];

    var files = parse(diff);

    files.forEach(function(file) {
        file.chunks.forEach(function(chunk) {

            // Store all deletions and additions in the original orders
            var changes = [];

            for (var i = 0; i < chunk.changes.length; i++) {

                var change = chunk.changes[i];
                if (change.type === 'del' || change.type === 'add') {
                    if (containsWarning(change) && !shouldFilterWarning(change)) {
                        changes.push(parseWarning(change));
                    }

                    if (change.content.startsWith('+|  Warnings          :')) {
                        warningsTotal = getWarningsTotal(change.content);
                    }
                }
            }

            warnings = warnings.concat(filterChanges(changes));
        });
    });

    callback(warnings);
}

function parseWarning(change) {
    var decodedChange = JSON.parse(JSON.stringify(change));

    var components = change.content.split(':');
    var content = {
        message: change.content.substring(1),
        filename: components[0].substring(1),
        startLine: Number(components[1]),
        startCol: Number(components[2].split('~')[0]),
        endLine: Number(components[2].split('~')[1]),
        endCol: Number(components[3]),
        warning: components[4].substring(1)
    }
    decodedChange.content = content;

    return decodedChange;
}

function isSameChange(delChange, addChange) {
    return delChange.content.filename === addChange.content.filename && delChange.content.startLine === addChange.content.startLine && delChange.content.warning === addChange.content.warning;
}

function filterChanges(changes) {
    var filteredIndex = [];
    var filteredChanges = [];

    for (var i = 0; i < changes.length; i++) {
        if (changes[i].type === 'del' && filteredIndex.indexOf(i) === -1) {
            var del = changes[i];

            for (var j = i + 1; j < changes.length; j++) {
                if (changes[j].type === 'add' && filteredIndex.indexOf(j) === -1) {
                    var add = changes[j];

                    if (isSameChange(del, add)) {
                        filteredIndex.push(i, j);
                    }
                }
            }
        }
    }

    for (var i = 0; i < changes.length; i++) {
        if (filteredIndex.indexOf(i) === -1 && changes[i].type === 'add')
            filteredChanges.push(changes[i]);
    }

    return (filteredChanges);
}

function containsWarning(change) {
    return change.content.indexOf('[Warning]') > -1
}

function shouldFilterWarning(change) {
    var content = change.content;

    // Conditional expression [expr] is always true / false
    if (content.indexOf('Conditional expression') > -1 && content.indexOf('is always') > -1) {
        return true;
    }

    // Too many / few arguments to function
    if (content.indexOf('Too many arguments to function') > -1 || content.indexOf('Too few arguments to function') > -1) {
        return true;
    }

    // Reading absent property [prop] of object [obj], where property [prop] can be [val].
    if (content.indexOf('Reading absent property') > -1 && content.indexOf('where property') > -1 && content.indexOf('can be') > -1) {
        return true;
    }

    // [nth] argument of [prop] should be a [type] type.
    if (content.indexOf('argument of') > -1 && content.indexOf('should be') > -1 && content.indexOf('type') > -1) {
    	return true;
    }

    if (argv.filter) {
        var filter = argv.filter;

        if (isDirectoryExists(filter)) {
        	// Filter warnings based on the JavaScript files in a directory
            var files = fs.readdirSync(filter);
            for (var i in files) {
            	if (files[i].endsWith('.js') && content.substring(1).startsWith(files[i])) {
            		return true;
            	}
            }
        } else {
            // Filter warnings based on filename
            if (content.substring(1).startsWith(filter)) {
                return true;
            }
        }
    }

    return false;
}

function getWarningsTotal(content) {
    var tokens = content.split(' ');

    for (var i in tokens) {
        var result = parseInt(tokens[i]);

        if (!isNaN(result)) {
            return result;
        }
    }

    return 0;
}

function isDirectoryExists(dir) {
    try {
        fs.statSync(dir);
        return true;
    } catch (e) {
        return false;
    }
}

function help() {
    console.log('Usage');
    console.log('\tnode index.js path/to/diff [options]\n');
    console.log('\t--filter=[directory | filename]');
}

module.exports = {
    readFile: readFile,
    findBug: findBug,
    parseWarning: parseWarning,
    isSameChange: isSameChange,
    filterChanges: filterChanges,
    shouldFilterWarning: shouldFilterWarning,
    getWarningsTotal: getWarningsTotal
}
