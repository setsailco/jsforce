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

exports.default = exports.ProcessRule = exports.Process = exports.ApprovalProcess = void 0;

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/json/stringify"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));

require("core-js/modules/es.promise.js");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = _Object$keys(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context, _context2; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context = ownKeys(Object(source), !0)).call(_context, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context2 = ownKeys(Object(source))).call(_context2, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * @file Process class to manage/run workflow rule and approval process
 * @author Shinichi Tomita <shinichi.tomita@gmail.com>
 */

/**
 *
 */

/**
 *
 */

/**
 * A class which manages process (workflow) rules
 */
class ProcessRule {
  /**
   *
   */
  constructor(conn) {
    (0, _defineProperty2.default)(this, "_conn", void 0);
    this._conn = conn;
  }
  /**
   * Get all process rule definitions registered to sobjects
   */


  async list() {
    const res = await this._conn.request('/process/rules');
    return res.rules;
  }
  /**
   * Trigger process rule for given entities
   */


  trigger(contextIds) {
    const contextIds_ = (0, _isArray.default)(contextIds) ? contextIds : [contextIds]; // https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_process_rules_trigger.htm

    return this._conn.request({
      method: 'POST',
      url: '/process/rules/',
      body: (0, _stringify.default)({
        contextIds: contextIds_
      }),
      headers: {
        'content-type': 'application/json'
      }
    });
  }

}
/**
 *
 */


exports.ProcessRule = ProcessRule;

/**
 * A class which manages approval processes
 */
class ApprovalProcess {
  /**
   *
   */
  constructor(conn) {
    (0, _defineProperty2.default)(this, "_conn", void 0);
    this._conn = conn;
  }
  /**
   * Get all approval process definitions registered to sobjects
   */


  async list() {
    const res = await this._conn.request('/process/approvals');
    return res.approvals;
  }
  /**
   * Send bulk requests for approval process
   */


  request(requests) {
    const requests_ = (0, _map.default)(requests).call(requests, req => '_request' in req ? req._request : req);
    return this._conn.request({
      method: 'POST',
      url: '/process/approvals',
      headers: {
        'content-type': 'application/json'
      },
      body: (0, _stringify.default)({
        requests: requests_
      })
    });
  }
  /**
   * Create approval process request
   *
   * @private
   */


  _createRequest(actionType, contextId, comments, options = {}) {
    return new ApprovalProcessRequest(this, _objectSpread({
      actionType,
      contextId,
      comments
    }, options));
  }
  /**
   * Submit approval request for an item
   */


  submit(contextId, comments, options) {
    return this._createRequest('Submit', contextId, comments, options);
  }
  /**
   * Approve approval request for an item
   */


  approve(workitemId, comments, options = {}) {
    return this._createRequest('Approve', workitemId, comments, options);
  }
  /**
   * Reject approval request for an item
   */


  reject(workitemId, comments, options = {}) {
    return this._createRequest('Reject', workitemId, comments, options);
  }

}
/**
 *
 */


exports.ApprovalProcess = ApprovalProcess;

/**
 * A class representing approval process request
 */
class ApprovalProcessRequest {
  constructor(process, request) {
    (0, _defineProperty2.default)(this, "_process", void 0);
    (0, _defineProperty2.default)(this, "_request", void 0);
    (0, _defineProperty2.default)(this, "_promise", void 0);
    this._process = process;
    this._request = request;
  }
  /**
   * Promise/A+ interface
   * http://promises-aplus.github.io/promises-spec/
   */


  then(onResolve, onReject) {
    if (!this._promise) {
      this._promise = this._process.request([this]).then(rets => rets[0]);
    }

    this._promise.then(onResolve, onReject);
  }

}
/**
 * A class which manages process rules and approval processes
 */


class Process {
  /**
   *
   */
  constructor(conn) {
    (0, _defineProperty2.default)(this, "rule", void 0);
    (0, _defineProperty2.default)(this, "approval", void 0);
    this.rule = new ProcessRule(conn);
    this.approval = new ApprovalProcess(conn);
  }

}

exports.Process = Process;
var _default = Process;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9jZXNzUnVsZSIsImNvbnN0cnVjdG9yIiwiY29ubiIsIl9jb25uIiwibGlzdCIsInJlcyIsInJlcXVlc3QiLCJydWxlcyIsInRyaWdnZXIiLCJjb250ZXh0SWRzIiwiY29udGV4dElkc18iLCJtZXRob2QiLCJ1cmwiLCJib2R5IiwiaGVhZGVycyIsIkFwcHJvdmFsUHJvY2VzcyIsImFwcHJvdmFscyIsInJlcXVlc3RzIiwicmVxdWVzdHNfIiwicmVxIiwiX3JlcXVlc3QiLCJfY3JlYXRlUmVxdWVzdCIsImFjdGlvblR5cGUiLCJjb250ZXh0SWQiLCJjb21tZW50cyIsIm9wdGlvbnMiLCJBcHByb3ZhbFByb2Nlc3NSZXF1ZXN0Iiwic3VibWl0IiwiYXBwcm92ZSIsIndvcmtpdGVtSWQiLCJyZWplY3QiLCJwcm9jZXNzIiwiX3Byb2Nlc3MiLCJ0aGVuIiwib25SZXNvbHZlIiwib25SZWplY3QiLCJfcHJvbWlzZSIsInJldHMiLCJQcm9jZXNzIiwicnVsZSIsImFwcHJvdmFsIl0sInNvdXJjZXMiOlsiLi4vc3JjL3Byb2Nlc3MudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBQcm9jZXNzIGNsYXNzIHRvIG1hbmFnZS9ydW4gd29ya2Zsb3cgcnVsZSBhbmQgYXBwcm92YWwgcHJvY2Vzc1xuICogQGF1dGhvciBTaGluaWNoaSBUb21pdGEgPHNoaW5pY2hpLnRvbWl0YUBnbWFpbC5jb20+XG4gKi9cbmltcG9ydCBDb25uZWN0aW9uIGZyb20gJy4vY29ubmVjdGlvbic7XG5pbXBvcnQgeyBQcm9jZXNzUnVsZXMsIFNjaGVtYSB9IGZyb20gJy4vdHlwZXMnO1xuXG4vKipcbiAqXG4gKi9cbmV4cG9ydCB0eXBlIFByb2Nlc3NSdWxlRGVmaW5pdGlvbiA9IHtcbiAgaWQ6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICBvYmplY3Q6IHN0cmluZztcbn07XG5cbi8qKlxuICpcbiAqL1xuZXhwb3J0IHR5cGUgUHJvY2Vzc1J1bGVUcmlnZ2VyUmVzdWx0ID1cbiAgfCB7XG4gICAgICBzdWNjZXNzOiB0cnVlO1xuICAgIH1cbiAgfCB7XG4gICAgICBzdWNjZXNzOiBmYWxzZTtcbiAgICAgIGVycm9yczogQXJyYXk8eyBtZXNzYWdlOiBzdHJpbmcgfT47XG4gICAgfTtcblxuLyoqXG4gKiBBIGNsYXNzIHdoaWNoIG1hbmFnZXMgcHJvY2VzcyAod29ya2Zsb3cpIHJ1bGVzXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm9jZXNzUnVsZTxTIGV4dGVuZHMgU2NoZW1hPiB7XG4gIF9jb25uOiBDb25uZWN0aW9uPFM+O1xuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgY29uc3RydWN0b3IoY29ubjogQ29ubmVjdGlvbjxTPikge1xuICAgIHRoaXMuX2Nvbm4gPSBjb25uO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgcHJvY2VzcyBydWxlIGRlZmluaXRpb25zIHJlZ2lzdGVyZWQgdG8gc29iamVjdHNcbiAgICovXG4gIGFzeW5jIGxpc3QoKSB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgdGhpcy5fY29ubi5yZXF1ZXN0PHsgcnVsZXM6IFByb2Nlc3NSdWxlcyB9PihcbiAgICAgICcvcHJvY2Vzcy9ydWxlcycsXG4gICAgKTtcbiAgICByZXR1cm4gcmVzLnJ1bGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgcHJvY2VzcyBydWxlIGZvciBnaXZlbiBlbnRpdGllc1xuICAgKi9cbiAgdHJpZ2dlcihjb250ZXh0SWRzOiBzdHJpbmcgfCBzdHJpbmdbXSkge1xuICAgIGNvbnN0IGNvbnRleHRJZHNfID0gQXJyYXkuaXNBcnJheShjb250ZXh0SWRzKSA/IGNvbnRleHRJZHMgOiBbY29udGV4dElkc107XG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIuc2FsZXNmb3JjZS5jb20vZG9jcy9hdGxhcy5lbi11cy5hcGlfcmVzdC5tZXRhL2FwaV9yZXN0L2RvbWVfcHJvY2Vzc19ydWxlc190cmlnZ2VyLmh0bVxuICAgIHJldHVybiB0aGlzLl9jb25uLnJlcXVlc3Q8XG4gICAgICB8IHtcbiAgICAgICAgICBlcnJvcnM6IG51bGw7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfCB7XG4gICAgICAgICAgLy8gRG9jcyBkb24ndCBzYXkgd2hhdCB0aGUgdHJpZ2dlciBlcnJvcnMgYXJlXG4gICAgICAgICAgZXJyb3JzOiBhbnlbXTtcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZTtcbiAgICAgICAgfVxuICAgID4oe1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICB1cmw6ICcvcHJvY2Vzcy9ydWxlcy8nLFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBjb250ZXh0SWRzOiBjb250ZXh0SWRzXyxcbiAgICAgIH0pLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqXG4gKi9cbmV4cG9ydCB0eXBlIEFwcHJvdmFsUHJvY2Vzc0RlZmluaXRpb24gPSB7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgb2JqZWN0OiBzdHJpbmc7XG4gIHNvcnRPcmRlcjogbnVtYmVyO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nIHwgbnVsbDtcbn07XG5cbi8qKlxuICpcbiAqL1xuZXhwb3J0IHR5cGUgQXBwcm92YWxQcm9jZXNzUmVxdWVzdFJlc3VsdCA9XG4gIHwge1xuICAgICAgc3VjY2VzczogdHJ1ZTtcbiAgICAgIGFjdG9ySWRzOiBzdHJpbmdbXTtcbiAgICAgIGVudGl0eUlkOiBzdHJpbmc7XG4gICAgICBpbnN0YW5jZUlkOiBzdHJpbmc7XG4gICAgICBpbnN0YW5jZVN0YXR1czogc3RyaW5nO1xuICAgICAgbmV3V29ya0l0ZW1JZHM6IHN0cmluZ1tdO1xuICAgIH1cbiAgfCB7XG4gICAgICBzdWNjZXNzOiBmYWxzZTtcbiAgICAgIGVycm9yczogQXJyYXk8eyBtZXNzYWdlOiBzdHJpbmcgfT47XG4gICAgfTtcblxuLyoqXG4gKlxuICovXG5leHBvcnQgdHlwZSBBcHByb3ZhbFByb2Nlc3NBY3Rpb25PcHRpb25zID0ge1xuICBwcm9jZXNzRGVmaW5pdGlvbk5hbWVPcklkPzogc3RyaW5nO1xuICBza2lwRW50cnlDcml0ZXJpYT86IGJvb2xlYW47XG59O1xuXG4vKipcbiAqIEEgY2xhc3Mgd2hpY2ggbWFuYWdlcyBhcHByb3ZhbCBwcm9jZXNzZXNcbiAqL1xuZXhwb3J0IGNsYXNzIEFwcHJvdmFsUHJvY2VzczxTIGV4dGVuZHMgU2NoZW1hPiB7XG4gIF9jb25uOiBDb25uZWN0aW9uPFM+O1xuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgY29uc3RydWN0b3IoY29ubjogQ29ubmVjdGlvbjxTPikge1xuICAgIHRoaXMuX2Nvbm4gPSBjb25uO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgYXBwcm92YWwgcHJvY2VzcyBkZWZpbml0aW9ucyByZWdpc3RlcmVkIHRvIHNvYmplY3RzXG4gICAqL1xuICBhc3luYyBsaXN0KCkge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuX2Nvbm4ucmVxdWVzdDx7XG4gICAgICBhcHByb3ZhbHM6IHsgW2luZGV4OiBzdHJpbmddOiBBcHByb3ZhbFByb2Nlc3NEZWZpbml0aW9uIH07XG4gICAgfT4oJy9wcm9jZXNzL2FwcHJvdmFscycpO1xuICAgIHJldHVybiByZXMuYXBwcm92YWxzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgYnVsayByZXF1ZXN0cyBmb3IgYXBwcm92YWwgcHJvY2Vzc1xuICAgKi9cbiAgcmVxdWVzdChcbiAgICByZXF1ZXN0czogQXJyYXk8QXBwcm92YWxQcm9jZXNzUmVxdWVzdENvbmZpZyB8IEFwcHJvdmFsUHJvY2Vzc1JlcXVlc3Q8Uz4+LFxuICApIHtcbiAgICBjb25zdCByZXF1ZXN0c18gPSByZXF1ZXN0cy5tYXAoKHJlcSkgPT5cbiAgICAgICdfcmVxdWVzdCcgaW4gcmVxID8gcmVxLl9yZXF1ZXN0IDogcmVxLFxuICAgICk7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm4ucmVxdWVzdDxBcHByb3ZhbFByb2Nlc3NSZXF1ZXN0UmVzdWx0W10+KHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgdXJsOiAnL3Byb2Nlc3MvYXBwcm92YWxzJyxcbiAgICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyByZXF1ZXN0czogcmVxdWVzdHNfIH0pLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhcHByb3ZhbCBwcm9jZXNzIHJlcXVlc3RcbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9jcmVhdGVSZXF1ZXN0KFxuICAgIGFjdGlvblR5cGU6ICdTdWJtaXQnIHwgJ0FwcHJvdmUnIHwgJ1JlamVjdCcsXG4gICAgY29udGV4dElkOiBzdHJpbmcsXG4gICAgY29tbWVudHM/OiBzdHJpbmcsXG4gICAgb3B0aW9uczogQXBwcm92YWxQcm9jZXNzQWN0aW9uT3B0aW9ucyA9IHt9LFxuICApIHtcbiAgICByZXR1cm4gbmV3IEFwcHJvdmFsUHJvY2Vzc1JlcXVlc3QodGhpcywge1xuICAgICAgYWN0aW9uVHlwZSxcbiAgICAgIGNvbnRleHRJZCxcbiAgICAgIGNvbW1lbnRzLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJtaXQgYXBwcm92YWwgcmVxdWVzdCBmb3IgYW4gaXRlbVxuICAgKi9cbiAgc3VibWl0KFxuICAgIGNvbnRleHRJZDogc3RyaW5nLFxuICAgIGNvbW1lbnRzPzogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiBBcHByb3ZhbFByb2Nlc3NBY3Rpb25PcHRpb25zLFxuICApIHtcbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlUmVxdWVzdCgnU3VibWl0JywgY29udGV4dElkLCBjb21tZW50cywgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogQXBwcm92ZSBhcHByb3ZhbCByZXF1ZXN0IGZvciBhbiBpdGVtXG4gICAqL1xuICBhcHByb3ZlKFxuICAgIHdvcmtpdGVtSWQ6IHN0cmluZyxcbiAgICBjb21tZW50cz86IHN0cmluZyxcbiAgICBvcHRpb25zOiBBcHByb3ZhbFByb2Nlc3NBY3Rpb25PcHRpb25zID0ge30sXG4gICkge1xuICAgIHJldHVybiB0aGlzLl9jcmVhdGVSZXF1ZXN0KCdBcHByb3ZlJywgd29ya2l0ZW1JZCwgY29tbWVudHMsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlamVjdCBhcHByb3ZhbCByZXF1ZXN0IGZvciBhbiBpdGVtXG4gICAqL1xuICByZWplY3QoXG4gICAgd29ya2l0ZW1JZDogc3RyaW5nLFxuICAgIGNvbW1lbnRzPzogc3RyaW5nLFxuICAgIG9wdGlvbnM6IEFwcHJvdmFsUHJvY2Vzc0FjdGlvbk9wdGlvbnMgPSB7fSxcbiAgKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NyZWF0ZVJlcXVlc3QoJ1JlamVjdCcsIHdvcmtpdGVtSWQsIGNvbW1lbnRzLCBvcHRpb25zKTtcbiAgfVxufVxuXG4vKipcbiAqXG4gKi9cbmV4cG9ydCB0eXBlIEFwcHJvdmFsUHJvY2Vzc1JlcXVlc3RDb25maWcgPSB7XG4gIGFjdGlvblR5cGU6ICdTdWJtaXQnIHwgJ0FwcHJvdmUnIHwgJ1JlamVjdCc7XG4gIGNvbnRleHRJZDogc3RyaW5nO1xuICBjb21tZW50cz86IHN0cmluZztcbiAgbmV4dEFwcHJvdmVySWRzPzogc3RyaW5nW107XG4gIHByb2Nlc3NEZWZpbml0aW9uTmFtZU9ySWQ/OiBzdHJpbmc7XG4gIHNraXBFbnRyeUNyaXRlcmlhPzogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogQSBjbGFzcyByZXByZXNlbnRpbmcgYXBwcm92YWwgcHJvY2VzcyByZXF1ZXN0XG4gKi9cbmNsYXNzIEFwcHJvdmFsUHJvY2Vzc1JlcXVlc3Q8UyBleHRlbmRzIFNjaGVtYT4ge1xuICBfcHJvY2VzczogQXBwcm92YWxQcm9jZXNzPFM+O1xuICBfcmVxdWVzdDogQXBwcm92YWxQcm9jZXNzUmVxdWVzdENvbmZpZztcbiAgX3Byb21pc2U6IFByb21pc2U8QXBwcm92YWxQcm9jZXNzUmVxdWVzdFJlc3VsdD4gfCB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvY2VzczogQXBwcm92YWxQcm9jZXNzPFM+LFxuICAgIHJlcXVlc3Q6IEFwcHJvdmFsUHJvY2Vzc1JlcXVlc3RDb25maWcsXG4gICkge1xuICAgIHRoaXMuX3Byb2Nlc3MgPSBwcm9jZXNzO1xuICAgIHRoaXMuX3JlcXVlc3QgPSByZXF1ZXN0O1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21pc2UvQSsgaW50ZXJmYWNlXG4gICAqIGh0dHA6Ly9wcm9taXNlcy1hcGx1cy5naXRodWIuaW8vcHJvbWlzZXMtc3BlYy9cbiAgICovXG4gIHRoZW48VT4oXG4gICAgb25SZXNvbHZlPzogKFxuICAgICAgcmVzOiBBcHByb3ZhbFByb2Nlc3NSZXF1ZXN0UmVzdWx0LFxuICAgICkgPT4gVSB8IFByb21pc2VMaWtlPFU+IHwgbnVsbCxcbiAgICBvblJlamVjdD86IChlcnI6IGFueSkgPT4gVSB8IFByb21pc2VMaWtlPFU+IHwgbnVsbCxcbiAgKSB7XG4gICAgaWYgKCF0aGlzLl9wcm9taXNlKSB7XG4gICAgICB0aGlzLl9wcm9taXNlID0gdGhpcy5fcHJvY2Vzc1xuICAgICAgICAucmVxdWVzdChbdGhpc10pXG4gICAgICAgIC50aGVuKChyZXRzOiBhbnkpID0+IHJldHNbMF0pO1xuICAgIH1cbiAgICB0aGlzLl9wcm9taXNlLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGNsYXNzIHdoaWNoIG1hbmFnZXMgcHJvY2VzcyBydWxlcyBhbmQgYXBwcm92YWwgcHJvY2Vzc2VzXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm9jZXNzPFMgZXh0ZW5kcyBTY2hlbWE+IHtcbiAgcnVsZTogUHJvY2Vzc1J1bGU8Uz47XG4gIGFwcHJvdmFsOiBBcHByb3ZhbFByb2Nlc3M8Uz47XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb25uOiBDb25uZWN0aW9uPFM+KSB7XG4gICAgdGhpcy5ydWxlID0gbmV3IFByb2Nlc3NSdWxlKGNvbm4pO1xuICAgIHRoaXMuYXBwcm92YWwgPSBuZXcgQXBwcm92YWxQcm9jZXNzKGNvbm4pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFByb2Nlc3M7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTs7QUFJQTtBQUNBO0FBQ0E7O0FBT0E7QUFDQTtBQUNBOztBQVVBO0FBQ0E7QUFDQTtBQUNPLE1BQU1BLFdBQU4sQ0FBb0M7RUFHekM7QUFDRjtBQUNBO0VBQ0VDLFdBQVcsQ0FBQ0MsSUFBRCxFQUFzQjtJQUFBO0lBQy9CLEtBQUtDLEtBQUwsR0FBYUQsSUFBYjtFQUNEO0VBRUQ7QUFDRjtBQUNBOzs7RUFDWSxNQUFKRSxJQUFJLEdBQUc7SUFDWCxNQUFNQyxHQUFHLEdBQUcsTUFBTSxLQUFLRixLQUFMLENBQVdHLE9BQVgsQ0FDaEIsZ0JBRGdCLENBQWxCO0lBR0EsT0FBT0QsR0FBRyxDQUFDRSxLQUFYO0VBQ0Q7RUFFRDtBQUNGO0FBQ0E7OztFQUNFQyxPQUFPLENBQUNDLFVBQUQsRUFBZ0M7SUFDckMsTUFBTUMsV0FBVyxHQUFHLHNCQUFjRCxVQUFkLElBQTRCQSxVQUE1QixHQUF5QyxDQUFDQSxVQUFELENBQTdELENBRHFDLENBRXJDOztJQUNBLE9BQU8sS0FBS04sS0FBTCxDQUFXRyxPQUFYLENBVUw7TUFDQUssTUFBTSxFQUFFLE1BRFI7TUFFQUMsR0FBRyxFQUFFLGlCQUZMO01BR0FDLElBQUksRUFBRSx3QkFBZTtRQUNuQkosVUFBVSxFQUFFQztNQURPLENBQWYsQ0FITjtNQU1BSSxPQUFPLEVBQUU7UUFDUCxnQkFBZ0I7TUFEVDtJQU5ULENBVkssQ0FBUDtFQW9CRDs7QUE5Q3dDO0FBaUQzQztBQUNB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