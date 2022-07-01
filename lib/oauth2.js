"use strict";

var _Object$keys = require("@babel/runtime-corejs3/core-js-stable/object/keys");

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

exports.default = exports.OAuth2 = void 0;

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/index-of"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

require("core-js/modules/es.promise.js");

var _crypto = require("crypto");

var _querystring = _interopRequireDefault(require("querystring"));

var _transport = _interopRequireWildcard(require("./transport"));

function _getRequireWildcardCache(nodeInterop) { if (typeof _WeakMap !== "function") return null; var cacheBabelInterop = new _WeakMap(); var cacheNodeInterop = new _WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = _Object$defineProperty && _Object$getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? _Object$getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { _Object$defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = _Object$keys(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context3, _context4; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context3 = ownKeys(Object(source), !0)).call(_context3, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context4 = ownKeys(Object(source))).call(_context4, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

const defaultOAuth2Config = {
  loginUrl: 'https://login.salesforce.com'
}; // Makes a nodejs base64 encoded string compatible with rfc4648 alternative encoding for urls.
// @param base64Encoded a nodejs base64 encoded string

function base64UrlEscape(base64Encoded) {
  // builtin node js base 64 encoding is not 64 url compatible.
  // See https://toolsn.ietf.org/html/rfc4648#section-5
  return base64Encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
/**
 * type defs
 */


/**
 * OAuth2 class
 */
class OAuth2 {
  /**
   *
   */
  constructor(config) {
    (0, _defineProperty2.default)(this, "loginUrl", void 0);
    (0, _defineProperty2.default)(this, "authzServiceUrl", void 0);
    (0, _defineProperty2.default)(this, "tokenServiceUrl", void 0);
    (0, _defineProperty2.default)(this, "revokeServiceUrl", void 0);
    (0, _defineProperty2.default)(this, "clientId", void 0);
    (0, _defineProperty2.default)(this, "clientSecret", void 0);
    (0, _defineProperty2.default)(this, "redirectUri", void 0);
    (0, _defineProperty2.default)(this, "codeVerifier", void 0);
    (0, _defineProperty2.default)(this, "_transport", void 0);
    const {
      loginUrl,
      authzServiceUrl,
      tokenServiceUrl,
      revokeServiceUrl,
      clientId,
      clientSecret,
      redirectUri,
      proxyUrl,
      httpProxy,
      useVerifier
    } = config;

    if (authzServiceUrl && tokenServiceUrl) {
      var _context;

      this.loginUrl = (0, _slice.default)(_context = authzServiceUrl.split('/')).call(_context, 0, 3).join('/');
      this.authzServiceUrl = authzServiceUrl;
      this.tokenServiceUrl = tokenServiceUrl;
      this.revokeServiceUrl = revokeServiceUrl || `${this.loginUrl}/services/oauth2/revoke`;
    } else {
      this.loginUrl = loginUrl || defaultOAuth2Config.loginUrl;
      this.authzServiceUrl = `${this.loginUrl}/services/oauth2/authorize`;
      this.tokenServiceUrl = `${this.loginUrl}/services/oauth2/token`;
      this.revokeServiceUrl = `${this.loginUrl}/services/oauth2/revoke`;
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;

    if (proxyUrl) {
      this._transport = new _transport.XdProxyTransport(proxyUrl);
    } else if (httpProxy) {
      this._transport = new _transport.HttpProxyTransport(httpProxy);
    } else {
      this._transport = new _transport.default();
    }

    if (useVerifier) {
      // Set a code verifier string for OAuth authorization
      this.codeVerifier = base64UrlEscape((0, _crypto.randomBytes)(Math.ceil(128)).toString('base64'));
    }
  }
  /**
   * Get Salesforce OAuth2 authorization page URL to redirect user agent.
   */


  getAuthorizationUrl(params = {}) {
    var _context2;

    if (this.codeVerifier) {
      // code verifier must be a base 64 url encoded hash of 128 bytes of random data. Our random data is also
      // base 64 url encoded. See Connection.create();
      const codeChallenge = base64UrlEscape((0, _crypto.createHash)('sha256').update(this.codeVerifier).digest('base64'));
      params.code_challenge = codeChallenge;
    }

    const _params = _objectSpread(_objectSpread({}, params), {}, {
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri
    });

    return this.authzServiceUrl + ((0, _indexOf.default)(_context2 = this.authzServiceUrl).call(_context2, '?') >= 0 ? '&' : '?') + _querystring.default.stringify(_params);
  }
  /**
   * OAuth2 Refresh Token Flow
   */


  async refreshToken(refreshToken) {
    if (!this.clientId) {
      throw new Error('No OAuth2 client id information is specified');
    }

    const params = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId
    };

    if (this.clientSecret) {
      params.client_secret = this.clientSecret;
    }

    const ret = await this._postParams(params);
    return ret;
  }
  /**
   * OAuth2 Web Server Authentication Flow (Authorization Code)
   * Access Token Request
   */


  async requestToken(code, params = {}) {
    if (!this.clientId || !this.redirectUri) {
      throw new Error('No OAuth2 client id or redirect uri configuration is specified');
    }

    const _params = _objectSpread(_objectSpread({}, params), {}, {
      grant_type: 'authorization_code',
      code,
      client_id: this.clientId,
      redirect_uri: this.redirectUri
    });

    if (this.clientSecret) {
      _params.client_secret = this.clientSecret;
    }

    const ret = await this._postParams(_params);
    return ret;
  }
  /**
   * OAuth2 Username-Password Flow (Resource Owner Password Credentials)
   */


  async authenticate(username, password) {
    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error('No valid OAuth2 client configuration set');
    }

    const ret = await this._postParams({
      grant_type: 'password',
      username,
      password,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri
    });
    return ret;
  }
  /**
   * OAuth2 Revoke Session Token
   */


  async revokeToken(token) {
    const response = await this._transport.httpRequest({
      method: 'POST',
      url: this.revokeServiceUrl,
      body: _querystring.default.stringify({
        token
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.statusCode >= 400) {
      let res = _querystring.default.parse(response.body);

      if (!res || !res.error) {
        res = {
          error: `ERROR_HTTP_${response.statusCode}`,
          error_description: response.body
        };
      }

      throw new class extends Error {
        constructor({
          error,
          error_description
        }) {
          super(error_description);
          this.name = error;
        }

      }(res);
    }
  }
  /**
   * @private
   */


  async _postParams(params) {
    if (this.codeVerifier) params.code_verifier = this.codeVerifier;
    const response = await this._transport.httpRequest({
      method: 'POST',
      url: this.tokenServiceUrl,
      body: _querystring.default.stringify(params),
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    });
    let res;

    try {
      res = JSON.parse(response.body);
    } catch (e) {
      /* eslint-disable no-empty */
    }

    if (response.statusCode >= 400) {
      res = res || {
        error: `ERROR_HTTP_${response.statusCode}`,
        error_description: response.body
      };
      throw new class extends Error {
        constructor({
          error,
          error_description
        }) {
          super(error_description);
          this.name = error;
        }

      }(res);
    }

    return res;
  }

}

exports.OAuth2 = OAuth2;
var _default = OAuth2;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkZWZhdWx0T0F1dGgyQ29uZmlnIiwibG9naW5VcmwiLCJiYXNlNjRVcmxFc2NhcGUiLCJiYXNlNjRFbmNvZGVkIiwicmVwbGFjZSIsIk9BdXRoMiIsImNvbnN0cnVjdG9yIiwiY29uZmlnIiwiYXV0aHpTZXJ2aWNlVXJsIiwidG9rZW5TZXJ2aWNlVXJsIiwicmV2b2tlU2VydmljZVVybCIsImNsaWVudElkIiwiY2xpZW50U2VjcmV0IiwicmVkaXJlY3RVcmkiLCJwcm94eVVybCIsImh0dHBQcm94eSIsInVzZVZlcmlmaWVyIiwic3BsaXQiLCJqb2luIiwiX3RyYW5zcG9ydCIsIlhkUHJveHlUcmFuc3BvcnQiLCJIdHRwUHJveHlUcmFuc3BvcnQiLCJUcmFuc3BvcnQiLCJjb2RlVmVyaWZpZXIiLCJyYW5kb21CeXRlcyIsIk1hdGgiLCJjZWlsIiwidG9TdHJpbmciLCJnZXRBdXRob3JpemF0aW9uVXJsIiwicGFyYW1zIiwiY29kZUNoYWxsZW5nZSIsImNyZWF0ZUhhc2giLCJ1cGRhdGUiLCJkaWdlc3QiLCJjb2RlX2NoYWxsZW5nZSIsIl9wYXJhbXMiLCJyZXNwb25zZV90eXBlIiwiY2xpZW50X2lkIiwicmVkaXJlY3RfdXJpIiwicXVlcnlzdHJpbmciLCJzdHJpbmdpZnkiLCJyZWZyZXNoVG9rZW4iLCJFcnJvciIsImdyYW50X3R5cGUiLCJyZWZyZXNoX3Rva2VuIiwiY2xpZW50X3NlY3JldCIsInJldCIsIl9wb3N0UGFyYW1zIiwicmVxdWVzdFRva2VuIiwiY29kZSIsImF1dGhlbnRpY2F0ZSIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJyZXZva2VUb2tlbiIsInRva2VuIiwicmVzcG9uc2UiLCJodHRwUmVxdWVzdCIsIm1ldGhvZCIsInVybCIsImJvZHkiLCJoZWFkZXJzIiwic3RhdHVzQ29kZSIsInJlcyIsInBhcnNlIiwiZXJyb3IiLCJlcnJvcl9kZXNjcmlwdGlvbiIsIm5hbWUiLCJjb2RlX3ZlcmlmaWVyIiwiSlNPTiIsImUiXSwic291cmNlcyI6WyIuLi9zcmMvb2F1dGgyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICpcbiAqL1xuaW1wb3J0IHsgY3JlYXRlSGFzaCwgcmFuZG9tQnl0ZXMgfSBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHF1ZXJ5c3RyaW5nIGZyb20gJ3F1ZXJ5c3RyaW5nJztcbmltcG9ydCBUcmFuc3BvcnQsIHsgWGRQcm94eVRyYW5zcG9ydCwgSHR0cFByb3h5VHJhbnNwb3J0IH0gZnJvbSAnLi90cmFuc3BvcnQnO1xuaW1wb3J0IHsgT3B0aW9uYWwgfSBmcm9tICcuL3R5cGVzJztcblxuY29uc3QgZGVmYXVsdE9BdXRoMkNvbmZpZyA9IHtcbiAgbG9naW5Vcmw6ICdodHRwczovL2xvZ2luLnNhbGVzZm9yY2UuY29tJyxcbn07XG5cbi8vIE1ha2VzIGEgbm9kZWpzIGJhc2U2NCBlbmNvZGVkIHN0cmluZyBjb21wYXRpYmxlIHdpdGggcmZjNDY0OCBhbHRlcm5hdGl2ZSBlbmNvZGluZyBmb3IgdXJscy5cbi8vIEBwYXJhbSBiYXNlNjRFbmNvZGVkIGEgbm9kZWpzIGJhc2U2NCBlbmNvZGVkIHN0cmluZ1xuZnVuY3Rpb24gYmFzZTY0VXJsRXNjYXBlKGJhc2U2NEVuY29kZWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIGJ1aWx0aW4gbm9kZSBqcyBiYXNlIDY0IGVuY29kaW5nIGlzIG5vdCA2NCB1cmwgY29tcGF0aWJsZS5cbiAgLy8gU2VlIGh0dHBzOi8vdG9vbHNuLmlldGYub3JnL2h0bWwvcmZjNDY0OCNzZWN0aW9uLTVcbiAgcmV0dXJuIGJhc2U2NEVuY29kZWRcbiAgICAucmVwbGFjZSgvXFwrL2csICctJylcbiAgICAucmVwbGFjZSgvXFwvL2csICdfJylcbiAgICAucmVwbGFjZSgvPS9nLCAnJyk7XG59XG5cbi8qKlxuICogdHlwZSBkZWZzXG4gKi9cbmV4cG9ydCB0eXBlIE9BdXRoMkNvbmZpZyA9IHtcbiAgY2xpZW50SWQ/OiBzdHJpbmc7XG4gIGNsaWVudFNlY3JldD86IHN0cmluZztcbiAgcmVkaXJlY3RVcmk/OiBzdHJpbmc7XG4gIGxvZ2luVXJsPzogc3RyaW5nO1xuICBhdXRoelNlcnZpY2VVcmw/OiBzdHJpbmc7XG4gIHRva2VuU2VydmljZVVybD86IHN0cmluZztcbiAgcmV2b2tlU2VydmljZVVybD86IHN0cmluZztcbiAgcHJveHlVcmw/OiBzdHJpbmc7XG4gIGh0dHBQcm94eT86IHN0cmluZztcbiAgdXNlVmVyaWZpZXI/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgQXV0aHpSZXF1ZXN0UGFyYW1zID0ge1xuICBzY29wZT86IHN0cmluZztcbiAgc3RhdGU/OiBzdHJpbmc7XG4gIGNvZGVfY2hhbGxlbmdlPzogc3RyaW5nO1xufSAmIHtcbiAgW2F0dHI6IHN0cmluZ106IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFRva2VuUmVzcG9uc2UgPSB7XG4gIHRva2VuX3R5cGU6ICdCZWFyZXInO1xuICBpZDogc3RyaW5nO1xuICBhY2Nlc3NfdG9rZW46IHN0cmluZztcbiAgcmVmcmVzaF90b2tlbj86IHN0cmluZztcbiAgc2lnbmF0dXJlOiBzdHJpbmc7XG4gIGlzc3VlZF9hdDogc3RyaW5nO1xuICBpbnN0YW5jZV91cmw6IHN0cmluZztcbiAgc2ZkY19jb21tdW5pdHlfdXJsPzogc3RyaW5nO1xuICBzZmRjX2NvbW11bml0eV9pZD86IHN0cmluZztcbn07XG5cbi8qKlxuICogT0F1dGgyIGNsYXNzXG4gKi9cbmV4cG9ydCBjbGFzcyBPQXV0aDIge1xuICBsb2dpblVybDogc3RyaW5nO1xuICBhdXRoelNlcnZpY2VVcmw6IHN0cmluZztcbiAgdG9rZW5TZXJ2aWNlVXJsOiBzdHJpbmc7XG4gIHJldm9rZVNlcnZpY2VVcmw6IHN0cmluZztcbiAgY2xpZW50SWQ6IE9wdGlvbmFsPHN0cmluZz47XG4gIGNsaWVudFNlY3JldDogT3B0aW9uYWw8c3RyaW5nPjtcbiAgcmVkaXJlY3RVcmk6IE9wdGlvbmFsPHN0cmluZz47XG4gIGNvZGVWZXJpZmllcjogT3B0aW9uYWw8c3RyaW5nPjtcblxuICBfdHJhbnNwb3J0OiBUcmFuc3BvcnQ7XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb25maWc6IE9BdXRoMkNvbmZpZykge1xuICAgIGNvbnN0IHtcbiAgICAgIGxvZ2luVXJsLFxuICAgICAgYXV0aHpTZXJ2aWNlVXJsLFxuICAgICAgdG9rZW5TZXJ2aWNlVXJsLFxuICAgICAgcmV2b2tlU2VydmljZVVybCxcbiAgICAgIGNsaWVudElkLFxuICAgICAgY2xpZW50U2VjcmV0LFxuICAgICAgcmVkaXJlY3RVcmksXG4gICAgICBwcm94eVVybCxcbiAgICAgIGh0dHBQcm94eSxcbiAgICAgIHVzZVZlcmlmaWVyLFxuICAgIH0gPSBjb25maWc7XG4gICAgaWYgKGF1dGh6U2VydmljZVVybCAmJiB0b2tlblNlcnZpY2VVcmwpIHtcbiAgICAgIHRoaXMubG9naW5VcmwgPSBhdXRoelNlcnZpY2VVcmwuc3BsaXQoJy8nKS5zbGljZSgwLCAzKS5qb2luKCcvJyk7XG4gICAgICB0aGlzLmF1dGh6U2VydmljZVVybCA9IGF1dGh6U2VydmljZVVybDtcbiAgICAgIHRoaXMudG9rZW5TZXJ2aWNlVXJsID0gdG9rZW5TZXJ2aWNlVXJsO1xuICAgICAgdGhpcy5yZXZva2VTZXJ2aWNlVXJsID1cbiAgICAgICAgcmV2b2tlU2VydmljZVVybCB8fCBgJHt0aGlzLmxvZ2luVXJsfS9zZXJ2aWNlcy9vYXV0aDIvcmV2b2tlYDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sb2dpblVybCA9IGxvZ2luVXJsIHx8IGRlZmF1bHRPQXV0aDJDb25maWcubG9naW5Vcmw7XG4gICAgICB0aGlzLmF1dGh6U2VydmljZVVybCA9IGAke3RoaXMubG9naW5Vcmx9L3NlcnZpY2VzL29hdXRoMi9hdXRob3JpemVgO1xuICAgICAgdGhpcy50b2tlblNlcnZpY2VVcmwgPSBgJHt0aGlzLmxvZ2luVXJsfS9zZXJ2aWNlcy9vYXV0aDIvdG9rZW5gO1xuICAgICAgdGhpcy5yZXZva2VTZXJ2aWNlVXJsID0gYCR7dGhpcy5sb2dpblVybH0vc2VydmljZXMvb2F1dGgyL3Jldm9rZWA7XG4gICAgfVxuICAgIHRoaXMuY2xpZW50SWQgPSBjbGllbnRJZDtcbiAgICB0aGlzLmNsaWVudFNlY3JldCA9IGNsaWVudFNlY3JldDtcbiAgICB0aGlzLnJlZGlyZWN0VXJpID0gcmVkaXJlY3RVcmk7XG4gICAgaWYgKHByb3h5VXJsKSB7XG4gICAgICB0aGlzLl90cmFuc3BvcnQgPSBuZXcgWGRQcm94eVRyYW5zcG9ydChwcm94eVVybCk7XG4gICAgfSBlbHNlIGlmIChodHRwUHJveHkpIHtcbiAgICAgIHRoaXMuX3RyYW5zcG9ydCA9IG5ldyBIdHRwUHJveHlUcmFuc3BvcnQoaHR0cFByb3h5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdHJhbnNwb3J0ID0gbmV3IFRyYW5zcG9ydCgpO1xuICAgIH1cbiAgICBpZiAodXNlVmVyaWZpZXIpIHtcbiAgICAgIC8vIFNldCBhIGNvZGUgdmVyaWZpZXIgc3RyaW5nIGZvciBPQXV0aCBhdXRob3JpemF0aW9uXG4gICAgICB0aGlzLmNvZGVWZXJpZmllciA9IGJhc2U2NFVybEVzY2FwZShcbiAgICAgICAgcmFuZG9tQnl0ZXMoTWF0aC5jZWlsKDEyOCkpLnRvU3RyaW5nKCdiYXNlNjQnKSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBTYWxlc2ZvcmNlIE9BdXRoMiBhdXRob3JpemF0aW9uIHBhZ2UgVVJMIHRvIHJlZGlyZWN0IHVzZXIgYWdlbnQuXG4gICAqL1xuICBnZXRBdXRob3JpemF0aW9uVXJsKHBhcmFtczogQXV0aHpSZXF1ZXN0UGFyYW1zID0ge30pIHtcbiAgICBpZiAodGhpcy5jb2RlVmVyaWZpZXIpIHtcbiAgICAgIC8vIGNvZGUgdmVyaWZpZXIgbXVzdCBiZSBhIGJhc2UgNjQgdXJsIGVuY29kZWQgaGFzaCBvZiAxMjggYnl0ZXMgb2YgcmFuZG9tIGRhdGEuIE91ciByYW5kb20gZGF0YSBpcyBhbHNvXG4gICAgICAvLyBiYXNlIDY0IHVybCBlbmNvZGVkLiBTZWUgQ29ubmVjdGlvbi5jcmVhdGUoKTtcbiAgICAgIGNvbnN0IGNvZGVDaGFsbGVuZ2UgPSBiYXNlNjRVcmxFc2NhcGUoXG4gICAgICAgIGNyZWF0ZUhhc2goJ3NoYTI1NicpLnVwZGF0ZSh0aGlzLmNvZGVWZXJpZmllcikuZGlnZXN0KCdiYXNlNjQnKSxcbiAgICAgICk7XG4gICAgICBwYXJhbXMuY29kZV9jaGFsbGVuZ2UgPSBjb2RlQ2hhbGxlbmdlO1xuICAgIH1cblxuICAgIGNvbnN0IF9wYXJhbXMgPSB7XG4gICAgICAuLi5wYXJhbXMsXG4gICAgICByZXNwb25zZV90eXBlOiAnY29kZScsXG4gICAgICBjbGllbnRfaWQ6IHRoaXMuY2xpZW50SWQsXG4gICAgICByZWRpcmVjdF91cmk6IHRoaXMucmVkaXJlY3RVcmksXG4gICAgfTtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5hdXRoelNlcnZpY2VVcmwgK1xuICAgICAgKHRoaXMuYXV0aHpTZXJ2aWNlVXJsLmluZGV4T2YoJz8nKSA+PSAwID8gJyYnIDogJz8nKSArXG4gICAgICBxdWVyeXN0cmluZy5zdHJpbmdpZnkoX3BhcmFtcyBhcyB7IFtuYW1lOiBzdHJpbmddOiBhbnkgfSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIE9BdXRoMiBSZWZyZXNoIFRva2VuIEZsb3dcbiAgICovXG4gIGFzeW5jIHJlZnJlc2hUb2tlbihyZWZyZXNoVG9rZW46IHN0cmluZyk6IFByb21pc2U8VG9rZW5SZXNwb25zZT4ge1xuICAgIGlmICghdGhpcy5jbGllbnRJZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBPQXV0aDIgY2xpZW50IGlkIGluZm9ybWF0aW9uIGlzIHNwZWNpZmllZCcpO1xuICAgIH1cbiAgICBjb25zdCBwYXJhbXM6IHsgW3Byb3A6IHN0cmluZ106IHN0cmluZyB9ID0ge1xuICAgICAgZ3JhbnRfdHlwZTogJ3JlZnJlc2hfdG9rZW4nLFxuICAgICAgcmVmcmVzaF90b2tlbjogcmVmcmVzaFRva2VuLFxuICAgICAgY2xpZW50X2lkOiB0aGlzLmNsaWVudElkLFxuICAgIH07XG4gICAgaWYgKHRoaXMuY2xpZW50U2VjcmV0KSB7XG4gICAgICBwYXJhbXMuY2xpZW50X3NlY3JldCA9IHRoaXMuY2xpZW50U2VjcmV0O1xuICAgIH1cbiAgICBjb25zdCByZXQgPSBhd2FpdCB0aGlzLl9wb3N0UGFyYW1zKHBhcmFtcyk7XG4gICAgcmV0dXJuIHJldCBhcyBUb2tlblJlc3BvbnNlO1xuICB9XG5cbiAgLyoqXG4gICAqIE9BdXRoMiBXZWIgU2VydmVyIEF1dGhlbnRpY2F0aW9uIEZsb3cgKEF1dGhvcml6YXRpb24gQ29kZSlcbiAgICogQWNjZXNzIFRva2VuIFJlcXVlc3RcbiAgICovXG4gIGFzeW5jIHJlcXVlc3RUb2tlbihcbiAgICBjb2RlOiBzdHJpbmcsXG4gICAgcGFyYW1zOiB7IFtwcm9wOiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9LFxuICApOiBQcm9taXNlPFRva2VuUmVzcG9uc2U+IHtcbiAgICBpZiAoIXRoaXMuY2xpZW50SWQgfHwgIXRoaXMucmVkaXJlY3RVcmkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ05vIE9BdXRoMiBjbGllbnQgaWQgb3IgcmVkaXJlY3QgdXJpIGNvbmZpZ3VyYXRpb24gaXMgc3BlY2lmaWVkJyxcbiAgICAgICk7XG4gICAgfVxuICAgIGNvbnN0IF9wYXJhbXM6IHsgW3Byb3A6IHN0cmluZ106IHN0cmluZyB9ID0ge1xuICAgICAgLi4ucGFyYW1zLFxuICAgICAgZ3JhbnRfdHlwZTogJ2F1dGhvcml6YXRpb25fY29kZScsXG4gICAgICBjb2RlLFxuICAgICAgY2xpZW50X2lkOiB0aGlzLmNsaWVudElkLFxuICAgICAgcmVkaXJlY3RfdXJpOiB0aGlzLnJlZGlyZWN0VXJpLFxuICAgIH07XG4gICAgaWYgKHRoaXMuY2xpZW50U2VjcmV0KSB7XG4gICAgICBfcGFyYW1zLmNsaWVudF9zZWNyZXQgPSB0aGlzLmNsaWVudFNlY3JldDtcbiAgICB9XG4gICAgY29uc3QgcmV0ID0gYXdhaXQgdGhpcy5fcG9zdFBhcmFtcyhfcGFyYW1zKTtcbiAgICByZXR1cm4gcmV0IGFzIFRva2VuUmVzcG9uc2U7XG4gIH1cblxuICAvKipcbiAgICogT0F1dGgyIFVzZXJuYW1lLVBhc3N3b3JkIEZsb3cgKFJlc291cmNlIE93bmVyIFBhc3N3b3JkIENyZWRlbnRpYWxzKVxuICAgKi9cbiAgYXN5bmMgYXV0aGVudGljYXRlKFxuICAgIHVzZXJuYW1lOiBzdHJpbmcsXG4gICAgcGFzc3dvcmQ6IHN0cmluZyxcbiAgKTogUHJvbWlzZTxUb2tlblJlc3BvbnNlPiB7XG4gICAgaWYgKCF0aGlzLmNsaWVudElkIHx8ICF0aGlzLmNsaWVudFNlY3JldCB8fCAhdGhpcy5yZWRpcmVjdFVyaSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyB2YWxpZCBPQXV0aDIgY2xpZW50IGNvbmZpZ3VyYXRpb24gc2V0Jyk7XG4gICAgfVxuICAgIGNvbnN0IHJldCA9IGF3YWl0IHRoaXMuX3Bvc3RQYXJhbXMoe1xuICAgICAgZ3JhbnRfdHlwZTogJ3Bhc3N3b3JkJyxcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBjbGllbnRfaWQ6IHRoaXMuY2xpZW50SWQsXG4gICAgICBjbGllbnRfc2VjcmV0OiB0aGlzLmNsaWVudFNlY3JldCxcbiAgICAgIHJlZGlyZWN0X3VyaTogdGhpcy5yZWRpcmVjdFVyaSxcbiAgICB9KTtcbiAgICByZXR1cm4gcmV0IGFzIFRva2VuUmVzcG9uc2U7XG4gIH1cblxuICAvKipcbiAgICogT0F1dGgyIFJldm9rZSBTZXNzaW9uIFRva2VuXG4gICAqL1xuICBhc3luYyByZXZva2VUb2tlbih0b2tlbjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl90cmFuc3BvcnQuaHR0cFJlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICB1cmw6IHRoaXMucmV2b2tlU2VydmljZVVybCxcbiAgICAgIGJvZHk6IHF1ZXJ5c3RyaW5nLnN0cmluZ2lmeSh7IHRva2VuIH0pLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlID49IDQwMCkge1xuICAgICAgbGV0IHJlczogYW55ID0gcXVlcnlzdHJpbmcucGFyc2UocmVzcG9uc2UuYm9keSk7XG4gICAgICBpZiAoIXJlcyB8fCAhcmVzLmVycm9yKSB7XG4gICAgICAgIHJlcyA9IHtcbiAgICAgICAgICBlcnJvcjogYEVSUk9SX0hUVFBfJHtyZXNwb25zZS5zdGF0dXNDb2RlfWAsXG4gICAgICAgICAgZXJyb3JfZGVzY3JpcHRpb246IHJlc3BvbnNlLmJvZHksXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgKGNsYXNzIGV4dGVuZHMgRXJyb3Ige1xuICAgICAgICBjb25zdHJ1Y3Rvcih7XG4gICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgZXJyb3JfZGVzY3JpcHRpb24sXG4gICAgICAgIH06IHtcbiAgICAgICAgICBlcnJvcjogc3RyaW5nO1xuICAgICAgICAgIGVycm9yX2Rlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgICAgIH0pIHtcbiAgICAgICAgICBzdXBlcihlcnJvcl9kZXNjcmlwdGlvbik7XG4gICAgICAgICAgdGhpcy5uYW1lID0gZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH0pKHJlcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhc3luYyBfcG9zdFBhcmFtcyhwYXJhbXM6IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9KTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAodGhpcy5jb2RlVmVyaWZpZXIpIHBhcmFtcy5jb2RlX3ZlcmlmaWVyID0gdGhpcy5jb2RlVmVyaWZpZXI7XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX3RyYW5zcG9ydC5odHRwUmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybDogdGhpcy50b2tlblNlcnZpY2VVcmwsXG4gICAgICBib2R5OiBxdWVyeXN0cmluZy5zdHJpbmdpZnkocGFyYW1zKSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBsZXQgcmVzO1xuICAgIHRyeSB7XG4gICAgICByZXMgPSBKU09OLnBhcnNlKHJlc3BvbnNlLmJvZHkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWVtcHR5ICovXG4gICAgfVxuICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlID49IDQwMCkge1xuICAgICAgcmVzID0gcmVzIHx8IHtcbiAgICAgICAgZXJyb3I6IGBFUlJPUl9IVFRQXyR7cmVzcG9uc2Uuc3RhdHVzQ29kZX1gLFxuICAgICAgICBlcnJvcl9kZXNjcmlwdGlvbjogcmVzcG9uc2UuYm9keSxcbiAgICAgIH07XG4gICAgICB0aHJvdyBuZXcgKGNsYXNzIGV4dGVuZHMgRXJyb3Ige1xuICAgICAgICBjb25zdHJ1Y3Rvcih7XG4gICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgZXJyb3JfZGVzY3JpcHRpb24sXG4gICAgICAgIH06IHtcbiAgICAgICAgICBlcnJvcjogc3RyaW5nO1xuICAgICAgICAgIGVycm9yX2Rlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgICAgIH0pIHtcbiAgICAgICAgICBzdXBlcihlcnJvcl9kZXNjcmlwdGlvbik7XG4gICAgICAgICAgdGhpcy5uYW1lID0gZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH0pKHJlcyk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQg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