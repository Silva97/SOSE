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

                        _setFlags(emulator, _add(emulator.getRegister(modRM.register),
                                                 opValue, size));
                        emulator.addRegister(modRM.register, opValue);
                    } else {
                        if(modRM.operand instanceof Array){
                            let addr = _calcAddress(emulator, modRM.operand);

                            _setFlags(emulator, _add(emulator.getFrom(addr, size),
                                                     emulator.getRegister(modRM.register), size));
                            emulator.add(addr, size, emulator.getRegister(modRM.register));
                        } else {
                            _setFlags(emulator, _add(emulator.getRegister(modRM.operand),
                                                     emulator.getRegister(modRM.register), size));
                            emulator.addRegister(modRM.operand,
                                                 emulator.getRegister(modRM.register));
                        }
                    }

                    opcode = b;
                    return true;
                },
                0x04: (b)=>{ // ADD AL, 
                    let value = emulator.get("byte");

                    _setFlags(emulator, _add(emulator.getRegister("AL"), value, "byte"));
                    emulator.addRegister("AL", value);

                    opcode = b;
                    return true;
                },
                0x05: (b)=>{ // ADD AX, imm16
                    let value = emulator.get("word");

                    _setFlags(emulator, _add(emulator.getRegister("AX"), value, "word"));
                    emulator.addRegister("AX", value);
                    opcode = b;
                    return true;
                },
                [s.bet(0x08, 0x0B)]: (b)=>{ // OR r/m(8/16), r/m(8/16)
                    let modRM = _parseModRM(bitW, emulator.get("byte"));

                    if(bitD){
                        let opValue;

                        if(modRM.operand instanceof Array){
                            opValue = emulator.getFrom(_calcAddress(emulator, modRM.operand),
                                                       size);
                        } else {
                            opValue = emulator.getRegister(modRM.operand);
                        }

                        _setFlags(emulator, _or(emulator.getRegister(modRM.register),
                                                opValue, size));
                        emulator.setRegister(modRM.register,
                                emulator.getRegister(modRM.register) | opValue);
                    } else {
                        if(modRM.operand instanceof Array){
                            let addr = _calcAddress(emulator, modRM.operand);

                            _setFlags(emulator, _or(emulator.getFrom(addr, size),
                                                    emulator.getRegister(modRM.register),
                                                    size));
                            emulator.set(addr, size, emulator.getFrom(addr, size) |
                                                     emulator.getRegister(modRM.register));
                        } else {
                            _setFlags(emulator, _or(emulator.getRegister(modRM.operand),
                                                    emulator.getRegister(modRM.register),
                                                    size));
                            emulator.setRegister(modRM.operand,
                                                 emulator.getRegister(modRM.operand) |
                                                 emulator.getRegister(modRM.register));
                        }
                    }

                    opcode = b;
                    return true;
                },
                [s.any(0x0C, 0x0D)]: (b)=>{ // OR AL/AX, imm8
                    let value = emulator.get(size),
                        reg   = ["AL", "AX"][bitW];
                    
                    _setFlags(emulator, _or(emulator.getRegister(reg),
                                             value, size));
                    emulator.setRegister(reg, emulator.getRegister(reg) |
                                              value);
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

                        _setFlags(emulator, _add(emulator.getRegister(modRM.register),
                                                 opValue + emulator.getFlag("CF"), size));
                        emulator.addRegister(modRM.register, opValue + emulator.getFlag("CF"));
                    } else {
                        if(modRM.operand instanceof Array){
                            let addr = _calcAddress(emulator, modRM.operand);

                            _setFlags(emulator, _add(emulator.getFrom(addr, size),
                                                     opValue, size));
                            emulator.add(_calcAddress(emulator, modRM.operand),
                                         size, emulator.getRegister(modRM.register) +
                                               emulator.getFlag("CF"));
                        } else {
                            _setFlags(emulator, _add(emulator.getRegister(modRM.operand),
                                                     emulator.getRegister(modRM.register) +
                                                     emulator.getFlag("CF"),
                                                     size));
                            emulator.addRegister(modRM.operand,
                                                 emulator.getRegister(modRM.register) +
                                                 emulator.getFlag("CF"));
                        }
                    }

                    opcode = b;
                    return true;
                },
                0x14: (b)=>{ // ADC AL, imm8
                    let value = emulator.get("byte");
                    _setFlags(emulator, _add(emulator.getRegister("AL"),
                                             value +
                                             emulator.getFlag("CF"),
                                             "byte"));
                    emulator.addRegister("AL", value +
                                               emulator.getFlag("CF"));
                    opcode = b;
                    return true;
                },
                0x15: (b)=>{ // ADC AX, imm16
                    let value = emulator.get("word");
                    _setFlags(emulator, _add(emulator.getRegister("AX"),
                                             value +
                                             emulator.getFlag("CF"),
                                             "word"));
                    emulator.addRegister("AX", value +
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

                        _setFlags(emulator, _and(emulator.getRegister(modRM.register),
                                                 opValue, size));
                        emulator.setRegister(modRM.register,
                                emulator.getRegister(modRM.register) & opValue);
                    } else {
                        if(modRM.operand instanceof Array){
                            let addr = _calcAddress(emulator, modRM.operand);

                            _setFlags(emulator, _and(emulator.getFrom(addr, size),
                                                     emulator.getRegister(modRM.register),
                                                     size));
                            emulator.set(addr, size, emulator.getFrom(addr, size) &
                                                     emulator.getRegister(modRM.register));
                        } else {
                            _setFlags(emulator, _and(emulator.getRegister(modRM.operand),
                                                     emulator.getRegister(modRM.register),
                                                     size));
                            emulator.setRegister(modRM.operand,
                                                 emulator.getRegister(modRM.operand) &
                                                 emulator.getRegister(modRM.register));
                        }
                    }

                    opcode = b;
                    return true;
                },
                [s.any(0x24, 0x25)]: (b)=>{ // AND AL/AX, imm8
                    let value = emulator.get(size),
                        reg   = ["AL", "AX"][bitW];
                    
                    _setFlags(emulator, _and(emulator.getRegister(reg),
                                             value, size));
                    emulator.setRegister(reg, emulator.getRegister(reg) &
                                              value);
                    opcode = b;
                    return true;
                },
                0x27: (b)=>{ // DAA
                    let al = emulator.getRegister("AL");

                    if(al & 0x0F > 9 || emulator.getFlag("AF")){
                        emulator.addRegister("AL", 6);
                        emulator.setFlag("AF", 1);
                    }
                    
                    if(al > 0x9F || emulator.getFlag("CF")){
                        emulator.addRegister("AL", 0x60);
                        emulator.setFlag("CF", 1);
                    }

                    opcode = b;
                    return true;
                },
                0x2F: (b)=>{ // DAS
                    let al = emulator.getRegister("AL");
                    
                    if(al & 0x0F > 9 || emulator.getFlag("AF")){
                        emulator.addRegister("AL", -6);
                        emulator.setFlag("AF", 1);
                    }
                    
                    if(al > 0x9F || emulator.getFlag("CF")){
                        emulator.addRegister("AL", -0x60);
                        emulator.setFlag("CF", 1);
                    }

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

                    _setFlags(emulator, c);

                    opcode = b;
                    return true;
                },
                0x3C: (b)=>{ // CMP AL, imm8
                    let c = _subtract(emulator.getRegister("AL"),
                                      emulator.get("byte"),
                                      "byte");
                    
                    _setFlags(emulator, c);

                    opcode = b;
                    return true;
                },
                0x3D: (b)=>{ // CMP AX, imm16
                    let c = _subtract(emulator.getRegister("AX"),
                                      emulator.get("word"),
                                      "word");
                    
                    _setFlags(emulator, c);

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
                    let reg = regList[(b-0x40) + 8],
                        c   = _add(emulator.getRegister(reg), 1, "word");
                    
                    c.cf = -1;
                    _setFlags(emulator, c);
                    emulator.addRegister(reg, 1);
                    
                    opcode = b;
                    return true;
                },
                [s.bet(0x48, 0x4F)]: (b)=>{ // DEC reg16
                    let reg = regList[(b-0x48) + 8],
                        c   = _subtract(emulator.getRegister(reg), 1, "word");
                    
                    c.cf = -1;
                    _setFlags(emulator, c);
                    emulator.addRegister(reg, -1);
                    
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
                0x70: (b)=>{ // JO rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    if(emulator.getFlag("OF")){
                        emulator.addRegister("IP", disp);
                    }

                    opcode = b;
                    return true;
                },
                0x71: (b)=>{ // JNO rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    if(!emulator.getFlag("OF")){
                        emulator.addRegister("IP", disp);
                    }

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
                0x77: (b)=>{ // JNB/JAE/JNC rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    if(!emulator.getFlag("CF")){
                        emulator.addRegister("IP", disp);
                    }

                    opcode = b;
                    return true;
                },
                0x74: (b)=>{ // JZ/JE rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    if(emulator.getFlag("ZF")){
                        emulator.addRegister("IP", disp);
                    }

                    opcode = b;
                    return true;
                },
                0x75: (b)=>{ // JNZ/JNE rel8
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
                0x77: (b)=>{ // JA/JNBE rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    if(!emulator.getFlag("CF") && !emulator.getFlag("ZF")){
                        emulator.addRegister("IP", disp);
                    }

                    opcode = b;
                    return true;
                },
                0x78: (b)=>{ // JS rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    if(emulator.getFlag("SF")){
                        emulator.addRegister("IP", disp);
                    }

                    opcode = b;
                    return true;
                },
                0x79: (b)=>{ // JNS rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    if(!emulator.getFlag("SF")){
                        emulator.addRegister("IP", disp);
                    }

                    opcode = b;
                    return true;
                },
                0x7A: (b)=>{ // JP/JPE rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    if(emulator.getFlag("PF")){
                        emulator.addRegister("IP", disp);
                    }

                    opcode = b;
                    return true;
                },
                0x7B: (b)=>{ // JNP/JPO rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    if(!emulator.getFlag("PF")){
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
                
                0x7D: (b)=>{ // JNL/JGE rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    if(emulator.getFlag("SF") == emulator.getFlag("OF")){
                        
                        emulator.addRegister("IP", disp);
                    }

                    opcode = b;
                    return true;
                },
                0x7E: (b)=>{ // JLE/JNG rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    if(emulator.getFlag("ZF") ||
                       emulator.getFlag("SF") != emulator.getFlag("OF")){
                        
                        emulator.addRegister("IP", disp);
                    }

                    opcode = b;
                    return true;
                },
                0x7F: (b)=>{ // JNLE/JG rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    if(!emulator.getFlag("ZF") &&
                        emulator.getFlag("SF") == emulator.getFlag("OF")){
                        
                        emulator.addRegister("IP", disp);
                    }

                    opcode = b;
                    return true;
                },
                [s.bet(0x80, 0x82)]: (b)=>{ // ADD/ADC/AND/OR/CMP r/m(8/16), imm(8/16)
                    let c,
                        modRM = _parseModRM(bitW, emulator.get("byte")),
                        imm   = emulator.get(size);

                    if(modRM.operand instanceof Array){
                        let addr  = _calcAddress(emulator, modRM.operand),
                            value = emulator.getFrom(addr, size);
                        
                        switch(modRM.reg){
                            case 0b000: // ADD
                                emulator.add(addr, size, imm);
                                c = _add(value, imm, size);
                                break;
                            case 0b001: // OR
                                emulator.set(addr, size, value | imm);
                                c = _or(value, imm, size);
                                break;
                            case 0b010: // ADC
                                emulator.add(addr, size, imm +
                                                         emulator.getFlag("CF"));
                                c = _add(value, imm + emulator.getFlag("CF"), size);
                                break;
                            case 0b100: // AND
                                emulator.set(addr, size, value & imm);
                                c = _and(value, imm, size);
                                break;
                            case 0b111: // CMP
                                c = _subtract(emulator.getFrom(addr, size),
                                              emulator.get(size),
                                              size);
                                break;
                        }
                    } else {
                        let value = emulator.getRegister(modRM.operand);

                        switch(modRM.reg){
                            case 0b000: // ADD
                                emulator.addRegister(modRM.operand, imm);
                                c = _add(value, imm, size);
                                break;
                            case 0b001: // OR
                                emulator.setRegister(modRM.operand, value | imm);
                                c = _or(value, imm, size);
                                break;
                            case 0b010: // ADC
                                emulator.addRegister(modRM.operand, imm +
                                                                    emulator.getFlag("CF"));
                                c = _add(value, imm + emulator.getFlag("CF"), size);
                                break;
                            case 0b100: // AND
                                emulator.setRegister(modRM.operand, value & imm);
                                c = _and(value, imm, size);
                                break;
                            case 0b111: // CMP
                                c = _subtract(value, imm, size);
                                break;
                        }
                    }

                    _setFlags(emulator, c);

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
                0x8D: (b)=>{ // LEA r16, m
                    let modRM = _parseModRM(bitW, emulator.get("byte"));

                    emulator.setRegister(modRM.register,
                                         _calcAddress(emulator, modRM.operand));
                    
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
                0x9C: (b)=>{ // PUSHF
                    emulator.pushf();

                    opcode = b;
                    return true;
                },
                0x9D: (b)=>{ // POPF
                    emulator.popf();
                    opcode = b;
                    return true;
                },
                0x9E: (b)=>{ // SAHF
                    let ah = emulator.getRegister("AH");

                    emulator.setFlag("CF",  ah & 0b00000001);
                    emulator.setFlag("PF", (ah & 0b00000100) >> 2);
                    emulator.setFlag("AF", (ah & 0b00010000) >> 4);
                    emulator.setFlag("ZF", (ah & 0b01000000) >> 6);
                    emulator.setFlag("SF", (ah & 0b10000000) >> 7);

                    opcode = b;
                    return true;
                },
                0x9F: (b)=>{ // LAHF
                    let ah = emulator.getFlag("CF")
                           | emulator.getFlag("PF") << 2
                           | emulator.getFlag("AF") << 4
                           | emulator.getFlag("ZF") << 6
                           | emulator.getFlag("SF") << 7;

                    emulator.setRegister("AH", ah);

                    opcode = b;
                    return true;
                },
                [s.any(0xA4, 0xA5)]: (b)=>{ // MOVSB/MOVSW
                    let addrSi = emulator.address("DS:SI"),
                        addrDi = emulator.address("ES:DI");

                    emulator.set(addrDi, size, emulator.getFrom(addrSi, size));
                    
                    if(emulator.getFlag("DF")){
                        emulator.addRegister("SI", -(bitW + 1));
                        emulator.addRegister("DI", -(bitW + 1));
                    } else {
                        emulator.addRegister("SI", bitW + 1);
                        emulator.addRegister("DI", bitW + 1);
                    }
                    
                    opcode = b;
                    return true;
                },
                [s.any(0xA6, 0xA7)]: (b)=>{ // CMPSB/CMPSW
                    let si = emulator.getFrom("DS:SI", size),
                        di = emulator.getFrom("ES:DI", size);
                    
                    _setFlags(emulator, _subtract(si, di, size));

                    if(emulator.getFlag("DF")){
                        emulator.addRegister("SI", -(bitW + 1));
                        emulator.addRegister("DI", -(bitW + 1));
                    } else {
                        emulator.addRegister("SI", bitW + 1);
                        emulator.addRegister("DI", bitW + 1);
                    }

                    opcode = b;
                    return true;
                },
                [s.any(0xAC, 0xAD)]: (b)=>{ // LODSB/LODSW
                    let addr = emulator.address("DS:SI"),
                        reg  = ["AL", "AX"][bitW];

                    emulator.setRegister(reg,
                                         emulator.getFrom(addr, size));
                    
                    if( !emulator.getFlag("DF") )
                        emulator.addRegister("SI", bitW + 1);
                    else
                        emulator.addRegister("SI", -(bitW + 1));
                    
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
                [s.any(0xC4, 0xC5)]: (b)=>{ // LES/LDS r16, m16
                    let modRM = _parseModRM(bitW, emulator.get("byte")),
                        addr  = _calcAddress(emulator, modRM.operand);
                    
                    emulator.setRegister(modRM.register, emulator.getFrom(addr,   "word"));

                    if(b == 0xC4)
                        emulator.setRegister("ES", emulator.getFrom(addr+2, "word"));
                    else
                        emulator.setRegister("DS", emulator.getFrom(addr+2, "word"));

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
                    this.interrupt(emulator, emulator.get("byte"));

                    opcode = b;
                    return true;
                },
                0xCE: (b)=>{ // INTO
                    if(emulator.getRegister("OF"))
                        Machine8086.interrupt(emulator, 4, b);

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
                [s.bet(0xE0, 0xE2)]: (b)=>{ // LOOPNZ/LOOPZ/LOOP rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    emulator.addRegister("CX", -1);
                    switch(b){
                        case 0xE0:
                            if(emulator.getRegister("CX") != 0 && !emulator.getFlag("ZF")){
                                emulator.addRegister("IP", disp);
                            }
                            break;
                        case 0xE1:
                            if(emulator.getRegister("CX") != 0 && emulator.getFlag("ZF")){
                                emulator.addRegister("IP", disp);
                            }
                            break;
                        case 0xE2:
                            if(emulator.getRegister("CX") != 0){
                                emulator.addRegister("IP", disp);
                            }
                            break;
                    }

                    opcode = b;
                    return true;
                },
                0xE3: (b)=>{ // JCXZ rel8
                    let disp = _signedValue(emulator.get("byte"), "byte");

                    if(emulator.getRegister("CX") == 0){
                        emulator.addRegister("IP", disp);
                    }

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
                0xE9: (b)=>{ // JMP rel16
                    let dist = _signedValue(emulator.get("word"), "word");

                    emulator.addRegister("IP", dist);
                    opcode = b;
                    return true;
                },
                0xEB: (b)=>{ // JMP rel8
                    let dist = _signedValue(emulator.get("byte"), "byte");

                    emulator.addRegister("IP", dist);
                    opcode = b;
                    return true;
                },
                0xF4: (b)=>{ // HLT
                    if(typeof this.OnHalt == "function")
                        this.OnHalt();

                    opcode = b;
                    return true;
                },
                0xF5: (b)=>{ // CMC
                    emulator.setFlag("CF", 1 - emulator.getFlag("CF"));
                    opcode = b;
                    return true;
                },
                [s.any(0xF6, 0xF7)]: (b)=>{ // MUL/IMUL/DIV/IDIV/NEG/NOT r/m(8/16)
                    const MULT = 0x10000;

                    let value, result,
                        modRM = _parseModRM(bitW, emulator.get("byte"));

                    if(modRM.operand instanceof Array)
                        value = emulator.getFrom(_calcAddress(emulator, modRM.operand), size);
                    else
                        value = emulator.getRegister(modRM.operand);
                    
                    switch(modRM.reg){
                        case 0b011: case 0b010: // NEG/NOT
                            if(modRM.reg == 0b011)
                                value = _toSignedValue(-value, size);
                            else
                                value = _toSignedValue(~value, size);
                            
                            if(modRM.operand instanceof Array)
                                emulator.set(_calcAddress(emulator, modRM.operand), size, value);
                            else
                                emulator.setRegister(modRM.operand, value);
                            
                            break;
                        case 0b101: // IMUL
                            value = _signedValue(value, size);
                        case 0b100: // MUL
                            let v;                                

                            if(bitW){
                                let dx;
                                
                                if(modRM.reg == 0b101){ // IMUL
                                    result = _toSignedValue(
                                                _signedValue(emulator.getRegister("AX"), size) * value,
                                                size);
                                    
                                    dx = _toSignedValue(parseInt(result / MULT), size);
                                } else {
                                    result = emulator.getRegister("AX") * value;
                                    dx     = parseInt(result / MULT);
                                }

                                emulator.setRegister("DX", dx);
                                emulator.setRegister("AX", result & 0xFFFF);

                                v = 0 + (dx != 0);
                            } else {
                                if(modRM.reg == 0b101){ // IMUL
                                    result = _toSignedValue(
                                                _signedValue(emulator.getRegister("AL"), size) * value,
                                                size);
                                } else {
                                    result = emulator.getRegister("AL") * value;
                                }

                                emulator.setRegister("AX", result);
                                v = 0 + (emulator.getRegister("AH") != 0);
                            }

                            emulator.setFlag("CF", v);
                            emulator.setFlag("OF", v);
                            break;
                        case 0b111: // IDIV
                            value = _signedValue(value, size);
                        case 0b110: // DIV
                            if(value == 0){
                                this.interrupt(emulator, 0, b); // Division by Zero
                                break;
                            }
                            
                            if(bitW){
                                result = (emulator.getRegister("DX") * MULT) + emulator.getRegister("AX");
    
                                if(modRM.reg == 0b111){ // IDIV
                                    result = _signedValue(result, "dword");
                                    emulator.setRegister("AX", _toSignedValue(result / value, "word"));
                                    emulator.setRegister("DX", _toSignedValue(result % value, "word"));
                                } else {
                                    emulator.setRegister("AX", result / value);
                                    emulator.setRegister("DX", result % value);
                                }
                            } else {
                                result = emulator.getRegister("AX");
    
                                if(modRM.reg == 0b111){ // IDIV
                                    result = _signedValue(result, "word");
                                    emulator.setRegister("AL", _toSignedValue(result / value, "byte"));
                                    emulator.setRegister("AH", _toSignedValue(result % value, "byte"));
                                } else {
                                    emulator.setRegister("AL", result / value);
                                    emulator.setRegister("AH", result % value);
                                }
                            }
                            break;
                    }

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
                [s.any(0xFE, 0xFF)]: (b)=>{ // INC/DEC/JMP r/m(8/16)
                    let modRM = _parseModRM(bitW, emulator.get("byte"));

                    if(modRM.operand instanceof Array){
                        let addr = _calcAddress(emulator, modRM.operand);

                        switch(modRM.reg){
                            case 0b000: // INC
                                _setFlags(emulator, _add(emulator.getFrom(addr, size), 1, size));
                                emulator.add(addr, size, 1);
                                break;
                            case 0b001: // DEC
                                _setFlags(emulator, _subtract(emulator.getFrom(addr, size), 1, size));
                                emulator.add(addr, size, -1);
                                break;
                            case 0b100: // JMP r/m16
                                emulator.addRegister("IP",
                                                     _signedValue(emulator.getFrom(addr, size), size));
                        }
                    } else {
                        switch(modRM.reg){
                            case 0b000: // INC
                                _setFlags(emulator, _add(emulator.getRegister(modRM.operand), 1, size));
                                emulator.addRegister(modRM.operand, 1);
                                break;
                            case 0b001: // DEC
                                _setFlags(emulator, _subtract(emulator.getRegister(modRM.operand), 1, size));
                                emulator.addRegister(modRM.operand, -1);
                                break;
                            case 0b100: // JMP r/m16
                                emulator.addRegister("IP",
                                                     _signedValue(emulator.getRegister(modRM.operand), size));
                        }                        
                    }

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

    interrupt: function(emulator, int, opcode = 0xCD){
        if(emulator.getFrom(int * 4, "dword") != 0){
            emulator.push(emulator.eflags);
            emulator.push("CS");
            emulator.push("IP");

            emulator.setRegister("IP",
                                 emulator.getFrom(int * 4, "word"));
            emulator.setRegister("CS",
                                 emulator.getFrom(int * 4 + 2, "word"));
            
            this.exception(int, opcode);
        } else if(emulator.virtualInterrupt &&
            typeof emulator.interrupt[int] == "function"){

            emulator.interrupt[int]();
        }
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

function _toSignedValue(value, size){
    var max = {
        "byte":  0xFF,
        "word":  0xFFFF,
        "dword": 0xFFFFFFFF
    }[size];

    value = parseInt(value);
    
    if(value < 0)
        value = max + value + 1;

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
    ret.af = 0 + ((v1 & (1 << 4)) == 0 && (v2 & (1 << 4)) != 0);
    
    return ret;
}

function _add(value1, value2, size = "byte"){
    var max = {
        "byte":  0xFF,
        "word":  0xFFFF,
        "dword": 0xFFFFFFFF
    }[size];

    var v1   = _signedValue(value1, size),
        s1   = Math.sign(v1),
        v2   = _signedValue(value2, size),
        s2   = Math.sign(v2),
        res  = v1+v2,
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
    ret.cf = 0 + (res > max);
    ret.af = 0 + ((v1 & (1 << 3)) != 0 && (v2 & (1 << 3)) != 0);
    
    return ret;
}

function _and(value1, value2, size = "byte"){
    var max = {
        "byte":  0xFF,
        "word":  0xFFFF,
        "dword": 0xFFFFFFFF
    }[size];

    var v1   = _signedValue(value1, size),
        s1   = Math.sign(v1),
        v2   = _signedValue(value2, size),
        s2   = Math.sign(v2),
        res  = v1 & v2,
        sres = Math.sign(res),
        ret  = {
            v1:   v1,
            s1:   s1,
            v2:   v2,
            s2:   s2,
            res:  res,
            sres: sres
        };
    
    ret.of = 0;
    ret.zf = 0 + (res == 0);
    ret.sf = 0 + (sres == -1);
    ret.pf = 1 - (sres & 1);
    ret.cf = 0;
    ret.af = -1;
    
    return ret;
}

function _or(value1, value2, size = "byte"){
    var max = {
        "byte":  0xFF,
        "word":  0xFFFF,
        "dword": 0xFFFFFFFF
    }[size];

    var v1   = _signedValue(value1, size),
        s1   = Math.sign(v1),
        v2   = _signedValue(value2, size),
        s2   = Math.sign(v2),
        res  = v1 | v2,
        sres = Math.sign(res),
        ret  = {
            v1:   v1,
            s1:   s1,
            v2:   v2,
            s2:   s2,
            res:  res,
            sres: sres
        };
    
    ret.of = 0;
    ret.zf = 0 + (res == 0);
    ret.sf = 0 + (sres == -1);
    ret.pf = 1 - (sres & 1);
    ret.cf = 0;
    ret.af = -1;
    
    return ret;
}

function _setFlags(emulator, flags){
    if(flags.of >= 0)
        emulator.setFlag("OF", flags.of);
    if(flags.sf >= 0)
        emulator.setFlag("SF", flags.sf);
    if(flags.zf >= 0)
        emulator.setFlag("ZF", flags.zf);
    if(flags.af >= 0)
        emulator.setFlag("AF", flags.af);
    if(flags.pf >= 0)
        emulator.setFlag("PF", flags.pf);
    if(flags.cf >= 0)
        emulator.setFlag("CF", flags.cf);
}