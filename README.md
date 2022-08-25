# ChiefMD - Chief Metadata Document
ChiefMD is a data storage language inspired by XML. ChiefMD files end in `.chfmd`.

## Syntax
Here's an example of a ChiefMD file:
```
{@wooly#CHIEFMD}
[%root%}
  [*Comment*]
  [%text%}Lorem Ipsum{%text%]
  [%attrNode% | attr:value empyAttr}{%attrNode%]
{%root%]
```
First off, every ChiefMD file starts with a header: `{@wooly#CHIEFMD}`. Then each node has a start (`[%name%}`) and end (`{%name%]`) tag (DISCLAIMER: THE NAMES 'name' and 'attributes' ARE NOT ALLOWED AS A NODE NAME. NODE NAMES MUST FOLLOW JAVASCRIPT VARIABLE NAMING RULES). The start tag can contain attributes (`[%attr% | lorem:ipsum,dolor:sit,amet`) with the attribute block starting with `|`. attributes are formatted as `attribute:value` (omit the value for the value to become `true`) and separated by commas. the content of the node is between the start and end of the nodes. anything between `[*` and `*]` is treated as a comment and ignored.

## Implementation in JavaScript
To use a ChiefMD file, you must first parse it. In JavaScript, this library contains 2 Classes: `ChiefMDOM` and `ChiefMDNode`. The `ChiefMDOM` class must be used to parse a ChiefMD File:
```JavaScript
var dom = ChiefMDOM.parse(/*Your ChiefMD File Here*/);
```
Or you can convert a `new ChiefMDOM()` to a string:
```JavaScript
var string = dom.toString(minified: Boolean || false, indentWithSpaces: Boolean || true, indentation: Number || 2);
```
The `minified` argument when set to `true` will completely ignore the other 2 properties and remove indentation and spaces. The `indentWithSpaces` argument indicates whether to indent with spaces or tabs. ignored if `minified` is set to `true`. The `indentation` parameter controls how much spaces to indent. ignored if `indentWithSpaces` is set to `false` or `minified` is set to `true`. You can display a ChiefMD file as a tree using this method:
```JavaScript
document.body.appendChild(ChiefMDOM.displayTree(dom));
```
The second class is `ChiefMDNode`. to create this class, you must first use `ChiefMDOM.createNode('node')`. The names `'attributes'` and `'name'` are not allowed as ChiefMDNode names and names must follow JavaScript variable naming rules.
```JavaScript
ChiefMDOM.createNode('foo'); // Is valid
ChiefMDOM.createNode('name'); // Will throw the following error: Uncaught DOMError: Illegal name "name".
```
You can set attributes using the `node.setAttribute()` function:
```JavaScript
node.setAttribute(attr: String, val: String || true);
``` 
To delete attributes, use the `node.removeAttribute('attr')` function. If you want to delete a node, use the `node.deleteNode('node')`. This will throw a `DOMError` if the node does not exist.

## License
This project is licensed under the "MIT License" (see [`LICENSE`](LICENSE) for the full license):
```
MIT License

Copyright (c) 2022 WoolyTheWool

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```