"use strict";

var _Object$keys = require("@babel/runtime-corejs3/core-js-stable/object/keys");

var _Object$getOwnPropertySymbols = require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-symbols");

var _filterInstanceProperty = require("@babel/runtime-corejs3/core-js-stable/instance/filter");

var _Object$getOwnPropertyDescriptor = require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-descriptor");

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js-stable/instance/for-each");

var _Object$getOwnPropertyDescriptors = require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-descriptors");

var _Object$defineProperties = require("@babel/runtime-corejs3/core-js-stable/object/define-properties");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

var _Symbol$toPrimitive = require("@babel/runtime-corejs3/core-js-stable/symbol/to-primitive");

var _WeakMap = require("@babel/runtime-corejs3/core-js-stable/weak-map");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = exports.Connection = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/parse-int"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/json/stringify"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/index-of"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.promise.js");

var _events = require("events");

var _jsforce = _interopRequireDefault(require("./jsforce"));

var _transport = _interopRequireWildcard(require("./transport"));

var _logger = require("./util/logger");

var _oauth = _interopRequireDefault(require("./oauth2"));

var _cache = _interopRequireDefault(require("./cache"));

var _httpApi = _interopRequireDefault(require("./http-api"));

var _sessionRefreshDelegate = _interopRequireDefault(require("./session-refresh-delegate"));

var _query = _interopRequireDefault(require("./query"));

var _sobject = _interopRequireDefault(require("./sobject"));

var _quickAction = _interopRequireDefault(require("./quick-action"));

var _process = _interopRequireDefault(require("./process"));

var _formatter = require("./util/formatter");

const _excluded = ["Id", "type", "attributes"],
      _excluded2 = ["Id", "type", "attributes"],
      _excluded3 = ["Id", "type", "attributes"],
      _excluded4 = ["Id", "type", "attributes"];

function _getRequireWildcardCache(nodeInterop) { if (typeof _WeakMap !== "function") return null; var cacheBabelInterop = new _WeakMap(); var cacheNodeInterop = new _WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = _Object$defineProperty && _Object$getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? _Object$getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { _Object$defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }

function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[_Symbol$toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

function ownKeys(object, enumerableOnly) { var keys = _Object$keys(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context6, _context7; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context6 = ownKeys(Object(source), !0)).call(_context6, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context7 = ownKeys(Object(source))).call(_context7, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 *
 */
const defaultConnectionConfig = {
  loginUrl: 'https://login.salesforce.com',
  instanceUrl: '',
  version: '50.0',
  logLevel: 'NONE',
  maxRequest: 10
};
/**
 *
 */

function esc(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
/**
 *
 */


function parseSignedRequest(sr) {
  if (typeof sr === 'string') {
    if (sr[0] === '{') {
      // might be JSON
      return JSON.parse(sr);
    } // might be original base64-encoded signed request


    const msg = sr.split('.').pop(); // retrieve latter part

    if (!msg) {
      throw new Error('Invalid signed request');
    }

    const json = Buffer.from(msg, 'base64').toString('utf-8');
    return JSON.parse(json);
  }

  return sr;
}
/** @private **/


function parseIdUrl(url) {
  var _context;

  const [organizationId, id] = (0, _slice.default)(_context = url.split('/')).call(_context, -2);
  return {
    id,
    organizationId,
    url
  };
}
/**
 * Session Refresh delegate function for OAuth2 authz code flow
 * @private
 */


async function oauthRefreshFn(conn, callback) {
  try {
    if (!conn.refreshToken) {
      throw new Error('No refresh token found in the connection');
    }

    const res = await conn.oauth2.refreshToken(conn.refreshToken);
    const userInfo = parseIdUrl(res.id);

    conn._establish({
      instanceUrl: res.instance_url,
      accessToken: res.access_token,
      userInfo
    });

    callback(undefined, res.access_token, res);
  } catch (err) {
    if (err instanceof Error) {
      callback(err);
    } else {
      throw err;
    }
  }
}
/**
 * Session Refresh delegate function for username/password login
 * @private
 */


function createUsernamePasswordRefreshFn(username, password) {
  return async (conn, callback) => {
    try {
      await conn.login(username, password);

      if (!conn.accessToken) {
        throw new Error('Access token not found after login');
      }

      callback(null, conn.accessToken);
    } catch (err) {
      if (err instanceof Error) {
        callback(err);
      } else {
        throw err;
      }
    }
  };
}
/**
 * @private
 */


function toSaveResult(err) {
  return {
    success: false,
    errors: [err]
  };
}
/**
 *
 */


function raiseNoModuleError(name) {
  throw new Error(`API module '${name}' is not loaded, load 'jsforce/api/${name}' explicitly`);
}
/*
 * Constant of maximum records num in DML operation (update/delete)
 */


const MAX_DML_COUNT = 200;
/**
 *
 */

class Connection extends _events.EventEmitter {
  // describe: (name: string) => Promise<DescribeSObjectResult>;
  // describeGlobal: () => Promise<DescribeGlobalResult>;
  // API libs are not instantiated here so that core module to remain without dependencies to them
  // It is responsible for developers to import api libs explicitly if they are using 'jsforce/core' instead of 'jsforce'.
  get analytics() {
    return raiseNoModuleError('analytics');
  }

  get apex() {
    return raiseNoModuleError('apex');
  }

  get bulk() {
    return raiseNoModuleError('bulk');
  }

  get chatter() {
    return raiseNoModuleError('chatter');
  }

  get metadata() {
    return raiseNoModuleError('metadata');
  }

  get soap() {
    return raiseNoModuleError('soap');
  }

  get streaming() {
    return raiseNoModuleError('streaming');
  }

  get tooling() {
    return raiseNoModuleError('tooling');
  }
  /**
   *
   */


  constructor(config = {}) {
    super();
    (0, _defineProperty2.default)(this, "version", void 0);
    (0, _defineProperty2.default)(this, "loginUrl", void 0);
    (0, _defineProperty2.default)(this, "instanceUrl", void 0);
    (0, _defineProperty2.default)(this, "accessToken", void 0);
    (0, _defineProperty2.default)(this, "refreshToken", void 0);
    (0, _defineProperty2.default)(this, "userInfo", void 0);
    (0, _defineProperty2.default)(this, "limitInfo", {});
    (0, _defineProperty2.default)(this, "oauth2", void 0);
    (0, _defineProperty2.default)(this, "sobjects", {});
    (0, _defineProperty2.default)(this, "cache", void 0);
    (0, _defineProperty2.default)(this, "_callOptions", void 0);
    (0, _defineProperty2.default)(this, "_maxRequest", void 0);
    (0, _defineProperty2.default)(this, "_logger", void 0);
    (0, _defineProperty2.default)(this, "_logLevel", void 0);
    (0, _defineProperty2.default)(this, "_transport", void 0);
    (0, _defineProperty2.default)(this, "_sessionType", void 0);
    (0, _defineProperty2.default)(this, "_refreshDelegate", void 0);
    (0, _defineProperty2.default)(this, "describe$", void 0);
    (0, _defineProperty2.default)(this, "describe$$", void 0);
    (0, _defineProperty2.default)(this, "describeSObject", void 0);
    (0, _defineProperty2.default)(this, "describeSObject$", void 0);
    (0, _defineProperty2.default)(this, "describeSObject$$", void 0);
    (0, _defineProperty2.default)(this, "describeGlobal$", void 0);
    (0, _defineProperty2.default)(this, "describeGlobal$$", void 0);
    (0, _defineProperty2.default)(this, "insert", this.create);
    (0, _defineProperty2.default)(this, "delete", this.destroy);
    (0, _defineProperty2.default)(this, "del", this.destroy);
    (0, _defineProperty2.default)(this, "process", new _process.default(this));
    const {
      loginUrl,
      instanceUrl,
      version,
      oauth2,
      maxRequest,
      logLevel,
      proxyUrl,
      httpProxy
    } = config;
    this.loginUrl = loginUrl || defaultConnectionConfig.loginUrl;
    this.instanceUrl = instanceUrl || defaultConnectionConfig.instanceUrl;
    this.version = version || defaultConnectionConfig.version;
    this.oauth2 = oauth2 instanceof _oauth.default ? oauth2 : new _oauth.default(_objectSpread({
      loginUrl: this.loginUrl,
      proxyUrl,
      httpProxy
    }, oauth2));
    let refreshFn = config.refreshFn;

    if (!refreshFn && this.oauth2.clientId) {
      refreshFn = oauthRefreshFn;
    }

    if (refreshFn) {
      this._refreshDelegate = new _sessionRefreshDelegate.default(this, refreshFn);
    }

    this._maxRequest = maxRequest || defaultConnectionConfig.maxRequest;
    this._logger = logLevel ? Connection._logger.createInstance(logLevel) : Connection._logger;
    this._logLevel = logLevel;
    this._transport = proxyUrl ? new _transport.XdProxyTransport(proxyUrl) : httpProxy ? new _transport.HttpProxyTransport(httpProxy) : new _transport.default();
    this._callOptions = config.callOptions;
    this.cache = new _cache.default();

    const describeCacheKey = type => type ? `describe.${type}` : 'describe';

    const describe = Connection.prototype.describe;
    this.describe = this.cache.createCachedFunction(describe, this, {
      key: describeCacheKey,
      strategy: 'NOCACHE'
    });
    this.describe$ = this.cache.createCachedFunction(describe, this, {
      key: describeCacheKey,
      strategy: 'HIT'
    });
    this.describe$$ = this.cache.createCachedFunction(describe, this, {
      key: describeCacheKey,
      strategy: 'IMMEDIATE'
    });
    this.describeSObject = this.describe;
    this.describeSObject$ = this.describe$;
    this.describeSObject$$ = this.describe$$;
    const describeGlobal = Connection.prototype.describeGlobal;
    this.describeGlobal = this.cache.createCachedFunction(describeGlobal, this, {
      key: 'describeGlobal',
      strategy: 'NOCACHE'
    });
    this.describeGlobal$ = this.cache.createCachedFunction(describeGlobal, this, {
      key: 'describeGlobal',
      strategy: 'HIT'
    });
    this.describeGlobal$$ = this.cache.createCachedFunction(describeGlobal, this, {
      key: 'describeGlobal',
      strategy: 'IMMEDIATE'
    });
    const {
      accessToken,
      refreshToken,
      sessionId,
      serverUrl,
      signedRequest
    } = config;

    this._establish({
      accessToken,
      refreshToken,
      instanceUrl,
      sessionId,
      serverUrl,
      signedRequest
    });

    _jsforce.default.emit('connection:new', this);
  }
  /* @private */


  _establish(options) {
    var _context2;

    const {
      accessToken,
      refreshToken,
      instanceUrl,
      sessionId,
      serverUrl,
      signedRequest,
      userInfo
    } = options;
    this.instanceUrl = serverUrl ? (0, _slice.default)(_context2 = serverUrl.split('/')).call(_context2, 0, 3).join('/') : instanceUrl || this.instanceUrl;
    this.accessToken = sessionId || accessToken || this.accessToken;
    this.refreshToken = refreshToken || this.refreshToken;

    if (this.refreshToken && !this._refreshDelegate) {
      throw new Error('Refresh token is specified without oauth2 client information or refresh function');
    }

    const signedRequestObject = signedRequest && parseSignedRequest(signedRequest);

    if (signedRequestObject) {
      this.accessToken = signedRequestObject.client.oauthToken;

      if (_transport.CanvasTransport.supported) {
        this._transport = new _transport.CanvasTransport(signedRequestObject);
      }
    }

    this.userInfo = userInfo || this.userInfo;
    this._sessionType = sessionId ? 'soap' : 'oauth2';

    this._resetInstance();
  }
  /* @priveate */


  _clearSession() {
    this.accessToken = null;
    this.refreshToken = null;
    this.instanceUrl = defaultConnectionConfig.instanceUrl;
    this.userInfo = null;
    this._sessionType = null;
  }
  /* @priveate */


  _resetInstance() {
    this.limitInfo = {};
    this.sobjects = {}; // TODO impl cache

    this.cache.clear();
    this.cache.get('describeGlobal').removeAllListeners('value');
    this.cache.get('describeGlobal').on('value', ({
      result
    }) => {
      if (result) {
        for (const so of result.sobjects) {
          this.sobject(so.name);
        }
      }
    });
    /*
    if (this.tooling) {
      this.tooling._resetInstance();
    }
    */
  }
  /**
   * Authorize (using oauth2 web server flow)
   */


  async authorize(code, params = {}) {
    const res = await this.oauth2.requestToken(code, params);
    const userInfo = parseIdUrl(res.id);

    this._establish({
      instanceUrl: res.instance_url,
      accessToken: res.access_token,
      refreshToken: res.refresh_token,
      userInfo
    });

    this._logger.debug(`<login> completed. user id = ${userInfo.id}, org id = ${userInfo.organizationId}`);

    return userInfo;
  }
  /**
   *
   */


  async login(username, password) {
    this._refreshDelegate = new _sessionRefreshDelegate.default(this, createUsernamePasswordRefreshFn(username, password));

    if (this.oauth2 && this.oauth2.clientId && this.oauth2.clientSecret) {
      return this.loginByOAuth2(username, password);
    }

    return this.loginBySoap(username, password);
  }
  /**
   * Login by OAuth2 username & password flow
   */


  async loginByOAuth2(username, password) {
    const res = await this.oauth2.authenticate(username, password);
    const userInfo = parseIdUrl(res.id);

    this._establish({
      instanceUrl: res.instance_url,
      accessToken: res.access_token,
      userInfo
    });

    this._logger.info(`<login> completed. user id = ${userInfo.id}, org id = ${userInfo.organizationId}`);

    return userInfo;
  }
  /**
   *
   */


  async loginBySoap(username, password) {
    var _context3;

    if (!username || !password) {
      return _promise.default.reject(new Error('no username password given'));
    }

    const body = ['<se:Envelope xmlns:se="http://schemas.xmlsoap.org/soap/envelope/">', '<se:Header/>', '<se:Body>', '<login xmlns="urn:partner.soap.sforce.com">', `<username>${esc(username)}</username>`, `<password>${esc(password)}</password>`, '</login>', '</se:Body>', '</se:Envelope>'].join('');
    const soapLoginEndpoint = [this.loginUrl, 'services/Soap/u', this.version].join('/');
    const response = await this._transport.httpRequest({
      method: 'POST',
      url: soapLoginEndpoint,
      body,
      headers: {
        'Content-Type': 'text/xml',
        SOAPAction: '""'
      }
    });
    let m;

    if (response.statusCode >= 400) {
      m = response.body.match(/<faultstring>([^<]+)<\/faultstring>/);
      const faultstring = m && m[1];
      throw new Error(faultstring || response.body);
    }

    this._logger.debug(`SOAP response = ${response.body}`);

    m = response.body.match(/<serverUrl>([^<]+)<\/serverUrl>/);
    const serverUrl = m && m[1];
    m = response.body.match(/<sessionId>([^<]+)<\/sessionId>/);
    const sessionId = m && m[1];
    m = response.body.match(/<userId>([^<]+)<\/userId>/);
    const userId = m && m[1];
    m = response.body.match(/<organizationId>([^<]+)<\/organizationId>/);
    const organizationId = m && m[1];

    if (!serverUrl || !sessionId || !userId || !organizationId) {
      throw new Error('could not extract session information from login response');
    }

    const idUrl = [this.loginUrl, 'id', organizationId, userId].join('/');
    const userInfo = {
      id: userId,
      organizationId,
      url: idUrl
    };

    this._establish({
      serverUrl: (0, _slice.default)(_context3 = serverUrl.split('/')).call(_context3, 0, 3).join('/'),
      sessionId,
      userInfo
    });

    this._logger.info(`<login> completed. user id = ${userId}, org id = ${organizationId}`);

    return userInfo;
  }
  /**
   * Logout the current session
   */


  async logout(revoke) {
    this._refreshDelegate = undefined;

    if (this._sessionType === 'oauth2') {
      return this.logoutByOAuth2(revoke);
    }

    return this.logoutBySoap(revoke);
  }
  /**
   * Logout the current session by revoking access token via OAuth2 session revoke
   */


  async logoutByOAuth2(revoke) {
    const token = revoke ? this.refreshToken : this.accessToken;

    if (token) {
      await this.oauth2.revokeToken(token);
    } // Destroy the session bound to this connection


    this._clearSession();

    this._resetInstance();
  }
  /**
   * Logout the session by using SOAP web service API
   */


  async logoutBySoap(revoke) {
    const body = ['<se:Envelope xmlns:se="http://schemas.xmlsoap.org/soap/envelope/">', '<se:Header>', '<SessionHeader xmlns="urn:partner.soap.sforce.com">', `<sessionId>${esc(revoke ? this.refreshToken : this.accessToken)}</sessionId>`, '</SessionHeader>', '</se:Header>', '<se:Body>', '<logout xmlns="urn:partner.soap.sforce.com"/>', '</se:Body>', '</se:Envelope>'].join('');
    const response = await this._transport.httpRequest({
      method: 'POST',
      url: [this.instanceUrl, 'services/Soap/u', this.version].join('/'),
      body,
      headers: {
        'Content-Type': 'text/xml',
        SOAPAction: '""'
      }
    });

    this._logger.debug(`SOAP statusCode = ${response.statusCode}, response = ${response.body}`);

    if (response.statusCode >= 400) {
      const m = response.body.match(/<faultstring>([^<]+)<\/faultstring>/);
      const faultstring = m && m[1];
      throw new Error(faultstring || response.body);
    } // Destroy the session bound to this connection


    this._clearSession();

    this._resetInstance();
  }
  /**
   * Send REST API request with given HTTP request info, with connected session information.
   *
   * Endpoint URL can be absolute URL ('https://na1.salesforce.com/services/data/v32.0/sobjects/Account/describe')
   * , relative path from root ('/services/data/v32.0/sobjects/Account/describe')
   * , or relative path from version root ('/sobjects/Account/describe').
   */


  request(request, options = {}) {
    // if request is simple string, regard it as url in GET method
    let request_ = typeof request === 'string' ? {
      method: 'GET',
      url: request
    } : request; // if url is given in relative path, prepend base url or instance url before.

    request_ = _objectSpread(_objectSpread({}, request_), {}, {
      url: this._normalizeUrl(request_.url)
    });
    const httpApi = new _httpApi.default(this, options); // log api usage and its quota

    httpApi.on('response', response => {
      if (response.headers && response.headers['sforce-limit-info']) {
        const apiUsage = response.headers['sforce-limit-info'].match(/api-usage=(\d+)\/(\d+)/);

        if (apiUsage) {
          this.limitInfo = {
            apiUsage: {
              used: (0, _parseInt2.default)(apiUsage[1], 10),
              limit: (0, _parseInt2.default)(apiUsage[2], 10)
            }
          };
        }
      }
    });
    return httpApi.request(request_);
  }
  /**
   * Send HTTP GET request
   *
   * Endpoint URL can be absolute URL ('https://na1.salesforce.com/services/data/v32.0/sobjects/Account/describe')
   * , relative path from root ('/services/data/v32.0/sobjects/Account/describe')
   * , or relative path from version root ('/sobjects/Account/describe').
   */


  requestGet(url, options) {
    const request = {
      method: 'GET',
      url
    };
    return this.request(request, options);
  }
  /**
   * Send HTTP POST request with JSON body, with connected session information
   *
   * Endpoint URL can be absolute URL ('https://na1.salesforce.com/services/data/v32.0/sobjects/Account/describe')
   * , relative path from root ('/services/data/v32.0/sobjects/Account/describe')
   * , or relative path from version root ('/sobjects/Account/describe').
   */


  requestPost(url, body, options) {
    const request = {
      method: 'POST',
      url,
      body: (0, _stringify.default)(body),
      headers: {
        'content-type': 'application/json'
      }
    };
    return this.request(request, options);
  }
  /**
   * Send HTTP PUT request with JSON body, with connected session information
   *
   * Endpoint URL can be absolute URL ('https://na1.salesforce.com/services/data/v32.0/sobjects/Account/describe')
   * , relative path from root ('/services/data/v32.0/sobjects/Account/describe')
   * , or relative path from version root ('/sobjects/Account/describe').
   */


  requestPut(url, body, options) {
    const request = {
      method: 'PUT',
      url,
      body: (0, _stringify.default)(body),
      headers: {
        'content-type': 'application/json'
      }
    };
    return this.request(request, options);
  }
  /**
   * Send HTTP PATCH request with JSON body
   *
   * Endpoint URL can be absolute URL ('https://na1.salesforce.com/services/data/v32.0/sobjects/Account/describe')
   * , relative path from root ('/services/data/v32.0/sobjects/Account/describe')
   * , or relative path from version root ('/sobjects/Account/describe').
   */


  requestPatch(url, body, options) {
    const request = {
      method: 'PATCH',
      url,
      body: (0, _stringify.default)(body),
      headers: {
        'content-type': 'application/json'
      }
    };
    return this.request(request, options);
  }
  /**
   * Send HTTP DELETE request
   *
   * Endpoint URL can be absolute URL ('https://na1.salesforce.com/services/data/v32.0/sobjects/Account/describe')
   * , relative path from root ('/services/data/v32.0/sobjects/Account/describe')
   * , or relative path from version root ('/sobjects/Account/describe').
   */


  requestDelete(url, options) {
    const request = {
      method: 'DELETE',
      url
    };
    return this.request(request, options);
  }
  /** @private **/


  _baseUrl() {
    return [this.instanceUrl, 'services/data', `v${this.version}`].join('/');
  }
  /**
   * Convert path to absolute url
   * @private
   */


  _normalizeUrl(url) {
    if (url[0] === '/') {
      if ((0, _indexOf.default)(url).call(url, this.instanceUrl + '/services/') === 0) {
        return url;
      }

      if ((0, _indexOf.default)(url).call(url, '/services/') === 0) {
        return this.instanceUrl + url;
      }

      return this._baseUrl() + url;
    }

    return url;
  }
  /**
   *
   */


  query(soql, options) {
    return new _query.default(this, soql, options);
  }
  /**
   * Execute search by SOSL
   *
   * @param {String} sosl - SOSL string
   * @param {Callback.<Array.<RecordResult>>} [callback] - Callback function
   * @returns {Promise.<Array.<RecordResult>>}
   */


  search(sosl) {
    var url = this._baseUrl() + '/search?q=' + encodeURIComponent(sosl);
    return this.request(url);
  }
  /**
   *
   */


  queryMore(locator, options) {
    return new _query.default(this, {
      locator
    }, options);
  }
  /* */


  _ensureVersion(majorVersion) {
    const versions = this.version.split('.');
    return (0, _parseInt2.default)(versions[0], 10) >= majorVersion;
  }
  /* */


  _supports(feature) {
    switch (feature) {
      case 'sobject-collection':
        // sobject collection is available only in API ver 42.0+
        return this._ensureVersion(42);

      default:
        return false;
    }
  }
  /**
   * Retrieve specified records
   */


  async retrieve(type, ids, options = {}) {
    return (0, _isArray.default)(ids) ? // check the version whether SObject collection API is supported (42.0)
    this._ensureVersion(42) ? this._retrieveMany(type, ids, options) : this._retrieveParallel(type, ids, options) : this._retrieveSingle(type, ids, options);
  }
  /** @private */


  async _retrieveSingle(type, id, options) {
    if (!id) {
      throw new Error('Invalid record ID. Specify valid record ID value');
    }

    let url = [this._baseUrl(), 'sobjects', type, id].join('/');
    const {
      fields,
      headers
    } = options;

    if (fields) {
      url += `?fields=${fields.join(',')}`;
    }

    return this.request({
      method: 'GET',
      url,
      headers
    });
  }
  /** @private */


  async _retrieveParallel(type, ids, options) {
    if (ids.length > this._maxRequest) {
      throw new Error('Exceeded max limit of concurrent call');
    }

    return _promise.default.all((0, _map.default)(ids).call(ids, id => this._retrieveSingle(type, id, options).catch(err => {
      if (options.allOrNone || err.errorCode !== 'NOT_FOUND') {
        throw err;
      }

      return null;
    })));
  }
  /** @private */


  async _retrieveMany(type, ids, options) {
    var _context4;

    if (ids.length === 0) {
      return [];
    }

    const url = [this._baseUrl(), 'composite', 'sobjects', type].join('/');
    const fields = options.fields || (0, _map.default)(_context4 = (await this.describe$(type)).fields).call(_context4, field => field.name);
    return this.request({
      method: 'POST',
      url,
      body: (0, _stringify.default)({
        ids,
        fields
      }),
      headers: _objectSpread(_objectSpread({}, options.headers || {}), {}, {
        'content-type': 'application/json'
      })
    });
  }
  /**
   * Create records
   */


  /**
   * @param type
   * @param records
   * @param options
   */
  async create(type, records, options = {}) {
    const ret = (0, _isArray.default)(records) ? // check the version whether SObject collection API is supported (42.0)
    this._ensureVersion(42) ? await this._createMany(type, records, options) : await this._createParallel(type, records, options) : await this._createSingle(type, records, options);
    return ret;
  }
  /** @private */


  async _createSingle(type, record, options) {
    const {
      Id,
      type: rtype,
      attributes
    } = record,
          rec = (0, _objectWithoutProperties2.default)(record, _excluded);
    const sobjectType = type || attributes && attributes.type || rtype;

    if (!sobjectType) {
      throw new Error('No SObject Type defined in record');
    }

    const url = [this._baseUrl(), 'sobjects', sobjectType].join('/');
    return this.request({
      method: 'POST',
      url,
      body: (0, _stringify.default)(rec),
      headers: _objectSpread(_objectSpread({}, options.headers || {}), {}, {
        'content-type': 'application/json'
      })
    });
  }
  /** @private */


  async _createParallel(type, records, options) {
    if (records.length > this._maxRequest) {
      throw new Error('Exceeded max limit of concurrent call');
    }

    return _promise.default.all((0, _map.default)(records).call(records, record => this._createSingle(type, record, options).catch(err => {
      // be aware that allOrNone in parallel mode will not revert the other successful requests
      // it only raises error when met at least one failed request.
      if (options.allOrNone || !err.errorCode) {
        throw err;
      }

      return toSaveResult(err);
    })));
  }
  /** @private */


  async _createMany(type, records, options) {
    if (records.length === 0) {
      return _promise.default.resolve([]);
    }

    if (records.length > MAX_DML_COUNT && options.allowRecursive) {
      return [...(await this._createMany(type, (0, _slice.default)(records).call(records, 0, MAX_DML_COUNT), options)), ...(await this._createMany(type, (0, _slice.default)(records).call(records, MAX_DML_COUNT), options))];
    }

    const _records = (0, _map.default)(records).call(records, record => {
      const {
        Id,
        type: rtype,
        attributes
      } = record,
            rec = (0, _objectWithoutProperties2.default)(record, _excluded2);
      const sobjectType = type || attributes && attributes.type || rtype;

      if (!sobjectType) {
        throw new Error('No SObject Type defined in record');
      }

      return _objectSpread({
        attributes: {
          type: sobjectType
        }
      }, rec);
    });

    const url = [this._baseUrl(), 'composite', 'sobjects'].join('/');
    return this.request({
      method: 'POST',
      url,
      body: (0, _stringify.default)({
        allOrNone: options.allOrNone || false,
        records: _records
      }),
      headers: _objectSpread(_objectSpread({}, options.headers || {}), {}, {
        'content-type': 'application/json'
      })
    });
  }
  /**
   * Synonym of Connection#create()
   */


  /**
   * @param type
   * @param records
   * @param options
   */
  update(type, records, options = {}) {
    return (0, _isArray.default)(records) ? // check the version whether SObject collection API is supported (42.0)
    this._ensureVersion(42) ? this._updateMany(type, records, options) : this._updateParallel(type, records, options) : this._updateSingle(type, records, options);
  }
  /** @private */


  async _updateSingle(type, record, options) {
    const {
      Id: id,
      type: rtype,
      attributes
    } = record,
          rec = (0, _objectWithoutProperties2.default)(record, _excluded3);

    if (!id) {
      throw new Error('Record id is not found in record.');
    }

    const sobjectType = type || attributes && attributes.type || rtype;

    if (!sobjectType) {
      throw new Error('No SObject Type defined in record');
    }

    const url = [this._baseUrl(), 'sobjects', sobjectType, id].join('/');
    return this.request({
      method: 'PATCH',
      url,
      body: (0, _stringify.default)(rec),
      headers: _objectSpread(_objectSpread({}, options.headers || {}), {}, {
        'content-type': 'application/json'
      })
    }, {
      noContentResponse: {
        id,
        success: true,
        errors: []
      }
    });
  }
  /** @private */


  async _updateParallel(type, records, options) {
    if (records.length > this._maxRequest) {
      throw new Error('Exceeded max limit of concurrent call');
    }

    return _promise.default.all((0, _map.default)(records).call(records, record => this._updateSingle(type, record, options).catch(err => {
      // be aware that allOrNone in parallel mode will not revert the other successful requests
      // it only raises error when met at least one failed request.
      if (options.allOrNone || !err.errorCode) {
        throw err;
      }

      return toSaveResult(err);
    })));
  }
  /** @private */


  async _updateMany(type, records, options) {
    if (records.length === 0) {
      return [];
    }

    if (records.length > MAX_DML_COUNT && options.allowRecursive) {
      return [...(await this._updateMany(type, (0, _slice.default)(records).call(records, 0, MAX_DML_COUNT), options)), ...(await this._updateMany(type, (0, _slice.default)(records).call(records, MAX_DML_COUNT), options))];
    }

    const _records = (0, _map.default)(records).call(records, record => {
      const {
        Id: id,
        type: rtype,
        attributes
      } = record,
            rec = (0, _objectWithoutProperties2.default)(record, _excluded4);

      if (!id) {
        throw new Error('Record id is not found in record.');
      }

      const sobjectType = type || attributes && attributes.type || rtype;

      if (!sobjectType) {
        throw new Error('No SObject Type defined in record');
      }

      return _objectSpread({
        id,
        attributes: {
          type: sobjectType
        }
      }, rec);
    });

    const url = [this._baseUrl(), 'composite', 'sobjects'].join('/');
    return this.request({
      method: 'PATCH',
      url,
      body: (0, _stringify.default)({
        allOrNone: options.allOrNone || false,
        records: _records
      }),
      headers: _objectSpread(_objectSpread({}, options.headers || {}), {}, {
        'content-type': 'application/json'
      })
    });
  }
  /**
   * Upsert records
   */


  /**
   *
   * @param type
   * @param records
   * @param extIdField
   * @param options
   */
  async upsert(type, records, extIdField, options = {}) {
    const isArray = (0, _isArray.default)(records);

    const _records = (0, _isArray.default)(records) ? records : [records];

    if (_records.length > this._maxRequest) {
      throw new Error('Exceeded max limit of concurrent call');
    }

    const results = await _promise.default.all((0, _map.default)(_records).call(_records, record => {
      var _context5;

      const {
        [extIdField]: extId,
        type: rtype,
        attributes
      } = record,
            rec = (0, _objectWithoutProperties2.default)(record, (0, _map.default)(_context5 = [extIdField, "type", "attributes"]).call(_context5, _toPropertyKey));
      const url = [this._baseUrl(), 'sobjects', type, extIdField, extId].join('/');
      return this.request({
        method: 'PATCH',
        url,
        body: (0, _stringify.default)(rec),
        headers: _objectSpread(_objectSpread({}, options.headers || {}), {}, {
          'content-type': 'application/json'
        })
      }, {
        noContentResponse: {
          success: true,
          errors: []
        }
      }).catch(err => {
        // Be aware that `allOrNone` option in upsert method
        // will not revert the other successful requests.
        // It only raises error when met at least one failed request.
        if (!isArray || options.allOrNone || !err.errorCode) {
          throw err;
        }

        return toSaveResult(err);
      });
    }));
    return isArray ? results : results[0];
  }
  /**
   * Delete records
   */


  /**
   * @param type
   * @param ids
   * @param options
   */
  async destroy(type, ids, options = {}) {
    return (0, _isArray.default)(ids) ? // check the version whether SObject collection API is supported (42.0)
    this._ensureVersion(42) ? this._destroyMany(type, ids, options) : this._destroyParallel(type, ids, options) : this._destroySingle(type, ids, options);
  }
  /** @private */


  async _destroySingle(type, id, options) {
    const url = [this._baseUrl(), 'sobjects', type, id].join('/');
    return this.request({
      method: 'DELETE',
      url,
      headers: options.headers || {}
    }, {
      noContentResponse: {
        id,
        success: true,
        errors: []
      }
    });
  }
  /** @private */


  async _destroyParallel(type, ids, options) {
    if (ids.length > this._maxRequest) {
      throw new Error('Exceeded max limit of concurrent call');
    }

    return _promise.default.all((0, _map.default)(ids).call(ids, id => this._destroySingle(type, id, options).catch(err => {
      // Be aware that `allOrNone` option in parallel mode
      // will not revert the other successful requests.
      // It only raises error when met at least one failed request.
      if (options.allOrNone || !err.errorCode) {
        throw err;
      }

      return toSaveResult(err);
    })));
  }
  /** @private */


  async _destroyMany(type, ids, options) {
    if (ids.length === 0) {
      return [];
    }

    if (ids.length > MAX_DML_COUNT && options.allowRecursive) {
      return [...(await this._destroyMany(type, (0, _slice.default)(ids).call(ids, 0, MAX_DML_COUNT), options)), ...(await this._destroyMany(type, (0, _slice.default)(ids).call(ids, MAX_DML_COUNT), options))];
    }

    let url = [this._baseUrl(), 'composite', 'sobjects?ids='].join('/') + ids.join(',');

    if (options.allOrNone) {
      url += '&allOrNone=true';
    }

    return this.request({
      method: 'DELETE',
      url,
      headers: options.headers || {}
    });
  }
  /**
   * Synonym of Connection#destroy()
   */


  /**
   * Describe SObject metadata
   */
  async describe(type) {
    const url = [this._baseUrl(), 'sobjects', type, 'describe'].join('/');
    const body = await this.request(url);
    return body;
  }
  /**
   * Describe global SObjects
   */


  async describeGlobal() {
    const url = `${this._baseUrl()}/sobjects`;
    const body = await this.request(url);
    return body;
  }
  /**
   * Get SObject instance
   */


  sobject(type) {
    const so = this.sobjects[type] || new _sobject.default(this, type);
    this.sobjects[type] = so;
    return so;
  }
  /**
   * Get identity information of current user
   */


  async identity(options = {}) {
    let url = this.userInfo && this.userInfo.url;

    if (!url) {
      const res = await this.request({
        method: 'GET',
        url: this._baseUrl(),
        headers: options.headers
      });
      url = res.identity;
    }

    url += '?format=json';

    if (this.accessToken) {
      url += `&oauth_token=${encodeURIComponent(this.accessToken)}`;
    }

    const res = await this.request({
      method: 'GET',
      url
    });
    this.userInfo = {
      id: res.user_id,
      organizationId: res.organization_id,
      url: res.id
    };
    return res;
  }
  /**
   * List recently viewed records
   */


  async recent(type, limit) {
    /* eslint-disable no-param-reassign */
    if (typeof type === 'number') {
      limit = type;
      type = undefined;
    }

    let url;

    if (type) {
      url = [this._baseUrl(), 'sobjects', type].join('/');
      const {
        recentItems
      } = await this.request(url);
      return limit ? (0, _slice.default)(recentItems).call(recentItems, 0, limit) : recentItems;
    }

    url = `${this._baseUrl()}/recent`;

    if (limit) {
      url += `?limit=${limit}`;
    }

    return this.request(url);
  }
  /**
   * Retrieve updated records
   */


  async updated(type, start, end) {
    /* eslint-disable no-param-reassign */
    let url = [this._baseUrl(), 'sobjects', type, 'updated'].join('/');

    if (typeof start === 'string') {
      start = new Date(start);
    }

    start = (0, _formatter.formatDate)(start);
    url += `?start=${encodeURIComponent(start)}`;

    if (typeof end === 'string') {
      end = new Date(end);
    }

    end = (0, _formatter.formatDate)(end);
    url += `&end=${encodeURIComponent(end)}`;
    const body = await this.request(url);
    return body;
  }
  /**
   * Retrieve deleted records
   */


  async deleted(type, start, end) {
    /* eslint-disable no-param-reassign */
    let url = [this._baseUrl(), 'sobjects', type, 'deleted'].join('/');

    if (typeof start === 'string') {
      start = new Date(start);
    }

    start = (0, _formatter.formatDate)(start);
    url += `?start=${encodeURIComponent(start)}`;

    if (typeof end === 'string') {
      end = new Date(end);
    }

    end = (0, _formatter.formatDate)(end);
    url += `&end=${encodeURIComponent(end)}`;
    const body = await this.request(url);
    return body;
  }
  /**
   * Returns a list of all tabs
   */


  async tabs() {
    const url = [this._baseUrl(), 'tabs'].join('/');
    const body = await this.request(url);
    return body;
  }
  /**
   * Returns current system limit in the organization
   */


  async limits() {
    const url = [this._baseUrl(), 'limits'].join('/');
    const body = await this.request(url);
    return body;
  }
  /**
   * Returns a theme info
   */


  async theme() {
    const url = [this._baseUrl(), 'theme'].join('/');
    const body = await this.request(url);
    return body;
  }
  /**
   * Returns all registered global quick actions
   */


  async quickActions() {
    const body = await this.request('/quickActions');
    return body;
  }
  /**
   * Get reference for specified global quick action
   */


  quickAction(actionName) {
    return new _quickAction.default(this, `/quickActions/${actionName}`);
  }
  /**
   * Module which manages process rules and approval processes
   */


}

exports.Connection = Connection;
(0, _defineProperty2.default)(Connection, "_logger", (0, _logger.getLogger)('connection'));
var _default = Connection;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkZWZhdWx0Q29ubmVjdGlvbkNvbmZpZyIsImxvZ2luVXJsIiwiaW5zdGFuY2VVcmwiLCJ2ZXJzaW9uIiwibG9nTGV2ZWwiLCJtYXhSZXF1ZXN0IiwiZXNjIiwic3RyIiwiU3RyaW5nIiwicmVwbGFjZSIsInBhcnNlU2lnbmVkUmVxdWVzdCIsInNyIiwiSlNPTiIsInBhcnNlIiwibXNnIiwic3BsaXQiLCJwb3AiLCJFcnJvciIsImpzb24iLCJCdWZmZXIiLCJmcm9tIiwidG9TdHJpbmciLCJwYXJzZUlkVXJsIiwidXJsIiwib3JnYW5pemF0aW9uSWQiLCJpZCIsIm9hdXRoUmVmcmVzaEZuIiwiY29ubiIsImNhbGxiYWNrIiwicmVmcmVzaFRva2VuIiwicmVzIiwib2F1dGgyIiwidXNlckluZm8iLCJfZXN0YWJsaXNoIiwiaW5zdGFuY2VfdXJsIiwiYWNjZXNzVG9rZW4iLCJhY2Nlc3NfdG9rZW4iLCJ1bmRlZmluZWQiLCJlcnIiLCJjcmVhdGVVc2VybmFtZVBhc3N3b3JkUmVmcmVzaEZuIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsImxvZ2luIiwidG9TYXZlUmVzdWx0Iiwic3VjY2VzcyIsImVycm9ycyIsInJhaXNlTm9Nb2R1bGVFcnJvciIsIm5hbWUiLCJNQVhfRE1MX0NPVU5UIiwiQ29ubmVjdGlvbiIsIkV2ZW50RW1pdHRlciIsImFuYWx5dGljcyIsImFwZXgiLCJidWxrIiwiY2hhdHRlciIsIm1ldGFkYXRhIiwic29hcCIsInN0cmVhbWluZyIsInRvb2xpbmciLCJjb25zdHJ1Y3RvciIsImNvbmZpZyIsImNyZWF0ZSIsImRlc3Ryb3kiLCJQcm9jZXNzIiwicHJveHlVcmwiLCJodHRwUHJveHkiLCJPQXV0aDIiLCJyZWZyZXNoRm4iLCJjbGllbnRJZCIsIl9yZWZyZXNoRGVsZWdhdGUiLCJTZXNzaW9uUmVmcmVzaERlbGVnYXRlIiwiX21heFJlcXVlc3QiLCJfbG9nZ2VyIiwiY3JlYXRlSW5zdGFuY2UiLCJfbG9nTGV2ZWwiLCJfdHJhbnNwb3J0IiwiWGRQcm94eVRyYW5zcG9ydCIsIkh0dHBQcm94eVRyYW5zcG9ydCIsIlRyYW5zcG9ydCIsIl9jYWxsT3B0aW9ucyIsImNhbGxPcHRpb25zIiwiY2FjaGUiLCJDYWNoZSIsImRlc2NyaWJlQ2FjaGVLZXkiLCJ0eXBlIiwiZGVzY3JpYmUiLCJwcm90b3R5cGUiLCJjcmVhdGVDYWNoZWRGdW5jdGlvbiIsImtleSIsInN0cmF0ZWd5IiwiZGVzY3JpYmUkIiwiZGVzY3JpYmUkJCIsImRlc2NyaWJlU09iamVjdCIsImRlc2NyaWJlU09iamVjdCQiLCJkZXNjcmliZVNPYmplY3QkJCIsImRlc2NyaWJlR2xvYmFsIiwiZGVzY3JpYmVHbG9iYWwkIiwiZGVzY3JpYmVHbG9iYWwkJCIsInNlc3Npb25JZCIsInNlcnZlclVybCIsInNpZ25lZFJlcXVlc3QiLCJqc2ZvcmNlIiwiZW1pdCIsIm9wdGlvbnMiLCJqb2luIiwic2lnbmVkUmVxdWVzdE9iamVjdCIsImNsaWVudCIsIm9hdXRoVG9rZW4iLCJDYW52YXNUcmFuc3BvcnQiLCJzdXBwb3J0ZWQiLCJfc2Vzc2lvblR5cGUiLCJfcmVzZXRJbnN0YW5jZSIsIl9jbGVhclNlc3Npb24iLCJsaW1pdEluZm8iLCJzb2JqZWN0cyIsImNsZWFyIiwiZ2V0IiwicmVtb3ZlQWxsTGlzdGVuZXJzIiwib24iLCJyZXN1bHQiLCJzbyIsInNvYmplY3QiLCJhdXRob3JpemUiLCJjb2RlIiwicGFyYW1zIiwicmVxdWVzdFRva2VuIiwicmVmcmVzaF90b2tlbiIsImRlYnVnIiwiY2xpZW50U2VjcmV0IiwibG9naW5CeU9BdXRoMiIsImxvZ2luQnlTb2FwIiwiYXV0aGVudGljYXRlIiwiaW5mbyIsInJlamVjdCIsImJvZHkiLCJzb2FwTG9naW5FbmRwb2ludCIsInJlc3BvbnNlIiwiaHR0cFJlcXVlc3QiLCJtZXRob2QiLCJoZWFkZXJzIiwiU09BUEFjdGlvbiIsIm0iLCJzdGF0dXNDb2RlIiwibWF0Y2giLCJmYXVsdHN0cmluZyIsInVzZXJJZCIsImlkVXJsIiwibG9nb3V0IiwicmV2b2tlIiwibG9nb3V0QnlPQXV0aDIiLCJsb2dvdXRCeVNvYXAiLCJ0b2tlbiIsInJldm9rZVRva2VuIiwicmVxdWVzdCIsInJlcXVlc3RfIiwiX25vcm1hbGl6ZVVybCIsImh0dHBBcGkiLCJIdHRwQXBpIiwiYXBpVXNhZ2UiLCJ1c2VkIiwibGltaXQiLCJyZXF1ZXN0R2V0IiwicmVxdWVzdFBvc3QiLCJyZXF1ZXN0UHV0IiwicmVxdWVzdFBhdGNoIiwicmVxdWVzdERlbGV0ZSIsIl9iYXNlVXJsIiwicXVlcnkiLCJzb3FsIiwiUXVlcnkiLCJzZWFyY2giLCJzb3NsIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwicXVlcnlNb3JlIiwibG9jYXRvciIsIl9lbnN1cmVWZXJzaW9uIiwibWFqb3JWZXJzaW9uIiwidmVyc2lvbnMiLCJfc3VwcG9ydHMiLCJmZWF0dXJlIiwicmV0cmlldmUiLCJpZHMiLCJfcmV0cmlldmVNYW55IiwiX3JldHJpZXZlUGFyYWxsZWwiLCJfcmV0cmlldmVTaW5nbGUiLCJmaWVsZHMiLCJsZW5ndGgiLCJhbGwiLCJjYXRjaCIsImFsbE9yTm9uZSIsImVycm9yQ29kZSIsImZpZWxkIiwicmVjb3JkcyIsInJldCIsIl9jcmVhdGVNYW55IiwiX2NyZWF0ZVBhcmFsbGVsIiwiX2NyZWF0ZVNpbmdsZSIsInJlY29yZCIsIklkIiwicnR5cGUiLCJhdHRyaWJ1dGVzIiwicmVjIiwic29iamVjdFR5cGUiLCJyZXNvbHZlIiwiYWxsb3dSZWN1cnNpdmUiLCJfcmVjb3JkcyIsInVwZGF0ZSIsIl91cGRhdGVNYW55IiwiX3VwZGF0ZVBhcmFsbGVsIiwiX3VwZGF0ZVNpbmdsZSIsIm5vQ29udGVudFJlc3BvbnNlIiwidXBzZXJ0IiwiZXh0SWRGaWVsZCIsImlzQXJyYXkiLCJyZXN1bHRzIiwiZXh0SWQiLCJfZGVzdHJveU1hbnkiLCJfZGVzdHJveVBhcmFsbGVsIiwiX2Rlc3Ryb3lTaW5nbGUiLCJTT2JqZWN0IiwiaWRlbnRpdHkiLCJ1c2VyX2lkIiwib3JnYW5pemF0aW9uX2lkIiwicmVjZW50IiwicmVjZW50SXRlbXMiLCJ1cGRhdGVkIiwic3RhcnQiLCJlbmQiLCJEYXRlIiwiZm9ybWF0RGF0ZSIsImRlbGV0ZWQiLCJ0YWJzIiwibGltaXRzIiwidGhlbWUiLCJxdWlja0FjdGlvbnMiLCJxdWlja0FjdGlvbiIsImFjdGlvbk5hbWUiLCJRdWlja0FjdGlvbiIsImdldExvZ2dlciJdLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25uZWN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICpcbiAqL1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCBqc2ZvcmNlIGZyb20gJy4vanNmb3JjZSc7XG5pbXBvcnQge1xuICBIdHRwUmVxdWVzdCxcbiAgSHR0cFJlc3BvbnNlLFxuICBDYWxsYmFjayxcbiAgUmVjb3JkLFxuICBTYXZlUmVzdWx0LFxuICBVcHNlcnRSZXN1bHQsXG4gIERlc2NyaWJlR2xvYmFsUmVzdWx0LFxuICBEZXNjcmliZVNPYmplY3RSZXN1bHQsXG4gIERlc2NyaWJlVGFiLFxuICBEZXNjcmliZVRoZW1lLFxuICBEZXNjcmliZVF1aWNrQWN0aW9uUmVzdWx0LFxuICBVcGRhdGVkUmVzdWx0LFxuICBEZWxldGVkUmVzdWx0LFxuICBTZWFyY2hSZXN1bHQsXG4gIE9yZ2FuaXphdGlvbkxpbWl0c0luZm8sXG4gIE9wdGlvbmFsLFxuICBTaWduZWRSZXF1ZXN0T2JqZWN0LFxuICBTYXZlRXJyb3IsXG4gIERtbE9wdGlvbnMsXG4gIFJldHJpZXZlT3B0aW9ucyxcbiAgU2NoZW1hLFxuICBTT2JqZWN0TmFtZXMsXG4gIFNPYmplY3RJbnB1dFJlY29yZCxcbiAgU09iamVjdFVwZGF0ZVJlY29yZCxcbiAgU09iamVjdEZpZWxkTmFtZXMsXG4gIFVzZXJJbmZvLFxuICBJZGVudGl0eUluZm8sXG4gIExpbWl0SW5mbyxcbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBTdHJlYW1Qcm9taXNlIH0gZnJvbSAnLi91dGlsL3Byb21pc2UnO1xuaW1wb3J0IFRyYW5zcG9ydCwge1xuICBDYW52YXNUcmFuc3BvcnQsXG4gIFhkUHJveHlUcmFuc3BvcnQsXG4gIEh0dHBQcm94eVRyYW5zcG9ydCxcbn0gZnJvbSAnLi90cmFuc3BvcnQnO1xuaW1wb3J0IHsgTG9nZ2VyLCBnZXRMb2dnZXIgfSBmcm9tICcuL3V0aWwvbG9nZ2VyJztcbmltcG9ydCB7IExvZ0xldmVsQ29uZmlnIH0gZnJvbSAnLi91dGlsL2xvZ2dlcic7XG5pbXBvcnQgT0F1dGgyLCB7IFRva2VuUmVzcG9uc2UgfSBmcm9tICcuL29hdXRoMic7XG5pbXBvcnQgeyBPQXV0aDJDb25maWcgfSBmcm9tICcuL29hdXRoMic7XG5pbXBvcnQgQ2FjaGUsIHsgQ2FjaGVkRnVuY3Rpb24gfSBmcm9tICcuL2NhY2hlJztcbmltcG9ydCBIdHRwQXBpIGZyb20gJy4vaHR0cC1hcGknO1xuaW1wb3J0IFNlc3Npb25SZWZyZXNoRGVsZWdhdGUsIHtcbiAgU2Vzc2lvblJlZnJlc2hGdW5jLFxufSBmcm9tICcuL3Nlc3Npb24tcmVmcmVzaC1kZWxlZ2F0ZSc7XG5pbXBvcnQgUXVlcnkgZnJvbSAnLi9xdWVyeSc7XG5pbXBvcnQgeyBRdWVyeU9wdGlvbnMgfSBmcm9tICcuL3F1ZXJ5JztcbmltcG9ydCBTT2JqZWN0IGZyb20gJy4vc29iamVjdCc7XG5pbXBvcnQgUXVpY2tBY3Rpb24gZnJvbSAnLi9xdWljay1hY3Rpb24nO1xuaW1wb3J0IFByb2Nlc3MgZnJvbSAnLi9wcm9jZXNzJztcbmltcG9ydCB7IGZvcm1hdERhdGUgfSBmcm9tICcuL3V0aWwvZm9ybWF0dGVyJztcbmltcG9ydCBBbmFseXRpY3MgZnJvbSAnLi9hcGkvYW5hbHl0aWNzJztcbmltcG9ydCBBcGV4IGZyb20gJy4vYXBpL2FwZXgnO1xuaW1wb3J0IEJ1bGsgZnJvbSAnLi9hcGkvYnVsayc7XG5pbXBvcnQgQ2hhdHRlciBmcm9tICcuL2FwaS9jaGF0dGVyJztcbmltcG9ydCBNZXRhZGF0YSBmcm9tICcuL2FwaS9tZXRhZGF0YSc7XG5pbXBvcnQgU29hcEFwaSBmcm9tICcuL2FwaS9zb2FwJztcbmltcG9ydCBTdHJlYW1pbmcgZnJvbSAnLi9hcGkvc3RyZWFtaW5nJztcbmltcG9ydCBUb29saW5nIGZyb20gJy4vYXBpL3Rvb2xpbmcnO1xuXG4vKipcbiAqIHR5cGUgZGVmaW5pdGlvbnNcbiAqL1xuZXhwb3J0IHR5cGUgQ29ubmVjdGlvbkNvbmZpZzxTIGV4dGVuZHMgU2NoZW1hID0gU2NoZW1hPiA9IHtcbiAgdmVyc2lvbj86IHN0cmluZztcbiAgbG9naW5Vcmw/OiBzdHJpbmc7XG4gIGFjY2Vzc1Rva2VuPzogc3RyaW5nO1xuICByZWZyZXNoVG9rZW4/OiBzdHJpbmc7XG4gIGluc3RhbmNlVXJsPzogc3RyaW5nO1xuICBzZXNzaW9uSWQ/OiBzdHJpbmc7XG4gIHNlcnZlclVybD86IHN0cmluZztcbiAgc2lnbmVkUmVxdWVzdD86IHN0cmluZztcbiAgb2F1dGgyPzogT0F1dGgyIHwgT0F1dGgyQ29uZmlnO1xuICBtYXhSZXF1ZXN0PzogbnVtYmVyO1xuICBwcm94eVVybD86IHN0cmluZztcbiAgaHR0cFByb3h5Pzogc3RyaW5nO1xuICBsb2dMZXZlbD86IExvZ0xldmVsQ29uZmlnO1xuICBjYWxsT3B0aW9ucz86IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9O1xuICByZWZyZXNoRm4/OiBTZXNzaW9uUmVmcmVzaEZ1bmM8Uz47XG59O1xuXG5leHBvcnQgdHlwZSBDb25uZWN0aW9uRXN0YWJsaXNoT3B0aW9ucyA9IHtcbiAgYWNjZXNzVG9rZW4/OiBPcHRpb25hbDxzdHJpbmc+O1xuICByZWZyZXNoVG9rZW4/OiBPcHRpb25hbDxzdHJpbmc+O1xuICBpbnN0YW5jZVVybD86IE9wdGlvbmFsPHN0cmluZz47XG4gIHNlc3Npb25JZD86IE9wdGlvbmFsPHN0cmluZz47XG4gIHNlcnZlclVybD86IE9wdGlvbmFsPHN0cmluZz47XG4gIHNpZ25lZFJlcXVlc3Q/OiBPcHRpb25hbDxzdHJpbmcgfCBTaWduZWRSZXF1ZXN0T2JqZWN0PjtcbiAgdXNlckluZm8/OiBPcHRpb25hbDxVc2VySW5mbz47XG59O1xuXG4vKipcbiAqXG4gKi9cbmNvbnN0IGRlZmF1bHRDb25uZWN0aW9uQ29uZmlnOiB7XG4gIGxvZ2luVXJsOiBzdHJpbmc7XG4gIGluc3RhbmNlVXJsOiBzdHJpbmc7XG4gIHZlcnNpb246IHN0cmluZztcbiAgbG9nTGV2ZWw6IExvZ0xldmVsQ29uZmlnO1xuICBtYXhSZXF1ZXN0OiBudW1iZXI7XG59ID0ge1xuICBsb2dpblVybDogJ2h0dHBzOi8vbG9naW4uc2FsZXNmb3JjZS5jb20nLFxuICBpbnN0YW5jZVVybDogJycsXG4gIHZlcnNpb246ICc1MC4wJyxcbiAgbG9nTGV2ZWw6ICdOT05FJyxcbiAgbWF4UmVxdWVzdDogMTAsXG59O1xuXG4vKipcbiAqXG4gKi9cbmZ1bmN0aW9uIGVzYyhzdHI6IE9wdGlvbmFsPHN0cmluZz4pOiBzdHJpbmcge1xuICByZXR1cm4gU3RyaW5nKHN0ciB8fCAnJylcbiAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn1cblxuLyoqXG4gKlxuICovXG5mdW5jdGlvbiBwYXJzZVNpZ25lZFJlcXVlc3Qoc3I6IHN0cmluZyB8IE9iamVjdCk6IFNpZ25lZFJlcXVlc3RPYmplY3Qge1xuICBpZiAodHlwZW9mIHNyID09PSAnc3RyaW5nJykge1xuICAgIGlmIChzclswXSA9PT0gJ3snKSB7XG4gICAgICAvLyBtaWdodCBiZSBKU09OXG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShzcik7XG4gICAgfSAvLyBtaWdodCBiZSBvcmlnaW5hbCBiYXNlNjQtZW5jb2RlZCBzaWduZWQgcmVxdWVzdFxuICAgIGNvbnN0IG1zZyA9IHNyLnNwbGl0KCcuJykucG9wKCk7IC8vIHJldHJpZXZlIGxhdHRlciBwYXJ0XG4gICAgaWYgKCFtc2cpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzaWduZWQgcmVxdWVzdCcpO1xuICAgIH1cbiAgICBjb25zdCBqc29uID0gQnVmZmVyLmZyb20obXNnLCAnYmFzZTY0JykudG9TdHJpbmcoJ3V0Zi04Jyk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoanNvbik7XG4gIH1cbiAgcmV0dXJuIHNyIGFzIFNpZ25lZFJlcXVlc3RPYmplY3Q7XG59XG5cbi8qKiBAcHJpdmF0ZSAqKi9cbmZ1bmN0aW9uIHBhcnNlSWRVcmwodXJsOiBzdHJpbmcpIHtcbiAgY29uc3QgW29yZ2FuaXphdGlvbklkLCBpZF0gPSB1cmwuc3BsaXQoJy8nKS5zbGljZSgtMik7XG4gIHJldHVybiB7IGlkLCBvcmdhbml6YXRpb25JZCwgdXJsIH07XG59XG5cbi8qKlxuICogU2Vzc2lvbiBSZWZyZXNoIGRlbGVnYXRlIGZ1bmN0aW9uIGZvciBPQXV0aDIgYXV0aHogY29kZSBmbG93XG4gKiBAcHJpdmF0ZVxuICovXG5hc3luYyBmdW5jdGlvbiBvYXV0aFJlZnJlc2hGbjxTIGV4dGVuZHMgU2NoZW1hPihcbiAgY29ubjogQ29ubmVjdGlvbjxTPixcbiAgY2FsbGJhY2s6IENhbGxiYWNrPHN0cmluZywgVG9rZW5SZXNwb25zZT4sXG4pIHtcbiAgdHJ5IHtcbiAgICBpZiAoIWNvbm4ucmVmcmVzaFRva2VuKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHJlZnJlc2ggdG9rZW4gZm91bmQgaW4gdGhlIGNvbm5lY3Rpb24nKTtcbiAgICB9XG4gICAgY29uc3QgcmVzID0gYXdhaXQgY29ubi5vYXV0aDIucmVmcmVzaFRva2VuKGNvbm4ucmVmcmVzaFRva2VuKTtcbiAgICBjb25zdCB1c2VySW5mbyA9IHBhcnNlSWRVcmwocmVzLmlkKTtcbiAgICBjb25uLl9lc3RhYmxpc2goe1xuICAgICAgaW5zdGFuY2VVcmw6IHJlcy5pbnN0YW5jZV91cmwsXG4gICAgICBhY2Nlc3NUb2tlbjogcmVzLmFjY2Vzc190b2tlbixcbiAgICAgIHVzZXJJbmZvLFxuICAgIH0pO1xuICAgIGNhbGxiYWNrKHVuZGVmaW5lZCwgcmVzLmFjY2Vzc190b2tlbiwgcmVzKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICBjYWxsYmFjayhlcnIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogU2Vzc2lvbiBSZWZyZXNoIGRlbGVnYXRlIGZ1bmN0aW9uIGZvciB1c2VybmFtZS9wYXNzd29yZCBsb2dpblxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gY3JlYXRlVXNlcm5hbWVQYXNzd29yZFJlZnJlc2hGbjxTIGV4dGVuZHMgU2NoZW1hPihcbiAgdXNlcm5hbWU6IHN0cmluZyxcbiAgcGFzc3dvcmQ6IHN0cmluZyxcbikge1xuICByZXR1cm4gYXN5bmMgKFxuICAgIGNvbm46IENvbm5lY3Rpb248Uz4sXG4gICAgY2FsbGJhY2s6IENhbGxiYWNrPHN0cmluZywgVG9rZW5SZXNwb25zZT4sXG4gICkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBjb25uLmxvZ2luKHVzZXJuYW1lLCBwYXNzd29yZCk7XG4gICAgICBpZiAoIWNvbm4uYWNjZXNzVG9rZW4pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY2Nlc3MgdG9rZW4gbm90IGZvdW5kIGFmdGVyIGxvZ2luJyk7XG4gICAgICB9XG4gICAgICBjYWxsYmFjayhudWxsLCBjb25uLmFjY2Vzc1Rva2VuKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiB0b1NhdmVSZXN1bHQoZXJyOiBTYXZlRXJyb3IpOiBTYXZlUmVzdWx0IHtcbiAgcmV0dXJuIHtcbiAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICBlcnJvcnM6IFtlcnJdLFxuICB9O1xufVxuXG4vKipcbiAqXG4gKi9cbmZ1bmN0aW9uIHJhaXNlTm9Nb2R1bGVFcnJvcihuYW1lOiBzdHJpbmcpOiBuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICBgQVBJIG1vZHVsZSAnJHtuYW1lfScgaXMgbm90IGxvYWRlZCwgbG9hZCAnanNmb3JjZS9hcGkvJHtuYW1lfScgZXhwbGljaXRseWAsXG4gICk7XG59XG5cbi8qXG4gKiBDb25zdGFudCBvZiBtYXhpbXVtIHJlY29yZHMgbnVtIGluIERNTCBvcGVyYXRpb24gKHVwZGF0ZS9kZWxldGUpXG4gKi9cbmNvbnN0IE1BWF9ETUxfQ09VTlQgPSAyMDA7XG5cbi8qKlxuICpcbiAqL1xuZXhwb3J0IGNsYXNzIENvbm5lY3Rpb248UyBleHRlbmRzIFNjaGVtYSA9IFNjaGVtYT4gZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBzdGF0aWMgX2xvZ2dlciA9IGdldExvZ2dlcignY29ubmVjdGlvbicpO1xuXG4gIHZlcnNpb246IHN0cmluZztcbiAgbG9naW5Vcmw6IHN0cmluZztcbiAgaW5zdGFuY2VVcmw6IHN0cmluZztcbiAgYWNjZXNzVG9rZW46IE9wdGlvbmFsPHN0cmluZz47XG4gIHJlZnJlc2hUb2tlbjogT3B0aW9uYWw8c3RyaW5nPjtcbiAgdXNlckluZm86IE9wdGlvbmFsPFVzZXJJbmZvPjtcbiAgbGltaXRJbmZvOiBMaW1pdEluZm8gPSB7fTtcbiAgb2F1dGgyOiBPQXV0aDI7XG4gIHNvYmplY3RzOiB7IFtOIGluIFNPYmplY3ROYW1lczxTPl0/OiBTT2JqZWN0PFMsIE4+IH0gPSB7fTtcbiAgY2FjaGU6IENhY2hlO1xuICBfY2FsbE9wdGlvbnM6IE9wdGlvbmFsPHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9PjtcbiAgX21heFJlcXVlc3Q6IG51bWJlcjtcbiAgX2xvZ2dlcjogTG9nZ2VyO1xuICBfbG9nTGV2ZWw6IE9wdGlvbmFsPExvZ0xldmVsQ29uZmlnPjtcbiAgX3RyYW5zcG9ydDogVHJhbnNwb3J0O1xuICBfc2Vzc2lvblR5cGU6IE9wdGlvbmFsPCdzb2FwJyB8ICdvYXV0aDInPjtcbiAgX3JlZnJlc2hEZWxlZ2F0ZTogT3B0aW9uYWw8U2Vzc2lvblJlZnJlc2hEZWxlZ2F0ZTxTPj47XG5cbiAgLy8gZGVzY3JpYmU6IChuYW1lOiBzdHJpbmcpID0+IFByb21pc2U8RGVzY3JpYmVTT2JqZWN0UmVzdWx0PjtcbiAgZGVzY3JpYmUkOiBDYWNoZWRGdW5jdGlvbjwobmFtZTogc3RyaW5nKSA9PiBQcm9taXNlPERlc2NyaWJlU09iamVjdFJlc3VsdD4+O1xuICBkZXNjcmliZSQkOiBDYWNoZWRGdW5jdGlvbjwobmFtZTogc3RyaW5nKSA9PiBEZXNjcmliZVNPYmplY3RSZXN1bHQ+O1xuICBkZXNjcmliZVNPYmplY3Q6IChuYW1lOiBzdHJpbmcpID0+IFByb21pc2U8RGVzY3JpYmVTT2JqZWN0UmVzdWx0PjtcbiAgZGVzY3JpYmVTT2JqZWN0JDogQ2FjaGVkRnVuY3Rpb248XG4gICAgKG5hbWU6IHN0cmluZykgPT4gUHJvbWlzZTxEZXNjcmliZVNPYmplY3RSZXN1bHQ+XG4gID47XG4gIGRlc2NyaWJlU09iamVjdCQkOiBDYWNoZWRGdW5jdGlvbjwobmFtZTogc3RyaW5nKSA9PiBEZXNjcmliZVNPYmplY3RSZXN1bHQ+O1xuICAvLyBkZXNjcmliZUdsb2JhbDogKCkgPT4gUHJvbWlzZTxEZXNjcmliZUdsb2JhbFJlc3VsdD47XG4gIGRlc2NyaWJlR2xvYmFsJDogQ2FjaGVkRnVuY3Rpb248KCkgPT4gUHJvbWlzZTxEZXNjcmliZUdsb2JhbFJlc3VsdD4+O1xuICBkZXNjcmliZUdsb2JhbCQkOiBDYWNoZWRGdW5jdGlvbjwoKSA9PiBEZXNjcmliZUdsb2JhbFJlc3VsdD47XG5cbiAgLy8gQVBJIGxpYnMgYXJlIG5vdCBpbnN0YW50aWF0ZWQgaGVyZSBzbyB0aGF0IGNvcmUgbW9kdWxlIHRvIHJlbWFpbiB3aXRob3V0IGRlcGVuZGVuY2llcyB0byB0aGVtXG4gIC8vIEl0IGlzIHJlc3BvbnNpYmxlIGZvciBkZXZlbG9wZXJzIHRvIGltcG9ydCBhcGkgbGlicyBleHBsaWNpdGx5IGlmIHRoZXkgYXJlIHVzaW5nICdqc2ZvcmNlL2NvcmUnIGluc3RlYWQgb2YgJ2pzZm9yY2UnLlxuICBnZXQgYW5hbHl0aWNzKCk6IEFuYWx5dGljczxTPiB7XG4gICAgcmV0dXJuIHJhaXNlTm9Nb2R1bGVFcnJvcignYW5hbHl0aWNzJyk7XG4gIH1cblxuICBnZXQgYXBleCgpOiBBcGV4PFM+IHtcbiAgICByZXR1cm4gcmFpc2VOb01vZHVsZUVycm9yKCdhcGV4Jyk7XG4gIH1cblxuICBnZXQgYnVsaygpOiBCdWxrPFM+IHtcbiAgICByZXR1cm4gcmFpc2VOb01vZHVsZUVycm9yKCdidWxrJyk7XG4gIH1cblxuICBnZXQgY2hhdHRlcigpOiBDaGF0dGVyPFM+IHtcbiAgICByZXR1cm4gcmFpc2VOb01vZHVsZUVycm9yKCdjaGF0dGVyJyk7XG4gIH1cblxuICBnZXQgbWV0YWRhdGEoKTogTWV0YWRhdGE8Uz4ge1xuICAgIHJldHVybiByYWlzZU5vTW9kdWxlRXJyb3IoJ21ldGFkYXRhJyk7XG4gIH1cblxuICBnZXQgc29hcCgpOiBTb2FwQXBpPFM+IHtcbiAgICByZXR1cm4gcmFpc2VOb01vZHVsZUVycm9yKCdzb2FwJyk7XG4gIH1cblxuICBnZXQgc3RyZWFtaW5nKCk6IFN0cmVhbWluZzxTPiB7XG4gICAgcmV0dXJuIHJhaXNlTm9Nb2R1bGVFcnJvcignc3RyZWFtaW5nJyk7XG4gIH1cblxuICBnZXQgdG9vbGluZygpOiBUb29saW5nPFM+IHtcbiAgICByZXR1cm4gcmFpc2VOb01vZHVsZUVycm9yKCd0b29saW5nJyk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICovXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogQ29ubmVjdGlvbkNvbmZpZzxTPiA9IHt9KSB7XG4gICAgc3VwZXIoKTtcbiAgICBjb25zdCB7XG4gICAgICBsb2dpblVybCxcbiAgICAgIGluc3RhbmNlVXJsLFxuICAgICAgdmVyc2lvbixcbiAgICAgIG9hdXRoMixcbiAgICAgIG1heFJlcXVlc3QsXG4gICAgICBsb2dMZXZlbCxcbiAgICAgIHByb3h5VXJsLFxuICAgICAgaHR0cFByb3h5LFxuICAgIH0gPSBjb25maWc7XG4gICAgdGhpcy5sb2dpblVybCA9IGxvZ2luVXJsIHx8IGRlZmF1bHRDb25uZWN0aW9uQ29uZmlnLmxvZ2luVXJsO1xuICAgIHRoaXMuaW5zdGFuY2VVcmwgPSBpbnN0YW5jZVVybCB8fCBkZWZhdWx0Q29ubmVjdGlvbkNvbmZpZy5pbnN0YW5jZVVybDtcbiAgICB0aGlzLnZlcnNpb24gPSB2ZXJzaW9uIHx8IGRlZmF1bHRDb25uZWN0aW9uQ29uZmlnLnZlcnNpb247XG4gICAgdGhpcy5vYXV0aDIgPVxuICAgICAgb2F1dGgyIGluc3RhbmNlb2YgT0F1dGgyXG4gICAgICAgID8gb2F1dGgyXG4gICAgICAgIDogbmV3IE9BdXRoMih7XG4gICAgICAgICAgICBsb2dpblVybDogdGhpcy5sb2dpblVybCxcbiAgICAgICAgICAgIHByb3h5VXJsLFxuICAgICAgICAgICAgaHR0cFByb3h5LFxuICAgICAgICAgICAgLi4ub2F1dGgyLFxuICAgICAgICAgIH0pO1xuICAgIGxldCByZWZyZXNoRm4gPSBjb25maWcucmVmcmVzaEZuO1xuICAgIGlmICghcmVmcmVzaEZuICYmIHRoaXMub2F1dGgyLmNsaWVudElkKSB7XG4gICAgICByZWZyZXNoRm4gPSBvYXV0aFJlZnJlc2hGbjtcbiAgICB9XG4gICAgaWYgKHJlZnJlc2hGbikge1xuICAgICAgdGhpcy5fcmVmcmVzaERlbGVnYXRlID0gbmV3IFNlc3Npb25SZWZyZXNoRGVsZWdhdGUodGhpcywgcmVmcmVzaEZuKTtcbiAgICB9XG4gICAgdGhpcy5fbWF4UmVxdWVzdCA9IG1heFJlcXVlc3QgfHwgZGVmYXVsdENvbm5lY3Rpb25Db25maWcubWF4UmVxdWVzdDtcbiAgICB0aGlzLl9sb2dnZXIgPSBsb2dMZXZlbFxuICAgICAgPyBDb25uZWN0aW9uLl9sb2dnZXIuY3JlYXRlSW5zdGFuY2UobG9nTGV2ZWwpXG4gICAgICA6IENvbm5lY3Rpb24uX2xvZ2dlcjtcbiAgICB0aGlzLl9sb2dMZXZlbCA9IGxvZ0xldmVsO1xuICAgIHRoaXMuX3RyYW5zcG9ydCA9IHByb3h5VXJsXG4gICAgICA/IG5ldyBYZFByb3h5VHJhbnNwb3J0KHByb3h5VXJsKVxuICAgICAgOiBodHRwUHJveHlcbiAgICAgID8gbmV3IEh0dHBQcm94eVRyYW5zcG9ydChodHRwUHJveHkpXG4gICAgICA6IG5ldyBUcmFuc3BvcnQoKTtcbiAgICB0aGlzLl9jYWxsT3B0aW9ucyA9IGNvbmZpZy5jYWxsT3B0aW9ucztcbiAgICB0aGlzLmNhY2hlID0gbmV3IENhY2hlKCk7XG4gICAgY29uc3QgZGVzY3JpYmVDYWNoZUtleSA9ICh0eXBlPzogc3RyaW5nKSA9PlxuICAgICAgdHlwZSA/IGBkZXNjcmliZS4ke3R5cGV9YCA6ICdkZXNjcmliZSc7XG4gICAgY29uc3QgZGVzY3JpYmUgPSBDb25uZWN0aW9uLnByb3RvdHlwZS5kZXNjcmliZTtcbiAgICB0aGlzLmRlc2NyaWJlID0gdGhpcy5jYWNoZS5jcmVhdGVDYWNoZWRGdW5jdGlvbihkZXNjcmliZSwgdGhpcywge1xuICAgICAga2V5OiBkZXNjcmliZUNhY2hlS2V5LFxuICAgICAgc3RyYXRlZ3k6ICdOT0NBQ0hFJyxcbiAgICB9KTtcbiAgICB0aGlzLmRlc2NyaWJlJCA9IHRoaXMuY2FjaGUuY3JlYXRlQ2FjaGVkRnVuY3Rpb24oZGVzY3JpYmUsIHRoaXMsIHtcbiAgICAgIGtleTogZGVzY3JpYmVDYWNoZUtleSxcbiAgICAgIHN0cmF0ZWd5OiAnSElUJyxcbiAgICB9KTtcbiAgICB0aGlzLmRlc2NyaWJlJCQgPSB0aGlzLmNhY2hlLmNyZWF0ZUNhY2hlZEZ1bmN0aW9uKGRlc2NyaWJlLCB0aGlzLCB7XG4gICAgICBrZXk6IGRlc2NyaWJlQ2FjaGVLZXksXG4gICAgICBzdHJhdGVneTogJ0lNTUVESUFURScsXG4gICAgfSkgYXMgYW55O1xuICAgIHRoaXMuZGVzY3JpYmVTT2JqZWN0ID0gdGhpcy5kZXNjcmliZTtcbiAgICB0aGlzLmRlc2NyaWJlU09iamVjdCQgPSB0aGlzLmRlc2NyaWJlJDtcbiAgICB0aGlzLmRlc2NyaWJlU09iamVjdCQkID0gdGhpcy5kZXNjcmliZSQkO1xuICAgIGNvbnN0IGRlc2NyaWJlR2xvYmFsID0gQ29ubmVjdGlvbi5wcm90b3R5cGUuZGVzY3JpYmVHbG9iYWw7XG4gICAgdGhpcy5kZXNjcmliZUdsb2JhbCA9IHRoaXMuY2FjaGUuY3JlYXRlQ2FjaGVkRnVuY3Rpb24oXG4gICAgICBkZXNjcmliZUdsb2JhbCxcbiAgICAgIHRoaXMsXG4gICAgICB7IGtleTogJ2Rlc2NyaWJlR2xvYmFsJywgc3RyYXRlZ3k6ICdOT0NBQ0hFJyB9LFxuICAgICk7XG4gICAgdGhpcy5kZXNjcmliZUdsb2JhbCQgPSB0aGlzLmNhY2hlLmNyZWF0ZUNhY2hlZEZ1bmN0aW9uKFxuICAgICAgZGVzY3JpYmVHbG9iYWwsXG4gICAgICB0aGlzLFxuICAgICAgeyBrZXk6ICdkZXNjcmliZUdsb2JhbCcsIHN0cmF0ZWd5OiAnSElUJyB9LFxuICAgICk7XG4gICAgdGhpcy5kZXNjcmliZUdsb2JhbCQkID0gdGhpcy5jYWNoZS5jcmVhdGVDYWNoZWRGdW5jdGlvbihcbiAgICAgIGRlc2NyaWJlR2xvYmFsLFxuICAgICAgdGhpcyxcbiAgICAgIHsga2V5OiAnZGVzY3JpYmVHbG9iYWwnLCBzdHJhdGVneTogJ0lNTUVESUFURScgfSxcbiAgICApIGFzIGFueTtcbiAgICBjb25zdCB7XG4gICAgICBhY2Nlc3NUb2tlbixcbiAgICAgIHJlZnJlc2hUb2tlbixcbiAgICAgIHNlc3Npb25JZCxcbiAgICAgIHNlcnZlclVybCxcbiAgICAgIHNpZ25lZFJlcXVlc3QsXG4gICAgfSA9IGNvbmZpZztcbiAgICB0aGlzLl9lc3RhYmxpc2goe1xuICAgICAgYWNjZXNzVG9rZW4sXG4gICAgICByZWZyZXNoVG9rZW4sXG4gICAgICBpbnN0YW5jZVVybCxcbiAgICAgIHNlc3Npb25JZCxcbiAgICAgIHNlcnZlclVybCxcbiAgICAgIHNpZ25lZFJlcXVlc3QsXG4gICAgfSk7XG5cbiAgICBqc2ZvcmNlLmVtaXQoJ2Nvbm5lY3Rpb246bmV3JywgdGhpcyk7XG4gIH1cblxuICAvKiBAcHJpdmF0ZSAqL1xuICBfZXN0YWJsaXNoKG9wdGlvbnM6IENvbm5lY3Rpb25Fc3RhYmxpc2hPcHRpb25zKSB7XG4gICAgY29uc3Qge1xuICAgICAgYWNjZXNzVG9rZW4sXG4gICAgICByZWZyZXNoVG9rZW4sXG4gICAgICBpbnN0YW5jZVVybCxcbiAgICAgIHNlc3Npb25JZCxcbiAgICAgIHNlcnZlclVybCxcbiAgICAgIHNpZ25lZFJlcXVlc3QsXG4gICAgICB1c2VySW5mbyxcbiAgICB9ID0gb3B0aW9ucztcbiAgICB0aGlzLmluc3RhbmNlVXJsID0gc2VydmVyVXJsXG4gICAgICA/IHNlcnZlclVybC5zcGxpdCgnLycpLnNsaWNlKDAsIDMpLmpvaW4oJy8nKVxuICAgICAgOiBpbnN0YW5jZVVybCB8fCB0aGlzLmluc3RhbmNlVXJsO1xuICAgIHRoaXMuYWNjZXNzVG9rZW4gPSBzZXNzaW9uSWQgfHwgYWNjZXNzVG9rZW4gfHwgdGhpcy5hY2Nlc3NUb2tlbjtcbiAgICB0aGlzLnJlZnJlc2hUb2tlbiA9IHJlZnJlc2hUb2tlbiB8fCB0aGlzLnJlZnJlc2hUb2tlbjtcbiAgICBpZiAodGhpcy5yZWZyZXNoVG9rZW4gJiYgIXRoaXMuX3JlZnJlc2hEZWxlZ2F0ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnUmVmcmVzaCB0b2tlbiBpcyBzcGVjaWZpZWQgd2l0aG91dCBvYXV0aDIgY2xpZW50IGluZm9ybWF0aW9uIG9yIHJlZnJlc2ggZnVuY3Rpb24nLFxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3Qgc2lnbmVkUmVxdWVzdE9iamVjdCA9XG4gICAgICBzaWduZWRSZXF1ZXN0ICYmIHBhcnNlU2lnbmVkUmVxdWVzdChzaWduZWRSZXF1ZXN0KTtcbiAgICBpZiAoc2lnbmVkUmVxdWVzdE9iamVjdCkge1xuICAgICAgdGhpcy5hY2Nlc3NUb2tlbiA9IHNpZ25lZFJlcXVlc3RPYmplY3QuY2xpZW50Lm9hdXRoVG9rZW47XG4gICAgICBpZiAoQ2FudmFzVHJhbnNwb3J0LnN1cHBvcnRlZCkge1xuICAgICAgICB0aGlzLl90cmFuc3BvcnQgPSBuZXcgQ2FudmFzVHJhbnNwb3J0KHNpZ25lZFJlcXVlc3RPYmplY3QpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnVzZXJJbmZvID0gdXNlckluZm8gfHwgdGhpcy51c2VySW5mbztcbiAgICB0aGlzLl9zZXNzaW9uVHlwZSA9IHNlc3Npb25JZCA/ICdzb2FwJyA6ICdvYXV0aDInO1xuICAgIHRoaXMuX3Jlc2V0SW5zdGFuY2UoKTtcbiAgfVxuXG4gIC8qIEBwcml2ZWF0ZSAqL1xuICBfY2xlYXJTZXNzaW9uKCkge1xuICAgIHRoaXMuYWNjZXNzVG9rZW4gPSBudWxsO1xuICAgIHRoaXMucmVmcmVzaFRva2VuID0gbnVsbDtcbiAgICB0aGlzLmluc3RhbmNlVXJsID0gZGVmYXVsdENvbm5lY3Rpb25Db25maWcuaW5zdGFuY2VVcmw7XG4gICAgdGhpcy51c2VySW5mbyA9IG51bGw7XG4gICAgdGhpcy5fc2Vzc2lvblR5cGUgPSBudWxsO1xuICB9XG5cbiAgLyogQHByaXZlYXRlICovXG4gIF9yZXNldEluc3RhbmNlKCkge1xuICAgIHRoaXMubGltaXRJbmZvID0ge307XG4gICAgdGhpcy5zb2JqZWN0cyA9IHt9O1xuICAgIC8vIFRPRE8gaW1wbCBjYWNoZVxuICAgIHRoaXMuY2FjaGUuY2xlYXIoKTtcbiAgICB0aGlzLmNhY2hlLmdldCgnZGVzY3JpYmVHbG9iYWwnKS5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3ZhbHVlJyk7XG4gICAgdGhpcy5jYWNoZS5nZXQoJ2Rlc2NyaWJlR2xvYmFsJykub24oJ3ZhbHVlJywgKHsgcmVzdWx0IH0pID0+IHtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgZm9yIChjb25zdCBzbyBvZiByZXN1bHQuc29iamVjdHMpIHtcbiAgICAgICAgICB0aGlzLnNvYmplY3Qoc28ubmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICAvKlxuICAgIGlmICh0aGlzLnRvb2xpbmcpIHtcbiAgICAgIHRoaXMudG9vbGluZy5fcmVzZXRJbnN0YW5jZSgpO1xuICAgIH1cbiAgICAqL1xuICB9XG5cbiAgLyoqXG4gICAqIEF1dGhvcml6ZSAodXNpbmcgb2F1dGgyIHdlYiBzZXJ2ZXIgZmxvdylcbiAgICovXG4gIGFzeW5jIGF1dGhvcml6ZShcbiAgICBjb2RlOiBzdHJpbmcsXG4gICAgcGFyYW1zOiB7IFtuYW1lOiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9LFxuICApOiBQcm9taXNlPFVzZXJJbmZvPiB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgdGhpcy5vYXV0aDIucmVxdWVzdFRva2VuKGNvZGUsIHBhcmFtcyk7XG4gICAgY29uc3QgdXNlckluZm8gPSBwYXJzZUlkVXJsKHJlcy5pZCk7XG4gICAgdGhpcy5fZXN0YWJsaXNoKHtcbiAgICAgIGluc3RhbmNlVXJsOiByZXMuaW5zdGFuY2VfdXJsLFxuICAgICAgYWNjZXNzVG9rZW46IHJlcy5hY2Nlc3NfdG9rZW4sXG4gICAgICByZWZyZXNoVG9rZW46IHJlcy5yZWZyZXNoX3Rva2VuLFxuICAgICAgdXNlckluZm8sXG4gICAgfSk7XG4gICAgdGhpcy5fbG9nZ2VyLmRlYnVnKFxuICAgICAgYDxsb2dpbj4gY29tcGxldGVkLiB1c2VyIGlkID0gJHt1c2VySW5mby5pZH0sIG9yZyBpZCA9ICR7dXNlckluZm8ub3JnYW5pemF0aW9uSWR9YCxcbiAgICApO1xuICAgIHJldHVybiB1c2VySW5mbztcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgYXN5bmMgbG9naW4odXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8VXNlckluZm8+IHtcbiAgICB0aGlzLl9yZWZyZXNoRGVsZWdhdGUgPSBuZXcgU2Vzc2lvblJlZnJlc2hEZWxlZ2F0ZShcbiAgICAgIHRoaXMsXG4gICAgICBjcmVhdGVVc2VybmFtZVBhc3N3b3JkUmVmcmVzaEZuKHVzZXJuYW1lLCBwYXNzd29yZCksXG4gICAgKTtcbiAgICBpZiAodGhpcy5vYXV0aDIgJiYgdGhpcy5vYXV0aDIuY2xpZW50SWQgJiYgdGhpcy5vYXV0aDIuY2xpZW50U2VjcmV0KSB7XG4gICAgICByZXR1cm4gdGhpcy5sb2dpbkJ5T0F1dGgyKHVzZXJuYW1lLCBwYXNzd29yZCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmxvZ2luQnlTb2FwKHVzZXJuYW1lLCBwYXNzd29yZCk7XG4gIH1cblxuICAvKipcbiAgICogTG9naW4gYnkgT0F1dGgyIHVzZXJuYW1lICYgcGFzc3dvcmQgZmxvd1xuICAgKi9cbiAgYXN5bmMgbG9naW5CeU9BdXRoMih1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKTogUHJvbWlzZTxVc2VySW5mbz4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMub2F1dGgyLmF1dGhlbnRpY2F0ZSh1c2VybmFtZSwgcGFzc3dvcmQpO1xuICAgIGNvbnN0IHVzZXJJbmZvID0gcGFyc2VJZFVybChyZXMuaWQpO1xuICAgIHRoaXMuX2VzdGFibGlzaCh7XG4gICAgICBpbnN0YW5jZVVybDogcmVzLmluc3RhbmNlX3VybCxcbiAgICAgIGFjY2Vzc1Rva2VuOiByZXMuYWNjZXNzX3Rva2VuLFxuICAgICAgdXNlckluZm8sXG4gICAgfSk7XG4gICAgdGhpcy5fbG9nZ2VyLmluZm8oXG4gICAgICBgPGxvZ2luPiBjb21wbGV0ZWQuIHVzZXIgaWQgPSAke3VzZXJJbmZvLmlkfSwgb3JnIGlkID0gJHt1c2VySW5mby5vcmdhbml6YXRpb25JZH1gLFxuICAgICk7XG4gICAgcmV0dXJuIHVzZXJJbmZvO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBhc3luYyBsb2dpbkJ5U29hcCh1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKTogUHJvbWlzZTxVc2VySW5mbz4ge1xuICAgIGlmICghdXNlcm5hbWUgfHwgIXBhc3N3b3JkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdubyB1c2VybmFtZSBwYXNzd29yZCBnaXZlbicpKTtcbiAgICB9XG4gICAgY29uc3QgYm9keSA9IFtcbiAgICAgICc8c2U6RW52ZWxvcGUgeG1sbnM6c2U9XCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy9zb2FwL2VudmVsb3BlL1wiPicsXG4gICAgICAnPHNlOkhlYWRlci8+JyxcbiAgICAgICc8c2U6Qm9keT4nLFxuICAgICAgJzxsb2dpbiB4bWxucz1cInVybjpwYXJ0bmVyLnNvYXAuc2ZvcmNlLmNvbVwiPicsXG4gICAgICBgPHVzZXJuYW1lPiR7ZXNjKHVzZXJuYW1lKX08L3VzZXJuYW1lPmAsXG4gICAgICBgPHBhc3N3b3JkPiR7ZXNjKHBhc3N3b3JkKX08L3Bhc3N3b3JkPmAsXG4gICAgICAnPC9sb2dpbj4nLFxuICAgICAgJzwvc2U6Qm9keT4nLFxuICAgICAgJzwvc2U6RW52ZWxvcGU+JyxcbiAgICBdLmpvaW4oJycpO1xuXG4gICAgY29uc3Qgc29hcExvZ2luRW5kcG9pbnQgPSBbXG4gICAgICB0aGlzLmxvZ2luVXJsLFxuICAgICAgJ3NlcnZpY2VzL1NvYXAvdScsXG4gICAgICB0aGlzLnZlcnNpb24sXG4gICAgXS5qb2luKCcvJyk7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl90cmFuc3BvcnQuaHR0cFJlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICB1cmw6IHNvYXBMb2dpbkVuZHBvaW50LFxuICAgICAgYm9keSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L3htbCcsXG4gICAgICAgIFNPQVBBY3Rpb246ICdcIlwiJyxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgbGV0IG07XG4gICAgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgPj0gNDAwKSB7XG4gICAgICBtID0gcmVzcG9uc2UuYm9keS5tYXRjaCgvPGZhdWx0c3RyaW5nPihbXjxdKyk8XFwvZmF1bHRzdHJpbmc+Lyk7XG4gICAgICBjb25zdCBmYXVsdHN0cmluZyA9IG0gJiYgbVsxXTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihmYXVsdHN0cmluZyB8fCByZXNwb25zZS5ib2R5KTtcbiAgICB9XG4gICAgdGhpcy5fbG9nZ2VyLmRlYnVnKGBTT0FQIHJlc3BvbnNlID0gJHtyZXNwb25zZS5ib2R5fWApO1xuICAgIG0gPSByZXNwb25zZS5ib2R5Lm1hdGNoKC88c2VydmVyVXJsPihbXjxdKyk8XFwvc2VydmVyVXJsPi8pO1xuICAgIGNvbnN0IHNlcnZlclVybCA9IG0gJiYgbVsxXTtcbiAgICBtID0gcmVzcG9uc2UuYm9keS5tYXRjaCgvPHNlc3Npb25JZD4oW148XSspPFxcL3Nlc3Npb25JZD4vKTtcbiAgICBjb25zdCBzZXNzaW9uSWQgPSBtICYmIG1bMV07XG4gICAgbSA9IHJlc3BvbnNlLmJvZHkubWF0Y2goLzx1c2VySWQ+KFtePF0rKTxcXC91c2VySWQ+Lyk7XG4gICAgY29uc3QgdXNlcklkID0gbSAmJiBtWzFdO1xuICAgIG0gPSByZXNwb25zZS5ib2R5Lm1hdGNoKC88b3JnYW5pemF0aW9uSWQ+KFtePF0rKTxcXC9vcmdhbml6YXRpb25JZD4vKTtcbiAgICBjb25zdCBvcmdhbml6YXRpb25JZCA9IG0gJiYgbVsxXTtcbiAgICBpZiAoIXNlcnZlclVybCB8fCAhc2Vzc2lvbklkIHx8ICF1c2VySWQgfHwgIW9yZ2FuaXphdGlvbklkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdjb3VsZCBub3QgZXh0cmFjdCBzZXNzaW9uIGluZm9ybWF0aW9uIGZyb20gbG9naW4gcmVzcG9uc2UnLFxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3QgaWRVcmwgPSBbdGhpcy5sb2dpblVybCwgJ2lkJywgb3JnYW5pemF0aW9uSWQsIHVzZXJJZF0uam9pbignLycpO1xuICAgIGNvbnN0IHVzZXJJbmZvID0geyBpZDogdXNlcklkLCBvcmdhbml6YXRpb25JZCwgdXJsOiBpZFVybCB9O1xuICAgIHRoaXMuX2VzdGFibGlzaCh7XG4gICAgICBzZXJ2ZXJVcmw6IHNlcnZlclVybC5zcGxpdCgnLycpLnNsaWNlKDAsIDMpLmpvaW4oJy8nKSxcbiAgICAgIHNlc3Npb25JZCxcbiAgICAgIHVzZXJJbmZvLFxuICAgIH0pO1xuICAgIHRoaXMuX2xvZ2dlci5pbmZvKFxuICAgICAgYDxsb2dpbj4gY29tcGxldGVkLiB1c2VyIGlkID0gJHt1c2VySWR9LCBvcmcgaWQgPSAke29yZ2FuaXphdGlvbklkfWAsXG4gICAgKTtcbiAgICByZXR1cm4gdXNlckluZm87XG4gIH1cblxuICAvKipcbiAgICogTG9nb3V0IHRoZSBjdXJyZW50IHNlc3Npb25cbiAgICovXG4gIGFzeW5jIGxvZ291dChyZXZva2U/OiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fcmVmcmVzaERlbGVnYXRlID0gdW5kZWZpbmVkO1xuICAgIGlmICh0aGlzLl9zZXNzaW9uVHlwZSA9PT0gJ29hdXRoMicpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvZ291dEJ5T0F1dGgyKHJldm9rZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmxvZ291dEJ5U29hcChyZXZva2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZ291dCB0aGUgY3VycmVudCBzZXNzaW9uIGJ5IHJldm9raW5nIGFjY2VzcyB0b2tlbiB2aWEgT0F1dGgyIHNlc3Npb24gcmV2b2tlXG4gICAqL1xuICBhc3luYyBsb2dvdXRCeU9BdXRoMihyZXZva2U/OiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgdG9rZW4gPSByZXZva2UgPyB0aGlzLnJlZnJlc2hUb2tlbiA6IHRoaXMuYWNjZXNzVG9rZW47XG4gICAgaWYgKHRva2VuKSB7XG4gICAgICBhd2FpdCB0aGlzLm9hdXRoMi5yZXZva2VUb2tlbih0b2tlbik7XG4gICAgfVxuICAgIC8vIERlc3Ryb3kgdGhlIHNlc3Npb24gYm91bmQgdG8gdGhpcyBjb25uZWN0aW9uXG4gICAgdGhpcy5fY2xlYXJTZXNzaW9uKCk7XG4gICAgdGhpcy5fcmVzZXRJbnN0YW5jZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZ291dCB0aGUgc2Vzc2lvbiBieSB1c2luZyBTT0FQIHdlYiBzZXJ2aWNlIEFQSVxuICAgKi9cbiAgYXN5bmMgbG9nb3V0QnlTb2FwKHJldm9rZT86IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBib2R5ID0gW1xuICAgICAgJzxzZTpFbnZlbG9wZSB4bWxuczpzZT1cImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3NvYXAvZW52ZWxvcGUvXCI+JyxcbiAgICAgICc8c2U6SGVhZGVyPicsXG4gICAgICAnPFNlc3Npb25IZWFkZXIgeG1sbnM9XCJ1cm46cGFydG5lci5zb2FwLnNmb3JjZS5jb21cIj4nLFxuICAgICAgYDxzZXNzaW9uSWQ+JHtlc2MoXG4gICAgICAgIHJldm9rZSA/IHRoaXMucmVmcmVzaFRva2VuIDogdGhpcy5hY2Nlc3NUb2tlbixcbiAgICAgICl9PC9zZXNzaW9uSWQ+YCxcbiAgICAgICc8L1Nlc3Npb25IZWFkZXI+JyxcbiAgICAgICc8L3NlOkhlYWRlcj4nLFxuICAgICAgJzxzZTpCb2R5PicsXG4gICAgICAnPGxvZ291dCB4bWxucz1cInVybjpwYXJ0bmVyLnNvYXAuc2ZvcmNlLmNvbVwiLz4nLFxuICAgICAgJzwvc2U6Qm9keT4nLFxuICAgICAgJzwvc2U6RW52ZWxvcGU+JyxcbiAgICBdLmpvaW4oJycpO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5fdHJhbnNwb3J0Lmh0dHBSZXF1ZXN0KHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgdXJsOiBbdGhpcy5pbnN0YW5jZVVybCwgJ3NlcnZpY2VzL1NvYXAvdScsIHRoaXMudmVyc2lvbl0uam9pbignLycpLFxuICAgICAgYm9keSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L3htbCcsXG4gICAgICAgIFNPQVBBY3Rpb246ICdcIlwiJyxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgdGhpcy5fbG9nZ2VyLmRlYnVnKFxuICAgICAgYFNPQVAgc3RhdHVzQ29kZSA9ICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX0sIHJlc3BvbnNlID0gJHtyZXNwb25zZS5ib2R5fWAsXG4gICAgKTtcbiAgICBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSA+PSA0MDApIHtcbiAgICAgIGNvbnN0IG0gPSByZXNwb25zZS5ib2R5Lm1hdGNoKC88ZmF1bHRzdHJpbmc+KFtePF0rKTxcXC9mYXVsdHN0cmluZz4vKTtcbiAgICAgIGNvbnN0IGZhdWx0c3RyaW5nID0gbSAmJiBtWzFdO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGZhdWx0c3RyaW5nIHx8IHJlc3BvbnNlLmJvZHkpO1xuICAgIH1cbiAgICAvLyBEZXN0cm95IHRoZSBzZXNzaW9uIGJvdW5kIHRvIHRoaXMgY29ubmVjdGlvblxuICAgIHRoaXMuX2NsZWFyU2Vzc2lvbigpO1xuICAgIHRoaXMuX3Jlc2V0SW5zdGFuY2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIFJFU1QgQVBJIHJlcXVlc3Qgd2l0aCBnaXZlbiBIVFRQIHJlcXVlc3QgaW5mbywgd2l0aCBjb25uZWN0ZWQgc2Vzc2lvbiBpbmZvcm1hdGlvbi5cbiAgICpcbiAgICogRW5kcG9pbnQgVVJMIGNhbiBiZSBhYnNvbHV0ZSBVUkwgKCdodHRwczovL25hMS5zYWxlc2ZvcmNlLmNvbS9zZXJ2aWNlcy9kYXRhL3YzMi4wL3NvYmplY3RzL0FjY291bnQvZGVzY3JpYmUnKVxuICAgKiAsIHJlbGF0aXZlIHBhdGggZnJvbSByb290ICgnL3NlcnZpY2VzL2RhdGEvdjMyLjAvc29iamVjdHMvQWNjb3VudC9kZXNjcmliZScpXG4gICAqICwgb3IgcmVsYXRpdmUgcGF0aCBmcm9tIHZlcnNpb24gcm9vdCAoJy9zb2JqZWN0cy9BY2NvdW50L2Rlc2NyaWJlJykuXG4gICAqL1xuICByZXF1ZXN0PFIgPSB1bmtub3duPihcbiAgICByZXF1ZXN0OiBzdHJpbmcgfCBIdHRwUmVxdWVzdCxcbiAgICBvcHRpb25zOiBPYmplY3QgPSB7fSxcbiAgKTogU3RyZWFtUHJvbWlzZTxSPiB7XG4gICAgLy8gaWYgcmVxdWVzdCBpcyBzaW1wbGUgc3RyaW5nLCByZWdhcmQgaXQgYXMgdXJsIGluIEdFVCBtZXRob2RcbiAgICBsZXQgcmVxdWVzdF86IEh0dHBSZXF1ZXN0ID1cbiAgICAgIHR5cGVvZiByZXF1ZXN0ID09PSAnc3RyaW5nJyA/IHsgbWV0aG9kOiAnR0VUJywgdXJsOiByZXF1ZXN0IH0gOiByZXF1ZXN0O1xuICAgIC8vIGlmIHVybCBpcyBnaXZlbiBpbiByZWxhdGl2ZSBwYXRoLCBwcmVwZW5kIGJhc2UgdXJsIG9yIGluc3RhbmNlIHVybCBiZWZvcmUuXG4gICAgcmVxdWVzdF8gPSB7XG4gICAgICAuLi5yZXF1ZXN0XyxcbiAgICAgIHVybDogdGhpcy5fbm9ybWFsaXplVXJsKHJlcXVlc3RfLnVybCksXG4gICAgfTtcbiAgICBjb25zdCBodHRwQXBpID0gbmV3IEh0dHBBcGkodGhpcywgb3B0aW9ucyk7XG4gICAgLy8gbG9nIGFwaSB1c2FnZSBhbmQgaXRzIHF1b3RhXG4gICAgaHR0cEFwaS5vbigncmVzcG9uc2UnLCAocmVzcG9uc2U6IEh0dHBSZXNwb25zZSkgPT4ge1xuICAgICAgaWYgKHJlc3BvbnNlLmhlYWRlcnMgJiYgcmVzcG9uc2UuaGVhZGVyc1snc2ZvcmNlLWxpbWl0LWluZm8nXSkge1xuICAgICAgICBjb25zdCBhcGlVc2FnZSA9IHJlc3BvbnNlLmhlYWRlcnNbJ3Nmb3JjZS1saW1pdC1pbmZvJ10ubWF0Y2goXG4gICAgICAgICAgL2FwaS11c2FnZT0oXFxkKylcXC8oXFxkKykvLFxuICAgICAgICApO1xuICAgICAgICBpZiAoYXBpVXNhZ2UpIHtcbiAgICAgICAgICB0aGlzLmxpbWl0SW5mbyA9IHtcbiAgICAgICAgICAgIGFwaVVzYWdlOiB7XG4gICAgICAgICAgICAgIHVzZWQ6IHBhcnNlSW50KGFwaVVzYWdlWzFdLCAxMCksXG4gICAgICAgICAgICAgIGxpbWl0OiBwYXJzZUludChhcGlVc2FnZVsyXSwgMTApLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGh0dHBBcGkucmVxdWVzdDxSPihyZXF1ZXN0Xyk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBIVFRQIEdFVCByZXF1ZXN0XG4gICAqXG4gICAqIEVuZHBvaW50IFVSTCBjYW4gYmUgYWJzb2x1dGUgVVJMICgnaHR0cHM6Ly9uYTEuc2FsZXNmb3JjZS5jb20vc2VydmljZXMvZGF0YS92MzIuMC9zb2JqZWN0cy9BY2NvdW50L2Rlc2NyaWJlJylcbiAgICogLCByZWxhdGl2ZSBwYXRoIGZyb20gcm9vdCAoJy9zZXJ2aWNlcy9kYXRhL3YzMi4wL3NvYmplY3RzL0FjY291bnQvZGVzY3JpYmUnKVxuICAgKiAsIG9yIHJlbGF0aXZlIHBhdGggZnJvbSB2ZXJzaW9uIHJvb3QgKCcvc29iamVjdHMvQWNjb3VudC9kZXNjcmliZScpLlxuICAgKi9cbiAgcmVxdWVzdEdldDxSID0gdW5rbm93bj4odXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBPYmplY3QpIHtcbiAgICBjb25zdCByZXF1ZXN0OiBIdHRwUmVxdWVzdCA9IHsgbWV0aG9kOiAnR0VUJywgdXJsIH07XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxSPihyZXF1ZXN0LCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIEhUVFAgUE9TVCByZXF1ZXN0IHdpdGggSlNPTiBib2R5LCB3aXRoIGNvbm5lY3RlZCBzZXNzaW9uIGluZm9ybWF0aW9uXG4gICAqXG4gICAqIEVuZHBvaW50IFVSTCBjYW4gYmUgYWJzb2x1dGUgVVJMICgnaHR0cHM6Ly9uYTEuc2FsZXNmb3JjZS5jb20vc2VydmljZXMvZGF0YS92MzIuMC9zb2JqZWN0cy9BY2NvdW50L2Rlc2NyaWJlJylcbiAgICogLCByZWxhdGl2ZSBwYXRoIGZyb20gcm9vdCAoJy9zZXJ2aWNlcy9kYXRhL3YzMi4wL3NvYmplY3RzL0FjY291bnQvZGVzY3JpYmUnKVxuICAgKiAsIG9yIHJlbGF0aXZlIHBhdGggZnJvbSB2ZXJzaW9uIHJvb3QgKCcvc29iamVjdHMvQWNjb3VudC9kZXNjcmliZScpLlxuICAgKi9cbiAgcmVxdWVzdFBvc3Q8UiA9IHVua25vd24+KHVybDogc3RyaW5nLCBib2R5OiBPYmplY3QsIG9wdGlvbnM/OiBPYmplY3QpIHtcbiAgICBjb25zdCByZXF1ZXN0OiBIdHRwUmVxdWVzdCA9IHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgdXJsLFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG4gICAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8Uj4ocmVxdWVzdCwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBIVFRQIFBVVCByZXF1ZXN0IHdpdGggSlNPTiBib2R5LCB3aXRoIGNvbm5lY3RlZCBzZXNzaW9uIGluZm9ybWF0aW9uXG4gICAqXG4gICAqIEVuZHBvaW50IFVSTCBjYW4gYmUgYWJzb2x1dGUgVVJMICgnaHR0cHM6Ly9uYTEuc2FsZXNmb3JjZS5jb20vc2VydmljZXMvZGF0YS92MzIuMC9zb2JqZWN0cy9BY2NvdW50L2Rlc2NyaWJlJylcbiAgICogLCByZWxhdGl2ZSBwYXRoIGZyb20gcm9vdCAoJy9zZXJ2aWNlcy9kYXRhL3YzMi4wL3NvYmplY3RzL0FjY291bnQvZGVzY3JpYmUnKVxuICAgKiAsIG9yIHJlbGF0aXZlIHBhdGggZnJvbSB2ZXJzaW9uIHJvb3QgKCcvc29iamVjdHMvQWNjb3VudC9kZXNjcmliZScpLlxuICAgKi9cbiAgcmVxdWVzdFB1dDxSPih1cmw6IHN0cmluZywgYm9keTogT2JqZWN0LCBvcHRpb25zPzogT2JqZWN0KSB7XG4gICAgY29uc3QgcmVxdWVzdDogSHR0cFJlcXVlc3QgPSB7XG4gICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgdXJsLFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG4gICAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8Uj4ocmVxdWVzdCwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBIVFRQIFBBVENIIHJlcXVlc3Qgd2l0aCBKU09OIGJvZHlcbiAgICpcbiAgICogRW5kcG9pbnQgVVJMIGNhbiBiZSBhYnNvbHV0ZSBVUkwgKCdodHRwczovL25hMS5zYWxlc2ZvcmNlLmNvbS9zZXJ2aWNlcy9kYXRhL3YzMi4wL3NvYmplY3RzL0FjY291bnQvZGVzY3JpYmUnKVxuICAgKiAsIHJlbGF0aXZlIHBhdGggZnJvbSByb290ICgnL3NlcnZpY2VzL2RhdGEvdjMyLjAvc29iamVjdHMvQWNjb3VudC9kZXNjcmliZScpXG4gICAqICwgb3IgcmVsYXRpdmUgcGF0aCBmcm9tIHZlcnNpb24gcm9vdCAoJy9zb2JqZWN0cy9BY2NvdW50L2Rlc2NyaWJlJykuXG4gICAqL1xuICByZXF1ZXN0UGF0Y2g8UiA9IHVua25vd24+KHVybDogc3RyaW5nLCBib2R5OiBPYmplY3QsIG9wdGlvbnM/OiBPYmplY3QpIHtcbiAgICBjb25zdCByZXF1ZXN0OiBIdHRwUmVxdWVzdCA9IHtcbiAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgIHVybCxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PFI+KHJlcXVlc3QsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgSFRUUCBERUxFVEUgcmVxdWVzdFxuICAgKlxuICAgKiBFbmRwb2ludCBVUkwgY2FuIGJlIGFic29sdXRlIFVSTCAoJ2h0dHBzOi8vbmExLnNhbGVzZm9yY2UuY29tL3NlcnZpY2VzL2RhdGEvdjMyLjAvc29iamVjdHMvQWNjb3VudC9kZXNjcmliZScpXG4gICAqICwgcmVsYXRpdmUgcGF0aCBmcm9tIHJvb3QgKCcvc2VydmljZXMvZGF0YS92MzIuMC9zb2JqZWN0cy9BY2NvdW50L2Rlc2NyaWJlJylcbiAgICogLCBvciByZWxhdGl2ZSBwYXRoIGZyb20gdmVyc2lvbiByb290ICgnL3NvYmplY3RzL0FjY291bnQvZGVzY3JpYmUnKS5cbiAgICovXG4gIHJlcXVlc3REZWxldGU8Uj4odXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBPYmplY3QpIHtcbiAgICBjb25zdCByZXF1ZXN0OiBIdHRwUmVxdWVzdCA9IHsgbWV0aG9kOiAnREVMRVRFJywgdXJsIH07XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxSPihyZXF1ZXN0LCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqKi9cbiAgX2Jhc2VVcmwoKSB7XG4gICAgcmV0dXJuIFt0aGlzLmluc3RhbmNlVXJsLCAnc2VydmljZXMvZGF0YScsIGB2JHt0aGlzLnZlcnNpb259YF0uam9pbignLycpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgcGF0aCB0byBhYnNvbHV0ZSB1cmxcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ub3JtYWxpemVVcmwodXJsOiBzdHJpbmcpIHtcbiAgICBpZiAodXJsWzBdID09PSAnLycpIHtcbiAgICAgIGlmICh1cmwuaW5kZXhPZih0aGlzLmluc3RhbmNlVXJsICsgJy9zZXJ2aWNlcy8nKSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgfVxuICAgICAgaWYgKHVybC5pbmRleE9mKCcvc2VydmljZXMvJykgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2VVcmwgKyB1cmw7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fYmFzZVVybCgpICsgdXJsO1xuICAgIH1cbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBxdWVyeTxUIGV4dGVuZHMgUmVjb3JkPihcbiAgICBzb3FsOiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IFBhcnRpYWw8UXVlcnlPcHRpb25zPixcbiAgKTogUXVlcnk8UywgU09iamVjdE5hbWVzPFM+LCBULCAnUXVlcnlSZXN1bHQnPiB7XG4gICAgcmV0dXJuIG5ldyBRdWVyeTxTLCBTT2JqZWN0TmFtZXM8Uz4sIFQsICdRdWVyeVJlc3VsdCc+KHRoaXMsIHNvcWwsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGUgc2VhcmNoIGJ5IFNPU0xcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNvc2wgLSBTT1NMIHN0cmluZ1xuICAgKiBAcGFyYW0ge0NhbGxiYWNrLjxBcnJheS48UmVjb3JkUmVzdWx0Pj59IFtjYWxsYmFja10gLSBDYWxsYmFjayBmdW5jdGlvblxuICAgKiBAcmV0dXJucyB7UHJvbWlzZS48QXJyYXkuPFJlY29yZFJlc3VsdD4+fVxuICAgKi9cbiAgc2VhcmNoKHNvc2w6IHN0cmluZykge1xuICAgIHZhciB1cmwgPSB0aGlzLl9iYXNlVXJsKCkgKyAnL3NlYXJjaD9xPScgKyBlbmNvZGVVUklDb21wb25lbnQoc29zbCk7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxTZWFyY2hSZXN1bHQ+KHVybCk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICovXG4gIHF1ZXJ5TW9yZShsb2NhdG9yOiBzdHJpbmcsIG9wdGlvbnM/OiBRdWVyeU9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IFF1ZXJ5PFMsIFNPYmplY3ROYW1lczxTPiwgUmVjb3JkLCAnUXVlcnlSZXN1bHQnPihcbiAgICAgIHRoaXMsXG4gICAgICB7IGxvY2F0b3IgfSxcbiAgICAgIG9wdGlvbnMsXG4gICAgKTtcbiAgfVxuXG4gIC8qICovXG4gIF9lbnN1cmVWZXJzaW9uKG1ham9yVmVyc2lvbjogbnVtYmVyKSB7XG4gICAgY29uc3QgdmVyc2lvbnMgPSB0aGlzLnZlcnNpb24uc3BsaXQoJy4nKTtcbiAgICByZXR1cm4gcGFyc2VJbnQodmVyc2lvbnNbMF0sIDEwKSA+PSBtYWpvclZlcnNpb247XG4gIH1cblxuICAvKiAqL1xuICBfc3VwcG9ydHMoZmVhdHVyZTogc3RyaW5nKSB7XG4gICAgc3dpdGNoIChmZWF0dXJlKSB7XG4gICAgICBjYXNlICdzb2JqZWN0LWNvbGxlY3Rpb24nOiAvLyBzb2JqZWN0IGNvbGxlY3Rpb24gaXMgYXZhaWxhYmxlIG9ubHkgaW4gQVBJIHZlciA0Mi4wK1xuICAgICAgICByZXR1cm4gdGhpcy5fZW5zdXJlVmVyc2lvbig0Mik7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHNwZWNpZmllZCByZWNvcmRzXG4gICAqL1xuICByZXRyaWV2ZTxOIGV4dGVuZHMgU09iamVjdE5hbWVzPFM+PihcbiAgICB0eXBlOiBOLFxuICAgIGlkczogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiBSZXRyaWV2ZU9wdGlvbnMsXG4gICk6IFByb21pc2U8UmVjb3JkPjtcbiAgcmV0cmlldmU8TiBleHRlbmRzIFNPYmplY3ROYW1lczxTPj4oXG4gICAgdHlwZTogTixcbiAgICBpZHM6IHN0cmluZ1tdLFxuICAgIG9wdGlvbnM/OiBSZXRyaWV2ZU9wdGlvbnMsXG4gICk6IFByb21pc2U8UmVjb3JkW10+O1xuICByZXRyaWV2ZTxOIGV4dGVuZHMgU09iamVjdE5hbWVzPFM+PihcbiAgICB0eXBlOiBOLFxuICAgIGlkczogc3RyaW5nIHwgc3RyaW5nW10sXG4gICAgb3B0aW9ucz86IFJldHJpZXZlT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxSZWNvcmQgfCBSZWNvcmRbXT47XG4gIGFzeW5jIHJldHJpZXZlKFxuICAgIHR5cGU6IHN0cmluZyxcbiAgICBpZHM6IHN0cmluZyB8IHN0cmluZ1tdLFxuICAgIG9wdGlvbnM6IFJldHJpZXZlT3B0aW9ucyA9IHt9LFxuICApIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheShpZHMpXG4gICAgICA/IC8vIGNoZWNrIHRoZSB2ZXJzaW9uIHdoZXRoZXIgU09iamVjdCBjb2xsZWN0aW9uIEFQSSBpcyBzdXBwb3J0ZWQgKDQyLjApXG4gICAgICAgIHRoaXMuX2Vuc3VyZVZlcnNpb24oNDIpXG4gICAgICAgID8gdGhpcy5fcmV0cmlldmVNYW55KHR5cGUsIGlkcywgb3B0aW9ucylcbiAgICAgICAgOiB0aGlzLl9yZXRyaWV2ZVBhcmFsbGVsKHR5cGUsIGlkcywgb3B0aW9ucylcbiAgICAgIDogdGhpcy5fcmV0cmlldmVTaW5nbGUodHlwZSwgaWRzLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBhc3luYyBfcmV0cmlldmVTaW5nbGUodHlwZTogc3RyaW5nLCBpZDogc3RyaW5nLCBvcHRpb25zOiBSZXRyaWV2ZU9wdGlvbnMpIHtcbiAgICBpZiAoIWlkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcmVjb3JkIElELiBTcGVjaWZ5IHZhbGlkIHJlY29yZCBJRCB2YWx1ZScpO1xuICAgIH1cbiAgICBsZXQgdXJsID0gW3RoaXMuX2Jhc2VVcmwoKSwgJ3NvYmplY3RzJywgdHlwZSwgaWRdLmpvaW4oJy8nKTtcbiAgICBjb25zdCB7IGZpZWxkcywgaGVhZGVycyB9ID0gb3B0aW9ucztcbiAgICBpZiAoZmllbGRzKSB7XG4gICAgICB1cmwgKz0gYD9maWVsZHM9JHtmaWVsZHMuam9pbignLCcpfWA7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJlcXVlc3QoeyBtZXRob2Q6ICdHRVQnLCB1cmwsIGhlYWRlcnMgfSk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgYXN5bmMgX3JldHJpZXZlUGFyYWxsZWwoXG4gICAgdHlwZTogc3RyaW5nLFxuICAgIGlkczogc3RyaW5nW10sXG4gICAgb3B0aW9uczogUmV0cmlldmVPcHRpb25zLFxuICApIHtcbiAgICBpZiAoaWRzLmxlbmd0aCA+IHRoaXMuX21heFJlcXVlc3QpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhjZWVkZWQgbWF4IGxpbWl0IG9mIGNvbmN1cnJlbnQgY2FsbCcpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICBpZHMubWFwKChpZCkgPT5cbiAgICAgICAgdGhpcy5fcmV0cmlldmVTaW5nbGUodHlwZSwgaWQsIG9wdGlvbnMpLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBpZiAob3B0aW9ucy5hbGxPck5vbmUgfHwgZXJyLmVycm9yQ29kZSAhPT0gJ05PVF9GT1VORCcpIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0pLFxuICAgICAgKSxcbiAgICApO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGFzeW5jIF9yZXRyaWV2ZU1hbnkodHlwZTogc3RyaW5nLCBpZHM6IHN0cmluZ1tdLCBvcHRpb25zOiBSZXRyaWV2ZU9wdGlvbnMpIHtcbiAgICBpZiAoaWRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCB1cmwgPSBbdGhpcy5fYmFzZVVybCgpLCAnY29tcG9zaXRlJywgJ3NvYmplY3RzJywgdHlwZV0uam9pbignLycpO1xuICAgIGNvbnN0IGZpZWxkcyA9XG4gICAgICBvcHRpb25zLmZpZWxkcyB8fFxuICAgICAgKGF3YWl0IHRoaXMuZGVzY3JpYmUkKHR5cGUpKS5maWVsZHMubWFwKChmaWVsZCkgPT4gZmllbGQubmFtZSk7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybCxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgaWRzLCBmaWVsZHMgfSksXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIC4uLihvcHRpb25zLmhlYWRlcnMgfHwge30pLFxuICAgICAgICAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgcmVjb3Jkc1xuICAgKi9cbiAgY3JlYXRlPFxuICAgIE4gZXh0ZW5kcyBTT2JqZWN0TmFtZXM8Uz4sXG4gICAgSW5wdXRSZWNvcmQgZXh0ZW5kcyBTT2JqZWN0SW5wdXRSZWNvcmQ8UywgTj4gPSBTT2JqZWN0SW5wdXRSZWNvcmQ8UywgTj5cbiAgPihcbiAgICB0eXBlOiBOLFxuICAgIHJlY29yZHM6IElucHV0UmVjb3JkW10sXG4gICAgb3B0aW9ucz86IERtbE9wdGlvbnMsXG4gICk6IFByb21pc2U8U2F2ZVJlc3VsdFtdPjtcbiAgY3JlYXRlPFxuICAgIE4gZXh0ZW5kcyBTT2JqZWN0TmFtZXM8Uz4sXG4gICAgSW5wdXRSZWNvcmQgZXh0ZW5kcyBTT2JqZWN0SW5wdXRSZWNvcmQ8UywgTj4gPSBTT2JqZWN0SW5wdXRSZWNvcmQ8UywgTj5cbiAgPih0eXBlOiBOLCByZWNvcmQ6IElucHV0UmVjb3JkLCBvcHRpb25zPzogRG1sT3B0aW9ucyk6IFByb21pc2U8U2F2ZVJlc3VsdD47XG4gIGNyZWF0ZTxcbiAgICBOIGV4dGVuZHMgU09iamVjdE5hbWVzPFM+LFxuICAgIElucHV0UmVjb3JkIGV4dGVuZHMgU09iamVjdElucHV0UmVjb3JkPFMsIE4+ID0gU09iamVjdElucHV0UmVjb3JkPFMsIE4+XG4gID4oXG4gICAgdHlwZTogTixcbiAgICByZWNvcmRzOiBJbnB1dFJlY29yZCB8IElucHV0UmVjb3JkW10sXG4gICAgb3B0aW9ucz86IERtbE9wdGlvbnMsXG4gICk6IFByb21pc2U8U2F2ZVJlc3VsdCB8IFNhdmVSZXN1bHRbXT47XG4gIC8qKlxuICAgKiBAcGFyYW0gdHlwZVxuICAgKiBAcGFyYW0gcmVjb3Jkc1xuICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgKi9cbiAgYXN5bmMgY3JlYXRlKFxuICAgIHR5cGU6IHN0cmluZyxcbiAgICByZWNvcmRzOiBSZWNvcmQgfCBSZWNvcmRbXSxcbiAgICBvcHRpb25zOiBEbWxPcHRpb25zID0ge30sXG4gICkge1xuICAgIGNvbnN0IHJldCA9IEFycmF5LmlzQXJyYXkocmVjb3JkcylcbiAgICAgID8gLy8gY2hlY2sgdGhlIHZlcnNpb24gd2hldGhlciBTT2JqZWN0IGNvbGxlY3Rpb24gQVBJIGlzIHN1cHBvcnRlZCAoNDIuMClcbiAgICAgICAgdGhpcy5fZW5zdXJlVmVyc2lvbig0MilcbiAgICAgICAgPyBhd2FpdCB0aGlzLl9jcmVhdGVNYW55KHR5cGUsIHJlY29yZHMsIG9wdGlvbnMpXG4gICAgICAgIDogYXdhaXQgdGhpcy5fY3JlYXRlUGFyYWxsZWwodHlwZSwgcmVjb3Jkcywgb3B0aW9ucylcbiAgICAgIDogYXdhaXQgdGhpcy5fY3JlYXRlU2luZ2xlKHR5cGUsIHJlY29yZHMsIG9wdGlvbnMpO1xuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgYXN5bmMgX2NyZWF0ZVNpbmdsZSh0eXBlOiBzdHJpbmcsIHJlY29yZDogUmVjb3JkLCBvcHRpb25zOiBEbWxPcHRpb25zKSB7XG4gICAgY29uc3QgeyBJZCwgdHlwZTogcnR5cGUsIGF0dHJpYnV0ZXMsIC4uLnJlYyB9ID0gcmVjb3JkO1xuICAgIGNvbnN0IHNvYmplY3RUeXBlID0gdHlwZSB8fCAoYXR0cmlidXRlcyAmJiBhdHRyaWJ1dGVzLnR5cGUpIHx8IHJ0eXBlO1xuICAgIGlmICghc29iamVjdFR5cGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gU09iamVjdCBUeXBlIGRlZmluZWQgaW4gcmVjb3JkJyk7XG4gICAgfVxuICAgIGNvbnN0IHVybCA9IFt0aGlzLl9iYXNlVXJsKCksICdzb2JqZWN0cycsIHNvYmplY3RUeXBlXS5qb2luKCcvJyk7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybCxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHJlYyksXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIC4uLihvcHRpb25zLmhlYWRlcnMgfHwge30pLFxuICAgICAgICAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBhc3luYyBfY3JlYXRlUGFyYWxsZWwodHlwZTogc3RyaW5nLCByZWNvcmRzOiBSZWNvcmRbXSwgb3B0aW9uczogRG1sT3B0aW9ucykge1xuICAgIGlmIChyZWNvcmRzLmxlbmd0aCA+IHRoaXMuX21heFJlcXVlc3QpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhjZWVkZWQgbWF4IGxpbWl0IG9mIGNvbmN1cnJlbnQgY2FsbCcpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICByZWNvcmRzLm1hcCgocmVjb3JkKSA9PlxuICAgICAgICB0aGlzLl9jcmVhdGVTaW5nbGUodHlwZSwgcmVjb3JkLCBvcHRpb25zKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgLy8gYmUgYXdhcmUgdGhhdCBhbGxPck5vbmUgaW4gcGFyYWxsZWwgbW9kZSB3aWxsIG5vdCByZXZlcnQgdGhlIG90aGVyIHN1Y2Nlc3NmdWwgcmVxdWVzdHNcbiAgICAgICAgICAvLyBpdCBvbmx5IHJhaXNlcyBlcnJvciB3aGVuIG1ldCBhdCBsZWFzdCBvbmUgZmFpbGVkIHJlcXVlc3QuXG4gICAgICAgICAgaWYgKG9wdGlvbnMuYWxsT3JOb25lIHx8ICFlcnIuZXJyb3JDb2RlKSB7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0b1NhdmVSZXN1bHQoZXJyKTtcbiAgICAgICAgfSksXG4gICAgICApLFxuICAgICk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgYXN5bmMgX2NyZWF0ZU1hbnkoXG4gICAgdHlwZTogc3RyaW5nLFxuICAgIHJlY29yZHM6IFJlY29yZFtdLFxuICAgIG9wdGlvbnM6IERtbE9wdGlvbnMsXG4gICk6IFByb21pc2U8U2F2ZVJlc3VsdFtdPiB7XG4gICAgaWYgKHJlY29yZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgICB9XG4gICAgaWYgKHJlY29yZHMubGVuZ3RoID4gTUFYX0RNTF9DT1VOVCAmJiBvcHRpb25zLmFsbG93UmVjdXJzaXZlKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICAuLi4oYXdhaXQgdGhpcy5fY3JlYXRlTWFueShcbiAgICAgICAgICB0eXBlLFxuICAgICAgICAgIHJlY29yZHMuc2xpY2UoMCwgTUFYX0RNTF9DT1VOVCksXG4gICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgKSksXG4gICAgICAgIC4uLihhd2FpdCB0aGlzLl9jcmVhdGVNYW55KFxuICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgcmVjb3Jkcy5zbGljZShNQVhfRE1MX0NPVU5UKSxcbiAgICAgICAgICBvcHRpb25zLFxuICAgICAgICApKSxcbiAgICAgIF07XG4gICAgfVxuICAgIGNvbnN0IF9yZWNvcmRzID0gcmVjb3Jkcy5tYXAoKHJlY29yZCkgPT4ge1xuICAgICAgY29uc3QgeyBJZCwgdHlwZTogcnR5cGUsIGF0dHJpYnV0ZXMsIC4uLnJlYyB9ID0gcmVjb3JkO1xuICAgICAgY29uc3Qgc29iamVjdFR5cGUgPSB0eXBlIHx8IChhdHRyaWJ1dGVzICYmIGF0dHJpYnV0ZXMudHlwZSkgfHwgcnR5cGU7XG4gICAgICBpZiAoIXNvYmplY3RUeXBlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gU09iamVjdCBUeXBlIGRlZmluZWQgaW4gcmVjb3JkJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4geyBhdHRyaWJ1dGVzOiB7IHR5cGU6IHNvYmplY3RUeXBlIH0sIC4uLnJlYyB9O1xuICAgIH0pO1xuICAgIGNvbnN0IHVybCA9IFt0aGlzLl9iYXNlVXJsKCksICdjb21wb3NpdGUnLCAnc29iamVjdHMnXS5qb2luKCcvJyk7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybCxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgYWxsT3JOb25lOiBvcHRpb25zLmFsbE9yTm9uZSB8fCBmYWxzZSxcbiAgICAgICAgcmVjb3JkczogX3JlY29yZHMsXG4gICAgICB9KSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgLi4uKG9wdGlvbnMuaGVhZGVycyB8fCB7fSksXG4gICAgICAgICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN5bm9ueW0gb2YgQ29ubmVjdGlvbiNjcmVhdGUoKVxuICAgKi9cbiAgaW5zZXJ0ID0gdGhpcy5jcmVhdGU7XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSByZWNvcmRzXG4gICAqL1xuICB1cGRhdGU8XG4gICAgTiBleHRlbmRzIFNPYmplY3ROYW1lczxTPixcbiAgICBVcGRhdGVSZWNvcmQgZXh0ZW5kcyBTT2JqZWN0VXBkYXRlUmVjb3JkPFMsIE4+ID0gU09iamVjdFVwZGF0ZVJlY29yZDxTLCBOPlxuICA+KFxuICAgIHR5cGU6IE4sXG4gICAgcmVjb3JkczogVXBkYXRlUmVjb3JkW10sXG4gICAgb3B0aW9ucz86IERtbE9wdGlvbnMsXG4gICk6IFByb21pc2U8U2F2ZVJlc3VsdFtdPjtcbiAgdXBkYXRlPFxuICAgIE4gZXh0ZW5kcyBTT2JqZWN0TmFtZXM8Uz4sXG4gICAgVXBkYXRlUmVjb3JkIGV4dGVuZHMgU09iamVjdFVwZGF0ZVJlY29yZDxTLCBOPiA9IFNPYmplY3RVcGRhdGVSZWNvcmQ8UywgTj5cbiAgPih0eXBlOiBOLCByZWNvcmQ6IFVwZGF0ZVJlY29yZCwgb3B0aW9ucz86IERtbE9wdGlvbnMpOiBQcm9taXNlPFNhdmVSZXN1bHQ+O1xuICB1cGRhdGU8XG4gICAgTiBleHRlbmRzIFNPYmplY3ROYW1lczxTPixcbiAgICBVcGRhdGVSZWNvcmQgZXh0ZW5kcyBTT2JqZWN0VXBkYXRlUmVjb3JkPFMsIE4+ID0gU09iamVjdFVwZGF0ZVJlY29yZDxTLCBOPlxuICA+KFxuICAgIHR5cGU6IE4sXG4gICAgcmVjb3JkczogVXBkYXRlUmVjb3JkIHwgVXBkYXRlUmVjb3JkW10sXG4gICAgb3B0aW9ucz86IERtbE9wdGlvbnMsXG4gICk6IFByb21pc2U8U2F2ZVJlc3VsdCB8IFNhdmVSZXN1bHRbXT47XG4gIC8qKlxuICAgKiBAcGFyYW0gdHlwZVxuICAgKiBAcGFyYW0gcmVjb3Jkc1xuICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgKi9cbiAgdXBkYXRlPE4gZXh0ZW5kcyBTT2JqZWN0TmFtZXM8Uz4+KFxuICAgIHR5cGU6IE4sXG4gICAgcmVjb3JkczogUmVjb3JkIHwgUmVjb3JkW10sXG4gICAgb3B0aW9uczogRG1sT3B0aW9ucyA9IHt9LFxuICApOiBQcm9taXNlPFNhdmVSZXN1bHQgfCBTYXZlUmVzdWx0W10+IHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheShyZWNvcmRzKVxuICAgICAgPyAvLyBjaGVjayB0aGUgdmVyc2lvbiB3aGV0aGVyIFNPYmplY3QgY29sbGVjdGlvbiBBUEkgaXMgc3VwcG9ydGVkICg0Mi4wKVxuICAgICAgICB0aGlzLl9lbnN1cmVWZXJzaW9uKDQyKVxuICAgICAgICA/IHRoaXMuX3VwZGF0ZU1hbnkodHlwZSwgcmVjb3Jkcywgb3B0aW9ucylcbiAgICAgICAgOiB0aGlzLl91cGRhdGVQYXJhbGxlbCh0eXBlLCByZWNvcmRzLCBvcHRpb25zKVxuICAgICAgOiB0aGlzLl91cGRhdGVTaW5nbGUodHlwZSwgcmVjb3Jkcywgb3B0aW9ucyk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgYXN5bmMgX3VwZGF0ZVNpbmdsZShcbiAgICB0eXBlOiBzdHJpbmcsXG4gICAgcmVjb3JkOiBSZWNvcmQsXG4gICAgb3B0aW9uczogRG1sT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxTYXZlUmVzdWx0PiB7XG4gICAgY29uc3QgeyBJZDogaWQsIHR5cGU6IHJ0eXBlLCBhdHRyaWJ1dGVzLCAuLi5yZWMgfSA9IHJlY29yZDtcbiAgICBpZiAoIWlkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlY29yZCBpZCBpcyBub3QgZm91bmQgaW4gcmVjb3JkLicpO1xuICAgIH1cbiAgICBjb25zdCBzb2JqZWN0VHlwZSA9IHR5cGUgfHwgKGF0dHJpYnV0ZXMgJiYgYXR0cmlidXRlcy50eXBlKSB8fCBydHlwZTtcbiAgICBpZiAoIXNvYmplY3RUeXBlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIFNPYmplY3QgVHlwZSBkZWZpbmVkIGluIHJlY29yZCcpO1xuICAgIH1cbiAgICBjb25zdCB1cmwgPSBbdGhpcy5fYmFzZVVybCgpLCAnc29iamVjdHMnLCBzb2JqZWN0VHlwZSwgaWRdLmpvaW4oJy8nKTtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KFxuICAgICAge1xuICAgICAgICBtZXRob2Q6ICdQQVRDSCcsXG4gICAgICAgIHVybCxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocmVjKSxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIC4uLihvcHRpb25zLmhlYWRlcnMgfHwge30pLFxuICAgICAgICAgICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBub0NvbnRlbnRSZXNwb25zZTogeyBpZCwgc3VjY2VzczogdHJ1ZSwgZXJyb3JzOiBbXSB9LFxuICAgICAgfSxcbiAgICApO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGFzeW5jIF91cGRhdGVQYXJhbGxlbCh0eXBlOiBzdHJpbmcsIHJlY29yZHM6IFJlY29yZFtdLCBvcHRpb25zOiBEbWxPcHRpb25zKSB7XG4gICAgaWYgKHJlY29yZHMubGVuZ3RoID4gdGhpcy5fbWF4UmVxdWVzdCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeGNlZWRlZCBtYXggbGltaXQgb2YgY29uY3VycmVudCBjYWxsJyk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLmFsbChcbiAgICAgIHJlY29yZHMubWFwKChyZWNvcmQpID0+XG4gICAgICAgIHRoaXMuX3VwZGF0ZVNpbmdsZSh0eXBlLCByZWNvcmQsIG9wdGlvbnMpLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAvLyBiZSBhd2FyZSB0aGF0IGFsbE9yTm9uZSBpbiBwYXJhbGxlbCBtb2RlIHdpbGwgbm90IHJldmVydCB0aGUgb3RoZXIgc3VjY2Vzc2Z1bCByZXF1ZXN0c1xuICAgICAgICAgIC8vIGl0IG9ubHkgcmFpc2VzIGVycm9yIHdoZW4gbWV0IGF0IGxlYXN0IG9uZSBmYWlsZWQgcmVxdWVzdC5cbiAgICAgICAgICBpZiAob3B0aW9ucy5hbGxPck5vbmUgfHwgIWVyci5lcnJvckNvZGUpIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRvU2F2ZVJlc3VsdChlcnIpO1xuICAgICAgICB9KSxcbiAgICAgICksXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBhc3luYyBfdXBkYXRlTWFueShcbiAgICB0eXBlOiBzdHJpbmcsXG4gICAgcmVjb3JkczogUmVjb3JkW10sXG4gICAgb3B0aW9uczogRG1sT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxTYXZlUmVzdWx0W10+IHtcbiAgICBpZiAocmVjb3Jkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgaWYgKHJlY29yZHMubGVuZ3RoID4gTUFYX0RNTF9DT1VOVCAmJiBvcHRpb25zLmFsbG93UmVjdXJzaXZlKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICAuLi4oYXdhaXQgdGhpcy5fdXBkYXRlTWFueShcbiAgICAgICAgICB0eXBlLFxuICAgICAgICAgIHJlY29yZHMuc2xpY2UoMCwgTUFYX0RNTF9DT1VOVCksXG4gICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgKSksXG4gICAgICAgIC4uLihhd2FpdCB0aGlzLl91cGRhdGVNYW55KFxuICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgcmVjb3Jkcy5zbGljZShNQVhfRE1MX0NPVU5UKSxcbiAgICAgICAgICBvcHRpb25zLFxuICAgICAgICApKSxcbiAgICAgIF07XG4gICAgfVxuICAgIGNvbnN0IF9yZWNvcmRzID0gcmVjb3Jkcy5tYXAoKHJlY29yZCkgPT4ge1xuICAgICAgY29uc3QgeyBJZDogaWQsIHR5cGU6IHJ0eXBlLCBhdHRyaWJ1dGVzLCAuLi5yZWMgfSA9IHJlY29yZDtcbiAgICAgIGlmICghaWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWNvcmQgaWQgaXMgbm90IGZvdW5kIGluIHJlY29yZC4nKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNvYmplY3RUeXBlID0gdHlwZSB8fCAoYXR0cmlidXRlcyAmJiBhdHRyaWJ1dGVzLnR5cGUpIHx8IHJ0eXBlO1xuICAgICAgaWYgKCFzb2JqZWN0VHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIFNPYmplY3QgVHlwZSBkZWZpbmVkIGluIHJlY29yZCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgaWQsIGF0dHJpYnV0ZXM6IHsgdHlwZTogc29iamVjdFR5cGUgfSwgLi4ucmVjIH07XG4gICAgfSk7XG4gICAgY29uc3QgdXJsID0gW3RoaXMuX2Jhc2VVcmwoKSwgJ2NvbXBvc2l0ZScsICdzb2JqZWN0cyddLmpvaW4oJy8nKTtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KHtcbiAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgIHVybCxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgYWxsT3JOb25lOiBvcHRpb25zLmFsbE9yTm9uZSB8fCBmYWxzZSxcbiAgICAgICAgcmVjb3JkczogX3JlY29yZHMsXG4gICAgICB9KSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgLi4uKG9wdGlvbnMuaGVhZGVycyB8fCB7fSksXG4gICAgICAgICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwc2VydCByZWNvcmRzXG4gICAqL1xuICB1cHNlcnQ8XG4gICAgTiBleHRlbmRzIFNPYmplY3ROYW1lczxTPixcbiAgICBJbnB1dFJlY29yZCBleHRlbmRzIFNPYmplY3RJbnB1dFJlY29yZDxTLCBOPiA9IFNPYmplY3RJbnB1dFJlY29yZDxTLCBOPixcbiAgICBGaWVsZE5hbWVzIGV4dGVuZHMgU09iamVjdEZpZWxkTmFtZXM8UywgTj4gPSBTT2JqZWN0RmllbGROYW1lczxTLCBOPlxuICA+KFxuICAgIHR5cGU6IE4sXG4gICAgcmVjb3JkczogSW5wdXRSZWNvcmRbXSxcbiAgICBleHRJZEZpZWxkOiBGaWVsZE5hbWVzLFxuICAgIG9wdGlvbnM/OiBEbWxPcHRpb25zLFxuICApOiBQcm9taXNlPFVwc2VydFJlc3VsdFtdPjtcbiAgdXBzZXJ0PFxuICAgIE4gZXh0ZW5kcyBTT2JqZWN0TmFtZXM8Uz4sXG4gICAgSW5wdXRSZWNvcmQgZXh0ZW5kcyBTT2JqZWN0SW5wdXRSZWNvcmQ8UywgTj4gPSBTT2JqZWN0SW5wdXRSZWNvcmQ8UywgTj4sXG4gICAgRmllbGROYW1lcyBleHRlbmRzIFNPYmplY3RGaWVsZE5hbWVzPFMsIE4+ID0gU09iamVjdEZpZWxkTmFtZXM8UywgTj5cbiAgPihcbiAgICB0eXBlOiBOLFxuICAgIHJlY29yZDogSW5wdXRSZWNvcmQsXG4gICAgZXh0SWRGaWVsZDogRmllbGROYW1lcyxcbiAgICBvcHRpb25zPzogRG1sT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxVcHNlcnRSZXN1bHQ+O1xuICB1cHNlcnQ8XG4gICAgTiBleHRlbmRzIFNPYmplY3ROYW1lczxTPixcbiAgICBJbnB1dFJlY29yZCBleHRlbmRzIFNPYmplY3RJbnB1dFJlY29yZDxTLCBOPiA9IFNPYmplY3RJbnB1dFJlY29yZDxTLCBOPixcbiAgICBGaWVsZE5hbWVzIGV4dGVuZHMgU09iamVjdEZpZWxkTmFtZXM8UywgTj4gPSBTT2JqZWN0RmllbGROYW1lczxTLCBOPlxuICA+KFxuICAgIHR5cGU6IE4sXG4gICAgcmVjb3JkczogSW5wdXRSZWNvcmQgfCBJbnB1dFJlY29yZFtdLFxuICAgIGV4dElkRmllbGQ6IEZpZWxkTmFtZXMsXG4gICAgb3B0aW9ucz86IERtbE9wdGlvbnMsXG4gICk6IFByb21pc2U8VXBzZXJ0UmVzdWx0IHwgVXBzZXJ0UmVzdWx0W10+O1xuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHR5cGVcbiAgICogQHBhcmFtIHJlY29yZHNcbiAgICogQHBhcmFtIGV4dElkRmllbGRcbiAgICogQHBhcmFtIG9wdGlvbnNcbiAgICovXG4gIGFzeW5jIHVwc2VydChcbiAgICB0eXBlOiBzdHJpbmcsXG4gICAgcmVjb3JkczogUmVjb3JkIHwgUmVjb3JkW10sXG4gICAgZXh0SWRGaWVsZDogc3RyaW5nLFxuICAgIG9wdGlvbnM6IERtbE9wdGlvbnMgPSB7fSxcbiAgKTogUHJvbWlzZTxTYXZlUmVzdWx0IHwgU2F2ZVJlc3VsdFtdPiB7XG4gICAgY29uc3QgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkocmVjb3Jkcyk7XG4gICAgY29uc3QgX3JlY29yZHMgPSBBcnJheS5pc0FycmF5KHJlY29yZHMpID8gcmVjb3JkcyA6IFtyZWNvcmRzXTtcbiAgICBpZiAoX3JlY29yZHMubGVuZ3RoID4gdGhpcy5fbWF4UmVxdWVzdCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeGNlZWRlZCBtYXggbGltaXQgb2YgY29uY3VycmVudCBjYWxsJyk7XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgIF9yZWNvcmRzLm1hcCgocmVjb3JkKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgW2V4dElkRmllbGRdOiBleHRJZCwgdHlwZTogcnR5cGUsIGF0dHJpYnV0ZXMsIC4uLnJlYyB9ID0gcmVjb3JkO1xuICAgICAgICBjb25zdCB1cmwgPSBbdGhpcy5fYmFzZVVybCgpLCAnc29iamVjdHMnLCB0eXBlLCBleHRJZEZpZWxkLCBleHRJZF0uam9pbihcbiAgICAgICAgICAnLycsXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8U2F2ZVJlc3VsdD4oXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocmVjKSxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgLi4uKG9wdGlvbnMuaGVhZGVycyB8fCB7fSksXG4gICAgICAgICAgICAgICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbm9Db250ZW50UmVzcG9uc2U6IHsgc3VjY2VzczogdHJ1ZSwgZXJyb3JzOiBbXSB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIC8vIEJlIGF3YXJlIHRoYXQgYGFsbE9yTm9uZWAgb3B0aW9uIGluIHVwc2VydCBtZXRob2RcbiAgICAgICAgICAvLyB3aWxsIG5vdCByZXZlcnQgdGhlIG90aGVyIHN1Y2Nlc3NmdWwgcmVxdWVzdHMuXG4gICAgICAgICAgLy8gSXQgb25seSByYWlzZXMgZXJyb3Igd2hlbiBtZXQgYXQgbGVhc3Qgb25lIGZhaWxlZCByZXF1ZXN0LlxuICAgICAgICAgIGlmICghaXNBcnJheSB8fCBvcHRpb25zLmFsbE9yTm9uZSB8fCAhZXJyLmVycm9yQ29kZSkge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdG9TYXZlUmVzdWx0KGVycik7XG4gICAgICAgIH0pO1xuICAgICAgfSksXG4gICAgKTtcbiAgICByZXR1cm4gaXNBcnJheSA/IHJlc3VsdHMgOiByZXN1bHRzWzBdO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZSByZWNvcmRzXG4gICAqL1xuICBkZXN0cm95PE4gZXh0ZW5kcyBTT2JqZWN0TmFtZXM8Uz4+KFxuICAgIHR5cGU6IE4sXG4gICAgaWRzOiBzdHJpbmdbXSxcbiAgICBvcHRpb25zPzogRG1sT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxTYXZlUmVzdWx0W10+O1xuICBkZXN0cm95PE4gZXh0ZW5kcyBTT2JqZWN0TmFtZXM8Uz4+KFxuICAgIHR5cGU6IE4sXG4gICAgaWQ6IHN0cmluZyxcbiAgICBvcHRpb25zPzogRG1sT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxTYXZlUmVzdWx0PjtcbiAgZGVzdHJveTxOIGV4dGVuZHMgU09iamVjdE5hbWVzPFM+PihcbiAgICB0eXBlOiBOLFxuICAgIGlkczogc3RyaW5nIHwgc3RyaW5nW10sXG4gICAgb3B0aW9ucz86IERtbE9wdGlvbnMsXG4gICk6IFByb21pc2U8U2F2ZVJlc3VsdCB8IFNhdmVSZXN1bHRbXT47XG4gIC8qKlxuICAgKiBAcGFyYW0gdHlwZVxuICAgKiBAcGFyYW0gaWRzXG4gICAqIEBwYXJhbSBvcHRpb25zXG4gICAqL1xuICBhc3luYyBkZXN0cm95KFxuICAgIHR5cGU6IHN0cmluZyxcbiAgICBpZHM6IHN0cmluZyB8IHN0cmluZ1tdLFxuICAgIG9wdGlvbnM6IERtbE9wdGlvbnMgPSB7fSxcbiAgKTogUHJvbWlzZTxTYXZlUmVzdWx0IHwgU2F2ZVJlc3VsdFtdPiB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoaWRzKVxuICAgICAgPyAvLyBjaGVjayB0aGUgdmVyc2lvbiB3aGV0aGVyIFNPYmplY3QgY29sbGVjdGlvbiBBUEkgaXMgc3VwcG9ydGVkICg0Mi4wKVxuICAgICAgICB0aGlzLl9lbnN1cmVWZXJzaW9uKDQyKVxuICAgICAgICA/IHRoaXMuX2Rlc3Ryb3lNYW55KHR5cGUsIGlkcywgb3B0aW9ucylcbiAgICAgICAgOiB0aGlzLl9kZXN0cm95UGFyYWxsZWwodHlwZSwgaWRzLCBvcHRpb25zKVxuICAgICAgOiB0aGlzLl9kZXN0cm95U2luZ2xlKHR5cGUsIGlkcywgb3B0aW9ucyk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgYXN5bmMgX2Rlc3Ryb3lTaW5nbGUoXG4gICAgdHlwZTogc3RyaW5nLFxuICAgIGlkOiBzdHJpbmcsXG4gICAgb3B0aW9uczogRG1sT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxTYXZlUmVzdWx0PiB7XG4gICAgY29uc3QgdXJsID0gW3RoaXMuX2Jhc2VVcmwoKSwgJ3NvYmplY3RzJywgdHlwZSwgaWRdLmpvaW4oJy8nKTtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KFxuICAgICAge1xuICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICB1cmwsXG4gICAgICAgIGhlYWRlcnM6IG9wdGlvbnMuaGVhZGVycyB8fCB7fSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5vQ29udGVudFJlc3BvbnNlOiB7IGlkLCBzdWNjZXNzOiB0cnVlLCBlcnJvcnM6IFtdIH0sXG4gICAgICB9LFxuICAgICk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgYXN5bmMgX2Rlc3Ryb3lQYXJhbGxlbCh0eXBlOiBzdHJpbmcsIGlkczogc3RyaW5nW10sIG9wdGlvbnM6IERtbE9wdGlvbnMpIHtcbiAgICBpZiAoaWRzLmxlbmd0aCA+IHRoaXMuX21heFJlcXVlc3QpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhjZWVkZWQgbWF4IGxpbWl0IG9mIGNvbmN1cnJlbnQgY2FsbCcpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICBpZHMubWFwKChpZCkgPT5cbiAgICAgICAgdGhpcy5fZGVzdHJveVNpbmdsZSh0eXBlLCBpZCwgb3B0aW9ucykuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIC8vIEJlIGF3YXJlIHRoYXQgYGFsbE9yTm9uZWAgb3B0aW9uIGluIHBhcmFsbGVsIG1vZGVcbiAgICAgICAgICAvLyB3aWxsIG5vdCByZXZlcnQgdGhlIG90aGVyIHN1Y2Nlc3NmdWwgcmVxdWVzdHMuXG4gICAgICAgICAgLy8gSXQgb25seSByYWlzZXMgZXJyb3Igd2hlbiBtZXQgYXQgbGVhc3Qgb25lIGZhaWxlZCByZXF1ZXN0LlxuICAgICAgICAgIGlmIChvcHRpb25zLmFsbE9yTm9uZSB8fCAhZXJyLmVycm9yQ29kZSkge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdG9TYXZlUmVzdWx0KGVycik7XG4gICAgICAgIH0pLFxuICAgICAgKSxcbiAgICApO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGFzeW5jIF9kZXN0cm95TWFueShcbiAgICB0eXBlOiBzdHJpbmcsXG4gICAgaWRzOiBzdHJpbmdbXSxcbiAgICBvcHRpb25zOiBEbWxPcHRpb25zLFxuICApOiBQcm9taXNlPFNhdmVSZXN1bHRbXT4ge1xuICAgIGlmIChpZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGlmIChpZHMubGVuZ3RoID4gTUFYX0RNTF9DT1VOVCAmJiBvcHRpb25zLmFsbG93UmVjdXJzaXZlKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICAuLi4oYXdhaXQgdGhpcy5fZGVzdHJveU1hbnkoXG4gICAgICAgICAgdHlwZSxcbiAgICAgICAgICBpZHMuc2xpY2UoMCwgTUFYX0RNTF9DT1VOVCksXG4gICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgKSksXG4gICAgICAgIC4uLihhd2FpdCB0aGlzLl9kZXN0cm95TWFueSh0eXBlLCBpZHMuc2xpY2UoTUFYX0RNTF9DT1VOVCksIG9wdGlvbnMpKSxcbiAgICAgIF07XG4gICAgfVxuICAgIGxldCB1cmwgPVxuICAgICAgW3RoaXMuX2Jhc2VVcmwoKSwgJ2NvbXBvc2l0ZScsICdzb2JqZWN0cz9pZHM9J10uam9pbignLycpICsgaWRzLmpvaW4oJywnKTtcbiAgICBpZiAob3B0aW9ucy5hbGxPck5vbmUpIHtcbiAgICAgIHVybCArPSAnJmFsbE9yTm9uZT10cnVlJztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgdXJsLFxuICAgICAgaGVhZGVyczogb3B0aW9ucy5oZWFkZXJzIHx8IHt9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN5bm9ueW0gb2YgQ29ubmVjdGlvbiNkZXN0cm95KClcbiAgICovXG4gIGRlbGV0ZSA9IHRoaXMuZGVzdHJveTtcblxuICAvKipcbiAgICogU3lub255bSBvZiBDb25uZWN0aW9uI2Rlc3Ryb3koKVxuICAgKi9cbiAgZGVsID0gdGhpcy5kZXN0cm95O1xuXG4gIC8qKlxuICAgKiBEZXNjcmliZSBTT2JqZWN0IG1ldGFkYXRhXG4gICAqL1xuICBhc3luYyBkZXNjcmliZSh0eXBlOiBzdHJpbmcpOiBQcm9taXNlPERlc2NyaWJlU09iamVjdFJlc3VsdD4ge1xuICAgIGNvbnN0IHVybCA9IFt0aGlzLl9iYXNlVXJsKCksICdzb2JqZWN0cycsIHR5cGUsICdkZXNjcmliZSddLmpvaW4oJy8nKTtcbiAgICBjb25zdCBib2R5ID0gYXdhaXQgdGhpcy5yZXF1ZXN0KHVybCk7XG4gICAgcmV0dXJuIGJvZHkgYXMgRGVzY3JpYmVTT2JqZWN0UmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIERlc2NyaWJlIGdsb2JhbCBTT2JqZWN0c1xuICAgKi9cbiAgYXN5bmMgZGVzY3JpYmVHbG9iYWwoKSB7XG4gICAgY29uc3QgdXJsID0gYCR7dGhpcy5fYmFzZVVybCgpfS9zb2JqZWN0c2A7XG4gICAgY29uc3QgYm9keSA9IGF3YWl0IHRoaXMucmVxdWVzdCh1cmwpO1xuICAgIHJldHVybiBib2R5IGFzIERlc2NyaWJlR2xvYmFsUmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBTT2JqZWN0IGluc3RhbmNlXG4gICAqL1xuICBzb2JqZWN0PE4gZXh0ZW5kcyBTT2JqZWN0TmFtZXM8Uz4+KHR5cGU6IE4pOiBTT2JqZWN0PFMsIE4+O1xuICBzb2JqZWN0PE4gZXh0ZW5kcyBTT2JqZWN0TmFtZXM8Uz4+KHR5cGU6IHN0cmluZyk6IFNPYmplY3Q8UywgTj47XG4gIHNvYmplY3Q8TiBleHRlbmRzIFNPYmplY3ROYW1lczxTPj4odHlwZTogTiB8IHN0cmluZyk6IFNPYmplY3Q8UywgTj4ge1xuICAgIGNvbnN0IHNvID1cbiAgICAgICh0aGlzLnNvYmplY3RzW3R5cGUgYXMgTl0gYXMgU09iamVjdDxTLCBOPiB8IHVuZGVmaW5lZCkgfHxcbiAgICAgIG5ldyBTT2JqZWN0KHRoaXMsIHR5cGUgYXMgTik7XG4gICAgdGhpcy5zb2JqZWN0c1t0eXBlIGFzIE5dID0gc287XG4gICAgcmV0dXJuIHNvO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBpZGVudGl0eSBpbmZvcm1hdGlvbiBvZiBjdXJyZW50IHVzZXJcbiAgICovXG4gIGFzeW5jIGlkZW50aXR5KG9wdGlvbnM6IHsgaGVhZGVycz86IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9IH0gPSB7fSkge1xuICAgIGxldCB1cmwgPSB0aGlzLnVzZXJJbmZvICYmIHRoaXMudXNlckluZm8udXJsO1xuICAgIGlmICghdXJsKSB7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLnJlcXVlc3Q8eyBpZGVudGl0eTogc3RyaW5nIH0+KHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgdXJsOiB0aGlzLl9iYXNlVXJsKCksXG4gICAgICAgIGhlYWRlcnM6IG9wdGlvbnMuaGVhZGVycyxcbiAgICAgIH0pO1xuICAgICAgdXJsID0gcmVzLmlkZW50aXR5O1xuICAgIH1cbiAgICB1cmwgKz0gJz9mb3JtYXQ9anNvbic7XG4gICAgaWYgKHRoaXMuYWNjZXNzVG9rZW4pIHtcbiAgICAgIHVybCArPSBgJm9hdXRoX3Rva2VuPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuYWNjZXNzVG9rZW4pfWA7XG4gICAgfVxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMucmVxdWVzdDxJZGVudGl0eUluZm8+KHsgbWV0aG9kOiAnR0VUJywgdXJsIH0pO1xuICAgIHRoaXMudXNlckluZm8gPSB7XG4gICAgICBpZDogcmVzLnVzZXJfaWQsXG4gICAgICBvcmdhbml6YXRpb25JZDogcmVzLm9yZ2FuaXphdGlvbl9pZCxcbiAgICAgIHVybDogcmVzLmlkLFxuICAgIH07XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0IHJlY2VudGx5IHZpZXdlZCByZWNvcmRzXG4gICAqL1xuICBhc3luYyByZWNlbnQodHlwZT86IHN0cmluZyB8IG51bWJlciwgbGltaXQ/OiBudW1iZXIpIHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1wYXJhbS1yZWFzc2lnbiAqL1xuICAgIGlmICh0eXBlb2YgdHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIGxpbWl0ID0gdHlwZTtcbiAgICAgIHR5cGUgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGxldCB1cmw7XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIHVybCA9IFt0aGlzLl9iYXNlVXJsKCksICdzb2JqZWN0cycsIHR5cGVdLmpvaW4oJy8nKTtcbiAgICAgIGNvbnN0IHsgcmVjZW50SXRlbXMgfSA9IGF3YWl0IHRoaXMucmVxdWVzdDx7IHJlY2VudEl0ZW1zOiBSZWNvcmRbXSB9PihcbiAgICAgICAgdXJsLFxuICAgICAgKTtcbiAgICAgIHJldHVybiBsaW1pdCA/IHJlY2VudEl0ZW1zLnNsaWNlKDAsIGxpbWl0KSA6IHJlY2VudEl0ZW1zO1xuICAgIH1cbiAgICB1cmwgPSBgJHt0aGlzLl9iYXNlVXJsKCl9L3JlY2VudGA7XG4gICAgaWYgKGxpbWl0KSB7XG4gICAgICB1cmwgKz0gYD9saW1pdD0ke2xpbWl0fWA7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8UmVjb3JkW10+KHVybCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmUgdXBkYXRlZCByZWNvcmRzXG4gICAqL1xuICBhc3luYyB1cGRhdGVkKFxuICAgIHR5cGU6IHN0cmluZyxcbiAgICBzdGFydDogc3RyaW5nIHwgRGF0ZSxcbiAgICBlbmQ6IHN0cmluZyB8IERhdGUsXG4gICk6IFByb21pc2U8VXBkYXRlZFJlc3VsdD4ge1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXBhcmFtLXJlYXNzaWduICovXG4gICAgbGV0IHVybCA9IFt0aGlzLl9iYXNlVXJsKCksICdzb2JqZWN0cycsIHR5cGUsICd1cGRhdGVkJ10uam9pbignLycpO1xuICAgIGlmICh0eXBlb2Ygc3RhcnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBzdGFydCA9IG5ldyBEYXRlKHN0YXJ0KTtcbiAgICB9XG4gICAgc3RhcnQgPSBmb3JtYXREYXRlKHN0YXJ0KTtcbiAgICB1cmwgKz0gYD9zdGFydD0ke2VuY29kZVVSSUNvbXBvbmVudChzdGFydCl9YDtcbiAgICBpZiAodHlwZW9mIGVuZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuZCA9IG5ldyBEYXRlKGVuZCk7XG4gICAgfVxuICAgIGVuZCA9IGZvcm1hdERhdGUoZW5kKTtcbiAgICB1cmwgKz0gYCZlbmQ9JHtlbmNvZGVVUklDb21wb25lbnQoZW5kKX1gO1xuICAgIGNvbnN0IGJvZHkgPSBhd2FpdCB0aGlzLnJlcXVlc3QodXJsKTtcbiAgICByZXR1cm4gYm9keSBhcyBVcGRhdGVkUmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIGRlbGV0ZWQgcmVjb3Jkc1xuICAgKi9cbiAgYXN5bmMgZGVsZXRlZChcbiAgICB0eXBlOiBzdHJpbmcsXG4gICAgc3RhcnQ6IHN0cmluZyB8IERhdGUsXG4gICAgZW5kOiBzdHJpbmcgfCBEYXRlLFxuICApOiBQcm9taXNlPERlbGV0ZWRSZXN1bHQ+IHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1wYXJhbS1yZWFzc2lnbiAqL1xuICAgIGxldCB1cmwgPSBbdGhpcy5fYmFzZVVybCgpLCAnc29iamVjdHMnLCB0eXBlLCAnZGVsZXRlZCddLmpvaW4oJy8nKTtcbiAgICBpZiAodHlwZW9mIHN0YXJ0ID09PSAnc3RyaW5nJykge1xuICAgICAgc3RhcnQgPSBuZXcgRGF0ZShzdGFydCk7XG4gICAgfVxuICAgIHN0YXJ0ID0gZm9ybWF0RGF0ZShzdGFydCk7XG4gICAgdXJsICs9IGA/c3RhcnQ9JHtlbmNvZGVVUklDb21wb25lbnQoc3RhcnQpfWA7XG5cbiAgICBpZiAodHlwZW9mIGVuZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuZCA9IG5ldyBEYXRlKGVuZCk7XG4gICAgfVxuICAgIGVuZCA9IGZvcm1hdERhdGUoZW5kKTtcbiAgICB1cmwgKz0gYCZlbmQ9JHtlbmNvZGVVUklDb21wb25lbnQoZW5kKX1gO1xuICAgIGNvbnN0IGJvZHkgPSBhd2FpdCB0aGlzLnJlcXVlc3QodXJsKTtcbiAgICByZXR1cm4gYm9keSBhcyBEZWxldGVkUmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBsaXN0IG9mIGFsbCB0YWJzXG4gICAqL1xuICBhc3luYyB0YWJzKCk6IFByb21pc2U8RGVzY3JpYmVUYWJbXT4ge1xuICAgIGNvbnN0IHVybCA9IFt0aGlzLl9iYXNlVXJsKCksICd0YWJzJ10uam9pbignLycpO1xuICAgIGNvbnN0IGJvZHkgPSBhd2FpdCB0aGlzLnJlcXVlc3QodXJsKTtcbiAgICByZXR1cm4gYm9keSBhcyBEZXNjcmliZVRhYltdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgY3VycmVudCBzeXN0ZW0gbGltaXQgaW4gdGhlIG9yZ2FuaXphdGlvblxuICAgKi9cbiAgYXN5bmMgbGltaXRzKCk6IFByb21pc2U8T3JnYW5pemF0aW9uTGltaXRzSW5mbz4ge1xuICAgIGNvbnN0IHVybCA9IFt0aGlzLl9iYXNlVXJsKCksICdsaW1pdHMnXS5qb2luKCcvJyk7XG4gICAgY29uc3QgYm9keSA9IGF3YWl0IHRoaXMucmVxdWVzdCh1cmwpO1xuICAgIHJldHVybiBib2R5IGFzIE9yZ2FuaXphdGlvbkxpbWl0c0luZm87XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHRoZW1lIGluZm9cbiAgICovXG4gIGFzeW5jIHRoZW1lKCk6IFByb21pc2U8RGVzY3JpYmVUaGVtZT4ge1xuICAgIGNvbnN0IHVybCA9IFt0aGlzLl9iYXNlVXJsKCksICd0aGVtZSddLmpvaW4oJy8nKTtcbiAgICBjb25zdCBib2R5ID0gYXdhaXQgdGhpcy5yZXF1ZXN0KHVybCk7XG4gICAgcmV0dXJuIGJvZHkgYXMgRGVzY3JpYmVUaGVtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCByZWdpc3RlcmVkIGdsb2JhbCBxdWljayBhY3Rpb25zXG4gICAqL1xuICBhc3luYyBxdWlja0FjdGlvbnMoKTogUHJvbWlzZTxEZXNjcmliZVF1aWNrQWN0aW9uUmVzdWx0W10+IHtcbiAgICBjb25zdCBib2R5ID0gYXdhaXQgdGhpcy5yZXF1ZXN0KCcvcXVpY2tBY3Rpb25zJyk7XG4gICAgcmV0dXJuIGJvZHkgYXMgRGVzY3JpYmVRdWlja0FjdGlvblJlc3VsdFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCByZWZlcmVuY2UgZm9yIHNwZWNpZmllZCBnbG9iYWwgcXVpY2sgYWN0aW9uXG4gICAqL1xuICBxdWlja0FjdGlvbihhY3Rpb25OYW1lOiBzdHJpbmcpOiBRdWlja0FjdGlvbjxTPiB7XG4gICAgcmV0dXJuIG5ldyBRdWlja0FjdGlvbih0aGlzLCBgL3F1aWNrQWN0aW9ucy8ke2FjdGlvbk5hbWV9YCk7XG4gIH1cblxuICAvKipcbiAgICogTW9kdWxlIHdoaWNoIG1hbmFnZXMgcHJvY2VzcyBydWxlcyBhbmQgYXBwcm92YWwgcHJvY2Vzc2VzXG4gICAqL1xuICBwcm9jZXNzID0gbmV3IFByb2Nlc3ModGhpcyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IENv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