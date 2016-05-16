# diffparser

[![Build Status](https://travis-ci.org/waitingcheung/diffparser.svg?branch=master)](https://travis-ci.org/waitingcheung/diffparser)
[![codecov](https://codecov.io/gh/waitingcheung/diffparser/branch/master/graph/badge.svg)](https://codecov.io/gh/waitingcheung/diffparser)

A parser for parsing the unified diff of the outputs of [SAFE]. 

### Usage

```sh
node index path/to/diff
```

### Unified Diff Example
```sh
 * Bug Detector *
 # Time for worklist order computation(s): 0.01
-arrays_1_9.js:5:1~5:14: [Warning] Too few arguments to function '_.first'.
+arrays_1_9.js:5:1~5:15: [Warning] Too few arguments to function '_.first'.
 underscore.js:19:28~19:34: [Warning] Reading absent property '_' of object 'root'.
 underscore.js:23:21~23:50: [Warning] Conditional expression 'typeof Symbol !== 'undefined'' is always false.
 underscore.js:68:9~68:27: [Warning] Conditional expression 'context === void 0' is always true.
@@ -158298,7 +158302,8 @@
 underscore.js:421:15~423:5: [Warning] Too few arguments to function 'group'.
 underscore.js:427:15~429:5: [Warning] Too few arguments to function 'group'.
 underscore.js:434:15~436:5: [Warning] Too few arguments to function 'group'.
-underscore.js:470:9~470:22: [Warning] Conditional expression 'array == null' is always true.
+underscore.js:471:9~471:18: [Warning] Implicit type-conversion in equality comparison 'undefined == null'.
+underscore.js:471:9~471:27: [Warning] Conditional expression 'n == null || guard' is always true.
 underscore.js:530:15~532:5: [Warning] Too few arguments to function 'restArgs'.
 underscore.js:566:13~568:5: [Warning] Too few arguments to function 'restArgs'.
 underscore.js:589:18~594:5: [Warning] Too few arguments to function 'restArgs'.
@@ -158330,7 +158335,7 @@
 |  SyntaxErrors      :      0 (  0.00%) |
 |  TypeErrors        :      0 (  0.00%) |
 |  URIErrors         :      0 (  0.00%) |
-|  Warnings          :     39 (100.00%) |
+|  Warnings          :     40 (100.00%) |
 =========================================
 ============ Statistics =============
 |  AbsentRead              :      1 |
@@ -158346,7 +158351,7 @@
 |  Deprecated              :      0 |
 |  FunctionArgSize         :     27 |
 |  GlobalThis              :      0 |
-|  ImplicitTypeConversion  :      1 |
+|  ImplicitTypeConversion  :      2 |
 |  AccessingNullOrUndef    :      0 |
 |  PrimitiveToObject       :      0 |
 |  RangeError              :      0 |
@@ -158360,5 +158365,5 @@
 |  RegularExpression       :      0 |
 |  WrongArgument           :      0 |
 =====================================
```

### Output
```sh
underscore.js:471:9~471:18: [Warning] Implicit type-conversion in equality comparison 'undefined == null'.
underscore.js:471:9~471:27: [Warning] Conditional expression 'n == null || guard' is always true.
```


[SAFE]: https://github.com/sukyoung/safe
