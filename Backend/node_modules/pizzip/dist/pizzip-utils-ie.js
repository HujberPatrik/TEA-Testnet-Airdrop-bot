/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./es6/index_IE.js":
/*!*************************!*\
  !*** ./es6/index_IE.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("/* global IEBinaryToArray_ByteStr, IEBinaryToArray_ByteStr_Last */\n\n\n// Adapted from http://stackoverflow.com/questions/1095102/how-do-i-load-binary-image-data-using-javascript-and-xmlhttprequest\nvar IEBinaryToArray_ByteStr_Script = \"<!-- IEBinaryToArray_ByteStr -->\\r\\n\" + \"<script type='text/vbscript'>\\r\\n\" + \"Function IEBinaryToArray_ByteStr(Binary)\\r\\n\" + \"   IEBinaryToArray_ByteStr = CStr(Binary)\\r\\n\" + \"End Function\\r\\n\" + \"Function IEBinaryToArray_ByteStr_Last(Binary)\\r\\n\" + \"   Dim lastIndex\\r\\n\" + \"   lastIndex = LenB(Binary)\\r\\n\" + \"   if lastIndex mod 2 Then\\r\\n\" + \"       IEBinaryToArray_ByteStr_Last = Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\\r\\n\" + \"   Else\\r\\n\" + \"       IEBinaryToArray_ByteStr_Last = \" + '\"\"' + \"\\r\\n\" + \"   End If\\r\\n\" + \"End Function\\r\\n\" + \"</script>\\r\\n\";\n\n// inject VBScript\ndocument.write(IEBinaryToArray_ByteStr_Script);\n__webpack_require__.g.PizZipUtils._getBinaryFromXHR = function (xhr) {\n  var binary = xhr.responseBody;\n  var byteMapping = {};\n  for (var i = 0; i < 256; i++) {\n    for (var j = 0; j < 256; j++) {\n      byteMapping[String.fromCharCode(i + (j << 8))] = String.fromCharCode(i) + String.fromCharCode(j);\n    }\n  }\n  var rawBytes = IEBinaryToArray_ByteStr(binary);\n  var lastChr = IEBinaryToArray_ByteStr_Last(binary);\n  return rawBytes.replace(/[\\s\\S]/g, function (match) {\n    return byteMapping[match];\n  }) + lastChr;\n};\n\n//# sourceURL=webpack:///./es6/index_IE.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./es6/index_IE.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;