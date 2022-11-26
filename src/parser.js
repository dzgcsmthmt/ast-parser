const { Tokenizer } = require('./tokenizer');

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
            body: this.StatementList()
        };
    }

    StatementList(stopLookahead = null) {
        let statementList = [this.Statement()];
        while (this._lookahead !== null && this._lookahead.type !== stopLookahead) {
            statementList.push(this.Statement())
        }
        return statementList;
    }

    Statement() {
        switch (this._lookahead.type) {
            case ';':
                return this.EmptyStatement();
            case '{':
                return this.BlockStatement();
            case 'if':
                return this.IfStatement();
            case 'while':
                return this.WhileStatement();
            case 'dec':
                return this.VariableStatement();
            case 'return':
                return this.ReturnStatement();
            case 'function':
                return this.FunctionDeclarationStatement();
            case 'class':
                return this.ClassDeclaration();
            default:
                return this.ExpressionStatement();
        }
    }

    ClassDeclaration(){
        this._eat('class');
        const id = this.Identifier();
        const body = this.BlockStatement();
        return {
            type: 'ClassDeclaration',
            id,
            body
        }
    }

    FunctionDeclarationStatement(){
        this._eat('function');
        const id = this.Identifier();
        this._eat('(');
        const params = this._lookahead.type != ')' ? this.FormalParameterList() : [];
        this._eat(')');

        return {
            type: 'FunctionDeclaration',
            id,
            params,
            body: this.BlockStatement()
        }
    }

    FormalParameterList(){
        let params = [];
        do{
            params.push(this.Identifier());
        }while(this._lookahead.type === ',' && this._eat(','))
        return params;
    }

    ReturnStatement(){
        this._eat('return');
        const argument = this.Expression();
        this._eat(';')
        return {
            type: 'ReturnStatement',
            argument
        }
    }

    WhileStatement(){
        this._eat('while');
        this._eat('(');
        const test = this.Expression();
        this._eat(')');
        const body = this.Statement();
        return {
            type: 'WhileStatement',
            test,
            body
        }
    }

    IfStatement() {
        this._eat('if');
        this._eat('(');
        const test = this.Expression();
        this._eat(')');

        const consequent = this.Statement();

        const alternate = this._lookahead !== null && this._lookahead.type === 'else'
            ? this._eat('else') && this.Statement() : null;

        return {
            type: "IfStatement",
            test,
            consequent,
            alternate
        }

    }

    VariableStatement() {
        let kind = this._eat('dec').value;
        const declarations = this.VariableDeclarationList();
        this._eat(';');

        return {
            type: 'VariableDeclaration',
            declarations,
            kind
        }
    }

    VariableDeclarationList() {
        let declarations = [];
        do {
            declarations.push(this.VariableDeclaration());
        } while (this._lookahead.type === ',' && this._eat(','))
        return declarations;
    }

    VariableDeclaration() {
        const id = this.Identifier();
        const init = this._lookahead.type !== ';' && this._lookahead.type !== ','
            ? this.VariableInitializer() : null;
        return {
            type: 'VariableDeclarator',
            id,
            init
        }
    }

    VariableInitializer() {
        this._eat('SIMPLE_ASSIGN');
        return this.AssignmentExpression();
    }

    EmptyStatement() {
        this._eat(';');
        return {
            type: 'EmptyStatement'
        }
    }

    BlockStatement() {
        this._eat('{');
        const body = this._lookahead.type !== '}' ? this.StatementList('}') : [];
        this._eat('}');
        return {
            type: 'BlockStatement',
            body
        }
    }

    ExpressionStatement() {
        const expression = this.Expression();
        this._eat(';');
        return {
            type: 'ExpressionStatement',
            expression
        }
    }

    Expression() {
        return this.AssignmentExpression();
    }

    LogicalORExpression(){
        return this._LogicalExpression('LogicalANDExpression','LOGICAL_OR')
    }

    LogicalANDExpression(){
        return this._LogicalExpression('EqualityExpression','LOGICAL_AND')
    }

    _LogicalExpression(builderName,operatorToken){
        let left = this[builderName]();
        while (this._lookahead.type === operatorToken) {
            const operator = this._eat(operatorToken).value;
            const right = this[builderName]();
            left = {
                type: 'LogicalExpression',
                operator,
                left,
                right
            }
        }
        return left;
    }

    AssignmentExpression() {
        const left = this.LogicalORExpression();
        // console.log('-----------',left)
        if (!this._isAssignmentOperator(this._lookahead.type)) {
            return left;
        }

        return {
            type: 'AssignmentExpression',
            operator: this.AssignmentOperator().value,
            left: this._checkValidAssignmentTarget(left),
            right: this.Expression()
        }
    }


    Identifier() {
        const name = this._eat('IDENTIFIER').value;
        return {
            type: 'Identifier',
            name
        }
    }


    _checkValidAssignmentTarget(node) {
        if (node.type === 'Identifier' || node.type === 'MemberExpression') return node;
        throw new SyntaxError('Invalid left-hand side in assignment expression')
    }

    _isAssignmentOperator(tokenType) {
        return tokenType === 'SIMPLE_ASSIGN' || tokenType === 'COMPLEX_ASSIGN';
    }

    AssignmentOperator() {
        if (this._lookahead.type === 'SIMPLE_ASSIGN') {
            return this._eat('SIMPLE_ASSIGN');
        }
        return this._eat('COMPLEX_ASSIGN');
    }

    EqualityExpression() {
        return this._BinaryExpression('RelationalExpression', 'EQUALITY_OPERATOR');
    }

    RelationalExpression() {
        return this._BinaryExpression('AdditiveExpression', 'RELATIONAL_OPERATOR');
    }

    AdditiveExpression() {
        return this._BinaryExpression('MultiplicativeExpression', 'ADDITIVE_OPERATOR');
    }

    MultiplicativeExpression() {
        return this._BinaryExpression('UnaryExpression', 'MULTIPLICATIVE_OPERATOR');
    }

    _BinaryExpression(builderName, operatorToken) {
        let left = this[builderName]();
        while (this._lookahead.type === operatorToken) {
            const operator = this._eat(operatorToken).value;
            const right = this[builderName]();
            left = {
                type: 'BinaryExpression',
                operator,
                left,
                right
            }
        }
        return left;
    }

    UnaryExpression(){
        let operator;
        switch(this._lookahead.type){
            case 'ADDITIVE_OPERATOR' :
                operator = this._eat('ADDITIVE_OPERATOR').value;
                break;
            case 'LOGICAL_NOT' :
                operator = this._eat('LOGICAL_NOT').value;
                break;
        }
        if(operator != null){
            return {
                type:'UnaryExpression',
                operator,
                argument: this.UnaryExpression()
            }
        }
        return this.LeftHandSideExpression();
    }

    
    LeftHandSideExpression() {
        return this.CallMemberExpression();
    }

    CallMemberExpression(){
        const member = this.MemberExpression();
        if(this._lookahead.type === '('){
            return this._CallExpression(member);
        }
        return member;
    }

    _CallExpression(callee){
        let callExpression = {
            type: 'CallExpression',
            callee,
            arguments: this.Arguments()
        }
        if(this._lookahead.type === '('){
            callExpression = this._CallExpression(callExpression);
        }
        return callExpression;
    }

    Arguments(){
        this._eat('(');
        const argumentList = this._lookahead.type != ')' ? this.ArgumentList() : []
        this._eat(')');
        return argumentList;
    }

    ArgumentList(){
        const argumentList = [];
        do{
            argumentList.push(this.AssignmentExpression());
        }while(this._lookahead.type === ',' && this._eat(','));

        return argumentList;
    }

    MemberExpression(){
        let object =  this.PrimaryExpression();
        while(this._lookahead.type === '.' || this._lookahead.type === '['){
            if(this._lookahead.type === '.'){
                this._eat('.');
                const property = this.Identifier();
                object = {
                    type: 'MemberExpression',
                    computed: false,
                    object,
                    property
                }
            }else{
                this._eat('[');
                const property = this.Expression();
                this._eat(']')
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

    PrimaryExpression() {
        if (this._isLiteral(this._lookahead.type)) {
            return this.Literal();
        }
        switch (this._lookahead.type) {
            case '(':
                return this.ParenthesizedExpression();
            case 'IDENTIFIER':
                return this.Identifier();
            default:
                return this.LeftHandSideExpression();
        }
    }

    ParenthesizedExpression() {
        this._eat('(');
        const expression = this.Expression();
        this._eat(')');
        return expression;
    }

    _isLiteral(tokenType) {
        return tokenType === 'NUMBER' || tokenType === 'STRING' || tokenType === 'true'
            || tokenType === 'false' || tokenType === 'null';
    }

    Literal() {
        switch (this._lookahead.type) {
            case 'NUMBER': return this.NumericLiteral();
            case 'STRING': return this.StringLiteral();
            case 'true': return this.BooleanLiteral(true);
            case 'false': return this.BooleanLiteral(false);
            case 'null': return this.NullLiteral();
        }
        throw new SyntaxError(`Literal: unexpected literal production`)
    }

    BooleanLiteral(value) {
        this._eat(value ? 'true' : 'false');
        return {
            type: 'BooleanLiteral',
            value
        }
    }

    NullLiteral() {
        this._eat('null');
        return {
            type: 'NullLiteral'
        }
    }

    StringLiteral() {
        const token = this._eat('STRING');

        return {
            type: 'StringLiteral',
            value: token.value.slice(1, -1)
        }
    }

    NumericLiteral() {
        const token = this._eat('NUMBER');

        return {
            type: 'NumericLiteral',
            value: Number(token.value)
        }
    }

    _eat(tokenType) {
        const token = this._lookahead;
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

module.exports = {
    Parser,
}