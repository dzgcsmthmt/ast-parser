module.exports = test => {
    test(`let x = 2;`,{
        type: 'Program',
        body: [
            {
                type: 'VariableDeclaration',
                kind: 'let',
                declarations: [
                    {
                        type: 'VariableDeclarator',
                        id: {
                            type: 'Identifier',
                            name: 'x'
                        },
                        init: {
                            type: 'NumericLiteral',
                            value: 2
                        }
                    }
                ]
            }
        ]
    })

    test(`var x;`,{
        type: 'Program',
        body: [
            {
                type: 'VariableDeclaration',
                kind: 'var',
                declarations: [
                    {
                        type: 'VariableDeclarator',
                        id: {
                            type: 'Identifier',
                            name: 'x'
                        },
                        init: null
                    }
                ]
            }
        ]
    })

    test(`let x,y = 3;`,{
        type: 'Program',
        body: [
            {
                type: 'VariableDeclaration',
                kind: 'let',
                declarations: [
                    {
                        type: 'VariableDeclarator',
                        id: {
                            type: 'Identifier',
                            name: 'x'
                        },
                        init: null
                    },
                    {
                        type: 'VariableDeclarator',
                        id: {
                            type: 'Identifier',
                            name: 'y'
                        },
                        init: {
                            type: 'NumericLiteral',
                            value: 3
                        }
                    }
                ]
            }
        ]
    })
}