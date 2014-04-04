/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Leinardo Smith
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 */
/*
 * This provider handles the css shorthand property in the font format.
 *
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $ */


define(function (require, exports, module) {
    "use strict";

    var ShorthandManager    = require("ShorthandManager");
    var originalProps;


    // Provider Prototypes

    /**
     * @constructor
     */
    function ProviderBG() {
    }
    
    ProviderBG.prototype.propName = "font";

    /**
     * Converts a CSS shorthand declaration to a longhand declaration list.
     *
     * If input cannot be converted, then null is returned.
     *
     * @ param {prop: {string}, val: {string}} decl CSS shorthand declaration
     * @return {Array<{prop:{string}, val:{string}}>}
     */
    ProviderBG.prototype.convertShorthandToLonghand = function (decl) {
        var longhandVals;
        //Get all the various font shorthand values
        originalProps = decl;
        //Put all the shorthand values in an array
        longhandVals = decl.val.match(/(?:(?:(normal|italic|oblique|initial|inherit)\s+)?(?:(normal|small-caps|initial|inherit)\s+)?(?:((?:normal|bold|bolder|lighter|initial|inherit|\d+))\s+)?(?:(smaller|small|x-small|xx-small|medium|larger|large|x-large|xx-large|initial|inherit|\d+(?:\%|in|cm|mm|em|rem|ex|pt|pc|px))(?:\/(normal|initial|inherit|\d+(?:\%|in|cm|mm|em|rem|ex|pt|pc|px)))?\s+)(?:(initial|inherit|(?:"[^"]*"|'[^']*'|[a-zA-Z-]+)(?:\s*,\s*(?:"[^"]*"|'[^']*'|[a-zA-Z-]+))*))|(caption|icon|menu|message-box|small-caption|status-bar|initial|inherit))/i);
        longhandVals.splice(0,1);

        // If values is empty, then set the default to "initial"
        longhandVals.forEach(function (val, i) {
            if (val === undefined) {
                longhandVals[i] = "initial";
            }
        });

        // Return each of the longhand values
        return [
            { prop: this.propName + "-style",      val: longhandVals[0] },
            { prop: this.propName + "-varient",   val: longhandVals[1] },
            { prop: this.propName + "-weight",       val: longhandVals[2] },
            { prop: this.propName + "-size",     val: longhandVals[3] },
            { prop: this.propName + "-height", val: longhandVals[4] },
            { prop: this.propName + "-family",     val: longhandVals[5] },
            { prop: this.propName + "-values",     val: longhandVals[6] }
        ];
    };

    /**
     * Converts a CSS longhand declaration list to a shorthand declaration.
     *
     * If input cannot be converted, then null is returned.
     *
     * @ param {Array<{prop: {string}, val: {string}}>} decl CSS longhand declarations
     * @return {prop:{string}, val:{string}}
     */
    ProviderBG.prototype.convertLonghandToShorthand = function (declList) {
        var shorthandVals = "", decl = "", longhandVals;
        
        declList.forEach(function(val, i) {
            decl += i === 4 ? "/ " : "";
            decl += val.val;
            decl += i < 6 ? " " : "";
        });
        
        longhandVals = decl.match(/(?:(?:\s*(normal|italic|oblique|initial|inherit))?(?:\s+(normal|small-caps|initial|inherit))?(?:\s+((?:normal|bold|bolder|lighter|initial|inherit|\d+)))?(?:\s+(smaller|small|x-small|xx-small|medium|larger|large|x-large|xx-large|initial|inherit|\d+(?:\%|in|cm|mm|em|rem|ex|pt|pc|px))(?:\/(normal|initial|inherit|\d+(?:\%|in|cm|mm|em|rem|ex|pt|pc|px)))?)(?:\s+(initial|inherit|(?:"[^"]*"|'[^']*'|[a-zA-Z-]+)(?:\s*,\s*(?:"[^"]*"|'[^']*'|[a-zA-Z-]+))*))|\s+(caption|icon|menu|message-box|small-caption|status-bar|initial|inherit))/i);
        longhandVals.splice(0,1);
        
        longhandVals.forEach(function (val, i) {
            shorthandVals += i === 4 && val !== "" ? " / " : "";
            shorthandVals += val;
            shorthandVals += i < 6 && longhandVals[i+1] !== "" ? " " : "";
        });

        // Return shorthand declaration
        return { prop: this.propName, val: shorthandVals };
    };

    // Initialize
    var provider = new ProviderBG();
    ShorthandManager.registerShorthandProvider("font", provider);
});
