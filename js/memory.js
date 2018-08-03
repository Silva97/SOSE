/********************
 * Developed by Luiz Felipe - 2018
 *     GitHub: https://github.com/Silva97
 *     Email:  felipe.silva337@yahoo.com
 * 
 * Distributed under the MIT License.
 ********************/

"use strict";

class MemoryViewer {
    constructor(emulator, address, length = 8, size = 1, showCloseButton){
        this.OnClose  = null;
        this.emulator = emulator;
        this.address  = address;
        this.length   = length;
        this.size     = size;
        this.list     = [];
        this.html     = $new("div", {
            "className": "memory-box"
        });

        if(showCloseButton){
            this.html.new("button", {
                "className":   "memory-button",
                "innerHTML":   "X",
                "data-memory": this,
                "title":       Lang.remove,
                "onclick":     function(){
                    if(typeof this["data-memory"].OnClose == "function")
                        this["data-memory"].OnClose();
                    this.parentNode.remove();
                }
            });
        }

        this.html.new("div", {
            "className":       "memory-label",
            "innerHTML":       address,
            "lastHTML":        address,
            "contentEditable": true,
            "title":           Lang.address,
            "data-memory":     this,
            "onkeydown": function(e){
                switch(e.keyCode){
                    case 0x0D: // Enter
                        this.blur();
                        break;
                    case 0x26: // Up
                        this.innerHTML = (this["data-memory"].emulator
                                                            .address(this.innerHTML) + 1)
                                                            .toString(16).toUpperCase();

                        this.onblur();
                        return false;
                    case 0x28: // Down
                        var val = this["data-memory"].emulator
                                                     .address(this.innerHTML) - 1;
                        if(val < 0)
                            this.innerHTML = "0"
                        else
                            this.innerHTML = val.toString(16).toUpperCase();

                        this.onblur()
                        return false;
                }
            },
            "onfocus": function(){
                this.lastHTML = this.innerHTML;
            },
            "onblur": function(){
                this.innerHTML = this.textContent.toUpperCase();

                this["data-memory"].setAddress(this.innerHTML);
                this["data-memory"].refresh();
            }
        });

        for(var i = 0; i < length; i++){
            let ihtml = "0".align("0", size*2);
            let tag   = $new("span", {
                "className":       "value-normal",
                "innerHTML":       ihtml,
                "lastHTML":        ihtml,
                "contentEditable": true,
                "title":           `${Lang.index} ${i}`,
                "data-index":      i,
                "data-memory":     this,
                "oninput":         function(){
                    if(!this.textContent.match(/^[0-9a-f]*$/i) ||
                        this.textContent.length > this["data-memory"].size*2){
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
                    var value,
                        addr  = this["data-index"] * this["data-memory"].size,
                        sizes = ["", "byte", "word", "", "dword"];

                    if(this.innerHTML.length == 0)
                        value = 0;
                    else
                        value = parseInt(this.innerHTML, 16);

                    emulator.set(this["data-memory"].getAddress() + addr,
                                 sizes[this["data-memory"].size],
                                 value);

                    this.className = "value-edited";
                    this["data-memory"].refresh();
                }
            });

            this.html.new(tag);
            this.list.push(tag);
        }

        this.refresh();
    }

    refresh(){
        var sizes = ["", "byte", "word", "", "dword"],
            addr  = this.getAddress();

        if(addr < 0)
            addr = 0;

        for(var i = 0; i < this.list.length; i++, addr += this.size){
            let nv = this.emulator.getFrom(addr, sizes[this.size])
                                  .toString(16).toUpperCase()
                                  .align("0", this.size*2);

            if(nv != this.list[i].innerHTML){
                this.list[i].className = "value-edited";
                this.list[i].innerHTML = nv;
            }
        }
    }

    getAddress(){
        if(typeof this.address == "string")
            return this.emulator.address(this.address);
        else
            return this.address;
    }

    setAddress(address){
        this.address = address;
        this.refresh();
    }

    inViewer(address){
        var addr = this.getAddress();
        return (address >= addr &&
                address <= addr + (this.length*this.size) - 1);
    }
}