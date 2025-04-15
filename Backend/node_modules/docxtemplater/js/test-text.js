"use strict";

var TxtTemplater = require("../text.js");
var doc = new TxtTemplater("Hello {user}, how are you ?");
var result = doc.render({
  user: "John"
});
if (result !== "Hello John, how are you ?") {
  // eslint-disable-next-line no-console
  console.log(result);
  throw new Error("TxtTemplater did not work as expected");
}