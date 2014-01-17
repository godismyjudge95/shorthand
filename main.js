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
    
    // Brackets modules
    var CSSUtils                = brackets.getModule("language/CSSUtils"),
        DocumentManager         = brackets.getModule("document/DocumentManager"),
        EditorManager           = brackets.getModule("editor/EditorManager"),
        JSUtils                 = brackets.getModule("language/JSUtils"),
        ProjectManager          = brackets.getModule("project/ProjectManager");

    var InlineShorthandEditor   = require("InlineShorthandEditor").InlineShorthandEditor;

    /**
     * @private
     * For unit and performance tests. Allows lookup by function name instead of editor offset .
     *
     * @param {!Editor} hostEditor
     * @param {!string} shorthandPropertyName
     * @return {$.Promise} a promise that will be resolved with an InlineWidget
     *      or null if we're not going to provide anything.
     */
    function _createInlineEditor(hostEditor, startBookmark, endBookmark, text) {

        var result = new $.Deferred(),
            shorthandInlineEditor = new InlineShorthandEditor(text);
        
        shorthandInlineEditor.load(hostEditor, startBookmark, endBookmark);

        result.resolve(shorthandInlineEditor);

        return result.promise();
    }
    
    /**
     * Match a css shorthand property from a line of css.
     *
     * @param {string} str  Input string.
     * @return {!RegExpMatch}
     */
    function shorthandMatch(str) {
        // FORNOW - match "margin" shorthand declaration. This should be done in convert.js
        return str.match(/(margin)\s*:([A-Za-z0-9\s\-]+);/);
    }
    
    /**
     * This function is registered with EditorManager as an inline editor provider.
     * It creates an inline editor when the cursor is on a CSS shorthand property
     * name or value.
     *
     * @param {!Editor} editor
     * @param {!{line:Number, ch:Number}} pos
     * @return {$.Promise} a promise that will be resolved with an InlineWidget
     *      or null if we're not going to provide anything.
     */
    function cssShorthandPropertyProvider(hostEditor, pos) {
        var cursorLine, sel, startPos, endPos, startBookmark, endBookmark, currentMatch,
            cm = hostEditor._codeMirror;

        // Only provide a shorthand editor when cursor is in css content
        if (hostEditor.getModeForSelection() !== "css") {
            return null;
        }
        
        // Pos must be in a CSS property or value
        var cssInfo = CSSUtils.getInfoAtPos(hostEditor, pos);
        if (cssInfo.context !== "prop.name" && cssInfo.context !== "prop.value" &&
                cssInfo.name !== "") {
            return null;
        }

        cursorLine = hostEditor.document.getLine(pos.line);
        
        currentMatch = shorthandMatch(cursorLine);
        if (!currentMatch) {
            return null;
        }
        
        // check for subsequent matches, and use first match after pos
        var lineOffset = 0;
        while (pos.ch > (currentMatch.index + currentMatch[0].length + lineOffset)) {
            var restOfLine = cursorLine.substring(currentMatch.index + currentMatch[0].length + lineOffset),
                newMatch = shorthandMatch(restOfLine);

            if (newMatch) {
                lineOffset += (currentMatch.index + currentMatch[0].length);
                currentMatch = $.extend(true, [], newMatch);
            } else {
                break;
            }
        }

        currentMatch.lineOffset = lineOffset;

        startPos = {line: pos.line, ch: lineOffset + currentMatch.index};
        endPos   = {line: pos.line, ch: lineOffset + currentMatch.index + currentMatch[0].length};
        
        startBookmark = cm.setBookmark(startPos);
        endBookmark   = cm.setBookmark(endPos);
        
        // Adjust selection to the match so that the inline editor won't
        // get dismissed while we're updating the timing function.
        hostEditor.setSelection(startPos, endPos);

        return _createInlineEditor(hostEditor, startBookmark, endBookmark, currentMatch[0]);
    }

    // init
    EditorManager.registerInlineEditProvider(cssShorthandPropertyProvider);
    
    // for unit tests only
    exports.cssShorthandPropertyProvider = cssShorthandPropertyProvider;
});
