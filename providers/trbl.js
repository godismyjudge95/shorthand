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
 * This provider handles css shorthand properties in top-right-bottom-left (trbl) format.
 *
 * Unfortunately, this pattern does not work with: border-width shorthand because longhand
 * values are border-[side]-width (as opposed to border-width-[side]).
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $ */

define(function (require, exports, module) {
    "use strict";
    
    var ShorthandManager        = require("ShorthandManager");


    // Provider Prototypes

    /**
     * @constructor
     * Object for converting CSS margin shorthand property to longhand, and back to shorthand.
     */
    function ProviderTRBL(propName) {
        this.propName = propName;
    }

    ProviderTRBL.prototype.propName = "";

    /**
     * Converts a CSS TRBL shorthand declaration to a longhand declaration list.
     *
     * If input cannot be converted, then null is returned.
     *
     * @ param {prop: {string}, val: {string}} decl CSS shorthand declaration
     * @return {Array<{prop:{string}, val:{string}}>}
     */
    ProviderTRBL.prototype.convertShorthandToLonghand = function (decl) {
        if (decl.prop !== this.propName) {
            return [];
        }

        var longhandVals = ShorthandManager.expandTRBLValues(
            ShorthandManager.wsvToArray(decl.val)
        );
        
        return [
            { prop: this.propName + "-top",    val: longhandVals[0] },
            { prop: this.propName + "-right",  val: longhandVals[1] },
            { prop: this.propName + "-bottom", val: longhandVals[2] },
            { prop: this.propName + "-left",   val: longhandVals[3] }
        ];
    };

    /**
     * Converts a CSS margin longhand declaration list to a shorthand declaration.
     *
     * If input cannot be converted, then null is returned.
     *
     * @ param {Array<{prop: {string}, val: {string}}>} decl CSS longhand declarations
     * @return {prop:{string}, val:{string}}
     */
    ProviderTRBL.prototype.convertLonghandToShorthand = function (declList) {
        var decl,
            shorthandVals = [];

        if (declList.length !== 4) {
            return null;
        }

        decl = ShorthandManager.findPropInDecList(this.propName + "-top", declList);
        if (!decl) {
            return null;
        }
        shorthandVals.push(decl.val);

        decl = ShorthandManager.findPropInDecList(this.propName + "-right", declList);
        if (!decl) {
            return null;
        }
        shorthandVals.push(decl.val);

        decl = ShorthandManager.findPropInDecList(this.propName + "-bottom", declList);
        if (!decl) {
            return null;
        }
        shorthandVals.push(decl.val);

        decl = ShorthandManager.findPropInDecList(this.propName + "-left", declList);
        if (!decl) {
            return null;
        }
        shorthandVals.push(decl.val);

        return {
            prop: this.propName,
            val: ShorthandManager.collapseTRBLValues(shorthandVals).join(" ")
        };
    };

    // Initialize
    var providerMargin = new ProviderTRBL("margin");
    ShorthandManager.registerShorthandProvider("margin", providerMargin);

    var providerPadding = new ProviderTRBL("padding");
    ShorthandManager.registerShorthandProvider("padding", providerPadding);
});
