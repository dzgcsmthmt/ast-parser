export default [
    //symbol
    [/^;/,';'],
    [/^,/,','],
    [/^{/,'{'],
    [/^}/,'}'],
    [/^\(/,'('],
    [/^\)/,')'],
    
    //member expression
    [/^\./,'.'],
    [/^\[/,'['],
    [/^\]/,']'],

    //space
    [/^\s+/,null],

    //comments
    [/^\/\/.*/,null],
    [/^\/\*[\s\S]*?\*\//,null],

    //number literal
    [/^\d+/,'NUMBER'],

    //string literal
    [/^'[^']*'/,'STRING'],
    [/^"[^"]*"/,'STRING'],

    //boolean literal
    [/^(true|false)\b/,'BOOLEAN'],

    //null literal
    [/^null\b/,'NULL'],

    //Declaration
    [/^(let|var|const)/,'DECLARATION'],
    
    //If statement
    [/^if/,'if'],
    [/^else/,'else'],

    //Iteration Statements
    [/^while/,'while'],
    [/^for/,'for'],

    //Function Declaration
    [/^function/,'function'],
    [/^return/,'return'],

    //this
    [/^this/,'this'],
    
    //Relational Operators < > >= <=
    [/^[><]=?/,'RELATIONAL_OPERATOR'],
    
    //Equality Operators
    [/^[=!]==?/,'EQUALITY_OPERATOR'],

    //Logical
    [/^&&/,'LOGICAL_AND'],
    [/^\|\|/,'LOGICAL_OR'],

     //assignment Opetators = *=	/=	+=	-=
     [/^=/,'SIMPLE_ASSIGN'],
     [/^[\*\/\+\-]=/,'COMPLEX_ASSIGN'],
    
    //Unary Operators
    [/^\!/,'LOGICAL_NOT'],

    //Additive Operator || Unary Operators
    [/^[+\-]/,'ADDITIVE_OPERATOR'],
    
    //Multiplicative Operator
    [/^[\*\/]/,'MULTIPLICATIVE_OPERATOR'],

    //identifier
    [/^\w+/,'IDENTIFIER']
    
]