class NodeStore {
  constructor() {
    this.store = {};
  }
  /**
   * @param {Node} node
   * @param {any} value
   */
  set(node, value) {
    node.__nodeIdentifier__ = Symbol();
    this.store[node.__nodeIdentifier__] = value;
  }
  /**
   * @param {Node} node
   * @return {any}
   */
  get(node) {
    return this.store[node.__nodeIdentifier__];
  }

  /**
   * @param {Node} node
   * @return {Boolean}
   */
  has(node) {
    return !!this.store[node.__nodeIdentifier__];
  }
}
