"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = exports.Apex = void 0;

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/json/stringify"));

require("core-js/modules/es.regexp.exec.js");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _jsforce = require("../jsforce");

/**
 * @file Manages Salesforce Apex REST endpoint calls
 * @author Shinichi Tomita <shinichi.tomita@gmail.com>
 */

/**
 * API class for Apex REST endpoint call
 */
class Apex {
  /**
   *
   */
  constructor(conn) {
    (0, _defineProperty2.default)(this, "_conn", void 0);
    (0, _defineProperty2.default)(this, "del", this.delete);
    this._conn = conn;
  }
  /* @private */


  _baseUrl() {
    return `${this._conn.instanceUrl}/services/apexrest`;
  }
  /**
   * @private
   */


  _createRequestParams(method, path, body, options = {}) {
    const headers = typeof options.headers === 'object' ? options.headers : {};

    if (!/^(GET|DELETE)$/i.test(method)) {
      headers['content-type'] = 'application/json';
    }

    const params = {
      method,
      url: this._baseUrl() + path,
      headers
    };

    if (body) {
      params.body = (0, _stringify.default)(body);
    }

    return params;
  }
  /**
   * Call Apex REST service in GET request
   */


  get(path, options) {
    return this._conn.request(this._createRequestParams('GET', path, undefined, options));
  }
  /**
   * Call Apex REST service in POST request
   */


  post(path, body, options) {
    const params = this._createRequestParams('POST', path, body, options);

    return this._conn.request(params);
  }
  /**
   * Call Apex REST service in PUT request
   */


  put(path, body, options) {
    const params = this._createRequestParams('PUT', path, body, options);

    return this._conn.request(params);
  }
  /**
   * Call Apex REST service in PATCH request
   */


  patch(path, body, options) {
    const params = this._createRequestParams('PATCH', path, body, options);

    return this._conn.request(params);
  }
  /**
   * Call Apex REST service in DELETE request
   */


  delete(path, options) {
    return this._conn.request(this._createRequestParams('DELETE', path, undefined, options));
  }
  /**
   * Synonym of Apex#delete()
   */


}
/*--------------------------------------------*/

/*
 * Register hook in connection instantiation for dynamically adding this API module features
 */


exports.Apex = Apex;
(0, _jsforce.registerModule)('apex', conn => new Apex(conn));
var _default = Apex;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBcGV4IiwiY29uc3RydWN0b3IiLCJjb25uIiwiZGVsZXRlIiwiX2Nvbm4iLCJfYmFzZVVybCIsImluc3RhbmNlVXJsIiwiX2NyZWF0ZVJlcXVlc3RQYXJhbXMiLCJtZXRob2QiLCJwYXRoIiwiYm9keSIsIm9wdGlvbnMiLCJoZWFkZXJzIiwidGVzdCIsInBhcmFtcyIsInVybCIsImdldCIsInJlcXVlc3QiLCJ1bmRlZmluZWQiLCJwb3N0IiwicHV0IiwicGF0Y2giLCJyZWdpc3Rlck1vZHVsZSJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGkvYXBleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIE1hbmFnZXMgU2FsZXNmb3JjZSBBcGV4IFJFU1QgZW5kcG9pbnQgY2FsbHNcbiAqIEBhdXRob3IgU2hpbmljaGkgVG9taXRhIDxzaGluaWNoaS50b21pdGFAZ21haWwuY29tPlxuICovXG5pbXBvcnQgeyByZWdpc3Rlck1vZHVsZSB9IGZyb20gJy4uL2pzZm9yY2UnO1xuaW1wb3J0IENvbm5lY3Rpb24gZnJvbSAnLi4vY29ubmVjdGlvbic7XG5pbXBvcnQgeyBIdHRwUmVxdWVzdCwgSHR0cE1ldGhvZHMsIFNjaGVtYSB9IGZyb20gJy4uL3R5cGVzJztcblxuLyoqXG4gKiBBUEkgY2xhc3MgZm9yIEFwZXggUkVTVCBlbmRwb2ludCBjYWxsXG4gKi9cbmV4cG9ydCBjbGFzcyBBcGV4PFMgZXh0ZW5kcyBTY2hlbWE+IHtcbiAgX2Nvbm46IENvbm5lY3Rpb248Uz47XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb25uOiBDb25uZWN0aW9uPFM+KSB7XG4gICAgdGhpcy5fY29ubiA9IGNvbm47XG4gIH1cblxuICAvKiBAcHJpdmF0ZSAqL1xuICBfYmFzZVVybCgpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5fY29ubi5pbnN0YW5jZVVybH0vc2VydmljZXMvYXBleHJlc3RgO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfY3JlYXRlUmVxdWVzdFBhcmFtcyhcbiAgICBtZXRob2Q6IEh0dHBNZXRob2RzLFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICBib2R5PzogT2JqZWN0LFxuICAgIG9wdGlvbnM6IHsgaGVhZGVycz86IEh0dHBSZXF1ZXN0WydoZWFkZXJzJ10gfSA9IHt9LFxuICApOiBIdHRwUmVxdWVzdCB7XG4gICAgY29uc3QgaGVhZGVyczogSHR0cFJlcXVlc3RbJ2hlYWRlcnMnXSA9XG4gICAgICB0eXBlb2Ygb3B0aW9ucy5oZWFkZXJzID09PSAnb2JqZWN0JyA/IG9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgIGlmICghL14oR0VUfERFTEVURSkkL2kudGVzdChtZXRob2QpKSB7XG4gICAgICBoZWFkZXJzWydjb250ZW50LXR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICB9XG4gICAgY29uc3QgcGFyYW1zOiBIdHRwUmVxdWVzdCA9IHtcbiAgICAgIG1ldGhvZCxcbiAgICAgIHVybDogdGhpcy5fYmFzZVVybCgpICsgcGF0aCxcbiAgICAgIGhlYWRlcnMsXG4gICAgfTtcbiAgICBpZiAoYm9keSkge1xuICAgICAgcGFyYW1zLmJvZHkgPSBKU09OLnN0cmluZ2lmeShib2R5KTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcmFtcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIEFwZXggUkVTVCBzZXJ2aWNlIGluIEdFVCByZXF1ZXN0XG4gICAqL1xuICBnZXQ8UiA9IHVua25vd24+KHBhdGg6IHN0cmluZywgb3B0aW9ucz86IE9iamVjdCkge1xuICAgIHJldHVybiB0aGlzLl9jb25uLnJlcXVlc3Q8Uj4oXG4gICAgICB0aGlzLl9jcmVhdGVSZXF1ZXN0UGFyYW1zKCdHRVQnLCBwYXRoLCB1bmRlZmluZWQsIG9wdGlvbnMpLFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCBBcGV4IFJFU1Qgc2VydmljZSBpbiBQT1NUIHJlcXVlc3RcbiAgICovXG4gIHBvc3Q8UiA9IHVua25vd24+KHBhdGg6IHN0cmluZywgYm9keT86IE9iamVjdCwgb3B0aW9ucz86IE9iamVjdCkge1xuICAgIGNvbnN0IHBhcmFtcyA9IHRoaXMuX2NyZWF0ZVJlcXVlc3RQYXJhbXMoJ1BPU1QnLCBwYXRoLCBib2R5LCBvcHRpb25zKTtcbiAgICByZXR1cm4gdGhpcy5fY29ubi5yZXF1ZXN0PFI+KHBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCBBcGV4IFJFU1Qgc2VydmljZSBpbiBQVVQgcmVxdWVzdFxuICAgKi9cbiAgcHV0PFIgPSB1bmtub3duPihwYXRoOiBzdHJpbmcsIGJvZHk/OiBPYmplY3QsIG9wdGlvbnM/OiBPYmplY3QpIHtcbiAgICBjb25zdCBwYXJhbXMgPSB0aGlzLl9jcmVhdGVSZXF1ZXN0UGFyYW1zKCdQVVQnLCBwYXRoLCBib2R5LCBvcHRpb25zKTtcbiAgICByZXR1cm4gdGhpcy5fY29ubi5yZXF1ZXN0PFI+KHBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCBBcGV4IFJFU1Qgc2VydmljZSBpbiBQQVRDSCByZXF1ZXN0XG4gICAqL1xuICBwYXRjaDxSID0gdW5rbm93bj4ocGF0aDogc3RyaW5nLCBib2R5PzogT2JqZWN0LCBvcHRpb25zPzogT2JqZWN0KSB7XG4gICAgY29uc3QgcGFyYW1zID0gdGhpcy5fY3JlYXRlUmVxdWVzdFBhcmFtcygnUEFUQ0gnLCBwYXRoLCBib2R5LCBvcHRpb25zKTtcbiAgICByZXR1cm4gdGhpcy5fY29ubi5yZXF1ZXN0PFI+KHBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCBBcGV4IFJFU1Qgc2VydmljZSBpbiBERUxFVEUgcmVxdWVzdFxuICAgKi9cbiAgZGVsZXRlPFIgPSB1bmtub3duPihwYXRoOiBzdHJpbmcsIG9wdGlvbnM/OiBPYmplY3QpIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubi5yZXF1ZXN0PFI+KFxuICAgICAgdGhpcy5fY3JlYXRlUmVxdWVzdFBhcmFtcygnREVMRVRFJywgcGF0aCwgdW5kZWZpbmVkLCBvcHRpb25zKSxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN5bm9ueW0gb2YgQXBleCNkZWxldGUoKVxuICAgKi9cbiAgZGVsID0gdGhpcy5kZWxldGU7XG59XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLypcbiAqIFJlZ2lzdGVyIGhvb2sgaW4gY29ubmVjdGlvbiBpbnN0YW50aWF0aW9uIGZvciBkeW5hbWljYWxseSBhZGRpbmcgdGhpcyBBUEkgbW9kdWxlIGZlYXR1cmVzXG4gKi9cbnJlZ2lzdGVyTW9kdWxlKCdhcGV4JywgKGNvbm4pID0+IG5ldyBBcGV4KGNvbm4pKTtcblxuZXhwb3J0IGRlZmF1bHQgQXBleDtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUE7O0FBSkE7QUFDQTtBQUNBO0FBQ0E7O0FBS0E7QUFDQTtBQUNBO0FBQ08sTUFBTUEsSUFBTixDQUE2QjtFQUdsQztBQUNGO0FBQ0E7RUFDRUMsV0FBVyxDQUFDQyxJQUFELEVBQXNCO0lBQUE7SUFBQSwyQ0ErRTNCLEtBQUtDLE1BL0VzQjtJQUMvQixLQUFLQyxLQUFMLEdBQWFGLElBQWI7RUFDRDtFQUVEOzs7RUFDQUcsUUFBUSxHQUFHO0lBQ1QsT0FBUSxHQUFFLEtBQUtELEtBQUwsQ0FBV0UsV0FBWSxvQkFBakM7RUFDRDtFQUVEO0FBQ0Y7QUFDQTs7O0VBQ0VDLG9CQUFvQixDQUNsQkMsTUFEa0IsRUFFbEJDLElBRmtCLEVBR2xCQyxJQUhrQixFQUlsQkMsT0FBNkMsR0FBRyxFQUo5QixFQUtMO0lBQ2IsTUFBTUMsT0FBK0IsR0FDbkMsT0FBT0QsT0FBTyxDQUFDQyxPQUFmLEtBQTJCLFFBQTNCLEdBQXNDRCxPQUFPLENBQUNDLE9BQTlDLEdBQXdELEVBRDFEOztJQUVBLElBQUksQ0FBQyxrQkFBa0JDLElBQWxCLENBQXVCTCxNQUF2QixDQUFMLEVBQXFDO01BQ25DSSxPQUFPLENBQUMsY0FBRCxDQUFQLEdBQTBCLGtCQUExQjtJQUNEOztJQUNELE1BQU1FLE1BQW1CLEdBQUc7TUFDMUJOLE1BRDBCO01BRTFCTyxHQUFHLEVBQUUsS0FBS1YsUUFBTCxLQUFrQkksSUFGRztNQUcxQkc7SUFIMEIsQ0FBNUI7O0lBS0EsSUFBSUYsSUFBSixFQUFVO01BQ1JJLE1BQU0sQ0FBQ0osSUFBUCxHQUFjLHdCQUFlQSxJQUFmLENBQWQ7SUFDRDs7SUFDRCxPQUFPSSxNQUFQO0VBQ0Q7RUFFRDtBQUNGO0FBQ0E7OztFQUNFRSxHQUFHLENBQWNQLElBQWQsRUFBNEJFLE9BQTVCLEVBQThDO0lBQy9DLE9BQU8sS0FBS1AsS0FBTCxDQUFXYSxPQUFYLENBQ0wsS0FBS1Ysb0JBQUwsQ0FBMEIsS0FBMUIsRUFBaUNFLElBQWpDLEVBQXVDUyxTQUF2QyxFQUFrRFAsT0FBbEQsQ0FESyxDQUFQO0VBR0Q7RUFFRDtBQUNGO0FBQ0E7OztFQUNFUSxJQUFJLENBQWNWLElBQWQsRUFBNEJDLElBQTVCLEVBQTJDQyxPQUEzQyxFQUE2RDtJQUMvRCxNQUFNRyxNQUFNLEdBQUcsS0FBS1Asb0JBQUwsQ0FBMEIsTUFBMUIsRUFBa0NFLElBQWxDLEVBQXdDQyxJQUF4QyxFQUE4Q0MsT0FBOUMsQ0FBZjs7SUFDQSxPQUFPLEtBQUtQLEtBQUwsQ0FBV2EsT0FBWCxDQUFzQkgsTUFBdEIsQ0FBUDtFQUNEO0VBRUQ7QUFDRjtBQUNBOzs7RUFDRU0sR0FBRyxDQUFjWCxJQUFkLEVBQTRCQyxJQUE1QixFQUEyQ0MsT0FBM0MsRUFBNkQ7SUFDOUQsTUFBTUcsTUFBTSxHQUFHLEtBQUtQLG9CQUFMLENBQTBCLEtBQTFCLEVBQWlDRSxJQUFqQyxFQUF1Q0MsSUFBdkMsRUFBNkNDLE9BQTdDLENBQWY7O0lBQ0EsT0FBTyxLQUFLUCxLQUFMLENBQVdhLE9BQVgsQ0FBc0JILE1BQXRCLENBQVA7RUFDRDtFQUVEO0FBQ0Y7QUFDQTs7O0VBQ0VPLEtBQUssQ0FBY1osSUFBZCxFQUE0QkMsSUFBNUIsRUFBMkNDLE9BQTNDLEVBQTZEO0lBQ2hFLE1BQU1HLE1BQU0sR0FBRyxLQUFLUCxvQkFBTCxDQUEwQixPQUExQixFQUFtQ0UsSUFBbkMsRUFBeUNDLElBQXpDLEVBQStDQyxPQUEvQyxDQUFmOztJQUNBLE9BQU8sS0FBS1AsS0FBTCxDQUFXYSxPQUFYLENBQXNCSCxNQUF0QixDQUFQO0VBQ0Q7RUFFRDtBQUNGO0FBQ0E7OztFQUNFWCxNQUFNLENBQWNNLElBQWQsRUFBNEJFLE9BQTVCLEVBQThDO0lBQ2xELE9BQU8sS0FBS1AsS0FBTCxDQUFXYSxPQUFYLENBQ0wsS0FBS1Ysb0JBQUwsQ0FBMEIsUUFBMUIsRUFBb0NFLElBQXBDLEVBQTBDUyxTQUExQyxFQUFxRFAsT0FBckQsQ0FESyxDQUFQO0VBR0Q7RUFFRDtBQUNGO0FBQ0E7OztBQXBGb0M7QUF3RnBDOztBQUNBO0FBQ0E7QUFDQTs7OztBQUNBLElBQUFXLHVCQUFBLEVBQWUsTUFBZixFQUF3QnBCLElBQUQsSUFBVSxJQUFJRixJQUFKLENBQVNFLElBQVQsQ0FBakM7ZUFFZUYsSSJ9