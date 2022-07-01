"use strict";

var _Object$keys2 = require("@babel/runtime-corejs3/core-js-stable/object/keys");

var _Object$getOwnPropertySymbols = require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-symbols");

var _filterInstanceProperty = require("@babel/runtime-corejs3/core-js-stable/instance/filter");

var _Object$getOwnPropertyDescriptor = require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-descriptor");

var _forEachInstanceProperty2 = require("@babel/runtime-corejs3/core-js-stable/instance/for-each");

var _Object$getOwnPropertyDescriptors = require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-descriptors");

var _Object$defineProperties = require("@babel/runtime-corejs3/core-js-stable/object/define-properties");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = exports.Resource = exports.Chatter = void 0;

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.promise.js");

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/index-of"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/json/stringify"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/for-each"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _jsforce = require("../jsforce");

var _function = require("../util/function");

function ownKeys(object, enumerableOnly) { var keys = _Object$keys2(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context3, _context4; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty2(_context3 = ownKeys(Object(source), !0)).call(_context3, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty2(_context4 = ownKeys(Object(source))).call(_context4, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

/*--------------------------------------------*/

/**
 * A class representing chatter API request
 */
class Request {
  constructor(chatter, request) {
    (0, _defineProperty2.default)(this, "_chatter", void 0);
    (0, _defineProperty2.default)(this, "_request", void 0);
    (0, _defineProperty2.default)(this, "_promise", void 0);
    this._chatter = chatter;
    this._request = request;
  }
  /**
   * Retrieve parameters in batch request form
   */


  batchParams() {
    const {
      method,
      url,
      body
    } = this._request;
    return _objectSpread({
      method,
      url: this._chatter._normalizeUrl(url)
    }, typeof body !== 'undefined' ? {
      richInput: body
    } : {});
  }
  /**
   * Retrieve parameters in batch request form
   *
   * @method Chatter~Request#promise
   * @returns {Promise.<Chatter~RequestResult>}
   */


  promise() {
    return this._promise || (this._promise = this._chatter._request(this._request));
  }
  /**
   * Returns Node.js Stream object for request
   *
   * @method Chatter~Request#stream
   * @returns {stream.Stream}
   */


  stream() {
    return this._chatter._request(this._request).stream();
  }
  /**
   * Promise/A+ interface
   * http://promises-aplus.github.io/promises-spec/
   *
   * Delegate to deferred promise, return promise instance for batch result
   */


  then(onResolve, onReject) {
    return this.promise().then(onResolve, onReject);
  }

}

function apppendQueryParamsToUrl(url, queryParams) {
  if (queryParams) {
    var _context;

    const qstring = (0, _map.default)(_context = (0, _keys.default)(queryParams)).call(_context, name => {
      var _queryParams$name;

      return `${name}=${encodeURIComponent(String((_queryParams$name = queryParams[name]) !== null && _queryParams$name !== void 0 ? _queryParams$name : ''))}`;
    }).join('&');
    url += ((0, _indexOf.default)(url).call(url, '?') > 0 ? '&' : '?') + qstring;
  }

  return url;
}
/*------------------------------*/


class Resource extends Request {
  /**
   *
   */
  constructor(chatter, url, queryParams) {
    super(chatter, {
      method: 'GET',
      url: apppendQueryParamsToUrl(url, queryParams)
    });
    (0, _defineProperty2.default)(this, "_url", void 0);
    (0, _defineProperty2.default)(this, "delete", this.destroy);
    (0, _defineProperty2.default)(this, "del", this.destroy);
    this._url = this._request.url;
  }
  /**
   * Create a new resource
   */


  create(data) {
    return this._chatter.request({
      method: 'POST',
      url: this._url,
      body: data
    });
  }
  /**
   * Retrieve resource content
   */


  retrieve() {
    return this._chatter.request({
      method: 'GET',
      url: this._url
    });
  }
  /**
   * Update specified resource
   */


  update(data) {
    return this._chatter.request({
      method: 'POST',
      url: this._url,
      body: data
    });
  }
  /**
   * Delete specified resource
   */


  destroy() {
    return this._chatter.request({
      method: 'DELETE',
      url: this._url
    });
  }
  /**
   * Synonym of Resource#destroy()
   */


}
/*------------------------------*/

/**
 * API class for Chatter REST API call
 */


exports.Resource = Resource;

class Chatter {
  /**
   *
   */
  constructor(conn) {
    (0, _defineProperty2.default)(this, "_conn", void 0);
    this._conn = conn;
  }
  /**
   * Sending request to API endpoint
   * @private
   */


  _request(req_) {
    const {
      method,
      url: url_,
      headers: headers_,
      body: body_
    } = req_;
    let headers = headers_ !== null && headers_ !== void 0 ? headers_ : {};
    let body;

    if (/^(put|post|patch)$/i.test(method)) {
      if ((0, _function.isObject)(body_)) {
        headers = _objectSpread(_objectSpread({}, headers_), {}, {
          'Content-Type': 'application/json'
        });
        body = (0, _stringify.default)(body_);
      } else {
        body = body_;
      }
    }

    const url = this._normalizeUrl(url_);

    return this._conn.request({
      method,
      url,
      headers,
      body
    });
  }
  /**
   * Convert path to site root relative url
   * @private
   */


  _normalizeUrl(url) {
    if ((0, _indexOf.default)(url).call(url, '/chatter/') === 0 || (0, _indexOf.default)(url).call(url, '/connect/') === 0) {
      return '/services/data/v' + this._conn.version + url;
    } else if (/^\/v[\d]+\.[\d]+\//.test(url)) {
      return '/services/data' + url;
    } else if ((0, _indexOf.default)(url).call(url, '/services/') !== 0 && url[0] === '/') {
      return '/services/data/v' + this._conn.version + '/chatter' + url;
    } else {
      return url;
    }
  }
  /**
   * Make a request for chatter API resource
   */


  request(req) {
    return new Request(this, req);
  }
  /**
   * Make a resource request to chatter API
   */


  resource(url, queryParams) {
    return new Resource(this, url, queryParams);
  }
  /**
   * Make a batch request to chatter API
   */


  async batch(requests) {
    var _context2;

    const deferreds = (0, _map.default)(requests).call(requests, request => {
      const deferred = defer();
      request._promise = deferred.promise;
      return deferred;
    });
    const res = await this.request({
      method: 'POST',
      url: this._normalizeUrl('/connect/batch'),
      body: {
        batchRequests: (0, _map.default)(requests).call(requests, request => request.batchParams())
      }
    });
    (0, _forEach.default)(_context2 = res.results).call(_context2, (result, i) => {
      const deferred = deferreds[i];

      if (result.statusCode >= 400) {
        deferred.reject(result.result);
      } else {
        deferred.resolve(result.result);
      }
    });
    return res;
  }

}

exports.Chatter = Chatter;

function defer() {
  let resolve_ = () => {};

  let reject_ = () => {};

  const promise = new _promise.default((resolve, reject) => {
    resolve_ = resolve;
    reject_ = reject;
  });
  return {
    promise,
    resolve: resolve_,
    reject: reject_
  };
}
/*--------------------------------------------*/

/*
 * Register hook in connection instantiation for dynamically adding this API module features
 */


(0, _jsforce.registerModule)('chatter', conn => new Chatter(conn));
var _default = Chatter;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZXF1ZXN0IiwiY29uc3RydWN0b3IiLCJjaGF0dGVyIiwicmVxdWVzdCIsIl9jaGF0dGVyIiwiX3JlcXVlc3QiLCJiYXRjaFBhcmFtcyIsIm1ldGhvZCIsInVybCIsImJvZHkiLCJfbm9ybWFsaXplVXJsIiwicmljaElucHV0IiwicHJvbWlzZSIsIl9wcm9taXNlIiwic3RyZWFtIiwidGhlbiIsIm9uUmVzb2x2ZSIsIm9uUmVqZWN0IiwiYXBwcGVuZFF1ZXJ5UGFyYW1zVG9VcmwiLCJxdWVyeVBhcmFtcyIsInFzdHJpbmciLCJuYW1lIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiU3RyaW5nIiwiam9pbiIsIlJlc291cmNlIiwiZGVzdHJveSIsIl91cmwiLCJjcmVhdGUiLCJkYXRhIiwicmV0cmlldmUiLCJ1cGRhdGUiLCJDaGF0dGVyIiwiY29ubiIsIl9jb25uIiwicmVxXyIsInVybF8iLCJoZWFkZXJzIiwiaGVhZGVyc18iLCJib2R5XyIsInRlc3QiLCJpc09iamVjdCIsInZlcnNpb24iLCJyZXEiLCJyZXNvdXJjZSIsImJhdGNoIiwicmVxdWVzdHMiLCJkZWZlcnJlZHMiLCJkZWZlcnJlZCIsImRlZmVyIiwicmVzIiwiYmF0Y2hSZXF1ZXN0cyIsInJlc3VsdHMiLCJyZXN1bHQiLCJpIiwic3RhdHVzQ29kZSIsInJlamVjdCIsInJlc29sdmUiLCJyZXNvbHZlXyIsInJlamVjdF8iLCJyZWdpc3Rlck1vZHVsZSJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGkvY2hhdHRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIE1hbmFnZXMgU2FsZXNmb3JjZSBDaGF0dGVyIFJFU1QgQVBJIGNhbGxzXG4gKiBAYXV0aG9yIFNoaW5pY2hpIFRvbWl0YSA8c2hpbmljaGkudG9taXRhQGdtYWlsLmNvbT5cbiAqL1xuaW1wb3J0IHsgcmVnaXN0ZXJNb2R1bGUgfSBmcm9tICcuLi9qc2ZvcmNlJztcbmltcG9ydCBDb25uZWN0aW9uIGZyb20gJy4uL2Nvbm5lY3Rpb24nO1xuaW1wb3J0IHsgSHR0cFJlcXVlc3QsIFNjaGVtYSB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IGlzT2JqZWN0IH0gZnJvbSAnLi4vdXRpbC9mdW5jdGlvbic7XG5cbi8qKlxuICpcbiAqL1xuZXhwb3J0IHR5cGUgQ2hhdHRlclJlcXVlc3RQYXJhbXMgPSBPbWl0PEh0dHBSZXF1ZXN0LCAnYm9keSc+ICYge1xuICBib2R5Pzogc3RyaW5nIHwgb2JqZWN0IHwgbnVsbDtcbn07XG5cbmV4cG9ydCB0eXBlIEJhdGNoUmVxdWVzdFBhcmFtcyA9IHtcbiAgbWV0aG9kOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICByaWNoSW5wdXQ/OiBhbnk7XG59O1xuXG50eXBlIEJhdGNoUmVxdWVzdFR1cHBsZTxTIGV4dGVuZHMgU2NoZW1hLCBSVCBleHRlbmRzIGFueVtdPiA9IHtcbiAgW0sgaW4ga2V5b2YgUlRdOiBSZXF1ZXN0PFMsIFJUW0tdPjtcbn07XG5cbnR5cGUgQmF0Y2hSZXN1bHRUdXBwbGU8UlQgZXh0ZW5kcyBhbnlbXT4gPSB7XG4gIFtLIGluIGtleW9mIFJUXToge1xuICAgIHN0YXR1c0NvZGU6IG51bWJlcjtcbiAgICByZXN1bHQ6IFJUW0tdO1xuICB9O1xufTtcblxuZXhwb3J0IHR5cGUgQmF0Y2hSZXNwb25zZTxSVCBleHRlbmRzIGFueVtdPiA9IHtcbiAgaGFzRXJyb3JzOiBib29sZWFuO1xuICByZXN1bHRzOiBCYXRjaFJlc3VsdFR1cHBsZTxSVD47XG59O1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qKlxuICogQSBjbGFzcyByZXByZXNlbnRpbmcgY2hhdHRlciBBUEkgcmVxdWVzdFxuICovXG5jbGFzcyBSZXF1ZXN0PFMgZXh0ZW5kcyBTY2hlbWEsIFI+IHtcbiAgX2NoYXR0ZXI6IENoYXR0ZXI8Uz47XG4gIF9yZXF1ZXN0OiBDaGF0dGVyUmVxdWVzdFBhcmFtcztcbiAgX3Byb21pc2U6IFByb21pc2U8Uj4gfCB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IoY2hhdHRlcjogQ2hhdHRlcjxTPiwgcmVxdWVzdDogQ2hhdHRlclJlcXVlc3RQYXJhbXMpIHtcbiAgICB0aGlzLl9jaGF0dGVyID0gY2hhdHRlcjtcbiAgICB0aGlzLl9yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSBwYXJhbWV0ZXJzIGluIGJhdGNoIHJlcXVlc3QgZm9ybVxuICAgKi9cbiAgYmF0Y2hQYXJhbXMoKSB7XG4gICAgY29uc3QgeyBtZXRob2QsIHVybCwgYm9keSB9ID0gdGhpcy5fcmVxdWVzdDtcbiAgICByZXR1cm4ge1xuICAgICAgbWV0aG9kLFxuICAgICAgdXJsOiB0aGlzLl9jaGF0dGVyLl9ub3JtYWxpemVVcmwodXJsKSxcbiAgICAgIC4uLih0eXBlb2YgYm9keSAhPT0gJ3VuZGVmaW5lZCcgPyB7IHJpY2hJbnB1dDogYm9keSB9IDoge30pLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmUgcGFyYW1ldGVycyBpbiBiYXRjaCByZXF1ZXN0IGZvcm1cbiAgICpcbiAgICogQG1ldGhvZCBDaGF0dGVyflJlcXVlc3QjcHJvbWlzZVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZS48Q2hhdHRlcn5SZXF1ZXN0UmVzdWx0Pn1cbiAgICovXG4gIHByb21pc2UoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuX3Byb21pc2UgfHwgKHRoaXMuX3Byb21pc2UgPSB0aGlzLl9jaGF0dGVyLl9yZXF1ZXN0KHRoaXMuX3JlcXVlc3QpKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBOb2RlLmpzIFN0cmVhbSBvYmplY3QgZm9yIHJlcXVlc3RcbiAgICpcbiAgICogQG1ldGhvZCBDaGF0dGVyflJlcXVlc3Qjc3RyZWFtXG4gICAqIEByZXR1cm5zIHtzdHJlYW0uU3RyZWFtfVxuICAgKi9cbiAgc3RyZWFtKCkge1xuICAgIHJldHVybiB0aGlzLl9jaGF0dGVyLl9yZXF1ZXN0PFI+KHRoaXMuX3JlcXVlc3QpLnN0cmVhbSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21pc2UvQSsgaW50ZXJmYWNlXG4gICAqIGh0dHA6Ly9wcm9taXNlcy1hcGx1cy5naXRodWIuaW8vcHJvbWlzZXMtc3BlYy9cbiAgICpcbiAgICogRGVsZWdhdGUgdG8gZGVmZXJyZWQgcHJvbWlzZSwgcmV0dXJuIHByb21pc2UgaW5zdGFuY2UgZm9yIGJhdGNoIHJlc3VsdFxuICAgKi9cbiAgdGhlbjxVPihcbiAgICBvblJlc29sdmU/OiAodmFsdWU6IFIpID0+IFUgfCBQcm9taXNlTGlrZTxVPixcbiAgICBvblJlamVjdD86IChlOiBhbnkpID0+IFUgfCBQcm9taXNlTGlrZTxVPixcbiAgKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvbWlzZSgpLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwcGVuZFF1ZXJ5UGFyYW1zVG9VcmwoXG4gIHVybDogc3RyaW5nLFxuICBxdWVyeVBhcmFtcz86IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBudWxsIH0gfCBudWxsLFxuKSB7XG4gIGlmIChxdWVyeVBhcmFtcykge1xuICAgIGNvbnN0IHFzdHJpbmcgPSBPYmplY3Qua2V5cyhxdWVyeVBhcmFtcylcbiAgICAgIC5tYXAoXG4gICAgICAgIChuYW1lKSA9PlxuICAgICAgICAgIGAke25hbWV9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyhxdWVyeVBhcmFtc1tuYW1lXSA/PyAnJykpfWAsXG4gICAgICApXG4gICAgICAuam9pbignJicpO1xuICAgIHVybCArPSAodXJsLmluZGV4T2YoJz8nKSA+IDAgPyAnJicgOiAnPycpICsgcXN0cmluZztcbiAgfVxuICByZXR1cm4gdXJsO1xufVxuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnQgY2xhc3MgUmVzb3VyY2U8UyBleHRlbmRzIFNjaGVtYSwgUj4gZXh0ZW5kcyBSZXF1ZXN0PFMsIFI+IHtcbiAgX3VybDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgY2hhdHRlcjogQ2hhdHRlcjxTPixcbiAgICB1cmw6IHN0cmluZyxcbiAgICBxdWVyeVBhcmFtcz86IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBudWxsIH0gfCBudWxsLFxuICApIHtcbiAgICBzdXBlcihjaGF0dGVyLCB7XG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgdXJsOiBhcHBwZW5kUXVlcnlQYXJhbXNUb1VybCh1cmwsIHF1ZXJ5UGFyYW1zKSxcbiAgICB9KTtcbiAgICB0aGlzLl91cmwgPSB0aGlzLl9yZXF1ZXN0LnVybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgcmVzb3VyY2VcbiAgICovXG4gIGNyZWF0ZTxSMSA9IGFueT4oZGF0YTogc3RyaW5nIHwgb2JqZWN0IHwgbnVsbCkge1xuICAgIHJldHVybiB0aGlzLl9jaGF0dGVyLnJlcXVlc3Q8UjE+KHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgdXJsOiB0aGlzLl91cmwsXG4gICAgICBib2R5OiBkYXRhLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHJlc291cmNlIGNvbnRlbnRcbiAgICovXG4gIHJldHJpZXZlPFIxID0gUj4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NoYXR0ZXIucmVxdWVzdDxSMT4oe1xuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIHVybDogdGhpcy5fdXJsLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBzcGVjaWZpZWQgcmVzb3VyY2VcbiAgICovXG4gIHVwZGF0ZTxSMSA9IGFueT4oZGF0YTogb2JqZWN0KSB7XG4gICAgcmV0dXJuIHRoaXMuX2NoYXR0ZXIucmVxdWVzdDxSMT4oe1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICB1cmw6IHRoaXMuX3VybCxcbiAgICAgIGJvZHk6IGRhdGEsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlIHNwZWNpZmllZCByZXNvdXJjZVxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICByZXR1cm4gdGhpcy5fY2hhdHRlci5yZXF1ZXN0PHZvaWQ+KHtcbiAgICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgICB1cmw6IHRoaXMuX3VybCxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTeW5vbnltIG9mIFJlc291cmNlI2Rlc3Ryb3koKVxuICAgKi9cbiAgZGVsZXRlID0gdGhpcy5kZXN0cm95O1xuXG4gIC8qKlxuICAgKiBTeW5vbnltIG9mIFJlc291cmNlI2Rlc3Ryb3koKVxuICAgKi9cbiAgZGVsID0gdGhpcy5kZXN0cm95O1xufVxuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKipcbiAqIEFQSSBjbGFzcyBmb3IgQ2hhdHRlciBSRVNUIEFQSSBjYWxsXG4gKi9cbmV4cG9ydCBjbGFzcyBDaGF0dGVyPFMgZXh0ZW5kcyBTY2hlbWE+IHtcbiAgX2Nvbm46IENvbm5lY3Rpb248Uz47XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb25uOiBDb25uZWN0aW9uPFM+KSB7XG4gICAgdGhpcy5fY29ubiA9IGNvbm47XG4gIH1cblxuICAvKipcbiAgICogU2VuZGluZyByZXF1ZXN0IHRvIEFQSSBlbmRwb2ludFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3JlcXVlc3Q8Uj4ocmVxXzogQ2hhdHRlclJlcXVlc3RQYXJhbXMpIHtcbiAgICBjb25zdCB7IG1ldGhvZCwgdXJsOiB1cmxfLCBoZWFkZXJzOiBoZWFkZXJzXywgYm9keTogYm9keV8gfSA9IHJlcV87XG4gICAgbGV0IGhlYWRlcnMgPSBoZWFkZXJzXyA/PyB7fTtcbiAgICBsZXQgYm9keTtcbiAgICBpZiAoL14ocHV0fHBvc3R8cGF0Y2gpJC9pLnRlc3QobWV0aG9kKSkge1xuICAgICAgaWYgKGlzT2JqZWN0KGJvZHlfKSkge1xuICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgIC4uLmhlYWRlcnNfLFxuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIH07XG4gICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeShib2R5Xyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBib2R5ID0gYm9keV87XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHVybCA9IHRoaXMuX25vcm1hbGl6ZVVybCh1cmxfKTtcbiAgICByZXR1cm4gdGhpcy5fY29ubi5yZXF1ZXN0PFI+KHtcbiAgICAgIG1ldGhvZCxcbiAgICAgIHVybCxcbiAgICAgIGhlYWRlcnMsXG4gICAgICBib2R5LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgcGF0aCB0byBzaXRlIHJvb3QgcmVsYXRpdmUgdXJsXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfbm9ybWFsaXplVXJsKHVybDogc3RyaW5nKSB7XG4gICAgaWYgKHVybC5pbmRleE9mKCcvY2hhdHRlci8nKSA9PT0gMCB8fCB1cmwuaW5kZXhPZignL2Nvbm5lY3QvJykgPT09IDApIHtcbiAgICAgIHJldHVybiAnL3NlcnZpY2VzL2RhdGEvdicgKyB0aGlzLl9jb25uLnZlcnNpb24gKyB1cmw7XG4gICAgfSBlbHNlIGlmICgvXlxcL3ZbXFxkXStcXC5bXFxkXStcXC8vLnRlc3QodXJsKSkge1xuICAgICAgcmV0dXJuICcvc2VydmljZXMvZGF0YScgKyB1cmw7XG4gICAgfSBlbHNlIGlmICh1cmwuaW5kZXhPZignL3NlcnZpY2VzLycpICE9PSAwICYmIHVybFswXSA9PT0gJy8nKSB7XG4gICAgICByZXR1cm4gJy9zZXJ2aWNlcy9kYXRhL3YnICsgdGhpcy5fY29ubi52ZXJzaW9uICsgJy9jaGF0dGVyJyArIHVybDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWFrZSBhIHJlcXVlc3QgZm9yIGNoYXR0ZXIgQVBJIHJlc291cmNlXG4gICAqL1xuICByZXF1ZXN0PFIgPSB1bmtub3duPihyZXE6IENoYXR0ZXJSZXF1ZXN0UGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0PFMsIFI+KHRoaXMsIHJlcSk7XG4gIH1cblxuICAvKipcbiAgICogTWFrZSBhIHJlc291cmNlIHJlcXVlc3QgdG8gY2hhdHRlciBBUElcbiAgICovXG4gIHJlc291cmNlPFIgPSB1bmtub3duPihcbiAgICB1cmw6IHN0cmluZyxcbiAgICBxdWVyeVBhcmFtcz86IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBudWxsIH0gfCBudWxsLFxuICApIHtcbiAgICByZXR1cm4gbmV3IFJlc291cmNlPFMsIFI+KHRoaXMsIHVybCwgcXVlcnlQYXJhbXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ha2UgYSBiYXRjaCByZXF1ZXN0IHRvIGNoYXR0ZXIgQVBJXG4gICAqL1xuICBhc3luYyBiYXRjaDxSVCBleHRlbmRzIGFueVtdPihcbiAgICByZXF1ZXN0czogQmF0Y2hSZXF1ZXN0VHVwcGxlPFMsIFJUPixcbiAgKTogUHJvbWlzZTxCYXRjaFJlc3BvbnNlPFJUPj4ge1xuICAgIGNvbnN0IGRlZmVycmVkcyA9IHJlcXVlc3RzLm1hcCgocmVxdWVzdCkgPT4ge1xuICAgICAgY29uc3QgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgcmVxdWVzdC5fcHJvbWlzZSA9IGRlZmVycmVkLnByb21pc2U7XG4gICAgICByZXR1cm4gZGVmZXJyZWQ7XG4gICAgfSk7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgdGhpcy5yZXF1ZXN0PEJhdGNoUmVzcG9uc2U8UlQ+Pih7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybDogdGhpcy5fbm9ybWFsaXplVXJsKCcvY29ubmVjdC9iYXRjaCcpLFxuICAgICAgYm9keToge1xuICAgICAgICBiYXRjaFJlcXVlc3RzOiByZXF1ZXN0cy5tYXAoKHJlcXVlc3QpID0+IHJlcXVlc3QuYmF0Y2hQYXJhbXMoKSksXG4gICAgICB9LFxuICAgIH0pO1xuICAgIHJlcy5yZXN1bHRzLmZvckVhY2goKHJlc3VsdCwgaSkgPT4ge1xuICAgICAgY29uc3QgZGVmZXJyZWQgPSBkZWZlcnJlZHNbaV07XG4gICAgICBpZiAocmVzdWx0LnN0YXR1c0NvZGUgPj0gNDAwKSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChyZXN1bHQucmVzdWx0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0LnJlc3VsdCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWZlcjxUPigpIHtcbiAgbGV0IHJlc29sdmVfOiAocjogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkID0gKCkgPT4ge307XG4gIGxldCByZWplY3RfOiAoZTogYW55KSA9PiB2b2lkID0gKCkgPT4ge307XG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgcmVzb2x2ZV8gPSByZXNvbHZlO1xuICAgIHJlamVjdF8gPSByZWplY3Q7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHByb21pc2UsXG4gICAgcmVzb2x2ZTogcmVzb2x2ZV8sXG4gICAgcmVqZWN0OiByZWplY3RfLFxuICB9O1xufVxuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qXG4gKiBSZWdpc3RlciBob29rIGluIGNvbm5lY3Rpb24gaW5zdGFudGlhdGlvbiBmb3IgZHluYW1pY2FsbHkgYWRkaW5nIHRoaXMgQVBJIG1vZHVsZSBmZWF0dXJlc1xuICovXG5yZWdpc3Rlck1vZHVsZSgnY2hhdHRlcicsIChjb25uKSA9PiBuZXcgQ2hhdHRlcihjb25uKSk7XG5cbmV4cG9ydCBkZWZhdWx0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