const { Parser } = require('../src/parser.js');
const assert = require('assert');
const tests = [
    require('./literal-test'),
    require('./statement-list-test'),
    require('./block-test'),
    require('./empty-statement-test'),
    require('./math-test'),
    require('./assignment-test'),
    require('./variable-test'),
    require('./if-test'),
    require('./logical-test'),
    require('./unary-test'),
    require('./while-test'),
    require('./function-declaration-test'),
    require('./member-test'),
    require('./class-test'),
];

const parser = new Parser();

function exec() {
    const program = `
        class Point{
            function aaa(x){
            }
        }
    `;
    const ast = parser.parse(program);
    console.log(JSON.stringify(ast, null, 2));
}

function test(program, expected) {
    const ast = parser.parse(program);
    assert.deepEqual(ast, expected);
}

// exec()

tests.forEach(testRun => testRun(test));
console.log('All assertions passed')