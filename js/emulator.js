/********************
 * Developed by Luiz Felipe - 2018
 *     GitHub: https://github.com/Silva97
 *     Email:  felipe.silva337@yahoo.com
 * 
 * Distributed under the MIT License.
 ********************/

var emu_delay,
    emu_timeoutId   = 0,
    emu_running     = false,
    emu_autoRefresh = true;

function emu_step(n = 1){
    var list = $(".value-edited", true);
    list.setAll("className", "value-normal");
    list.setAll("lastValue", 0);
    
    emulator.step((n >= 1)? n : 1);
}

function emu_run(delay = 0){
    if(emu_timeoutId)
        clearTimeout(emu_timeoutId);

    emu_delay       = delay;
    emu_running     = true;
    emu_autoRefresh = false;
    emu_timeout();

    $("#bt_run").innerHTML = Lang.stop;
}

function emu_timeout(){
    if(!emu_running)
        return;
    
    var delay = (emu_delay > 0)? emu_delay : 1;
    if(delay > 5000)
        delay = 5000;

    if(delay < 10){
        emu_step(150);
    } else if(delay < 50){
        emu_step( Math.round(100 - delay/2) );
    } else if(delay < 100){
        emu_step( Math.round(50 - delay/4) );
    } else if(delay < 500){
        delay -= 99;
        emu_step();
    } else {
        delay          -= 99;
        emu_autoRefresh = true;
        emu_step();
        emu_autoRefresh = false;
    }

    emu_timeoutId = setTimeout(emu_timeout, delay);
}

function emu_stop(){
    emu_running     = false;
    emu_autoRefresh = true;

    if(emu_timeoutId)
        clearTimeout(emu_timeoutId);

    emu_timeoutId = 0;
    emu_refresh();

    $("#bt_run").innerHTML = Lang.run;
}

function emu_reset(){
    emu_stop();
    emulator.reset();
    bios.reset();
}

function emu_refresh(){
    var i;

    for(i = 0; i < reg_list.length; i++)
        emulator.OnRegisterSet(reg_list[i]);
    
    for(i = 0; i < memory_list.length; i++)
        memory_list[i].refresh();
    
    for(i = 0; i < flag_list.length; i++){
        if(flag_list[i] == "-")
            continue;
        
        emulator.OnFlagSet(flag_list[i] + "F");
    }
}