var fs = require('fs');
var parse = require('parse-diff');
var warningsTotal;

function readFile(config, callback) {
    warningsTotal = 0;
    fs.readFile(config.file, "utf-8", function(err, data) {
        if (err) {
            console.error(err);
            callback(undefined);
        } else {
            findBug(data, config, function(warnings) {
                callback(warnings);
            });
        }
    });
}

function findBug(diff, config, callback) {
    
    // Store New Warnings \ Old Warnings
    var warnings = [];
    var files;

    try {
        files = parse(diff);
        files.forEach(function(file) {
            file.chunks.forEach(function(chunk) {

                // Store all deletions and additions in the original orders
                var changes = [];

                for (var i = 0; i < chunk.changes.length; i++) {

                    var change = chunk.changes[i];
                    if (change.type === 'del' || change.type === 'add') {
                        if (containsWarning(change) && !shouldFilterWarning(change, config.filterPath, config.developerMode)) {
                            changes.push(parseWarning(change));
                        }

                        if (change.content.startsWith('+|  Warnings          :')) {
                            warningsTotal = computeWarningsTotal(change.content);
                        }
                    }
                }

                warnings = warnings.concat(filterChanges(changes));
            });
        });
    } catch (err) {
        console.error(err);
    } finally {
        callback(warnings);
    }
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

function shouldFilterWarning(change, filterPath, developerMode) {
    // Do not filter any warnings in developer mode.
    if (developerMode) {
        return false;
    }

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

    if (filterPath) {
        if (isDirectoryExists(filterPath)) {
            // Filter warnings based on the JavaScript files in a directory
            var files = fs.readdirSync(filterPath);
            for (var i in files) {
                if (files[i].endsWith('.js') && content.substring(1).startsWith(files[i])) {
                    return true;
                }
            }
        } else {
            // Filter warnings based on filename
            if (content.substring(1).startsWith(filterPath)) {
                return true;
            }
        }
    }

    return false;
}

function computeWarningsTotal(content) {
    var tokens = content.split(' ');

    for (var i in tokens) {
        var result = parseInt(tokens[i]);

        if (!isNaN(result)) {
            return result;
        }
    }

    return 0;
}

function getWarningsTotal() {
    return warningsTotal;
}

function isDirectoryExists(dir) {
    try {
        fs.statSync(dir);
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = {
    readFile: readFile,
    findBug: findBug,
    parseWarning: parseWarning,
    isSameChange: isSameChange,
    filterChanges: filterChanges,
    shouldFilterWarning: shouldFilterWarning,
    computeWarningsTotal: computeWarningsTotal,
    getWarningsTotal: getWarningsTotal
}
