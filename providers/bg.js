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
        //If the values are in an array then retrieve them otherwise set them equal to decl
        var vals = decl.isArray ? decl.value.value[0].value : decl;
        //Create a jQuery temp div
        var $test = $('<div />');
        //If the css values are in an array then convert them to a string separated by spaces (preparing for jQuery)
        vals = vals.isArray ? vals.join(' ') : vals;
        //Apply the shorthand css values to the jQuery temp div
        $test.css('background', vals);
        //Use the jQuery temp div to get each of the longhand values if it is empty then set the default to "initial"
        var longhandVals = [
            $test.css('backgroundImage') === "" ? "initial" : $test.css('backgroundImage'),
            $test.css('backgroundPosition') === "" ? "initial" : $test.css('backgroundPosition'),
            $test.css('backgroundSize') === "" ? "initial" : $test.css("backgroundSize"),
            $test.css('backgroundRepeat') === "" ? "initial" : $test.css("backgroundRepeat"),
            $test.css('backgroundAttachment') === "" ? "initial" : $test.css("backgroundAttachment"),
            $test.css('backgroundOrigin') === "" ? "initial" : $test.css("backgroundOrigin"),
            $test.css('backgroundClip') === "" ? "initial" : $test.css("backgroundClip"),
            $test.css('backgroundColor') === "" ? "initial" : $test.css("backgroundColor")
        ];
        //Return each of the longhand values
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
        //Unparse the css values
        var vals = ShorthandManager.unparseDeclarationList(declList);
        //Remove the properties that have not been changed and have the "initial" value
        vals = vals.replace(/.*:\sinitial;\n/g, '');
        //Format the css values to make them ready for jQuery (put them in "property": "value" form)
        vals = vals.replace(/(.*):\s(.*);\n/g, '"$1":"$2", ');
        //Remove the last comma
        vals = vals.replace(/,([^,]*)$/,'$1');
        //Create the jQuery temp div tag
        var $test = $('<div />');
        //Convert the css values to object form and apply them to the jQuery temp div tag
        $test.css(JSON.parse("{"+vals+"}"));
        //Get the shorthand background and format them for replacement in the editor
        vals = 'background: ' + $test.css('background') + ';';
        //Return the final shorthand background property
        return vals;
    };

    // Initialize
    var provider = new ProviderBG();
    ShorthandManager.registerShorthandProvider("background", provider);
});
