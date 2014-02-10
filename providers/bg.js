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
 * This provider handles the css shorthand property in the background format.
 *
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $ */


define(function (require, exports, module) {
    "use strict";

    var ShorthandManager    = require("ShorthandManager");


    // Provider Prototypes

    /**
     * @constructor
     */
    function ProviderBG() {
    }
    
    ProviderBG.prototype.propName = "background";

    /**
     * Converts a CSS shorthand declaration to a longhand declaration list.
     *
     * If input cannot be converted, then null is returned.
     *
     * @ param {prop: {string}, val: {string}} decl CSS shorthand declaration
     * @return {Array<{prop:{string}, val:{string}}>}
     */
    ProviderBG.prototype.convertShorthandToLonghand = function (decl) {
        var longhandVals = ShorthandManager.convertProps(
            [ decl ],
            [
                "backgroundImage",
                "backgroundPosition",
                "backgroundSize",
                "backgroundRepeat",
                "backgroundAttachment",
                "backgroundOrigin",
                "backgroundClip",
                "backgroundColor"
            ]
        );

        // If values is empty, then set the default to "initial"
        longhandVals.forEach(function (val, index) {
            if (val === "") {
                longhandVals[index] = "initial";
            }
        });

        // Return each of the longhand values
        return [
            { prop: this.propName + "-image",      val: longhandVals[0] },
            { prop: this.propName + "-position",   val: longhandVals[1] },
            { prop: this.propName + "-size",       val: longhandVals[2] },
            { prop: this.propName + "-repeat",     val: longhandVals[3] },
            { prop: this.propName + "-attachment", val: longhandVals[4] },
            { prop: this.propName + "-origin",     val: longhandVals[5] },
            { prop: this.propName + "-clip",       val: longhandVals[6] },
            { prop: this.propName + "-color",      val: longhandVals[7] }
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
        var shorthandVals,
            activeDeclList = [];

        // Remove the properties that have not been changed and have the "initial" value
        declList.forEach(function (decl, index) {
            if (decl.val !== "initial") {
                activeDeclList.push(decl);
            }
        });

        shorthandVals = ShorthandManager.convertProps(
            activeDeclList,
            [ this.propName ]
        );

        // Return shorthand declaration
        return { prop: this.propName, val: shorthandVals[0] };
    };

    // Initialize
    var provider = new ProviderBG();
    ShorthandManager.registerShorthandProvider("background", provider);
});
