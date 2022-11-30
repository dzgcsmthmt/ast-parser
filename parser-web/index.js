import Parser from './parser.js';

const parser = new Parser();
document.querySelectorAll('.parse').forEach(btn => {
    btn.addEventListener('click',function(){
        let program = this.previousElementSibling.textContent;
        console.log(program);
        const ast = parser.parse(program);
        this.nextElementSibling.children[0].textContent = JSON.stringify(ast, null, 2);
    })
})