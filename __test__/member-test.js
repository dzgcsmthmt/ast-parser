module.exports = test => {
    test(`x.y;`,{
        type:'Program',
        body: [
            {
                type: 'ExpressionStatement',
                expression: {
                    type:'MemberExpression',
                    computed: false,
                    object: {
                        type:'Identifier',
                        name: 'x'
                    },
                    property:{
                        type: 'Identifier',
                        name: 'y'
                    }
                }
            }
        ]
    })
}