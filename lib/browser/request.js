"use strict";

var _Object$keys = require("@babel/runtime-corejs3/core-js-stable/object/keys");

var _Object$getOwnPropertySymbols = require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-symbols");

var _filterInstanceProperty2 = require("@babel/runtime-corejs3/core-js-stable/instance/filter");

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

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/filter"));

var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/trim"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/reduce"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectWithoutProperties"));

require("core-js/modules/es.promise.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.array.iterator.js");

var _requestHelper = require("../request-helper");

var _stream = require("../util/stream");

const _excluded = ["url", "body"];

function ownKeys(object, enumerableOnly) { var keys = _Object$keys(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty2(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context3, _context4; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context3 = ownKeys(Object(source), !0)).call(_context3, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context4 = ownKeys(Object(source))).call(_context4, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * As the request streming is not yet supported on major browsers,
 * it is set to false for now.
 */
const supportsReadableStream = false;
/*
(async () => {
  try {
    if (
      typeof fetch === 'function' &&
      typeof Request === 'function' &&
      typeof ReadableStream === 'function'
    ) {
      // this feature detection requires dummy POST request
      const req = new Request('data:text/plain,', {
        method: 'POST',
        body: new ReadableStream(),
      });
      // if it has content-type header it doesn't regard body as stream
      if (req.headers.has('Content-Type')) {
        return false;
      }
      await (await fetch(req)).text();
      return true;
    }
  } catch (e) {
    // error might occur in env with CSP without connect-src data:
    return false;
  }
  return false;
})();
*/

/**
 *
 */

function toWhatwgReadableStream(ins) {
  return new ReadableStream({
    start(controller) {
      ins.on('data', chunk => controller.enqueue(chunk));
      ins.on('end', () => controller.close());
    }

  });
}
/**
 *
 */


async function readWhatwgReadableStream(rs, outs) {
  const reader = rs.getReader();

  async function readAndWrite() {
    const {
      done,
      value
    } = await reader.read();

    if (done) {
      outs.end();
      return false;
    }

    outs.write(value);
    return true;
  }

  while (await readAndWrite());
}
/**
 *
 */


async function startFetchRequest(request, options, input, output, emitter, counter = 0) {
  const {
    followRedirect
  } = options;
  const {
    url,
    body: reqBody
  } = request,
        rreq = (0, _objectWithoutProperties2.default)(request, _excluded);
  const body = input && /^(post|put|patch)$/i.test(request.method) ? supportsReadableStream ? toWhatwgReadableStream(input) : await (0, _stream.readAll)(input) : undefined;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
  const res = await (0, _requestHelper.executeWithTimeout)(() => fetch(url, _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, rreq), body ? {
    body
  } : {}), {}, {
    redirect: 'manual'
  }, controller ? {
    signal: controller.signal
  } : {}), {
    allowHTTP1ForStreamingUpload: true
  })), options.timeout, () => controller === null || controller === void 0 ? void 0 : controller.abort());
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

  if (res.body) {
    readWhatwgReadableStream(res.body, output);
  } else {
    output.end();
  }
}
/**
 *
 */


function getResponseHeaderNames(xhr) {
  var _context2;

  const headerLines = (0, _filter.default)(_context2 = (xhr.getAllResponseHeaders() || '').split(/[\r\n]+/)).call(_context2, l => (0, _trim.default)(l).call(l) !== '');
  return (0, _map.default)(headerLines).call(headerLines, headerLine => headerLine.split(/\s*:/)[0].toLowerCase());
}
/**
 *
 */


async function startXmlHttpRequest(request, options, input, output, emitter, counter = 0) {
  const {
    method,
    url,
    headers: reqHeaders
  } = request;
  const {
    followRedirect
  } = options;
  const reqBody = input && /^(post|put|patch)$/i.test(method) ? await (0, _stream.readAll)(input) : null;
  const xhr = new XMLHttpRequest();
  await (0, _requestHelper.executeWithTimeout)(() => {
    xhr.open(method, url);

    if (reqHeaders) {
      for (const header in reqHeaders) {
        xhr.setRequestHeader(header, reqHeaders[header]);
      }
    }

    if (options.timeout) {
      xhr.timeout = options.timeout;
    }

    xhr.responseType = 'arraybuffer';
    xhr.send(reqBody);
    return new _promise.default((resolve, reject) => {
      xhr.onload = () => resolve();

      xhr.onerror = reject;
      xhr.ontimeout = reject;
      xhr.onabort = reject;
    });
  }, options.timeout, () => xhr.abort());
  const headerNames = getResponseHeaderNames(xhr);
  const headers = (0, _reduce.default)(headerNames).call(headerNames, (headers, headerName) => _objectSpread(_objectSpread({}, headers), {}, {
    [headerName]: xhr.getResponseHeader(headerName) || ''
  }), {});
  const response = {
    statusCode: xhr.status,
    headers: headers
  };

  if (followRedirect && (0, _requestHelper.isRedirect)(response.statusCode)) {
    try {
      (0, _requestHelper.performRedirectRequest)(request, response, followRedirect, counter, req => startXmlHttpRequest(req, options, undefined, output, emitter, counter + 1));
    } catch (err) {
      emitter.emit('error', err);
    }

    return;
  }

  let body;

  if (!response.statusCode) {
    response.statusCode = 400;
    body = Buffer.from('Access Declined');
  } else {
    body = Buffer.from(xhr.response);
  }

  emitter.emit('response', response);
  output.write(body);
  output.end();
}
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


function request(req, options_ = {}) {
  const options = _objectSpread(_objectSpread({}, defaults), options_);

  const {
    input,
    output,
    stream
  } = (0, _requestHelper.createHttpRequestHandlerStreams)(req);

  if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    startFetchRequest(req, options, input, output, stream);
  } else {
    startXmlHttpRequest(req, options, input, output, stream);
  }

  return stream;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzdXBwb3J0c1JlYWRhYmxlU3RyZWFtIiwidG9XaGF0d2dSZWFkYWJsZVN0cmVhbSIsImlucyIsIlJlYWRhYmxlU3RyZWFtIiwic3RhcnQiLCJjb250cm9sbGVyIiwib24iLCJjaHVuayIsImVucXVldWUiLCJjbG9zZSIsInJlYWRXaGF0d2dSZWFkYWJsZVN0cmVhbSIsInJzIiwib3V0cyIsInJlYWRlciIsImdldFJlYWRlciIsInJlYWRBbmRXcml0ZSIsImRvbmUiLCJ2YWx1ZSIsInJlYWQiLCJlbmQiLCJ3cml0ZSIsInN0YXJ0RmV0Y2hSZXF1ZXN0IiwicmVxdWVzdCIsIm9wdGlvbnMiLCJpbnB1dCIsIm91dHB1dCIsImVtaXR0ZXIiLCJjb3VudGVyIiwiZm9sbG93UmVkaXJlY3QiLCJ1cmwiLCJib2R5IiwicmVxQm9keSIsInJyZXEiLCJ0ZXN0IiwibWV0aG9kIiwicmVhZEFsbCIsInVuZGVmaW5lZCIsIkFib3J0Q29udHJvbGxlciIsInJlcyIsImV4ZWN1dGVXaXRoVGltZW91dCIsImZldGNoIiwicmVkaXJlY3QiLCJzaWduYWwiLCJhbGxvd0hUVFAxRm9yU3RyZWFtaW5nVXBsb2FkIiwidGltZW91dCIsImFib3J0IiwiaGVhZGVycyIsImhlYWRlck5hbWUiLCJ0b0xvd2VyQ2FzZSIsImdldCIsInJlc3BvbnNlIiwic3RhdHVzQ29kZSIsInN0YXR1cyIsImlzUmVkaXJlY3QiLCJwZXJmb3JtUmVkaXJlY3RSZXF1ZXN0IiwicmVxIiwiZXJyIiwiZW1pdCIsImdldFJlc3BvbnNlSGVhZGVyTmFtZXMiLCJ4aHIiLCJoZWFkZXJMaW5lcyIsImdldEFsbFJlc3BvbnNlSGVhZGVycyIsInNwbGl0IiwibCIsImhlYWRlckxpbmUiLCJzdGFydFhtbEh0dHBSZXF1ZXN0IiwicmVxSGVhZGVycyIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsImhlYWRlciIsInNldFJlcXVlc3RIZWFkZXIiLCJyZXNwb25zZVR5cGUiLCJzZW5kIiwicmVzb2x2ZSIsInJlamVjdCIsIm9ubG9hZCIsIm9uZXJyb3IiLCJvbnRpbWVvdXQiLCJvbmFib3J0IiwiaGVhZGVyTmFtZXMiLCJnZXRSZXNwb25zZUhlYWRlciIsIkJ1ZmZlciIsImZyb20iLCJkZWZhdWx0cyIsInNldERlZmF1bHRzIiwiZGVmYXVsdHNfIiwib3B0aW9uc18iLCJzdHJlYW0iLCJjcmVhdGVIdHRwUmVxdWVzdEhhbmRsZXJTdHJlYW1zIiwid2luZG93Il0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jyb3dzZXIvcmVxdWVzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHsgUmVhZGFibGUsIFdyaXRhYmxlIH0gZnJvbSAnc3RyZWFtJztcbmltcG9ydCB7XG4gIGNyZWF0ZUh0dHBSZXF1ZXN0SGFuZGxlclN0cmVhbXMsXG4gIGV4ZWN1dGVXaXRoVGltZW91dCxcbiAgaXNSZWRpcmVjdCxcbiAgcGVyZm9ybVJlZGlyZWN0UmVxdWVzdCxcbn0gZnJvbSAnLi4vcmVxdWVzdC1oZWxwZXInO1xuaW1wb3J0IHsgcmVhZEFsbCB9IGZyb20gJy4uL3V0aWwvc3RyZWFtJztcbmltcG9ydCB7IEh0dHBSZXF1ZXN0LCBIdHRwUmVxdWVzdE9wdGlvbnMgfSBmcm9tICcuLi90eXBlcyc7XG5cbi8qKlxuICogQXMgdGhlIHJlcXVlc3Qgc3RyZW1pbmcgaXMgbm90IHlldCBzdXBwb3J0ZWQgb24gbWFqb3IgYnJvd3NlcnMsXG4gKiBpdCBpcyBzZXQgdG8gZmFsc2UgZm9yIG5vdy5cbiAqL1xuY29uc3Qgc3VwcG9ydHNSZWFkYWJsZVN0cmVhbSA9IGZhbHNlO1xuXG4vKlxuKGFzeW5jICgpID0+IHtcbiAgdHJ5IHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgZmV0Y2ggPT09ICdmdW5jdGlvbicgJiZcbiAgICAgIHR5cGVvZiBSZXF1ZXN0ID09PSAnZnVuY3Rpb24nICYmXG4gICAgICB0eXBlb2YgUmVhZGFibGVTdHJlYW0gPT09ICdmdW5jdGlvbidcbiAgICApIHtcbiAgICAgIC8vIHRoaXMgZmVhdHVyZSBkZXRlY3Rpb24gcmVxdWlyZXMgZHVtbXkgUE9TVCByZXF1ZXN0XG4gICAgICBjb25zdCByZXEgPSBuZXcgUmVxdWVzdCgnZGF0YTp0ZXh0L3BsYWluLCcsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGJvZHk6IG5ldyBSZWFkYWJsZVN0cmVhbSgpLFxuICAgICAgfSk7XG4gICAgICAvLyBpZiBpdCBoYXMgY29udGVudC10eXBlIGhlYWRlciBpdCBkb2Vzbid0IHJlZ2FyZCBib2R5IGFzIHN0cmVhbVxuICAgICAgaWYgKHJlcS5oZWFkZXJzLmhhcygnQ29udGVudC1UeXBlJykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgYXdhaXQgKGF3YWl0IGZldGNoKHJlcSkpLnRleHQoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIGVycm9yIG1pZ2h0IG9jY3VyIGluIGVudiB3aXRoIENTUCB3aXRob3V0IGNvbm5lY3Qtc3JjIGRhdGE6XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn0pKCk7XG4qL1xuXG4vKipcbiAqXG4gKi9cbmZ1bmN0aW9uIHRvV2hhdHdnUmVhZGFibGVTdHJlYW0oaW5zOiBSZWFkYWJsZSk6IFJlYWRhYmxlU3RyZWFtIHtcbiAgcmV0dXJuIG5ldyBSZWFkYWJsZVN0cmVhbSh7XG4gICAgc3RhcnQoY29udHJvbGxlcikge1xuICAgICAgaW5zLm9uKCdkYXRhJywgKGNodW5rKSA9PiBjb250cm9sbGVyLmVucXVldWUoY2h1bmspKTtcbiAgICAgIGlucy5vbignZW5kJywgKCkgPT4gY29udHJvbGxlci5jbG9zZSgpKTtcbiAgICB9LFxuICB9KTtcbn1cblxuLyoqXG4gKlxuICovXG5hc3luYyBmdW5jdGlvbiByZWFkV2hhdHdnUmVhZGFibGVTdHJlYW0ocnM6IFJlYWRhYmxlU3RyZWFtLCBvdXRzOiBXcml0YWJsZSkge1xuICBjb25zdCByZWFkZXIgPSBycy5nZXRSZWFkZXIoKTtcbiAgYXN5bmMgZnVuY3Rpb24gcmVhZEFuZFdyaXRlKCkge1xuICAgIGNvbnN0IHsgZG9uZSwgdmFsdWUgfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG4gICAgaWYgKGRvbmUpIHtcbiAgICAgIG91dHMuZW5kKCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIG91dHMud3JpdGUodmFsdWUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHdoaWxlIChhd2FpdCByZWFkQW5kV3JpdGUoKSk7XG59XG5cbi8qKlxuICpcbiAqL1xuYXN5bmMgZnVuY3Rpb24gc3RhcnRGZXRjaFJlcXVlc3QoXG4gIHJlcXVlc3Q6IEh0dHBSZXF1ZXN0LFxuICBvcHRpb25zOiBIdHRwUmVxdWVzdE9wdGlvbnMsXG4gIGlucHV0OiBSZWFkYWJsZSB8IHVuZGVmaW5lZCxcbiAgb3V0cHV0OiBXcml0YWJsZSxcbiAgZW1pdHRlcjogRXZlbnRFbWl0dGVyLFxuICBjb3VudGVyOiBudW1iZXIgPSAwLFxuKSB7XG4gIGNvbnN0IHsgZm9sbG93UmVkaXJlY3QgfSA9IG9wdGlvbnM7XG4gIGNvbnN0IHsgdXJsLCBib2R5OiByZXFCb2R5LCAuLi5ycmVxIH0gPSByZXF1ZXN0O1xuICBjb25zdCBib2R5ID1cbiAgICBpbnB1dCAmJiAvXihwb3N0fHB1dHxwYXRjaCkkL2kudGVzdChyZXF1ZXN0Lm1ldGhvZClcbiAgICAgID8gc3VwcG9ydHNSZWFkYWJsZVN0cmVhbVxuICAgICAgICA/IHRvV2hhdHdnUmVhZGFibGVTdHJlYW0oaW5wdXQpXG4gICAgICAgIDogYXdhaXQgcmVhZEFsbChpbnB1dClcbiAgICAgIDogdW5kZWZpbmVkO1xuICBjb25zdCBjb250cm9sbGVyID1cbiAgICB0eXBlb2YgQWJvcnRDb250cm9sbGVyICE9PSAndW5kZWZpbmVkJyA/IG5ldyBBYm9ydENvbnRyb2xsZXIoKSA6IHVuZGVmaW5lZDtcbiAgY29uc3QgcmVzID0gYXdhaXQgZXhlY3V0ZVdpdGhUaW1lb3V0KFxuICAgICgpID0+XG4gICAgICBmZXRjaCh1cmwsIHtcbiAgICAgICAgLi4ucnJlcSxcbiAgICAgICAgLi4uKGJvZHkgPyB7IGJvZHkgfSA6IHt9KSxcbiAgICAgICAgcmVkaXJlY3Q6ICdtYW51YWwnLFxuICAgICAgICAuLi4oY29udHJvbGxlciA/IHsgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCB9IDoge30pLFxuICAgICAgICAuLi4oeyBhbGxvd0hUVFAxRm9yU3RyZWFtaW5nVXBsb2FkOiB0cnVlIH0gYXMgYW55KSwgLy8gQ2hyb21lIGFsbG93cyByZXF1ZXN0IHN0cmVhbSBvbmx5IGluIEhUVFAyL1FVSUMgdW5sZXNzIHRoaXMgb3B0LWluIGZsYWdcbiAgICAgIH0pLFxuICAgIG9wdGlvbnMudGltZW91dCxcbiAgICAoKSA9PiBjb250cm9sbGVyPy5hYm9ydCgpLFxuICApO1xuICBjb25zdCBoZWFkZXJzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gIGZvciAoY29uc3QgaGVhZGVyTmFtZSBvZiByZXMuaGVhZGVycy5rZXlzKCkpIHtcbiAgICBoZWFkZXJzW2hlYWRlck5hbWUudG9Mb3dlckNhc2UoKV0gPSByZXMuaGVhZGVycy5nZXQoaGVhZGVyTmFtZSk7XG4gIH1cbiAgY29uc3QgcmVzcG9uc2UgPSB7XG4gICAgc3RhdHVzQ29kZTogcmVzLnN0YXR1cyxcbiAgICBoZWFkZXJzLFxuICB9O1xuICBpZiAoZm9sbG93UmVkaXJlY3QgJiYgaXNSZWRpcmVjdChyZXNwb25zZS5zdGF0dXNDb2RlKSkge1xuICAgIHRyeSB7XG4gICAgICBwZXJmb3JtUmVkaXJlY3RSZXF1ZXN0KFxuICAgICAgICByZXF1ZXN0LFxuICAgICAgICByZXNwb25zZSxcbiAgICAgICAgZm9sbG93UmVkaXJlY3QsXG4gICAgICAgIGNvdW50ZXIsXG4gICAgICAgIChyZXEpID0+XG4gICAgICAgICAgc3RhcnRGZXRjaFJlcXVlc3QoXG4gICAgICAgICAgICByZXEsXG4gICAgICAgICAgICBvcHRpb25zLFxuICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgb3V0cHV0LFxuICAgICAgICAgICAgZW1pdHRlcixcbiAgICAgICAgICAgIGNvdW50ZXIgKyAxLFxuICAgICAgICAgICksXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgZW1pdHRlci5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuICBlbWl0dGVyLmVtaXQoJ3Jlc3BvbnNlJywgcmVzcG9uc2UpO1xuICBpZiAocmVzLmJvZHkpIHtcbiAgICByZWFkV2hhdHdnUmVhZGFibGVTdHJlYW0ocmVzLmJvZHksIG91dHB1dCk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0LmVuZCgpO1xuICB9XG59XG5cbi8qKlxuICpcbiAqL1xuZnVuY3Rpb24gZ2V0UmVzcG9uc2VIZWFkZXJOYW1lcyh4aHI6IFhNTEh0dHBSZXF1ZXN0KSB7XG4gIGNvbnN0IGhlYWRlckxpbmVzID0gKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSB8fCAnJylcbiAgICAuc3BsaXQoL1tcXHJcXG5dKy8pXG4gICAgLmZpbHRlcigobCkgPT4gbC50cmltKCkgIT09ICcnKTtcbiAgcmV0dXJuIGhlYWRlckxpbmVzLm1hcCgoaGVhZGVyTGluZSkgPT5cbiAgICBoZWFkZXJMaW5lLnNwbGl0KC9cXHMqOi8pWzBdLnRvTG93ZXJDYXNlKCksXG4gICk7XG59XG5cbi8qKlxuICpcbiAqL1xuYXN5bmMgZnVuY3Rpb24gc3RhcnRYbWxIdHRwUmVxdWVzdChcbiAgcmVxdWVzdDogSHR0cFJlcXVlc3QsXG4gIG9wdGlvbnM6IEh0dHBSZXF1ZXN0T3B0aW9ucyxcbiAgaW5wdXQ6IFJlYWRhYmxlIHwgdW5kZWZpbmVkLFxuICBvdXRwdXQ6IFdyaXRhYmxlLFxuICBlbWl0dGVyOiBFdmVudEVtaXR0ZXIsXG4gIGNvdW50ZXI6IG51bWJlciA9IDAsXG4pIHtcbiAgY29uc3QgeyBtZXRob2QsIHVybCwgaGVhZGVyczogcmVxSGVhZGVycyB9ID0gcmVxdWVzdDtcbiAgY29uc3QgeyBmb2xsb3dSZWRpcmVjdCB9ID0gb3B0aW9ucztcbiAgY29uc3QgcmVxQm9keSA9XG4gICAgaW5wdXQgJiYgL14ocG9zdHxwdXR8cGF0Y2gpJC9pLnRlc3QobWV0aG9kKSA/IGF3YWl0IHJlYWRBbGwoaW5wdXQpIDogbnVsbDtcbiAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIGF3YWl0IGV4ZWN1dGVXaXRoVGltZW91dChcbiAgICAoKSA9PiB7XG4gICAgICB4aHIub3BlbihtZXRob2QsIHVybCk7XG4gICAgICBpZiAocmVxSGVhZGVycykge1xuICAgICAgICBmb3IgKGNvbnN0IGhlYWRlciBpbiByZXFIZWFkZXJzKSB7XG4gICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyLCByZXFIZWFkZXJzW2hlYWRlcl0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy50aW1lb3V0KSB7XG4gICAgICAgIHhoci50aW1lb3V0ID0gb3B0aW9ucy50aW1lb3V0O1xuICAgICAgfVxuICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG4gICAgICB4aHIuc2VuZChyZXFCb2R5KTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHhoci5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKCk7XG4gICAgICAgIHhoci5vbmVycm9yID0gcmVqZWN0O1xuICAgICAgICB4aHIub250aW1lb3V0ID0gcmVqZWN0O1xuICAgICAgICB4aHIub25hYm9ydCA9IHJlamVjdDtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgb3B0aW9ucy50aW1lb3V0LFxuICAgICgpID0+IHhoci5hYm9ydCgpLFxuICApO1xuICBjb25zdCBoZWFkZXJOYW1lcyA9IGdldFJlc3BvbnNlSGVhZGVyTmFtZXMoeGhyKTtcbiAgY29uc3QgaGVhZGVycyA9IGhlYWRlck5hbWVzLnJlZHVjZShcbiAgICAoaGVhZGVycywgaGVhZGVyTmFtZSkgPT4gKHtcbiAgICAgIC4uLmhlYWRlcnMsXG4gICAgICBbaGVhZGVyTmFtZV06IHhoci5nZXRSZXNwb25zZUhlYWRlcihoZWFkZXJOYW1lKSB8fCAnJyxcbiAgICB9KSxcbiAgICB7fSBhcyB7IFtuYW1lOiBzdHJpbmddOiBzdHJpbmcgfSxcbiAgKTtcbiAgY29uc3QgcmVzcG9uc2UgPSB7XG4gICAgc3RhdHVzQ29kZTogeGhyLnN0YXR1cyxcbiAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICB9O1xuICBpZiAoZm9sbG93UmVkaXJlY3QgJiYgaXNSZWRpcmVjdChyZXNwb25zZS5zdGF0dXNDb2RlKSkge1xuICAgIHRyeSB7XG4gICAgICBwZXJmb3JtUmVkaXJlY3RSZXF1ZXN0KFxuICAgICAgICByZXF1ZXN0LFxuICAgICAgICByZXNwb25zZSxcbiAgICAgICAgZm9sbG93UmVkaXJlY3QsXG4gICAgICAgIGNvdW50ZXIsXG4gICAgICAgIChyZXEpID0+XG4gICAgICAgICAgc3RhcnRYbWxIdHRwUmVxdWVzdChcbiAgICAgICAgICAgIHJlcSxcbiAgICAgICAgICAgIG9wdGlvbnMsXG4gICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICBvdXRwdXQsXG4gICAgICAgICAgICBlbWl0dGVyLFxuICAgICAgICAgICAgY291bnRlciArIDEsXG4gICAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBlbWl0dGVyLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG4gIGxldCBib2R5OiBCdWZmZXI7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzQ29kZSkge1xuICAgIHJlc3BvbnNlLnN0YXR1c0NvZGUgPSA0MDA7XG4gICAgYm9keSA9IEJ1ZmZlci5mcm9tKCdBY2Nlc3MgRGVjbGluZWQnKTtcbiAgfSBlbHNlIHtcbiAgICBib2R5ID0gQnVmZmVyLmZyb20oeGhyLnJlc3BvbnNlKTtcbiAgfVxuICBlbWl0dGVyLmVtaXQoJ3Jlc3BvbnNlJywgcmVzcG9uc2UpO1xuICBvdXRwdXQud3JpdGUoYm9keSk7XG4gIG91dHB1dC5lbmQoKTtcbn1cblxuLyoqXG4gKlxuICovXG5sZXQgZGVmYXVsdHM6IEh0dHBSZXF1ZXN0T3B0aW9ucyA9IHt9O1xuXG4vKipcbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXREZWZhdWx0cyhkZWZhdWx0c186IEh0dHBSZXF1ZXN0T3B0aW9ucykge1xuICBkZWZhdWx0cyA9IGRlZmF1bHRzXztcbn1cblxuLyoqXG4gKlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZXF1ZXN0KFxuICByZXE6IEh0dHBSZXF1ZXN0LFxuICBvcHRpb25zXzogSHR0cFJlcXVlc3RPcHRpb25zID0ge30sXG4pIHtcbiAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdHMsIC4uLm9wdGlvbnNfIH07XG4gIGNvbnN0IHsgaW5wdXQsIG91dHB1dCwgc3RyZWFtIH0gPSBjcmVhdGVIdHRwUmVxdWVzdEhhbmRsZXJTdHJlYW1zKHJlcSk7XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93LmZldGNoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgc3RhcnRGZXRjaFJlcXVlc3QocmVxLCBvcHRpb25zLCBpbnB1dCwgb3V0cHV0LCBzdHJlYW0pO1xuICB9IGVsc2Uge1xuICAgIHN0YXJ0WG1sSHR0cFJlcXVlc3QocmVxLCBvcHRpb25zLCBpbnB1dCwgb3V0cHV0LCBzdHJlYW0pO1xuICB9XG4gIHJldHVybiBzdHJlYW07XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQTs7QUFNQTs7Ozs7Ozs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1BLHNCQUFzQixHQUFHLEtBQS9CO0FBRUE7QUFDQTtBQUNBO0FBQ0E7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