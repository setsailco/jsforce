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

exports.default = exports.Cli = void 0;

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/index-of"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/reduce"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys"));

require("core-js/modules/es.promise.js");

require("core-js/modules/es.array.iterator.js");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _http = _interopRequireDefault(require("http"));

var _url = _interopRequireDefault(require("url"));

var _crypto = _interopRequireDefault(require("crypto"));

var _open = _interopRequireDefault(require("open"));

var _commander = require("commander");

var _inquirer = _interopRequireDefault(require("inquirer"));

var _request = _interopRequireDefault(require("../request"));

var _base64url = _interopRequireDefault(require("base64url"));

var _repl = _interopRequireDefault(require("./repl"));

var _ = _interopRequireWildcard(require(".."));

var _VERSION = _interopRequireDefault(require("../VERSION"));

function _getRequireWildcardCache(nodeInterop) { if (typeof _WeakMap !== "function") return null; var cacheBabelInterop = new _WeakMap(); var cacheNodeInterop = new _WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = _Object$defineProperty && _Object$getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? _Object$getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { _Object$defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = _Object$keys2(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context2, _context3; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context2 = ownKeys(Object(source), !0)).call(_context2, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context3 = ownKeys(Object(source))).call(_context3, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

const registry = _.default.registry;

/**
 *
 */
class Cli {
  constructor() {
    (0, _defineProperty2.default)(this, "_repl", new _repl.default(this));
    (0, _defineProperty2.default)(this, "_conn", new _.Connection());
    (0, _defineProperty2.default)(this, "_connName", undefined);
    (0, _defineProperty2.default)(this, "_outputEnabled", true);
    (0, _defineProperty2.default)(this, "_defaultLoginUrl", undefined);
  }

  /**
   *
   */
  readCommand() {
    return new _commander.Command().option('-u, --username [username]', 'Salesforce username').option('-p, --password [password]', 'Salesforce password (and security token, if available)').option('-c, --connection [connection]', 'Connection name stored in connection registry').option('-l, --loginUrl [loginUrl]', 'Salesforce login url').option('--sandbox', 'Login to Salesforce sandbox').option('-e, --evalScript [evalScript]', 'Script to evaluate').version(_VERSION.default).parse(process.argv);
  }

  async start() {
    const program = this.readCommand();
    this._outputEnabled = !program.evalScript;

    try {
      await this.connect(program);

      if (program.evalScript) {
        this._repl.start({
          interactive: false,
          evalScript: program.evalScript
        });
      } else {
        this._repl.start();
      }
    } catch (err) {
      console.error(err);
      process.exit();
    }
  }

  getCurrentConnection() {
    return this._conn;
  }

  print(...args) {
    if (this._outputEnabled) {
      console.log(...args);
    }
  }

  saveCurrentConnection() {
    if (this._connName) {
      const conn = this._conn;
      const connName = this._connName;
      const connConfig = {
        oauth2: conn.oauth2 ? {
          clientId: conn.oauth2.clientId || undefined,
          clientSecret: conn.oauth2.clientSecret || undefined,
          redirectUri: conn.oauth2.redirectUri || undefined,
          loginUrl: conn.oauth2.loginUrl || undefined
        } : undefined,
        accessToken: conn.accessToken || undefined,
        instanceUrl: conn.instanceUrl || undefined,
        refreshToken: conn.refreshToken || undefined
      };
      registry.saveConnectionConfig(connName, connConfig);
    }
  }

  setLoginServer(loginServer) {
    if (!loginServer) {
      return;
    }

    if (loginServer === 'production') {
      this._defaultLoginUrl = 'https://login.salesforce.com';
    } else if (loginServer === 'sandbox') {
      this._defaultLoginUrl = 'https://test.salesforce.com';
    } else if ((0, _indexOf.default)(loginServer).call(loginServer, 'https://') !== 0) {
      this._defaultLoginUrl = 'https://' + loginServer;
    } else {
      this._defaultLoginUrl = loginServer;
    }

    this.print(`Using "${this._defaultLoginUrl}" as default login URL.`);
  }
  /**
   *
   */


  async connect(options) {
    const loginServer = options.loginUrl ? options.loginUrl : options.sandbox ? 'sandbox' : null;
    this.setLoginServer(loginServer);
    this._connName = options.connection;
    let connConfig = await registry.getConnectionConfig(options.connection);
    let username = options.username;

    if (!connConfig) {
      connConfig = {};

      if (this._defaultLoginUrl) {
        connConfig.loginUrl = this._defaultLoginUrl;
      }

      username = username || options.connection;
    }

    this._conn = new _.Connection(connConfig);
    const password = options.password;

    if (username) {
      await this.startPasswordAuth(username, password);
      this.saveCurrentConnection();
    } else {
      if (this._connName && this._conn.accessToken) {
        this._conn.on('refresh', () => {
          this.print('Refreshing access token ... ');
          this.saveCurrentConnection();
        });

        try {
          const identity = await this._conn.identity();
          this.print(`Logged in as : ${identity.username}`);
        } catch (err) {
          if (err instanceof Error) {
            this.print(err.message);
          }

          if (this._conn.oauth2) {
            throw new Error('Please re-authorize connection.');
          } else {
            await this.startPasswordAuth(this._connName);
          }
        }
      }
    }
  }
  /**
   *
   */


  async startPasswordAuth(username, password) {
    try {
      await this.loginByPassword(username, password, 2);
    } catch (err) {
      if (err instanceof Error && err.message === 'canceled') {
        console.error('Password authentication canceled: Not logged in');
      } else {
        throw err;
      }
    }
  }
  /**
   *
   */


  async loginByPassword(username, password, retryCount) {
    if (password === '') {
      throw new Error('canceled');
    }

    if (password == null) {
      const pass = await this.promptPassword('Password: ');
      return this.loginByPassword(username, pass, retryCount);
    }

    try {
      const result = await this._conn.login(username, password);
      this.print(`Logged in as : ${username}`);
      return result;
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }

      if (retryCount > 0) {
        return this.loginByPassword(username, undefined, retryCount - 1);
      } else {
        throw new Error('canceled');
      }
    }
  }
  /**
   *
   */


  disconnect(connName) {
    const name = connName || this._connName;

    if (name && registry.getConnectionConfig(name)) {
      registry.removeConnectionConfig(name);
      this.print(`Disconnect connection '${name}'`);
    }

    this._connName = undefined;
    this._conn = new _.Connection();
  }
  /**
   *
   */


  async authorize(clientName) {
    const name = clientName || 'default';
    var oauth2Config = await registry.getClientConfig(name);

    if (!oauth2Config || !oauth2Config.clientId) {
      if (name === 'default' || name === 'sandbox') {
        this.print('No client information registered. Downloading JSforce default client information...');
        return this.downloadDefaultClientInfo(name);
      }

      throw new Error(`No OAuth2 client information registered : '${name}'. Please register client info first.`);
    }

    const oauth2 = new _.OAuth2(oauth2Config);

    const verifier = _base64url.default.encode(_crypto.default.randomBytes(32));

    const challenge = _base64url.default.encode(_crypto.default.createHash('sha256').update(verifier).digest());

    const state = _base64url.default.encode(_crypto.default.randomBytes(32));

    const authzUrl = oauth2.getAuthorizationUrl({
      code_challenge: challenge,
      state
    });
    this.print('Opening authorization page in browser...');
    this.print(`URL: ${authzUrl}`);
    this.openUrl(authzUrl);
    const params = await this.waitCallback(oauth2Config.redirectUri, state);

    if (!params.code) {
      throw new Error('No authorization code returned.');
    }

    if (params.state !== state) {
      throw new Error('Invalid state parameter returned.');
    }

    this._conn = new _.Connection({
      oauth2
    });
    this.print('Received authorization code. Please close the opened browser window.');
    await this._conn.authorize(params.code, {
      code_verifier: verifier
    });
    this.print('Authorized. Fetching user info...');
    const identity = await this._conn.identity();
    this.print(`Logged in as : ${identity.username}`);
    this._connName = identity.username;
    this.saveCurrentConnection();
  }
  /**
   *
   */


  async downloadDefaultClientInfo(clientName) {
    const configUrl = 'https://jsforce.github.io/client-config/default.json';
    const res = await new _promise.default((resolve, reject) => {
      (0, _request.default)({
        method: 'GET',
        url: configUrl
      }).on('complete', resolve).on('error', reject);
    });
    const clientConfig = JSON.parse(res.body);

    if (clientName === 'sandbox') {
      clientConfig.loginUrl = 'https://test.salesforce.com';
    }

    await registry.registerClientConfig(clientName, clientConfig);
    this.print('Client information downloaded successfully.');
    return this.authorize(clientName);
  }

  async waitCallback(serverUrl, state) {
    if (serverUrl && (0, _indexOf.default)(serverUrl).call(serverUrl, 'http://localhost:') === 0) {
      return new _promise.default((resolve, reject) => {
        const server = _http.default.createServer((req, res) => {
          if (!req.url) {
            return;
          }

          const qparams = _url.default.parse(req.url, true).query;

          res.writeHead(200, {
            'Content-Type': 'text/html'
          });
          res.write('<html><script>location.href="about:blank";</script></html>');
          res.end();

          if (qparams.error) {
            reject(new Error(qparams.error));
          } else {
            resolve(qparams);
          }

          server.close();
          req.connection.end();
          req.connection.destroy();
        });

        const port = Number(_url.default.parse(serverUrl).port);
        server.listen(port, 'localhost');
      });
    } else {
      const code = await this.promptMessage('Copy & paste authz code passed in redirected URL: ');
      return {
        code: decodeURIComponent(code),
        state
      };
    }
  }
  /**
   *
   */


  async register(clientName, clientConfig) {
    var _context;

    const name = clientName || 'default';
    const prompts = {
      clientId: 'Input client ID : ',
      clientSecret: 'Input client secret (optional) : ',
      redirectUri: 'Input redirect URI : ',
      loginUrl: 'Input login URL (default is https://login.salesforce.com) : '
    };
    const registered = await registry.getClientConfig(name);

    if (registered) {
      const msg = `Client '${name}' is already registered. Are you sure you want to override ? [yN] : `;
      const ok = await this.promptConfirm(msg);

      if (!ok) {
        throw new Error('Registration canceled.');
      }
    }

    clientConfig = await (0, _reduce.default)(_context = (0, _keys.default)(prompts)).call(_context, async (promise, name) => {
      const cconfig = await promise;
      const promptName = name;
      const message = prompts[promptName];

      if (!cconfig[promptName]) {
        const value = await this.promptMessage(message);

        if (value) {
          return _objectSpread(_objectSpread({}, cconfig), {}, {
            [promptName]: value
          });
        }
      }

      return cconfig;
    }, _promise.default.resolve(clientConfig));
    await registry.registerClientConfig(name, clientConfig);
    this.print('Client registered successfully.');
  }
  /**
   *
   */


  async listConnections() {
    const names = await registry.getConnectionNames();

    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      this.print((name === this._connName ? '* ' : '  ') + name);
    }
  }
  /**
   *
   */


  async getConnectionNames() {
    return registry.getConnectionNames();
  }
  /**
   *
   */


  async getClientNames() {
    return registry.getClientNames();
  }
  /**
   *
   */


  async prompt(type, message) {
    this._repl.pause();

    const answer = await _inquirer.default.prompt([{
      type,
      name: 'value',
      message
    }]);

    this._repl.resume();

    return answer.value;
  }
  /**
   *
   */


  async promptMessage(message) {
    return this.prompt('input', message);
  }

  async promptPassword(message) {
    return this.prompt('password', message);
  }
  /**
   *
   */


  async promptConfirm(message) {
    return this.prompt('confirm', message);
  }
  /**
   *
   */


  openUrl(url) {
    (0, _open.default)(url);
  }
  /**
   *
   */


  openUrlUsingSession(url) {
    let frontdoorUrl = `${this._conn.instanceUrl}/secur/frontdoor.jsp?sid=${this._conn.accessToken}`;

    if (url) {
      frontdoorUrl += '&retURL=' + encodeURIComponent(url);
    }

    this.openUrl(frontdoorUrl);
  }

}
/* ------------------------------------------------------------------------- */


exports.Cli = Cli;
const cli = new Cli();
var _default = cli;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJyZWdpc3RyeSIsImpzZm9yY2UiLCJDbGkiLCJSZXBsIiwiQ29ubmVjdGlvbiIsInVuZGVmaW5lZCIsInJlYWRDb21tYW5kIiwiQ29tbWFuZCIsIm9wdGlvbiIsInZlcnNpb24iLCJwYXJzZSIsInByb2Nlc3MiLCJhcmd2Iiwic3RhcnQiLCJwcm9ncmFtIiwiX291dHB1dEVuYWJsZWQiLCJldmFsU2NyaXB0IiwiY29ubmVjdCIsIl9yZXBsIiwiaW50ZXJhY3RpdmUiLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJleGl0IiwiZ2V0Q3VycmVudENvbm5lY3Rpb24iLCJfY29ubiIsInByaW50IiwiYXJncyIsImxvZyIsInNhdmVDdXJyZW50Q29ubmVjdGlvbiIsIl9jb25uTmFtZSIsImNvbm4iLCJjb25uTmFtZSIsImNvbm5Db25maWciLCJvYXV0aDIiLCJjbGllbnRJZCIsImNsaWVudFNlY3JldCIsInJlZGlyZWN0VXJpIiwibG9naW5VcmwiLCJhY2Nlc3NUb2tlbiIsImluc3RhbmNlVXJsIiwicmVmcmVzaFRva2VuIiwic2F2ZUNvbm5lY3Rpb25Db25maWciLCJzZXRMb2dpblNlcnZlciIsImxvZ2luU2VydmVyIiwiX2RlZmF1bHRMb2dpblVybCIsIm9wdGlvbnMiLCJzYW5kYm94IiwiY29ubmVjdGlvbiIsImdldENvbm5lY3Rpb25Db25maWciLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwic3RhcnRQYXNzd29yZEF1dGgiLCJvbiIsImlkZW50aXR5IiwiRXJyb3IiLCJtZXNzYWdlIiwibG9naW5CeVBhc3N3b3JkIiwicmV0cnlDb3VudCIsInBhc3MiLCJwcm9tcHRQYXNzd29yZCIsInJlc3VsdCIsImxvZ2luIiwiZGlzY29ubmVjdCIsIm5hbWUiLCJyZW1vdmVDb25uZWN0aW9uQ29uZmlnIiwiYXV0aG9yaXplIiwiY2xpZW50TmFtZSIsIm9hdXRoMkNvbmZpZyIsImdldENsaWVudENvbmZpZyIsImRvd25sb2FkRGVmYXVsdENsaWVudEluZm8iLCJPQXV0aDIiLCJ2ZXJpZmllciIsImJhc2U2NHVybCIsImVuY29kZSIsImNyeXB0byIsInJhbmRvbUJ5dGVzIiwiY2hhbGxlbmdlIiwiY3JlYXRlSGFzaCIsInVwZGF0ZSIsImRpZ2VzdCIsInN0YXRlIiwiYXV0aHpVcmwiLCJnZXRBdXRob3JpemF0aW9uVXJsIiwiY29kZV9jaGFsbGVuZ2UiLCJvcGVuVXJsIiwicGFyYW1zIiwid2FpdENhbGxiYWNrIiwiY29kZSIsImNvZGVfdmVyaWZpZXIiLCJjb25maWdVcmwiLCJyZXMiLCJyZXNvbHZlIiwicmVqZWN0IiwicmVxdWVzdCIsIm1ldGhvZCIsInVybCIsImNsaWVudENvbmZpZyIsIkpTT04iLCJib2R5IiwicmVnaXN0ZXJDbGllbnRDb25maWciLCJzZXJ2ZXJVcmwiLCJzZXJ2ZXIiLCJodHRwIiwiY3JlYXRlU2VydmVyIiwicmVxIiwicXBhcmFtcyIsInF1ZXJ5Iiwid3JpdGVIZWFkIiwid3JpdGUiLCJlbmQiLCJjbG9zZSIsImRlc3Ryb3kiLCJwb3J0IiwiTnVtYmVyIiwibGlzdGVuIiwicHJvbXB0TWVzc2FnZSIsImRlY29kZVVSSUNvbXBvbmVudCIsInJlZ2lzdGVyIiwicHJvbXB0cyIsInJlZ2lzdGVyZWQiLCJtc2ciLCJvayIsInByb21wdENvbmZpcm0iLCJwcm9taXNlIiwiY2NvbmZpZyIsInByb21wdE5hbWUiLCJ2YWx1ZSIsImxpc3RDb25uZWN0aW9ucyIsIm5hbWVzIiwiZ2V0Q29ubmVjdGlvbk5hbWVzIiwiaSIsImxlbmd0aCIsImdldENsaWVudE5hbWVzIiwicHJvbXB0IiwidHlwZSIsInBhdXNlIiwiYW5zd2VyIiwiaW5xdWlyZXIiLCJyZXN1bWUiLCJvcGVuVXJsVXNpbmdTZXNzaW9uIiwiZnJvbnRkb29yVXJsIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiY2xpIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaS9jbGkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBDb21tYW5kIGxpbmUgaW50ZXJmYWNlIGZvciBKU2ZvcmNlXG4gKiBAYXV0aG9yIFNoaW5pY2hpIFRvbWl0YSA8c2hpbmljaGkudG9taXRhQGdtYWlsLmNvbT5cbiAqL1xuaW1wb3J0IGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgdXJsIGZyb20gJ3VybCc7XG5pbXBvcnQgY3J5cHRvIGZyb20gJ2NyeXB0byc7XG5pbXBvcnQgb3BlblVybCBmcm9tICdvcGVuJztcbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tICdjb21tYW5kZXInO1xuaW1wb3J0IGlucXVpcmVyIGZyb20gJ2lucXVpcmVyJztcbmltcG9ydCByZXF1ZXN0IGZyb20gJy4uL3JlcXVlc3QnO1xuaW1wb3J0IGJhc2U2NHVybCBmcm9tICdiYXNlNjR1cmwnO1xuaW1wb3J0IFJlcGwgZnJvbSAnLi9yZXBsJztcbmltcG9ydCBqc2ZvcmNlLCB7IENvbm5lY3Rpb24sIE9BdXRoMiB9IGZyb20gJy4uJztcbmltcG9ydCB2ZXJzaW9uIGZyb20gJy4uL1ZFUlNJT04nO1xuaW1wb3J0IHsgT3B0aW9uYWwgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBDbGllbnRDb25maWcgfSBmcm9tICcuLi9yZWdpc3RyeS90eXBlcyc7XG5cbmNvbnN0IHJlZ2lzdHJ5ID0ganNmb3JjZS5yZWdpc3RyeTtcblxuaW50ZXJmYWNlIENsaUNvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcbiAgY29ubmVjdGlvbj86IHN0cmluZztcbiAgdXNlcm5hbWU/OiBzdHJpbmc7XG4gIHBhc3N3b3JkPzogc3RyaW5nO1xuICBsb2dpblVybD86IHN0cmluZztcbiAgc2FuZGJveD86IGJvb2xlYW47XG4gIGV2YWxTY3JpcHQ/OiBzdHJpbmc7XG59XG5cbi8qKlxuICpcbiAqL1xuZXhwb3J0IGNsYXNzIENsaSB7XG4gIF9yZXBsOiBSZXBsID0gbmV3IFJlcGwodGhpcyk7XG4gIF9jb25uOiBDb25uZWN0aW9uID0gbmV3IENvbm5lY3Rpb24oKTtcbiAgX2Nvbm5OYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIF9vdXRwdXRFbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcbiAgX2RlZmF1bHRMb2dpblVybDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgcmVhZENvbW1hbmQoKTogQ2xpQ29tbWFuZCB7XG4gICAgcmV0dXJuIG5ldyBDb21tYW5kKClcbiAgICAgIC5vcHRpb24oJy11LCAtLXVzZXJuYW1lIFt1c2VybmFtZV0nLCAnU2FsZXNmb3JjZSB1c2VybmFtZScpXG4gICAgICAub3B0aW9uKFxuICAgICAgICAnLXAsIC0tcGFzc3dvcmQgW3Bhc3N3b3JkXScsXG4gICAgICAgICdTYWxlc2ZvcmNlIHBhc3N3b3JkIChhbmQgc2VjdXJpdHkgdG9rZW4sIGlmIGF2YWlsYWJsZSknLFxuICAgICAgKVxuICAgICAgLm9wdGlvbihcbiAgICAgICAgJy1jLCAtLWNvbm5lY3Rpb24gW2Nvbm5lY3Rpb25dJyxcbiAgICAgICAgJ0Nvbm5lY3Rpb24gbmFtZSBzdG9yZWQgaW4gY29ubmVjdGlvbiByZWdpc3RyeScsXG4gICAgICApXG4gICAgICAub3B0aW9uKCctbCwgLS1sb2dpblVybCBbbG9naW5VcmxdJywgJ1NhbGVzZm9yY2UgbG9naW4gdXJsJylcbiAgICAgIC5vcHRpb24oJy0tc2FuZGJveCcsICdMb2dpbiB0byBTYWxlc2ZvcmNlIHNhbmRib3gnKVxuICAgICAgLm9wdGlvbignLWUsIC0tZXZhbFNjcmlwdCBbZXZhbFNjcmlwdF0nLCAnU2NyaXB0IHRvIGV2YWx1YXRlJylcbiAgICAgIC52ZXJzaW9uKHZlcnNpb24pXG4gICAgICAucGFyc2UocHJvY2Vzcy5hcmd2KTtcbiAgfVxuXG4gIGFzeW5jIHN0YXJ0KCkge1xuICAgIGNvbnN0IHByb2dyYW0gPSB0aGlzLnJlYWRDb21tYW5kKCk7XG4gICAgdGhpcy5fb3V0cHV0RW5hYmxlZCA9ICFwcm9ncmFtLmV2YWxTY3JpcHQ7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuY29ubmVjdChwcm9ncmFtKTtcbiAgICAgIGlmIChwcm9ncmFtLmV2YWxTY3JpcHQpIHtcbiAgICAgICAgdGhpcy5fcmVwbC5zdGFydCh7XG4gICAgICAgICAgaW50ZXJhY3RpdmU6IGZhbHNlLFxuICAgICAgICAgIGV2YWxTY3JpcHQ6IHByb2dyYW0uZXZhbFNjcmlwdCxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9yZXBsLnN0YXJ0KCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICBwcm9jZXNzLmV4aXQoKTtcbiAgICB9XG4gIH1cblxuICBnZXRDdXJyZW50Q29ubmVjdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubjtcbiAgfVxuXG4gIHByaW50KC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgaWYgKHRoaXMuX291dHB1dEVuYWJsZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHNhdmVDdXJyZW50Q29ubmVjdGlvbigpIHtcbiAgICBpZiAodGhpcy5fY29ubk5hbWUpIHtcbiAgICAgIGNvbnN0IGNvbm4gPSB0aGlzLl9jb25uO1xuICAgICAgY29uc3QgY29ubk5hbWUgPSB0aGlzLl9jb25uTmFtZTtcbiAgICAgIGNvbnN0IGNvbm5Db25maWcgPSB7XG4gICAgICAgIG9hdXRoMjogY29ubi5vYXV0aDJcbiAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgY2xpZW50SWQ6IGNvbm4ub2F1dGgyLmNsaWVudElkIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgY2xpZW50U2VjcmV0OiBjb25uLm9hdXRoMi5jbGllbnRTZWNyZXQgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICByZWRpcmVjdFVyaTogY29ubi5vYXV0aDIucmVkaXJlY3RVcmkgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICBsb2dpblVybDogY29ubi5vYXV0aDIubG9naW5VcmwgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICBhY2Nlc3NUb2tlbjogY29ubi5hY2Nlc3NUb2tlbiB8fCB1bmRlZmluZWQsXG4gICAgICAgIGluc3RhbmNlVXJsOiBjb25uLmluc3RhbmNlVXJsIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgcmVmcmVzaFRva2VuOiBjb25uLnJlZnJlc2hUb2tlbiB8fCB1bmRlZmluZWQsXG4gICAgICB9O1xuICAgICAgcmVnaXN0cnkuc2F2ZUNvbm5lY3Rpb25Db25maWcoY29ubk5hbWUsIGNvbm5Db25maWcpO1xuICAgIH1cbiAgfVxuXG4gIHNldExvZ2luU2VydmVyKGxvZ2luU2VydmVyOiBPcHRpb25hbDxzdHJpbmc+KSB7XG4gICAgaWYgKCFsb2dpblNlcnZlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAobG9naW5TZXJ2ZXIgPT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgdGhpcy5fZGVmYXVsdExvZ2luVXJsID0gJ2h0dHBzOi8vbG9naW4uc2FsZXNmb3JjZS5jb20nO1xuICAgIH0gZWxzZSBpZiAobG9naW5TZXJ2ZXIgPT09ICdzYW5kYm94Jykge1xuICAgICAgdGhpcy5fZGVmYXVsdExvZ2luVXJsID0gJ2h0dHBzOi8vdGVzdC5zYWxlc2ZvcmNlLmNvbSc7XG4gICAgfSBlbHNlIGlmIChsb2dpblNlcnZlci5pbmRleE9mKCdodHRwczovLycpICE9PSAwKSB7XG4gICAgICB0aGlzLl9kZWZhdWx0TG9naW5VcmwgPSAnaHR0cHM6Ly8nICsgbG9naW5TZXJ2ZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2RlZmF1bHRMb2dpblVybCA9IGxvZ2luU2VydmVyO1xuICAgIH1cbiAgICB0aGlzLnByaW50KGBVc2luZyBcIiR7dGhpcy5fZGVmYXVsdExvZ2luVXJsfVwiIGFzIGRlZmF1bHQgbG9naW4gVVJMLmApO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBhc3luYyBjb25uZWN0KG9wdGlvbnM6IHtcbiAgICB1c2VybmFtZT86IHN0cmluZztcbiAgICBwYXNzd29yZD86IHN0cmluZztcbiAgICBjb25uZWN0aW9uPzogc3RyaW5nO1xuICAgIGxvZ2luVXJsPzogc3RyaW5nO1xuICAgIHNhbmRib3g/OiBib29sZWFuO1xuICB9KSB7XG4gICAgY29uc3QgbG9naW5TZXJ2ZXIgPSBvcHRpb25zLmxvZ2luVXJsXG4gICAgICA/IG9wdGlvbnMubG9naW5VcmxcbiAgICAgIDogb3B0aW9ucy5zYW5kYm94XG4gICAgICA/ICdzYW5kYm94J1xuICAgICAgOiBudWxsO1xuICAgIHRoaXMuc2V0TG9naW5TZXJ2ZXIobG9naW5TZXJ2ZXIpO1xuICAgIHRoaXMuX2Nvbm5OYW1lID0gb3B0aW9ucy5jb25uZWN0aW9uO1xuICAgIGxldCBjb25uQ29uZmlnID0gYXdhaXQgcmVnaXN0cnkuZ2V0Q29ubmVjdGlvbkNvbmZpZyhvcHRpb25zLmNvbm5lY3Rpb24pO1xuICAgIGxldCB1c2VybmFtZSA9IG9wdGlvbnMudXNlcm5hbWU7XG4gICAgaWYgKCFjb25uQ29uZmlnKSB7XG4gICAgICBjb25uQ29uZmlnID0ge307XG4gICAgICBpZiAodGhpcy5fZGVmYXVsdExvZ2luVXJsKSB7XG4gICAgICAgIGNvbm5Db25maWcubG9naW5VcmwgPSB0aGlzLl9kZWZhdWx0TG9naW5Vcmw7XG4gICAgICB9XG4gICAgICB1c2VybmFtZSA9IHVzZXJuYW1lIHx8IG9wdGlvbnMuY29ubmVjdGlvbjtcbiAgICB9XG4gICAgdGhpcy5fY29ubiA9IG5ldyBDb25uZWN0aW9uKGNvbm5Db25maWcpO1xuICAgIGNvbnN0IHBhc3N3b3JkID0gb3B0aW9ucy5wYXNzd29yZDtcbiAgICBpZiAodXNlcm5hbWUpIHtcbiAgICAgIGF3YWl0IHRoaXMuc3RhcnRQYXNzd29yZEF1dGgodXNlcm5hbWUsIHBhc3N3b3JkKTtcbiAgICAgIHRoaXMuc2F2ZUN1cnJlbnRDb25uZWN0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl9jb25uTmFtZSAmJiB0aGlzLl9jb25uLmFjY2Vzc1Rva2VuKSB7XG4gICAgICAgIHRoaXMuX2Nvbm4ub24oJ3JlZnJlc2gnLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5wcmludCgnUmVmcmVzaGluZyBhY2Nlc3MgdG9rZW4gLi4uICcpO1xuICAgICAgICAgIHRoaXMuc2F2ZUN1cnJlbnRDb25uZWN0aW9uKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGlkZW50aXR5ID0gYXdhaXQgdGhpcy5fY29ubi5pZGVudGl0eSgpO1xuICAgICAgICAgIHRoaXMucHJpbnQoYExvZ2dlZCBpbiBhcyA6ICR7aWRlbnRpdHkudXNlcm5hbWV9YCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgdGhpcy5wcmludChlcnIubWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLl9jb25uLm9hdXRoMikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbGVhc2UgcmUtYXV0aG9yaXplIGNvbm5lY3Rpb24uJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc3RhcnRQYXNzd29yZEF1dGgodGhpcy5fY29ubk5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgYXN5bmMgc3RhcnRQYXNzd29yZEF1dGgodXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ/OiBzdHJpbmcpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5sb2dpbkJ5UGFzc3dvcmQodXNlcm5hbWUsIHBhc3N3b3JkLCAyKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnIubWVzc2FnZSA9PT0gJ2NhbmNlbGVkJykge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdQYXNzd29yZCBhdXRoZW50aWNhdGlvbiBjYW5jZWxlZDogTm90IGxvZ2dlZCBpbicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgYXN5bmMgbG9naW5CeVBhc3N3b3JkKFxuICAgIHVzZXJuYW1lOiBzdHJpbmcsXG4gICAgcGFzc3dvcmQ6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICByZXRyeUNvdW50OiBudW1iZXIsXG4gICk6IFByb21pc2U8eyBpZDogc3RyaW5nIH0+IHtcbiAgICBpZiAocGFzc3dvcmQgPT09ICcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NhbmNlbGVkJyk7XG4gICAgfVxuICAgIGlmIChwYXNzd29yZCA9PSBudWxsKSB7XG4gICAgICBjb25zdCBwYXNzID0gYXdhaXQgdGhpcy5wcm9tcHRQYXNzd29yZCgnUGFzc3dvcmQ6ICcpO1xuICAgICAgcmV0dXJuIHRoaXMubG9naW5CeVBhc3N3b3JkKHVzZXJuYW1lLCBwYXNzLCByZXRyeUNvdW50KTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2Nvbm4ubG9naW4odXNlcm5hbWUsIHBhc3N3b3JkKTtcbiAgICAgIHRoaXMucHJpbnQoYExvZ2dlZCBpbiBhcyA6ICR7dXNlcm5hbWV9YCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyLm1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgaWYgKHJldHJ5Q291bnQgPiAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvZ2luQnlQYXNzd29yZCh1c2VybmFtZSwgdW5kZWZpbmVkLCByZXRyeUNvdW50IC0gMSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NhbmNlbGVkJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBkaXNjb25uZWN0KGNvbm5OYW1lPzogc3RyaW5nKSB7XG4gICAgY29uc3QgbmFtZSA9IGNvbm5OYW1lIHx8IHRoaXMuX2Nvbm5OYW1lO1xuICAgIGlmIChuYW1lICYmIHJlZ2lzdHJ5LmdldENvbm5lY3Rpb25Db25maWcobmFtZSkpIHtcbiAgICAgIHJlZ2lzdHJ5LnJlbW92ZUNvbm5lY3Rpb25Db25maWcobmFtZSk7XG4gICAgICB0aGlzLnByaW50KGBEaXNjb25uZWN0IGNvbm5lY3Rpb24gJyR7bmFtZX0nYCk7XG4gICAgfVxuICAgIHRoaXMuX2Nvbm5OYW1lID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2Nvbm4gPSBuZXcgQ29ubmVjdGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBhc3luYyBhdXRob3JpemUoY2xpZW50TmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgbmFtZSA9IGNsaWVudE5hbWUgfHwgJ2RlZmF1bHQnO1xuICAgIHZhciBvYXV0aDJDb25maWcgPSBhd2FpdCByZWdpc3RyeS5nZXRDbGllbnRDb25maWcobmFtZSk7XG4gICAgaWYgKCFvYXV0aDJDb25maWcgfHwgIW9hdXRoMkNvbmZpZy5jbGllbnRJZCkge1xuICAgICAgaWYgKG5hbWUgPT09ICdkZWZhdWx0JyB8fCBuYW1lID09PSAnc2FuZGJveCcpIHtcbiAgICAgICAgdGhpcy5wcmludChcbiAgICAgICAgICAnTm8gY2xpZW50IGluZm9ybWF0aW9uIHJlZ2lzdGVyZWQuIERvd25sb2FkaW5nIEpTZm9yY2UgZGVmYXVsdCBjbGllbnQgaW5mb3JtYXRpb24uLi4nLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gdGhpcy5kb3dubG9hZERlZmF1bHRDbGllbnRJbmZvKG5hbWUpO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgTm8gT0F1dGgyIGNsaWVudCBpbmZvcm1hdGlvbiByZWdpc3RlcmVkIDogJyR7bmFtZX0nLiBQbGVhc2UgcmVnaXN0ZXIgY2xpZW50IGluZm8gZmlyc3QuYCxcbiAgICAgICk7XG4gICAgfVxuICAgIGNvbnN0IG9hdXRoMiA9IG5ldyBPQXV0aDIob2F1dGgyQ29uZmlnKTtcbiAgICBjb25zdCB2ZXJpZmllciA9IGJhc2U2NHVybC5lbmNvZGUoY3J5cHRvLnJhbmRvbUJ5dGVzKDMyKSk7XG4gICAgY29uc3QgY2hhbGxlbmdlID0gYmFzZTY0dXJsLmVuY29kZShcbiAgICAgIGNyeXB0by5jcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUodmVyaWZpZXIpLmRpZ2VzdCgpLFxuICAgICk7XG4gICAgY29uc3Qgc3RhdGUgPSBiYXNlNjR1cmwuZW5jb2RlKGNyeXB0by5yYW5kb21CeXRlcygzMikpO1xuICAgIGNvbnN0IGF1dGh6VXJsID0gb2F1dGgyLmdldEF1dGhvcml6YXRpb25Vcmwoe1xuICAgICAgY29kZV9jaGFsbGVuZ2U6IGNoYWxsZW5nZSxcbiAgICAgIHN0YXRlLFxuICAgIH0pO1xuICAgIHRoaXMucHJpbnQoJ09wZW5pbmcgYXV0aG9yaXphdGlvbiBwYWdlIGluIGJyb3dzZXIuLi4nKTtcbiAgICB0aGlzLnByaW50KGBVUkw6ICR7YXV0aHpVcmx9YCk7XG4gICAgdGhpcy5vcGVuVXJsKGF1dGh6VXJsKTtcbiAgICBjb25zdCBwYXJhbXMgPSBhd2FpdCB0aGlzLndhaXRDYWxsYmFjayhvYXV0aDJDb25maWcucmVkaXJlY3RVcmksIHN0YXRlKTtcbiAgICBpZiAoIXBhcmFtcy5jb2RlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGF1dGhvcml6YXRpb24gY29kZSByZXR1cm5lZC4nKTtcbiAgICB9XG4gICAgaWYgKHBhcmFtcy5zdGF0ZSAhPT0gc3RhdGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdGF0ZSBwYXJhbWV0ZXIgcmV0dXJuZWQuJyk7XG4gICAgfVxuICAgIHRoaXMuX2Nvbm4gPSBuZXcgQ29ubmVjdGlvbih7IG9hdXRoMiB9KTtcbiAgICB0aGlzLnByaW50KFxuICAgICAgJ1JlY2VpdmVkIGF1dGhvcml6YXRpb24gY29kZS4gUGxlYXNlIGNsb3NlIHRoZSBvcGVuZWQgYnJvd3NlciB3aW5kb3cuJyxcbiAgICApO1xuICAgIGF3YWl0IHRoaXMuX2Nvbm4uYXV0aG9yaXplKHBhcmFtcy5jb2RlLCB7IGNvZGVfdmVyaWZpZXI6IHZlcmlmaWVyIH0pO1xuICAgIHRoaXMucHJpbnQoJ0F1dGhvcml6ZWQuIEZldGNoaW5nIHVzZXIgaW5mby4uLicpO1xuICAgIGNvbnN0IGlkZW50aXR5ID0gYXdhaXQgdGhpcy5fY29ubi5pZGVudGl0eSgpO1xuICAgIHRoaXMucHJpbnQoYExvZ2dlZCBpbiBhcyA6ICR7aWRlbnRpdHkudXNlcm5hbWV9YCk7XG4gICAgdGhpcy5fY29ubk5hbWUgPSBpZGVudGl0eS51c2VybmFtZTtcbiAgICB0aGlzLnNhdmVDdXJyZW50Q29ubmVjdGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBhc3luYyBkb3dubG9hZERlZmF1bHRDbGllbnRJbmZvKGNsaWVudE5hbWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNvbmZpZ1VybCA9ICdodHRwczovL2pzZm9yY2UuZ2l0aHViLmlvL2NsaWVudC1jb25maWcvZGVmYXVsdC5qc29uJztcbiAgICBjb25zdCByZXM6IHsgYm9keTogc3RyaW5nIH0gPSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICByZXF1ZXN0KHsgbWV0aG9kOiAnR0VUJywgdXJsOiBjb25maWdVcmwgfSlcbiAgICAgICAgLm9uKCdjb21wbGV0ZScsIHJlc29sdmUpXG4gICAgICAgIC5vbignZXJyb3InLCByZWplY3QpO1xuICAgIH0pO1xuICAgIGNvbnN0IGNsaWVudENvbmZpZyA9IEpTT04ucGFyc2UocmVzLmJvZHkpO1xuICAgIGlmIChjbGllbnROYW1lID09PSAnc2FuZGJveCcpIHtcbiAgICAgIGNsaWVudENvbmZpZy5sb2dpblVybCA9ICdodHRwczovL3Rlc3Quc2FsZXNmb3JjZS5jb20nO1xuICAgIH1cbiAgICBhd2FpdCByZWdpc3RyeS5yZWdpc3RlckNsaWVudENvbmZpZyhjbGllbnROYW1lLCBjbGllbnRDb25maWcpO1xuICAgIHRoaXMucHJpbnQoJ0NsaWVudCBpbmZvcm1hdGlvbiBkb3dubG9hZGVkIHN1Y2Nlc3NmdWxseS4nKTtcbiAgICByZXR1cm4gdGhpcy5hdXRob3JpemUoY2xpZW50TmFtZSk7XG4gIH1cblxuICBhc3luYyB3YWl0Q2FsbGJhY2soXG4gICAgc2VydmVyVXJsOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgc3RhdGU6IHN0cmluZyxcbiAgKTogUHJvbWlzZTx7IGNvZGU6IHN0cmluZzsgc3RhdGU6IHN0cmluZyB9PiB7XG4gICAgaWYgKHNlcnZlclVybCAmJiBzZXJ2ZXJVcmwuaW5kZXhPZignaHR0cDovL2xvY2FsaG9zdDonKSA9PT0gMCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3Qgc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIoKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgaWYgKCFyZXEudXJsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHFwYXJhbXMgPSB1cmwucGFyc2UocmVxLnVybCwgdHJ1ZSkucXVlcnk7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIHsgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L2h0bWwnIH0pO1xuICAgICAgICAgIHJlcy53cml0ZShcbiAgICAgICAgICAgICc8aHRtbD48c2NyaXB0PmxvY2F0aW9uLmhyZWY9XCJhYm91dDpibGFua1wiOzwvc2NyaXB0PjwvaHRtbD4nLFxuICAgICAgICAgICk7XG4gICAgICAgICAgcmVzLmVuZCgpO1xuICAgICAgICAgIGlmIChxcGFyYW1zLmVycm9yKSB7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKHFwYXJhbXMuZXJyb3IgYXMgc3RyaW5nKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc29sdmUocXBhcmFtcyBhcyB7IGNvZGU6IHN0cmluZzsgc3RhdGU6IHN0cmluZyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2VydmVyLmNsb3NlKCk7XG4gICAgICAgICAgcmVxLmNvbm5lY3Rpb24uZW5kKCk7XG4gICAgICAgICAgcmVxLmNvbm5lY3Rpb24uZGVzdHJveSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcG9ydCA9IE51bWJlcih1cmwucGFyc2Uoc2VydmVyVXJsKS5wb3J0KTtcbiAgICAgICAgc2VydmVyLmxpc3Rlbihwb3J0LCAnbG9jYWxob3N0Jyk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY29kZSA9IGF3YWl0IHRoaXMucHJvbXB0TWVzc2FnZShcbiAgICAgICAgJ0NvcHkgJiBwYXN0ZSBhdXRoeiBjb2RlIHBhc3NlZCBpbiByZWRpcmVjdGVkIFVSTDogJyxcbiAgICAgICk7XG4gICAgICByZXR1cm4geyBjb2RlOiBkZWNvZGVVUklDb21wb25lbnQoY29kZSksIHN0YXRlIH07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBhc3luYyByZWdpc3RlcihjbGllbnROYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQsIGNsaWVudENvbmZpZzogQ2xpZW50Q29uZmlnKSB7XG4gICAgY29uc3QgbmFtZSA9IGNsaWVudE5hbWUgfHwgJ2RlZmF1bHQnO1xuICAgIGNvbnN0IHByb21wdHMgPSB7XG4gICAgICBjbGllbnRJZDogJ0lucHV0IGNsaWVudCBJRCA6ICcsXG4gICAgICBjbGllbnRTZWNyZXQ6ICdJbnB1dCBjbGllbnQgc2VjcmV0IChvcHRpb25hbCkgOiAnLFxuICAgICAgcmVkaXJlY3RVcmk6ICdJbnB1dCByZWRpcmVjdCBVUkkgOiAnLFxuICAgICAgbG9naW5Vcmw6ICdJbnB1dCBsb2dpbiBVUkwgKGRlZmF1bHQgaXMgaHR0cHM6Ly9sb2dpbi5zYWxlc2ZvcmNlLmNvbSkgOiAnLFxuICAgIH07XG4gICAgY29uc3QgcmVnaXN0ZXJlZCA9IGF3YWl0IHJlZ2lzdHJ5LmdldENsaWVudENvbmZpZyhuYW1lKTtcbiAgICBpZiAocmVnaXN0ZXJlZCkge1xuICAgICAgY29uc3QgbXNnID0gYENsaWVudCAnJHtuYW1lfScgaXMgYWxyZWFkeSByZWdpc3RlcmVkLiBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gb3ZlcnJpZGUgPyBbeU5dIDogYDtcbiAgICAgIGNvbnN0IG9rID0gYXdhaXQgdGhpcy5wcm9tcHRDb25maXJtKG1zZyk7XG4gICAgICBpZiAoIW9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUmVnaXN0cmF0aW9uIGNhbmNlbGVkLicpO1xuICAgICAgfVxuICAgIH1cbiAgICBjbGllbnRDb25maWcgPSBhd2FpdCBPYmplY3Qua2V5cyhwcm9tcHRzKS5yZWR1Y2UoYXN5bmMgKHByb21pc2UsIG5hbWUpID0+IHtcbiAgICAgIGNvbnN0IGNjb25maWcgPSBhd2FpdCBwcm9taXNlO1xuICAgICAgY29uc3QgcHJvbXB0TmFtZSA9IG5hbWUgYXMga2V5b2YgdHlwZW9mIHByb21wdHM7XG4gICAgICBjb25zdCBtZXNzYWdlID0gcHJvbXB0c1twcm9tcHROYW1lXTtcbiAgICAgIGlmICghY2NvbmZpZ1twcm9tcHROYW1lXSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGF3YWl0IHRoaXMucHJvbXB0TWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLmNjb25maWcsXG4gICAgICAgICAgICBbcHJvbXB0TmFtZV06IHZhbHVlLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjY29uZmlnO1xuICAgIH0sIFByb21pc2UucmVzb2x2ZShjbGllbnRDb25maWcpKTtcbiAgICBhd2FpdCByZWdpc3RyeS5yZWdpc3RlckNsaWVudENvbmZpZyhuYW1lLCBjbGllbnRDb25maWcpO1xuICAgIHRoaXMucHJpbnQoJ0NsaWVudCByZWdpc3RlcmVkIHN1Y2Nlc3NmdWxseS4nKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgYXN5bmMgbGlzdENvbm5lY3Rpb25zKCkge1xuICAgIGNvbnN0IG5hbWVzID0gYXdhaXQgcmVnaXN0cnkuZ2V0Q29ubmVjdGlvbk5hbWVzKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIG5hbWUgPSBuYW1lc1tpXTtcbiAgICAgIHRoaXMucHJpbnQoKG5hbWUgPT09IHRoaXMuX2Nvbm5OYW1lID8gJyogJyA6ICcgICcpICsgbmFtZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBhc3luYyBnZXRDb25uZWN0aW9uTmFtZXMoKSB7XG4gICAgcmV0dXJuIHJlZ2lzdHJ5LmdldENvbm5lY3Rpb25OYW1lcygpO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBhc3luYyBnZXRDbGllbnROYW1lcygpIHtcbiAgICByZXR1cm4gcmVnaXN0cnkuZ2V0Q2xpZW50TmFtZXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgYXN5bmMgcHJvbXB0KHR5cGU6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fcmVwbC5wYXVzZSgpO1xuICAgIGNvbnN0IGFuc3dlcjogeyB2YWx1ZTogc3RyaW5nIH0gPSBhd2FpdCBpbnF1aXJlci5wcm9tcHQoW1xuICAgICAge1xuICAgICAgICB0eXBlLFxuICAgICAgICBuYW1lOiAndmFsdWUnLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgfSxcbiAgICBdKTtcbiAgICB0aGlzLl9yZXBsLnJlc3VtZSgpO1xuICAgIHJldHVybiBhbnN3ZXIudmFsdWU7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICovXG4gIGFzeW5jIHByb21wdE1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvbXB0KCdpbnB1dCcsIG1lc3NhZ2UpO1xuICB9XG5cbiAgYXN5bmMgcHJvbXB0UGFzc3dvcmQobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvbXB0KCdwYXNzd29yZCcsIG1lc3NhZ2UpO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBhc3luYyBwcm9tcHRDb25maXJtKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLnByb21wdCgnY29uZmlybScsIG1lc3NhZ2UpO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBvcGVuVXJsKHVybDogc3RyaW5nKSB7XG4gICAgb3BlblVybCh1cmwpO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBvcGVuVXJsVXNpbmdTZXNzaW9uKHVybD86IHN0cmluZykge1xuICAgIGxldCBmcm9udGRvb3JVcmwgPSBgJHt0aGlzLl9jb25uLmluc3RhbmNlVXJsfS9zZWN1ci9mcm9udGRvb3IuanNwP3NpZD0ke3RoaXMuX2Nvbm4uYWNjZXNzVG9rZW59YDtcbiAgICBpZiAodXJsKSB7XG4gICAgICBmcm9udGRvb3JVcmwgKz0gJyZyZXRVUkw9JyArIGVuY29kZVVSSUNvbXBvbmVudCh1cmwpO1xuICAgIH1cbiAgICB0aGlzLm9wZW5VcmwoZnJvbnRkb29yVXJsKTtcbiAgfVxufVxuXG4vKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbmNvbnN0IGNsaSA9IG5ldyBDbGkoKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xpO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJQTs7QUFDQTs7QUFDQTs7QUFD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