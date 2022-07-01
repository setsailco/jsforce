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
    columns: true
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
    columns: true
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwYXJzZUNTViIsInN0ciIsIm9wdGlvbnMiLCJjc3ZQYXJzZVN5bmMiLCJjb2x1bW5zIiwidG9DU1YiLCJyZWNvcmRzIiwiY3N2U3RyaW5naWZ5U3luYyIsImhlYWRlciIsInBhcnNlQ1NWU3RyZWFtIiwiY3N2UGFyc2UiLCJzZXJpYWxpemVDU1ZTdHJlYW0iLCJjc3ZTdHJpbmdpZnkiXSwic291cmNlcyI6WyIuLi9zcmMvY3N2LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICpcbiAqL1xuaW1wb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnc3RyZWFtJztcbmltcG9ydCB7IHBhcnNlIGFzIGNzdlBhcnNlLCBPcHRpb25zIGFzIFBhcnNlT3B0cyB9IGZyb20gJ2Nzdi1wYXJzZSc7XG5pbXBvcnQgeyBwYXJzZSBhcyBjc3ZQYXJzZVN5bmMgfSBmcm9tICdjc3YtcGFyc2Uvc3luYyc7XG5cbmltcG9ydCB7XG4gIHN0cmluZ2lmeSBhcyBjc3ZTdHJpbmdpZnksXG4gIE9wdGlvbnMgYXMgU3RyaW5naWZ5T3B0cyxcbn0gZnJvbSAnY3N2LXN0cmluZ2lmeSc7XG5pbXBvcnQgeyBzdHJpbmdpZnkgYXMgY3N2U3RyaW5naWZ5U3luYyB9IGZyb20gJ2Nzdi1zdHJpbmdpZnkvc3luYyc7XG5cbi8qKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ1NWKHN0cjogc3RyaW5nLCBvcHRpb25zPzogUGFyc2VPcHRzKTogT2JqZWN0W10ge1xuICByZXR1cm4gY3N2UGFyc2VTeW5jKHN0ciwgeyAuLi5vcHRpb25zLCBjb2x1bW5zOiB0cnVlIH0pO1xufVxuXG4vKipcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0NTVihyZWNvcmRzOiBPYmplY3RbXSwgb3B0aW9ucz86IFN0cmluZ2lmeU9wdHMpOiBzdHJpbmcge1xuICByZXR1cm4gY3N2U3RyaW5naWZ5U3luYyhyZWNvcmRzLCB7IC4uLm9wdGlvbnMsIGhlYWRlcjogdHJ1ZSB9KTtcbn1cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDU1ZTdHJlYW0ob3B0aW9ucz86IFBhcnNlT3B0cyk6IFRyYW5zZm9ybSB7XG4gIHJldHVybiBjc3ZQYXJzZSh7IC4uLm9wdGlvbnMsIGNvbHVtbnM6IHRydWUgfSk7XG59XG5cbi8qKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZUNTVlN0cmVhbShvcHRpb25zPzogU3RyaW5naWZ5T3B0cyk6IFRyYW5zZm9ybSB7XG4gIHJldHVybiBjc3ZTdHJpbmdpZnkoeyAuLi5vcHRpb25zLCBoZWFkZXI6IHRydWUgfSk7XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJQTs7QUFDQTs7QUFFQTs7QUFJQTs7Ozs7O0FBRUE7QUFDQTtBQUNBO0FBQ08sU0FBU0EsUUFBVCxDQUFrQkMsR0FBbEIsRUFBK0JDLE9BQS9CLEVBQThEO0VBQ25FLE9BQU8sSUFBQUMsV0FBQSxFQUFhRixHQUFiLGtDQUF1QkMsT0FBdkI7SUFBZ0NFLE9BQU8sRUFBRTtFQUF6QyxHQUFQO0FBQ0Q7QUFFRDtBQUNBO0FBQ0E7OztBQUNPLFNBQVNDLEtBQVQsQ0FBZUMsT0FBZixFQUFrQ0osT0FBbEMsRUFBbUU7RUFDeEUsT0FBTyxJQUFBSyxnQkFBQSxFQUFpQkQsT0FBakIsa0NBQStCSixPQUEvQjtJQUF3Q00sTUFBTSxFQUFFO0VBQWhELEdBQVA7QUFDRDtBQUVEO0FBQ0E7QUFDQTs7O0FBQ08sU0FBU0MsY0FBVCxDQUF3QlAsT0FBeEIsRUFBd0Q7RUFDN0QsT0FBTyxJQUFBUSxlQUFBLGtDQUFjUixPQUFkO0lBQXVCRSxPQUFPLEVBQUU7RUFBaEMsR0FBUDtBQUNEO0FBRUQ7QUFDQTtBQUNBOzs7QUFDTyxTQUFTTyxrQkFBVCxDQUE0QlQsT0FBNUIsRUFBZ0U7RUFDckUsT0FBTyxJQUFBVSx1QkFBQSxrQ0FBa0JWLE9BQWxCO0lBQTJCTSxNQUFNLEVBQUU7RUFBbkMsR0FBUDtBQUNEIn0=