/********************
 * Developed by Luiz Felipe - 2018
 *     GitHub: https://github.com/Silva97
 *     Email:  felipe.silva337@yahoo.com
 * 
 * Distributed under the MIT License.
 ********************/

"use strict";

const LANG_DEFAULT = "en_US",
      LANG_DIR     = "js/lang/";

(function(){
    var tryCount = 0;

    if(typeof OnLangLoad != "function"){
        window.OnLangLoad = null;
    }

    var OnLangError = function(){
        tryCount++;

        if(tryCount <= 1)
            include(LANG_DIR + LANG_DEFAULT +".js", OnLangLoad, OnLangError);
        else
            console.error(`ERROR: No language file in "${LANG_DIR}" directory.`);
    }

    if(_GET.lang && _GET.lang != "")
        include(LANG_DIR + _GET.lang    +".js", OnLangLoad, OnLangError);
    else
        include(LANG_DIR + LANG_DEFAULT +".js", OnLangLoad, OnLangError);
})();