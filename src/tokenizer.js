const Spec = [
    [/^\s+/,null],
    [/^\/\/.*/,null],
    [/^\/\*[\s\S]*?\*\//,null],
    [/^;/,';'],
    [/^{/,'{'],
    [/^}/,'}'],
    [/^\(/,'('],
    [/^\)/,')'],
    [/^\[/,'['],
    [/^\]/,']'],
    [/^,/,','],
    [/^\./,'.'],
    [/^\b(let|var|const)\b/,'dec'],
    [/^\bif\b/,'if'],
    [/^\bwhile\b/,'while'],
    [/^\belse\b/,'else'],
    [/^\btrue\b/,'true'],
    [/^\bfalse\b/,'false'],
    [/^\bnull\b/,'null'],
    [/^\d+/,'NUMBER'],
    [/^"[^"]*?"/,'STRING'],
    [/^'[^']*?'/,'STRING'],
    [/^[+\-]/,'ADDITIVE_OPERATOR'],
    [/^[*\/]/,'MULTIPLICATIVE_OPERATOR'],
    [/^[><]=?/,'RELATIONAL_OPERATOR'],
    [/^&&/,'LOGICAL_AND'],
    [/^\|\|/,'LOGICAL_OR'],
    [/^!/,'LOGICAL_NOT'],
    [/^[=!]==?/,'EQUALITY_OPERATOR'],
    [/^=/,'SIMPLE_ASSIGN'],
    [/^[\*\/\+\-]=/,'COMPLEX_ASSIGN'], 
    [/^return/,'return'], 
    [/^function/,'function'], 
    [/^class/,'class'], 
    [/^extends/,'extends'], 
    [/^new/,'new'], 
    [/^super/,'super'], 
    [/^this/,'this'], 
    [/^\w+/,'IDENTIFIER'],
]

class Tokenizer{
    init(string){
        this._string = string;
        this._cursor = 0;
    }

    isEOF(){
        return this._cursor === this._string.length;
    }

    hasMoreTokens(){
        return this._cursor < this._string.length;
    }

    getNextToken(){
        if(!this.hasMoreTokens()){
            return null;
        }

        const string = this._string.slice(this._cursor);
        
        for(const [regexp,tokenType] of Spec){
            const tokenValue = this._match(regexp,string);
            if(tokenValue === null) continue;
            if(tokenType === null) return this.getNextToken();
            return {
                type: tokenType,
                value: tokenValue
            }
        }

        throw new SyntaxError(`Unexpected token: "${string[0]}"`)

    }

    _match(regexp,string){
        const matched = regexp.exec(string);
        if(matched === null) return null;
        this._cursor += matched[0].length;
        return matched[0];
    }
}

module.exports = {
    Tokenizer
}