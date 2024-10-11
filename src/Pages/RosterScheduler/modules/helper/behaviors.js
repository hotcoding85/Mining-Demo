"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNonWorkingTime = exports.getSummary = exports.getScrollSpecialDayjs = exports.getNonAgendaViewBodyCellBgColor = exports.getEventText = exports.getDateLabel = exports.getCustomDate = exports["default"] = void 0;
var _default2 = require("../config/default");
// getSummary func example
// export const getSummary = (schedulerData, headerEvents, slotId, slotName, headerStart, headerEnd) => ({ text: 'Summary', color: 'red', fontSize: '1.2rem' });
var getSummary = exports.getSummary = function getSummary() {
  return {
    text: 'Summary',
    color: 'red',
    fontSize: '1.2rem'
  };
};

// getCustomDate example
var getCustomDate = exports.getCustomDate = function getCustomDate(schedulerData, num) {
  var date = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : schedulerData.startDate;
  var viewType = schedulerData.viewType,
    localeDayjs = schedulerData.localeDayjs;
  var startDate;
  var endDate;
  var cellUnit;
  if (viewType === _default2.ViewType.Custom1) {
    var monday = localeDayjs(new Date(date)).startOf('week');
    startDate = num === 0 ? monday : localeDayjs(new Date(monday)).add(2 * num, 'weeks');
    endDate = localeDayjs(new Date(startDate)).add(1, 'weeks').endOf('week');
    cellUnit = _default2.CellUnit.Day;
  } else if (viewType === _default2.ViewType.Custom2) {
    var firstDayOfMonth = localeDayjs(new Date(date)).startOf('month');
    startDate = num === 0 ? firstDayOfMonth : localeDayjs(new Date(firstDayOfMonth)).add(2 * num, 'months');
    endDate = localeDayjs(new Date(startDate)).add(1, 'months').endOf('month');
    cellUnit = _default2.CellUnit.Day;
  } else {
    startDate = num === 0 ? date : localeDayjs(new Date(date)).add(2 * num, 'days');
    endDate = localeDayjs(new Date(startDate)).add(1, 'days');
    cellUnit = _default2.CellUnit.Hour;
  }
  return {
    startDate: startDate,
    endDate: endDate,
    cellUnit: cellUnit
  };
};

// getNonAgendaViewBodyCellBgColor example
var getNonAgendaViewBodyCellBgColor = exports.getNonAgendaViewBodyCellBgColor = function getNonAgendaViewBodyCellBgColor(schedulerData, slotId, header) {
  return header.nonWorkingTime ? undefined : '#87e8de';
};

// getDateLabel func example
var getDateLabel = exports.getDateLabel = function getDateLabel(schedulerData, viewType, startDate, endDate) {
  var localeDayjs = schedulerData.localeDayjs;
  var start = localeDayjs(new Date(startDate));
  var end = localeDayjs(endDate);
  var dateLabel = '';
  if (viewType === _default2.ViewType.Week || start !== end && (viewType === _default2.ViewType.Custom || viewType === _default2.ViewType.Custom1 || viewType === _default2.ViewType.Custom2)) {
    dateLabel = "".concat(start.format('MMM D'), "-").concat(end.format('D, YYYY'));
    if (start.month() !== end.month()) dateLabel = "".concat(start.format('MMM D'), "-").concat(end.format('MMM D, YYYY'));
    if (start.year() !== end.year()) dateLabel = "".concat(start.format('MMM D, YYYY'), "-").concat(end.format('MMM D, YYYY'));
  } else if (viewType === _default2.ViewType.Month) {
    dateLabel = start.format('MMMM YYYY');
  } else if (viewType === _default2.ViewType.Quarter) {
    dateLabel = "".concat(start.format('MMM D'), "-").concat(end.format('MMM D, YYYY'));
  } else if (viewType === _default2.ViewType.Year) {
    dateLabel = start.format('YYYY');
  } else {
    dateLabel = start.format('MMM D, YYYY');
  }
  return dateLabel;
};
var getEventText = exports.getEventText = function getEventText(schedulerData, event) {
  var _schedulerData$resour;
  return schedulerData.isEventPerspective ? ((_schedulerData$resour = schedulerData.resources.find(function (item) {
    return item.id === event.resourceId;
  })) === null || _schedulerData$resour === void 0 ? void 0 : _schedulerData$resour.name) || event.title : event.title;
};
var getScrollSpecialDayjs = exports.getScrollSpecialDayjs = function getScrollSpecialDayjs(schedulerData) {
  var localeDayjs = schedulerData.localeDayjs;
  return localeDayjs(new Date());
};
var isNonWorkingTime = exports.isNonWorkingTime = function isNonWorkingTime(schedulerData, time) {
  var localeDayjs = schedulerData.localeDayjs,
    cellUnit = schedulerData.cellUnit;
  if (cellUnit === _default2.CellUnit.Hour) {
    var hour = localeDayjs(new Date(time)).hour();
    return hour < 9 || hour > 18;
  }
  var dayOfWeek = localeDayjs(new Date(time)).weekday();
  return dayOfWeek === 0 || dayOfWeek === 6;
};
var _default = exports["default"] = {
  getSummaryFunc: undefined,
  getCustomDateFunc: undefined,
  getNonAgendaViewBodyCellBgColorFunc: undefined,
  getScrollSpecialDayjsFunc: getScrollSpecialDayjs,
  getDateLabelFunc: getDateLabel,
  getEventTextFunc: getEventText,
  isNonWorkingTimeFunc: isNonWorkingTime
};