/*

#Class that expand and condense CSS declarations

## Partial expand support for: 
- margin (-top, -right, -bottom, -left)
- padding (-top, -right, -bottom, -left)
- border-*-width  (top, right, bottom, left)
- border (style, color, width)

N.B: complete set of values are needed to expand them correctly.
 
Expected input: complete CSS rule (property + colon + values + (optional)semicolon)
Expected output: array with as key the property and as value the property value

## Condense support for: all (not tested)

Expected input: set of CSS declarations written with proper format and order, separated by linebreaks
Expected output: array with as key the property and as value the property values
 
*/

// InArray needed function
function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

// Define the converter class
var rule = {
    
    syntax: {
        border: {
            properties: ['width', 'style', 'color'],
            values: {
                style: ['none','hidden','dotted','dashed','solid','double','groove','ridge','inset','outset','inherit']
            }   
        },
        topleftbottomright: {
            properties: ['top', 'left', 'bottom', 'right']
        }
    
    },
    
    expand: function (rule) {
        // Where the rule-specific properties will be stored
        var properties = {};   
        // Where the expanded code will be placed
        var expanded = {};
        // Assign to property the property name and strip starting and ending whitespaces
        var property = rule.split(":")[0].replace(/(^\s+|\s+$|;)/g, '');
        // Property suffix
        var propSuffix = '';
        // Assign to values the values of the CSS rule and strip starting and ending whitespaces
        var values = rule.split(":")[1].replace(/(^\s+|\s+$|;)/g, '').split(" ");
        
        switch (property) {

            // Margin/Padding rule spotted, expand it:
            case 'border-width':
                property = 'border';
                propSuffix = '-width';
            case 'margin':
            case 'padding':
                

                // List of the single-properties variations
                properties = this.syntax.topleftbottomright.properties;

                // Our expanded CSS rule
                values.forEach(function (value, index) {
                    // put new property + value in array
                    expanded[property + '-' + properties[index] + propSuffix] = value ;
                });
                break;
                
            case 'border':
                
                // List of the single-properties variations
                properties = this.syntax.border.properties;
                var values_style = this.syntax.border.values.style;
                
                values.forEach(function (value) {
                    
                    // width property
                    if(value.indexOf("px") !== -1 || value === 0) { var index = 0; }
                    // style property
                    if(inArray(value, values_style)) { var index = 1; }
                    // color property
                    if( (value.indexOf("px") === -1 && value !== 0) && (!inArray(value, values_style)) ) { var index = 2; }
                    // put new property + value in array
                    expanded[property + '-' + properties[index]] = value;
                });
                             
                break;
                
            case 'border-color':
                

                // Not a valid property, return false
            default:
                expanded = false;
                break;

        }

        return expanded;
    },
    condense: function (declarations) {

        // Clean input
        declarations = declarations.replace(/(^\s+|\s+$|;|^[\s\n]+|[\s\n]+$)/g, '');

        // Get array of declarations        
        declarations = declarations.split("\n");

        // Get array of values
        var values = '';
        declarations.forEach(function(declaration) {
            values += declaration.split(":")[1].replace(/(^\s+|\s+$)/, "") + ' ';
        })
        
        var result = {};
        return result[declarations[0].split(":")[0].split("-")[0]] = values.substr(0, values.length -1);
  
    }

}


// Our input / condensed CSS declarations
var border = 'border: 1px solid white;';
var border_width = 'border-width: 4px 4px 4px 4px;';
var padding = 'padding:1px 2px 3px 4px;';
var margin = 'margin : 1px 2px 3px 4px;';
var border_ex = 'border-width: 1px;\nborder-style: solid;\nborder-color: white';
var margin_ex = 'margin-top: 1px;\nmargin-right : 0px;\nmargin-bottom: inerith;\nmargin-left: 10px;';
var notvalid = 'color: red;';


// Border expand test
$("pre").append("border to expanded:\n\n");
$("pre").append(JSON.stringify(rule.expand(border)));

// Border expand test
$("pre").append("\n\nborder-width to expanded:\n\n");
$("pre").append(JSON.stringify(rule.expand(border_width)));

// Margin expand test
$("pre").append("\n\npadding to expanded:\n\n");
$("pre").append(JSON.stringify(rule.expand(padding)));

// Border condense test
$("pre").append("\n\nborder to condensed:\n\n");
$("pre").append(JSON.stringify(rule.condense(border_ex)));

// Margin condense test
$("pre").append("\n\nmargin to condensed:\n\n");
$("pre").append(JSON.stringify(rule.condense(margin_ex)));
