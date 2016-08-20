/**
 * Basic XML object that handles data connection to the DON node tree
 *
 * @class XmlObject
 * @param node DOM tree node
 */
class XmlObject {
  constructor(node) {
    if (!node || !node.nodeType) {
      throw new Error('The node "' + node + '" is not a valid DOM node');
    }
    this.Node = node;
  }

  /**
   * getChild - Gets a (usally the first) child by its tag name
   *
   * @param  {string} name The tag name of the child
   * @return {DOMNode}    DOM node representation of the child
   */
  getChild(name) {
    return this.Node.getElementsByTagName(name)[0];
  }

  /**
   * getChildren - Gets all children by its tag name
   *
   * @param  {string} name The tag name of the child
   * @return {DOMNodeList} DOM node list representation of the children
   */
  getChildren(name) {
    return this.Node.getElementsByTagName(name);
  }


  /**
   * childExists - Check if a child exists
   *
   * @param  {string} name The tag name of the child
   * @return {bool}      true if child exists, false otherwise
   */
  childExists(name) {
    return this.Node.getElementsByTagName(name)[0] !== undefined;
  }

  /**
   * getText - Get the string representation of a node's text content
   *
   * @param  {string} name The tag name of the child
   * @return {string}      string of the text content
   */
  getText(name) {
    let txt = '';
    if (this.childExists(name)) {
      const kids = this.getChildren(name);
      for (let i = 0; i < kids.length; i++) {
        txt += kids[i].textContent + '\n';
      }
    }
    return txt.trim();
  }

  /**
   * getTextArray - Get the strings of the given child tags as array instead of string
   *
   * @param  {string} name The tag name of the child
   * @return {Arrray}      string array of the text content
   */
  getTextArray(name) {
    const txt = [];
    if (this.childExists(name)) {
      const kids = this.getChildren(name);
      for (let i = 0; i < kids.length; i++) {
        txt.push(kids[i].textContent);
      }
    }
    return txt;
  }

  /**
   * getNum - Get the numeric representation of the node. Will return NaN if failed
   *
   * @param  {string} name The tag name of the child
   * @return {float}       Value of the node
   */
  getNum(name) {
    let res = NaN;
    if (this.childExists(name)) {
      const kids = this.getChildren(name);
      res = parseFloat(kids[0].textContent);
    }
    return res;
  }

  /**
   * getAttribute - Gets a string representation of an attribute
   *
   * @param  {string} name Attribute name
   * @return {string}      Attribute value
   */
  getAttribute(name) {
    return this.Node.getAttribute(name);
  }
}

export default XmlObject;
