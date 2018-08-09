/********************
 * Developed by Luiz Felipe - 2018
 *     GitHub: https://github.com/Silva97
 *     Email:  felipe.silva337@yahoo.com
 * 
 * Distributed under the MIT License.
 ********************/

"use strict";

var Machine8086 = {
    step: function(emulator){
        var byte, opcode, bitD, bitW, size, ret;
        var regList = ["AL", "CL", "DL", "BL", "AH", "CH", "DH", "BH",
                       "AX", "CX", "DX", "BX", "SP", "BP", "SI", "DI"];

        while(true){
            byte = emulator.get("byte");
            bitD = (byte & 0b10) >> 1;
            bitW = byte & 0b01;
            size = ["byte", "word"][bitW];

            ret = s.elect(byte, {
                [s.bet(0x00, 0x03)]: (b)=>{ // ADD r/m(8/16), r/m(8/16)
                    let modRM = _parseModRM(bitW, emulator.get("byte"));

                    if(bitD){
                        let opValue;

                        if(modRM.operand instanceof Array){
                            opValue = emulator.getFrom(_calcAddress(emulator, modRM.operand),
                                                       size);
                        } else {
                            opValue = emulator.getRegister(modRM.operand);
                        }

                        emulator.addRegister(modRM.register, opValue);
                    } else {
                        if(modRM.operand instanceof Array){
                            emulator.add(_calcAddress(emulator, modRM.operand),
                                         size, emulator.getRegister(modRM.register));
                        } else {
                            emulator.addRegister(modRM.operand,
                                                 emulator.getRegister(modRM.register));
                        }
                    }

                    opcode = b;
                    return true;
                },
                0x04: (b)=>{ // ADD AL, imm8
                    emulator.addRegister("AL", emulator.get("byte"));
                    opcode = b;
                    return true;
                },
                0x05: (b)=>{ // ADD AX, imm16
                    emulator.addRegister("AX", emulator.get("word"));
                    opcode = b;
                    return true;
                },
                [s.bet(0x10, 0x13)]: (b)=>{ // ADC r/m(8/16), r/m(8/16)
                    let modRM = _parseModRM(bitW, emulator.get("byte"));

                    if(bitD){
                        let opValue;

                        if(modRM.operand instanceof Array){
                            opValue = emulator.getFrom(_calcAddress(emulator, modRM.operand),
                                                       size);
                        } else {
                            opValue = emulator.getRegister(modRM.operand);
                        }

                        emulator.addRegister(modRM.register, opValue + emulator.getFlag("CF"));
                    } else {
                        if(modRM.operand instanceof Array){
                            emulator.add(_calcAddress(emulator, modRM.operand),
                                         size, emulator.getRegister(modRM.register) +
                                               emulator.getFlag("CF"));
                        } else {
                            emulator.addRegister(modRM.operand,
                                                 emulator.getRegister(modRM.register) +
                                                 emulator.getFlag("CF"));
                        }
                    }

                    opcode = b;
                    return true;
                },
                0x14: (b)=>{ // ADC AL, imm8
                    emulator.addRegister("AL", emulator.get("byte") +
                                               emulator.getFlag("CF"));
                    opcode = b;
                    return true;
                },
                0x15: (b)=>{ // ADC AX, imm16
                    emulator.addRegister("AX", emulator.get("word") +
                                               emulator.getFlag("CF"));
                    opcode = b;
                    return true;
                },
                [s.any(0x06, 0x0E, 0x16, 0x1E)]: (b)=>{ // PUSH sreg
                    switch(b){
                        case 0x06:
                            emulator.push("ES");
                            break;
                        case 0x0E:
                            emulator.push("CS");
                            break;
                        case 0x16:
                            emulator.push("SS");
                            break;
                        case 0x1E:
                            emulator.push("DS");
                            break;
                    }

                    opcode = b;
                    return true;
                },
                [s.any(0x07, 0x0F, 0x17, 0x1F)]: (b)=>{ // POP sreg
                    switch(b){
                        case 0x07:
                            emulator.pop("ES");
                            break;
                        case 0x0F:
                            emulator.pop("CS");
                            break;
                        case 0x17:
                            emulator.pop("SS");
                            break;
                        case 0x1F:
                            emulator.pop("DS");
                            break;
                    }

                    opcode = b;
                    return true;
                },
                [s.bet(0x20, 0x23)]: (b)=>{ // AND r/m(8/16), r/m(8/16)
                    let modRM = _parseModRM(bitW, emulator.get("byte"));

                    if(bitD){
                        let opValue;

                        if(modRM.operand instanceof Array){
                            opValue = emulator.getFrom(_calcAddress(emulator, modRM.operand),
                                                       size);
                        } else {
                            opValue = emulator.getRegister(modRM.operand);
                        }

                        emulator.setRegister(modRM.register,
                                emulator.getRegister(modRM.register) & opValue);
                    } else {
                        if(modRM.operand instanceof Array){
                            let addr = _calcAddress(emulator, modRM.operand);
                            emulator.set(addr, size, emulator.getFrom(addr, size) &
                                                     emulator.getRegister(modRM.register));
                        } else {
                            emulator.setRegister(modRM.operand,
                                                 emulator.getRegister(modRM.operand) &
                                                 emulator.getRegister(modRM.register));
                        }
                    }

                    opcode = b;
                    return true;
                },
                0x24: (b)=>{ // AND AL, imm8
                    emulator.setRegister("AL", emulator.getRegister("AL") &
                                               emulator.get("byte"));
                    opcode = b;
                    return true;
                },
                0x25: (b)=>{ // AND AX, imm16
                    emulator.setRegister("AX", emulator.getRegister("AX") &
                                               emulator.get("word"));
                    opcode = b;
                    return true;
                },
                0x37: (b)=>{ // AAA
                    let ax = emulator.getRegister("AX");
                    if(ax & 0x000F > 9 || emulator.getFlag("AF")){
                        ax += 6 + (1 << 8);
                        emulator.setFlag("AF", 1);
                        emulator.setFlag("CF", 1);
                    } else {
                        emulator.setFlag("AF", 0);
                        emulator.setFlag("CF", 0);
                    }

                    ax &= ~(0xF0);
                    emulator.setRegister("AX", ax);

                    opcode = b;
                    return true;
                },
                [s.bet(0x38, 0x3B)]: (b)=>{ // CMP r/m(8/16), r/m(8/16)
                    let c,
                        modRM = _parseModRM(bitW, emulator.get("byte"));

                    if(bitD){
                        let opValue;

                        if(modRM.operand instanceof Array){
                            opValue = emulator.getFrom(_calcAddress(emulator, modRM.operand),
                                                       size);
                        } else {
                            opValue = emulator.getRegister(modRM.operand);
                        }

                        c = _subtract(emulator.getRegister(modRM.register),
                                      opValue,
                                      size);
                    } else {
                        if(modRM.operand instanceof Array){
                            c = _subtract(emulator.getFrom(_calcAddress(emulator, modRM.operand), size),
                                          emulator.getRegister(modRM.register),
                                          size);
                        } else {
                            c = _subtract(emulator.getRegister(modRM.operand),
                                          emulator.getRegister(modRM.register),
                                          size);
                        }
                    }

                    emulator.setFlag("OF", c.of);
                    emulator.setFlag("ZF", c.zf);
                    emulator.setFlag("SF", c.sf);
                    emulator.setFlag("PF", c.pf);
                    emulator.setFlag("CF", c.cf);
                    emulator.setFlag("AF", c.af);

                    opcode = b;
                    return true;
                },
                0x3C: (b)=>{ // CMP AL, imm8
                    let c = _subtract(emulator.getRegister("AL"),
                                      emulator.get("byte"),
                                      "byte");
                    
                    emulator.setFlag("OF", c.of);
                    emulator.setFlag("ZF", c.zf);
                    emulator.setFlag("SF", c.sf);
                    emulator.setFlag("PF", c.pf);
                    emulator.setFlag("CF", c.cf);
                    emulator.setFlag("AF", c.af);

                    opcode = b;
                    return true;
                },
                0x3D: (b)=>{ // CMP AX, imm16
                    let c = _subtract(emulator.getRegister("AX"),
                                      emulator.get("word"),
                                      "word");
                    
                    emulator.setFlag("OF", c.of);
                    emulator.setFlag("ZF", c.zf);
                    emulator.setFlag("SF", c.sf);
                    emulator.setFlag("PF", c.pf);
                    emulator.setFlag("CF", c.cf);
                    emulator.setFlag("AF", c.af);

                    opcode = b;
                    return true;
                },
                0x3F: (b)=>{ // AAS
                    let ax = emulator.getRegister("AX");
                    if(ax & 0x000F > 9 || emulator.getFlag("AF")){
                        ax -= 6 + (1 << 8);
                        emulator.setFlag("AF", 1);
                        emulator.setFlag("CF", 1);
                    } else {
                        emulator.setFlag("AF", 0);
                        emulator.setFlag("CF", 0);
                    }

                    ax &= ~(0xF0);
                    emulator.setRegister("AX", ax);

                    opcode = b;
                    return true;
                },
                [s.bet(0x40, 0x47)]: (b)=>{ // INC reg16
                    emulator.addRegister(regList[(b-0x40) + 8], 1);
                    opcode = b;
                    return true;
                },
                [s.bet(0x50, 0x57)]: (b)=>{ // PUSH reg16
                    emulator.push(regList[(b - 0x50) + 8]);
                    opcode = b;
                    return true;

                },
                [s.bet(0x58, 0x5F)]: (b)=>{ // POP reg16
                    emulator.pop(regList[(b - 0x58) + 8]);
                    opcode = b;
                    return true;
                },
                0x6A: (b)=>{ // PUSH imm8
                    emulator.push(emulator.get("byte"));
                    opcode = b;
                    return true;
                },
                0x72: (b)=>{ // JB/JNAE/JC rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    if(emulator.getFlag("CF")){
                        emulator.addRegister("IP", disp);
                    }

                    opcode = b;
                    return true;
                },
                0x74: (b)=>{ // JZ rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    if(emulator.getFlag("ZF")){
                        emulator.addRegister("IP", disp);
                    }

                    opcode = b;
                    return true;
                },
                0x75: (b)=>{ // JNZ rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    if(!emulator.getFlag("ZF")){
                        emulator.addRegister("IP", disp);
                    }

                    opcode = b;
                    return true;
                },
                0x76: (b)=>{ // JBE/JNA rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    if(emulator.getFlag("CF") || emulator.getFlag("ZF")){
                        emulator.addRegister("IP", disp);
                    }

                    opcode = b;
                    return true;
                },
                0x7C: (b)=>{ // JL/JNGE rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    if(emulator.getFlag("SF") != emulator.getFlag("OF")){
                        emulator.addRegister("IP", disp);
                    }

                    opcode = b;
                    return true;
                },
                [s.any(0x80, 0x81)]: (b)=>{ // ADD/ADC/AND/CMP r/m(8/16), imm(8/16)
                    let c,
                        modRM = _parseModRM(bitW, emulator.get("byte"));

                    if(modRM.operand instanceof Array){
                        let addr  = _calcAddress(emulator, modRM.operand),
                            value = emulator.getFrom(addr, size);
                        
                        switch(modRM.reg){
                            case 0b000: // ADD
                                emulator.add(addr, size, emulator.get(size));
                                break;
                            case 0b010: // ADC
                                emulator.add(addr, size, emulator.get(size) +
                                                         emulator.getFlag("CF"));
                                break;
                            case 0b100: // AND
                                emulator.set(addr, size, value & emulator.get(size));
                                break;
                            case 0b111: // CMP
                                c = _subtract(emulator.getFrom(addr, size),
                                              emulator.get(size),
                                              size);
                                break;
                        }
                    } else {
                        switch(modRM.reg){
                            case 0b000: // ADD
                                emulator.addRegister(modRM.operand, emulator.get(size));
                                break;
                            case 0b010: // ADC
                                emulator.addRegister(modRM.operand, emulator.get(size) +
                                                                    emulator.getFlag("CF"));
                                break;
                            case 0b100: // AND
                                emulator.setRegister(modRM.operand,
                                                     emulator.getRegister(modRM.operand) &
                                                     emulator.get(size));
                                break;
                            case 0b111: // CMP
                                c = _subtract(emulator.getRegister(modRM.operand),
                                              emulator.get(size),
                                              size);
                                break;
                        }
                    }

                    if(modRM.reg == 0b111){
                        emulator.setFlag("OF", c.of);
                        emulator.setFlag("ZF", c.zf);
                        emulator.setFlag("SF", c.sf);
                        emulator.setFlag("PF", c.pf);
                        emulator.setFlag("CF", c.cf);
                        emulator.setFlag("AF", c.af);
                    }

                    opcode = b;
                    return true;
                },
                0x83: (b)=>{ // ADD/ADC/AND/CMP r/m16, imm8
                    let c,
                        modRM = _parseModRM(bitW, emulator.get("byte"));

                    if(modRM.operand instanceof Array){
                        let addr  = _calcAddress(emulator, modRM.operand),
                            value = emulator.getFrom(addr, size);
                        
                        switch(modRM.reg){
                            case 0b000: // ADD
                                emulator.add(addr, "word", emulator.get("byte"));
                                break;
                            case 0b010: // ADC
                                emulator.add(addr, "word", emulator.get("byte") +
                                                           emulator.getFlag("CF"));
                                break;
                            case 0b100: // AND
                                emulator.set(addr, "word", value & emulator.get("byte"));
                                break;
                            case 0b111: // CMP
                                c = _subtract(value, emulator.get("byte"), "byte");
                                break;
                        }
                    } else {
                        switch(modRM.reg){
                            case 0b000: // ADD
                                emulator.addRegister(modRM.operand, emulator.get("byte"));
                                break;
                            case 0b010: // ADC
                                emulator.addRegister(modRM.operand, emulator.get("byte") +
                                                                    emulator.getFlag("CF"));
                                break;
                            case 0b100: // AND
                                emulator.setRegister(modRM.operand,
                                                     emulator.getRegister(modRM.operand) &
                                                     emulator.get("byte"));
                                break;
                            case 0b111: // CMP
                                c = _subtract(emulator.getRegister(modRM.operand),
                                              emulator.get("byte"), "byte");
                                break;
                        }
                    }

                    if(modRM.reg == 0b111){
                        emulator.setFlag("OF", c.of);
                        emulator.setFlag("ZF", c.zf);
                        emulator.setFlag("SF", c.sf);
                        emulator.setFlag("PF", c.pf);
                        emulator.setFlag("CF", c.cf);
                        emulator.setFlag("AF", c.af);
                    }

                    opcode = b;
                    return true;
                },
                0x8A: (b)=>{ // MOV r8, r/m8
                    let modRM = _parseModRM(bitW, emulator.get("byte"));

                    if(modRM.operand instanceof Array){
                        let addr = _calcAddress(emulator, modRM.operand);
                        emulator.setRegister(modRM.register,
                                             emulator.getFrom(addr, "byte"));
                    } else {
                        emulator.setRegister(modRM.register,
                                             emulator.getRegister(modRM.operand));
                    }

                    opcode = b;
                    return true;
                },
                0x8C: (b)=>{ // MOV r/m16, sreg
                    let sreg  = ["ES", "CS", "SS", "DS"];
                    let modRM = _parseModRM(bitW, emulator.get("byte"));

                    if(modRM.operand instanceof Array){
                        emulator.set(_calcAddress(emulator, modRM.operand), "byte",
                                     emulator.getRegister(sreg[modRM.reg]));
                    } else {
                        emulator.setRegister(modRM.operand,
                                             emulator.getRegister(sreg[modRM.reg]));
                    }

                    opcode = b;
                    return true;
                },
                0x8E: (b)=>{ // MOV sreg, r/m16
                    let sreg  = ["ES", "CS", "SS", "DS"];
                    let modRM = _parseModRM(bitW, emulator.get("byte"));

                    if(modRM.operand instanceof Array){
                        let value = emulator.getFrom(_calcAddress(emulator, modRM.operand), "byte");
                        emulator.setRegister(sreg[modRM.reg], value);
                    } else {
                        emulator.setRegister(sreg[modRM.reg], emulator.getRegister(modRM.operand));
                    }

                    opcode = b;
                    return true;
                },
                0x90: (b)=>{ // NOP
                    opcode = b;
                    return true;
                },
                0x98: (b)=>{ // CBW
                    if(emulator.getRegister("AL") & (1 << 7))
                        emulator.setRegister("AH", 0xFF);
                    else
                        emulator.setRegister("AH", 0x00);
                    
                    opcode = b;
                    return true;
                },
                0x99: (b)=>{ // CWD
                    if(emulator.getRegister("AX") & (1 << 15))
                        emulator.setRegister("DX", 0xFFFF);
                    else
                        emulator.setRegister("DX", 0x0000);
                    
                    opcode = b;
                    return true;
                },
                0x9A: (b)=>{ // CALLF SEGMENT:OFFSET
                    let offset  = emulator.get("word"),
                        segment = emulator.get("word");

                    emulator.push("CS");
                    emulator.push("IP");
                    emulator.setRegister("IP", offset);
                    emulator.setRegister("CS", segment);
                    opcode = b;
                    return true;
                },
                [s.any(0xA6, 0xA7)]: (b)=>{ // CMPSB/CMPSW
                    let si = emulator.getFrom("DS:SI", size),
                        di = emulator.getFrom("ES:DI", size),
                        c  = _subtract(si, di, size);
                    
                    emulator.setFlag("OF", c.of);
                    emulator.setFlag("ZF", c.zf);
                    emulator.setFlag("SF", c.sf);
                    emulator.setFlag("PF", c.pf);
                    emulator.setFlag("CF", c.cf);
                    emulator.setFlag("AF", c.af);

                    if(emulator.getFlag("DF")){
                        emulator.addRegister("SI", -1);
                        emulator.addRegister("DI", -1);
                    } else {
                        emulator.addRegister("SI", 1);
                        emulator.addRegister("DI", 1);
                    }

                    opcode = b;
                    return true;
                },
                [s.bet(0xB0, 0xB7)]: (b)=>{ // MOV reg8, imm8
                    emulator.setRegister(regList[b-0xB0], emulator.get("byte"));
                    opcode = b;
                    return true;
                },
                [s.bet(0xB8, 0xBF)]: (b)=>{ // MOV reg16, imm16
                    emulator.setRegister(regList[b-0xB0], emulator.get("word"));
                    opcode = b;
                    return true;
                },
                0xC2: (b)=>{ // RET imm16
                    emulator.pop("IP");
                    emulator.setRegister("SP", emulator.get("word"));
                    opcode = b;
                    return true;
                },
                0xC3: (b)=>{ // RET
                    emulator.pop("IP");
                    opcode = b;
                    return true;
                },
                0xCA: (b)=>{ // RETF imm16
                    emulator.pop("IP");
                    emulator.pop("CS");
                    emulator.setRegister("SP", emulator.get("word"));
                    opcode = b;
                    return true;
                },
                0xCB: (b)=>{ // RETF
                    emulator.pop("IP");
                    emulator.pop("CS");
                    opcode = b;
                    return true;
                },
                0xCC: (b)=>{ // INT3
                    this.exception(3, b);
                    opcode = b;
                    return true;
                },
                0xCD: (b)=>{ // INT imm8
                    let int = emulator.get("byte");
                    if(emulator.virtualInterrupt &&
                       typeof emulator.interrupt[int] == "function"){

                        emulator.interrupt[int]();
                    } else {
                        emulator.push(emulator.eflags);
                        emulator.push("CS");
                        emulator.push("IP");

                        emulator.setRegister("IP",
                                             emulator.getFrom(int * 4, "word"));
                        emulator.setRegister("CS",
                                             emulator.getFrom(int * 4 + 2, "word"));
                    }

                    opcode = b;
                    return true;
                },
                0xCF: (b)=>{ // IRET
                    emulator.pop("IP");
                    emulator.pop("CS");
                    emulator.eflags = emulator.pop();

                    opcode = b;
                    return true;
                },
                0xD4: function(b){ // AAM
                    if(emulator.get("byte") != 0x0A)
                        return this[s.default](b);
                    
                    let al = emulator.getRegister("AL");
                    
                    emulator.setRegister("AH", al / 10);
                    emulator.setRegister("AL", al % 10);

                    opcode = b;
                    return true;
                },
                0xD5: function(b){ // AAD
                    if(emulator.get("byte") != 0x0A)
                        return this[s.default](b);
                    
                    let al = emulator.getRegister("AH") * 10 +
                             emulator.getRegister("AL");
                    
                    emulator.setRegister("AX", al % 0x100);

                    opcode = b;
                    return true;
                },
                0xE8: (b)=>{ // CALL disp16
                    let address = emulator.get("word");
                    emulator.push("IP");
                    emulator.addRegister("IP", address);
                    opcode = b;
                    return true;
                },
                0xEB: (b)=>{ // JMP imm8
                    let dist = _signedValue(emulator.get("byte"), "byte");

                    emulator.addRegister("IP", dist);
                    opcode = b;
                    return true;
                },
                0xF5: (b)=>{ // CMC
                    emulator.setFlag("CF", 1 - emulator.getFlag("CF"));
                    opcode = b;
                    return true;
                },
                0xF8: (b)=>{ // CLC
                    emulator.setFlag("CF", 0);
                    opcode = b;
                    return true;
                },
                0xF9: (b)=>{ // STC
                    emulator.setFlag("CF", 1);
                    opcode = b;
                    return true;
                },
                0xFA: (b)=>{ // CLI
                    emulator.setFlag("IF", 0);
                    opcode = b;
                    return true;
                },
                0xFB: (b)=>{ // STI
                    emulator.setFlag("IF", 1);
                    opcode = b;
                    return true;
                },
                0xFC: (b)=>{ // CLD
                    emulator.setFlag("DF", 0);
                    opcode = b;
                    return true;
                },
                0xFD: (b)=>{ // STD
                    emulator.setFlag("DF", 1);
                    opcode = b;
                    return true;
                },

                [s.default]: (b)=>{
                    if(typeof this.OnError == "function")
                        this.OnError(b);
                    
                    opcode = b;
                    return true;
                }
            });

            if(ret)
                break;
        }

        return opcode;
    },

    exception: function(n, opcode){
        if(typeof this.OnException == "function")
            this.OnException(n, opcode);
    }
};

function _parseModRM(bitW, byte){
    var list = [
        [
            ["BX", "SI"],
            ["BX", "DI"],
            ["BP", "SI"],
            ["BP", "DI"],
            ["SI"],
            ["DI"],
            [16],
            ["BX"]
        ],

        [
            ["BX", "SI", 8],
            ["BX", "DI", 8],
            ["BP", "SI", 8],
            ["BP", "DI", 8],
            ["SI", 8],
            ["DI", 8],
            ["BP", 8],
            ["BX", 8]
        ],

        [
            ["BX", "SI", 16],
            ["BX", "DI", 16],
            ["BP", "SI", 16],
            ["BP", "DI", 16],
            ["SI", 16],
            ["DI", 16],
            ["BP", 16],
            ["BX", 16]
        ],

        [
            "AL", "CL", "DL", "BL", "AH", "CH", "DH", "BH",
            "AX", "CX", "DX", "BX", "SP", "BP", "SI", "DI"
        ]
    ];

    var ret = {
        mod: (byte & 0b11000000) >> 6,
        reg: (byte & 0b00111000) >> 3,
        rm:  (byte & 0b00000111)
    };

    if(ret.mod == 0b11){
        ret.operand = list[3][ret.rm + (8 * bitW)];
    } else {
        ret.operand = list[ret.mod][ret.rm];
    }

    ret.register = list[3][ret.reg + (8 * bitW)];

    return ret;
}

function _calcAddress(emulator, values){
    var i, addr = 0;

    for(i = 0; i < values.length; i++){
        if(typeof values[i] == "string"){
            addr += emulator.getRegister(values[i]);
        } else if(typeof values[i] == "number"){
            addr += emulator.memory["getUint"+values[i]](
                        emulator.addRegister("IP", values[i]/8),
                        true);
        } else {
            return -1;
        }
    }

    return addr;
}

function _signedValue(value, size){
    var max = {
        "byte":  0xFF,
        "word":  0xFFFF,
        "dword": 0xFFFFFFFF
    }[size];
    
    if(value > ((max+1)/2 - 1))
        value -= max + 1;

    return value;
}

function _subtract(value1, value2, size = "byte"){
    var v1   = _signedValue(value1, size),
        s1   = Math.sign(v1),
        v2   = _signedValue(value2, size),
        s2   = Math.sign(v2),
        res  = v1-v2,
        sres = Math.sign(res),
        ret  = {
            v1:   v1,
            s1:   s1,
            v2:   v2,
            s2:   s2,
            res:  res,
            sres: sres
        };
    
    ret.of = 0 + (s1 != s2 && sres != s1);
    ret.zf = 0 + (res == 0);
    ret.sf = 0 + (sres == -1);
    ret.pf = 1 - (sres & 1);
    ret.cf = 0 + (s1 != -1 && sres == -1);
    ret.af = 0 + ((v1 & (1 << 4)) != 0 && (v2 & (1 << 4)) != 0);
    
    return ret;
}