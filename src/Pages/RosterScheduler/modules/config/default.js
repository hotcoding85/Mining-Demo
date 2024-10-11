"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ViewType = exports.SummaryPos = exports.DnDTypes = exports.DATE_FORMAT = exports.DATETIME_FORMAT = exports.CellUnit = void 0;
var DATE_FORMAT = exports.DATE_FORMAT = 'YYYY-MM-DD';
var DATETIME_FORMAT = exports.DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
var ViewType = exports.ViewType = {
  Day: 0,
  Week: 1,
  Month: 2,
  Quarter: 3,
  Year: 4,
  Custom: 5,
  Custom1: 6,
  Custom2: 7
};
var CellUnit = exports.CellUnit = {
  Day: 0,
  Hour: 1,
  Week: 2,
  Month: 3,
  Year: 4
};
var SummaryPos = exports.SummaryPos = {
  Top: 0,
  TopRight: 1,
  TopLeft: 2,
  Bottom: 3,
  BottomRight: 4,
  BottomLeft: 5
};
var DnDTypes = exports.DnDTypes = {
  EVENT: 'event'
};