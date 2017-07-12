test('isSameChange', function () {
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

    assert.ok(isSameChange(delChange, addChange), 'Both changes are the same');
});

test('filterChanges', function () {
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
    assert.ok(filteredChanges.length === 0, 'Same changes filtered');
});

test('read a diff with 1 warning', function (assert) {
    assert.expect(1);
    var done = assert.async(1);

    setTimeout(function () {
        var config = {
            'file': 'test/examples/warning1.diff'
        };
        readFile(config, function (warnings) {
            assert.ok(warnings.length === 1, '1 warning found');
            done();
        });
    }, 0);
});

test('read a diff with no warnings', function (assert) {
    assert.expect(1);
    var done = assert.async(1);

    setTimeout(function () {
        var config = {
            'file': 'test/examples/nowarning1.diff'
        };
        readFile(config, function (warnings) {
            assert.ok(warnings.length === 0, 'No warnings found');
            done();
        });
    }, 0);
});

test('filter out conditional expression warnings', function () {
    var change = {
        type: 'add',
        add: true,
        ln: 123456,
        content: '-filename.js:7:1~7:17: [Warning] Conditional expression \'cond === null\' is always true.'
    };

    assert.ok(shouldFilterWarning(change), 'Condition expression warnings filtered');
});

test('filter out too many arguments warnings', function () {
    var change = {
        type: 'add',
        add: true,
        ln: 123456,
        content: '-filename.js:7:1~7:17: [Warning] Too many arguments to function \'foo\'.'
    };

    assert.ok(shouldFilterWarning(change), 'Too many arguments warnings filtered');
});

test('filter out too few arguments warnings', function () {
    var change = {
        type: 'add',
        add: true,
        ln: 123456,
        content: '-filename.js:7:1~7:17: [Warning] Too few arguments to function \'foo\'.'
    };

    assert.ok(shouldFilterWarning(change), 'Too few arguments warnings filtered');
});

test('filter out absent property with dynamic values warnings', function () {
    var change = {
        type: 'add',
        add: true,
        ln: 123456,
        content: '-filename.js:7:1~7:17: [Warning] Reading absent property \'prop\' of object \'obj\', where property \'prop\' can be "val".'
    };

    assert.ok(shouldFilterWarning(change), 'Absent property with dynamic values filtered');
});

test('filter out nth argument of prop should be of certain type', function () {
    var change = {
        type: 'add',
        add: true,
        ln: 123456,
        content: '-filename.js:7:1~7:17: [Warning] First argument of \'prop\' should be an object type.'
    };

    assert.ok(shouldFilterWarning(change), 'Argument of certain type filtered');
});

test('filter out warnings based on filename', function () {
    var change = {
        type: 'add',
        add: true,
        ln: 123456,
        content: '-filename.js:7:1~7:17: [Warning] Random message.'
    };

    assert.ok(shouldFilterWarning(change, 'filename.js'), 'Warnings from filename filtered');
});

test('filter out warnings based on directory', function () {
    var change = {
        type: 'add',
        add: true,
        ln: 123456,
        content: '-filename.js:7:1~7:17: [Warning] Random message.'
    };

    assert.ok(shouldFilterWarning(change, 'test/examples'), 'Warnings from directory filtered');
});

test('filter out warnings independent of developer mode', function () {
    var change = {
        type: 'add',
        add: true,
        ln: 123456,
        content: '-filename.js:7:1~7:17: [Warning] Random message.'
    };

    assert.ok(shouldFilterWarning(change, 'filename.js', true), 'Warnings from filename filtered with developer mode');
    assert.ok(shouldFilterWarning(change, 'filename.js', false), 'Warnings from filename filtered without developer mode');
    assert.ok(shouldFilterWarning(change, 'test/examples', true), 'Warnings from directory filtered with developer mode');
    assert.ok(shouldFilterWarning(change, 'test/examples', false), 'Warnings from directory filtered without developer mode');
});

test('filter nothing in developer mode', function () {
    var change = {
        type: 'add',
        add: true,
        ln: 123456,
        content: '-filename.js:7:1~7:17: [Warning] Random message.'
    };

    assert.ok(!shouldFilterWarning(change, undefined, true), 'No warnings filtered');
});


test('extract the total number of warnings', function () {
    var content = '+|  Warnings          :     7 (100.00%) |';
    assert.ok(computeWarningsTotal(content) === 7, 'Total number of warnings extracted');
});
