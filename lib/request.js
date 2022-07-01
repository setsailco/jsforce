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

exports.default = request;
exports.setDefaults = setDefaults;

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/keys"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectWithoutProperties"));

require("core-js/modules/es.promise.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.array.iterator.js");

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _abortController = _interopRequireDefault(require("abort-controller"));

var _httpsProxyAgent = _interopRequireDefault(require("https-proxy-agent"));

var _requestHelper = require("./request-helper");

const _excluded = ["url", "body"];

function ownKeys(object, enumerableOnly) { var keys = _Object$keys(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context2, _context3; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context2 = ownKeys(Object(source), !0)).call(_context2, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context3 = ownKeys(Object(source))).call(_context3, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 *
 */
let defaults = {};
/**
 *
 */

function setDefaults(defaults_) {
  defaults = defaults_;
}
/**
 *
 */


async function startFetchRequest(request, options, input, output, emitter, counter = 0) {
  const {
    httpProxy,
    followRedirect
  } = options;
  const agent = httpProxy ? (0, _httpsProxyAgent.default)(httpProxy) : undefined;
  const {
    url,
    body
  } = request,
        rrequest = (0, _objectWithoutProperties2.default)(request, _excluded);
  const controller = new _abortController.default();
  let res;

  try {
    res = await (0, _requestHelper.executeWithTimeout)(() => (0, _nodeFetch.default)(url, _objectSpread(_objectSpread(_objectSpread({}, rrequest), input && /^(post|put|patch)$/i.test(request.method) ? {
      body: input
    } : {}), {}, {
      redirect: 'manual',
      signal: controller.signal,
      agent
    })), options.timeout, () => controller.abort());
  } catch (err) {
    emitter.emit('error', err);
    return;
  }

  const headers = {};

  for (const headerName of (0, _keys.default)(_context = res.headers).call(_context)) {
    var _context;

    headers[headerName.toLowerCase()] = res.headers.get(headerName);
  }

  const response = {
    statusCode: res.status,
    headers
  };

  if (followRedirect && (0, _requestHelper.isRedirect)(response.statusCode)) {
    try {
      (0, _requestHelper.performRedirectRequest)(request, response, followRedirect, counter, req => startFetchRequest(req, options, undefined, output, emitter, counter + 1));
    } catch (err) {
      emitter.emit('error', err);
    }

    return;
  }

  emitter.emit('response', response);
  res.body.pipe(output);
}
/**
 *
 */


function request(req, options_ = {}) {
  const options = _objectSpread(_objectSpread({}, defaults), options_);

  const {
    input,
    output,
    stream
  } = (0, _requestHelper.createHttpRequestHandlerStreams)(req);
  startFetchRequest(req, options, input, output, stream);
  return stream;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkZWZhdWx0cyIsInNldERlZmF1bHRzIiwiZGVmYXVsdHNfIiwic3RhcnRGZXRjaFJlcXVlc3QiLCJyZXF1ZXN0Iiwib3B0aW9ucyIsImlucHV0Iiwib3V0cHV0IiwiZW1pdHRlciIsImNvdW50ZXIiLCJodHRwUHJveHkiLCJmb2xsb3dSZWRpcmVjdCIsImFnZW50IiwiY3JlYXRlSHR0cHNQcm94eUFnZW50IiwidW5kZWZpbmVkIiwidXJsIiwiYm9keSIsInJyZXF1ZXN0IiwiY29udHJvbGxlciIsIkFib3J0Q29udHJvbGxlciIsInJlcyIsImV4ZWN1dGVXaXRoVGltZW91dCIsImZldGNoIiwidGVzdCIsIm1ldGhvZCIsInJlZGlyZWN0Iiwic2lnbmFsIiwidGltZW91dCIsImFib3J0IiwiZXJyIiwiZW1pdCIsImhlYWRlcnMiLCJoZWFkZXJOYW1lIiwidG9Mb3dlckNhc2UiLCJnZXQiLCJyZXNwb25zZSIsInN0YXR1c0NvZGUiLCJzdGF0dXMiLCJpc1JlZGlyZWN0IiwicGVyZm9ybVJlZGlyZWN0UmVxdWVzdCIsInJlcSIsInBpcGUiLCJvcHRpb25zXyIsInN0cmVhbSIsImNyZWF0ZUh0dHBSZXF1ZXN0SGFuZGxlclN0cmVhbXMiXSwic291cmNlcyI6WyIuLi9zcmMvcmVxdWVzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHsgRHVwbGV4LCBSZWFkYWJsZSwgV3JpdGFibGUgfSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0IGZldGNoIGZyb20gJ25vZGUtZmV0Y2gnO1xuaW1wb3J0IEFib3J0Q29udHJvbGxlciBmcm9tICdhYm9ydC1jb250cm9sbGVyJztcbmltcG9ydCBjcmVhdGVIdHRwc1Byb3h5QWdlbnQgZnJvbSAnaHR0cHMtcHJveHktYWdlbnQnO1xuaW1wb3J0IHtcbiAgY3JlYXRlSHR0cFJlcXVlc3RIYW5kbGVyU3RyZWFtcyxcbiAgZXhlY3V0ZVdpdGhUaW1lb3V0LFxuICBpc1JlZGlyZWN0LFxuICBwZXJmb3JtUmVkaXJlY3RSZXF1ZXN0LFxufSBmcm9tICcuL3JlcXVlc3QtaGVscGVyJztcbmltcG9ydCB7IEh0dHBSZXF1ZXN0LCBIdHRwUmVxdWVzdE9wdGlvbnMgfSBmcm9tICcuL3R5cGVzJztcblxuLyoqXG4gKlxuICovXG5sZXQgZGVmYXVsdHM6IEh0dHBSZXF1ZXN0T3B0aW9ucyA9IHt9O1xuXG4vKipcbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXREZWZhdWx0cyhkZWZhdWx0c186IEh0dHBSZXF1ZXN0T3B0aW9ucykge1xuICBkZWZhdWx0cyA9IGRlZmF1bHRzXztcbn1cblxuLyoqXG4gKlxuICovXG5hc3luYyBmdW5jdGlvbiBzdGFydEZldGNoUmVxdWVzdChcbiAgcmVxdWVzdDogSHR0cFJlcXVlc3QsXG4gIG9wdGlvbnM6IEh0dHBSZXF1ZXN0T3B0aW9ucyxcbiAgaW5wdXQ6IFJlYWRhYmxlIHwgdW5kZWZpbmVkLFxuICBvdXRwdXQ6IFdyaXRhYmxlLFxuICBlbWl0dGVyOiBFdmVudEVtaXR0ZXIsXG4gIGNvdW50ZXI6IG51bWJlciA9IDAsXG4pIHtcbiAgY29uc3QgeyBodHRwUHJveHksIGZvbGxvd1JlZGlyZWN0IH0gPSBvcHRpb25zO1xuICBjb25zdCBhZ2VudCA9IGh0dHBQcm94eSA/IGNyZWF0ZUh0dHBzUHJveHlBZ2VudChodHRwUHJveHkpIDogdW5kZWZpbmVkO1xuICBjb25zdCB7IHVybCwgYm9keSwgLi4ucnJlcXVlc3QgfSA9IHJlcXVlc3Q7XG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gIGxldCByZXM7XG4gIHRyeSB7XG4gICAgcmVzID0gYXdhaXQgZXhlY3V0ZVdpdGhUaW1lb3V0KFxuICAgICAgKCkgPT5cbiAgICAgICAgZmV0Y2godXJsLCB7XG4gICAgICAgICAgLi4ucnJlcXVlc3QsXG4gICAgICAgICAgLi4uKGlucHV0ICYmIC9eKHBvc3R8cHV0fHBhdGNoKSQvaS50ZXN0KHJlcXVlc3QubWV0aG9kKVxuICAgICAgICAgICAgPyB7IGJvZHk6IGlucHV0IH1cbiAgICAgICAgICAgIDoge30pLFxuICAgICAgICAgIHJlZGlyZWN0OiAnbWFudWFsJyxcbiAgICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICAgIGFnZW50LFxuICAgICAgICB9KSxcbiAgICAgIG9wdGlvbnMudGltZW91dCxcbiAgICAgICgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSxcbiAgICApO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBlbWl0dGVyLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgaGVhZGVyczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICBmb3IgKGNvbnN0IGhlYWRlck5hbWUgb2YgcmVzLmhlYWRlcnMua2V5cygpKSB7XG4gICAgaGVhZGVyc1toZWFkZXJOYW1lLnRvTG93ZXJDYXNlKCldID0gcmVzLmhlYWRlcnMuZ2V0KGhlYWRlck5hbWUpO1xuICB9XG4gIGNvbnN0IHJlc3BvbnNlID0ge1xuICAgIHN0YXR1c0NvZGU6IHJlcy5zdGF0dXMsXG4gICAgaGVhZGVycyxcbiAgfTtcbiAgaWYgKGZvbGxvd1JlZGlyZWN0ICYmIGlzUmVkaXJlY3QocmVzcG9uc2Uuc3RhdHVzQ29kZSkpIHtcbiAgICB0cnkge1xuICAgICAgcGVyZm9ybVJlZGlyZWN0UmVxdWVzdChcbiAgICAgICAgcmVxdWVzdCxcbiAgICAgICAgcmVzcG9uc2UsXG4gICAgICAgIGZvbGxvd1JlZGlyZWN0LFxuICAgICAgICBjb3VudGVyLFxuICAgICAgICAocmVxKSA9PlxuICAgICAgICAgIHN0YXJ0RmV0Y2hSZXF1ZXN0KFxuICAgICAgICAgICAgcmVxLFxuICAgICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG91dHB1dCxcbiAgICAgICAgICAgIGVtaXR0ZXIsXG4gICAgICAgICAgICBjb3VudGVyICsgMSxcbiAgICAgICAgICApLFxuICAgICAgKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGVtaXR0ZXIuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cbiAgZW1pdHRlci5lbWl0KCdyZXNwb25zZScsIHJlc3BvbnNlKTtcbiAgcmVzLmJvZHkucGlwZShvdXRwdXQpO1xufVxuXG4vKipcbiAqXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlcXVlc3QoXG4gIHJlcTogSHR0cFJlcXVlc3QsXG4gIG9wdGlvbnNfOiBIdHRwUmVxdWVzdE9wdGlvbnMgPSB7fSxcbik6IER1cGxleCB7XG4gIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRzLCAuLi5vcHRpb25zXyB9O1xuICBjb25zdCB7IGlucHV0LCBvdXRwdXQsIHN0cmVhbSB9ID0gY3JlYXRlSHR0cFJlcXVlc3RIYW5kbGVyU3RyZWFtcyhyZXEpO1xuICBzdGFydEZldGNoUmVxdWVzdChyZXEsIG9wdGlvbnMsIGlucHV0LCBvdXRwdXQsIHN0cmVhbSk7XG4gIHJldHVybiBzdHJlYW07XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQVFBO0FBQ0E7QUFDQTtBQUNBLElBQUlBLFFBQTRCLEdBQUcsRUFBbkM7QUFFQTtBQUNBO0FBQ0E7O0FBQ08sU0FBU0MsV0FBVCxDQUFxQkMsU0FBckIsRUFBb0Q7RUFDekRGLFFBQVEsR0FBR0UsU0FBWDtBQUNEO0FBRUQ7QUFDQTtBQUNBOzs7QUFDQSxlQUFlQyxpQkFBZixDQUNFQyxPQURGLEVBRUVDLE9BRkYsRUFHRUMsS0FIRixFQUlFQyxNQUpGLEVBS0VDLE9BTEYsRUFNRUMsT0FBZSxHQUFHLENBTnBCLEVBT0U7RUFDQSxNQUFNO0lBQUVDLFNBQUY7SUFBYUM7RUFBYixJQUFnQ04sT0FBdEM7RUFDQSxNQUFNTyxLQUFLLEdBQUdGLFNBQVMsR0FBRyxJ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