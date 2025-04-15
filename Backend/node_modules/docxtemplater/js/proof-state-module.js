"use strict";

var _require = require("./content-types.js"),
  settingsContentType = _require.settingsContentType;
module.exports = {
  name: "ProofStateModule",
  on: function on(eventName) {
    if (eventName === "attached") {
      this.attached = false;
    }
  },
  postparse: function postparse(postparsed, _ref) {
    var contentType = _ref.contentType;
    if (contentType !== settingsContentType) {
      return null;
    }
    return postparsed.map(function (part) {
      if (part.type === "tag" && part.tag === "w:proofState") {
        return {
          type: "content",
          value: ""
        };
      }
      return part;
    });
  }
};