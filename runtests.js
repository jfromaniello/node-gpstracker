//this file is used by the npm test script to run all the tests in the project.
var exec = require("child_process").exec,
    runTests = "NODE_ENV=test " +
               "    mocha " +
               "    --reporter min" +
               "    --require should" +
               "    --colors",
    runningTests = exec(runTests);
runningTests.stdout.pipe(process.stdout);
runningTests.stderr.pipe(process.stderr);