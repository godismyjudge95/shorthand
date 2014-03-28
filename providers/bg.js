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
    var originalProps;


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
        //Get all the various background shorthand values
        originalProps = decl;
        var image = decl.val.match(/(url\(.*\))/); image = image ? image[1] : "";
        var position = decl.val.match(/\s*((?:\s*(?:left|right|top|bottom|center|\d+(?:\%|in|cm|mm|em|rem|ex|pt|pc|px))){1,4})/i); position = position ? position[1] : "";
        var size = decl.val.match(/\/\s*((?:\s*(?:left|right|top|bottom|center|\d+(?:\%|in|cm|mm|em|rem|ex|pt|pc|px))){1,2})/i); size = size ? size[1] : "";
        var repeat = decl.val.match(/\s*((?:\s*(?:repeat-x|repeat-y|repeat|space|round|no-repeat)){1,2})(?!\:)/i); repeat = repeat ? repeat[1] : "";
        var attachment = decl.val.match(/\s*((?:\s*(?:fixed|local|scroll)){1,2})/i); attachment = attachment ? attachment[1] : "";
        var origin = decl.val.match(/\s*(?:\s*(border-box|padding-box|content-box)){1}/i); origin = origin ? origin[1] : "";
        var clip = decl.val.match(/\s*(?:\s*(border-box|padding-box|content-box)){1,2}/i); clip = clip ? clip[1] : "";
        var color = decl.val.match(/\s*(rgba?\(.*\)|hsla?\(.*\)|\#[a-f0-9]{3}(?:[a-f0-9]{3})?|inherit|transparent|currentColor|aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen)/i); color = color ? color[1] : "";
        
        //Put all the shorthand values in an array
        var longhandVals = [];
        longhandVals.push(image, position, size, repeat, attachment, origin, clip, color);

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
        var shorthandVals = "", longhandVals = [];
        
        var i = 0, decl = "";
        declList.forEach(function(val) {
            decl += i === 2 ? "/ " : "";
            decl += val.val;
            decl += i < 7 ? " " : "";
            i++;
        });
        
        console.log(declList[2].val);
        
        var image = decl.match(/(url\(.*\))/); image = image ? image[1] : "";
        var position = decl.match(/\s*((?:\s*(?:left|right|top|bottom|center|\d+(?:\%|in|cm|mm|em|rem|ex|pt|pc|px))){1,4})/i); position = position ? position[1] : "";
        var size = decl.match(/\/\s*((?:\s*(?:left|right|top|bottom|center|\d+(?:\%|in|cm|mm|em|rem|ex|pt|pc|px))){1,2})/i); size = size ? size[1] : "";
        var repeat = decl.match(/\s*((?:\s*(?:repeat-x|repeat-y|repeat|space|round|no-repeat)){1,2})(?!\:)/i); repeat = repeat ? repeat[1] : "";
        var attachment = decl.match(/\s*((?:\s*(?:fixed|local|scroll)){1,2})/i); attachment = attachment ? attachment[1] : "";
        var origin = decl.match(/\s*(?:\s*(border-box|padding-box|content-box)){1}/i); origin = origin ? origin[1] : "";
        var clip = decl.match(/\s*(?:\s*(border-box|padding-box|content-box)){1,2}/i); clip = clip ? clip[1] : "";
        var color = decl.match(/\s*(rgba?\(.*\)|hsla?\(.*\)|\#[a-f0-9]{3}(?:[a-f0-9]{3})?|inherit|transparent|currentColor|aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen)/i); color = color ? color[1] : "";

        longhandVals = [image, position, size, repeat, attachment, origin, clip, color];
        
        i = 0;
        longhandVals.forEach(function (val) {
            shorthandVals += i === 2 && val !== "" ? " / " : "";
            shorthandVals += val;
            shorthandVals += i < 7 && longhandVals[i+1] !== "" ? " " : "";
            i++;
        });

        // Return shorthand declaration
        return { prop: this.propName, val: shorthandVals };
    };

    // Initialize
    var provider = new ProviderBG();
    ShorthandManager.registerShorthandProvider("background", provider);
});
