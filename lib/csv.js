"use strict";

var _Object$keys = require("@babel/runtime-corejs3/core-js-stable/object/keys");

var _Object$getOwnPropertySymbols = require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-symbols");

var _filterInstanceProperty = require("@babel/runtime-corejs3/core-js-stable/instance/filter");

var _Object$getOwnPropertyDescriptor = require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-descriptor");

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js-stable/instance/for-each");

var _Object$getOwnPropertyDescriptors = require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-descriptors");

var _Object$defineProperties = require("@babel/runtime-corejs3/core-js-stable/object/define-properties");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.parseCSV = parseCSV;
exports.parseCSVStream = parseCSVStream;
exports.serializeCSVStream = serializeCSVStream;
exports.toCSV = toCSV;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _csvParse = require("csv-parse");

var _sync = require("csv-parse/sync");

var _csvStringify = require("csv-stringify");

var _sync2 = require("csv-stringify/sync");

function ownKeys(object, enumerableOnly) { var keys = _Object$keys(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context, _context2; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context = ownKeys(Object(source), !0)).call(_context, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context2 = ownKeys(Object(source))).call(_context2, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * @private
 */
function parseCSV(str, options) {
  return (0, _sync.parse)(str, _objectSpread(_objectSpread({}, options), {}, {
    columns: true,
    relax_quotes: true,
    relax_column_count: true
  }));
}
/**
 * @private
 */


function toCSV(records, options) {
  return (0, _sync2.stringify)(records, _objectSpread(_objectSpread({}, options), {}, {
    header: true
  }));
}
/**
 * @private
 */


function parseCSVStream(options) {
  return (0, _csvParse.parse)(_objectSpread(_objectSpread({}, options), {}, {
    columns: true,
    relax_quotes: true,
    relax_column_count: true
  }));
}
/**
 * @private
 */


function serializeCSVStream(options) {
  return (0, _csvStringify.stringify)(_objectSpread(_objectSpread({}, options), {}, {
    header: true
  }));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwYXJzZUNTViIsInN0ciIsIm9wdGlvbnMiLCJjc3ZQYXJzZVN5bmMiLCJjb2x1bW5zIiwicmVsYXhfcXVvdGVzIiwicmVsYXhfY29sdW1uX2NvdW50IiwidG9DU1YiLCJyZWNvcmRzIiwiY3N2U3RyaW5naWZ5U3luYyIsImhlYWRlciIsInBhcnNlQ1NWU3RyZWFtIiwiY3N2UGFyc2UiLCJzZXJpYWxpemVDU1ZTdHJlYW0iLCJjc3ZTdHJpbmdpZnkiXSwic291cmNlcyI6WyIuLi9zcmMvY3N2LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICpcbiAqL1xuaW1wb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnc3RyZWFtJztcbmltcG9ydCB7IHBhcnNlIGFzIGNzdlBhcnNlLCBPcHRpb25zIGFzIFBhcnNlT3B0cyB9IGZyb20gJ2Nzdi1wYXJzZSc7XG5pbXBvcnQgeyBwYXJzZSBhcyBjc3ZQYXJzZVN5bmMgfSBmcm9tICdjc3YtcGFyc2Uvc3luYyc7XG5cbmltcG9ydCB7XG4gIHN0cmluZ2lmeSBhcyBjc3ZTdHJpbmdpZnksXG4gIE9wdGlvbnMgYXMgU3RyaW5naWZ5T3B0cyxcbn0gZnJvbSAnY3N2LXN0cmluZ2lmeSc7XG5pbXBvcnQgeyBzdHJpbmdpZnkgYXMgY3N2U3RyaW5naWZ5U3luYyB9IGZyb20gJ2Nzdi1zdHJpbmdpZnkvc3luYyc7XG5cbi8qKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ1NWKHN0cjogc3RyaW5nLCBvcHRpb25zPzogUGFyc2VPcHRzKTogT2JqZWN0W10ge1xuICByZXR1cm4gY3N2UGFyc2VTeW5jKHN0ciwgeyAuLi5vcHRpb25zLCBjb2x1bW5zOiB0cnVlLCByZWxheF9xdW90ZXM6IHRydWUsIHJlbGF4X2NvbHVtbl9jb3VudDogdHJ1ZSB9KTtcbn1cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9DU1YocmVjb3JkczogT2JqZWN0W10sIG9wdGlvbnM/OiBTdHJpbmdpZnlPcHRzKTogc3RyaW5nIHtcbiAgcmV0dXJuIGNzdlN0cmluZ2lmeVN5bmMocmVjb3JkcywgeyAuLi5vcHRpb25zLCBoZWFkZXI6IHRydWUgfSk7XG59XG5cbi8qKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ1NWU3RyZWFtKG9wdGlvbnM/OiBQYXJzZU9wdHMpOiBUcmFuc2Zvcm0ge1xuICByZXR1cm4gY3N2UGFyc2UoeyAuLi5vcHRpb25zLCBjb2x1bW5zOiB0cnVlLCByZWxheF9xdW90ZXM6IHRydWUsIHJlbGF4X2NvbHVtbl9jb3VudDogdHJ1ZSB9KTtcbn1cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplQ1NWU3RyZWFtKG9wdGlvbnM/OiBTdHJpbmdpZnlPcHRzKTogVHJhbnNmb3JtIHtcbiAgcmV0dXJuIGNzdlN0cmluZ2lmeSh7IC4uLm9wdGlvbnMsIGhlYWRlcjogdHJ1ZSB9KTtcbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUlBOztBQUNBOztBQUVBOztBQUlBOzs7Ozs7QUFFQTtBQUNBO0FBQ0E7QUFDTyxTQUFTQSxRQUFULENBQWtCQyxHQUFsQixFQUErQkMsT0FBL0IsRUFBOEQ7RUFDbkUsT0FBTyxJQUFBQyxXQUFBLEVBQWFGLEdBQWIsa0NBQXVCQyxPQUF2QjtJQUFnQ0UsT0FBTyxFQUFFLElBQXpDO0lBQStDQyxZQUFZLEVBQUUsSUFBN0Q7SUFBbUVDLGtCQUFrQixFQUFFO0VBQXZGLEdBQVA7QUFDRDtBQUVEO0FBQ0E7QUFDQTs7O0FBQ08sU0FBU0MsS0FBVCxDQUFlQyxPQUFmLEVBQWtDTixPQUFsQyxFQUFtRTtFQUN4RSxPQUFPLElBQUFPLGdCQUFBLEVBQWlCRCxPQUFqQixrQ0FBK0JOLE9BQS9CO0lBQXdDUSxNQUFNLEVBQUU7RUFBaEQsR0FBUDtBQUNEO0FBRUQ7QUFDQTtBQUNBOzs7QUFDTyxTQUFTQyxjQUFULENBQXdCVCxPQUF4QixFQUF3RDtFQUM3RCxPQUFPLElBQUFVLGVBQUEsa0NBQWNWLE9BQWQ7SUFBdUJFLE9BQU8sRUFBRSxJQUFoQztJQUFzQ0MsWUFBWSxFQUFFLElBQXBEO0lBQTBEQyxrQkFBa0IsRUFBRTtFQUE5RSxHQUFQO0FBQ0Q7QUFFRDtBQUNBO0FBQ0E7OztBQUNPLFNBQVNPLGtCQUFULENBQTRCWCxPQUE1QixFQUFnRTtFQUNyRSxPQUFPLElBQUFZLHVCQUFBLGtDQUFrQlosT0FBbEI7SUFBMkJRLE1BQU0sRUFBRTtFQUFuQyxHQUFQO0FBQ0QifQ==