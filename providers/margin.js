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


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $ */

define(function (require, exports, module) {
    "use strict";
    
    var ShorthandManager        = require("ShorthandManager");

    /**
     * @constructor
     * Object for converting CSS margin shorthand property to longhand, and back to shorthand.
     */
    function ProviderMargin() {
    }

    /**
     * Converts a CSS margin shorthand declaration to a longhand declaration list.
     *
     * If input cannot be converted, then null is returned.
     *
     * AST format is from LESS parser.
     *
     * @ param {name: {string}, value.value[0].value: {Array<{string}>}} decl CSS shorthand declaration
     * @return {Array<{name:{string}, value.value[0].value:{Array<{string}}}>}
     */
    ProviderMargin.prototype.convertShorthandToLonghand = function (decl) {
        if (decl.name !== "margin") {
            return null;
        }

        var longhandVals = ShorthandManager.expandTRBLValues(
            ShorthandManager.wsvToArray(decl.value.value[0].value)
        );
        
        return [
            { name: "margin-top",    value: { value: [ { value: longhandVals[0] } ] } },
            { name: "margin-right",  value: { value: [ { value: longhandVals[1] } ] } },
            { name: "margin-bottom", value: { value: [ { value: longhandVals[2] } ] } },
            { name: "margin-left",   value: { value: [ { value: longhandVals[3] } ] } }
        ];
    };

    /**
     * Converts a CSS margin longhand declaration list to a shorthand declaration.
     *
     * If input cannot be converted, then null is returned.
     *
     * AST format is from LESS parser.
     *
     * @ param {Array<{name: {string}, value.value[0].value: {string}}>} decl CSS shorthand declaration
     * @return {name:{string}, value.value[0].value:{string}}
     */
    ProviderMargin.prototype.convertLonghandToShorthand = function (declList) {
        var decl,
            shorthandVals = [];

        if (declList.length !== 4) {
            return null;
        }

        decl = ShorthandManager.findPropInDecList("margin-top", declList);
        if (!decl) {
            return null;
        }
        shorthandVals.push(decl.value.value[0].value);

        decl = ShorthandManager.findPropInDecList("margin-right", declList);
        if (!decl) {
            return null;
        }
        shorthandVals.push(decl.value.value[0].value);

        decl = ShorthandManager.findPropInDecList("margin-bottom", declList);
        if (!decl) {
            return null;
        }
        shorthandVals.push(decl.value.value[0].value);

        decl = ShorthandManager.findPropInDecList("margin-left", declList);
        if (!decl) {
            return null;
        }
        shorthandVals.push(decl.value.value[0].value);

        return {
            name: "margin",
            value: {
                value: [
                    { value: ShorthandManager.collapseTRBLValues(shorthandVals).join(" ") }
                ]
            }
        };
    };

    // Initialize
    var providerMargin = new ProviderMargin();
    ShorthandManager.registerShorthandProvider("margin", providerMargin);
});
