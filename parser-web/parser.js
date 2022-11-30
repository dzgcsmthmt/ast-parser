import Tokenizer from './tokenizer.js'

class Parser {
    constructor() {
        this._string = '';
        this._tokenizer = new Tokenizer();
    }

    parse(string) {
        this._string = string;
        this._tokenizer.init(string);
        this._lookahead = this._tokenizer.getNextToken();
        return this.Program();
    }

    Program() {
        return {
            type: 'Program',
            body: this.statementList()
        }
    }

    statementList(stopLookahead = null) {
        const statementList = [this.statement()];
        while (this._lookahead != null && this._lookahead.type !== stopLookahead) {
            statementList.push(this.statement());
        }
        return statementList;
    }

    statement() {
        switch (this._lookahead.type) {
            case ';':
                return this.emptyStatement();
            case '{':
                return this.blockStatement();
            case 'DECLARATION':
                return this.variableStatement();
            case 'if':
                return this.IfStatement();
            case 'while':
                return this.whileStatement();
            case 'for':
                return this.forStatement();
            case 'function':
                return this.functionStatement();
            case 'return':
                return this.returnStatement();
            default:
                return this.expressionStatement();
        }
    }

    emptyStatement() {
        this._eat(';');
        return {
            type: 'EmptyStatement'
        }
    }

    blockStatement() {
        this._eat('{');
        let body = this._lookahead.type !== '}' ? this.statementList('}') : [];
        this._eat('}');
        return {
            type: 'BlockStatement',
            body
        }
    }

    /***
     *  IfStatement :
            if ( Expression ) Statement else Statement
            if ( Expression ) Statement
     */
    IfStatement() {
        this._eat('if');
        this._eat('(');
        const test = this.expression();
        this._eat(')');
        const consequent = this.statement();
        const alternate = this._lookahead !== null && this._lookahead.type === 'else'
            ? this._eat('else') && this.statement() : null;
        return {
            type: 'IfStatement',
            test,
            consequent,
            alternate
        }
    }

    //while ( Expression ) Statement
    whileStatement() {
        this._eat('while');
        this._eat('(');
        const test = this.expression();
        this._eat(')');
        const body = this.statement();
        return {
            type: 'WhileStatement',
            test,
            body
        }
    }

    //for ( var VariableDeclarationListNoIn ; Expressionopt ; Expressionopt )
    forStatement() {
        this._eat('for');
        this._eat('(');
        const init = this._lookahead.type === ';' ? null : this.variableStatement();
        if (init === null) this._eat(';');
        const test = this._lookahead.type === ';' ? null : this.expression();
        this._eat(';');
        const update = this._lookahead.type === ')' ? null : this.expression();
        this._eat(')');
        const body = this.statement();
        return {
            type: 'ForStatement',
            init,
            test,
            update,
            body
        }
    }

    /**
     *  FunctionDeclaration :
            function Identifier ( FormalParameterList ) { FunctionBody }
        FunctionExpression :
            function Identifier ( FormalParameterList ) { FunctionBody }
        FormalParameterList :
            Identifier
            FormalParameterList , Identifier
        FunctionBody :
            SourceElements
     *
     */
    functionStatement() {
        this._eat('function');
        const id = this.identifier();
        this._eat('(');
        const params = this._lookahead.type === ')' ? [] : this.formalParameterList();
        this._eat(')');
        const body = this.statement();
        return {
            type: 'FunctionDeclaration',
            id,
            params,
            body
        }
    }

    formalParameterList() {
        let params = [];
        do {
            params.push(this.identifier());
        } while (this._lookahead.type == ',' && this._eat(','))

        return params;
    }

    /**
     *  ReturnStatement :
            return ;
            return [no LineTerminator here] Expression ;
     */
    returnStatement() {
        this._eat('return');
        const argument = this._lookahead.type === ';' ? null : this.expression();
        this._eat(';')
        return {
            type: 'ReturnStatement',
            argument
        }
    }

    /**
     *  VariableStatement :
            var VariableDeclarationList ;

        VariableDeclarationList :
            VariableDeclaration
            VariableDeclarationList , VariableDeclaration

        VariableDeclaration :
            Identifier Initialiser

        Initialiser :
        = AssignmentExpression
     * 
     */
    variableStatement() {
        const kind = this._eat('DECLARATION').value;
        const declarations = this.variableDeclarationList();
        this._eat(';');
        return {
            type: 'VariableDeclaration',
            kind,
            declarations
        }

    }

    variableDeclarationList() {
        let declarations = [];
        do {
            declarations.push(this.variableDeclaration());
        } while (this._lookahead.type === ',' && this._eat(','))
        return declarations;
    }

    variableDeclaration() {
        const id = this.identifier();
        const init = (this._lookahead.type === ';' || this._lookahead.type === ',') ? null : this.variableInitialiser();
        return {
            type: 'VariableDeclarator',
            id,
            init
        }
    }

    variableInitialiser() {
        this._eat('SIMPLE_ASSIGN');
        return this.assignmentExpression();
    }

    expressionStatement() {
        const expression = this.expression();
        this._eat(';');
        return {
            type: 'ExpressionStatement',
            expression
        }
    }

    expression() {
        return this.assignmentExpression();
    }



    /**
     * AssignmentExpression :
        ConditionalExpression
        LeftHandSideExpression = AssignmentExpression
        LeftHandSideExpression AssignmentOperator AssignmentExpression
     */
    assignmentExpression() {
        const left = this.LogicalORExpression();
        if (!this._isAssignmentOperator(this._lookahead.type)) {
            return left;
        }
        return {
            type: 'AssignmentExpression',
            operator: this._assignmentOperator().value,
            left: this._checkValidAssignmentTarget(left),
            right: this.expression()
        }
    }

    LogicalORExpression() {
        return this._logicalExpression('LogicalANDExpression', 'LOGICAL_OR');
    }

    LogicalANDExpression() {
        return this._logicalExpression('equalityExpression', 'LOGICAL_AND');
    }

    _logicalExpression(expressionType, operatorType) {
        let left = this[expressionType]();
        while (this._lookahead && this._lookahead.type === operatorType) {
            const operator = this._eat(operatorType).value;
            const right = this[expressionType]();
            left = {
                type: 'LogicalExpression',
                operator,
                left,
                right
            }
        }
        return left;
    }

    equalityExpression() {
        return this._binaryExpression('relationalExpression', 'EQUALITY_OPERATOR');
    }

    relationalExpression() {
        return this._binaryExpression('additiveExpression', 'RELATIONAL_OPERATOR')
    }

    additiveExpression() {
        return this._binaryExpression('multiplicativeExpression', 'ADDITIVE_OPERATOR');
    }

    multiplicativeExpression() {
        return this._binaryExpression('unaryExpression', 'MULTIPLICATIVE_OPERATOR');
    }

    _binaryExpression(expressionType, operatorType) {
        let left = this[expressionType]();
        while (this._lookahead && this._lookahead.type === operatorType) {
            const operator = this._eat(operatorType).value;
            const right = this[expressionType]();
            left = {
                type: 'BinaryExpression',
                operator,
                left,
                right
            }
        }
        return left;
    }

    unaryExpression() {
        let operator;
        switch (this._lookahead.type) {
            case 'ADDITIVE_OPERATOR':
                operator = this._eat('ADDITIVE_OPERATOR').value;
                break;
            case 'LOGICAL_NOT':
                operator = this._eat('LOGICAL_NOT').value;
        }
        if (operator) {
            return {
                type: 'UnaryExpression',
                operator,
                argument: this.unaryExpression()
            }
        }

        return this.leftHandSideExpression();
    }

    leftHandSideExpression() {
        return this.callMemberExpression();
    }

    /**
     *  CallExpression :
            MemberExpression Arguments
            CallExpression Arguments
            CallExpression [ Expression ]
            CallExpression . IdentifierName
        Arguments :
            ( )
            ( ArgumentList )
        ArgumentList :
            AssignmentExpression
            ArgumentList , AssignmentExpression
     * 
     */
    callMemberExpression(){
        let member = this.memberExpression();
        if(this._lookahead.type === '('){
            return this.callExpression(member);
        }
        return member;
    }

    callExpression(callee){
        const callExp = {
            type: 'CallExpression',
            callee,
            arguments: this.arguments()

        }
        if(this._lookahead.type === '('){
            return this.callExpression(callExp);
        }
        return callExp;
    }

    arguments(){
        this._eat('(');
        const argList = this._lookahead.type === ')' ? [] : this.argumentList();
        this._eat(')');
        return argList; 
    }

    argumentList(){
        let args = [];
        do{
            args.push(this.assignmentExpression());
        }while(this._lookahead.type === ',' && this._eat(','));
        return args;
    }

    /**
    *   MemberExpression :
           MemberExpression [ Expression ]
           MemberExpression . IdentifierName
    * 
    */
    memberExpression() {
        let object = this.primaryExpression();
        while(this._lookahead.type === '.' || this._lookahead.type === '['){
            if(this._lookahead.type === '.'){
                this._eat('.');
                const property = this.identifier();
                object = {
                    type: 'MemberExpression',
                    computed: false,
                    object,
                    property
                }
            }
            if(this._lookahead.type === '['){
                this._eat('[');
                const property = this.expression();
                this._eat(']');
                object = {
                    type: 'MemberExpression',
                    computed: true,
                    object,
                    property
                }
            }
        }
        return object;
    }

    primaryExpression() {
        if (this._isLiteral(this._lookahead.type)) {
            return this.literal();
        }
        switch (this._lookahead.type) {
            case '(':
                return this.parenthesesExpression();
            case 'IDENTIFIER':
                return this.identifier();
            case 'this':
                return this.thisExpression();
            default:
                return this.leftHandSideExpression();
        }
    }

    parenthesesExpression() {
        this._eat('(');
        const expression = this.expression();
        this._eat(')');
        return expression;
    }

    thisExpression(){
        this._eat('this');
        return {
            type: 'ThisExpression'
        }
    }

    identifier() {
        const name = this._eat('IDENTIFIER').value;
        return {
            type: 'Identifier',
            name
        }
    }

    literal() {
        switch (this._lookahead.type) {
            case 'NUMBER':
                return this.numericLiteral();
            case 'STRING':
                return this.stringLiteral();
            case 'BOOLEAN':
                return this.booleanLiteral();
            case 'NULL':
                return this.nullLiteral();
        }

        throw new SyntaxError(`Literal: unexpected literal production`)
    }

    numericLiteral() {
        const token = this._eat('NUMBER');
        return {
            type: 'NumericLiteral',
            value: Number(token.value)
        }
    }

    stringLiteral() {
        const token = this._eat('STRING');
        return {
            type: 'StringLiteral',
            value: token.value.slice(1, -1)
        }
    }

    booleanLiteral() {
        const token = this._eat('BOOLEAN');
        return {
            type: 'BooleanLiteral',
            value: token.value === 'true' ? true : false
        }
    }

    nullLiteral() {
        this._eat('NULL');
        return {
            type: 'NullLiteral'
        }
    }

    _isAssignmentOperator(type) {
        return type === 'SIMPLE_ASSIGN' || type === 'COMPLEX_ASSIGN';
    }

    _assignmentOperator() {
        if (this._lookahead.type === 'SIMPLE_ASSIGN') {
            return this._eat('SIMPLE_ASSIGN');
        }
        return this._eat('COMPLEX_ASSIGN');
    }

    _checkValidAssignmentTarget(node) {
        if (node.type === 'Identifier' || node.type === 'MemberExpression') {
            return node;
        }
        throw new SyntaxError('Invalid left-hand side in assignment expression');
    }

    _isLiteral(type) {
        return type === 'NUMBER' || type === 'STRING' || type === 'BOOLEAN' || type === 'NULL';
    }


    _eat(tokenType) {
        const token = this._lookahead
        if (token === null) {
            throw new SyntaxError(`Unexpected end of input,expected:"${tokenType}"`);
        }
        if (token.type !== tokenType) {
            throw new SyntaxError(`Unexpected token:"${token.type}",expected:"${tokenType}"`)
        }
        this._lookahead = this._tokenizer.getNextToken();
        return token;
    }
}

export default Parser;