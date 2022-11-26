module.exports = test => {
    test(`x > 1 && y < 4;`,{
        type: 'Program',
        body: [
            {
                type: 'ExpressionStatement',
                expression: {
                    type: 'LogicalExpression',
                    operator: '&&',
                    left: {
                        type: 'BinaryExpression',
                        operator: '>',
                        left: {
                            type: 'Identifier',
                            name: 'x'
                        },
                        right: {
                            type: 'NumericLiteral',
                            value: 1
                        }
                    },
                    right: {
                        type: 'BinaryExpression',
                        operator: '<',
                        left: {
                            type: 'Identifier',
                            name: 'y'
                        },
                        right: {
                            type: 'NumericLiteral',
                            value: 4
                        }
                    }
                }
            }
        ]
    })
}