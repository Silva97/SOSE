/********************
 * Developed by Luiz Felipe - 2018
 *     GitHub: https://github.com/Silva97
 *     Email:  felipe.silva337@yahoo.com
 * 
 * Distributed under the MIT License.
 ********************/

"use strict";

var _GET = {};

{
    let values = location.search.substr(1).split("&");

    for(let i = 0; i < values.length; i++){
        let key = values[i].split("=");

        if(key.length == 1)
            _GET[ key[0] ] = "";
        else
            _GET[ key[0] ] = key[1];
    }
}

var $ = function(query, getAll){
    if(getAll)
        return document.querySelectorAll(query);
    else
        return document.querySelector(query);
}

function $new(tag, attributes){
    var t = document.createElement(tag);

    for(var i in attributes){
        t[i] = attributes[i];
    }
    
    return t;
}

function $newform(fields, button, onclick){
    var div = $new("div");

    for(let i in fields){
        if(fields[i].type == "select"){
            div.new("span", {
                "className": "form-span",
                "innerHTML": fields[i].title
            });

            let sel = $new("select", {
                "className": "form-select",
                "name":      i
            });

            for(let n = 0; n < fields[i].values.length; n++){
                sel.new("option", {
                    "value":     fields[i].values[n],
                    "innerHTML": fields[i].values[n]
                });
            }

            div.new(sel);
        } else {
            div.new("input", {
                "className":   "form-field",
                "type":        fields[i].type  || "text",
                "placeholder": fields[i].title || "",
                "name":        i
            });
        }

        div.new("br");
    }

    div.new("button", {
        "className": "form-button",
        "innerHTML": button,
        "onclick":   function(){
            var values = this.parentNode.$("input, select", true);
            var arg    = {};

            for(var i = 0; i < values.length; i++)
                arg[values[i].name] = values[i].value;

            onclick(arg);
        }
    });

    return div;
}

function include(script, onload = null, onerror = null){
    document.body.new("script", {
        "src":     script,
        "onload":  onload,
        "onerror": onerror
    });
}


function include_all(scriptList, OnAllLoad = null){
    var index   = 1;
    var OnError = (e)=>{
        console.error(`include_all() ERROR: File "${e.target.src}" not found.`);
    };
    var OnLoad = ()=>{
        if(index < scriptList.length){
            include(scriptList[index++], OnLoad, OnError);
        } else if(typeof OnAllLoad == "function"){
            OnAllLoad();
        }
    };

    include(scriptList[0], OnLoad, OnError);
}

/***** Prototypes *****/

Element.prototype.$ = function(query, getAll){
    if(getAll)
        return this.querySelectorAll(query);
    else
        return this.querySelector(query);
}

Element.prototype.new = function(...args){
    if(args[0] instanceof Element){
        this.appendChild(args[0]);
    } else {
        var t = $new(...args);
        this.appendChild(t);
    }

    return this;
}

NodeList.prototype.setAll = function(attribute, value){
    if(this.length == 0)
        return this;

    for(var i = 0; i < this.length; i++)
        this[i][attribute] =  value;

    return this;
}


String.prototype.escape = function(){
    var str = this;

    return str.replace(/\\(0|a|b|t|n|v|f|r)/g, function(m, l){
        switch(l){
            case "a":
                return "\a";
            case "b":
                return "\b";
            case "t":
                return "\t";
            case "n":
                return "\n";
            case "v":
                return "\v";
            case "f":
                return "\f";
            case "r":
                return "\r";
            default:
                return l;
        }
    });
};

String.prototype.align = function(char, number, base){
    var string = this;

    if(string.length >= number)
        return string;

    var rep = number-string.length;
    for(var i = 0; i < rep; i++){
        string = char+string;
    }

    return string;
};