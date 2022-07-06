"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = exports.HttpApi = void 0;

var _now = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/date/now"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

require("core-js/modules/es.promise.js");

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.regexp.exec.js");

var _events = require("events");

var _xml2js = _interopRequireDefault(require("xml2js"));

var _logger = require("./util/logger");

var _promise = require("./util/promise");

var _csv = require("./csv");

var _stream = require("./util/stream");

/**
 *
 */

/** @private */
function parseJSON(str) {
  return JSON.parse(str);
}
/** @private */


async function parseXML(str) {
  return _xml2js.default.parseStringPromise(str, {
    explicitArray: false
  });
}
/** @private */


function parseText(str) {
  return str;
}
/**
 * HTTP based API class with authorization hook
 */


class HttpApi extends _events.EventEmitter {
  constructor(conn, options) {
    super();
    (0, _defineProperty2.default)(this, "_conn", void 0);
    (0, _defineProperty2.default)(this, "_logger", void 0);
    (0, _defineProperty2.default)(this, "_transport", void 0);
    (0, _defineProperty2.default)(this, "_responseType", void 0);
    (0, _defineProperty2.default)(this, "_noContentResponse", void 0);
    this._conn = conn;
    this._logger = conn._logLevel ? HttpApi._logger.createInstance(conn._logLevel) : HttpApi._logger;
    this._responseType = options.responseType;
    this._transport = options.transport || conn._transport;
    this._noContentResponse = options.noContentResponse;
  }
  /**
   * Callout to API endpoint using http
   */


  request(request) {
    return _promise.StreamPromise.create(() => {
      const {
        stream,
        setStream
      } = (0, _stream.createLazyStream)();

      const promise = (async () => {
        const refreshDelegate = this.getRefreshDelegate();
        /* TODO decide remove or not this section */

        /*
        // remember previous instance url in case it changes after a refresh
        const lastInstanceUrl = conn.instanceUrl;
         // check to see if the token refresh has changed the instance url
        if(lastInstanceUrl !== conn.instanceUrl){
          // if the instance url has changed
          // then replace the current request urls instance url fragment
          // with the updated instance url
          request.url = request.url.replace(lastInstanceUrl,conn.instanceUrl);
        }
        */

        if (refreshDelegate && refreshDelegate.isRefreshing()) {
          await refreshDelegate.waitRefresh();
          const bodyPromise = this.request(request);
          setStream(bodyPromise.stream());
          const body = await bodyPromise;
          return body;
        } // hook before sending


        this.beforeSend(request);
        this.emit('request', request);

        this._logger.debug(`<request> method=${request.method}, url=${request.url}`);

        const requestTime = (0, _now.default)();

        const requestPromise = this._transport.httpRequest(request);

        setStream(requestPromise.stream());
        let response;

        try {
          response = await requestPromise;
        } catch (err) {
          this._logger.error(err);

          throw err;
        } finally {
          const responseTime = (0, _now.default)();

          this._logger.debug(`elapsed time: ${responseTime - requestTime} msec`);
        }

        if (!response) {
          return;
        }

        this._logger.debug(`<response> status=${String(response.statusCode)}, url=${request.url}`);

        this.emit('response', response); // Refresh token if session has been expired and requires authentication
        // when session refresh delegate is available

        if (this.isSessionExpired(response) && refreshDelegate) {
          await refreshDelegate.refresh(requestTime);
          return this.request(request);
        }

        if (this.isErrorResponse(response)) {
          const err = await this.getError(response);
          throw err;
        }

        const body = await this.getResponseBody(response);
        return body;
      })();

      return {
        stream,
        promise
      };
    });
  }
  /**
   * @protected
   */


  getRefreshDelegate() {
    return this._conn._refreshDelegate;
  }
  /**
   * @protected
   */


  beforeSend(request) {
    /* eslint-disable no-param-reassign */
    const headers = request.headers || {};

    if (this._conn.accessToken) {
      headers.Authorization = `Bearer ${this._conn.accessToken}`;
    }

    if (this._conn._callOptions) {
      const callOptions = [];

      for (const name of (0, _keys.default)(this._conn._callOptions)) {
        callOptions.push(`${name}=${this._conn._callOptions[name]}`);
      }

      headers['Sforce-Call-Options'] = callOptions.join(', ');
    }

    request.headers = headers;
  }
  /**
   * Detect response content mime-type
   * @protected
   */


  getResponseContentType(response) {
    return this._responseType || response.headers && response.headers['content-type'];
  }
  /**
   * @private
   */


  async parseResponseBody(response) {
    const contentType = this.getResponseContentType(response) || '';
    const parseBody = /^(text|application)\/xml(;|$)/.test(contentType) ? parseXML : /^application\/json(;|$)/.test(contentType) ? parseJSON : /^text\/csv(;|$)/.test(contentType) ? _csv.parseCSV : parseText;

    try {
      return parseBody(response.body);
    } catch (e) {
      return response.body;
    }
  }
  /**
   * Get response body
   * @protected
   */


  async getResponseBody(response) {
    if (response.statusCode === 204) {
      // No Content
      return this._noContentResponse;
    }

    const body = await this.parseResponseBody(response);
    let err;

    if (this.hasErrorInResponseBody(body)) {
      err = await this.getError(response, body);
      throw err;
    }

    if (response.statusCode === 300) {
      // Multiple Choices
      throw new HttpApiError('Multiple records found', 'MULTIPLE_CHOICES', body);
    }

    return body;
  }
  /**
   * Detect session expiry
   * @protected
   */


  isSessionExpired(response) {
    return response.statusCode === 401;
  }
  /**
   * Detect error response
   * @protected
   */


  isErrorResponse(response) {
    return response.statusCode >= 400;
  }
  /**
   * Detect error in response body
   * @protected
   */


  hasErrorInResponseBody(_body) {
    return false;
  }
  /**
   * Parsing error message in response
   * @protected
   */


  parseError(body) {
    const errors = body;
    return (0, _isArray.default)(errors) ? errors[0] : errors;
  }
  /**
   * Get error message in response
   * @protected
   */


  async getError(response, body) {
    let error;

    try {
      error = this.parseError(body || (await this.parseResponseBody(response)));
    } catch (e) {// eslint-disable no-empty
    }

    error = typeof error === 'object' && error !== null && typeof error.message === 'string' ? error : {
      errorCode: `ERROR_HTTP_${response.statusCode}`,
      message: response.body
    };
    return new HttpApiError(error.message, error.errorCode);
  }

}
/**
 *
 */


exports.HttpApi = HttpApi;
(0, _defineProperty2.default)(HttpApi, "_logger", (0, _logger.getLogger)('http-api'));

class HttpApiError extends Error {
  constructor(message, errorCode, content) {
    super(message);
    (0, _defineProperty2.default)(this, "errorCode", void 0);
    (0, _defineProperty2.default)(this, "content", void 0);
    this.name = errorCode || this.name;
    this.errorCode = this.name;
    this.content = content;
  }

}

var _default = HttpApi;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwYXJzZUpTT04iLCJzdHIiLCJKU09OIiwicGFyc2UiLCJwYXJzZVhNTCIsInhtbDJqcyIsInBhcnNlU3RyaW5nUHJvbWlzZSIsImV4cGxpY2l0QXJyYXkiLCJwYXJzZVRleHQiLCJIdHRwQXBpIiwiRXZlbnRFbWl0dGVyIiwiY29uc3RydWN0b3IiLCJjb25uIiwib3B0aW9ucyIsIl9jb25uIiwiX2xvZ2dlciIsIl9sb2dMZXZlbCIsImNyZWF0ZUluc3RhbmNlIiwiX3Jlc3BvbnNlVHlwZSIsInJlc3BvbnNlVHlwZSIsIl90cmFuc3BvcnQiLCJ0cmFuc3BvcnQiLCJfbm9Db250ZW50UmVzcG9uc2UiLCJub0NvbnRlbnRSZXNwb25zZSIsInJlcXVlc3QiLCJTdHJlYW1Qcm9taXNlIiwiY3JlYXRlIiwic3RyZWFtIiwic2V0U3RyZWFtIiwiY3JlYXRlTGF6eVN0cmVhbSIsInByb21pc2UiLCJyZWZyZXNoRGVsZWdhdGUiLCJnZXRSZWZyZXNoRGVsZWdhdGUiLCJpc1JlZnJlc2hpbmciLCJ3YWl0UmVmcmVzaCIsImJvZHlQcm9taXNlIiwiYm9keSIsImJlZm9yZVNlbmQiLCJlbWl0IiwiZGVidWciLCJtZXRob2QiLCJ1cmwiLCJyZXF1ZXN0VGltZSIsInJlcXVlc3RQcm9taXNlIiwiaHR0cFJlcXVlc3QiLCJyZXNwb25zZSIsImVyciIsImVycm9yIiwicmVzcG9uc2VUaW1lIiwiU3RyaW5nIiwic3RhdHVzQ29kZSIsImlzU2Vzc2lvbkV4cGlyZWQiLCJyZWZyZXNoIiwiaXNFcnJvclJlc3BvbnNlIiwiZ2V0RXJyb3IiLCJnZXRSZXNwb25zZUJvZHkiLCJfcmVmcmVzaERlbGVnYXRlIiwiaGVhZGVycyIsImFjY2Vzc1Rva2VuIiwiQXV0aG9yaXphdGlvbiIsIl9jYWxsT3B0aW9ucyIsImNhbGxPcHRpb25zIiwibmFtZSIsInB1c2giLCJqb2luIiwiZ2V0UmVzcG9uc2VDb250ZW50VHlwZSIsInBhcnNlUmVzcG9uc2VCb2R5IiwiY29udGVudFR5cGUiLCJwYXJzZUJvZHkiLCJ0ZXN0IiwicGFyc2VDU1YiLCJlIiwiaGFzRXJyb3JJblJlc3BvbnNlQm9keSIsIkh0dHBBcGlFcnJvciIsIl9ib2R5IiwicGFyc2VFcnJvciIsImVycm9ycyIsIm1lc3NhZ2UiLCJlcnJvckNvZGUiLCJnZXRMb2dnZXIiLCJFcnJvciIsImNvbnRlbnQiXSwic291cmNlcyI6WyIuLi9zcmMvaHR0cC1hcGkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKlxuICovXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHhtbDJqcyBmcm9tICd4bWwyanMnO1xuaW1wb3J0IHsgTG9nZ2VyLCBnZXRMb2dnZXIgfSBmcm9tICcuL3V0aWwvbG9nZ2VyJztcbmltcG9ydCB7IFN0cmVhbVByb21pc2UgfSBmcm9tICcuL3V0aWwvcHJvbWlzZSc7XG5pbXBvcnQgQ29ubmVjdGlvbiBmcm9tICcuL2Nvbm5lY3Rpb24nO1xuaW1wb3J0IFRyYW5zcG9ydCBmcm9tICcuL3RyYW5zcG9ydCc7XG5pbXBvcnQgeyBwYXJzZUNTViB9IGZyb20gJy4vY3N2JztcbmltcG9ydCB7IEh0dHBSZXF1ZXN0LCBIdHRwUmVzcG9uc2UsIE9wdGlvbmFsLCBTY2hlbWEgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IGNyZWF0ZUxhenlTdHJlYW0gfSBmcm9tICcuL3V0aWwvc3RyZWFtJztcblxuLyoqIEBwcml2YXRlICovXG5mdW5jdGlvbiBwYXJzZUpTT04oc3RyOiBzdHJpbmcpIHtcbiAgcmV0dXJuIEpTT04ucGFyc2Uoc3RyKTtcbn1cblxuLyoqIEBwcml2YXRlICovXG5hc3luYyBmdW5jdGlvbiBwYXJzZVhNTChzdHI6IHN0cmluZykge1xuICByZXR1cm4geG1sMmpzLnBhcnNlU3RyaW5nUHJvbWlzZShzdHIsIHsgZXhwbGljaXRBcnJheTogZmFsc2UgfSk7XG59XG5cbi8qKiBAcHJpdmF0ZSAqL1xuZnVuY3Rpb24gcGFyc2VUZXh0KHN0cjogc3RyaW5nKSB7XG4gIHJldHVybiBzdHI7XG59XG5cbi8qKlxuICogSFRUUCBiYXNlZCBBUEkgY2xhc3Mgd2l0aCBhdXRob3JpemF0aW9uIGhvb2tcbiAqL1xuZXhwb3J0IGNsYXNzIEh0dHBBcGk8UyBleHRlbmRzIFNjaGVtYT4gZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBzdGF0aWMgX2xvZ2dlciA9IGdldExvZ2dlcignaHR0cC1hcGknKTtcblxuICBfY29ubjogQ29ubmVjdGlvbjxTPjtcbiAgX2xvZ2dlcjogTG9nZ2VyO1xuICBfdHJhbnNwb3J0OiBUcmFuc3BvcnQ7XG4gIF9yZXNwb25zZVR5cGU6IHN0cmluZyB8IHZvaWQ7XG4gIF9ub0NvbnRlbnRSZXNwb25zZTogc3RyaW5nIHwgdm9pZDtcblxuICBjb25zdHJ1Y3Rvcihjb25uOiBDb25uZWN0aW9uPFM+LCBvcHRpb25zOiBhbnkpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2Nvbm4gPSBjb25uO1xuICAgIHRoaXMuX2xvZ2dlciA9IGNvbm4uX2xvZ0xldmVsXG4gICAgICA/IEh0dHBBcGkuX2xvZ2dlci5jcmVhdGVJbnN0YW5jZShjb25uLl9sb2dMZXZlbClcbiAgICAgIDogSHR0cEFwaS5fbG9nZ2VyO1xuICAgIHRoaXMuX3Jlc3BvbnNlVHlwZSA9IG9wdGlvbnMucmVzcG9uc2VUeXBlO1xuICAgIHRoaXMuX3RyYW5zcG9ydCA9IG9wdGlvbnMudHJhbnNwb3J0IHx8IGNvbm4uX3RyYW5zcG9ydDtcbiAgICB0aGlzLl9ub0NvbnRlbnRSZXNwb25zZSA9IG9wdGlvbnMubm9Db250ZW50UmVzcG9uc2U7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbG91dCB0byBBUEkgZW5kcG9pbnQgdXNpbmcgaHR0cFxuICAgKi9cbiAgcmVxdWVzdDxSID0gdW5rbm93bj4ocmVxdWVzdDogSHR0cFJlcXVlc3QpOiBTdHJlYW1Qcm9taXNlPFI+IHtcbiAgICByZXR1cm4gU3RyZWFtUHJvbWlzZS5jcmVhdGU8Uj4oKCkgPT4ge1xuICAgICAgY29uc3QgeyBzdHJlYW0sIHNldFN0cmVhbSB9ID0gY3JlYXRlTGF6eVN0cmVhbSgpO1xuICAgICAgY29uc3QgcHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlZnJlc2hEZWxlZ2F0ZSA9IHRoaXMuZ2V0UmVmcmVzaERlbGVnYXRlKCk7XG4gICAgICAgIC8qIFRPRE8gZGVjaWRlIHJlbW92ZSBvciBub3QgdGhpcyBzZWN0aW9uICovXG4gICAgICAgIC8qXG4gICAgICAgIC8vIHJlbWVtYmVyIHByZXZpb3VzIGluc3RhbmNlIHVybCBpbiBjYXNlIGl0IGNoYW5nZXMgYWZ0ZXIgYSByZWZyZXNoXG4gICAgICAgIGNvbnN0IGxhc3RJbnN0YW5jZVVybCA9IGNvbm4uaW5zdGFuY2VVcmw7XG5cbiAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSB0b2tlbiByZWZyZXNoIGhhcyBjaGFuZ2VkIHRoZSBpbnN0YW5jZSB1cmxcbiAgICAgICAgaWYobGFzdEluc3RhbmNlVXJsICE9PSBjb25uLmluc3RhbmNlVXJsKXtcbiAgICAgICAgICAvLyBpZiB0aGUgaW5zdGFuY2UgdXJsIGhhcyBjaGFuZ2VkXG4gICAgICAgICAgLy8gdGhlbiByZXBsYWNlIHRoZSBjdXJyZW50IHJlcXVlc3QgdXJscyBpbnN0YW5jZSB1cmwgZnJhZ21lbnRcbiAgICAgICAgICAvLyB3aXRoIHRoZSB1cGRhdGVkIGluc3RhbmNlIHVybFxuICAgICAgICAgIHJlcXVlc3QudXJsID0gcmVxdWVzdC51cmwucmVwbGFjZShsYXN0SW5zdGFuY2VVcmwsY29ubi5pbnN0YW5jZVVybCk7XG4gICAgICAgIH1cbiAgICAgICAgKi9cbiAgICAgICAgaWYgKHJlZnJlc2hEZWxlZ2F0ZSAmJiByZWZyZXNoRGVsZWdhdGUuaXNSZWZyZXNoaW5nKCkpIHtcbiAgICAgICAgICBhd2FpdCByZWZyZXNoRGVsZWdhdGUud2FpdFJlZnJlc2goKTtcbiAgICAgICAgICBjb25zdCBib2R5UHJvbWlzZSA9IHRoaXMucmVxdWVzdChyZXF1ZXN0KTtcbiAgICAgICAgICBzZXRTdHJlYW0oYm9keVByb21pc2Uuc3RyZWFtKCkpO1xuICAgICAgICAgIGNvbnN0IGJvZHkgPSBhd2FpdCBib2R5UHJvbWlzZTtcbiAgICAgICAgICByZXR1cm4gYm9keTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGhvb2sgYmVmb3JlIHNlbmRpbmdcbiAgICAgICAgdGhpcy5iZWZvcmVTZW5kKHJlcXVlc3QpO1xuXG4gICAgICAgIHRoaXMuZW1pdCgncmVxdWVzdCcsIHJlcXVlc3QpO1xuICAgICAgICB0aGlzLl9sb2dnZXIuZGVidWcoXG4gICAgICAgICAgYDxyZXF1ZXN0PiBtZXRob2Q9JHtyZXF1ZXN0Lm1ldGhvZH0sIHVybD0ke3JlcXVlc3QudXJsfWAsXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHJlcXVlc3RUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgY29uc3QgcmVxdWVzdFByb21pc2UgPSB0aGlzLl90cmFuc3BvcnQuaHR0cFJlcXVlc3QocmVxdWVzdCk7XG5cbiAgICAgICAgc2V0U3RyZWFtKHJlcXVlc3RQcm9taXNlLnN0cmVhbSgpKTtcblxuICAgICAgICBsZXQgcmVzcG9uc2U6IEh0dHBSZXNwb25zZSB8IHZvaWQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0UHJvbWlzZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgdGhpcy5fbG9nZ2VyLmVycm9yKGVycik7XG4gICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlVGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgdGhpcy5fbG9nZ2VyLmRlYnVnKFxuICAgICAgICAgICAgYGVsYXBzZWQgdGltZTogJHtyZXNwb25zZVRpbWUgLSByZXF1ZXN0VGltZX0gbXNlY2AsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xvZ2dlci5kZWJ1ZyhcbiAgICAgICAgICBgPHJlc3BvbnNlPiBzdGF0dXM9JHtTdHJpbmcocmVzcG9uc2Uuc3RhdHVzQ29kZSl9LCB1cmw9JHtcbiAgICAgICAgICAgIHJlcXVlc3QudXJsXG4gICAgICAgICAgfWAsXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuZW1pdCgncmVzcG9uc2UnLCByZXNwb25zZSk7XG4gICAgICAgIC8vIFJlZnJlc2ggdG9rZW4gaWYgc2Vzc2lvbiBoYXMgYmVlbiBleHBpcmVkIGFuZCByZXF1aXJlcyBhdXRoZW50aWNhdGlvblxuICAgICAgICAvLyB3aGVuIHNlc3Npb24gcmVmcmVzaCBkZWxlZ2F0ZSBpcyBhdmFpbGFibGVcbiAgICAgICAgaWYgKHRoaXMuaXNTZXNzaW9uRXhwaXJlZChyZXNwb25zZSkgJiYgcmVmcmVzaERlbGVnYXRlKSB7XG4gICAgICAgICAgYXdhaXQgcmVmcmVzaERlbGVnYXRlLnJlZnJlc2gocmVxdWVzdFRpbWUpO1xuICAgICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3QocmVxdWVzdCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNFcnJvclJlc3BvbnNlKHJlc3BvbnNlKSkge1xuICAgICAgICAgIGNvbnN0IGVyciA9IGF3YWl0IHRoaXMuZ2V0RXJyb3IocmVzcG9uc2UpO1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBib2R5ID0gYXdhaXQgdGhpcy5nZXRSZXNwb25zZUJvZHkocmVzcG9uc2UpO1xuICAgICAgICByZXR1cm4gYm9keTtcbiAgICAgIH0pKCk7XG4gICAgICByZXR1cm4geyBzdHJlYW0sIHByb21pc2UgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICBnZXRSZWZyZXNoRGVsZWdhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm4uX3JlZnJlc2hEZWxlZ2F0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICBiZWZvcmVTZW5kKHJlcXVlc3Q6IEh0dHBSZXF1ZXN0KSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tcGFyYW0tcmVhc3NpZ24gKi9cbiAgICBjb25zdCBoZWFkZXJzID0gcmVxdWVzdC5oZWFkZXJzIHx8IHt9O1xuICAgIGlmICh0aGlzLl9jb25uLmFjY2Vzc1Rva2VuKSB7XG4gICAgICBoZWFkZXJzLkF1dGhvcml6YXRpb24gPSBgQmVhcmVyICR7dGhpcy5fY29ubi5hY2Nlc3NUb2tlbn1gO1xuICAgIH1cbiAgICBpZiAodGhpcy5fY29ubi5fY2FsbE9wdGlvbnMpIHtcbiAgICAgIGNvbnN0IGNhbGxPcHRpb25zID0gW107XG4gICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgT2JqZWN0LmtleXModGhpcy5fY29ubi5fY2FsbE9wdGlvbnMpKSB7XG4gICAgICAgIGNhbGxPcHRpb25zLnB1c2goYCR7bmFtZX09JHt0aGlzLl9jb25uLl9jYWxsT3B0aW9uc1tuYW1lXX1gKTtcbiAgICAgIH1cbiAgICAgIGhlYWRlcnNbJ1Nmb3JjZS1DYWxsLU9wdGlvbnMnXSA9IGNhbGxPcHRpb25zLmpvaW4oJywgJyk7XG4gICAgfVxuICAgIHJlcXVlc3QuaGVhZGVycyA9IGhlYWRlcnM7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZWN0IHJlc3BvbnNlIGNvbnRlbnQgbWltZS10eXBlXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIGdldFJlc3BvbnNlQ29udGVudFR5cGUocmVzcG9uc2U6IEh0dHBSZXNwb25zZSk6IE9wdGlvbmFsPHN0cmluZz4ge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLl9yZXNwb25zZVR5cGUgfHxcbiAgICAgIChyZXNwb25zZS5oZWFkZXJzICYmIHJlc3BvbnNlLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGFzeW5jIHBhcnNlUmVzcG9uc2VCb2R5KHJlc3BvbnNlOiBIdHRwUmVzcG9uc2UpIHtcbiAgICBjb25zdCBjb250ZW50VHlwZSA9IHRoaXMuZ2V0UmVzcG9uc2VDb250ZW50VHlwZShyZXNwb25zZSkgfHwgJyc7XG4gICAgY29uc3QgcGFyc2VCb2R5ID0gL14odGV4dHxhcHBsaWNhdGlvbilcXC94bWwoO3wkKS8udGVzdChjb250ZW50VHlwZSlcbiAgICAgID8gcGFyc2VYTUxcbiAgICAgIDogL15hcHBsaWNhdGlvblxcL2pzb24oO3wkKS8udGVzdChjb250ZW50VHlwZSlcbiAgICAgID8gcGFyc2VKU09OXG4gICAgICA6IC9edGV4dFxcL2Nzdig7fCQpLy50ZXN0KGNvbnRlbnRUeXBlKVxuICAgICAgPyBwYXJzZUNTVlxuICAgICAgOiBwYXJzZVRleHQ7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBwYXJzZUJvZHkocmVzcG9uc2UuYm9keSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLmJvZHk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCByZXNwb25zZSBib2R5XG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIGFzeW5jIGdldFJlc3BvbnNlQm9keShyZXNwb25zZTogSHR0cFJlc3BvbnNlKSB7XG4gICAgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwNCkge1xuICAgICAgLy8gTm8gQ29udGVudFxuICAgICAgcmV0dXJuIHRoaXMuX25vQ29udGVudFJlc3BvbnNlO1xuICAgIH1cbiAgICBjb25zdCBib2R5ID0gYXdhaXQgdGhpcy5wYXJzZVJlc3BvbnNlQm9keShyZXNwb25zZSk7XG4gICAgbGV0IGVycjtcbiAgICBpZiAodGhpcy5oYXNFcnJvckluUmVzcG9uc2VCb2R5KGJvZHkpKSB7XG4gICAgICBlcnIgPSBhd2FpdCB0aGlzLmdldEVycm9yKHJlc3BvbnNlLCBib2R5KTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gICAgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDMwMCkge1xuICAgICAgLy8gTXVsdGlwbGUgQ2hvaWNlc1xuICAgICAgdGhyb3cgbmV3IEh0dHBBcGlFcnJvcihcbiAgICAgICAgJ011bHRpcGxlIHJlY29yZHMgZm91bmQnLFxuICAgICAgICAnTVVMVElQTEVfQ0hPSUNFUycsXG4gICAgICAgIGJvZHksXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gYm9keTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlY3Qgc2Vzc2lvbiBleHBpcnlcbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgaXNTZXNzaW9uRXhwaXJlZChyZXNwb25zZTogSHR0cFJlc3BvbnNlKSB7XG4gICAgcmV0dXJuIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDQwMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlY3QgZXJyb3IgcmVzcG9uc2VcbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgaXNFcnJvclJlc3BvbnNlKHJlc3BvbnNlOiBIdHRwUmVzcG9uc2UpIHtcbiAgICByZXR1cm4gcmVzcG9uc2Uuc3RhdHVzQ29kZSA+PSA0MDA7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZWN0IGVycm9yIGluIHJlc3BvbnNlIGJvZHlcbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgaGFzRXJyb3JJblJlc3BvbnNlQm9keShfYm9keTogT3B0aW9uYWw8c3RyaW5nPikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzaW5nIGVycm9yIG1lc3NhZ2UgaW4gcmVzcG9uc2VcbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgcGFyc2VFcnJvcihib2R5OiBhbnkpIHtcbiAgICBjb25zdCBlcnJvcnMgPSBib2R5O1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KGVycm9ycykgPyBlcnJvcnNbMF0gOiBlcnJvcnM7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGVycm9yIG1lc3NhZ2UgaW4gcmVzcG9uc2VcbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgYXN5bmMgZ2V0RXJyb3IocmVzcG9uc2U6IEh0dHBSZXNwb25zZSwgYm9keT86IGFueSk6IFByb21pc2U8RXJyb3I+IHtcbiAgICBsZXQgZXJyb3I7XG4gICAgdHJ5IHtcbiAgICAgIGVycm9yID0gdGhpcy5wYXJzZUVycm9yKGJvZHkgfHwgKGF3YWl0IHRoaXMucGFyc2VSZXNwb25zZUJvZHkocmVzcG9uc2UpKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUgbm8tZW1wdHlcbiAgICB9XG4gICAgZXJyb3IgPVxuICAgICAgdHlwZW9mIGVycm9yID09PSAnb2JqZWN0JyAmJlxuICAgICAgZXJyb3IgIT09IG51bGwgJiZcbiAgICAgIHR5cGVvZiBlcnJvci5tZXNzYWdlID09PSAnc3RyaW5nJ1xuICAgICAgICA/IGVycm9yXG4gICAgICAgIDoge1xuICAgICAgICAgICAgZXJyb3JDb2RlOiBgRVJST1JfSFRUUF8ke3Jlc3BvbnNlLnN0YXR1c0NvZGV9YCxcbiAgICAgICAgICAgIG1lc3NhZ2U6IHJlc3BvbnNlLmJvZHksXG4gICAgICAgICAgfTtcbiAgICByZXR1cm4gbmV3IEh0dHBBcGlFcnJvcihlcnJvci5tZXNzYWdlLCBlcnJvci5lcnJvckNvZGUpO1xuICB9XG59XG5cbi8qKlxuICpcbiAqL1xuY2xhc3MgSHR0cEFwaUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBlcnJvckNvZGU6IHN0cmluZztcbiAgY29udGVudDogYW55O1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIGVycm9yQ29kZT86IHN0cmluZyB8IHVuZGVmaW5lZCwgY29udGVudD86IGFueSkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IGVycm9yQ29kZSB8fCB0aGlzLm5hbWU7XG4gICAgdGhpcy5lcnJvckNvZGUgPSB0aGlzLm5hbWU7XG4gICAgdGhpcy5jb250ZW50ID0gY29udGVudDtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBIdHRwQXBpO1xuIl0sIm1hcHBp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