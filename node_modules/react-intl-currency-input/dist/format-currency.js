"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = formatCurrency;

var _big = require("big.js");

var _big2 = _interopRequireDefault(_big);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function formatCurrency(value, localeConfig, currencyName) {
  var numberConfig = localeConfig.formats.number[currencyName];
  var formatter = new global.Intl.NumberFormat(localeConfig.locale, numberConfig);

  return formatter.format((0, _big2.default)(value));
}