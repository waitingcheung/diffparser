test('isSameChange', function() {
    var delChange = {
        type: 'del',
        del: true,
        ln: 123456,
        content: '-filename.js:7:1~7:17: [Warning] Conditional expression \'cond === null\' is always true.'
    };

    var addChange = {
        type: 'add',
        add: true,
        ln: 123456,
        content: '-filename.js:7:1~7:17: [Warning] Conditional expression \'cond === null\' is always true.'
    };

    ok(isSameChange(delChange, addChange), 'Both changes are the same');
});

test('filterChanges', function() {
    var delChange = {
        type: 'del',
        del: true,
        ln: 123456,
        content: '-filename.js:7:1~7:17: [Warning] Conditional expression \'cond === null\' is always true.'
    };

    var addChange = {
        type: 'add',
        add: true,
        ln: 123456,
        content: '-filename.js:7:1~7:17: [Warning] Conditional expression \'cond === null\' is always true.'
    };

    var changes = [delChange, addChange];
    var filteredChanges = filterChanges(changes);
    ok(filteredChanges.length == 0, 'Same changes filtered');
});

test('read a diff with 1 warning', function() {
    expect(1);
    stop();

    setTimeout(function() {
        readFile('test/examples/warning1.diff', function(warnings) {
            ok(warnings.length === 1, '1 warning found');
            start();
        });
    }, 0);
});

test('read a diff with no warnings', function() {
    expect(1);
    stop();

    setTimeout(function() {
        readFile('test/examples/nowarning1.diff', function(warnings) {
            ok(warnings.length === 0, 'No warnings found');
            start();
        });
    }, 0);
});

test('filter out conditional expression warnings', function() {
    var change = {
        type: 'add',
        add: true,
        ln: 123456,
        content: '-filename.js:7:1~7:17: [Warning] Conditional expression \'cond === null\' is always true.'
    };

    ok(shouldFilterWarning(change), 'Condition expression warnings filtered');
});

test('filter out too many arguments warnings', function() {
    var change = {
        type: 'add',
        add: true,
        ln: 123456,
        content: '-filename.js:7:1~7:17: [Warning] Too many arguments to function \'foo\'.'
    };

    ok(shouldFilterWarning(change), 'Too many arguments warnings filtered');
});

test('filter out too few arguments warnings', function() {
    var change = {
        type: 'add',
        add: true,
        ln: 123456,
        content: '-filename.js:7:1~7:17: [Warning] Too few arguments to function \'foo\'.'
    };

    ok(shouldFilterWarning(change), 'Too few arguments warnings filtered');
});

test('filter out absent property with dynamic values warnings', function() {
    var change = {
        type: 'add',
        add: true,
        ln: 123456,
        content: '-filename.js:7:1~7:17: [Warning] Reading absent property \'prop\' of object \'obj\', where property \'prop\' can be "val".'
    };

    ok(shouldFilterWarning(change), 'Absent property with dynamic values filtered');
});

test('filter out nth argument of prop should be of certain type', function() {
    var change = {
        type: 'add',
        add: true,
        ln: 123456,
        content: '-filename.js:7:1~7:17: [Warning] First argument of \'prop\' should be an object type.'
    };

    ok(shouldFilterWarning(change), 'Argument of certain type filtered');
});

test('extract the total number of warnings', function() {
    var content = '+|  Warnings          :     7 (100.00%) |';
    ok(getWarningsTotal(content) === 7, 'Total number of warnings extracted');
});
