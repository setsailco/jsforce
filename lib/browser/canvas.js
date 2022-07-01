"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/json/stringify"));

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.promise.js");

var _stream = require("stream");

/**
 *
 */
function parseHeaders(hs) {
  const headers = {};

  for (const line of hs.split(/\n/)) {
    const [name, value] = line.split(/\s*:\s*/);
    headers[name.toLowerCase()] = value;
  }

  return headers;
}

async function processCanvasRequest(params, signedRequest, requestBody) {
  const settings = {
    client: signedRequest.client,
    method: params.method,
    data: requestBody
  };
  const paramHeaders = params.headers;

  if (paramHeaders) {
    settings.headers = {};

    for (const name of (0, _keys.default)(paramHeaders)) {
      if (name.toLowerCase() === 'content-type') {
        settings.contentType = paramHeaders[name];
      } else {
        settings.headers[name] = paramHeaders[name];
      }
    }
  }

  const data = await new _promise.default((resolve, reject) => {
    settings.success = resolve;
    settings.failure = reject;
    Sfdc.canvas.client.ajax(params.url, settings);
  });
  const headers = parseHeaders(data.responseHeaders);
  let responseBody = data.payload;

  if (typeof responseBody !== 'string') {
    responseBody = (0, _stringify.default)(responseBody);
  }

  return {
    statusCode: data.status,
    headers,
    body: responseBody
  };
}

function createRequest(signedRequest) {
  return params => {
    const buf = [];
    const stream = new _stream.Transform({
      transform(chunk, encoding, callback) {
        buf.push(typeof chunk === 'string' ? chunk : chunk.toString('utf8'));
        callback();
      },

      flush() {
        (async () => {
          const body = buf.join('');
          const response = await processCanvasRequest(params, signedRequest, body);
          stream.emit('response', response);
          stream.emit('complete', response);
          stream.push(response.body);
          stream.push(null);
        })();
      }

    });

    if (params.body) {
      stream.end(params.body);
    }

    return stream;
  };
}

var _default = {
  supported: typeof Sfdc === 'object' && typeof Sfdc.canvas !== 'undefined',
  createRequest
};
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwYXJzZUhlYWRlcnMiLCJocyIsImhlYWRlcnMiLCJsaW5lIiwic3BsaXQiLCJuYW1lIiwidmFsdWUiLCJ0b0xvd2VyQ2FzZSIsInByb2Nlc3NDYW52YXNSZXF1ZXN0IiwicGFyYW1zIiwic2lnbmVkUmVxdWVzdCIsInJlcXVlc3RCb2R5Iiwic2V0dGluZ3MiLCJjbGllbnQiLCJtZXRob2QiLCJkYXRhIiwicGFyYW1IZWFkZXJzIiwiY29udGVudFR5cGUiLCJyZXNvbHZlIiwicmVqZWN0Iiwic3VjY2VzcyIsImZhaWx1cmUiLCJTZmRjIiwiY2FudmFzIiwiYWpheCIsInVybCIsInJlc3BvbnNlSGVhZGVycyIsInJlc3BvbnNlQm9keSIsInBheWxvYWQiLCJzdGF0dXNDb2RlIiwic3RhdHVzIiwiYm9keSIsImNyZWF0ZVJlcXVlc3QiLCJidWYiLCJzdHJlYW0iLCJUcmFuc2Zvcm0iLCJ0cmFuc2Zvcm0iLCJjaHVuayIsImVuY29kaW5nIiwiY2FsbGJhY2siLCJwdXNoIiwidG9TdHJpbmciLCJmbHVzaCIsImpvaW4iLCJyZXNwb25zZSIsImVtaXQiLCJlbmQiLCJzdXBwb3J0ZWQiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvYnJvd3Nlci9jYW52YXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKlxuICovXG5pbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0IHsgSHR0cFJlcXVlc3QsIFNpZ25lZFJlcXVlc3RPYmplY3QgfSBmcm9tICcuLi90eXBlcyc7XG5cbmRlY2xhcmUgdmFyIFNmZGM6IGFueTtcblxudHlwZSBDYW52YXNSZXNwb25zZSA9IHtcbiAgc3RhdHVzOiBzdHJpbmc7XG4gIHJlc3BvbnNlSGVhZGVyczogc3RyaW5nO1xuICBwYXlsb2FkOiBhbnk7XG59O1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlcnMoaHM6IHN0cmluZykge1xuICBjb25zdCBoZWFkZXJzOiBIdHRwUmVxdWVzdFsnaGVhZGVycyddID0ge307XG4gIGZvciAoY29uc3QgbGluZSBvZiBocy5zcGxpdCgvXFxuLykpIHtcbiAgICBjb25zdCBbbmFtZSwgdmFsdWVdID0gbGluZS5zcGxpdCgvXFxzKjpcXHMqLyk7XG4gICAgaGVhZGVyc1tuYW1lLnRvTG93ZXJDYXNlKCldID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIGhlYWRlcnM7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NDYW52YXNSZXF1ZXN0KFxuICBwYXJhbXM6IEh0dHBSZXF1ZXN0LFxuICBzaWduZWRSZXF1ZXN0OiBTaWduZWRSZXF1ZXN0T2JqZWN0LFxuICByZXF1ZXN0Qm9keTogc3RyaW5nLFxuKSB7XG4gIGNvbnN0IHNldHRpbmdzOiBhbnkgPSB7XG4gICAgY2xpZW50OiBzaWduZWRSZXF1ZXN0LmNsaWVudCxcbiAgICBtZXRob2Q6IHBhcmFtcy5tZXRob2QsXG4gICAgZGF0YTogcmVxdWVzdEJvZHksXG4gIH07XG4gIGNvbnN0IHBhcmFtSGVhZGVycyA9IHBhcmFtcy5oZWFkZXJzO1xuICBpZiAocGFyYW1IZWFkZXJzKSB7XG4gICAgc2V0dGluZ3MuaGVhZGVycyA9IHt9O1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiBPYmplY3Qua2V5cyhwYXJhbUhlYWRlcnMpKSB7XG4gICAgICBpZiAobmFtZS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICBzZXR0aW5ncy5jb250ZW50VHlwZSA9IHBhcmFtSGVhZGVyc1tuYW1lXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldHRpbmdzLmhlYWRlcnNbbmFtZV0gPSBwYXJhbUhlYWRlcnNbbmFtZV07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNvbnN0IGRhdGEgPSBhd2FpdCBuZXcgUHJvbWlzZTxDYW52YXNSZXNwb25zZT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHNldHRpbmdzLnN1Y2Nlc3MgPSByZXNvbHZlO1xuICAgIHNldHRpbmdzLmZhaWx1cmUgPSByZWplY3Q7XG4gICAgU2ZkYy5jYW52YXMuY2xpZW50LmFqYXgocGFyYW1zLnVybCwgc2V0dGluZ3MpO1xuICB9KTtcbiAgY29uc3QgaGVhZGVycyA9IHBhcnNlSGVhZGVycyhkYXRhLnJlc3BvbnNlSGVhZGVycyk7XG4gIGxldCByZXNwb25zZUJvZHkgPSBkYXRhLnBheWxvYWQ7XG4gIGlmICh0eXBlb2YgcmVzcG9uc2VCb2R5ICE9PSAnc3RyaW5nJykge1xuICAgIHJlc3BvbnNlQm9keSA9IEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlQm9keSk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBzdGF0dXNDb2RlOiBkYXRhLnN0YXR1cyxcbiAgICBoZWFkZXJzLFxuICAgIGJvZHk6IHJlc3BvbnNlQm9keSBhcyBzdHJpbmcsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJlcXVlc3Qoc2lnbmVkUmVxdWVzdDogU2lnbmVkUmVxdWVzdE9iamVjdCkge1xuICByZXR1cm4gKHBhcmFtczogSHR0cFJlcXVlc3QpID0+IHtcbiAgICBjb25zdCBidWY6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3Qgc3RyZWFtID0gbmV3IFRyYW5zZm9ybSh7XG4gICAgICB0cmFuc2Zvcm0oY2h1bmssIGVuY29kaW5nLCBjYWxsYmFjaykge1xuICAgICAgICBidWYucHVzaCh0eXBlb2YgY2h1bmsgPT09ICdzdHJpbmcnID8gY2h1bmsgOiBjaHVuay50b1N0cmluZygndXRmOCcpKTtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH0sXG4gICAgICBmbHVzaCgpIHtcbiAgICAgICAgKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBjb25zdCBib2R5ID0gYnVmLmpvaW4oJycpO1xuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcHJvY2Vzc0NhbnZhc1JlcXVlc3QoXG4gICAgICAgICAgICBwYXJhbXMsXG4gICAgICAgICAgICBzaWduZWRSZXF1ZXN0LFxuICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHN0cmVhbS5lbWl0KCdyZXNwb25zZScsIHJlc3BvbnNlKTtcbiAgICAgICAgICBzdHJlYW0uZW1pdCgnY29tcGxldGUnLCByZXNwb25zZSk7XG4gICAgICAgICAgc3RyZWFtLnB1c2gocmVzcG9uc2UuYm9keSk7XG4gICAgICAgICAgc3RyZWFtLnB1c2gobnVsbCk7XG4gICAgICAgIH0pKCk7XG4gICAgICB9LFxuICAgIH0pO1xuICAgIGlmIChwYXJhbXMuYm9keSkge1xuICAgICAgc3RyZWFtLmVuZChwYXJhbXMuYm9keSk7XG4gICAgfVxuICAgIHJldHVybiBzdHJlYW07XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgc3VwcG9ydGVkOiB0eXBlb2YgU2ZkYyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIFNmZGMuY2FudmFzICE9PSAndW5kZWZpbmVkJyxcbiAgY3JlYXRlUmVxdWVzdCxcbn07XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdBOztBQUhBO0FBQ0E7QUFDQTtBQVlBLFNBQVNBLFlBQVQsQ0FBc0JDLEVBQXRCLEVBQWtDO0VBQ2hDLE1BQU1DLE9BQStCLEdBQUcsRUFBeEM7O0VBQ0EsS0FBSyxNQUFNQyxJQUFYLElBQW1CRixFQUFFLENBQUNHLEtBQUgsQ0FBUyxJQUFULENBQW5CLEVBQW1DO0lBQ2pDLE1BQU0sQ0FBQ0MsSUFBRCxFQUFPQyxLQUFQLElBQWdCSCxJQUFJLENBQUNDLEtBQUwsQ0FBVyxTQUFYLENBQXRCO0lBQ0FGLE9BQU8sQ0FBQ0csSUFBSSxDQUFDRSxXQUFMLEVBQUQsQ0FBUCxHQUE4QkQsS0FBOUI7RUFDRDs7RUFDRCxPQUFPSixPQUFQO0FBQ0Q7O0FBRUQsZUFBZU0sb0JBQWYsQ0FDRUMsTUFERixFQUVFQyxhQUZGLEVBR0VDLFdBSEYsRUFJRTtFQUNBLE1BQU1DLFFBQWEsR0FBRztJQUNwQkMsTUFBTSxFQUFFSCxhQUFhLENBQUNHLE1BREY7SUFFcEJDLE1BQU0sRUFBRUwsTUFBTSxDQUFDSyxNQUZLO0lBR3BCQyxJQUFJLEVBQUVKO0VBSGMs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