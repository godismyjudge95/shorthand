// Class that expand and condense CSS rules

// Our input / condensed CSS rules
var border4 = 'border: 1px solid white;';
var padding4 = 'padding:1px 2px 3px 4px;';
var margin4 = 'margin : 1px 2px 3px 4px;';
var notvalid = 'color: red;';

var border = "\npadding-top: 1px;\npadding-right: 2px;\npadding-bottom: 3px;\npadding-left: 4px;\n";

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
    expand: function (rule) {
        // Where the rule-specific properties will be stored
        var properties = [];   
        // Where the expanded code will be placed
        var expanded = '';
        // Assign to property the property name and strip starting and ending whitespaces
        var property = rule.split(":")[0].replace(/(^\s+|\s+$|;)/g, '');
        // Assign to values the values of the CSS rule and strip starting and ending whitespaces
        var values = rule.split(":")[1].replace(/(^\s+|\s+$|;)/g, '').split(" ");

        switch (property) {

            // Margin/Padding rule spotted, expand it:
            case 'margin':
            case 'padding':

                // List of the single-properties variations
                properties = ["top", "right", "bottom", "left"];

                // Our expanded CSS rule
                values.forEach(function (value, index) {
                    expanded += property + '-' + properties[index] + ': ' + value + ";\n";
                });
                
            case 'border':
                
                // List of the single-properties variations
                properties = ["width", "color", "style"];
                var values_style = ['none','hidden','dotted','dashed','solid','double','groove','ridge','inset','outset','inherit'];
                
                values.forEach(function (value) {
                    
                    // width property
                    if(value.indexOf("px") !== -1 || value === 0) {
                        expanded += property + '-' + properties[0] + ': ' + value + ";\n";
                    }
                    // style property
                    if(inArray(value, values_style)) {
                        expanded += property + '-' + properties[2] + ': ' + value + ";\n";
                    }
                    // color property
                    if( (value.indexOf("px") === -1 && value !== 0) && (!inArray(value, values_style)) ) {
                        expanded += property + '-' + properties[1] + ': ' + value + ";\n";
                    }
                });
                                
                break;            

                // Not a valid property, return false
            default:
                expanded = false;
                break;

        }

        return expanded;
    },
    condense: function (rules) {

        // Clean input
        rules = rules.replace(/(^\s+|\s+$|;|^[\s\n]+|[\s\n]+$)/g, '');

        // Get array of rules        
        rules = rules.split("\n");

        console.log(rules);
        // Get array of values
        var values = [];
        //rules.forEach(function(rule)) {
        //    values.push( rule.split(":")[1] );
        //}

        values.forEach(function (value, index) {
            expanded += property + '-' + properties[index] + ': ' + value + ";\n";
        });


        return values;

    }

}

// Border test
$("pre").append(rule.expand(border4));
$("pre").append("\n---------------------------");

// 
