/********************
 * Developed by Luiz Felipe - 2018
 *     GitHub: https://github.com/Silva97
 *     Email:  felipe.silva337@yahoo.com
 * 
 * Distributed under the MIT License.
 ********************/

var addr_load = 0x7C00;

(function(){
    var btns = $(".menu li", true),
        addr = $("#emu_addr");

    for(var i = 0; i < btns.length; i++){
        btns[i].onclick = function(){
            eval(`${this.parentElement.getAttribute("data-click")}(this)`);
        };
    }

    $("#emu_delay").oninput = function(){
        emu_delay = this.value;
    }

    addr.oninput = function(){
        addr_load  = parseInt(this.value, 16);
        this.value = this.value.toUpperCase();
    }

    addr.value = "7C00";
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
                emulator.load(addr_load, this.result);
                emulator.setRegister("IP", addr_load);
                
                for(var i = 0; i < memory_list.length; i++)
                    memory_list[i].refresh();
            };

            reader.readAsBinaryString(file.files[0]);
            break;
        case Lang.step:
            emu_step(1, true);
            break;
        case Lang.run:
            emu_run($("#emu_delay").value);
            break;
        case Lang.stop:
            emu_stop();
            break;
    }
}