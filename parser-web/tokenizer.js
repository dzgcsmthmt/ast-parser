import Spec from './spec.js';


class Tokenizer{
    init(string){
        this.string = string;
        this.cursor = 0;
    }
    hasMoreToken(){
        return this.cursor < this.string.length;
    }
    getNextToken(){
        if(!this.hasMoreToken()) return null;

        const string = this.string.slice(this.cursor);

        for(let [regexp,tokenType] of Spec){
            const tokenValue = this._match(regexp,string);
            if(tokenValue === null) continue;
            if(tokenType === null) return this.getNextToken();
            return {
                type: tokenType,
                value: tokenValue
            }
        }

        throw new SyntaxError(`Unexpected token: "${string[0]}"`);

        

    }

    _match(regexp,string){
        let match = string.match(regexp);
        if(match === null) return null;
        this.cursor += match[0].length;
        return match[0];
    }
}

export default Tokenizer;