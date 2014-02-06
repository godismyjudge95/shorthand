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
     * AST format is from LESS parser.
     *
     * @ param {name: {string}, value.value[0].value: {Array<{string}>}} decl CSS shorthand declaration
     * @return {Array<{name:{string}, value.value[0].value:{Array<{string}}}>}
     */
    ProviderBG.prototype.convertShorthandToLonghand = function (decl) {
        var longhandVals = ShorthandManager.expandValues(decl.value.value[0].value);
        
        return [
            { name: this.propName + "-image",    value: { value: [ { value: longhandVals[0] } ] } },
            { name: this.propName + "-position",  value: { value: [ { value: longhandVals[1] } ] } },
            { name: this.propName + "-size", value: { value: [ { value: longhandVals[2] } ] } },
            { name: this.propName + "-repeat",   value: { value: [ { value: longhandVals[3] } ] } },
            { name: this.propName + "-attachment",   value: { value: [ { value: longhandVals[4] } ] } },
            { name: this.propName + "-origin",   value: { value: [ { value: longhandVals[5] } ] } },
            { name: this.propName + "-clip",   value: { value: [ { value: longhandVals[6] } ] } },
            { name: this.propName + "-color",   value: { value: [ { value: longhandVals[7] } ] } }
        ];
    };

    /**
     * Converts a CSS longhand declaration list to a shorthand declaration.
     *
     * If input cannot be converted, then null is returned.
     *
     * AST format is from LESS parser.
     *
     * @ param {Array<{name: {string}, value.value[0].value: {string}}>} decl CSS shorthand declaration
     * @return {name:{string}, value.value[0].value:{string}}
     */
    ProviderBG.prototype.convertLonghandToShorthand = function (declList) {
        var decl,
            shorthandVals = [];

        if (declList.length !== 8) {
            return null;
        }

        decl = ShorthandManager.findPropInDecList(this.propName + "-image", declList);
        if (!decl) {
            return null;
        }
        shorthandVals.push(decl.value.value[0].value);

        decl = ShorthandManager.findPropInDecList(this.propName + "-position", declList);
        if (!decl) {
            return null;
        }
        shorthandVals.push(decl.value.value[0].value);

        decl = ShorthandManager.findPropInDecList(this.propName + "-size", declList);
        if (!decl) {
            return null;
        }
        shorthandVals.push(decl.value.value[0].value);

        decl = ShorthandManager.findPropInDecList(this.propName + "-repeat", declList);
        if (!decl) {
            return null;
        }
        shorthandVals.push(decl.value.value[0].value);
        
        decl = ShorthandManager.findPropInDecList(this.propName + "-attachment", declList);
        if (!decl) {
            return null;
        }
        shorthandVals.push(decl.value.value[0].value);
        
        decl = ShorthandManager.findPropInDecList(this.propName + "-origin", declList);
        if (!decl) {
            return null;
        }
        shorthandVals.push(decl.value.value[0].value);
        
        decl = ShorthandManager.findPropInDecList(this.propName + "-clip", declList);
        if (!decl) {
            return null;
        }
        shorthandVals.push(decl.value.value[0].value);
        
        decl = ShorthandManager.findPropInDecList(this.propName + "-color", declList);
        if (!decl) {
            return null;
        }
        shorthandVals.push(decl.value.value[0].value);

        return {
            name: this.propName,
            value: {
                value: [
                    { value: ShorthandManager.collapseValues(shorthandVals).join(" ") }
                ]
            }
        };
    };

    // Initialize
    var provider = new ProviderBG();
    ShorthandManager.registerShorthandProvider("background", provider);
});
