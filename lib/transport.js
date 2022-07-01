"use strict";

var _Object$keys2 = require("@babel/runtime-corejs3/core-js-stable/object/keys");

var _Object$getOwnPropertySymbols = require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-symbols");

var _filterInstanceProperty = require("@babel/runtime-corejs3/core-js-stable/instance/filter");

var _Object$getOwnPropertyDescriptor = require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-descriptor");

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js-stable/instance/for-each");

var _Object$getOwnPropertyDescriptors = require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-descriptors");

var _Object$defineProperties = require("@babel/runtime-corejs3/core-js-stable/object/define-properties");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

var _WeakMap = require("@babel/runtime-corejs3/core-js-stable/weak-map");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = exports.XdProxyTransport = exports.Transport = exports.JsonpTransport = exports.HttpProxyTransport = exports.CanvasTransport = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectWithoutProperties"));

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/parse-int"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys"));

var _now = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/date/now"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/index-of"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.array.iterator.js");

var _request = _interopRequireWildcard(require("./request"));

var _promise2 = require("./util/promise");

var _jsonp = _interopRequireDefault(require("./browser/jsonp"));

var _canvas = _interopRequireDefault(require("./browser/canvas"));

const _excluded = ["url", "body"];

var _process$env$HTTP_PRO;

function _getRequireWildcardCache(nodeInterop) { if (typeof _WeakMap !== "function") return null; var cacheBabelInterop = new _WeakMap(); var cacheNodeInterop = new _WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = _Object$defineProperty && _Object$getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? _Object$getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { _Object$defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = _Object$keys2(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context, _context2; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context = ownKeys(Object(source), !0)).call(_context, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context2 = ownKeys(Object(source))).call(_context2, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * Normarize Salesforce API host name
 * @private
 */
function normalizeApiHost(apiHost) {
  const m = /(\w+)\.(visual\.force|salesforce)\.com$/.exec(apiHost);

  if (m) {
    return `${m[1]}.salesforce.com`;
  }

  return apiHost;
}

(0, _request.setDefaults)({
  httpProxy: (_process$env$HTTP_PRO = process.env.HTTP_PROXY) !== null && _process$env$HTTP_PRO !== void 0 ? _process$env$HTTP_PRO : undefined,
  timeout: process.env.HTTP_TIMEOUT ? (0, _parseInt2.default)(process.env.HTTP_TIMEOUT, 10) : undefined
});
const baseUrl = typeof window !== 'undefined' && window.location && window.location.host ? `https://${normalizeApiHost(window.location.host)}` : process.env.LOCATION_BASE_URL || '';
/**
 * Class for HTTP request transport
 *
 * @class
 * @protected
 */

class Transport {
  /**
   */
  httpRequest(req, options = {}) {
    return _promise2.StreamPromise.create(() => {
      const createStream = this.getRequestStreamCreator();
      const stream = createStream(req, options);
      const promise = new _promise.default((resolve, reject) => {
        stream.on('complete', res => resolve(res)).on('error', reject);
      });
      return {
        stream,
        promise
      };
    });
  }
  /**
   * @protected
   */


  getRequestStreamCreator() {
    return _request.default;
  }

}
/**
 * Class for JSONP request transport
 */


exports.Transport = Transport;

class JsonpTransport extends Transport {
  constructor(jsonpParam) {
    super();
    (0, _defineProperty2.default)(this, "_jsonpParam", void 0);
    this._jsonpParam = jsonpParam;
  }

  getRequestStreamCreator() {
    const jsonpRequest = _jsonp.default.createRequest(this._jsonpParam);

    return params => jsonpRequest(params);
  }

}
/**
 * Class for Sfdc Canvas request transport
 */


exports.JsonpTransport = JsonpTransport;
(0, _defineProperty2.default)(JsonpTransport, "supprted", _jsonp.default.supported);

class CanvasTransport extends Transport {
  constructor(signedRequest) {
    super();
    (0, _defineProperty2.default)(this, "_signedRequest", void 0);
    this._signedRequest = signedRequest;
  }

  getRequestStreamCreator() {
    const canvasRequest = _canvas.default.createRequest(this._signedRequest);

    return params => canvasRequest(params);
  }

}
/* @private */


exports.CanvasTransport = CanvasTransport;
(0, _defineProperty2.default)(CanvasTransport, "supported", _canvas.default.supported);

function createXdProxyRequest(req, proxyUrl) {
  const headers = {
    'salesforceproxy-endpoint': req.url
  };

  if (req.headers) {
    for (const name of (0, _keys.default)(req.headers)) {
      headers[name] = req.headers[name];
    }
  }

  const nocache = `${(0, _now.default)()}.${String(Math.random()).substring(2)}`;
  return _objectSpread({
    method: req.method,
    url: `${proxyUrl}?${nocache}`,
    headers
  }, req.body != null ? {
    body: req.body
  } : {});
}
/**
 * Class for HTTP request transport using cross-domain AJAX proxy service
 */


class XdProxyTransport extends Transport {
  constructor(xdProxyUrl) {
    super();
    (0, _defineProperty2.default)(this, "_xdProxyUrl", void 0);
    this._xdProxyUrl = xdProxyUrl;
  }
  /**
   * Make HTTP request via AJAX proxy
   */


  httpRequest(req, _options = {}) {
    const xdProxyUrl = this._xdProxyUrl;
    const {
      url,
      body
    } = req,
          rreq = (0, _objectWithoutProperties2.default)(req, _excluded);
    const canonicalUrl = (0, _indexOf.default)(url).call(url, '/') === 0 ? baseUrl + url : url;
    const xdProxyReq = createXdProxyRequest(_objectSpread(_objectSpread({}, rreq), {}, {
      url: canonicalUrl,
      body
    }), xdProxyUrl);
    return super.httpRequest(xdProxyReq, {
      followRedirect: redirectUrl => createXdProxyRequest(_objectSpread(_objectSpread({}, rreq), {}, {
        method: 'GET',
        url: redirectUrl
      }), xdProxyUrl)
    });
  }

}
/**
 * Class for HTTP request transport using a proxy server
 */


exports.XdProxyTransport = XdProxyTransport;

class HttpProxyTransport extends Transport {
  constructor(httpProxy) {
    super();
    (0, _defineProperty2.default)(this, "_httpProxy", void 0);
    this._httpProxy = httpProxy;
  }
  /**
   * Make HTTP request via proxy server
   */


  httpRequest(req, options_ = {}) {
    const options = _objectSpread(_objectSpread({}, options_), {}, {
      httpProxy: this._httpProxy
    });

    return super.httpRequest(req, options);
  }

}

exports.HttpProxyTransport = HttpProxyTransport;
var _default = Transport;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJub3JtYWxpemVBcGlIb3N0IiwiYXBpSG9zdCIsIm0iLCJleGVjIiwic2V0RGVmYXVsdHMiLCJodHRwUHJveHkiLCJwcm9jZXNzIiwiZW52IiwiSFRUUF9QUk9YWSIsInVuZGVmaW5lZCIsInRpbWVvdXQiLCJIVFRQX1RJTUVPVVQiLCJiYXNlVXJsIiwid2luZG93IiwibG9jYXRpb24iLCJob3N0IiwiTE9DQVRJT05fQkFTRV9VUkwiLCJUcmFuc3BvcnQiLCJodHRwUmVxdWVzdCIsInJlcSIsIm9wdGlvbnMiLCJTdHJlYW1Qcm9taXNlIiwiY3JlYXRlIiwiY3JlYXRlU3RyZWFtIiwiZ2V0UmVxdWVzdFN0cmVhbUNyZWF0b3IiLCJzdHJlYW0iLCJwcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIm9uIiwicmVzIiwicmVxdWVzdCIsIkpzb25wVHJhbnNwb3J0IiwiY29uc3RydWN0b3IiLCJqc29ucFBhcmFtIiwiX2pzb25wUGFyYW0iLCJqc29ucFJlcXVlc3QiLCJqc29ucCIsImNyZWF0ZVJlcXVlc3QiLCJwYXJhbXMiLCJzdXBwb3J0ZWQiLCJDYW52YXNUcmFuc3BvcnQiLCJzaWduZWRSZXF1ZXN0IiwiX3NpZ25lZFJlcXVlc3QiLCJjYW52YXNSZXF1ZXN0IiwiY2FudmFzIiwiY3JlYXRlWGRQcm94eVJlcXVlc3QiLCJwcm94eVVybCIsImhlYWRlcnMiLCJ1cmwiLCJuYW1lIiwibm9jYWNoZSIsIlN0cmluZyIsIk1hdGgiLCJyYW5kb20iLCJzdWJzdHJpbmciLCJtZXRob2QiLCJib2R5IiwiWGRQcm94eVRyYW5zcG9ydCIsInhkUHJveHlVcmwiLCJfeGRQcm94eVVybCIsIl9vcHRpb25zIiwicnJlcSIsImNhbm9uaWNhbFVybCIsInhkUHJveHlSZXEiLCJmb2xsb3dSZWRpcmVjdCIsInJlZGlyZWN0VXJsIiwiSHR0cFByb3h5VHJhbnNwb3J0IiwiX2h0dHBQcm94eSIsIm9wdGlvbnNfIl0sInNvdXJjZXMiOlsiLi4vc3JjL3RyYW5zcG9ydC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqXG4gKi9cbmltcG9ydCB7IER1cGxleCB9IGZyb20gJ3N0cmVhbSc7XG5pbXBvcnQgcmVxdWVzdCwgeyBzZXREZWZhdWx0cyB9IGZyb20gJy4vcmVxdWVzdCc7XG5pbXBvcnQgeyBIdHRwUmVxdWVzdCwgSHR0cFJlcXVlc3RPcHRpb25zLCBIdHRwUmVzcG9uc2UgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IFN0cmVhbVByb21pc2UgfSBmcm9tICcuL3V0aWwvcHJvbWlzZSc7XG5pbXBvcnQganNvbnAgZnJvbSAnLi9icm93c2VyL2pzb25wJztcbmltcG9ydCBjYW52YXMgZnJvbSAnLi9icm93c2VyL2NhbnZhcyc7XG5cbi8qKlxuICogTm9ybWFyaXplIFNhbGVzZm9yY2UgQVBJIGhvc3QgbmFtZVxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplQXBpSG9zdChhcGlIb3N0OiBzdHJpbmcpIHtcbiAgY29uc3QgbSA9IC8oXFx3KylcXC4odmlzdWFsXFwuZm9yY2V8c2FsZXNmb3JjZSlcXC5jb20kLy5leGVjKGFwaUhvc3QpO1xuICBpZiAobSkge1xuICAgIHJldHVybiBgJHttWzFdfS5zYWxlc2ZvcmNlLmNvbWA7XG4gIH1cbiAgcmV0dXJuIGFwaUhvc3Q7XG59XG5cbnNldERlZmF1bHRzKHtcbiAgaHR0cFByb3h5OiBwcm9jZXNzLmVudi5IVFRQX1BST1hZID8/IHVuZGVmaW5lZCxcbiAgdGltZW91dDogcHJvY2Vzcy5lbnYuSFRUUF9USU1FT1VUXG4gICAgPyBwYXJzZUludChwcm9jZXNzLmVudi5IVFRQX1RJTUVPVVQsIDEwKVxuICAgIDogdW5kZWZpbmVkLFxufSk7XG5cbmNvbnN0IGJhc2VVcmwgPVxuICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cubG9jYXRpb24gJiYgd2luZG93LmxvY2F0aW9uLmhvc3RcbiAgICA/IGBodHRwczovLyR7bm9ybWFsaXplQXBpSG9zdCh3aW5kb3cubG9jYXRpb24uaG9zdCl9YFxuICAgIDogcHJvY2Vzcy5lbnYuTE9DQVRJT05fQkFTRV9VUkwgfHwgJyc7XG5cbi8qKlxuICogQ2xhc3MgZm9yIEhUVFAgcmVxdWVzdCB0cmFuc3BvcnRcbiAqXG4gKiBAY2xhc3NcbiAqIEBwcm90ZWN0ZWRcbiAqL1xuZXhwb3J0IGNsYXNzIFRyYW5zcG9ydCB7XG4gIC8qKlxuICAgKi9cbiAgaHR0cFJlcXVlc3QoXG4gICAgcmVxOiBIdHRwUmVxdWVzdCxcbiAgICBvcHRpb25zOiBIdHRwUmVxdWVzdE9wdGlvbnMgPSB7fSxcbiAgKTogU3RyZWFtUHJvbWlzZTxIdHRwUmVzcG9uc2U+IHtcbiAgICByZXR1cm4gU3RyZWFtUHJvbWlzZS5jcmVhdGUoKCkgPT4ge1xuICAgICAgY29uc3QgY3JlYXRlU3RyZWFtID0gdGhpcy5nZXRSZXF1ZXN0U3RyZWFtQ3JlYXRvcigpO1xuICAgICAgY29uc3Qgc3RyZWFtID0gY3JlYXRlU3RyZWFtKHJlcSwgb3B0aW9ucyk7XG4gICAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2U8SHR0cFJlc3BvbnNlPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHN0cmVhbVxuICAgICAgICAgIC5vbignY29tcGxldGUnLCAocmVzOiBIdHRwUmVzcG9uc2UpID0+IHJlc29sdmUocmVzKSlcbiAgICAgICAgICAub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHsgc3RyZWFtLCBwcm9taXNlIH07XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgZ2V0UmVxdWVzdFN0cmVhbUNyZWF0b3IoKTogKFxuICAgIHJlcTogSHR0cFJlcXVlc3QsXG4gICAgb3B0aW9uczogSHR0cFJlcXVlc3RPcHRpb25zLFxuICApID0+IER1cGxleCB7XG4gICAgcmV0dXJuIHJlcXVlc3Q7XG4gIH1cbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgSlNPTlAgcmVxdWVzdCB0cmFuc3BvcnRcbiAqL1xuZXhwb3J0IGNsYXNzIEpzb25wVHJhbnNwb3J0IGV4dGVuZHMgVHJhbnNwb3J0IHtcbiAgc3RhdGljIHN1cHBydGVkOiBib29sZWFuID0ganNvbnAuc3VwcG9ydGVkO1xuICBfanNvbnBQYXJhbTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGpzb25wUGFyYW06IHN0cmluZykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fanNvbnBQYXJhbSA9IGpzb25wUGFyYW07XG4gIH1cblxuICBnZXRSZXF1ZXN0U3RyZWFtQ3JlYXRvcigpOiAoXG4gICAgcmVxOiBIdHRwUmVxdWVzdCxcbiAgICBvcHRpb25zOiBIdHRwUmVxdWVzdE9wdGlvbnMsXG4gICkgPT4gRHVwbGV4IHtcbiAgICBjb25zdCBqc29ucFJlcXVlc3QgPSBqc29ucC5jcmVhdGVSZXF1ZXN0KHRoaXMuX2pzb25wUGFyYW0pO1xuICAgIHJldHVybiAocGFyYW1zKSA9PiBqc29ucFJlcXVlc3QocGFyYW1zKTtcbiAgfVxufVxuXG4vKipcbiAqIENsYXNzIGZvciBTZmRjIENhbnZhcyByZXF1ZXN0IHRyYW5zcG9ydFxuICovXG5leHBvcnQgY2xhc3MgQ2FudmFzVHJhbnNwb3J0IGV4dGVuZHMgVHJhbnNwb3J0IHtcbiAgc3RhdGljIHN1cHBvcnRlZDogYm9vbGVhbiA9IGNhbnZhcy5zdXBwb3J0ZWQ7XG4gIF9zaWduZWRSZXF1ZXN0OiBhbnk7XG5cbiAgY29uc3RydWN0b3Ioc2lnbmVkUmVxdWVzdDogYW55KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9zaWduZWRSZXF1ZXN0ID0gc2lnbmVkUmVxdWVzdDtcbiAgfVxuXG4gIGdldFJlcXVlc3RTdHJlYW1DcmVhdG9yKCk6IChcbiAgICByZXE6IEh0dHBSZXF1ZXN0LFxuICAgIG9wdGlvbnM6IEh0dHBSZXF1ZXN0T3B0aW9ucyxcbiAgKSA9PiBEdXBsZXgge1xuICAgIGNvbnN0IGNhbnZhc1JlcXVlc3QgPSBjYW52YXMuY3JlYXRlUmVxdWVzdCh0aGlzLl9zaWduZWRSZXF1ZXN0KTtcbiAgICByZXR1cm4gKHBhcmFtcykgPT4gY2FudmFzUmVxdWVzdChwYXJhbXMpO1xuICB9XG59XG5cbi8qIEBwcml2YXRlICovXG5mdW5jdGlvbiBjcmVhdGVYZFByb3h5UmVxdWVzdChyZXE6IEh0dHBSZXF1ZXN0LCBwcm94eVVybDogc3RyaW5nKTogSHR0cFJlcXVlc3Qge1xuICBjb25zdCBoZWFkZXJzOiB7IFtuYW1lOiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcbiAgICAnc2FsZXNmb3JjZXByb3h5LWVuZHBvaW50JzogcmVxLnVybCxcbiAgfTtcbiAgaWYgKHJlcS5oZWFkZXJzKSB7XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIE9iamVjdC5rZXlzKHJlcS5oZWFkZXJzKSkge1xuICAgICAgaGVhZGVyc1tuYW1lXSA9IHJlcS5oZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfVxuICBjb25zdCBub2NhY2hlID0gYCR7RGF0ZS5ub3coKX0uJHtTdHJpbmcoTWF0aC5yYW5kb20oKSkuc3Vic3RyaW5nKDIpfWA7XG4gIHJldHVybiB7XG4gICAgbWV0aG9kOiByZXEubWV0aG9kLFxuICAgIHVybDogYCR7cHJveHlVcmx9PyR7bm9jYWNoZX1gLFxuICAgIGhlYWRlcnMsXG4gICAgLi4uKHJlcS5ib2R5ICE9IG51bGwgPyB7IGJvZHk6IHJlcS5ib2R5IH0gOiB7fSksXG4gIH07XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIEhUVFAgcmVxdWVzdCB0cmFuc3BvcnQgdXNpbmcgY3Jvc3MtZG9tYWluIEFKQVggcHJveHkgc2VydmljZVxuICovXG5leHBvcnQgY2xhc3MgWGRQcm94eVRyYW5zcG9ydCBleHRlbmRzIFRyYW5zcG9ydCB7XG4gIF94ZFByb3h5VXJsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoeGRQcm94eVVybDogc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl94ZFByb3h5VXJsID0geGRQcm94eVVybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIEhUVFAgcmVxdWVzdCB2aWEgQUpBWCBwcm94eVxuICAgKi9cbiAgaHR0cFJlcXVlc3QocmVxOiBIdHRwUmVxdWVzdCwgX29wdGlvbnM6IEh0dHBSZXF1ZXN0T3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgeGRQcm94eVVybCA9IHRoaXMuX3hkUHJveHlVcmw7XG4gICAgY29uc3QgeyB1cmwsIGJvZHksIC4uLnJyZXEgfSA9IHJlcTtcbiAgICBjb25zdCBjYW5vbmljYWxVcmwgPSB1cmwuaW5kZXhPZignLycpID09PSAwID8gYmFzZVVybCArIHVybCA6IHVybDtcbiAgICBjb25zdCB4ZFByb3h5UmVxID0gY3JlYXRlWGRQcm94eVJlcXVlc3QoXG4gICAgICB7IC4uLnJyZXEsIHVybDogY2Fub25pY2FsVXJsLCBib2R5IH0sXG4gICAgICB4ZFByb3h5VXJsLFxuICAgICk7XG4gICAgcmV0dXJuIHN1cGVyLmh0dHBSZXF1ZXN0KHhkUHJveHlSZXEsIHtcbiAgICAgIGZvbGxvd1JlZGlyZWN0OiAocmVkaXJlY3RVcmwpID0+XG4gICAgICAgIGNyZWF0ZVhkUHJveHlSZXF1ZXN0KFxuICAgICAgICAgIHsgLi4ucnJlcSwgbWV0aG9kOiAnR0VUJywgdXJsOiByZWRpcmVjdFVybCB9LFxuICAgICAgICAgIHhkUHJveHlVcmwsXG4gICAgICAgICksXG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgSFRUUCByZXF1ZXN0IHRyYW5zcG9ydCB1c2luZyBhIHByb3h5IHNlcnZlclxuICovXG5leHBvcnQgY2xhc3MgSHR0cFByb3h5VHJhbnNwb3J0IGV4dGVuZHMgVHJhbnNwb3J0IHtcbiAgX2h0dHBQcm94eTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGh0dHBQcm94eTogc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9odHRwUHJveHkgPSBodHRwUHJveHk7XG4gIH1cblxuICAvKipcbiAgICogTWFrZSBIVFRQIHJlcXVlc3QgdmlhIHByb3h5IHNlcnZlclxuICAgKi9cbiAgaHR0cFJlcXVlc3QocmVxOiBIdHRwUmVxdWVzdCwgb3B0aW9uc186IEh0dHBSZXF1ZXN0T3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4ub3B0aW9uc18sIGh0dHBQcm94eTogdGhpcy5faHR0cFByb3h5IH07XG4gICAgcmV0dXJuIHN1cGVyLmh0dHBSZXF1ZXN0KHJlcSwgb3B0aW9ucyk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVHJhbnNwb3J0O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUE7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTQSxnQkFBVCxDQUEwQkMsT0FBMUIsRUFBMkM7RUFDekMsTUFBTUMsQ0FBQyxHQUFHLDBDQUEwQ0MsSUFBMUMsQ0FBK0NGLE9BQS9DLENBQVY7O0VBQ0EsSUFBSUMsQ0FBSixFQUFPO0lBQ0wsT0FBUSxHQUFFQSxDQUFDLENBQUMsQ0FBRCxDQUFJLGlCQUFmO0VBQ0Q7O0VBQ0QsT0FBT0QsT0FBUDtBQUNEOztBQUVELElBQUFHLG9CQUFBLEVBQVk7RUFDVkMsU0FBUywyQkFBRUMsT0FBTyxDQUFDQyxHQUFSLENBQVlDLFVBQWQseUVBQTRCQyxTQUQzQjtFQUVWQyxPQUFPLEVBQUVKLE9BQU8sQ0FBQ0MsR0FBUixDQUFZSSxZQUFaLEdBQ0wsd0JBQVNMLE9BQU8sQ0FBQ0MsR0FBUixDQUFZSSxZQUFyQixFQUFtQyxFQUFuQyxDQURLLEdBRUxGO0FBSk0sQ0FBWjtBQU9BLE1BQU1HLE9BQU8sR0FDWCxPQUFPQyxNQUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFNLENBQUNDLFFBQXhDLElBQW9ERCxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLElBQXBFLEdBQ0ssV0FBVWYsZ0JBQWdCLENBQUNhLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkMsSUFBakIsQ0FBdUIsRUFEdEQsR0FFSVQsT0FBTyxDQUFDQyxHQUFSLENBQVlTLGlCQUFaLElBQWlDLEVBSHZDO0FB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