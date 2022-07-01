"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = exports.QuickAction = void 0;

require("core-js/modules/es.promise.js");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

/**
 * @file Represents Salesforce QuickAction
 * @author Shinichi Tomita <shinichi.tomita@gmail.com>
 */

/**
 * type definitions
 */

/**
 * A class for quick action
 */
class QuickAction {
  /**
   *
   */
  constructor(conn, path) {
    (0, _defineProperty2.default)(this, "_conn", void 0);
    (0, _defineProperty2.default)(this, "_path", void 0);
    this._conn = conn;
    this._path = path;
  }
  /**
   * Describe the action's information (including layout, etc.)
   */


  async describe() {
    const url = `${this._path}/describe`;
    const body = await this._conn.request(url);
    return body;
  }
  /**
   * Retrieve default field values in the action (for given record, if specified)
   */


  async defaultValues(contextId) {
    let url = `${this._path}/defaultValues`;

    if (contextId) {
      url += `/${contextId}`;
    }

    const body = await this._conn.request(url);
    return body;
  }
  /**
   * Execute the action for given context Id and record information
   */


  async execute(contextId, record) {
    const requestBody = {
      contextId,
      record
    };
    const resBody = await this._conn.requestPost(this._path, requestBody);
    return resBody;
  }

}

exports.QuickAction = QuickAction;
var _default = QuickAction;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJRdWlja0FjdGlvbiIsImNvbnN0cnVjdG9yIiwiY29ubiIsInBhdGgiLCJfY29ubiIsIl9wYXRoIiwiZGVzY3JpYmUiLCJ1cmwiLCJib2R5IiwicmVxdWVzdCIsImRlZmF1bHRWYWx1ZXMiLCJjb250ZXh0SWQiLCJleGVjdXRlIiwicmVjb3JkIiwicmVxdWVzdEJvZHkiLCJyZXNCb2R5IiwicmVxdWVzdFBvc3QiXSwic291cmNlcyI6WyIuLi9zcmMvcXVpY2stYWN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgUmVwcmVzZW50cyBTYWxlc2ZvcmNlIFF1aWNrQWN0aW9uXG4gKiBAYXV0aG9yIFNoaW5pY2hpIFRvbWl0YSA8c2hpbmljaGkudG9taXRhQGdtYWlsLmNvbT5cbiAqL1xuaW1wb3J0IENvbm5lY3Rpb24gZnJvbSAnLi9jb25uZWN0aW9uJztcbmltcG9ydCB7XG4gIERlc2NyaWJlUXVpY2tBY3Rpb25EZXRhaWxSZXN1bHQsXG4gIFJlY29yZCxcbiAgT3B0aW9uYWwsXG4gIFNjaGVtYSxcbn0gZnJvbSAnLi90eXBlcyc7XG5cbi8qKlxuICogdHlwZSBkZWZpbml0aW9uc1xuICovXG5leHBvcnQgdHlwZSBRdWlja0FjdGlvbkRlZmF1bHRWYWx1ZXMgPSB7IFtuYW1lOiBzdHJpbmddOiBhbnkgfTtcblxuZXhwb3J0IHR5cGUgUXVpY2tBY3Rpb25SZXN1bHQgPSB7XG4gIGlkOiBzdHJpbmc7XG4gIGZlZWRJdGVtSWRzOiBPcHRpb25hbDxzdHJpbmdbXT47XG4gIHN1Y2Nlc3M6IGJvb2xlYW47XG4gIGNyZWF0ZWQ6IGJvb2xlYW47XG4gIGNvbnRleHRJZDogc3RyaW5nO1xuICBlcnJvcnM6IE9iamVjdFtdO1xufTtcblxuLyoqXG4gKiBBIGNsYXNzIGZvciBxdWljayBhY3Rpb25cbiAqL1xuZXhwb3J0IGNsYXNzIFF1aWNrQWN0aW9uPFMgZXh0ZW5kcyBTY2hlbWE+IHtcbiAgX2Nvbm46IENvbm5lY3Rpb248Uz47XG4gIF9wYXRoOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb25uOiBDb25uZWN0aW9uPFM+LCBwYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9jb25uID0gY29ubjtcbiAgICB0aGlzLl9wYXRoID0gcGF0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNjcmliZSB0aGUgYWN0aW9uJ3MgaW5mb3JtYXRpb24gKGluY2x1ZGluZyBsYXlvdXQsIGV0Yy4pXG4gICAqL1xuICBhc3luYyBkZXNjcmliZSgpOiBQcm9taXNlPERlc2NyaWJlUXVpY2tBY3Rpb25EZXRhaWxSZXN1bHQ+IHtcbiAgICBjb25zdCB1cmwgPSBgJHt0aGlzLl9wYXRofS9kZXNjcmliZWA7XG4gICAgY29uc3QgYm9keSA9IGF3YWl0IHRoaXMuX2Nvbm4ucmVxdWVzdCh1cmwpO1xuICAgIHJldHVybiBib2R5IGFzIERlc2NyaWJlUXVpY2tBY3Rpb25EZXRhaWxSZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmUgZGVmYXVsdCBmaWVsZCB2YWx1ZXMgaW4gdGhlIGFjdGlvbiAoZm9yIGdpdmVuIHJlY29yZCwgaWYgc3BlY2lmaWVkKVxuICAgKi9cbiAgYXN5bmMgZGVmYXVsdFZhbHVlcyhjb250ZXh0SWQ/OiBzdHJpbmcpOiBQcm9taXNlPFF1aWNrQWN0aW9uRGVmYXVsdFZhbHVlcz4ge1xuICAgIGxldCB1cmwgPSBgJHt0aGlzLl9wYXRofS9kZWZhdWx0VmFsdWVzYDtcbiAgICBpZiAoY29udGV4dElkKSB7XG4gICAgICB1cmwgKz0gYC8ke2NvbnRleHRJZH1gO1xuICAgIH1cbiAgICBjb25zdCBib2R5ID0gYXdhaXQgdGhpcy5fY29ubi5yZXF1ZXN0KHVybCk7XG4gICAgcmV0dXJuIGJvZHkgYXMgUXVpY2tBY3Rpb25EZWZhdWx0VmFsdWVzO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGUgdGhlIGFjdGlvbiBmb3IgZ2l2ZW4gY29udGV4dCBJZCBhbmQgcmVjb3JkIGluZm9ybWF0aW9uXG4gICAqL1xuICBhc3luYyBleGVjdXRlKGNvbnRleHRJZDogc3RyaW5nLCByZWNvcmQ6IFJlY29yZCk6IFByb21pc2U8UXVpY2tBY3Rpb25SZXN1bHQ+IHtcbiAgICBjb25zdCByZXF1ZXN0Qm9keSA9IHsgY29udGV4dElkLCByZWNvcmQgfTtcbiAgICBjb25zdCByZXNCb2R5ID0gYXdhaXQgdGhpcy5fY29ubi5yZXF1ZXN0UG9zdCh0aGlzLl9wYXRoLCByZXF1ZXN0Qm9keSk7XG4gICAgcmV0dXJuIHJlc0JvZHkgYXMgUXVpY2tBY3Rpb25SZXN1bHQ7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUXVpY2tBY3Rpb247XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTs7QUFTQTtBQUNBO0FBQ0E7O0FBWUE7QUFDQTtBQUNBO0FBQ08sTUFBTUEsV0FBTixDQUFvQztFQUl6QztBQUNGO0FBQ0E7RUFDRUMsV0FBVyxDQUFDQyxJQUFELEVBQXNCQyxJQUF0QixFQUFvQztJQUFBO0lBQUE7SUFDN0MsS0FBS0MsS0FBTCxHQUFhRixJQUFiO0lBQ0EsS0FBS0csS0FBTCxHQUFhRixJQUFiO0VBQ0Q7RUFFRDtBQUNGO0FBQ0E7OztFQUNnQixNQUFSRyxRQUFRLEdBQTZDO0lBQ3pELE1BQU1DLEdBQUcsR0FBSSxHQUFFLEtBQUtGLEtBQU0sV0FBMUI7SUFDQSxNQUFNRyxJQUFJLEdBQUcsTUFBTSxLQUFLSixLQUFMLENBQVdLLE9BQVgsQ0FBbUJGLEdBQW5CLENBQW5CO0lBQ0EsT0FBT0MsSUFBUDtFQUNEO0VBRUQ7QUFDRjtBQUNBOzs7RUFDcUIsTUFBYkUsYUFBYSxDQUFDQyxTQUFELEVBQXdEO0lBQ3pFLElBQUlKLEdBQUcsR0FBSSxHQUFFLEtBQUtGLEtBQU0sZ0JBQXhCOztJQUNBLElBQUlNLFNBQUosRUFBZTtNQUNiSixHQUFHLElBQUssSUFBR0ksU0FBVSxFQUFyQjtJQUNEOztJQUNELE1BQU1ILElBQUksR0FBRyxNQUFNLEtBQUtKLEtBQUwsQ0FBV0ssT0FBWCxDQUFtQkYsR0FBbkIsQ0FBbkI7SUFDQSxPQUFPQyxJQUFQO0VBQ0Q7RUFFRDtBQUNGO0FBQ0E7OztFQUNlLE1BQVBJLE9BQU8sQ0FBQ0QsU0FBRCxFQUFvQkUsTUFBcEIsRUFBZ0U7SUFDM0UsTUFBTUMsV0FBVyxHQUFHO01BQUVILFNBQUY7TUFBYUU7SUFBYixDQUFwQjtJQUNBLE1BQU1FLE9BQU8sR0FBRyxNQUFNLEtBQUtYLEtBQUwsQ0FBV1ksV0FBWCxDQUF1QixLQUFLWCxLQUE1QixFQUFtQ1MsV0FBbkMsQ0FBdEI7SUFDQSxPQUFPQyxPQUFQO0VBQ0Q7O0FBeEN3Qzs7O2VBMkM1QmYsVyJ9