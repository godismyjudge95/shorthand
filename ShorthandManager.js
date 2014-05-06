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
/*global define, brackets, $, less */

define(function (require, exports, module) {
    "use strict";
    
    /**
     * Map of registered shorthand providers by css shorthand property name.
     * See {@link #registerShorthandProvider()}.
     * @type {Object.<{Object>}
     */
    var shorthandProvidersMap = {};

    function registerShorthandProvider(shorthandPropertyName, provider) {
        shorthandProvidersMap[shorthandPropertyName] = provider;
    }

    function getProviderForProperty(shorthandPropertyName) {
        return shorthandProvidersMap[shorthandPropertyName];
    }

    /**
     * @param {Array<{string}>} vals Array with 1 - 4 values
     * @return {Array<{string}>} vals Array with 4 values
     */
    function expandTRBLValues(vals) {
        return [
            vals[0],
            vals[1] || vals[0],
            vals[2] || vals[0],
            vals[3] || vals[1] || vals[0]
        ];
    }

    /**
     * @param {Array<{string}>} vals Array with 4 values
     * @return {Array<{string}>} vals Array with 1 - 4 values
     */
    function collapseTRBLValues(vals) {
        var ret = [vals[0]];
        if (vals[0] === vals[2] && vals[1] === vals[3]) {
            if (vals[0] !== vals[1]) {
                ret.push(vals[1]);
            }
        } else {
            ret.push(vals[1]);
            ret.push(vals[2]);
            ret.push(vals[3]);
        }
        return ret;
    }

    /**
     * @param {string} propName
     * @param {Array<{prop:{string}, values.values:{Array<{string}}}>} declList
     */
    function findPropInDecList(propName, declList) {
        var i;
        for (i = 0; i < declList.length; i++) {
            if (declList[i].prop === propName) {
                return declList[i];
            }
        }
        return null;
    }

    /**
     * Convert CSS Declaration from text to  Object format
     * @param {string} declText
     * @return {prop: {string}, val: {string}}
     */
    function parseDeclarationList(declText) {
        var declList = [],
            regex = /([a-zA-Z\-]+):\s*([^;]*);/,
            match = declText.match(regex);

        while (match && match.length === 3) {
            declList.push({ prop: match[1], val: match[2] });

            declText = declText.substring(match.index + match[0].length);
            match = declText.match(regex);
        }
        
        return declList;
    }

    /**
     * Convert CSS DeclarationList from Object format to text
     * @param {Array<{prop:{string}, val:{string}}>} declList
     * @return {string}
     */
    function unparseDeclarationList(declList) {
        var i, text = "";
        declList.forEach(function (decl) {
            text += decl.prop + ": " + decl.val + ";\n";
        });

        return text;
    }
    
    /**
     * Helper function to convert whitespace separated values to an array
     * @param {string} str
     * @return Array<{string}>
     */
    function wsvToArray(str) {
        // Split on whitespace
        var arr = str.split(/\s/);

        // leading, trailing, and multiple whitespace creates empty elements,
        // so remove them.
        var filtered = arr.filter(function (element) {
            return (element !== "");
        });

        return filtered;
    }

    // public API
    exports.registerShorthandProvider   = registerShorthandProvider;
    exports.getProviderForProperty      = getProviderForProperty;

    // Utility functions
    exports.expandTRBLValues            = expandTRBLValues;
    exports.collapseTRBLValues          = collapseTRBLValues;
    exports.findPropInDecList           = findPropInDecList;
    exports.parseDeclarationList        = parseDeclarationList;
    exports.unparseDeclarationList      = unparseDeclarationList;
    exports.wsvToArray                  = wsvToArray;
});
