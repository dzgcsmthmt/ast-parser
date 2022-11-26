module.exports = test => {
    test(`
        foo(x);
    `,{
        type: 'Program',
        body: [
            {
                type: 'ExpressionStatement',
                expression: {
                    type:'CallExpression',
                    callee:{
                        type:'Identifier',
                        name: 'foo'
                    },
                    arguments: [
                        {
                            type:'Indentifier',
                            name: 'x'
                        }
                    ]
                }
            }
        ]
    });

}