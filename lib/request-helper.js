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

exports.createHttpRequestHandlerStreams = createHttpRequestHandlerStreams;
exports.executeWithTimeout = executeWithTimeout;
exports.isRedirect = isRedirect;
exports.performRedirectRequest = performRedirectRequest;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

require("core-js/modules/es.promise.js");

var _setTimeout2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/set-timeout"));

var _set = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/set"));

var _stream = require("stream");

var _stream2 = require("./util/stream");

function ownKeys(object, enumerableOnly) { var keys = _Object$keys(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context, _context2; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context = ownKeys(Object(source), !0)).call(_context, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context2 = ownKeys(Object(source))).call(_context2, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 *
 */
function createHttpRequestHandlerStreams(req) {
  const {
    body: reqBody
  } = req;
  const input = new _stream.PassThrough();
  const output = new _stream.PassThrough();
  const duplex = (0, _stream2.concatStreamsAsDuplex)(input, output);

  if (typeof reqBody !== 'undefined') {
    (0, _setTimeout2.default)(() => {
      duplex.end(reqBody, 'utf8');
    }, 0);
  }

  duplex.on('response', async res => {
    if (duplex.listenerCount('complete') > 0) {
      const resBody = await (0, _stream2.readAll)(duplex);
      duplex.emit('complete', _objectSpread(_objectSpread({}, res), {}, {
        body: resBody
      }));
    }
  });
  return {
    input,
    output,
    stream: duplex
  };
}

const redirectStatuses = new _set.default([301, 302, 303, 307, 308]);
/**
 *
 */

function isRedirect(status) {
  return redirectStatuses.has(status);
}
/**
 *
 */


const MAX_REDIRECT_COUNT = 10;
/**
 *
 */

function performRedirectRequest(req, res, followRedirect, counter, redirectCallback) {
  if (counter >= MAX_REDIRECT_COUNT) {
    throw new Error('Reached to maximum redirect count');
  }

  const redirectUrl = res.headers['location'];

  if (!redirectUrl) {
    throw new Error('No redirect URI found');
  }

  const getRedirectRequest = typeof followRedirect === 'function' ? followRedirect : () => ({
    method: 'GET',
    url: redirectUrl,
    headers: req.headers
  });
  const nextReqParams = getRedirectRequest(redirectUrl);

  if (!nextReqParams) {
    throw new Error('Cannot handle redirect for ' + redirectUrl);
  }

  redirectCallback(nextReqParams);
}
/**
 *
 */


async function executeWithTimeout(execFn, msec, cancelCallback) {
  let timeout = false;
  let pid = msec != null ? (0, _setTimeout2.default)(() => {
    timeout = true;
    cancelCallback === null || cancelCallback === void 0 ? void 0 : cancelCallback();
  }, msec) : undefined;
  let res;

  try {
    res = await execFn();
  } finally {
    if (pid) {
      clearTimeout(pid);
    }
  }

  if (timeout) {
    throw new Error('Request Timeout');
  }

  return res;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVIdHRwUmVxdWVzdEhhbmRsZXJTdHJlYW1zIiwicmVxIiwiYm9keSIsInJlcUJvZHkiLCJpbnB1dCIsIlBhc3NUaHJvdWdoIiwib3V0cHV0IiwiZHVwbGV4IiwiY29uY2F0U3RyZWFtc0FzRHVwbGV4IiwiZW5kIiwib24iLCJyZXMiLCJsaXN0ZW5lckNvdW50IiwicmVzQm9keSIsInJlYWRBbGwiLCJlbWl0Iiwic3RyZWFtIiwicmVkaXJlY3RTdGF0dXNlcyIsImlzUmVkaXJlY3QiLCJzdGF0dXMiLCJoYXMiLCJNQVhfUkVESVJFQ1RfQ09VTlQiLCJwZXJmb3JtUmVkaXJlY3RSZXF1ZXN0IiwiZm9sbG93UmVkaXJlY3QiLCJjb3VudGVyIiwicmVkaXJlY3RDYWxsYmFjayIsIkVycm9yIiwicmVkaXJlY3RVcmwiLCJoZWFkZXJzIiwiZ2V0UmVkaXJlY3RSZXF1ZXN0IiwibWV0aG9kIiwidXJsIiwibmV4dFJlcVBhcmFtcyIsImV4ZWN1dGVXaXRoVGltZW91dCIsImV4ZWNGbiIsIm1zZWMiLCJjYW5jZWxDYWxsYmFjayIsInRpbWVvdXQiLCJwaWQiLCJ1bmRlZmluZWQiLCJjbGVhclRpbWVvdXQiXSwic291cmNlcyI6WyIuLi9zcmMvcmVxdWVzdC1oZWxwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGFzc1Rocm91Z2ggfSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0IHsgY29uY2F0U3RyZWFtc0FzRHVwbGV4LCByZWFkQWxsIH0gZnJvbSAnLi91dGlsL3N0cmVhbSc7XG5pbXBvcnQgeyBIdHRwUmVxdWVzdCwgSHR0cFJlcXVlc3RPcHRpb25zLCBIdHRwUmVzcG9uc2UgfSBmcm9tICcuL3R5cGVzJztcblxuLyoqXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSHR0cFJlcXVlc3RIYW5kbGVyU3RyZWFtcyhyZXE6IEh0dHBSZXF1ZXN0KSB7XG4gIGNvbnN0IHsgYm9keTogcmVxQm9keSB9ID0gcmVxO1xuICBjb25zdCBpbnB1dCA9IG5ldyBQYXNzVGhyb3VnaCgpO1xuICBjb25zdCBvdXRwdXQgPSBuZXcgUGFzc1Rocm91Z2goKTtcbiAgY29uc3QgZHVwbGV4ID0gY29uY2F0U3RyZWFtc0FzRHVwbGV4KGlucHV0LCBvdXRwdXQpO1xuICBpZiAodHlwZW9mIHJlcUJvZHkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBkdXBsZXguZW5kKHJlcUJvZHksICd1dGY4Jyk7XG4gICAgfSwgMCk7XG4gIH1cbiAgZHVwbGV4Lm9uKCdyZXNwb25zZScsIGFzeW5jIChyZXMpID0+IHtcbiAgICBpZiAoZHVwbGV4Lmxpc3RlbmVyQ291bnQoJ2NvbXBsZXRlJykgPiAwKSB7XG4gICAgICBjb25zdCByZXNCb2R5ID0gYXdhaXQgcmVhZEFsbChkdXBsZXgpO1xuICAgICAgZHVwbGV4LmVtaXQoJ2NvbXBsZXRlJywge1xuICAgICAgICAuLi5yZXMsXG4gICAgICAgIGJvZHk6IHJlc0JvZHksXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4geyBpbnB1dCwgb3V0cHV0LCBzdHJlYW06IGR1cGxleCB9O1xufVxuXG5jb25zdCByZWRpcmVjdFN0YXR1c2VzID0gbmV3IFNldChbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdKTtcblxuLyoqXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZWRpcmVjdChzdGF0dXM6IG51bWJlcikge1xuICByZXR1cm4gcmVkaXJlY3RTdGF0dXNlcy5oYXMoc3RhdHVzKTtcbn1cblxuLyoqXG4gKlxuICovXG5jb25zdCBNQVhfUkVESVJFQ1RfQ09VTlQgPSAxMDtcblxuLyoqXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGVyZm9ybVJlZGlyZWN0UmVxdWVzdChcbiAgcmVxOiBIdHRwUmVxdWVzdCxcbiAgcmVzOiBPbWl0PEh0dHBSZXNwb25zZSwgJ2JvZHknPixcbiAgZm9sbG93UmVkaXJlY3Q6IE5vbk51bGxhYmxlPEh0dHBSZXF1ZXN0T3B0aW9uc1snZm9sbG93UmVkaXJlY3QnXT4sXG4gIGNvdW50ZXI6IG51bWJlcixcbiAgcmVkaXJlY3RDYWxsYmFjazogKHJlcTogSHR0cFJlcXVlc3QpID0+IHZvaWQsXG4pIHtcbiAgaWYgKGNvdW50ZXIgPj0gTUFYX1JFRElSRUNUX0NPVU5UKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdSZWFjaGVkIHRvIG1heGltdW0gcmVkaXJlY3QgY291bnQnKTtcbiAgfVxuICBjb25zdCByZWRpcmVjdFVybCA9IHJlcy5oZWFkZXJzWydsb2NhdGlvbiddO1xuICBpZiAoIXJlZGlyZWN0VXJsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyByZWRpcmVjdCBVUkkgZm91bmQnKTtcbiAgfVxuICBjb25zdCBnZXRSZWRpcmVjdFJlcXVlc3QgPVxuICAgIHR5cGVvZiBmb2xsb3dSZWRpcmVjdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyBmb2xsb3dSZWRpcmVjdFxuICAgICAgOiAoKSA9PiAoe1xuICAgICAgICAgIG1ldGhvZDogJ0dFVCcgYXMgY29uc3QsXG4gICAgICAgICAgdXJsOiByZWRpcmVjdFVybCxcbiAgICAgICAgICBoZWFkZXJzOiByZXEuaGVhZGVycyxcbiAgICAgICAgfSk7XG4gIGNvbnN0IG5leHRSZXFQYXJhbXMgPSBnZXRSZWRpcmVjdFJlcXVlc3QocmVkaXJlY3RVcmwpO1xuICBpZiAoIW5leHRSZXFQYXJhbXMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBoYW5kbGUgcmVkaXJlY3QgZm9yICcgKyByZWRpcmVjdFVybCk7XG4gIH1cbiAgcmVkaXJlY3RDYWxsYmFjayhuZXh0UmVxUGFyYW1zKTtcbn1cblxuLyoqXG4gKlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZVdpdGhUaW1lb3V0PFQ+KFxuICBleGVjRm46ICgpID0+IFByb21pc2U8VD4sXG4gIG1zZWM6IG51bWJlciB8IHVuZGVmaW5lZCxcbiAgY2FuY2VsQ2FsbGJhY2s/OiAoKSA9PiB2b2lkLFxuKTogUHJvbWlzZTxUPiB7XG4gIGxldCB0aW1lb3V0ID0gZmFsc2U7XG4gIGxldCBwaWQgPVxuICAgIG1zZWMgIT0gbnVsbFxuICAgICAgPyBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aW1lb3V0ID0gdHJ1ZTtcbiAgICAgICAgICBjYW5jZWxDYWxsYmFjaz8uKCk7XG4gICAgICAgIH0sIG1zZWMpXG4gICAgICA6IHVuZGVmaW5lZDtcbiAgbGV0IHJlcztcbiAgdHJ5IHtcbiAgICByZXMgPSBhd2FpdCBleGVjRm4oKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBpZiAocGlkKSB7XG4gICAgICBjbGVhclRpbWVvdXQocGlkKTtcbiAgICB9XG4gIH1cbiAgaWYgKHRpbWVvdXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlcXVlc3QgVGltZW91dCcpO1xuICB9XG4gIHJldHVybiByZXM7XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7Ozs7O0FBR0E7QUFDQTtBQUNBO0FBQ08sU0FBU0EsK0JBQVQsQ0FBeUNDLEdBQXpDLEVBQTJEO0VBQ2hFLE1BQU07SUFBRUMsSUFBSSxFQUFFQztFQUFSLElBQW9CRixHQUExQjtFQUNBLE1BQU1HLEtBQUssR0FBRyxJQUFJQyxtQkFBSixFQUFkO0VBQ0EsTUFBTUMsTUFBTSxHQUFHLElBQUlELG1CQUFKLEVBQWY7RUFDQSxNQUFNRSxNQUFNLEdBQUcsSUFBQUMsOEJBQUEsRUFBc0JKLEtBQXRCLEVBQTZCRSxNQUE3QixDQUFmOztFQUNBLElBQUksT0FBT0gsT0FBUCxLQUFtQixXQUF2QixFQUFvQztJQUNsQywwQkFBVyxNQUFNO01BQ2ZJLE1BQU0sQ0FBQ0UsR0FBUCxDQUFXTixPQUFYLEVBQW9CLE1BQXBCO0lBQ0QsQ0FGRCxFQUVHLENBRkg7RUFHRDs7RUFDREksTUFBTSxDQUFDRyxFQUFQLENBQVUsVUFBVixFQUFzQixNQUFPQyxHQUFQLElBQWU7SUFDbkMsSUFBSUosTUFBTSxDQUFDSyxhQUFQ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