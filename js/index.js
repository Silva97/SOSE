/********************
 * Developed by Luiz Felipe - 2018
 *     GitHub: https://github.com/Silva97
 *     Email:  felipe.silva337@yahoo.com
 * 
 * Distributed under the MIT License.
 ********************/

var screen,
    emulator,
    screen_width  = 80,
    screen_height = 25,
    screen_page   = 0,
    memory_list   = []
    reg_list      = ["AX", "BX", "CX", "DX", "SI",
                     "DI", "SP", "BP", "IP", "CS",
                     "DS", "SS", "ES", "FS", "GS"],
    flag_list  = "----ODITSZ-A-P-C",
    flag_names = ["", "", "", "",   "Overflow Flag",  "Direction Flag",
                  "Interrupt Flag", "Trap Flag",      "Sign Flag",
                  "Zero Flag", "",  "Auxiliary Flag", "", "Parity Flag",
                  "", "Carry Flag"];

(function(){
    var p,
        panel = $("#panel");
    screen    = new Screen("#screen", screen_width, screen_height);
    emulator  = new Emulator8086();
    bios      = new Bios(emulator, screen_width, screen_height, "snd/beep.wav");

    bios.OnReboot = function(){
        popup(Lang.emulatorMessage, Lang.int0x19);
        emu_stop();
    };

    bios.OnPageSet = function(value){
        screen_page = value;
        var vaddr   = 0xB8000 + (screen_width*screen_height*2*screen_page);

        screen.load( emulator.dump(vaddr, screen_width*screen_height*2, "byte") );
    };

    emulator.OnRegisterSet = function(reg){
        if(!emu_autoRefresh)
            return;
        
        if(reg[1] == "H" || reg[1] == "L"){
            reg = reg[0] + "X";
        }

        var tag       = $("#reg_"+ reg.toLowerCase());
        var newValue  = this.getRegister(reg);
        tag.innerHTML = newValue.toString(16)
                                .toUpperCase().align("0", 4);
        tag.className = "value-edited";
        tag.lastValue = newValue;

        for(var i = 0; i < memory_list.length; i++){
            if(memory_list[i] instanceof MemoryViewer    &&
               typeof memory_list[i].address == "string" &&
               memory_list[i].address.indexOf(reg) != -1){

                memory_list[i].refresh();
            }
        }
    };

    emulator.OnFlagSet = function(flag){
        if(!emu_autoRefresh)
            return;
        
        var tag       = $("#flag_"+ flag[0].toLowerCase());
        var newValue  = this.getFlag(flag);

        if(newValue != tag.lastValue){
            tag.innerHTML = newValue;
            tag.className = "value-edited";
            tag.lastValue = newValue;
        }
    };

    emulator.OnMemorySet = function(addr, size){
        if(emu_autoRefresh){
            for(var i = 0; i < memory_list.length; i++){
                if(memory_list[i] instanceof MemoryViewer &&
                memory_list[i].inViewer(addr)){

                    memory_list[i].refresh();
                }
            }
        }

        var vaddr = 0xB8000 + (screen_width*screen_height*2*screen_page);

        if(addr >= vaddr && addr <= vaddr + (screen_width*screen_height*2)){
            addr     = addr - (addr % 2);
            let char = this.getFrom(addr,   "byte"),
                attr = this.getFrom(addr+1, "byte");
            
            screen.setChar((addr - vaddr) / 2, char, attr);
        }
    };

    emulator.OnReset = function(){
        for(let i = 0; i < memory_list.length; i++){
            if(memory_list[i] instanceof MemoryViewer){
                memory_list[i].refresh();
            }
        }

        for(let i = 0; i < reg_list.length; i++){
            let tag = $("#reg_"+ reg_list[i].toLowerCase());

            tag.innerHTML = "0000";
            tag.className = "value-edited";
        }

        for(let i = 0; i < flag_list.length; i++){
            if(flag_list[i] == "-")
                continue;

            let tag = $("#flag_"+ flag_list[i].toLowerCase());

            tag.innerHTML = "0";
            tag.className = "value-edited";
        }
    };



    // Registers
    panel.new("span", {
        "className": "panel-title-big",
        "innerHTML": Lang.registers
    })
    .new("br");

    for(let i = 0; i < reg_list.length; i++){
        p = $new("p");

        p.new("span", {
            "className": "panel-title",
            "innerHTML": reg_list[i]
        })
        .new("br")
        .new("span", {
            "className":       "value-normal",
            "id":              "reg_"+ reg_list[i].toLowerCase(),
            "innerHTML":       "0000",
            "lastHTML":        "0000",
            "lastValue":       0,
            "contentEditable": true,
            "oninput":         function(){
                if(!this.textContent.match(/^[0-9a-f]{0,4}$/i)){
                    this.innerHTML = this.lastHTML;
                    return;
                }

                this.lastHTML = this.innerHTML;
            },
            "onkeydown": function(e){
                switch(e.keyCode){
                    case 0x0D: // Enter
                        this.blur();
                        break;
                    case 0x26: // Up
                        this.innerHTML = (parseInt(this.innerHTML, 16) + 1)
                                          .toString(16).toUpperCase();

                        this.onblur();
                        return false;
                    case 0x28: // Down
                        var v = parseInt(this.innerHTML, 16) - 1;
                        if(v < 0)
                            v = 0;

                        this.innerHTML = v.toString(16).toUpperCase();
                        this.onblur();
                        return false;
                }
            },
            "onblur": function(){
                let value;
                if(this.innerHTML.length == 0)
                    value = 0;
                else
                    value = parseInt(this.innerHTML, 16);

                emulator.setRegister(this.id.substr(4).toUpperCase(),
                                     value);

                this.innerHTML = value.toString(16).toUpperCase().align("0", 4);
                this.lastValue = value;
            }
        });

        panel.new(p);
    }

    // Flags
    panel.new("hr")
    .new("span", {
        "className": "panel-title-big",
        "innerHTML": Lang.flags
    })
    .new("br");

    p = $new("p");
    p.new("span", {
        "className": "panel-title",
        "innerHTML": flag_list
    })
    .new("br");

    for(let i = 0; i < flag_list.length; i++){
        let id;
        if(flag_list[i] == "-")
            id = "";
        else
            id = "flag_"+ flag_list[i].toLowerCase();

        p.new("span", {
            "className":       "value-normal",
            "id":              id,
            "innerHTML":       "0",
            "lastValue":       0,
            "contentEditable": true,
            "title":           flag_names[i],
            "onkeypress": function(e){
                if(e.keyCode == 0x0D){
                    this.blur();
                    return;
                }

                if(e.key == "1")
                    this.innerHTML = "1";
                else
                    this.innerHTML = "0";
                
                return false;
            },
            "onblur": function(){
                if(!this.id)
                    return;

                var value = parseInt(this.innerHTML);
                emulator.setFlag(this.id.substr(5).toUpperCase()+"F",
                                 value);

                this.lastValue = value;
            }
        });
    }

    panel.new(p);

    // Memory
    memory_list.push( new MemoryViewer(emulator, "CS:IP", 100, 1) );
    memory_list.push( new MemoryViewer(emulator, "SS:SP", 100, 2) );

    panel.new("hr")
    .new("span", {
        "className": "panel-title-big",
        "innerHTML": Lang.memory
    })
    .new("button", {
        "className": "btn-small",
        "innerHTML": "+",
        "title":     Lang.newMemoryViewer,
        "onclick":   createMemoryViewer
    })
    .new("br");

    p = $new("p");
    for(var i = 0; i < memory_list.length; i++)
        p.new(memory_list[i].html);

    panel.new(p);
    

    // Input
    var inp         = $("#input");
    inp.placeholder = Lang.inputForTheEmulator;
    inp.onkeypress  = function(e){
        switch(e.keyCode){
            case 0x0D:
                console.log(this.value.escape());
                this.value = "";
                return false;
            case 0x09:
                this.value += "\t";
                return false;
        }
    }

    inp.onblur = function(){
        this.hidden = true;
    }
})();

function input(){
    var tag    = $("#input");
    tag.value  = "";
    tag.hidden = false;

    tag.focus();
}

function popup(title, text){
    $("#popup > span:nth-child(1n)").innerHTML = title;

    if(text instanceof Element){
        $("#popup > span:nth-child(2n)").innerHTML = "";
        $("#popup > span:nth-child(2n)").appendChild(text);
    } else {    
        $("#popup > span:nth-child(2n)").innerHTML = text;
    }

    $("#popup").style.display = "block";
}

function createMemoryViewer(){
    popup(Lang.createMemoryViewer, $newform({
        "address": {type: "text",   title: Lang.memoryAddress},
        "length":  {type: "number", title: Lang.lengthOfTheViewer},
        "size":    {type: "select", title: Lang.sizeOfTheValues +": ", values: [
            "1", "2", "4"
        ]}
    }, Lang.ok, (fields)=>{
        $("#popup").style.display = "none";
        var mem = new MemoryViewer(emulator, fields.address, parseInt(fields.length),
                                   parseInt(fields.size), true);
        memory_list.push(mem);

        mem.OnClose = function(){
            delete memory_list[ memory_list.indexOf(this) ];
        };
        $("#panel").new(mem.html);
    }));
}