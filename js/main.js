"use strict";

const LANG_FILE = "js/lang/lang.js";

document.addEventListener("DOMContentLoaded", ()=>{
    include(LANG_FILE, null, ()=>{
        console.error(`File "${LANG_FILE}" not found. (from main.js)`);
    });
});

function OnLangLoad(){
    include_all([
        "js/8086/select.js",
        "js/8086/e8086.js",
        "js/8086/m8086.js",
        "js/8086/bios.js",

        "js/screen.js",
        "js/memory.js",
        "js/emulator.js",
        "js/index.js",
        "js/menu.js"
    ], ()=>{
        var name,
            list = $("[name*=txt_]", true);

        for(var i = 0; i < list.length; i++){
            name                = list[i].getAttribute("name");
            list[i].textContent = Lang[ name.substr(4) ];
        }

        popup("In development",
              `This is a project in development. Only a few instructions were implemented.<br>
               <br>
               Developed by <a href="https://github.com/Silva97">Luiz Felipe</a>.<br>
               Distributed under the 
               <a href="https://github.com/Silva97/SOSE/blob/master/LICENSE">MIT License</a>.`);
    });
}