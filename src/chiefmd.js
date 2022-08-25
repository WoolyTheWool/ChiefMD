class ChiefMDOM {
  constructor() {
    var root = new ChiefMDNode('root');
    this.appendChild(root);
  }
  toString(minified = false, indentWithSpaces = true, indentation = 2) {
    var str = '{@wooly#CHIEFMD}';
    if (!minified) {
      str += '\n[%root%}\n';
    } else {
      str += '[%root%}';
    }
    var indentLevel = 1;
    (function levelIterate(obj) {
      for (var n in Object.keys(obj)) {
        if (Object.keys(obj)[n] != 'attributes' && Object.keys(obj)[n] != 'innerText') {
          var name = Object.keys(obj)[n];
          var s = 0;
          if (!minified) {
            if (indentWithSpaces) {
              while (s < indentation * indentLevel) {
                str += ' ';
                s++;
              }
            } else {
              while (s < indentLevel) {
                str += '\t';
                s++;
              }
            }
          }
          var attributes = obj[name].attributes;
          if (!minified) {
            if (Object.keys(attributes).length != 0) {
              var attr = ' | ';
              for (var a in Object.keys(attributes)) {
                if (attributes[Object.keys(attributes)[a]] == true) {
                  attr += Object.keys(attributes)[a] + ',';
                } else {
                  attr += Object.keys(attributes)[a] + ':' + Object.values(attributes)[a] + ',';
                }
              }
              attr = attr.slice(0, attr.length - 1);
              str += '[%' + name + '%' + attr + '}';
            } else {
              str += '[%' + name + '%' + '}';
            }
          } else {
            if (Object.keys(attributes).length != 0) {
              var attr = '|';
              for (var a in Object.keys(attributes)) {
                if (attributes[Object.keys(attributes)[a]] == true) {
                  attr += Object.keys(attributes)[a] + ',';
                } else {
                  attr += Object.keys(attributes)[a] + ':' + Object.values(attributes)[a] + ',';
                }
              }
              attr = attr.slice(0, attr.length - 1);
              str += '[%' + name + '%' + attr + '}';
            } else {
              str += '[%' + name + '%' + '}';
            }
          }
          if (Object.keys(Object.values(obj)[n]).join(',') != 'attributes,innerText') {
            console.log(true);
            indentLevel++;
            if (!minified) {
              str += '\n';
            }
            levelIterate(Object.values(obj)[n]);
            indentLevel--;
            str += '{%' + name + '%' + ']';
          } else {
            str += Object.values(obj)[n].innerText + '{%' + name + '%' + ']';
            if (!minified) {
              str += '\n';
            }
          }
        }
      }
    })(this.root);
    str += '{%root%]';
    return str;
  }
  appendChild(node) {
    if (typeof node != 'object') {
      throw new TypeError('Expected ChiefMDNode, got ' + typeof node + ' instead.');
    }
    if (node.constructor.name != 'ChiefMDNode') {
      throw new TypeError('Expected ChiefMDNode, got ' + node.constructor.name + ' instead.');
    }
    var name = node.name;
    delete node.name;
    this[name] = node;
  }
  static createNode(name) {
    try {
      new Function('var ' + name);
    } catch {
      throw new TypeError('Illegal name "' + name + '".');
    }
    if (name == 'attributes' || name == 'name' || name == 'innerText') {
      throw new DOMError('Illegal name "' + name + '".');
    }
    return new ChiefMDNode(name);
  }
  static parse(str) {
    if (typeof str != 'string') {
      throw new TypeError('Expected string, got ' + typeof str + ' instead.');
    }
    var cleanedStr = str.replace(/\n^ */gm, '').replace(/\[\*(.+)\*\]/g, '');
    console.log(cleanedStr);
    var tokens = cleanedStr.split(/(\[|{|}|\])/);
    for (var t in tokens) {
      if (tokens[t] == '') {
        tokens.splice(t, 1);
      }
    }
    var elems = [];
    for (var t in tokens) {
      if (/({|\[)/.test(tokens[t])) {
        elems.push(tokens[t] + tokens[parseInt(t) + 1] + tokens[parseInt(t) + 2]);
      } else if (tokens[t] == '}' && tokens[parseInt(t) + 1] != '[') {
        elems.push(tokens[parseInt(t) + 1]);
      }
    }
    var treeLevel = 0;
    var treeLevelList = [];
    for (var e in elems)  {
      if (/\[(.+)}/.test(elems[e])) {
        treeLevel++;
      } else if (/{%(.+)%]/.test(elems[e])) {
        treeLevel--;
      }
      treeLevelList.push(treeLevel);
    }
    for (var l in treeLevelList) {
      if (/{%(.+)%]/.test(elems[l])) {
        elems[l] = {elem: elems[l], treeLevel: treeLevelList[l - 1] - 1 || 0};
      } else {
        elems[l] = {elem: elems[l], treeLevel: treeLevelList[l - 1] || 0};
      }
    }
    var chiefMDHeader = elems[0].elem;
    if (!(/{@wooly#CHIEFMD}/i.test(chiefMDHeader))) {
      throw new SyntaxError('Missing or invalid Header');
    }
    elems.splice(0, 1);
    var parentLevel = 0;
    var lastTreeLevel = 0;
    for (var e in elems) {
      if (elems[e].treeLevel > lastTreeLevel) {
        parentLevel++;
      } else if (elems[e].treeLevel < lastTreeLevel) {
        parentLevel--;
      }
      var prevElems = elems.slice(0, e);
      var parent = null;
      prevElems.forEach((e) => {
        if (e.treeLevel + 1 == parentLevel) {
          parent = e;
        }
      });
      elems[e].parent = parent;
      lastTreeLevel = elems[e].treeLevel;
    }
    elems.forEach((e) => {
      e.location = [];
      var p = e.parent;
      while (p != null) {
        e.location.push(p.elem.match(/%\S+%/)[0].slice(1, -1));
        p = p.parent;
      }
      e.location = e.location.reverse().join('.');
    });
    var index = (obj,i) => obj[i];
    var dom = new ChiefMDOM();
    elems.forEach((e) => {
      if (/\[(.+)}/.test(e.elem)) {
        var el = ChiefMDOM.createNode(e.elem.match(/%\S+%/)[0].slice(1, -1));
        var attr = e.elem.match(/\|(.+)}/);
        if (attr != null) {
          attr = attr[1].trim().split(',');
          for (var a in attr) {
            attr[a] = attr[a].split(':')
            el.setAttribute(attr[a][0], attr[a][1] || true);
          }
        }
        if (e.treeLevel != 0) {
          e.location.split('.').reduce(index, dom).appendChild(el);
        }
      } else if (!(/{(.+)]/.test(e.elem))) {
        e.location.split('.').reduce(index, dom).innerText = e.elem;
      }
    });
    return dom;
  }
  static displayTree(dom) {
    if (typeof dom != 'object') {
      throw new TypeError('Expected ChiefMDOM, got ' + typeof node + ' instead.');
    }
    if (dom.constructor.name != 'ChiefMDOM') {
      throw new TypeError('Expected ChiefMDOM, got ' + node.constructor.name + ' instead.');
    }
    var root = document.createElement('div');
    root.className = 'chiefmd-tree-container';
    var stylesheet = document.createElement('style');
    stylesheet.textContent = `
      div.chiefmd-tree {
        width: 100%;
        font-family: monospace;
        padding-left:  0.75em;
        --chiefmd-collapse-button: #E4E6E7;
        --chiefmd-text: #0B0D13;
        --chiefmd-tag: #5500BD;
        --chiefmd-tagname: #0008E6;
        --chiefmd-attributes: #D68800;
        --chiefmd-attribute-name: #802000;
        --chiefmd-attribute-value: #009DBD;
      }
      div.chiefmd-tree * {
        box-sizing: border-box;
        line-height: 1.5;
      }
      div.chiefmd-tree span.chiefmd-header {
        width: 100%;
        display: block;
        margin-left: -0.75em;
      }
      div.chiefmd-tree div.chiefmd-node {
        display: block;
      }
      div.chiefmd-tree span.collapse-button {
        border-radius: 0;
        border: 1px solid var(--chiefmd-text);
        color: var(--chiefmd-text);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        float: left;
        width: 1em;
        height: 1em;
        font-size: 0.75em;
        overflow: hidden;
        text-align: center;
        vertical-align: middle;
        cursor: pointer;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        -ms-user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
        user-select: none;
        margin-left: -1em;
        background-color: var(--chiefmd-collapse-button);
      }
      div.chiefmd-tree span.chiefmd-tag {
        color: var(--chiefmd-tag);
        position: relative;
      }
      div.chiefmd-tree span.chiefmd-tag span.chiefmd-tagname {
        color: var(--chiefmd-tagname);
      }
      div.chiefmd-tree span.chiefmd-tag span.chiefmd-attributes {
        color: var(--chiefmd-attributes);
      }
      div.chiefmd-tree span.chiefmd-tag span.chiefmd-attribute-name {
        color: var(--chiefmd-attribute-name);
      }
      div.chiefmd-tree span.chiefmd-tag span.chiefmd-attribute-value {
        color: var(--chiefmd-attribute-value);
      }
      div.chiefmd-tree div.node-content:not(.text) {
        margin-left: 16px;
      }
      div.chiefmd-tree div.node-content.text {
        display: inline;
        color: var(--chiefmd-text);
      }
      div.chiefmd-tree .hidden {
        display: none;
      }
    `;
    root.appendChild(stylesheet);
    var viewedRootNode = document.createElement('div');
    viewedRootNode.className = 'chiefmd-tree';
    var headerTag = document.createElement('span');
    headerTag.className = 'chiefmd-tag';
    headerTag.classList.add('chiefmd-header');
    headerTag.innerText = '{@wooly#CHIEFMD}';
    viewedRootNode.appendChild(headerTag);
    var tagStart = document.createElement('span');
    tagStart.className = 'chiefmd-tag';
    tagStart.innerHTML = '[<span class="chiefmd-tagname">%root%</span>}';
    viewedRootNode.appendChild(tagStart);
    var collapseBtn = document.createElement('span');
    collapseBtn.className = 'collapse-button';
    collapseBtn.innerText = '−';
    collapseBtn.addEventListener('click', () => {
      viewedRootNode.querySelector('.node-content').classList.toggle('hidden');
      if (collapseBtn.innerText != '−') {
        collapseBtn.innerText = '−';
      } else {
        collapseBtn.innerText = '+';
      }
    });
    tagStart.prepend(collapseBtn);
    var rootNodeContent = document.createElement('div');
    rootNodeContent.className = 'node-content';
    viewedRootNode.appendChild(rootNodeContent);
    (function displayNode(node, parent) {
      for (var n in Object.keys(node)) {
        if (Object.keys(node)[n] != 'attributes' && Object.keys(node)[n] != 'innerText') {
          var viewedNode = document.createElement('div');
          viewedNode.className = 'chiefmd-node';
          var tagStart = document.createElement('span');
          tagStart.className = 'chiefmd-tag';
          if (Object.keys(node[Object.keys(node)[n]].attributes).length != 0) {
            var attrStr = ' | ';
            for (var a in Object.keys(node[Object.keys(node)[n]].attributes)) {
              attrStr += '<span class="chiefmd-attribute-name">' + Object.keys(node[Object.keys(node)[n]].attributes)[a] + '</span>:<span class="chiefmd-attribute-value">' + Object.values(node[Object.keys(node)[n]].attributes)[a] + '</span>,';
            }
            attrStr = attrStr.slice(0, attrStr.length - 1);
            tagStart.innerHTML = '[<span class="chiefmd-tagname">%' + Object.keys(node)[n] + '%</span><span class="chiefmd-attributes">' + attrStr + '</span>}';
          } else {
            tagStart.innerHTML = '[<span class="chiefmd-tagname">%' + Object.keys(node)[n] + '%</span>}';
          }
          viewedNode.appendChild(tagStart);
          var nodeContent = document.createElement('div');
          nodeContent.className = 'node-content';
          if (Object.keys(node[Object.keys(node)[n]]).join(',') != 'attributes,innerText') {
            var collapseBtn = document.createElement('span');
            collapseBtn.className = 'collapse-button';
            collapseBtn.innerText = '−';
            collapseBtn.addEventListener('click', () => {
              viewedNode.querySelector('.node-content').classList.toggle('hidden');
              if (collapseBtn.innerText != '−') {
                collapseBtn.innerText = '−';
              } else {
                collapseBtn.innerText = '+';
              }
            });
            tagStart.prepend(collapseBtn);
            displayNode(node[Object.keys(node)[n]], nodeContent);
          } else {
            nodeContent.classList.add('text');
            nodeContent.innerText += node[Object.keys(node)[n]].innerText;
          }
          viewedNode.appendChild(nodeContent);
          var tagEnd = document.createElement('span');
          tagEnd.className = 'chiefmd-tag';
          tagEnd.innerHTML = '{<span class="chiefmd-tagname">%' + Object.keys(node)[n] + '%</span>]';
          viewedNode.appendChild(tagEnd);
          if (parent == undefined) {
            rootNodeContent.appendChild(viewedNode);
          } else {
            parent.appendChild(viewedNode);
          }
        }
      }
    })(dom.root);
    var tagEnd = document.createElement('span');
    tagEnd.className = 'chiefmd-tag';
    tagEnd.innerHTML = '{<span class="chiefmd-tagname">%root%</span>]';
    viewedRootNode.appendChild(tagEnd);
    root.appendChild(viewedRootNode);
    return root;
  }
}
class ChiefMDNode {
  constructor(name) {
    if (typeof name != 'string') {
      throw new TypeError('Expected String, got ' + typeof attr + ' instead.');
    }
    try {
      new Function('var ' + name);
    } catch {
      throw new TypeError('Illegal name "' + name + '".');
    }
    if (name == 'attributes' || name == 'name' || name == 'innerText') {
      throw new DOMError('Illegal name "' + name + '".');
    }
    this.name = name;
    this.attributes = {};
    this.innerText = '';
  }
  setAttribute(attr, val = true) {
    if (typeof attr != 'string') {
      throw new TypeError('Expected String, got ' + typeof attr + ' instead.');
    }
    try {
      new Function('var ' + attr);
    } catch {
      throw new TypeError('Illegal name "' + attr + '".');
    }
    if (typeof val != 'string' && val != true) {
      throw new TypeError('Expected String, got ' + typeof val + ' instead.');
    }
    this.attributes[attr] = val;
  }
  removeAttribute(attr) {
    if (this.attributes[attr] == undefined) {
      throw new DOMError('Attribute "' + attr + '" does not exist.');
    }
    delete this.attributes[attr];
  }
  deleteNode(node) {
    if (this[node] == undefined) {
      throw new DOMError('Node "' + node + '" does not exist.');
    }
    delete this[node];
  }
  appendChild(node) {
    if (typeof node != 'object') {
      throw new TypeError('Expected ChiefMDNode, got ' + typeof node + ' instead.');
    }
    if (node.constructor.name != 'ChiefMDNode') {
      throw new TypeError('Expected ChiefMDNode, got ' + node.constructor.name + ' instead.');
    }
    var name = node.name;
    delete node.name;
    this[name] = node;
  }
}
class DOMError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DOMError';
  }
}