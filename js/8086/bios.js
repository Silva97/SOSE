/********************
 * Developed by Luiz Felipe - 2018
 *     GitHub: https://github.com/Silva97
 *     Email:  felipe.silva337@yahoo.com
 * 
 * Distributed under the MIT License.
 ********************/


const BIOS_SCREEN_ADDRESS = 0xB8000,
      BIOS_TABSIZE        = 4;

class Bios {
    constructor(emulator, screen_width = 80, screen_height = 25, beep = null){
        this.emulator      = emulator;
        this.screen_width  = screen_width;
        this.screen_height = screen_height;
        this.beep_audio    = (typeof beep == "string")? new Audio(beep) : beep;
        this.OnReboot      = null;  // OnReboot()
        this.OnPageSet     = null; //  OnPageSet(value)
        this.pageNumber    = 0;

        this.reset();
    }

    reset(){
        this.cursor = 0;

        for(let i = 1; i < this.screen_width*this.screen_height*2*8; i += 2)
            this.emulator.set(BIOS_SCREEN_ADDRESS + i, "byte", 0x07); // Default attribute
        
        
        this.emulator.interrupt[0x03] = ()=>{
            Machine8086.exception(3, 0xCD);
        };
    
        this.emulator.interrupt[0x10] = ()=>{
            switch(this.emulator.getRegister("AH")){
                case 0x0E:
                    this.putchar(this.emulator.getRegister("AL"));
                    break;
                case 0x13:
                    let addr = emulator.address("ES:BP");
            }
        };

        this.emulator.interrupt[0x19] = ()=>{
            if(typeof this.OnReboot == "function")
                this.OnReboot();
        };
    }

    putchar(char, attr = 0x07){
        var max      = this.screen_width * this.screen_height     - 1,
            lastLine = this.screen_width * (this.screen_height-1) - 1;
        
        if(this.cursor > max){
            this.cursor = lastLine + (this.cursor - max);
            this.moveScreen(0, 0, this.screen_width, this.screen_height, 0, -1);
        }

        this.cursor = this.setchar(this.cursor, char, attr, this.pageNumber);
    }

    setchar(position, char, attr, page){
        var addr = this.pos2addr(position, page);

        switch(char){
            case 0x07:
                this.beep();
                break;
            case 0x08:
                position--;
                break;
            case 0x09:
                position += BIOS_TABSIZE;
                break;
            case 0x0A:
                position += this.screen_width-1;
                break;
            case 0x0D:
                position = position - (position % this.screen_width);
                break;
    
            default:
                if(typeof attr == "number")
                    this.emulator.set(addr, "word", char + (attr << 8));
                else
                    this.emulator.set(addr, "byte", char);
    
                position++;
        }

        return position;
    }

    getchar(position, page = null){
        var addr = this.pos2addr(position, page);
        return {
            char: this.emulator.getFrom(addr,   "byte"),
            attr: this.emulator.getFrom(addr+1, "byte")
        };
    }

    moveScreen(sx1, sy1, sx2, sy2, dx, dy, newChar = 0x00, newAttr = 0x07){
        var c,
            dxo   = dx,   // DX Original
            px    = sx1,
            py    = sy1;

        while(px <= sx2 && py <= sy2){
            let pos = this.xy2pos(px++, py);
            c = this.getchar(pos);
            
            if(dx >= 0 && dy >= 0 && dx <=
               this.screen_width && dy <= this.screen_height){
                
                this.setchar(this.xy2pos(dx, dy), c.char, c.attr);
            }

            this.setchar(pos, newChar, newAttr);
            if(px > sx2){
                px = sx1;
                py++;
            }

            if(dx-dxo > sx2-sx1){
                dx = dxo;
                dy++;
            }
            dx++;
        }
    }

    startAddress(page = null){
        if(typeof page != "number" || page < 0 || page > 7)
            page = this.pageNumber;
        
        return BIOS_SCREEN_ADDRESS +
               (this.screen_width*this.screen_height*2 * page);
    }

    pos2addr(cursorPosition, page = null){
        return this.startAddress(page) + cursorPosition*2;
    }

    pos2xy(cursorPosition){
        return {
            x: cursorPosition % this.screen_width,
            y: Math.floor(cursorPosition / this.screen_width)
        };
    }

    xy2pos(x, y){
        return x + (this.screen_width * y) - 1;
    }

    xy2addr(x, y, page = null){
        return this.startAddress(page) + this.xy2pos(x, y)*2;
    }

    addr2pos(address, page = null){
        var pos = Math.floor( (address - this.startAddress(page))/2 ),
            xy  = this.pos2xy(pos);
        return {
            position: pos,
            x:        xy.x,
            y:        xy.y
        };
    }

    beep(){
        if(this.beep_audio instanceof Audio)
            this.beep_audio.play();
    }
}