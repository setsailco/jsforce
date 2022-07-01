"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/index-of"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _setTimeout2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/set-timeout"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/json/stringify"));

require("core-js/modules/es.promise.js");

var _stream = require("stream");

/**
 *
 */
let _index = 0;

async function processJsonpRequest(params, jsonpParam, timeout) {
  if (params.method.toUpperCase() !== 'GET') {
    throw new Error('JSONP only supports GET request.');
  }

  _index += 1;
  const cbFuncName = `_jsforce_jsonpCallback_${_index}`;
  const callbacks = window;
  let url = params.url;
  url += (0, _indexOf.default)(url).call(url, '?') > 0 ? '&' : '?';
  url += `${jsonpParam}=${cbFuncName}`;
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;

  if (document.documentElement) {
    document.documentElement.appendChild(script);
  }

  let pid;

  try {
    const res = await new _promise.default((resolve, reject) => {
      pid = (0, _setTimeout2.default)(() => {
        reject(new Error('JSONP call time out.'));
      }, timeout);
      callbacks[cbFuncName] = resolve;
    });
    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json'
      },
      body: (0, _stringify.default)(res)
    };
  } finally {
    clearTimeout(pid);

    if (document.documentElement) {
      document.documentElement.removeChild(script);
    }

    delete callbacks[cbFuncName];
  }
}

function createRequest(jsonpParam = 'callback', timeout = 10000) {
  return params => {
    const stream = new _stream.Transform({
      transform(chunk, encoding, callback) {
        callback();
      },

      flush() {
        (async () => {
          const response = await processJsonpRequest(params, jsonpParam, timeout);
          stream.emit('response', response);
          stream.emit('complete', response);
          stream.push(response.body);
          stream.push(null);
        })();
      }

    });
    stream.end();
    return stream;
  };
}

var _default = {
  supported: typeof window !== 'undefined' && typeof document !== 'undefined',
  createRequest
};
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfaW5kZXgiLCJwcm9jZXNzSnNvbnBSZXF1ZXN0IiwicGFyYW1zIiwianNvbnBQYXJhbSIsInRpbWVvdXQiLCJtZXRob2QiLCJ0b1VwcGVyQ2FzZSIsIkVycm9yIiwiY2JGdW5jTmFtZSIsImNhbGxiYWNrcyIsIndpbmRvdyIsInVybCIsInNjcmlwdCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInR5cGUiLCJzcmMiLCJkb2N1bWVudEVsZW1lbnQiLCJhcHBlbmRDaGlsZCIsInBpZCIsInJlcyIsInJlc29sdmUiLCJyZWplY3QiLCJzdGF0dXNDb2RlIiwiaGVhZGVycyIsImJvZHkiLCJjbGVhclRpbWVvdXQiLCJyZW1vdmVDaGlsZCIsImNyZWF0ZVJlcXVlc3QiLCJzdHJlYW0iLCJUcmFuc2Zvcm0iLCJ0cmFuc2Zvcm0iLCJjaHVuayIsImVuY29kaW5nIiwiY2FsbGJhY2siLCJmbHVzaCIsInJlc3BvbnNlIiwiZW1pdCIsInB1c2giLCJlbmQiLCJzdXBwb3J0ZWQiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvYnJvd3Nlci9qc29ucC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqXG4gKi9cbmltcG9ydCB7IFRyYW5zZm9ybSB9IGZyb20gJ3N0cmVhbSc7XG5pbXBvcnQgeyBIdHRwUmVxdWVzdCB9IGZyb20gJy4uL3R5cGVzJztcblxubGV0IF9pbmRleCA9IDA7XG5cbmFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NKc29ucFJlcXVlc3QoXG4gIHBhcmFtczogSHR0cFJlcXVlc3QsXG4gIGpzb25wUGFyYW06IHN0cmluZyxcbiAgdGltZW91dDogbnVtYmVyLFxuKSB7XG4gIGlmIChwYXJhbXMubWV0aG9kLnRvVXBwZXJDYXNlKCkgIT09ICdHRVQnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdKU09OUCBvbmx5IHN1cHBvcnRzIEdFVCByZXF1ZXN0LicpO1xuICB9XG4gIF9pbmRleCArPSAxO1xuICBjb25zdCBjYkZ1bmNOYW1lID0gYF9qc2ZvcmNlX2pzb25wQ2FsbGJhY2tfJHtfaW5kZXh9YDtcbiAgY29uc3QgY2FsbGJhY2tzOiBhbnkgPSB3aW5kb3c7XG4gIGxldCB1cmwgPSBwYXJhbXMudXJsO1xuICB1cmwgKz0gdXJsLmluZGV4T2YoJz8nKSA+IDAgPyAnJicgOiAnPyc7XG4gIHVybCArPSBgJHtqc29ucFBhcmFtfT0ke2NiRnVuY05hbWV9YDtcbiAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gIHNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG4gIHNjcmlwdC5zcmMgPSB1cmw7XG4gIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpIHtcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgfVxuICBsZXQgcGlkO1xuICB0cnkge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHBpZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdKU09OUCBjYWxsIHRpbWUgb3V0LicpKTtcbiAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgY2FsbGJhY2tzW2NiRnVuY05hbWVdID0gcmVzb2x2ZTtcbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShyZXMpLFxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgY2xlYXJUaW1lb3V0KHBpZCk7XG4gICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkge1xuICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gICAgfVxuICAgIGRlbGV0ZSBjYWxsYmFja3NbY2JGdW5jTmFtZV07XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlUmVxdWVzdChcbiAganNvbnBQYXJhbTogc3RyaW5nID0gJ2NhbGxiYWNrJyxcbiAgdGltZW91dDogbnVtYmVyID0gMTAwMDAsXG4pIHtcbiAgcmV0dXJuIChwYXJhbXM6IEh0dHBSZXF1ZXN0KSA9PiB7XG4gICAgY29uc3Qgc3RyZWFtID0gbmV3IFRyYW5zZm9ybSh7XG4gICAgICB0cmFuc2Zvcm0oY2h1bmssIGVuY29kaW5nLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfSxcbiAgICAgIGZsdXNoKCkge1xuICAgICAgICAoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcHJvY2Vzc0pzb25wUmVxdWVzdChcbiAgICAgICAgICAgIHBhcmFtcyxcbiAgICAgICAgICAgIGpzb25wUGFyYW0sXG4gICAgICAgICAgICB0aW1lb3V0LFxuICAgICAgICAgICk7XG4gICAgICAgICAgc3RyZWFtLmVtaXQoJ3Jlc3BvbnNlJywgcmVzcG9uc2UpO1xuICAgICAgICAgIHN0cmVhbS5lbWl0KCdjb21wbGV0ZScsIHJlc3BvbnNlKTtcbiAgICAgICAgICBzdHJlYW0ucHVzaChyZXNwb25zZS5ib2R5KTtcbiAgICAgICAgICBzdHJlYW0ucHVzaChudWxsKTtcbiAgICAgICAgfSkoKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgc3RyZWFtLmVuZCgpO1xuICAgIHJldHVybiBzdHJlYW07XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgc3VwcG9ydGVkOiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnLFxuICBjcmVhdGVSZXF1ZXN0LFxufTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdBOztBQUhBO0FBQ0E7QUFDQTtBQUlBLElBQUlBLE1BQU0sR0FBRyxDQUFiOztBQUVBLGVBQWVDLG1CQUFmLENBQ0VDLE1BREYsRUFFRUMsVUFGRixFQUdFQyxPQUhGLEVBSUU7RUFDQSxJQUFJRixNQUFNLENBQUNHLE1BQVAsQ0FBY0MsV0FBZCxPQUFnQyxLQUFwQyxFQUEyQztJQUN6QyxNQUFNLElBQUlDLEtBQUosQ0FBVSxrQ0FBVixDQUFOO0VBQ0Q7O0VBQ0RQLE1BQU0sSUFBSSxDQUFWO0VBQ0EsTUFBTVEsVUFBVSxHQUFJLDBCQUF5QlIsTUFBTyxFQUFwRDtFQUNBLE1BQU1TLFNBQWMsR0FBR0MsTUFBdkI7RUFDQSxJQUFJQyxHQUFHLEdBQUdULE1BQU0sQ0FBQ1MsR0FBakI7RUFDQUEsR0FBRyxJQUFJLHNCQUFBQSxHQUFHLE1BQUgsQ0FBQUEsR0FBRyxFQUFTLEdBQVQsQ0FBSCxHQUFtQixDQUFuQixHQUF1QixHQUF2QixHQUE2QixHQUFwQztFQUNBQSxHQUFHLElBQUssR0FBRVIsVUFBVyxJQUFHSyxVQUFXLEVBQW5DO0VBQ0EsTUFBTUksTUFBTSxHQUFHQyxRQUFRLENBQUNDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBZjtFQUNBRixNQUFNLENBQUNHLElBQVAsR0FBYyxpQkFBZDtFQUNBSCxNQUFNLENBQUNJLEdBQVAsR0FBYUwsR0FBYjs7RUFDQSxJQUFJRSxRQUFRLENBQUNJLGVBQWIsRUFBOEI7SUFDNUJKLFFBQVEsQ0FBQ0ksZUFBVCxDQUF5QkMsV0FBekIsQ0FBcUNOLE1BQXJDO0VBQ0Q7O0VBQ0QsSUFBSU8sR0FBSjs7RUFDQSxJQUFJO0lBQ0YsTUFBTUMsR0FBRyxHQUFHLE1BQU0scUJBQVksQ0FBQ0MsT0FBRCxFQUFVQyxNQUFWLEtBQXFCO01BQ2pESCxHQUFHLEdBQUcsMEJBQVcsTUFBTTtRQUNyQkcsTUFBTSxDQUFDLElBQUlmLEtBQUosQ0FBVSxzQkFBVixDQUFELENBQU47TUFDRCxDQUZLLEVBRUhILE9BRkcsQ0FBTjtNQUdBSyxTQUFTLENBQUNELFVBQUQsQ0FBVCxHQUF3QmEsT0FBeEI7SUFDRCxDQUxpQixDQUFsQjtJQU1BLE9BQU87TUFDTEUsVUFBVSxFQUFFLEdBRFA7TUFFTEMsT0FBTyxFQUFFO1FBQUUsZ0JBQWdCO01BQWxCLENBRko7TUFHTEMsSUFBSSxFQUFFLHdCQUFlTCxHQUFmO0lBSEQsQ0FBUDtFQUtELENBWkQsU0FZVTtJQUNSTSxZQUFZLENBQUNQLEdBQUQsQ0FBWjs7SUFDQSxJQUFJTixRQUFRLENBQUNJLGVBQWIsRUFBOEI7TUFDNUJKLFFBQVEsQ0FBQ0ksZUFBVCxDQUF5QlUsV0FBekIsQ0FBcUNmLE1BQXJDO0lBQ0Q7O0lBQ0QsT0FBT0gsU0FBUyxDQUFDRCxVQUFELENBQWhCO0VBQ0Q7QUFDRjs7QUFFRCxTQUFTb0IsYUFBVCxDQUNFekIsVUFBa0IsR0FBRyxVQUR2QixFQUVFQyxPQUFlLEdBQUcsS0FGcEIsRUFHRTtFQUNBLE9BQVFGLE1BQUQsSUFBeUI7SUFDOUIsTUFBTTJCLE1BQU0sR0FBRyxJQUFJQyxpQkFBSixDQUFjO01BQzNCQyxTQUFTLENBQUNDLEtBQUQsRUFBUUMsUUFBUixFQUFrQkMsUUFBbEIsRUFBNEI7UUFDbkNBLFFBQVE7TUFDVCxDQUgwQjs7TUFJM0JDLEtBQUssR0FBRztRQUNOLENBQUMsWUFBWTtVQUNYLE1BQU1DLFFBQVEsR0FBRyxNQUFNbkMsbUJBQW1CLENBQ3hDQyxNQUR3QyxFQUV4Q0MsVUFGd0MsRUFHeENDLE9BSHdDLENBQTFDO1VBS0F5QixNQUFNLENBQUNRLElBQVAsQ0FBWSxVQUFaLEVBQXdCRCxRQUF4QjtVQUNBUCxNQUFNLENBQUNRLElBQVAsQ0FBWSxVQUFaLEVBQXdCRCxRQUF4QjtVQUNBUCxNQUFNLENBQUNTLElBQVAsQ0FBWUYsUUFBUSxDQUFDWCxJQUFyQjtVQUNBSSxNQUFNLENBQUNTLElBQVAsQ0FBWSxJQUFaO1FBQ0QsQ0FWRDtNQVdEOztJQWhCMEIsQ0FBZCxDQUFmO0lBa0JBVCxNQUFNLENBQUNVLEdBQVA7SUFDQSxPQUFPVixNQUFQO0VBQ0QsQ0FyQkQ7QUFzQkQ7O2VBRWM7RUFDYlcsU0FBUyxFQUFFLE9BQU85QixNQUFQLEtBQWtCLFdBQWxCLElBQWlDLE9BQU9HLFFBQVAsS0FBb0IsV0FEbkQ7RUFFYmU7QUFGYSxDIn0=