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

exports.Dashboard = exports.Analytics = void 0;

_Object$defineProperty(exports, "DashboardInfo", {
  enumerable: true,
  get: function () {
    return _types.DashboardInfo;
  }
});

_Object$defineProperty(exports, "DashboardMetadata", {
  enumerable: true,
  get: function () {
    return _types.DashboardMetadata;
  }
});

_Object$defineProperty(exports, "DashboardRefreshResult", {
  enumerable: true,
  get: function () {
    return _types.DashboardRefreshResult;
  }
});

_Object$defineProperty(exports, "DashboardResult", {
  enumerable: true,
  get: function () {
    return _types.DashboardResult;
  }
});

_Object$defineProperty(exports, "DashboardStatusResult", {
  enumerable: true,
  get: function () {
    return _types.DashboardStatusResult;
  }
});

exports.Report = void 0;

_Object$defineProperty(exports, "ReportDescribeResult", {
  enumerable: true,
  get: function () {
    return _types.ReportDescribeResult;
  }
});

_Object$defineProperty(exports, "ReportExecuteResult", {
  enumerable: true,
  get: function () {
    return _types.ReportExecuteResult;
  }
});

_Object$defineProperty(exports, "ReportInfo", {
  enumerable: true,
  get: function () {
    return _types.ReportInfo;
  }
});

exports.ReportInstance = void 0;

_Object$defineProperty(exports, "ReportInstanceInfo", {
  enumerable: true,
  get: function () {
    return _types.ReportInstanceInfo;
  }
});

_Object$defineProperty(exports, "ReportMetadata", {
  enumerable: true,
  get: function () {
    return _types.ReportMetadata;
  }
});

_Object$defineProperty(exports, "ReportRetrieveResult", {
  enumerable: true,
  get: function () {
    return _types.ReportRetrieveResult;
  }
});

exports.default = void 0;

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/json/stringify"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _jsforce = require("../jsforce");

var _types = require("./analytics/types");

function ownKeys(object, enumerableOnly) { var keys = _Object$keys(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context, _context2; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context = ownKeys(Object(source), !0)).call(_context, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context2 = ownKeys(Object(source))).call(_context2, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

/*----------------------------------------------------------------------------------*/

/**
 * Report object class in Analytics API
 */
class ReportInstance {
  /**
   *
   */
  constructor(report, id) {
    (0, _defineProperty2.default)(this, "_report", void 0);
    (0, _defineProperty2.default)(this, "_conn", void 0);
    (0, _defineProperty2.default)(this, "id", void 0);
    this._report = report;
    this._conn = report._conn;
    this.id = id;
  }
  /**
   * Retrieve report result asynchronously executed
   */


  retrieve() {
    const url = [this._conn._baseUrl(), 'analytics', 'reports', this._report.id, 'instances', this.id].join('/');
    return this._conn.request(url);
  }

}
/*----------------------------------------------------------------------------------*/

/**
 * Report object class in Analytics API
 */


exports.ReportInstance = ReportInstance;

class Report {
  /**
   *
   */
  constructor(conn, id) {
    (0, _defineProperty2.default)(this, "_conn", void 0);
    (0, _defineProperty2.default)(this, "id", void 0);
    (0, _defineProperty2.default)(this, "delete", this.destroy);
    (0, _defineProperty2.default)(this, "del", this.destroy);
    (0, _defineProperty2.default)(this, "run", this.execute);
    (0, _defineProperty2.default)(this, "exec", this.execute);
    this._conn = conn;
    this.id = id;
  }
  /**
   * Describe report metadata
   */


  describe() {
    var url = [this._conn._baseUrl(), 'analytics', 'reports', this.id, 'describe'].join('/');
    return this._conn.request(url);
  }
  /**
   * Destroy a report
   */


  destroy() {
    const url = [this._conn._baseUrl(), 'analytics', 'reports', this.id].join('/');
    return this._conn.request({
      method: 'DELETE',
      url
    });
  }
  /**
   * Synonym of Analytics~Report#destroy()
   */


  /**
   * Clones a given report
   */
  clone(name) {
    const url = [this._conn._baseUrl(), 'analytics', 'reports'].join('/') + '?cloneId=' + this.id;
    const config = {
      reportMetadata: {
        name
      }
    };
    return this._conn.request({
      method: 'POST',
      url,
      headers: {
        'Content-Type': 'application/json'
      },
      body: (0, _stringify.default)(config)
    });
  }
  /**
   * Explain plan for executing report
   */


  explain() {
    const url = '/query/?explain=' + this.id;
    return this._conn.request(url);
  }
  /**
   * Run report synchronously
   */


  execute(options = {}) {
    const url = [this._conn._baseUrl(), 'analytics', 'reports', this.id].join('/') + '?includeDetails=' + (options.details ? 'true' : 'false');
    return this._conn.request(_objectSpread({
      url
    }, options.metadata ? {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: (0, _stringify.default)(options.metadata)
    } : {
      method: 'GET'
    }));
  }
  /**
   * Synonym of Analytics~Report#execute()
   */


  /**
   * Run report asynchronously
   */
  executeAsync(options = {}) {
    const url = [this._conn._baseUrl(), 'analytics', 'reports', this.id, 'instances'].join('/') + (options.details ? '?includeDetails=true' : '');
    return this._conn.request(_objectSpread({
      method: 'POST',
      url
    }, options.metadata ? {
      headers: {
        'Content-Type': 'application/json'
      },
      body: (0, _stringify.default)(options.metadata)
    } : {
      body: ''
    }));
  }
  /**
   * Get report instance for specified instance ID
   */


  instance(id) {
    return new ReportInstance(this, id);
  }
  /**
   * List report instances which had been executed asynchronously
   */


  instances() {
    const url = [this._conn._baseUrl(), 'analytics', 'reports', this.id, 'instances'].join('/');
    return this._conn.request(url);
  }

}
/*----------------------------------------------------------------------------------*/

/**
 * Dashboard object class in the Analytics API
 */


exports.Report = Report;

class Dashboard {
  /**
   *
   */
  constructor(conn, id) {
    (0, _defineProperty2.default)(this, "_conn", void 0);
    (0, _defineProperty2.default)(this, "id", void 0);
    (0, _defineProperty2.default)(this, "delete", this.destroy);
    (0, _defineProperty2.default)(this, "del", this.destroy);
    this._conn = conn;
    this.id = id;
  }
  /**
   * Describe dashboard metadata
   *
   * @method Analytics~Dashboard#describe
   * @param {Callback.<Analytics-DashboardMetadata>} [callback] - Callback function
   * @returns {Promise.<Analytics-DashboardMetadata>}
   */


  describe() {
    const url = [this._conn._baseUrl(), 'analytics', 'dashboards', this.id, 'describe'].join('/');
    return this._conn.request(url);
  }
  /**
   * Get details about dashboard components
   */


  components(componentIds) {
    const url = [this._conn._baseUrl(), 'analytics', 'dashboards', this.id].join('/');
    const config = {
      componentIds: (0, _isArray.default)(componentIds) ? componentIds : typeof componentIds === 'string' ? [componentIds] : undefined
    };
    return this._conn.request({
      method: 'POST',
      url,
      headers: {
        'Content-Type': 'application/json'
      },
      body: (0, _stringify.default)(config)
    });
  }
  /**
   * Get dashboard status
   */


  status() {
    const url = [this._conn._baseUrl(), 'analytics', 'dashboards', this.id, 'status'].join('/');
    return this._conn.request(url);
  }
  /**
   * Refresh a dashboard
   */


  refresh() {
    const url = [this._conn._baseUrl(), 'analytics', 'dashboards', this.id].join('/');
    return this._conn.request({
      method: 'PUT',
      url,
      body: ''
    });
  }
  /**
   * Clone a dashboard
   */


  clone(config, folderId) {
    const url = [this._conn._baseUrl(), 'analytics', 'dashboards'].join('/') + '?cloneId=' + this.id;

    if (typeof config === 'string') {
      config = {
        name: config,
        folderId
      };
    }

    return this._conn.request({
      method: 'POST',
      url,
      headers: {
        'Content-Type': 'application/json'
      },
      body: (0, _stringify.default)(config)
    });
  }
  /**
   * Destroy a dashboard
   */


  destroy() {
    const url = [this._conn._baseUrl(), 'analytics', 'dashboards', this.id].join('/');
    return this._conn.request({
      method: 'DELETE',
      url
    });
  }
  /**
   * Synonym of Analytics~Dashboard#destroy()
   */


}
/*----------------------------------------------------------------------------------*/

/**
 * API class for Analytics API
 */


exports.Dashboard = Dashboard;

class Analytics {
  /**
   *
   */
  constructor(conn) {
    (0, _defineProperty2.default)(this, "_conn", void 0);
    this._conn = conn;
  }
  /**
   * Get report object of Analytics API
   */


  report(id) {
    return new Report(this._conn, id);
  }
  /**
   * Get recent report list
   */


  reports() {
    const url = [this._conn._baseUrl(), 'analytics', 'reports'].join('/');
    return this._conn.request(url);
  }
  /**
   * Get dashboard object of Analytics API
   */


  dashboard(id) {
    return new Dashboard(this._conn, id);
  }
  /**
   * Get recent dashboard list
   */


  dashboards() {
    var url = [this._conn._baseUrl(), 'analytics', 'dashboards'].join('/');
    return this._conn.request(url);
  }

}
/*--------------------------------------------*/

/*
 * Register hook in connection instantiation for dynamically adding this API module features
 */


exports.Analytics = Analytics;
(0, _jsforce.registerModule)('analytics', conn => new Analytics(conn));
var _default = Analytics;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZXBvcnRJbnN0YW5jZSIsImNvbnN0cnVjdG9yIiwicmVwb3J0IiwiaWQiLCJfcmVwb3J0IiwiX2Nvbm4iLCJyZXRyaWV2ZSIsInVybCIsIl9iYXNlVXJsIiwiam9pbiIsInJlcXVlc3QiLCJSZXBvcnQiLCJjb25uIiwiZGVzdHJveSIsImV4ZWN1dGUiLCJkZXNjcmliZSIsIm1ldGhvZCIsImNsb25lIiwibmFtZSIsImNvbmZpZyIsInJlcG9ydE1ldGFkYXRhIiwiaGVhZGVycyIsImJvZHkiLCJleHBsYWluIiwib3B0aW9ucyIsImRldGFpbHMiLCJtZXRhZGF0YSIsImV4ZWN1dGVBc3luYyIsImluc3RhbmNlIiwiaW5zdGFuY2VzIiwiRGFzaGJvYXJkIiwiY29tcG9uZW50cyIsImNvbXBvbmVudElkcyIsInVuZGVmaW5lZCIsInN0YXR1cyIsInJlZnJlc2giLCJmb2xkZXJJZCIsIkFuYWx5dGljcyIsInJlcG9ydHMiLCJkYXNoYm9hcmQiLCJkYXNoYm9hcmRzIiwicmVnaXN0ZXJNb2R1bGUiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvYXBpL2FuYWx5dGljcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIE1hbmFnZXMgU2FsZXNmb3JjZSBBbmFseXRpY3MgQVBJXG4gKiBAYXV0aG9yIFNoaW5pY2hpIFRvbWl0YSA8c2hpbmljaGkudG9taXRhQGdtYWlsLmNvbT5cbiAqL1xuaW1wb3J0IHsgcmVnaXN0ZXJNb2R1bGUgfSBmcm9tICcuLi9qc2ZvcmNlJztcbmltcG9ydCBDb25uZWN0aW9uIGZyb20gJy4uL2Nvbm5lY3Rpb24nO1xuaW1wb3J0IHsgU2NoZW1hIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHtcbiAgUmVwb3J0TWV0YWRhdGEsXG4gIFJlcG9ydEV4ZWN1dGVSZXN1bHQsXG4gIFJlcG9ydFJldHJpZXZlUmVzdWx0LFxuICBSZXBvcnREZXNjcmliZVJlc3VsdCxcbiAgUmVwb3J0SW5mbyxcbiAgUmVwb3J0SW5zdGFuY2VJbmZvLFxuICBEYXNoYm9hcmRNZXRhZGF0YSxcbiAgRGFzaGJvYXJkUmVzdWx0LFxuICBEYXNoYm9hcmRTdGF0dXNSZXN1bHQsXG4gIERhc2hib2FyZFJlZnJlc2hSZXN1bHQsXG4gIERhc2hib2FyZEluZm8sXG59IGZyb20gJy4vYW5hbHl0aWNzL3R5cGVzJztcbmltcG9ydCB7IFF1ZXJ5RXhwbGFpblJlc3VsdCB9IGZyb20gJy4uL3F1ZXJ5JztcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydCB7XG4gIFJlcG9ydE1ldGFkYXRhLFxuICBSZXBvcnRFeGVjdXRlUmVzdWx0LFxuICBSZXBvcnRSZXRyaWV2ZVJlc3VsdCxcbiAgUmVwb3J0RGVzY3JpYmVSZXN1bHQsXG4gIFJlcG9ydEluZm8sXG4gIFJlcG9ydEluc3RhbmNlSW5mbyxcbiAgRGFzaGJvYXJkTWV0YWRhdGEsXG4gIERhc2hib2FyZFJlc3VsdCxcbiAgRGFzaGJvYXJkU3RhdHVzUmVzdWx0LFxuICBEYXNoYm9hcmRSZWZyZXNoUmVzdWx0LFxuICBEYXNoYm9hcmRJbmZvLFxufTtcblxuZXhwb3J0IHR5cGUgUmVwb3J0RXhlY3V0ZU9wdGlvbnMgPSB7XG4gIGRldGFpbHM/OiBib29sZWFuO1xuICBtZXRhZGF0YT86IHtcbiAgICByZXBvcnRNZXRhZGF0YTogUGFydGlhbDxSZXBvcnRNZXRhZGF0YT47XG4gIH07XG59O1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyoqXG4gKiBSZXBvcnQgb2JqZWN0IGNsYXNzIGluIEFuYWx5dGljcyBBUElcbiAqL1xuZXhwb3J0IGNsYXNzIFJlcG9ydEluc3RhbmNlPFMgZXh0ZW5kcyBTY2hlbWE+IHtcbiAgX3JlcG9ydDogUmVwb3J0PFM+O1xuICBfY29ubjogQ29ubmVjdGlvbjxTPjtcbiAgaWQ6IHN0cmluZztcblxuICAvKipcbiAgICpcbiAgICovXG4gIGNvbnN0cnVjdG9yKHJlcG9ydDogUmVwb3J0PFM+LCBpZDogc3RyaW5nKSB7XG4gICAgdGhpcy5fcmVwb3J0ID0gcmVwb3J0O1xuICAgIHRoaXMuX2Nvbm4gPSByZXBvcnQuX2Nvbm47XG4gICAgdGhpcy5pZCA9IGlkO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHJlcG9ydCByZXN1bHQgYXN5bmNocm9ub3VzbHkgZXhlY3V0ZWRcbiAgICovXG4gIHJldHJpZXZlKCk6IFByb21pc2U8UmVwb3J0UmV0cmlldmVSZXN1bHQ+IHtcbiAgICBjb25zdCB1cmwgPSBbXG4gICAgICB0aGlzLl9jb25uLl9iYXNlVXJsKCksXG4gICAgICAnYW5hbHl0aWNzJyxcbiAgICAgICdyZXBvcnRzJyxcbiAgICAgIHRoaXMuX3JlcG9ydC5pZCxcbiAgICAgICdpbnN0YW5jZXMnLFxuICAgICAgdGhpcy5pZCxcbiAgICBdLmpvaW4oJy8nKTtcbiAgICByZXR1cm4gdGhpcy5fY29ubi5yZXF1ZXN0PFJlcG9ydFJldHJpZXZlUmVzdWx0Pih1cmwpO1xuICB9XG59XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKipcbiAqIFJlcG9ydCBvYmplY3QgY2xhc3MgaW4gQW5hbHl0aWNzIEFQSVxuICovXG5leHBvcnQgY2xhc3MgUmVwb3J0PFMgZXh0ZW5kcyBTY2hlbWE+IHtcbiAgX2Nvbm46IENvbm5lY3Rpb248Uz47XG4gIGlkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb25uOiBDb25uZWN0aW9uPFM+LCBpZDogc3RyaW5nKSB7XG4gICAgdGhpcy5fY29ubiA9IGNvbm47XG4gICAgdGhpcy5pZCA9IGlkO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc2NyaWJlIHJlcG9ydCBtZXRhZGF0YVxuICAgKi9cbiAgZGVzY3JpYmUoKTogUHJvbWlzZTxSZXBvcnREZXNjcmliZVJlc3VsdD4ge1xuICAgIHZhciB1cmwgPSBbXG4gICAgICB0aGlzLl9jb25uLl9iYXNlVXJsKCksXG4gICAgICAnYW5hbHl0aWNzJyxcbiAgICAgICdyZXBvcnRzJyxcbiAgICAgIHRoaXMuaWQsXG4gICAgICAnZGVzY3JpYmUnLFxuICAgIF0uam9pbignLycpO1xuICAgIHJldHVybiB0aGlzLl9jb25uLnJlcXVlc3Q8UmVwb3J0RGVzY3JpYmVSZXN1bHQ+KHVybCk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveSBhIHJlcG9ydFxuICAgKi9cbiAgZGVzdHJveSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB1cmwgPSBbdGhpcy5fY29ubi5fYmFzZVVybCgpLCAnYW5hbHl0aWNzJywgJ3JlcG9ydHMnLCB0aGlzLmlkXS5qb2luKFxuICAgICAgJy8nLFxuICAgICk7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm4ucmVxdWVzdDx2b2lkPih7IG1ldGhvZDogJ0RFTEVURScsIHVybCB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTeW5vbnltIG9mIEFuYWx5dGljc35SZXBvcnQjZGVzdHJveSgpXG4gICAqL1xuICBkZWxldGUgPSB0aGlzLmRlc3Ryb3k7XG5cbiAgLyoqXG4gICAqIFN5bm9ueW0gb2YgQW5hbHl0aWNzflJlcG9ydCNkZXN0cm95KClcbiAgICovXG4gIGRlbCA9IHRoaXMuZGVzdHJveTtcblxuICAvKipcbiAgICogQ2xvbmVzIGEgZ2l2ZW4gcmVwb3J0XG4gICAqL1xuICBjbG9uZShuYW1lOiBzdHJpbmcpOiBQcm9taXNlPFJlcG9ydERlc2NyaWJlUmVzdWx0PiB7XG4gICAgY29uc3QgdXJsID1cbiAgICAgIFt0aGlzLl9jb25uLl9iYXNlVXJsKCksICdhbmFseXRpY3MnLCAncmVwb3J0cyddLmpvaW4oJy8nKSArXG4gICAgICAnP2Nsb25lSWQ9JyArXG4gICAgICB0aGlzLmlkO1xuICAgIGNvbnN0IGNvbmZpZyA9IHsgcmVwb3J0TWV0YWRhdGE6IHsgbmFtZSB9IH07XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm4ucmVxdWVzdDxSZXBvcnREZXNjcmliZVJlc3VsdD4oe1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICB1cmwsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGNvbmZpZyksXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRXhwbGFpbiBwbGFuIGZvciBleGVjdXRpbmcgcmVwb3J0XG4gICAqL1xuICBleHBsYWluKCk6IFByb21pc2U8UXVlcnlFeHBsYWluUmVzdWx0PiB7XG4gICAgY29uc3QgdXJsID0gJy9xdWVyeS8/ZXhwbGFpbj0nICsgdGhpcy5pZDtcbiAgICByZXR1cm4gdGhpcy5fY29ubi5yZXF1ZXN0PFF1ZXJ5RXhwbGFpblJlc3VsdD4odXJsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gcmVwb3J0IHN5bmNocm9ub3VzbHlcbiAgICovXG4gIGV4ZWN1dGUob3B0aW9uczogUmVwb3J0RXhlY3V0ZU9wdGlvbnMgPSB7fSk6IFByb21pc2U8UmVwb3J0RXhlY3V0ZVJlc3VsdD4ge1xuICAgIGNvbnN0IHVybCA9XG4gICAgICBbdGhpcy5fY29ubi5fYmFzZVVybCgpLCAnYW5hbHl0aWNzJywgJ3JlcG9ydHMnLCB0aGlzLmlkXS5qb2luKCcvJykgK1xuICAgICAgJz9pbmNsdWRlRGV0YWlscz0nICtcbiAgICAgIChvcHRpb25zLmRldGFpbHMgPyAndHJ1ZScgOiAnZmFsc2UnKTtcbiAgICByZXR1cm4gdGhpcy5fY29ubi5yZXF1ZXN0PFJlcG9ydEV4ZWN1dGVSZXN1bHQ+KHtcbiAgICAgIHVybCxcbiAgICAgIC4uLihvcHRpb25zLm1ldGFkYXRhXG4gICAgICAgID8ge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMubWV0YWRhdGEpLFxuICAgICAgICAgIH1cbiAgICAgICAgOiB7IG1ldGhvZDogJ0dFVCcgfSksXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU3lub255bSBvZiBBbmFseXRpY3N+UmVwb3J0I2V4ZWN1dGUoKVxuICAgKi9cbiAgcnVuID0gdGhpcy5leGVjdXRlO1xuXG4gIC8qKlxuICAgKiBTeW5vbnltIG9mIEFuYWx5dGljc35SZXBvcnQjZXhlY3V0ZSgpXG4gICAqL1xuICBleGVjID0gdGhpcy5leGVjdXRlO1xuXG4gIC8qKlxuICAgKiBSdW4gcmVwb3J0IGFzeW5jaHJvbm91c2x5XG4gICAqL1xuICBleGVjdXRlQXN5bmMoXG4gICAgb3B0aW9uczogUmVwb3J0RXhlY3V0ZU9wdGlvbnMgPSB7fSxcbiAgKTogUHJvbWlzZTxSZXBvcnRJbnN0YW5jZUluZm8+IHtcbiAgICBjb25zdCB1cmwgPVxuICAgICAgW1xuICAgICAgICB0aGlzLl9jb25uLl9iYXNlVXJsKCksXG4gICAgICAgICdhbmFseXRpY3MnLFxuICAgICAgICAncmVwb3J0cycsXG4gICAgICAgIHRoaXMuaWQsXG4gICAgICAgICdpbnN0YW5jZXMnLFxuICAgICAgXS5qb2luKCcvJykgKyAob3B0aW9ucy5kZXRhaWxzID8gJz9pbmNsdWRlRGV0YWlscz10cnVlJyA6ICcnKTtcbiAgICByZXR1cm4gdGhpcy5fY29ubi5yZXF1ZXN0PFJlcG9ydEluc3RhbmNlSW5mbz4oe1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICB1cmwsXG4gICAgICAuLi4ob3B0aW9ucy5tZXRhZGF0YVxuICAgICAgICA/IHtcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5tZXRhZGF0YSksXG4gICAgICAgICAgfVxuICAgICAgICA6IHsgYm9keTogJycgfSksXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHJlcG9ydCBpbnN0YW5jZSBmb3Igc3BlY2lmaWVkIGluc3RhbmNlIElEXG4gICAqL1xuICBpbnN0YW5jZShpZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBSZXBvcnRJbnN0YW5jZSh0aGlzLCBpZCk7XG4gIH1cblxuICAvKipcbiAgICogTGlzdCByZXBvcnQgaW5zdGFuY2VzIHdoaWNoIGhhZCBiZWVuIGV4ZWN1dGVkIGFzeW5jaHJvbm91c2x5XG4gICAqL1xuICBpbnN0YW5jZXMoKTogUHJvbWlzZTxSZXBvcnRJbnN0YW5jZUluZm9bXT4ge1xuICAgIGNvbnN0IHVybCA9IFtcbiAgICAgIHRoaXMuX2Nvbm4uX2Jhc2VVcmwoKSxcbiAgICAgICdhbmFseXRpY3MnLFxuICAgICAgJ3JlcG9ydHMnLFxuICAgICAgdGhpcy5pZCxcbiAgICAgICdpbnN0YW5jZXMnLFxuICAgIF0uam9pbignLycpO1xuICAgIHJldHVybiB0aGlzLl9jb25uLnJlcXVlc3Q8UmVwb3J0SW5zdGFuY2VJbmZvW10+KHVybCk7XG4gIH1cbn1cblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qKlxuICogRGFzaGJvYXJkIG9iamVjdCBjbGFzcyBpbiB0aGUgQW5hbHl0aWNzIEFQSVxuICovXG5leHBvcnQgY2xhc3MgRGFzaGJvYXJkPFMgZXh0ZW5kcyBTY2hlbWE+IHtcbiAgX2Nvbm46IENvbm5lY3Rpb248Uz47XG4gIGlkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb25uOiBDb25uZWN0aW9uPFM+LCBpZDogc3RyaW5nKSB7XG4gICAgdGhpcy5fY29ubiA9IGNvbm47XG4gICAgdGhpcy5pZCA9IGlkO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc2NyaWJlIGRhc2hib2FyZCBtZXRhZGF0YVxuICAgKlxuICAgKiBAbWV0aG9kIEFuYWx5dGljc35EYXNoYm9hcmQjZGVzY3JpYmVcbiAgICogQHBhcmFtIHtDYWxsYmFjay48QW5hbHl0aWNzLURhc2hib2FyZE1ldGFkYXRhPn0gW2NhbGxiYWNrXSAtIENhbGxiYWNrIGZ1bmN0aW9uXG4gICAqIEByZXR1cm5zIHtQcm9taXNlLjxBbmFseXRpY3MtRGFzaGJvYXJkTWV0YWRhdGE+fVxuICAgKi9cbiAgZGVzY3JpYmUoKTogUHJvbWlzZTxEYXNoYm9hcmRNZXRhZGF0YT4ge1xuICAgIGNvbnN0IHVybCA9IFtcbiAgICAgIHRoaXMuX2Nvbm4uX2Jhc2VVcmwoKSxcbiAgICAgICdhbmFseXRpY3MnLFxuICAgICAgJ2Rhc2hib2FyZHMnLFxuICAgICAgdGhpcy5pZCxcbiAgICAgICdkZXNjcmliZScsXG4gICAgXS5qb2luKCcvJyk7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm4ucmVxdWVzdDxEYXNoYm9hcmRNZXRhZGF0YT4odXJsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZGV0YWlscyBhYm91dCBkYXNoYm9hcmQgY29tcG9uZW50c1xuICAgKi9cbiAgY29tcG9uZW50cyhjb21wb25lbnRJZHM/OiBzdHJpbmcgfCBzdHJpbmdbXSk6IFByb21pc2U8RGFzaGJvYXJkUmVzdWx0PiB7XG4gICAgY29uc3QgdXJsID0gW1xuICAgICAgdGhpcy5fY29ubi5fYmFzZVVybCgpLFxuICAgICAgJ2FuYWx5dGljcycsXG4gICAgICAnZGFzaGJvYXJkcycsXG4gICAgICB0aGlzLmlkLFxuICAgIF0uam9pbignLycpO1xuICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgIGNvbXBvbmVudElkczogQXJyYXkuaXNBcnJheShjb21wb25lbnRJZHMpXG4gICAgICAgID8gY29tcG9uZW50SWRzXG4gICAgICAgIDogdHlwZW9mIGNvbXBvbmVudElkcyA9PT0gJ3N0cmluZydcbiAgICAgICAgPyBbY29tcG9uZW50SWRzXVxuICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLl9jb25uLnJlcXVlc3Q8RGFzaGJvYXJkUmVzdWx0Pih7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybCxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoY29uZmlnKSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZGFzaGJvYXJkIHN0YXR1c1xuICAgKi9cbiAgc3RhdHVzKCk6IFByb21pc2U8RGFzaGJvYXJkU3RhdHVzUmVzdWx0PiB7XG4gICAgY29uc3QgdXJsID0gW1xuICAgICAgdGhpcy5fY29ubi5fYmFzZVVybCgpLFxuICAgICAgJ2FuYWx5dGljcycsXG4gICAgICAnZGFzaGJvYXJkcycsXG4gICAgICB0aGlzLmlkLFxuICAgICAgJ3N0YXR1cycsXG4gICAgXS5qb2luKCcvJyk7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm4ucmVxdWVzdDxEYXNoYm9hcmRTdGF0dXNSZXN1bHQ+KHVybCk7XG4gIH1cblxuICAvKipcbiAgICogUmVmcmVzaCBhIGRhc2hib2FyZFxuICAgKi9cbiAgcmVmcmVzaCgpOiBQcm9taXNlPERhc2hib2FyZFJlZnJlc2hSZXN1bHQ+IHtcbiAgICBjb25zdCB1cmwgPSBbXG4gICAgICB0aGlzLl9jb25uLl9iYXNlVXJsKCksXG4gICAgICAnYW5hbHl0aWNzJyxcbiAgICAgICdkYXNoYm9hcmRzJyxcbiAgICAgIHRoaXMuaWQsXG4gICAgXS5qb2luKCcvJyk7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm4ucmVxdWVzdDxEYXNoYm9hcmRSZWZyZXNoUmVzdWx0Pih7XG4gICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgdXJsLFxuICAgICAgYm9keTogJycsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xvbmUgYSBkYXNoYm9hcmRcbiAgICovXG4gIGNsb25lKFxuICAgIGNvbmZpZzogeyBuYW1lOiBzdHJpbmc7IGZvbGRlcklkPzogc3RyaW5nIH0gfCBzdHJpbmcsXG4gICAgZm9sZGVySWQ/OiBzdHJpbmcsXG4gICk6IFByb21pc2U8RGFzaGJvYXJkTWV0YWRhdGE+IHtcbiAgICBjb25zdCB1cmwgPVxuICAgICAgW3RoaXMuX2Nvbm4uX2Jhc2VVcmwoKSwgJ2FuYWx5dGljcycsICdkYXNoYm9hcmRzJ10uam9pbignLycpICtcbiAgICAgICc/Y2xvbmVJZD0nICtcbiAgICAgIHRoaXMuaWQ7XG4gICAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25maWcgPSB7IG5hbWU6IGNvbmZpZywgZm9sZGVySWQgfTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm4ucmVxdWVzdDxEYXNoYm9hcmRNZXRhZGF0YT4oe1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICB1cmwsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGNvbmZpZyksXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveSBhIGRhc2hib2FyZFxuICAgKi9cbiAgZGVzdHJveSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB1cmwgPSBbXG4gICAgICB0aGlzLl9jb25uLl9iYXNlVXJsKCksXG4gICAgICAnYW5hbHl0aWNzJyxcbiAgICAgICdkYXNoYm9hcmRzJyxcbiAgICAgIHRoaXMuaWQsXG4gICAgXS5qb2luKCcvJyk7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm4ucmVxdWVzdDx2b2lkPih7IG1ldGhvZDogJ0RFTEVURScsIHVybCB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTeW5vbnltIG9mIEFuYWx5dGljc35EYXNoYm9hcmQjZGVzdHJveSgpXG4gICAqL1xuICBkZWxldGUgPSB0aGlzLmRlc3Ryb3k7XG5cbiAgLyoqXG4gICAqIFN5bm9ueW0gb2YgQW5hbHl0aWNzfkRhc2hib2FyZCNkZXN0cm95KClcbiAgICovXG4gIGRlbCA9IHRoaXMuZGVzdHJveTtcbn1cblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qKlxuICogQVBJIGNsYXNzIGZvciBBbmFseXRpY3MgQVBJXG4gKi9cbmV4cG9ydCBjbGFzcyBBbmFseXRpY3M8UyBleHRlbmRzIFNjaGVtYT4ge1xuICBfY29ubjogQ29ubmVjdGlvbjxTPjtcblxuICAvKipcbiAgICpcbiAgICovXG4gIGNvbnN0cnVjdG9yKGNvbm46IENvbm5lY3Rpb248Uz4pIHtcbiAgICB0aGlzLl9jb25uID0gY29ubjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcmVwb3J0IG9iamVjdCBvZiBBbmFseXRpY3MgQVBJXG4gICAqL1xuICByZXBvcnQoaWQ6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUmVwb3J0KHRoaXMuX2Nvbm4sIGlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcmVjZW50IHJlcG9ydCBsaXN0XG4gICAqL1xuICByZXBvcnRzKCkge1xuICAgIGNvbnN0IHVybCA9IFt0aGlzLl9jb25uLl9iYXNlVXJsKCksICdhbmFseXRpY3MnLCAncmVwb3J0cyddLmpvaW4oJy8nKTtcbiAgICByZXR1cm4gdGhpcy5fY29ubi5yZXF1ZXN0PFJlcG9ydEluZm9bXT4odXJsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZGFzaGJvYXJkIG9iamVjdCBvZiBBbmFseXRpY3MgQVBJXG4gICAqL1xuICBkYXNoYm9hcmQoaWQ6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgRGFzaGJvYXJkKHRoaXMuX2Nvbm4sIGlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcmVjZW50IGRhc2hib2FyZCBsaXN0XG4gICAqL1xuICBkYXNoYm9hcmRzKCkge1xuICAgIHZhciB1cmwgPSBbdGhpcy5fY29ubi5fYmFzZVVybCgpLCAnYW5hbHl0aWNzJywgJ2Rhc2hib2FyZHMnXS5qb2luKCcvJyk7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm4ucmVxdWVzdDxEYXNoYm9hcmRJbmZvW10+KHVybCk7XG4gIH1cbn1cblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKlxuICogUmVnaXN0ZXIgaG9vayBpbiBjb25uZWN0aW9uIGluc3RhbnRpYXRpb24gZm9yIGR5bmFtaWNhbGx5IGFkZGluZyB0aGlzIEFQSSBtb2R1bGUgZmVhdHVyZXNcbiAqL1xucmVnaXN0ZXJNb2R1bGUoJ2FuYWx5dGljcycsIChjb25uKSA9PiBuZXcgQW5hbHl0aWNzKGNvbm4pKTtcblxuZXhwb3J0IGRlZmF1bHQgQW5hbHl0aWNzO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUE7O0FBR0E7Ozs7OztBQXFDQTs7QUFDQTtBQUNBO0FBQ0E7QUFDTyxNQUFNQSxjQUFOLENBQXVDO0VBSzVDO0FBQ0Y7QUFDQTtFQUNFQyxXQUFXLENBQUNDLE1BQUQsRUFBb0JDLEVBQXBCLEVBQWdDO0lBQUE7SUFBQTtJQUFBO0lBQ3pDLEtBQUtDLE9BQUwsR0FBZUYsTUFBZjtJQUNBLEtBQUtHLEtBQUwsR0FBYUgsTUFBTSxDQUFDRyxLQUFwQjtJQUNBLEtBQUtGLEVBQUwsR0FBVUEsRUFBVjtFQUNEO0VBRUQ7QUFDRjtBQUNBOzs7RUFDRUcsUUFBUSxHQUFrQztJQUN4QyxNQUFNQyxHQUFHLEdBQUcsQ0FDVixLQUFLRixLQUFMLENBQVdHLFFBQVgsRUFEVSxFQUVWLFdBRlUsRUFHVixTQUhVLEVBSVYsS0FBS0osT0FBTCxDQUFhRCxFQUpILEVBS1YsV0FMVSxFQU1WLEtBQUtBLEVB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