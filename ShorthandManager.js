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
    
    var lessParser = new less.Parser();


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
            if (declList[i].name === propName) {
                return declList[i];
            }
        }
        return null;
    }

    /**
     * Convert CSS DeclarationList from text to  Object format
     * @param {string} declListText
     * @return promise that resolves to {LESS AST}
     */
    function parseDeclarationList(declListText) {
        var result = new $.Deferred();

        lessParser.parse(declListText, function onParse(err, tree) {
            if (err) {
                result.reject(err);
            } else {
                result.resolve(tree);
            }
        });

        return result.promise();
    }

    /**
     * Convert CSS DeclarationList from Object format to text
     * @param {Array<{prop:{string}, values.values:{Array<{string}}}>} declList
     * @return {string}
     */
    function unparseDeclarationList(declList) {
        var i, text = "";
        declList.forEach(function (decl) {
            var def = decl.value.value[0].value;
            //If the values are still in object form, then go deeper, otherwise set them to def
            var val = def === Object(def) ? decl.value.value[0].value[0].value : def;
            text += decl.name + ": " + val + ";\n";
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
    exports.collapseValues          = collapseValues;
    exports.findPropInDecList           = findPropInDecList;
    exports.parseDeclarationList        = parseDeclarationList;
    exports.unparseDeclarationList      = unparseDeclarationList;
    exports.wsvToArray                  = wsvToArray;
});
