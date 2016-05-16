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

test('read a diff with 2 warnings', function() {
    expect(1);
    stop();

    setTimeout(function() {
        readFile('test/examples/warning1.diff', function(warnings) {
            ok(warnings.length === 2, '2 warnings found');
        });
        start();
    }, 0);
});

test('read a diff with no warnings', function() {
    expect(1);
    stop();

    setTimeout(function() {
        readFile('test/examples/nowarning1.diff', function(warnings) {
            ok(warnings.length === 0, 'No warnings found');
        });
        start();
    }, 0);
});
