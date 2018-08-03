/********************
 * Developed by Luiz Felipe - 2018
 *     GitHub: https://github.com/Silva97
 *     Email:  felipe.silva337@yahoo.com
 * 
 * Distributed under the MIT License.
 ********************/

class Screen {
    constructor(selector, width = 80, height = 25){
        this.element  = document.querySelector(selector);
        this.selector = selector;
        this.width    = width;
        this.height   = height;

        this.element.innerHTML   = "";
        this.element.style.width = width+"ch";
        for(var i = 1; i < width*height+1; i++){
            let span              = document.createElement("span");
            span.innerHTML        = " ";
            span.style.color      = "var(--attr-7)";
            span.style.background = "var(--attr-0)";

            this.element.appendChild(span);
            if(i && !(i%width)){
                let br = document.createElement("br");
                this.element.appendChild(br);
            }
        }

        this.chars = this.element.querySelectorAll("span");
    }

    setChar(position, character, attribute){
        if(position >= this.chars.length)
            return null;

        if(typeof character == "number"){
            if(character <= 20 || character >= 127)
                this.chars[position].innerHTML = " ";
            else
                this.chars[position].innerHTML = String.fromCharCode(character);
        }

        if(typeof attribute == "number"){
            attribute = attribute.toString(16);
            if(attribute.length == 1)
                attribute = "0"+ attribute;
        }

        if(attribute && attribute.length == 2){
            attribute = attribute.toUpperCase();

            this.chars[position].style.background = `var(--attr-${attribute[0]})`;
            this.chars[position].style.color      = `var(--attr-${attribute[1]})`;
        }
    }

    getChar(position){
        if(position >= this.chars.length)
            return null;

        var attr = this.chars[position].style.background.charAt(11)+
                   this.chars[position].style.color.charAt(11);

        return {
            char:      this.chars[position].innerHTML.charCodeAt(0),
            attribute: attr
        };
    }

    load(values){
        var attr;

        for(var i = 0; i < values.length; i+=2){
            attr = values[i+1].toString(16);
            if(attr.length == 1)
                attr = "0"+attr;

            this.setChar(i/2, values[i], attr);
        }
    }

    dump(){
        var ch, arr = [];

        for(var i = 0; i < this.chars.length; i++){
            ch = this.getChar(i);
            arr.push(ch.char);
            arr.push(parseInt(ch.attr, 16));
        }

        return arr;
    }
}