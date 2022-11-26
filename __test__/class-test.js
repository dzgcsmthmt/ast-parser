module.exports = test => {
    test(`
        class Point{
            function aaa(x){
            }
        }
    `, {
        "type": "Program",
        "body": [
            {
                "type": "ClassDeclaration",
                "id": {
                    "type": "Identifier",
                    "name": "Point"
                },
                "body": {
                    "type": "BlockStatement",
                    "body": [
                        {
                            "type": "FunctionDeclaration",
                            "id": {
                                "type": "Identifier",
                                "name": "aaa"
                            },
                            "params": [
                                {
                                    "type": "Identifier",
                                    "name": "x"
                                }
                            ],
                            "body": {
                                "type": "BlockStatement",
                                "body": []
                            }
                        }
                    ]
                }
            }
        ]
    })
}