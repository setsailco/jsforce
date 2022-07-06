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

exports.default = exports.RecordReference = void 0;

require("core-js/modules/es.promise.js");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = _Object$keys(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context, _context2; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context = ownKeys(Object(source), !0)).call(_context, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context2 = ownKeys(Object(source))).call(_context2, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 *
 */

/**
 * Remote reference to record information
 */
class RecordReference {
  /**
   *
   */
  constructor(conn, type, id) {
    (0, _defineProperty2.default)(this, "type", void 0);
    (0, _defineProperty2.default)(this, "id", void 0);
    (0, _defineProperty2.default)(this, "_conn", void 0);
    (0, _defineProperty2.default)(this, "delete", this.destroy);
    (0, _defineProperty2.default)(this, "del", this.destroy);
    this._conn = conn;
    this.type = type;
    this.id = id;
  }
  /**
   * Retrieve record field information
   */


  async retrieve(options) {
    const rec = await this._conn.retrieve(this.type, this.id, options);
    return rec;
  }
  /**
   * Update record field information
   */


  async update(record, options) {
    const record_ = _objectSpread(_objectSpread({}, record), {}, {
      Id: this.id
    });

    return this._conn.update(this.type, record_, options);
  }
  /**
   * Delete record field
   */


  destroy(options) {
    return this._conn.destroy(this.type, this.id, options);
  }
  /**
   * Synonym of Record#destroy()
   */


  /**
   * Get blob field as stream
   *
   * @param {String} fieldName - Blob field name
   * @returns {stream.Stream}
   */
  blob(fieldName) {
    const url = [this._conn._baseUrl(), 'sobjects', this.type, this.id, fieldName].join('/');
    return this._conn.request(url).stream();
  }

}

exports.RecordReference = RecordReference;
var _default = RecordReference;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWNvcmRSZWZlcmVuY2UiLCJjb25zdHJ1Y3RvciIsImNvbm4iLCJ0eXBlIiwiaWQiLCJkZXN0cm95IiwiX2Nvbm4iLCJyZXRyaWV2ZSIsIm9wdGlvbnMiLCJyZWMiLCJ1cGRhdGUiLCJyZWNvcmQiLCJyZWNvcmRfIiwiSWQiLCJibG9iIiwiZmllbGROYW1lIiwidXJsIiwiX2Jhc2VVcmwiLCJqb2luIiwicmVxdWVzdCIsInN0cmVhbSJdLCJzb3VyY2VzIjpbIi4uL3NyYy9yZWNvcmQtcmVmZXJlbmNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICpcbiAqL1xuaW1wb3J0IENvbm5lY3Rpb24gZnJvbSAnLi9jb25uZWN0aW9uJztcbmltcG9ydCB7XG4gIFJldHJpZXZlT3B0aW9ucyxcbiAgRG1sT3B0aW9ucyxcbiAgU2NoZW1hLFxuICBTT2JqZWN0TmFtZXMsXG4gIFNPYmplY3RJbnB1dFJlY29yZCxcbiAgU09iamVjdFVwZGF0ZVJlY29yZCxcbn0gZnJvbSAnLi90eXBlcyc7XG5cbi8qKlxuICogUmVtb3RlIHJlZmVyZW5jZSB0byByZWNvcmQgaW5mb3JtYXRpb25cbiAqL1xuZXhwb3J0IGNsYXNzIFJlY29yZFJlZmVyZW5jZTxcbiAgUyBleHRlbmRzIFNjaGVtYSxcbiAgTiBleHRlbmRzIFNPYmplY3ROYW1lczxTPixcbiAgSW5wdXRSZWNvcmQgZXh0ZW5kcyBTT2JqZWN0SW5wdXRSZWNvcmQ8UywgTj4gPSBTT2JqZWN0SW5wdXRSZWNvcmQ8UywgTj4sXG4gIFJldHJpZXZlUmVjb3JkIGV4dGVuZHMgU09iamVjdFVwZGF0ZVJlY29yZDxTLCBOPiA9IFNPYmplY3RVcGRhdGVSZWNvcmQ8UywgTj5cbj4ge1xuICB0eXBlOiBOO1xuICBpZDogc3RyaW5nO1xuICBfY29ubjogQ29ubmVjdGlvbjxTPjtcblxuICAvKipcbiAgICpcbiAgICovXG4gIGNvbnN0cnVjdG9yKGNvbm46IENvbm5lY3Rpb248Uz4sIHR5cGU6IE4sIGlkOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9jb25uID0gY29ubjtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSByZWNvcmQgZmllbGQgaW5mb3JtYXRpb25cbiAgICovXG4gIGFzeW5jIHJldHJpZXZlKG9wdGlvbnM/OiBSZXRyaWV2ZU9wdGlvbnMpIHtcbiAgICBjb25zdCByZWMgPSBhd2FpdCB0aGlzLl9jb25uLnJldHJpZXZlKHRoaXMudHlwZSwgdGhpcy5pZCwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIHJlYyBhcyBSZXRyaWV2ZVJlY29yZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgcmVjb3JkIGZpZWxkIGluZm9ybWF0aW9uXG4gICAqL1xuICBhc3luYyB1cGRhdGUocmVjb3JkOiBJbnB1dFJlY29yZCwgb3B0aW9ucz86IERtbE9wdGlvbnMpIHtcbiAgICBjb25zdCByZWNvcmRfID0geyAuLi5yZWNvcmQsIElkOiB0aGlzLmlkIH07XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm4udXBkYXRlKHRoaXMudHlwZSwgcmVjb3JkXywgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlIHJlY29yZCBmaWVsZFxuICAgKi9cbiAgZGVzdHJveShvcHRpb25zPzogRG1sT3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLl9jb25uLmRlc3Ryb3kodGhpcy50eXBlLCB0aGlzLmlkLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTeW5vbnltIG9mIFJlY29yZCNkZXN0cm95KClcbiAgICovXG4gIGRlbGV0ZSA9IHRoaXMuZGVzdHJveTtcblxuICAvKipcbiAgICogU3lub255bSBvZiBSZWNvcmQjZGVzdHJveSgpXG4gICAqL1xuICBkZWwgPSB0aGlzLmRlc3Ryb3k7XG5cbiAgLyoqXG4gICAqIEdldCBibG9iIGZpZWxkIGFzIHN0cmVhbVxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZmllbGROYW1lIC0gQmxvYiBmaWVsZCBuYW1lXG4gICAqIEByZXR1cm5zIHtzdHJlYW0uU3RyZWFtfVxuICAgKi9cbiAgYmxvYihmaWVsZE5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHVybCA9IFtcbiAgICAgIHRoaXMuX2Nvbm4uX2Jhc2VVcmwoKSxcbiAgICAgICdzb2JqZWN0cycsXG4gICAgICB0aGlzLnR5cGUsXG4gICAgICB0aGlzLmlkLFxuICAgICAgZmllbGROYW1lLFxuICAgIF0uam9pbignLycpO1xuICAgIHJldHVybiB0aGlzLl9jb25uLnJlcXVlc3QodXJsKS5zdHJlYW0oKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBSZWNvcmRSZWZlcmVuY2U7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7O0FBV0E7QUFDQTtBQUNBO0FBQ08sTUFBTUEsZUFBTixDQUtMO0VBS0E7QUFDRjtBQUNBO0VBQ0VDLFdBQVcsQ0FBQ0MsSUFBRCxFQUFzQkMsSUFBdEIsRUFBK0JDLEVBQS9CLEVBQTJDO0lBQUE7SUFBQTtJQUFBO0lBQUEsOENBZ0M3QyxLQUFLQyxPQWhDd0M7SUFBQSwyQ0FxQ2hELEtBQUtBLE9BckMyQztJQUNwRCxLQUFLQyxLQUFMLEdBQWFKLElBQWI7SUFDQSxLQUFLQyxJQUFMLEdBQVlBLElBQVo7SUFDQSxLQUFLQyxFQUFMLEdBQVVBLEVBQVY7RUFDRDtFQUVEO0FBQ0Y7QUFDQTs7O0VBQ2dCLE1BQVJHLFFBQVEsQ0FBQ0MsT0FBRCxFQUE0QjtJQUN4QyxNQUFNQyxHQUFHLEdBQUcsTUFBTSxLQUFLSCxLQUFMLENBQVdDLFFBQVgsQ0FBb0IsS0FBS0osSUFBekIsRUFBK0IsS0FBS0MsRUFBcEMsRUFBd0NJLE9BQXhDLENBQWxCO0lBQ0EsT0FBT0MsR0FBUDtFQUNEO0VBRUQ7QUFDRjtBQUNBOzs7RUFDYyxNQUFOQyxNQUFNLENBQUNDLE1BQUQsRUFBc0JILE9BQXRCLEVBQTRDO0lBQ3RELE1BQU1JLE9BQU8sbUNBQVFELE1BQVI7TUFBZ0JFLEVBQUUsRUFBRSxLQUFLVDtJQUF6QixFQUFiOztJQUNBLE9BQU8sS0FBS0UsS0FBTCxDQUFXSSxNQUFYLENBQWtCLEtBQUtQLElBQXZCLEVBQTZCUyxPQUE3QixFQUFzQ0osT0FBdEMsQ0FBUDtFQUNEO0VBRUQ7QUFDRjtBQUNBOzs7RUFDRUgsT0FBTyxDQUFDRyxPQUFELEVBQXVCO0lBQzVCLE9BQU8sS0FBS0YsS0FBTCxDQUFXRCxPQUFYLENBQW1CLEtBQUtGLElBQXhCLEVBQThCLEtBQUtDLEVBQW5DLEVBQXVDSSxPQUF2QyxDQUFQO0VBQ0Q7RUFFRDtBQUNGO0FBQ0E7OztFQVFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFTSxJQUFJLENBQUNDLFNBQUQsRUFBb0I7SUFDdEIsTUFBTUMsR0FBRyxHQUFHLENBQ1YsS0FBS1YsS0FBTCxDQUFXVyxRQUFYLEVBRFUsRUFFVixVQUZVLEVBR1YsS0FBS2QsSUFISyxFQUlWLEtBQUtDLEVBSkssRUFLVlcsU0FMVSxFQU1WRyxJQU5VLENBTUwsR0FOSyxDQUFaO0lBT0EsT0FBTyxLQUFLWixLQUFMLENBQVdhLE9BQVgsQ0FBbUJILEdBQW5CLEVBQXdCSSxNQUF4QixFQUFQO0VBQ0Q7O0FBOUREOzs7ZUFpRWFwQixlIn0=