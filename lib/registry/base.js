"use strict";

var _Object$keys2 = require("@babel/runtime-corejs3/core-js-stable/object/keys");

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

exports.BaseRegistry = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectWithoutProperties"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys"));

require("core-js/modules/es.promise.js");

require("core-js/modules/es.array.iterator.js");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _connection = _interopRequireDefault(require("../connection"));

const _excluded = ["client"],
      _excluded2 = ["oauth2"];

function ownKeys(object, enumerableOnly) { var keys = _Object$keys2(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context, _context2; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context = ownKeys(Object(source), !0)).call(_context, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context2 = ownKeys(Object(source))).call(_context2, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 *
 */
class BaseRegistry {
  constructor() {
    (0, _defineProperty2.default)(this, "_registryConfig", {});
  }

  _saveConfig() {
    throw new Error('_saveConfig must be implemented in subclass');
  }

  _getClients() {
    return this._registryConfig.clients || (this._registryConfig.clients = {});
  }

  _getConnections() {
    return this._registryConfig.connections || (this._registryConfig.connections = {});
  }

  async getConnectionNames() {
    return (0, _keys.default)(this._getConnections());
  }

  async getConnection(name) {
    const config = await this.getConnectionConfig(name);
    return config ? new _connection.default(config) : null;
  }

  async getConnectionConfig(name) {
    if (!name) {
      name = this._registryConfig['default'];
    }

    const connections = this._getConnections();

    const connConfig = name ? connections[name] : undefined;

    if (!connConfig) {
      return null;
    }

    const {
      client
    } = connConfig,
          connConfig_ = (0, _objectWithoutProperties2.default)(connConfig, _excluded);

    if (client) {
      return _objectSpread(_objectSpread({}, connConfig_), {}, {
        oauth2: _objectSpread({}, await this.getClientConfig(client))
      });
    }

    return connConfig_;
  }

  async saveConnectionConfig(name, connConfig) {
    const connections = this._getConnections();

    const {
      oauth2
    } = connConfig,
          connConfig_ = (0, _objectWithoutProperties2.default)(connConfig, _excluded2);
    let persistConnConfig = connConfig_;

    if (oauth2) {
      const clientName = this._findClientName(oauth2);

      if (clientName) {
        persistConnConfig = _objectSpread(_objectSpread({}, persistConnConfig), {}, {
          client: clientName
        });
      }

      delete connConfig.oauth2;
    }

    connections[name] = persistConnConfig;

    this._saveConfig();
  }

  _findClientName({
    clientId,
    loginUrl
  }) {
    const clients = this._getClients();

    for (const name of (0, _keys.default)(clients)) {
      const client = clients[name];

      if (client.clientId === clientId && (client.loginUrl || 'https://login.salesforce.com') === loginUrl) {
        return name;
      }
    }

    return null;
  }

  async setDefaultConnection(name) {
    this._registryConfig['default'] = name;

    this._saveConfig();
  }

  async removeConnectionConfig(name) {
    const connections = this._getConnections();

    delete connections[name];

    this._saveConfig();
  }

  async getClientConfig(name) {
    const clients = this._getClients();

    const clientConfig = clients[name];
    return clientConfig && _objectSpread({}, clientConfig);
  }

  async getClientNames() {
    return (0, _keys.default)(this._getClients());
  }

  async registerClientConfig(name, clientConfig) {
    const clients = this._getClients();

    clients[name] = clientConfig;

    this._saveConfig();
  }

}

exports.BaseRegistry = BaseRegistry;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCYXNlUmVnaXN0cnkiLCJfc2F2ZUNvbmZpZyIsIkVycm9yIiwiX2dldENsaWVudHMiLCJfcmVnaXN0cnlDb25maWciLCJjbGllbnRzIiwiX2dldENvbm5lY3Rpb25zIiwiY29ubmVjdGlvbnMiLCJnZXRDb25uZWN0aW9uTmFtZXMiLCJnZXRDb25uZWN0aW9uIiwibmFtZSIsImNvbmZpZyIsImdldENvbm5lY3Rpb25Db25maWciLCJDb25uZWN0aW9uIiwiY29ubkNvbmZpZyIsInVuZGVmaW5lZCIsImNsaWVudCIsImNvbm5Db25maWdfIiwib2F1dGgyIiwiZ2V0Q2xpZW50Q29uZmlnIiwic2F2ZUNvbm5lY3Rpb25Db25maWciLCJwZXJzaXN0Q29ubkNvbmZpZyIsImNsaWVudE5hbWUiLCJfZmluZENsaWVudE5hbWUiLCJjbGllbnRJZCIsImxvZ2luVXJsIiwic2V0RGVmYXVsdENvbm5lY3Rpb24iLCJyZW1vdmVDb25uZWN0aW9uQ29uZmlnIiwiY2xpZW50Q29uZmlnIiwiZ2V0Q2xpZW50TmFtZXMiLCJyZWdpc3RlckNsaWVudENvbmZpZyJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZWdpc3RyeS9iYXNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb25uZWN0aW9uIGZyb20gJy4uL2Nvbm5lY3Rpb24nO1xuaW1wb3J0IHtcbiAgUmVnaXN0cnlDb25maWcsXG4gIFJlZ2lzdHJ5LFxuICBDb25uZWN0aW9uQ29uZmlnLFxuICBQZXJzaXN0Q29ubmVjdGlvbkNvbmZpZyxcbiAgQ2xpZW50Q29uZmlnLFxufSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IFNjaGVtYSB9IGZyb20gJy4uL3R5cGVzJztcblxuLyoqXG4gKlxuICovXG5leHBvcnQgY2xhc3MgQmFzZVJlZ2lzdHJ5IGltcGxlbWVudHMgUmVnaXN0cnkge1xuICBfcmVnaXN0cnlDb25maWc6IFJlZ2lzdHJ5Q29uZmlnID0ge307XG5cbiAgX3NhdmVDb25maWcoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdfc2F2ZUNvbmZpZyBtdXN0IGJlIGltcGxlbWVudGVkIGluIHN1YmNsYXNzJyk7XG4gIH1cblxuICBfZ2V0Q2xpZW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVnaXN0cnlDb25maWcuY2xpZW50cyB8fCAodGhpcy5fcmVnaXN0cnlDb25maWcuY2xpZW50cyA9IHt9KTtcbiAgfVxuXG4gIF9nZXRDb25uZWN0aW9ucygpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5fcmVnaXN0cnlDb25maWcuY29ubmVjdGlvbnMgfHxcbiAgICAgICh0aGlzLl9yZWdpc3RyeUNvbmZpZy5jb25uZWN0aW9ucyA9IHt9KVxuICAgICk7XG4gIH1cblxuICBhc3luYyBnZXRDb25uZWN0aW9uTmFtZXMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2dldENvbm5lY3Rpb25zKCkpO1xuICB9XG5cbiAgYXN5bmMgZ2V0Q29ubmVjdGlvbjxTIGV4dGVuZHMgU2NoZW1hID0gU2NoZW1hPihuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjb25maWcgPSBhd2FpdCB0aGlzLmdldENvbm5lY3Rpb25Db25maWcobmFtZSk7XG4gICAgcmV0dXJuIGNvbmZpZyA/IG5ldyBDb25uZWN0aW9uPFM+KGNvbmZpZykgOiBudWxsO1xuICB9XG5cbiAgYXN5bmMgZ2V0Q29ubmVjdGlvbkNvbmZpZyhuYW1lPzogc3RyaW5nKSB7XG4gICAgaWYgKCFuYW1lKSB7XG4gICAgICBuYW1lID0gdGhpcy5fcmVnaXN0cnlDb25maWdbJ2RlZmF1bHQnXTtcbiAgICB9XG4gICAgY29uc3QgY29ubmVjdGlvbnMgPSB0aGlzLl9nZXRDb25uZWN0aW9ucygpO1xuICAgIGNvbnN0IGNvbm5Db25maWcgPSBuYW1lID8gY29ubmVjdGlvbnNbbmFtZV0gOiB1bmRlZmluZWQ7XG4gICAgaWYgKCFjb25uQ29uZmlnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgeyBjbGllbnQsIC4uLmNvbm5Db25maWdfIH0gPSBjb25uQ29uZmlnO1xuICAgIGlmIChjbGllbnQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmNvbm5Db25maWdfLFxuICAgICAgICBvYXV0aDI6IHsgLi4uKGF3YWl0IHRoaXMuZ2V0Q2xpZW50Q29uZmlnKGNsaWVudCkpIH0sXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gY29ubkNvbmZpZ187XG4gIH1cblxuICBhc3luYyBzYXZlQ29ubmVjdGlvbkNvbmZpZyhuYW1lOiBzdHJpbmcsIGNvbm5Db25maWc6IENvbm5lY3Rpb25Db25maWcpIHtcbiAgICBjb25zdCBjb25uZWN0aW9ucyA9IHRoaXMuX2dldENvbm5lY3Rpb25zKCk7XG4gICAgY29uc3QgeyBvYXV0aDIsIC4uLmNvbm5Db25maWdfIH0gPSBjb25uQ29uZmlnO1xuICAgIGxldCBwZXJzaXN0Q29ubkNvbmZpZzogUGVyc2lzdENvbm5lY3Rpb25Db25maWcgPSBjb25uQ29uZmlnXztcbiAgICBpZiAob2F1dGgyKSB7XG4gICAgICBjb25zdCBjbGllbnROYW1lID0gdGhpcy5fZmluZENsaWVudE5hbWUob2F1dGgyKTtcbiAgICAgIGlmIChjbGllbnROYW1lKSB7XG4gICAgICAgIHBlcnNpc3RDb25uQ29uZmlnID0geyAuLi5wZXJzaXN0Q29ubkNvbmZpZywgY2xpZW50OiBjbGllbnROYW1lIH07XG4gICAgICB9XG4gICAgICBkZWxldGUgY29ubkNvbmZpZy5vYXV0aDI7XG4gICAgfVxuICAgIGNvbm5lY3Rpb25zW25hbWVdID0gcGVyc2lzdENvbm5Db25maWc7XG4gICAgdGhpcy5fc2F2ZUNvbmZpZygpO1xuICB9XG5cbiAgX2ZpbmRDbGllbnROYW1lKHsgY2xpZW50SWQsIGxvZ2luVXJsIH06IENsaWVudENvbmZpZykge1xuICAgIGNvbnN0IGNsaWVudHMgPSB0aGlzLl9nZXRDbGllbnRzKCk7XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIE9iamVjdC5rZXlzKGNsaWVudHMpKSB7XG4gICAgICBjb25zdCBjbGllbnQgPSBjbGllbnRzW25hbWVdO1xuICAgICAgaWYgKFxuICAgICAgICBjbGllbnQuY2xpZW50SWQgPT09IGNsaWVudElkICYmXG4gICAgICAgIChjbGllbnQubG9naW5VcmwgfHwgJ2h0dHBzOi8vbG9naW4uc2FsZXNmb3JjZS5jb20nKSA9PT0gbG9naW5VcmxcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gbmFtZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBhc3luYyBzZXREZWZhdWx0Q29ubmVjdGlvbihuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9yZWdpc3RyeUNvbmZpZ1snZGVmYXVsdCddID0gbmFtZTtcbiAgICB0aGlzLl9zYXZlQ29uZmlnKCk7XG4gIH1cblxuICBhc3luYyByZW1vdmVDb25uZWN0aW9uQ29uZmlnKG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25zID0gdGhpcy5fZ2V0Q29ubmVjdGlvbnMoKTtcbiAgICBkZWxldGUgY29ubmVjdGlvbnNbbmFtZV07XG4gICAgdGhpcy5fc2F2ZUNvbmZpZygpO1xuICB9XG5cbiAgYXN5bmMgZ2V0Q2xpZW50Q29uZmlnKG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGNsaWVudHMgPSB0aGlzLl9nZXRDbGllbnRzKCk7XG4gICAgY29uc3QgY2xpZW50Q29uZmlnID0gY2xpZW50c1tuYW1lXTtcbiAgICByZXR1cm4gY2xpZW50Q29uZmlnICYmIHsgLi4uY2xpZW50Q29uZmlnIH07XG4gIH1cblxuICBhc3luYyBnZXRDbGllbnROYW1lcygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fZ2V0Q2xpZW50cygpKTtcbiAgfVxuXG4gIGFzeW5jIHJlZ2lzdGVyQ2xpZW50Q29uZmlnKG5hbWU6IHN0cmluZywgY2xpZW50Q29uZmlnOiBDbGllbnRDb25maWcpIHtcbiAgICBjb25zdCBjbGllbnRzID0gdGhpcy5fZ2V0Q2xpZW50cygpO1xuICAgIGNsaWVudHNbbmFtZV0gPSBjbGll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