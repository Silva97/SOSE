/********************
 * Developed by Luiz Felipe - 2018
 *     GitHub: https://github.com/Silva97
 *     Email:  felipe.silva337@yahoo.com
 * 
 * Distributed under the MIT License.
 ********************/

"use strict";

var s = {
    elect: function(value, matchs){
        var p, r, def = true;

        loop: for(let m in matchs){
            if(m[0] == "\v"){
                p = m.split(",");

                switch(p[0]){
                    case STYPES.Between:                       
                        if(value >= p[1] && value <= p[2]){
                            r   = matchs[m](value);
                            def = false;
                            break loop;
                        }
                        break;
                    case STYPES.GreaterThan:
                        if(value > p[1]){
                            r   = matchs[m](value);
                            def = false;
                            break loop;
                        }
                        break;
                    case STYPES.LessThan:
                        if(value < p[1]){
                            r   = matchs[m](value);
                            def = false;
                            break loop;
                        }
                        break;
                    case STYPES.Any:
                        for(let i = 1; i < p.length; i++){
                            if(p[i] == value){
                                r   = matchs[m](value);
                                def = false;
                                break loop;
                            }
                        }
                        break;
                }
            } else if(value == m){
                r   = matchs[m](value);
                def = false;
                break loop;
            }
        }

        if(def && typeof matchs[this.default] == "function")
            r = matchs[this.default](value);

        return r;
    },

    bet: function(start, end){
        return STYPES.Between +
               `,${start},${end}`;
    },

    grt: function(value){
        return STYPES.GreaterThan +","+
               value
    },

    lss: function(value){
        return STYPES.LessThan +","+
               value
    },

    any: function(...args){
        return STYPES.Any +","+
               args.toString();
    },

    void:    function(){ return; },
    default: "\vd"
};

const STYPES = {
    Between:     "\vb",
    GreaterThan: "\vg",
    LessThan:    "\vl",
    Any:         "\va"
};