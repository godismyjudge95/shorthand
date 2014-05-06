# CSS Short Hand editor

A Brackets extension for expanding shorthand css rules in the Quick Edit (CTRL + E).  
This extension is in a very initial state, every support is appreciated.

## Example

If you select a rule like the one below and press CTRL + E

    margin: 1px 2px 3px 4px;
    

A Quick Edit panel will be opened, with the same rule expanded in the singular specific properties:

    margin-top: 1px;
    margin-right: 2px;
    margin-bottom: 3px;
    margin-left: 4px;
   
Here you will be able to edit the values of the properties and when you will close the Quick Edit, the rules will be condensed back to the short hand.

## Supported Attributes

-margin
-padding
-background


## Contribute
Please feel free to contribute to this project! Besides editing the main code you can also help by adding more shorthand providers. Here is a quick tutorial: [How to Create a Shorthand Provider]( https://github.com/LeinardoSmith/shorthand/wiki/How-to-Create-a-Shorthand-Provider)
