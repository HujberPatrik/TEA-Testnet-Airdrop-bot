"use strict";

var repeat = require("./string-repeat.js");
module.exports = function printy(parsed) {
  var indent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var indentWasNegative = false;
  var result = parsed.reduce(function (output, p) {
    var splitted = p.value.split(/(?:\n|\r|\t)(?: |\r|\t)*/g);
    var value = splitted.join("");
    if (value === "") {
      return output;
    }
    if (p.type === "tag" && p.position === "end") {
      indent--;
    }
    if (indent < 0) {
      indentWasNegative = true;
    }
    var i = indent < 0 ? "(".concat(indent, ")") : "(".concat(indent, ")") + repeat("   ", indent);
    if (p.subparsed) {
      indent++;
      var stars = i.replace(/./g, "*");
      output += "\n".concat(stars, "START LOOP OF ").concat(value);
      output += printy(p.subparsed, indent);
      output += "\n".concat(stars, "END LOOP OF ").concat(value);
      indent--;
    } else if (p.type === "placeholder") {
      output += "\n".concat(i.replace(/./g, "="), "{").concat(value, "}");
    } else {
      output += "\n".concat(i).concat(value);
    }
    if (p.type === "tag" && p.position === "start") {
      indent++;
    }
    return output;
  }, "").split("\n").map(function (line) {
    return line.replace(/[\s\uFEFF\xA0]+$/g, "");
  }).join("\n");
  if (indentWasNegative) {
    var err = new Error("Indent negative");
    err.properties = {
      result: result
    };
    throw err;
  }
  return result;
};