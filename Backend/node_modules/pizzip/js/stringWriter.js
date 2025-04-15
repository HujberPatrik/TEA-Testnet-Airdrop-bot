"use strict";

var utils = require("./utils.js");

/**
 * An object to write any content to a string.
 * @constructor
 */
function StringWriter() {
  this.data = [];
}
StringWriter.prototype = {
  /**
   * Append any content to the current string.
   * @param {Object} input the content to add.
   */
  append: function append(input) {
    input = utils.transformTo("string", input);
    this.data.push(input);
  },
  /**
   * Finalize the construction an return the result.
   * @return {string} the generated string.
   */
  finalize: function finalize() {
    return this.data.join("");
  }
};
module.exports = StringWriter;