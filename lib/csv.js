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
    relax_column_count: true,
    raw: true,
    on_record: ({
      raw,
      record
    }, {
      error
    }) => {
      if (error) {
        return `ERROR ERROR ERROR ${raw}`;
      } else {
        return record;
      }
    }
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
    relax_column_count: true,
    raw: true,
    on_record: ({
      raw,
      record
    }, {
      error
    }) => {
      if (error) {
        return `ERROR ERROR ERROR ${raw}`;
      } else {
        return record;
      }
    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwYXJzZUNTViIsInN0ciIsIm9wdGlvbnMiLCJjc3ZQYXJzZVN5bmMiLCJjb2x1bW5zIiwicmVsYXhfcXVvdGVzIiwicmVsYXhfY29sdW1uX2NvdW50IiwicmF3Iiwib25fcmVjb3JkIiwicmVjb3JkIiwiZXJyb3IiLCJ0b0NTViIsInJlY29yZHMiLCJjc3ZTdHJpbmdpZnlTeW5jIiwiaGVhZGVyIiwicGFyc2VDU1ZTdHJlYW0iLCJjc3ZQYXJzZSIsInNlcmlhbGl6ZUNTVlN0cmVhbSIsImNzdlN0cmluZ2lmeSJdLCJzb3VyY2VzIjpbIi4uL3NyYy9jc3YudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKlxuICovXG5pbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0IHsgcGFyc2UgYXMgY3N2UGFyc2UsIE9wdGlvbnMgYXMgUGFyc2VPcHRzIH0gZnJvbSAnY3N2LXBhcnNlJztcbmltcG9ydCB7IHBhcnNlIGFzIGNzdlBhcnNlU3luYyB9IGZyb20gJ2Nzdi1wYXJzZS9zeW5jJztcblxuaW1wb3J0IHtcbiAgc3RyaW5naWZ5IGFzIGNzdlN0cmluZ2lmeSxcbiAgT3B0aW9ucyBhcyBTdHJpbmdpZnlPcHRzLFxufSBmcm9tICdjc3Ytc3RyaW5naWZ5JztcbmltcG9ydCB7IHN0cmluZ2lmeSBhcyBjc3ZTdHJpbmdpZnlTeW5jIH0gZnJvbSAnY3N2LXN0cmluZ2lmeS9zeW5jJztcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDU1Yoc3RyOiBzdHJpbmcsIG9wdGlvbnM/OiBQYXJzZU9wdHMpOiBPYmplY3RbXSB7XG4gIHJldHVybiBjc3ZQYXJzZVN5bmMoc3RyLCB7IC4uLm9wdGlvbnMsIGNvbHVtbnM6IHRydWUsIHJlbGF4X3F1b3RlczogdHJ1ZSwgcmVsYXhfY29sdW1uX2NvdW50OiB0cnVlLCByYXc6IHRydWUsIG9uX3JlY29yZDogKHtyYXcsIHJlY29yZH0sIHtlcnJvcn0pID0+IHtcbiAgICBpZihlcnJvcil7XG4gICAgICByZXR1cm4gYEVSUk9SIEVSUk9SIEVSUk9SICR7cmF3fWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZWNvcmQ7XG4gICAgfVxuICB9IH0pO1xufVxuXG4vKipcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0NTVihyZWNvcmRzOiBPYmplY3RbXSwgb3B0aW9ucz86IFN0cmluZ2lmeU9wdHMpOiBzdHJpbmcge1xuICByZXR1cm4gY3N2U3RyaW5naWZ5U3luYyhyZWNvcmRzLCB7IC4uLm9wdGlvbnMsIGhlYWRlcjogdHJ1ZSB9KTtcbn1cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDU1ZTdHJlYW0ob3B0aW9ucz86IFBhcnNlT3B0cyk6IFRyYW5zZm9ybSB7XG4gIHJldHVybiBjc3ZQYXJzZSh7IC4uLm9wdGlvbnMsIGNvbHVtbnM6IHRydWUsIHJlbGF4X3F1b3RlczogdHJ1ZSwgcmVsYXhfY29sdW1uX2NvdW50OiB0cnVlLCByYXc6IHRydWUsIG9uX3JlY29yZDogKHtyYXcsIHJlY29yZH0sIHtlcnJvcn0pID0+IHtcbiAgICBpZihlcnJvcil7XG4gICAgICByZXR1cm4gYEVSUk9SIEVSUk9SIEVSUk9SICR7cmF3fWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZWNvcmQ7XG4gICAgfVxuICB9IH0pO1xufVxuXG4vKipcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVDU1ZTdHJlYW0ob3B0aW9ucz86IFN0cmluZ2lmeU9wdHMpOiBUcmFuc2Zvcm0ge1xuICByZXR1cm4gY3N2U3RyaW5naWZ5KHsgLi4ub3B0aW9ucywgaGVhZGVyOiB0cnVlIH0pO1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUE7O0FBQ0E7O0FBRUE7O0FBSUE7Ozs7OztBQUVBO0FBQ0E7QUFDQTtBQUNPLFNBQVNBLFFBQVQsQ0FBa0JDLEdBQWxCLEVBQStCQyxPQUEvQixFQUE4RDtFQUNuRSxPQUFPLElBQUFDLFdBQUEsRUFBYUYsR0FBYixrQ0FBdUJDLE9BQXZCO0lBQWdDRSxPQUFPLEVBQUUsSUFBekM7SUFBK0NDLFlBQVksRUFBRSxJQUE3RDtJQUFtRUMsa0JBQWtCLEVBQUUsSUFBdkY7SUFBNkZDLEdBQUcsRUFBRSxJQUFsRztJQUF3R0MsU0FBUyxFQUFFLENBQUM7TUFBQ0QsR0FBRDtNQUFNRTtJQUFOLENBQUQsRUFBZ0I7TUFBQ0M7SUFBRCxDQUFoQixLQUE0QjtNQUNwSixJQUFHQSxLQUFILEVBQVM7UUFDUCxPQUFRLHFCQUFvQkgsR0FBSSxFQUFoQztNQUNELENBRkQsTUFFTztRQUNMLE9BQU9FLE1BQVA7TUFDRDtJQUNGO0VBTk0sR0FBUDtBQU9EO0FBRUQ7QUFDQTtBQUNBOzs7QUFDTyxTQUFTRSxLQUFULENBQWVDLE9BQWYsRUFBa0NWLE9BQWxDLEVBQW1FO0VBQ3hFLE9BQU8sSUFBQVcsZ0JBQUEsRUFBaUJELE9BQWpCLGtDQUErQlYsT0FBL0I7SUFBd0NZLE1BQU0sRUFBRTtFQUFoRCxHQUFQO0FBQ0Q7QUFFRDtBQUNBO0FBQ0E7OztBQUNPLFNBQVNDLGNBQVQsQ0FBd0JiLE9BQXhCLEVBQXdEO0VBQzdELE9BQU8sSUFBQWMsZUFBQSxrQ0FBY2QsT0FBZDtJQUF1QkUsT0FBTyxFQUFFLElBQWhDO0lBQXNDQyxZQUFZLEVBQUUsSUFBcEQ7SUFBMERDLGtCQUFrQixFQUFFLElBQTlFO0lBQW9GQyxHQUFHLEVBQUUsSUFBekY7SUFBK0ZDLFNBQVMsRUFBRSxDQUFDO01BQUNELEdBQUQ7TUFBTUU7SUFBTixDQUFELEVBQWdCO01BQUNDO0lBQUQsQ0FBaEIsS0FBNEI7TUFDM0ksSUFBR0EsS0FBSCxFQUFTO1FBQ1AsT0FBUSxxQkFBb0JILEdBQUksRUFBaEM7TUFDRCxDQUZELE1BRU87UUFDTCxPQUFPRSxNQUFQO01BQ0Q7SUFDRjtFQU5NLEdBQVA7QUFPRDtBQUVEO0FBQ0E7QUFDQTs7O0FBQ08sU0FBU1Esa0JBQVQsQ0FBNEJmLE9BQTVCLEVBQWdFO0VBQ3JFLE9BQU8sSUFBQWdCLHVCQUFBLGtDQUFrQmhCLE9BQWxCO0lBQTJCWSxNQUFNLEVBQUU7RUFBbkMsR0FBUDtBQUNEIn0=