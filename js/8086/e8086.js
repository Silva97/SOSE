/********************
 * Developed by Luiz Felipe - 2018
 *     GitHub: https://github.com/Silva97
 *     Email:  felipe.silva337@yahoo.com
 * 
 * Distributed under the MIT License.
 ********************/

"use strict";

const EMULATOR_MEMORY_SIZE = 0x10FFEF;

class Emulator8086 {
    constructor(OnStep = null, OnError = null){
        var registers = {
            "AX": 0,
            "BX": 0,
            "CX": 0,
            "DX": 0,
            "SI": 0,
            "DI": 0,
            "BP": 0,
            "SP": 0,
            "IP": 0,
            "CS": 0,
            "DS": 0,
            "SS": 0,
            "ES": 0,
            "FS": 0,
            "GS": 0
        };

        this.OnStep           = OnStep;   // OnStep(opcode)
        this.OnError          = OnError; //  OnError(messageID, message)
        this.OnRegisterSet    = null;     // OnRegisterSet(registerName)
        this.OnFlagSet        = null;    //  OnFlagSet(flagName)
        this.OnMemorySet      = null;     // OnMemorySet(address, size)
        this.OnReset          = null;    //  OnReset()
        this.virtualInterrupt = true;     // Enable or disable virtual interrupts
        this.memory           = new DataView(new ArrayBuffer(EMULATOR_MEMORY_SIZE));
        this.interrupt        = new Array(0x100);
        this.eflags           = 0;

        this.setRegister = function(register, value){
            if(typeof value == "string"){
                value = parseInt(value, 16);
            } else if(typeof value != "number"){
                this.showError(E8086.RegisterValueInvalid, register);
                return;
            }

            value = Math.floor(value);

            switch(register){
                case "AL":
                    if(value < 0)
                        value = 0xFF - value;

                    registers["AX"] &= 0xFF00;
                    registers["AX"] |= value % 0x100;
                    break;
                case "AH":
                    if(value < 0)
                        value = 0xFF - value;

                    registers["AX"] &= 0xFF;
                    registers["AX"] |= (value % 0x100) << 8;
                    break;
                case "BL":
                    if(value < 0)
                        value = 0xFF - value;

                    registers["BX"] &= 0xFF00;
                    registers["BX"] |= value % 0x100;
                    break;
                case "BH":
                    if(value < 0)
                        value = 0xFF - value;

                    registers["BX"] &= 0x00FF;
                    registers["BX"] |= (value % 0x100) << 8;
                    break;
                case "CL":
                    if(value < 0)
                        value = 0xFF - value;

                    registers["CX"] &= 0xFF00;
                    registers["CX"] |= value % 0x100;
                    break;
                case "CH":
                    if(value < 0)
                        value = 0xFF - value;

                    registers["CX"] &= 0x00FF;
                    registers["CX"] |= (value % 0x100) << 8;
                    break;
                case "DL":
                    if(value < 0)
                        value = 0xFF - value;

                    registers["DX"] &= 0xFF00;
                    registers["DX"] |= value % 0x100;
                    break;
                case "DH":
                    if(value < 0)
                        value = 0xFF - value;

                    registers["DX"] &= 0x00FF;
                    registers["DX"] |= (value % 0x100) << 8;
                    break;

                default:
                    if(typeof registers[register] == "undefined"){
                        this.showError(E8086.RegisterNotExist, register);
                        return;
                    }

                    if(value < 0)
                        value = 0xFFFF - value;

                    registers[register] = value % 0x10000;
                    break;
            }

            if(typeof this.OnRegisterSet == "function")
                this.OnRegisterSet(register);
        }

        this.addRegister = function(register, add){
            var value = this.getRegister(register);
            this.setRegister(register, value + add);

            return value;
        }

        this.getRegister = function(register){
            switch(register){
                case "AL":
                    return (registers["AX"] & 0xFF  );
                case "AH":
                    return (registers["AX"] & 0xFF00) >> 8;
                case "BL":
                    return (registers["BX"] & 0xFF  );
                case "BH":
                    return (registers["BX"] & 0xFF00) >> 8;
                case "CL":
                    return (registers["CX"] & 0xFF  );
                case "CH":
                    return (registers["CX"] & 0xFF00) >> 8;
                case "DL":
                    return (registers["DX"] & 0xFF  );
                case "DH":
                    return (registers["DX"] & 0xFF00) >> 8;

                default:
                    if(typeof registers[register] == "undefined"){
                        this.showError(E8086.RegisterNotExist, register);
                    } else {
                        return registers[register];
                    }
            }
        }

        this.clearRegisters = function(){
            for(var i in registers)
                registers[i] = 0;
        }

        this.setFlag = function(flag, value){
            var fpos = _getFlagPos(flag);

            if(fpos == -1){
                this.showError(E8086.FlagNotExist, flag);
                return;
            }

            if(value)
                this.eflags |= 1 << (15 - fpos);
            else
                this.eflags &= ~(1 << (15 - fpos));

            if(typeof this.OnFlagSet == "function")
                this.OnFlagSet(flag);
        }

        this.getFlag = function(flag){
            var fpos = _getFlagPos(flag);

            if(fpos == -1){
                this.showError(E8086.FlagNotExist, flag);
                return;
            }

            return (this.eflags & 1 << (15 - fpos)) >> (15 - fpos);
        }
    }

    /*****
     * Calculates the real address from segment:displacement.
     * This accepts registers names.
     *****/
    address(addr){
        var segment, displacement,
            values = addr.split(":");

        if(values.length > 1){
            if(!values[1].match(/^(0x[0-9a-f]+|[0-9a-f]+)$/i)){
                displacement = this.getRegister(values[1]);
            } else {
                displacement = parseInt(values[1], 16);
            }
            
            if(displacement < 0)
                displacement = 0;
            else if(displacement > 0xFFFF)
                displacement = 0xFFFF;
        }

        if(!values[0].match(/^(0x[0-9a-f]+|[0-9a-f]+)$/i)){
            segment = this.getRegister(values[0]);
        } else {
            segment = parseInt(values[0], 16);
        }

        if(segment < 0)
            segment = 0;
        else if(segment > 0xFFFF && values.length > 1)
            segment = 0xFFFF;

        if(values.length == 1)
            return segment;
        else
            return (segment << 4) + displacement;
    }

    /*****
     * Reads the memory from CS:IP and increments IP.
     *****/
    get(size){
        var ret;

        switch(size){
            case "byte":
                ret = this.memory.getUint8(this.address("CS:IP"));
                this.addRegister("IP", 1);
                return ret;
            case "word":
                ret = this.memory.getUint16(this.address("CS:IP"), true);
                this.addRegister("IP", 2);
                return ret;
            case "dword":
                ret = this.memory.getUint32(this.address("CS:IP"), true);
                this.addRegister("IP", 4);
                return ret;
            default:
                this.showError(E8086.SizeNotValid, size);
                return -1;
        }
    }

    /*****
     * Reads the memory in the address.
     *****/
    getFrom(address, size){
        if(typeof address == "string")
            address = this.address(address);

        switch(size){
            case "byte":
                return this.memory.getUint8(address);
            case "word":
                return this.memory.getUint16(address, true);
            case "dword":
                return this.memory.getUint32(address, true);
            default:
                this.showError(E8086.SizeNotValid, size);
                return -1;
        }
    }

    set(address, size, value){
        if(typeof address == "string")
            address = this.address(address);

        switch(size){
            case "byte":
                this.memory.setUint8(address,  value);
                break;
            case "word":
                this.memory.setUint16(address, value, true);
                break;
            case "dword":
                this.memory.setUint32(address, value, true);
                break;
            default:
                this.showError(E8086.SizeNotValid, size);
                return -1;
        }

        if(typeof this.OnMemorySet == "function")
            this.OnMemorySet(address, size);

        return address;
    }

    add(address, size, value){
        if(typeof address == "string")
            address = this.address(address);

        var v = this.getFrom(address, size) + value;

        switch(size){
            case "byte":
                if(v < 0)
                    v = 0xFF - v;

                return this.memory.setUint8(address,  v%0x100);
            case "word":
                if(v < 0)
                    v = 0xFFFF - v;

                return this.memory.setUint16(address, v%0x10000,     true);
            case "dword":
                if(v < 0)
                    v = 0xFFFFFFFF - v;

                return this.memory.setUint32(address, v%0x100000000, true);
            default:
                this.showError(E8086.SizeNotValid, size);
                return -1;
        }

        if(typeof this.OnMemorySet == "function")
            this.OnMemorySet(address, size);
    }


    /*****
     * Pushes a value in the stack.
     *****/
    push(value){
        if(typeof value == "string")
            value = this.getRegister(value);

        this.addRegister("SP", -2);
        this.set(this.address("SS:SP"), "word", value);
    }

    /*****
     * Pops a value from the stack.
     *****/
    pop(register){
        var value = this.getFrom("SS:SP", "word");
        this.addRegister("SP", 2);

        if(typeof register == "string")
            this.setRegister(register, value);

        return value;
    }

    /*****
     * Loads in memory an array or string.
     *****/
    load(address, bytes){
        for(var i = 0; i < bytes.length; i++){
            if(typeof bytes == "string"){
                this.memory.setUint8(address++,
                                     bytes[i].charCodeAt());
            } else {
                this.memory.setUint8(address++, bytes[i]);
            }
        }
    }

    /*****
     * Dumps from memory and returns an array
     * with the values.
     *****/
    dump(address, length, size = "byte"){
        var arr   = [],
            sizes = {
                "byte":  1,
                "word":  2,
                "dword": 4
            };

        for(var i = 0; i < length; i++){
            arr.push( this.getFrom(address, size) );
            address += sizes[size];
        }

        return arr;
    }

    /*****
     * Reset the emulator to default values.
     *****/
    reset(){
        this.clearRegisters();
        this.eflags = 0;
        this.memory = new DataView(new ArrayBuffer(EMULATOR_MEMORY_SIZE));

        if(typeof this.OnReset == "function")
            this.OnReset();
    }

    step(){
        var opcode = Machine8086.step(this);

        if(typeof this.OnStep == "function")
            this.OnStep(opcode);
    }

    /*****
     * Shows in the console an error message and
     * run the OnError() event.
     *****/
    showError(messageID, more = ""){
        var message;

        switch(messageID){
            case E8086.RegisterValueInvalid:
                message = `The value for the register ${more} is not valid.`;
                break;
            case E8086.RegisterNotExist:
                message = `The register ${more} not exist.`;
                break;
            case E8086.FlagNotExist:
                message = `The flag ${more} not exist.`;
                break;
            case E8086.SizeNotValid:
                message = `The size "${more}" not is valid.`;
                break;
        }

        console.log("%c8086.js ERROR #"+ messageID,
                    "font-size: 24px; font-weight: bold; color: red;");
        console.log("    "+ message);

        if(typeof this.OnError == "function")
            this.OnError(messageID, message);
    }
}

/*****
 * The IDs of the error messages.
 *****/
const E8086 = {
    RegisterValueInvalid: 1000001,
    RegisterNotExist:     1000010,
    FlagNotExist:         1000011,
    SizeNotValid:         1000100
};

/*****
 * Returns the position of the flag.
 *****/
function _getFlagPos(flag){
    var flist = ["  ", "  ", "  ", "  ", "OF", "DF", "IF", "TF",
                 "SF", "ZF", "  ", "AF", "  ", "PF", "  ", "CF"];

    for(var i = 0; i < flist.length; i++){
        if(flist[i] == flag)
            return i;
    }

    return -1;
}