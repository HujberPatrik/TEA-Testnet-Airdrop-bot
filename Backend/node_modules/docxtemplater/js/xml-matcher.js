"use strict";

var _require = require("./doc-utils.js"),
  pregMatchAll = _require.pregMatchAll;
module.exports = function xmlMatcher(content, tagsXmlArray) {
  var res = {
    content: content
  };
  var taj = tagsXmlArray.join("|");
  var regexp = new RegExp("(?:(<(?:".concat(taj, ")[^>]*>)([^<>]*)</(?:").concat(taj, ")>)|(<(?:").concat(taj, ")[^>]*/>)"), "g");
  res.matches = pregMatchAll(regexp, res.content);
  return res;
};