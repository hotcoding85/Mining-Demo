"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
exports.getPos = getPos;
function getPos(element) {
  var x = 0;
  var y = 0;
  var currentElement = element;
  while (currentElement) {
    x += currentElement.offsetLeft - currentElement.scrollLeft;
    y += currentElement.offsetTop - currentElement.scrollTop;
    currentElement = currentElement.offsetParent;
  }
  return {
    x: x,
    y: y
  };
}
var _default = exports["default"] = getPos;