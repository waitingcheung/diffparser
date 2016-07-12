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
