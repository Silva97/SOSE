/********************
 * Developed by Luiz Felipe - 2018
 *     GitHub: https://github.com/Silva97
 *     Email:  felipe.silva337@yahoo.com
 * 
 * Distributed under the MIT License.
 ********************/

(function(){
    var btns = $(".menu li", true);

    for(var i = 0; i < btns.length; i++){
        btns[i].onclick = function(){
            eval(`${this.parentElement.getAttribute("data-click")}(this)`);
        };
    }

    $("#emu_delay").oninput = function(){
        emu_delay = this.value;
    }
})();

function menu_click(tag){
    switch(tag.textContent){
        case Lang.loadBinary:
            var file = $("#file");
            if(file.files.length == 0){
                popup(Lang.selectAFile, Lang.pleaseSelectTheBinary);
                return;
            }

            var reader       = new FileReader();
            reader.onloadend = function(){
                emu_reset();
                emulator.load(0, this.result);
                
                for(var i = 0; i < memory_list.length; i++)
                    memory_list[i].refresh();
            };

            reader.readAsBinaryString(file.files[0]);
            break;
        case Lang.step:
            emu_step();
            break;
        case Lang.run:
            emu_run($("#emu_delay").value);
            break;
        case Lang.stop:
            emu_stop();
            break;
    }
}