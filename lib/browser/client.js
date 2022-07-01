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

exports.default = exports.BrowserClient = void 0;

var _setTimeout2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/set-timeout"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _setInterval2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/set-interval"));

var _now = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/date/now"));

var _reverse = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/reverse"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/json/stringify"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.regexp.constructor.js");

var _events = require("events");

var _querystring = _interopRequireDefault(require("querystring"));

var _connection = _interopRequireDefault(require("../connection"));

var _oauth = _interopRequireDefault(require("../oauth2"));

function ownKeys(object, enumerableOnly) { var keys = _Object$keys(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context2, _context3; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context2 = ownKeys(Object(source), !0)).call(_context2, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context3 = ownKeys(Object(source))).call(_context3, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * @private
 */
function popupWin(url, w, h) {
  const left = screen.width / 2 - w / 2;
  const top = screen.height / 2 - h / 2;
  return window.open(url, undefined, `location=yes,toolbar=no,status=no,menubar=no,width=${w},height=${h},top=${top},left=${left}`);
}
/**
 * @private
 */


function handleCallbackResponse() {
  const res = checkCallbackResponse();
  const state = localStorage.getItem('jsforce_state');

  if (res && state && res.body.state === state) {
    localStorage.removeItem('jsforce_state');
    const [prefix, promptType] = state.split('.');
    const cli = new BrowserClient(prefix);

    if (res.success) {
      cli._storeTokens(res.body);

      location.hash = '';
    } else {
      cli._storeError(res.body);
    }

    if (promptType === 'popup') {
      window.close();
    }

    return true;
  }
}
/**
 * @private
 */


function checkCallbackResponse() {
  let params;

  if (window.location.hash) {
    params = _querystring.default.parse(window.location.hash.substring(1));

    if (params.access_token) {
      return {
        success: true,
        body: params
      };
    }
  } else if (window.location.search) {
    params = _querystring.default.parse(window.location.search.substring(1));

    if (params.error) {
      return {
        success: false,
        body: params
      };
    }
  }
}
/**
 *
 */


/**
 *
 */
const DEFAULT_POPUP_WIN_WIDTH = 912;
const DEFAULT_POPUP_WIN_HEIGHT = 513;
/** @private **/

let clientIdx = 0;
/**
 *
 */

class BrowserClient extends _events.EventEmitter {
  /**
   *
   */
  constructor(prefix) {
    super();
    (0, _defineProperty2.default)(this, "_prefix", void 0);
    (0, _defineProperty2.default)(this, "_config", void 0);
    (0, _defineProperty2.default)(this, "_connection", void 0);
    this._prefix = prefix || 'jsforce' + clientIdx++;
  }

  get connection() {
    if (!this._connection) {
      this._connection = new _connection.default(this._config);
    }

    return this._connection;
  }
  /**
   *
   */


  init(config) {
    if (handleCallbackResponse()) {
      return;
    }

    this._config = config;

    const tokens = this._getTokens();

    if (tokens) {
      this.connection._establish(tokens);

      (0, _setTimeout2.default)(() => {
        this.emit('connect', this.connection);
      }, 10);
    }
  }
  /**
   *
   */


  login(options = {}) {
    var _this$_config, _size$width, _size$height;

    const {
      scope,
      size
    } = options;
    const oauth2 = new _oauth.default((_this$_config = this._config) !== null && _this$_config !== void 0 ? _this$_config : {});
    const rand = Math.random().toString(36).substring(2);
    const state = [this._prefix, 'popup', rand].join('.');
    localStorage.setItem('jsforce_state', state);
    const authzUrl = oauth2.getAuthorizationUrl(_objectSpread({
      response_type: 'token',
      state
    }, scope ? {
      scope
    } : {}));
    const pw = popupWin(authzUrl, (_size$width = size === null || size === void 0 ? void 0 : size.width) !== null && _size$width !== void 0 ? _size$width : DEFAULT_POPUP_WIN_WIDTH, (_size$height = size === null || size === void 0 ? void 0 : size.height) !== null && _size$height !== void 0 ? _size$height : DEFAULT_POPUP_WIN_HEIGHT);
    return new _promise.default((resolve, reject) => {
      if (!pw) {
        const state = [this._prefix, 'redirect', rand].join('.');
        localStorage.setItem('jsforce_state', state);
        const authzUrl = oauth2.getAuthorizationUrl(_objectSpread({
          response_type: 'token',
          state
        }, scope ? {
          scope
        } : {}));
        location.href = authzUrl;
        return;
      }

      this._removeTokens();

      const pid = (0, _setInterval2.default)(() => {
        try {
          if (!pw || pw.closed) {
            clearInterval(pid);

            const tokens = this._getTokens();

            if (tokens) {
              this.connection._establish(tokens);

              this.emit('connect', this.connection);
              resolve({
                status: 'connect'
              });
            } else {
              const err = this._getError();

              if (err) {
                reject(new Error(err.error + ': ' + err.error_description));
              } else {
                resolve({
                  status: 'cancel'
                });
              }
            }
          }
        } catch (e) {//
        }
      }, 1000);
    });
  }
  /**
   *
   */


  isLoggedIn() {
    return !!this.connection.accessToken;
  }
  /**
   *
   */


  logout() {
    this.connection.logout();

    this._removeTokens();

    this.emit('disconnect');
  }
  /**
   * @private
   */


  _getTokens() {
    const regexp = new RegExp('(^|;\\s*)' + this._prefix + '_loggedin=true(;|$)');

    if (document.cookie.match(regexp)) {
      const issuedAt = Number(localStorage.getItem(this._prefix + '_issued_at')); // 2 hours

      if ((0, _now.default)() < issuedAt + 2 * 60 * 60 * 1000) {
        let userInfo;
        const idUrl = localStorage.getItem(this._prefix + '_id');

        if (idUrl) {
          var _context;

          const [id, organizationId] = (0, _reverse.default)(_context = idUrl.split('/')).call(_context);
          userInfo = {
            id,
            organizationId,
            url: idUrl
          };
        }

        return {
          accessToken: localStorage.getItem(this._prefix + '_access_token'),
          instanceUrl: localStorage.getItem(this._prefix + '_instance_url'),
          userInfo
        };
      }
    }

    return null;
  }
  /**
   * @private
   */


  _storeTokens(params) {
    localStorage.setItem(this._prefix + '_access_token', params.access_token);
    localStorage.setItem(this._prefix + '_instance_url', params.instance_url);
    localStorage.setItem(this._prefix + '_issued_at', params.issued_at);
    localStorage.setItem(this._prefix + '_id', params.id);
    document.cookie = this._prefix + '_loggedin=true;';
  }
  /**
   * @private
   */


  _removeTokens() {
    localStorage.removeItem(this._prefix + '_access_token');
    localStorage.removeItem(this._prefix + '_instance_url');
    localStorage.removeItem(this._prefix + '_issued_at');
    localStorage.removeItem(this._prefix + '_id');
    document.cookie = this._prefix + '_loggedin=';
  }
  /**
   * @private
   */


  _getError() {
    try {
      var _localStorage$getItem;

      const err = JSON.parse((_localStorage$getItem = localStorage.getItem(this._prefix + '_error')) !== null && _localStorage$getItem !== void 0 ? _localStorage$getItem : '');
      localStorage.removeItem(this._prefix + '_error');
      return err;
    } catch (e) {//
    }
  }
  /**
   * @private
   */


  _storeError(err) {
    localStorage.setItem(this._prefix + '_error', (0, _stringify.default)(err));
  }

}
/**
 *
 */


exports.BrowserClient = BrowserClient;
const client = new BrowserClient();
var _default = client;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwb3B1cFdpbiIsInVybCIsInciLCJoIiwibGVmdCIsInNjcmVlbiIsIndpZHRoIiwidG9wIiwiaGVpZ2h0Iiwid2luZG93Iiwib3BlbiIsInVuZGVmaW5lZCIsImhhbmRsZUNhbGxiYWNrUmVzcG9uc2UiLCJyZXMiLCJjaGVja0NhbGxiYWNrUmVzcG9uc2UiLCJzdGF0ZSIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJib2R5IiwicmVtb3ZlSXRlbSIsInByZWZpeCIsInByb21wdFR5cGUiLCJzcGxpdCIsImNsaSIsIkJyb3dzZXJDbGllbnQiLCJzdWNjZXNzIiwiX3N0b3JlVG9rZW5zIiwibG9jYXRpb24iLCJoYXNoIiwiX3N0b3JlRXJyb3IiLCJjbG9zZSIsInBhcmFtcyIsInFzIiwicGFyc2UiLCJzdWJzdHJpbmciLCJhY2Nlc3NfdG9rZW4iLCJzZWFyY2giLCJlcnJvciIsIkRFRkFVTFRfUE9QVVBfV0lOX1dJRFRIIiwiREVGQVVMVF9QT1BVUF9XSU5fSEVJR0hUIiwiY2xpZW50SWR4IiwiRXZlbnRFbWl0dGVyIiwiY29uc3RydWN0b3IiLCJfcHJlZml4IiwiY29ubmVjdGlvbiIsIl9jb25uZWN0aW9uIiwiQ29ubmVjdGlvbiIsIl9jb25maWciLCJpbml0IiwiY29uZmlnIiwidG9rZW5zIiwiX2dldFRva2VucyIsIl9lc3RhYmxpc2giLCJlbWl0IiwibG9naW4iLCJvcHRpb25zIiwic2NvcGUiLCJzaXplIiwib2F1dGgyIiwiT0F1dGgyIiwicmFuZCIsIk1hdGgiLCJyYW5kb20iLCJ0b1N0cmluZyIsImpvaW4iLCJzZXRJdGVtIiwiYXV0aHpVcmwiLCJnZXRBdXRob3JpemF0aW9uVXJsIiwicmVzcG9uc2VfdHlwZSIsInB3IiwicmVzb2x2ZSIsInJlamVjdCIsImhyZWYiLCJfcmVtb3ZlVG9rZW5zIiwicGlkIiwiY2xvc2VkIiwiY2xlYXJJbnRlcnZhbCIsInN0YXR1cyIsImVyciIsIl9nZXRFcnJvciIsIkVycm9yIiwiZXJyb3JfZGVzY3JpcHRpb24iLCJlIiwiaXNMb2dnZWRJbiIsImFjY2Vzc1Rva2VuIiwibG9nb3V0IiwicmVnZXhwIiwiUmVnRXhwIiwiZG9jdW1lbnQiLCJjb29raWUiLCJtYXRjaCIsImlzc3VlZEF0IiwiTnVtYmVyIiwidXNlckluZm8iLCJpZFVybCIsImlkIiwib3JnYW5pemF0aW9uSWQiLCJpbnN0YW5jZVVybCIsImluc3RhbmNlX3VybCIsImlzc3VlZF9hdCIsIkpTT04iLCJjbGllbnQiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvYnJvd3Nlci9jbGllbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBCcm93c2VyIGNsaWVudCBjb25uZWN0aW9uIG1hbmFnZW1lbnQgY2xhc3NcbiAqIEBhdXRob3IgU2hpbmljaGkgVG9taXRhIDxzaGluaWNoaS50b21pdGFAZ21haWwuY29tPlxuICovXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHFzIGZyb20gJ3F1ZXJ5c3RyaW5nJztcbmltcG9ydCBDb25uZWN0aW9uLCB7IENvbm5lY3Rpb25Db25maWcgfSBmcm9tICcuLi9jb25uZWN0aW9uJztcbmltcG9ydCBPQXV0aDIsIHsgVG9rZW5SZXNwb25zZSB9IGZyb20gJy4uL29hdXRoMic7XG5cbi8qKlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gcG9wdXBXaW4odXJsOiBzdHJpbmcsIHc6IG51bWJlciwgaDogbnVtYmVyKSB7XG4gIGNvbnN0IGxlZnQgPSBzY3JlZW4ud2lkdGggLyAyIC0gdyAvIDI7XG4gIGNvbnN0IHRvcCA9IHNjcmVlbi5oZWlnaHQgLyAyIC0gaCAvIDI7XG4gIHJldHVybiB3aW5kb3cub3BlbihcbiAgICB1cmwsXG4gICAgdW5kZWZpbmVkLFxuICAgIGBsb2NhdGlvbj15ZXMsdG9vbGJhcj1ubyxzdGF0dXM9bm8sbWVudWJhcj1ubyx3aWR0aD0ke3d9LGhlaWdodD0ke2h9LHRvcD0ke3RvcH0sbGVmdD0ke2xlZnR9YCxcbiAgKTtcbn1cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBoYW5kbGVDYWxsYmFja1Jlc3BvbnNlKCkge1xuICBjb25zdCByZXMgPSBjaGVja0NhbGxiYWNrUmVzcG9uc2UoKTtcbiAgY29uc3Qgc3RhdGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnanNmb3JjZV9zdGF0ZScpO1xuICBpZiAocmVzICYmIHN0YXRlICYmIHJlcy5ib2R5LnN0YXRlID09PSBzdGF0ZSkge1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdqc2ZvcmNlX3N0YXRlJyk7XG4gICAgY29uc3QgW3ByZWZpeCwgcHJvbXB0VHlwZV0gPSBzdGF0ZS5zcGxpdCgnLicpO1xuICAgIGNvbnN0IGNsaSA9IG5ldyBCcm93c2VyQ2xpZW50KHByZWZpeCk7XG4gICAgaWYgKHJlcy5zdWNjZXNzKSB7XG4gICAgICBjbGkuX3N0b3JlVG9rZW5zKHJlcy5ib2R5IGFzIFRva2VuUmVzcG9uc2UpO1xuICAgICAgbG9jYXRpb24uaGFzaCA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbGkuX3N0b3JlRXJyb3IocmVzLmJvZHkpO1xuICAgIH1cbiAgICBpZiAocHJvbXB0VHlwZSA9PT0gJ3BvcHVwJykge1xuICAgICAgd2luZG93LmNsb3NlKCk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbi8qKlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gY2hlY2tDYWxsYmFja1Jlc3BvbnNlKCkge1xuICBsZXQgcGFyYW1zO1xuICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gpIHtcbiAgICBwYXJhbXMgPSBxcy5wYXJzZSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpO1xuICAgIGlmIChwYXJhbXMuYWNjZXNzX3Rva2VuKSB7XG4gICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBib2R5OiBwYXJhbXMgfTtcbiAgICB9XG4gIH0gZWxzZSBpZiAod2luZG93LmxvY2F0aW9uLnNlYXJjaCkge1xuICAgIHBhcmFtcyA9IHFzLnBhcnNlKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKDEpKTtcbiAgICBpZiAocGFyYW1zLmVycm9yKSB7XG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgYm9keTogcGFyYW1zIH07XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICpcbiAqL1xuZXhwb3J0IHR5cGUgTG9naW5PcHRpb25zID0ge1xuICBzY29wZT86IHN0cmluZztcbiAgc2l6ZT86IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfTtcbn07XG5cbi8qKlxuICpcbiAqL1xuY29uc3QgREVGQVVMVF9QT1BVUF9XSU5fV0lEVEggPSA5MTI7XG5jb25zdCBERUZBVUxUX1BPUFVQX1dJTl9IRUlHSFQgPSA1MTM7XG5cbi8qKiBAcHJpdmF0ZSAqKi9cbmxldCBjbGllbnRJZHggPSAwO1xuXG4vKipcbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBCcm93c2VyQ2xpZW50IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgX3ByZWZpeDogc3RyaW5nO1xuICBfY29uZmlnOiBDb25uZWN0aW9uQ29uZmlnIHwgdW5kZWZpbmVkO1xuICBfY29ubmVjdGlvbjogQ29ubmVjdGlvbiB8IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICpcbiAgICovXG4gIGNvbnN0cnVjdG9yKHByZWZpeD86IHN0cmluZykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fcHJlZml4ID0gcHJlZml4IHx8ICdqc2ZvcmNlJyArIGNsaWVudElkeCsrO1xuICB9XG5cbiAgZ2V0IGNvbm5lY3Rpb24oKTogQ29ubmVjdGlvbiB7XG4gICAgaWYgKCF0aGlzLl9jb25uZWN0aW9uKSB7XG4gICAgICB0aGlzLl9jb25uZWN0aW9uID0gbmV3IENvbm5lY3Rpb24odGhpcy5fY29uZmlnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb247XG4gIH1cblxuICAvKipcbiAgICpcbiAgICovXG4gIGluaXQoY29uZmlnOiBDb25uZWN0aW9uQ29uZmlnKSB7XG4gICAgaWYgKGhhbmRsZUNhbGxiYWNrUmVzcG9uc2UoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9jb25maWcgPSBjb25maWc7XG4gICAgY29uc3QgdG9rZW5zID0gdGhpcy5fZ2V0VG9rZW5zKCk7XG4gICAgaWYgKHRva2Vucykge1xuICAgICAgdGhpcy5jb25uZWN0aW9uLl9lc3RhYmxpc2godG9rZW5zKTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmVtaXQoJ2Nvbm5lY3QnLCB0aGlzLmNvbm5lY3Rpb24pO1xuICAgICAgfSwgMTApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgbG9naW4ob3B0aW9uczogTG9naW5PcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB7IHNjb3BlLCBzaXplIH0gPSBvcHRpb25zO1xuICAgIGNvbnN0IG9hdXRoMiA9IG5ldyBPQXV0aDIodGhpcy5fY29uZmlnID8/IHt9KTtcbiAgICBjb25zdCByYW5kID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIpO1xuICAgIGNvbnN0IHN0YXRlID0gW3RoaXMuX3ByZWZpeCwgJ3BvcHVwJywgcmFuZF0uam9pbignLicpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdqc2ZvcmNlX3N0YXRlJywgc3RhdGUpO1xuICAgIGNvbnN0IGF1dGh6VXJsID0gb2F1dGgyLmdldEF1dGhvcml6YXRpb25Vcmwoe1xuICAgICAgcmVzcG9uc2VfdHlwZTogJ3Rva2VuJyxcbiAgICAgIHN0YXRlLFxuICAgICAgLi4uKHNjb3BlID8geyBzY29wZSB9IDoge30pLFxuICAgIH0pO1xuICAgIGNvbnN0IHB3ID0gcG9wdXBXaW4oXG4gICAgICBhdXRoelVybCxcbiAgICAgIHNpemU/LndpZHRoID8/IERFRkFVTFRfUE9QVVBfV0lOX1dJRFRILFxuICAgICAgc2l6ZT8uaGVpZ2h0ID8/IERFRkFVTFRfUE9QVVBfV0lOX0hFSUdIVCxcbiAgICApO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTx7IHN0YXR1czogc3RyaW5nIH0+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmICghcHcpIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBbdGhpcy5fcHJlZml4LCAncmVkaXJlY3QnLCByYW5kXS5qb2luKCcuJyk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdqc2ZvcmNlX3N0YXRlJywgc3RhdGUpO1xuICAgICAgICBjb25zdCBhdXRoelVybCA9IG9hdXRoMi5nZXRBdXRob3JpemF0aW9uVXJsKHtcbiAgICAgICAgICByZXNwb25zZV90eXBlOiAndG9rZW4nLFxuICAgICAgICAgIHN0YXRlLFxuICAgICAgICAgIC4uLihzY29wZSA/IHsgc2NvcGUgfSA6IHt9KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxvY2F0aW9uLmhyZWYgPSBhdXRoelVybDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fcmVtb3ZlVG9rZW5zKCk7XG4gICAgICBjb25zdCBwaWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFwdyB8fCBwdy5jbG9zZWQpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwocGlkKTtcbiAgICAgICAgICAgIGNvbnN0IHRva2VucyA9IHRoaXMuX2dldFRva2VucygpO1xuICAgICAgICAgICAgaWYgKHRva2Vucykge1xuICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb24uX2VzdGFibGlzaCh0b2tlbnMpO1xuICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2Nvbm5lY3QnLCB0aGlzLmNvbm5lY3Rpb24pO1xuICAgICAgICAgICAgICByZXNvbHZlKHsgc3RhdHVzOiAnY29ubmVjdCcgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zdCBlcnIgPSB0aGlzLl9nZXRFcnJvcigpO1xuICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihlcnIuZXJyb3IgKyAnOiAnICsgZXJyLmVycm9yX2Rlc2NyaXB0aW9uKSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN0YXR1czogJ2NhbmNlbCcgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAvL1xuICAgICAgICB9XG4gICAgICB9LCAxMDAwKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgaXNMb2dnZWRJbigpIHtcbiAgICByZXR1cm4gISF0aGlzLmNvbm5lY3Rpb24uYWNjZXNzVG9rZW47XG4gIH1cblxuICAvKipcbiAgICpcbiAgICovXG4gIGxvZ291dCgpIHtcbiAgICB0aGlzLmNvbm5lY3Rpb24ubG9nb3V0KCk7XG4gICAgdGhpcy5fcmVtb3ZlVG9rZW5zKCk7XG4gICAgdGhpcy5lbWl0KCdkaXNjb25uZWN0Jyk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9nZXRUb2tlbnMoKSB7XG4gICAgY29uc3QgcmVnZXhwID0gbmV3IFJlZ0V4cChcbiAgICAgICcoXnw7XFxcXHMqKScgKyB0aGlzLl9wcmVmaXggKyAnX2xvZ2dlZGluPXRydWUoO3wkKScsXG4gICAgKTtcbiAgICBpZiAoZG9jdW1lbnQuY29va2llLm1hdGNoKHJlZ2V4cCkpIHtcbiAgICAgIGNvbnN0IGlzc3VlZEF0ID0gTnVtYmVyKFxuICAgICAgICBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLl9wcmVmaXggKyAnX2lzc3VlZF9hdCcpLFxuICAgICAgKTtcbiAgICAgIC8vIDIgaG91cnNcbiAgICAgIGlmIChEYXRlLm5vdygpIDwgaXNzdWVkQXQgKyAyICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgbGV0IHVzZXJJbmZvO1xuICAgICAgICBjb25zdCBpZFVybCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuX3ByZWZpeCArICdfaWQnKTtcbiAgICAgICAgaWYgKGlkVXJsKSB7XG4gICAgICAgICAgY29uc3QgW2lkLCBvcmdhbml6YXRpb25JZF0gPSBpZFVybC5zcGxpdCgnLycpLnJldmVyc2UoKTtcbiAgICAgICAgICB1c2VySW5mbyA9IHsgaWQsIG9yZ2FuaXphdGlvbklkLCB1cmw6IGlkVXJsIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBhY2Nlc3NUb2tlbjogbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5fcHJlZml4ICsgJ19hY2Nlc3NfdG9rZW4nKSxcbiAgICAgICAgICBpbnN0YW5jZVVybDogbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5fcHJlZml4ICsgJ19pbnN0YW5jZV91cmwnKSxcbiAgICAgICAgICB1c2VySW5mbyxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zdG9yZVRva2VucyhwYXJhbXM6IFRva2VuUmVzcG9uc2UpIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLl9wcmVmaXggKyAnX2FjY2Vzc190b2tlbicsIHBhcmFtcy5hY2Nlc3NfdG9rZW4pO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuX3ByZWZpeCArICdfaW5zdGFuY2VfdXJsJywgcGFyYW1zLmluc3RhbmNlX3VybCk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5fcHJlZml4ICsgJ19pc3N1ZWRfYXQnLCBwYXJhbXMuaXNzdWVkX2F0KTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLl9wcmVmaXggKyAnX2lkJywgcGFyYW1zLmlkKTtcbiAgICBkb2N1bWVudC5jb29raWUgPSB0aGlzLl9wcmVmaXggKyAnX2xvZ2dlZGluPXRydWU7JztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3JlbW92ZVRva2VucygpIHtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLl9wcmVmaXggKyAnX2FjY2Vzc190b2tlbicpO1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMuX3ByZWZpeCArICdfaW5zdGFuY2VfdXJsJyk7XG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5fcHJlZml4ICsgJ19pc3N1ZWRfYXQnKTtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLl9wcmVmaXggKyAnX2lkJyk7XG4gICAgZG9jdW1lbnQuY29va2llID0gdGhpcy5fcHJlZml4ICsgJ19sb2dnZWRpbj0nO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZ2V0RXJyb3IoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVyciA9IEpTT04ucGFyc2UoXG4gICAgICAgIGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuX3ByZWZpeCArICdfZXJyb3InKSA/PyAnJyxcbiAgICAgICk7XG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLl9wcmVmaXggKyAnX2Vycm9yJyk7XG4gICAgICByZXR1cm4gZXJyO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc3RvcmVFcnJvcihlcnI6IGFueSkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuX3ByZWZpeCArICdfZXJyb3InLCBKU09OLnN0cmluZ2lmeShlcnIpKTtcbiAgfVxufVxuXG4vKipcbiAqXG4gKi9cbmNvbnN0IGNsaWVudCA9IG5ldyBCcm93c2VyQ2xpZW50KCk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsaWVudDtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUlBOztBQUNBOztB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