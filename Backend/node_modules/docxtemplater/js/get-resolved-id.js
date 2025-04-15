"use strict";

function getResolvedId(part, options) {
  if (part.lIndex == null) {
    return null;
  }
  var path = options.scopeManager.scopePathItem;
  if (part.parentPart) {
    path = path.slice(0, path.length - 1);
  }
  var res = options.filePath + "@" + part.lIndex.toString() + "-" + path.join("-");
  return res;
}
module.exports = getResolvedId;