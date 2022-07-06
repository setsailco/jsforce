"use strict";

var _context4;

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

var _exportNames = {
  MetadataApi: true,
  AsyncResultLocator: true,
  RetrieveResultLocator: true,
  DeployResultLocator: true
};
exports.default = exports.RetrieveResultLocator = exports.MetadataApi = exports.DeployResultLocator = exports.AsyncResultLocator = void 0;

require("core-js/modules/es.promise.js");

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/json/stringify"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/concat"));

var _setTimeout2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/set-timeout"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectWithoutProperties"));

var _events = require("events");

var _stream = require("stream");

var _formData = _interopRequireDefault(require("form-data"));

var _jsforce = require("../jsforce");

var _soap = _interopRequireDefault(require("../soap"));

var _function = require("../util/function");

var _schema = require("./metadata/schema");

_forEachInstanceProperty(_context4 = _Object$keys(_schema)).call(_context4, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _schema[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _schema[key];
    }
  });
});

const _excluded = ["$"];

function ownKeys(object, enumerableOnly) { var keys = _Object$keys(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context2, _context3; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context2 = ownKeys(Object(source), !0)).call(_context2, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context3 = ownKeys(Object(source))).call(_context3, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 *
 */
function deallocateTypeWithMetadata(metadata) {
  const _ref = metadata,
        {
    $
  } = _ref,
        md = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  return md;
}

function assignTypeWithMetadata(metadata, type) {
  const convert = md => _objectSpread({
    ['@xsi:type']: type
  }, md);

  return (0, _isArray.default)(metadata) ? (0, _map.default)(metadata).call(metadata, convert) : convert(metadata);
}
/**
 * Class for Salesforce Metadata API
 */


class MetadataApi {
  /**
   * Polling interval in milliseconds
   */

  /**
   * Polling timeout in milliseconds
   */

  /**
   *
   */
  constructor(conn) {
    (0, _defineProperty2.default)(this, "_conn", void 0);
    (0, _defineProperty2.default)(this, "pollInterval", 1000);
    (0, _defineProperty2.default)(this, "pollTimeout", 10000);
    this._conn = conn;
  }
  /**
   * Call Metadata API SOAP endpoint
   *
   * @private
   */


  async _invoke(method, message, schema) {
    const soapEndpoint = new _soap.default(this._conn, {
      xmlns: 'http://soap.sforce.com/2006/04/metadata',
      endpointUrl: `${this._conn.instanceUrl}/services/Soap/m/${this._conn.version}`
    });
    const res = await soapEndpoint.invoke(method, message, schema ? {
      result: schema
    } : undefined, _schema.ApiSchemas);
    return res.result;
  }
  /**
   * Add one or more new metadata components to the organization.
   */


  create(type, metadata) {
    const isArray = (0, _isArray.default)(metadata);
    metadata = assignTypeWithMetadata(metadata, type);
    const schema = isArray ? [_schema.ApiSchemas.SaveResult] : _schema.ApiSchemas.SaveResult;
    return this._invoke('createMetadata', {
      metadata
    }, schema);
  }
  /**
   * Read specified metadata components in the organization.
   */


  async read(type, fullNames) {
    var _context;

    const ReadResultSchema = type in _schema.ApiSchemas ? {
      type: _schema.ApiSchemas.ReadResult.type,
      props: {
        records: [type]
      }
    } : _schema.ApiSchemas.ReadResult;
    const res = await this._invoke('readMetadata', {
      type,
      fullNames
    }, ReadResultSchema);
    return (0, _isArray.default)(fullNames) ? (0, _map.default)(_context = res.records).call(_context, deallocateTypeWithMetadata) : deallocateTypeWithMetadata(res.records[0]);
  }
  /**
   * Update one or more metadata components in the organization.
   */


  update(type, metadata) {
    const isArray = (0, _isArray.default)(metadata);
    metadata = assignTypeWithMetadata(metadata, type);
    const schema = isArray ? [_schema.ApiSchemas.SaveResult] : _schema.ApiSchemas.SaveResult;
    return this._invoke('updateMetadata', {
      metadata
    }, schema);
  }
  /**
   * Upsert one or more components in your organization's data.
   */


  upsert(type, metadata) {
    const isArray = (0, _isArray.default)(metadata);
    metadata = assignTypeWithMetadata(metadata, type);
    const schema = isArray ? [_schema.ApiSchemas.UpsertResult] : _schema.ApiSchemas.UpsertResult;
    return this._invoke('upsertMetadata', {
      metadata
    }, schema);
  }
  /**
   * Deletes specified metadata components in the organization.
   */


  delete(type, fullNames) {
    const schema = (0, _isArray.default)(fullNames) ? [_schema.ApiSchemas.SaveResult] : _schema.ApiSchemas.SaveResult;
    return this._invoke('deleteMetadata', {
      type,
      fullNames
    }, schema);
  }
  /**
   * Rename fullname of a metadata component in the organization
   */


  rename(type, oldFullName, newFullName) {
    return this._invoke('renameMetadata', {
      type,
      oldFullName,
      newFullName
    }, _schema.ApiSchemas.SaveResult);
  }
  /**
   * Retrieves the metadata which describes your organization, including Apex classes and triggers,
   * custom objects, custom fields on standard objects, tab sets that define an app,
   * and many other components.
   */


  describe(asOfVersion) {
    if (!asOfVersion) {
      asOfVersion = this._conn.version;
    }

    return this._invoke('describeMetadata', {
      asOfVersion
    }, _schema.ApiSchemas.DescribeMetadataResult);
  }
  /**
   * Retrieves property information about metadata components in your organization
   */


  list(queries, asOfVersion) {
    if (!asOfVersion) {
      asOfVersion = this._conn.version;
    }

    return this._invoke('listMetadata', {
      queries,
      asOfVersion
    }, [_schema.ApiSchemas.FileProperties]);
  }
  /**
   * Checks the status of asynchronous metadata calls
   */


  checkStatus(asyncProcessId) {
    const res = this._invoke('checkStatus', {
      asyncProcessId
    }, _schema.ApiSchemas.AsyncResult);

    return new AsyncResultLocator(this, res);
  }
  /**
   * Retrieves XML file representations of components in an organization
   */


  retrieve(request) {
    const res = this._invoke('retrieve', {
      request
    }, _schema.ApiSchemas.RetrieveResult);

    return new RetrieveResultLocator(this, res);
  }
  /**
   * Checks the status of declarative metadata call retrieve() and returns the zip file contents
   */


  checkRetrieveStatus(asyncProcessId) {
    return this._invoke('checkRetrieveStatus', {
      asyncProcessId
    }, _schema.ApiSchemas.RetrieveResult);
  }
  /**
   * Deploy components into an organization using zipped file representations
   * using the REST Metadata API instead of SOAP
   */


  deployRest(zipInput, options = {}) {
    const form = new _formData.default();
    form.append('file', zipInput, {
      contentType: 'application/zip',
      filename: 'package.xml'
    }); // Add the deploy options

    form.append('entity_content', (0, _stringify.default)({
      deployOptions: options
    }), {
      contentType: 'application/json'
    });
    const request = {
      url: '/metadata/deployRequest',
      method: 'POST',
      headers: _objectSpread({}, form.getHeaders()),
      body: form.getBuffer()
    };

    const res = this._conn.request(request);

    return new DeployResultLocator(this, res);
  }
  /**
   * Deploy components into an organization using zipped file representations
   */


  deploy(zipInput, options = {}) {
    const res = (async () => {
      const zipContentB64 = await new _promise.default((resolve, reject) => {
        if ((0, _function.isObject)(zipInput) && 'pipe' in zipInput && typeof zipInput.pipe === 'function') {
          const bufs = [];
          zipInput.on('data', d => bufs.push(d));
          zipInput.on('error', reject);
          zipInput.on('end', () => {
            resolve((0, _concat.default)(Buffer).call(Buffer, bufs).toString('base64'));
          }); // zipInput.resume();
        } else if (zipInput instanceof Buffer) {
          resolve(zipInput.toString('base64'));
        } else if (zipInput instanceof String || typeof zipInput === 'string') {
          resolve(zipInput);
        } else {
          throw 'Unexpected zipInput type';
        }
      });
      return this._invoke('deploy', {
        ZipFile: zipContentB64,
        DeployOptions: options
      }, _schema.ApiSchemas.DeployResult);
    })();

    return new DeployResultLocator(this, res);
  }
  /**
   * Checks the status of declarative metadata call deploy()
   */


  checkDeployStatus(asyncProcessId, includeDetails = false) {
    return this._invoke('checkDeployStatus', {
      asyncProcessId,
      includeDetails
    }, _schema.ApiSchemas.DeployResult);
  }

}
/*--------------------------------------------*/

/**
 * The locator class for Metadata API asynchronous call result
 */


exports.MetadataApi = MetadataApi;

class AsyncResultLocator extends _events.EventEmitter {
  /**
   *
   */
  constructor(meta, promise) {
    super();
    (0, _defineProperty2.default)(this, "_meta", void 0);
    (0, _defineProperty2.default)(this, "_promise", void 0);
    (0, _defineProperty2.default)(this, "_id", void 0);
    this._meta = meta;
    this._promise = promise;
  }
  /**
   * Promise/A+ interface
   * http://promises-aplus.github.io/promises-spec/
   *
   * @method Metadata~AsyncResultLocator#then
   */


  then(onResolve, onReject) {
    return this._promise.then(onResolve, onReject);
  }
  /**
   * Check the status of async request
   */


  async check() {
    const result = await this._promise;
    this._id = result.id;
    return await this._meta.checkStatus(result.id);
  }
  /**
   * Polling until async call status becomes complete or error
   */


  poll(interval, timeout) {
    const startTime = new Date().getTime();

    const poll = async () => {
      try {
        const now = new Date().getTime();

        if (startTime + timeout < now) {
          let errMsg = 'Polling time out.';

          if (this._id) {
            errMsg += ' Process Id = ' + this._id;
          }

          this.emit('error', new Error(errMsg));
          return;
        }

        const result = await this.check();

        if (result.done) {
          this.emit('complete', result);
        } else {
          this.emit('progress', result);
          (0, _setTimeout2.default)(poll, interval);
        }
      } catch (err) {
        this.emit('error', err);
      }
    };

    (0, _setTimeout2.default)(poll, interval);
  }
  /**
   * Check and wait until the async requests become in completed status
   */


  complete() {
    return new _promise.default((resolve, reject) => {
      this.on('complete', resolve);
      this.on('error', reject);
      this.poll(this._meta.pollInterval, this._meta.pollTimeout);
    });
  }

}
/*--------------------------------------------*/

/**
 * The locator class to track retreive() Metadata API call result
 */


exports.AsyncResultLocator = AsyncResultLocator;

class RetrieveResultLocator extends AsyncResultLocator {
  /**
   * Check and wait until the async request becomes in completed status,
   * and retrieve the result data.
   */
  async complete() {
    const result = await super.complete();
    return this._meta.checkRetrieveStatus(result.id);
  }
  /**
   * Change the retrieved result to Node.js readable stream
   */


  stream() {
    const resultStream = new _stream.Readable();
    let reading = false;

    resultStream._read = async () => {
      if (reading) {
        return;
      }

      reading = true;

      try {
        const result = await this.complete();
        resultStream.push(Buffer.from(result.zipFile, 'base64'));
        resultStream.push(null);
      } catch (e) {
        resultStream.emit('error', e);
      }
    };

    return resultStream;
  }

}
/*--------------------------------------------*/

/**
 * The locator class to track deploy() Metadata API call result
 *
 * @protected
 * @class Metadata~DeployResultLocator
 * @extends Metadata~AsyncResultLocator
 * @param {Metadata} meta - Metadata API object
 * @param {Promise.<Metadata~AsyncResult>} result - Promise object for async result of deploy() call
 */


exports.RetrieveResultLocator = RetrieveResultLocator;

class DeployResultLocator extends AsyncResultLocator {
  /**
   * Check and wait until the async request becomes in completed status,
   * and retrieve the result data.
   */
  async complete(includeDetails) {
    const result = await super.complete();
    return this._meta.checkDeployStatus(result.id, includeDetails);
  }

}
/*--------------------------------------------*/

/*
 * Register hook in connection instantiation for dynamically adding this API module features
 */


exports.DeployResultLocator = DeployResultLocator;
(0, _jsforce.registerModule)('metadata', conn => new MetadataApi(conn));
var _default = MetadataApi;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkZWFsbG9jYXRlVHlwZVdpdGhNZXRhZGF0YSIsIm1ldGFkYXRhIiwiJCIsIm1kIiwiYXNzaWduVHlwZVdpdGhNZXRhZGF0YSIsInR5cGUiLCJjb252ZXJ0IiwiTWV0YWRhdGFBcGkiLCJjb25zdHJ1Y3RvciIsImNvbm4iLCJfY29ubiIsIl9pbnZva2UiLCJtZXRob2QiLCJtZXNzYWdlIiwic2NoZW1hIiwic29hcEVuZHBvaW50IiwiU09BUCIsInhtbG5zIiwiZW5kcG9pbnRVcmwiLCJpbnN0YW5jZVVybCIsInZlcnNpb24iLCJyZXMiLCJpbnZva2UiLCJyZXN1bHQiLCJ1bmRlZmluZWQiLCJBcGlTY2hlbWFzIiwiY3JlYXRlIiwiaXNBcnJheSIsIlNhdmVSZXN1bHQiLCJyZWFkIiwiZnVsbE5hbWVzIiwiUmVhZFJlc3VsdFNjaGVtYSIsIlJlYWRSZXN1bHQiLCJwcm9wcyIsInJlY29yZHMiLCJ1cGRhdGUiLCJ1cHNlcnQiLCJVcHNlcnRSZXN1bHQiLCJkZWxldGUiLCJyZW5hbWUiLCJvbGRGdWxsTmFtZSIsIm5ld0Z1bGxOYW1lIiwiZGVzY3JpYmUiLCJhc09mVmVyc2lvbiIsIkRlc2NyaWJlTWV0YWRhdGFSZXN1bHQiLCJsaXN0IiwicXVlcmllcyIsIkZpbGVQcm9wZXJ0aWVzIiwiY2hlY2tTdGF0dXMiLCJhc3luY1Byb2Nlc3NJZCIsIkFzeW5jUmVzdWx0IiwiQXN5bmNSZXN1bHRMb2NhdG9yIiwicmV0cmlldmUiLCJyZXF1ZXN0IiwiUmV0cmlldmVSZXN1bHQiLCJSZXRyaWV2ZVJlc3VsdExvY2F0b3IiLCJjaGVja1JldHJpZXZlU3RhdHVzIiwiZGVwbG95UmVzdCIsInppcElucHV0Iiwib3B0aW9ucyIsImZvcm0iLCJGb3JtRGF0YSIsImFwcGVuZCIsImNvbnRlbnRUeXBlIiwiZmlsZW5hbWUiLCJkZXBsb3lPcHRpb25zIiwidXJsIiwiaGVhZGVycyIsImdldEhlYWRlcnMiLCJib2R5IiwiZ2V0QnVmZmVyIiwiRGVwbG95UmVzdWx0TG9jYXRvciIsImRlcGxveSIsInppcENvbnRlbnRCNjQiLCJyZXNvbHZlIiwicmVqZWN0IiwiaXNPYmplY3QiLCJwaXBlIiwiYnVmcyIsIm9uIiwiZCIsInB1c2giLCJCdWZmZXIiLCJ0b1N0cmluZyIsIlN0cmluZyIsIlppcEZpbGUiLCJEZXBsb3lPcHRpb25zIiwiRGVwbG95UmVzdWx0IiwiY2hlY2tEZXBsb3lTdGF0dXMiLCJpbmNsdWRlRGV0YWlscyIsIkV2ZW50RW1pdHRlciIsIm1ldGEiLCJwcm9taXNlIiwiX21ldGEiLCJfcHJvbWlzZSIsInRoZW4iLCJvblJlc29sdmUiLCJvblJlamVjdCIsImNoZWNrIiwiX2lkIiwiaWQiLCJwb2xsIiwiaW50ZXJ2YWwiLCJ0aW1lb3V0Iiwic3RhcnRUaW1lIiwiRGF0ZSIsImdldFRpbWUiLCJub3ciLCJlcnJNc2ciLCJlbWl0IiwiRXJyb3IiLCJkb25lIiwiZXJyIiwiY29tcGxldGUiLCJwb2xsSW50ZXJ2YWwiLCJwb2xsVGltZW91dCIsInN0cmVhbSIsInJlc3VsdFN0cmVhbSIsIlJlYWRhYmxlIiwicmVhZGluZyIsIl9yZWFkIiwiZnJvbSIsInppcEZpbGUiLCJlIiwicmVnaXN0ZXJNb2R1bGUiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvYXBpL21ldGFkYXRhLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgTWFuYWdlcyBTYWxlc2ZvcmNlIE1ldGFkYXRhIEFQSVxuICogQGF1dGhvciBTaGluaWNoaSBUb21pdGEgPHNoaW5pY2hpLnRvbWl0YUBnbWFpbC5jb20+XG4gKi9cbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBSZWFkYWJsZSB9IGZyb20gJ3N0cmVhbSc7XG5pbXBvcnQgRm9ybURhdGEgZnJvbSAnZm9ybS1kYXRhJztcbmltcG9ydCB7IHJlZ2lzdGVyTW9kdWxlIH0gZnJvbSAnLi4vanNmb3JjZSc7XG5pbXBvcnQgQ29ubmVjdGlvbiBmcm9tICcuLi9jb25uZWN0aW9uJztcbmltcG9ydCBTT0FQIGZyb20gJy4uL3NvYXAnO1xuaW1wb3J0IHsgaXNPYmplY3QgfSBmcm9tICcuLi91dGlsL2Z1bmN0aW9uJztcbmltcG9ydCB7IFNjaGVtYSwgU29hcFNjaGVtYURlZiwgU29hcFNjaGVtYSwgSHR0cFJlcXVlc3QgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQge1xuICBBcGlTY2hlbWFzLFxuICBNZXRhZGF0YSxcbiAgUmVhZFJlc3VsdCxcbiAgU2F2ZVJlc3VsdCxcbiAgVXBzZXJ0UmVzdWx0LFxuICBMaXN0TWV0YWRhdGFRdWVyeSxcbiAgRmlsZVByb3BlcnRpZXMsXG4gIERlc2NyaWJlTWV0YWRhdGFSZXN1bHQsXG4gIFJldHJpZXZlUmVxdWVzdCxcbiAgRGVwbG95T3B0aW9ucyxcbiAgUmV0cmlldmVSZXN1bHQsXG4gIERlcGxveVJlc3VsdCxcbiAgQXN5bmNSZXN1bHQsXG4gIEFwaVNjaGVtYVR5cGVzLFxufSBmcm9tICcuL21ldGFkYXRhL3NjaGVtYSc7XG5leHBvcnQgKiBmcm9tICcuL21ldGFkYXRhL3NjaGVtYSc7XG5cbi8qKlxuICpcbiAqL1xudHlwZSBNZXRhZGF0YVR5cGVfPFxuICBLIGV4dGVuZHMga2V5b2YgQXBpU2NoZW1hVHlwZXMgPSBrZXlvZiBBcGlTY2hlbWFUeXBlc1xuPiA9IEsgZXh0ZW5kcyBrZXlvZiBBcGlTY2hlbWFUeXBlc1xuICA/IEFwaVNjaGVtYVR5cGVzW0tdIGV4dGVuZHMgTWV0YWRhdGFcbiAgICA/IEtcbiAgICA6IG5ldmVyXG4gIDogbmV2ZXI7XG5cbmV4cG9ydCB0eXBlIE1ldGFkYXRhVHlwZSA9IE1ldGFkYXRhVHlwZV87XG5cbmV4cG9ydCB0eXBlIE1ldGFkYXRhRGVmaW5pdGlvbjxcbiAgVCBleHRlbmRzIHN0cmluZyxcbiAgTSBleHRlbmRzIE1ldGFkYXRhID0gTWV0YWRhdGFcbj4gPSBNZXRhZGF0YSBleHRlbmRzIE1cbiAgPyBUIGV4dGVuZHMga2V5b2YgQXBpU2NoZW1hVHlwZXMgJiBNZXRhZGF0YVR5cGVcbiAgICA/IEFwaVNjaGVtYVR5cGVzW1RdIGV4dGVuZHMgTWV0YWRhdGFcbiAgICAgID8gQXBpU2NoZW1hVHlwZXNbVF1cbiAgICAgIDogTWV0YWRhdGFcbiAgICA6IE1ldGFkYXRhXG4gIDogTTtcblxudHlwZSBEZWVwUGFydGlhbDxUPiA9IFQgZXh0ZW5kcyBhbnlbXVxuICA/IERlZXBQYXJ0aWFsPFRbbnVtYmVyXT5bXVxuICA6IFQgZXh0ZW5kcyBvYmplY3RcbiAgPyB7IFtLIGluIGtleW9mIFRdPzogRGVlcFBhcnRpYWw8VFtLXT4gfVxuICA6IFQ7XG5cbmV4cG9ydCB0eXBlIElucHV0TWV0YWRhdGFEZWZpbml0aW9uPFxuICBUIGV4dGVuZHMgc3RyaW5nLFxuICBNIGV4dGVuZHMgTWV0YWRhdGEgPSBNZXRhZGF0YVxuPiA9IERlZXBQYXJ0aWFsPE1ldGFkYXRhRGVmaW5pdGlvbjxULCBNPj47XG5cbi8qKlxuICpcbiAqL1xuZnVuY3Rpb24gZGVhbGxvY2F0ZVR5cGVXaXRoTWV0YWRhdGE8TSBleHRlbmRzIE1ldGFkYXRhPihtZXRhZGF0YTogTSk6IE0ge1xuICBjb25zdCB7ICQsIC4uLm1kIH0gPSBtZXRhZGF0YSBhcyBhbnk7XG4gIHJldHVybiBtZDtcbn1cblxuZnVuY3Rpb24gYXNzaWduVHlwZVdpdGhNZXRhZGF0YShtZXRhZGF0YTogTWV0YWRhdGEgfCBNZXRhZGF0YVtdLCB0eXBlOiBzdHJpbmcpIHtcbiAgY29uc3QgY29udmVydCA9IChtZDogTWV0YWRhdGEpID0+ICh7IFsnQHhzaTp0eXBlJ106IHR5cGUsIC4uLm1kIH0pO1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShtZXRhZGF0YSkgPyBtZXRhZGF0YS5tYXAoY29udmVydCkgOiBjb252ZXJ0KG1ldGFkYXRhKTtcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgU2FsZXNmb3JjZSBNZXRhZGF0YSBBUElcbiAqL1xuZXhwb3J0IGNsYXNzIE1ldGFkYXRhQXBpPFMgZXh0ZW5kcyBTY2hlbWE+IHtcbiAgX2Nvbm46IENvbm5lY3Rpb248Uz47XG5cbiAgLyoqXG4gICAqIFBvbGxpbmcgaW50ZXJ2YWwgaW4gbWlsbGlzZWNvbmRzXG4gICAqL1xuICBwb2xsSW50ZXJ2YWw6IG51bWJlciA9IDEwMDA7XG5cbiAgLyoqXG4gICAqIFBvbGxpbmcgdGltZW91dCBpbiBtaWxsaXNlY29uZHNcbiAgICovXG4gIHBvbGxUaW1lb3V0OiBudW1iZXIgPSAxMDAwMDtcblxuICAvKipcbiAgICpcbiAgICovXG4gIGNvbnN0cnVjdG9yKGNvbm46IENvbm5lY3Rpb248Uz4pIHtcbiAgICB0aGlzLl9jb25uID0gY29ubjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIE1ldGFkYXRhIEFQSSBTT0FQIGVuZHBvaW50XG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhc3luYyBfaW52b2tlKFxuICAgIG1ldGhvZDogc3RyaW5nLFxuICAgIG1lc3NhZ2U6IG9iamVjdCxcbiAgICBzY2hlbWE/OiBTb2FwU2NoZW1hIHwgU29hcFNjaGVtYURlZixcbiAgKSB7XG4gICAgY29uc3Qgc29hcEVuZHBvaW50ID0gbmV3IFNPQVAodGhpcy5fY29ubiwge1xuICAgICAgeG1sbnM6ICdodHRwOi8vc29hcC5zZm9yY2UuY29tLzIwMDYvMDQvbWV0YWRhdGEnLFxuICAgICAgZW5kcG9pbnRVcmw6IGAke3RoaXMuX2Nvbm4uaW5zdGFuY2VVcmx9L3NlcnZpY2VzL1NvYXAvbS8ke3RoaXMuX2Nvbm4udmVyc2lvbn1gLFxuICAgIH0pO1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHNvYXBFbmRwb2ludC5pbnZva2UoXG4gICAgICBtZXRob2QsXG4gICAgICBtZXNzYWdlLFxuICAgICAgc2NoZW1hID8gKHsgcmVzdWx0OiBzY2hlbWEgfSBhcyBTb2FwU2NoZW1hKSA6IHVuZGVmaW5lZCxcbiAgICAgIEFwaVNjaGVtYXMsXG4gICAgKTtcbiAgICByZXR1cm4gcmVzLnJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgb25lIG9yIG1vcmUgbmV3IG1ldGFkYXRhIGNvbXBvbmVudHMgdG8gdGhlIG9yZ2FuaXphdGlvbi5cbiAgICovXG4gIGNyZWF0ZTxcbiAgICBNIGV4dGVuZHMgTWV0YWRhdGEgPSBNZXRhZGF0YSxcbiAgICBUIGV4dGVuZHMgTWV0YWRhdGFUeXBlID0gTWV0YWRhdGFUeXBlLFxuICAgIE1EIGV4dGVuZHMgSW5wdXRNZXRhZGF0YURlZmluaXRpb248VCwgTT4gPSBJbnB1dE1ldGFkYXRhRGVmaW5pdGlvbjxULCBNPlxuICA+KHR5cGU6IFQsIG1ldGFkYXRhOiBNRFtdKTogUHJvbWlzZTxTYXZlUmVzdWx0W10+O1xuICBjcmVhdGU8XG4gICAgTSBleHRlbmRzIE1ldGFkYXRhID0gTWV0YWRhdGEsXG4gICAgVCBleHRlbmRzIE1ldGFkYXRhVHlwZSA9IE1ldGFkYXRhVHlwZSxcbiAgICBNRCBleHRlbmRzIElucHV0TWV0YWRhdGFEZWZpbml0aW9uPFQsIE0+ID0gSW5wdXRNZXRhZGF0YURlZmluaXRpb248VCwgTT5cbiAgPih0eXBlOiBULCBtZXRhZGF0YTogTUQpOiBQcm9taXNlPFNhdmVSZXN1bHQ+O1xuICBjcmVhdGU8XG4gICAgTSBleHRlbmRzIE1ldGFkYXRhID0gTWV0YWRhdGEsXG4gICAgVCBleHRlbmRzIE1ldGFkYXRhVHlwZSA9IE1ldGFkYXRhVHlwZSxcbiAgICBNRCBleHRlbmRzIElucHV0TWV0YWRhdGFEZWZpbml0aW9uPFQsIE0+ID0gSW5wdXRNZXRhZGF0YURlZmluaXRpb248VCwgTT5cbiAgPih0eXBlOiBULCBtZXRhZGF0YTogTUQgfCBNRFtdKTogUHJvbWlzZTxTYXZlUmVzdWx0IHwgU2F2ZVJlc3VsdFtdPjtcbiAgY3JlYXRlKHR5cGU6IHN0cmluZywgbWV0YWRhdGE6IE1ldGFkYXRhIHwgTWV0YWRhdGFbXSkge1xuICAgIGNvbnN0IGlzQXJyYXkgPSBBcnJheS5pc0FycmF5KG1ldGFkYXRhKTtcbiAgICBtZXRhZGF0YSA9IGFzc2lnblR5cGVXaXRoTWV0YWRhdGEobWV0YWRhdGEsIHR5cGUpO1xuICAgIGNvbnN0IHNjaGVtYSA9IGlzQXJyYXkgPyBbQXBpU2NoZW1hcy5TYXZlUmVzdWx0XSA6IEFwaVNjaGVtYXMuU2F2ZVJlc3VsdDtcbiAgICByZXR1cm4gdGhpcy5faW52b2tlKCdjcmVhdGVNZXRhZGF0YScsIHsgbWV0YWRhdGEgfSwgc2NoZW1hKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkIHNwZWNpZmllZCBtZXRhZGF0YSBjb21wb25lbnRzIGluIHRoZSBvcmdhbml6YXRpb24uXG4gICAqL1xuICByZWFkPFxuICAgIE0gZXh0ZW5kcyBNZXRhZGF0YSA9IE1ldGFkYXRhLFxuICAgIFQgZXh0ZW5kcyBNZXRhZGF0YVR5cGUgPSBNZXRhZGF0YVR5cGUsXG4gICAgTUQgZXh0ZW5kcyBNZXRhZGF0YURlZmluaXRpb248VCwgTT4gPSBNZXRhZGF0YURlZmluaXRpb248VCwgTT5cbiAgPih0eXBlOiBULCBmdWxsTmFtZXM6IHN0cmluZ1tdKTogUHJvbWlzZTxNRFtdPjtcbiAgcmVhZDxcbiAgICBNIGV4dGVuZHMgTWV0YWRhdGEgPSBNZXRhZGF0YSxcbiAgICBUIGV4dGVuZHMgTWV0YWRhdGFUeXBlID0gTWV0YWRhdGFUeXBlLFxuICAgIE1EIGV4dGVuZHMgTWV0YWRhdGFEZWZpbml0aW9uPFQsIE0+ID0gTWV0YWRhdGFEZWZpbml0aW9uPFQsIE0+XG4gID4odHlwZTogVCwgZnVsbE5hbWVzOiBzdHJpbmcpOiBQcm9taXNlPE1EPjtcbiAgcmVhZDxcbiAgICBNIGV4dGVuZHMgTWV0YWRhdGEgPSBNZXRhZGF0YSxcbiAgICBUIGV4dGVuZHMgTWV0YWRhdGFUeXBlID0gTWV0YWRhdGFUeXBlLFxuICAgIE1EIGV4dGVuZHMgTWV0YWRhdGFEZWZpbml0aW9uPFQsIE0+ID0gTWV0YWRhdGFEZWZpbml0aW9uPFQsIE0+XG4gID4odHlwZTogVCwgZnVsbE5hbWVzOiBzdHJpbmcgfCBzdHJpbmdbXSk6IFByb21pc2U8TUQgfCBNRFtdPjtcbiAgYXN5bmMgcmVhZCh0eXBlOiBzdHJpbmcsIGZ1bGxOYW1lczogc3RyaW5nIHwgc3RyaW5nW10pIHtcbiAgICBjb25zdCBSZWFkUmVzdWx0U2NoZW1hID1cbiAgICAgIHR5cGUgaW4gQXBpU2NoZW1hc1xuICAgICAgICA/ICh7XG4gICAgICAgICAgICB0eXBlOiBBcGlTY2hlbWFzLlJlYWRSZXN1bHQudHlwZSxcbiAgICAgICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICAgIHJlY29yZHM6IFt0eXBlXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSBhcyBjb25zdClcbiAgICAgICAgOiBBcGlTY2hlbWFzLlJlYWRSZXN1bHQ7XG4gICAgY29uc3QgcmVzOiBSZWFkUmVzdWx0ID0gYXdhaXQgdGhpcy5faW52b2tlKFxuICAgICAgJ3JlYWRNZXRhZGF0YScsXG4gICAgICB7IHR5cGUsIGZ1bGxOYW1lcyB9LFxuICAgICAgUmVhZFJlc3VsdFNjaGVtYSxcbiAgICApO1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KGZ1bGxOYW1lcylcbiAgICAgID8gcmVzLnJlY29yZHMubWFwKGRlYWxsb2NhdGVUeXBlV2l0aE1ldGFkYXRhKVxuICAgICAgOiBkZWFsbG9jYXRlVHlwZVdpdGhNZXRhZGF0YShyZXMucmVjb3Jkc1swXSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIG9uZSBvciBtb3JlIG1ldGFkYXRhIGNvbXBvbmVudHMgaW4gdGhlIG9yZ2FuaXphdGlvbi5cbiAgICovXG4gIHVwZGF0ZTxcbiAgICBNIGV4dGVuZHMgTWV0YWRhdGEgPSBNZXRhZGF0YSxcbiAgICBUIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nLFxuICAgIE1EIGV4dGVuZHMgSW5wdXRNZXRhZGF0YURlZmluaXRpb248VCwgTT4gPSBJbnB1dE1ldGFkYXRhRGVmaW5pdGlvbjxULCBNPlxuICA+KHR5cGU6IFQsIG1ldGFkYXRhOiBQYXJ0aWFsPE1EPltdKTogUHJvbWlzZTxTYXZlUmVzdWx0W10+O1xuICB1cGRhdGU8XG4gICAgTSBleHRlbmRzIE1ldGFkYXRhID0gTWV0YWRhdGEsXG4gICAgVCBleHRlbmRzIHN0cmluZyA9IHN0cmluZyxcbiAgICBNRCBleHRlbmRzIElucHV0TWV0YWRhdGFEZWZpbml0aW9uPFQsIE0+ID0gSW5wdXRNZXRhZGF0YURlZmluaXRpb248VCwgTT5cbiAgPih0eXBlOiBULCBtZXRhZGF0YTogUGFydGlhbDxNRD4pOiBQcm9taXNlPFNhdmVSZXN1bHQ+O1xuICB1cGRhdGU8XG4gICAgTSBleHRlbmRzIE1ldGFkYXRhID0gTWV0YWRhdGEsXG4gICAgVCBleHRlbmRzIHN0cmluZyA9IHN0cmluZyxcbiAgICBNRCBleHRlbmRzIElucHV0TWV0YWRhdGFEZWZpbml0aW9uPFQsIE0+ID0gSW5wdXRNZXRhZGF0YURlZmluaXRpb248VCwgTT5cbiAgPihcbiAgICB0eXBlOiBULFxuICAgIG1ldGFkYXRhOiBQYXJ0aWFsPE1EPiB8IFBhcnRpYWw8TUQ+W10sXG4gICk6IFByb21pc2U8U2F2ZVJlc3VsdCB8IFNhdmVSZXN1bHRbXT47XG4gIHVwZGF0ZSh0eXBlOiBzdHJpbmcsIG1ldGFkYXRhOiBNZXRhZGF0YSB8IE1ldGFkYXRhW10pIHtcbiAgICBjb25zdCBpc0FycmF5ID0gQXJyYXkuaXNBcnJheShtZXRhZGF0YSk7XG4gICAgbWV0YWRhdGEgPSBhc3NpZ25UeXBlV2l0aE1ldGFkYXRhKG1ldGFkYXRhLCB0eXBlKTtcbiAgICBjb25zdCBzY2hlbWEgPSBpc0FycmF5ID8gW0FwaVNjaGVtYXMuU2F2ZVJlc3VsdF0gOiBBcGlTY2hlbWFzLlNhdmVSZXN1bHQ7XG4gICAgcmV0dXJuIHRoaXMuX2ludm9rZSgndXBkYXRlTWV0YWRhdGEnLCB7IG1ldGFkYXRhIH0sIHNjaGVtYSk7XG4gIH1cblxuICAvKipcbiAgICogVXBzZXJ0IG9uZSBvciBtb3JlIGNvbXBvbmVudHMgaW4geW91ciBvcmdhbml6YXRpb24ncyBkYXRhLlxuICAgKi9cbiAgdXBzZXJ0PFxuICAgIE0gZXh0ZW5kcyBNZXRhZGF0YSA9IE1ldGFkYXRhLFxuICAgIFQgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmcsXG4gICAgTUQgZXh0ZW5kcyBJbnB1dE1ldGFkYXRhRGVmaW5pdGlvbjxULCBNPiA9IElucHV0TWV0YWRhdGFEZWZpbml0aW9uPFQsIE0+XG4gID4odHlwZTogVCwgbWV0YWRhdGE6IE1EW10pOiBQcm9taXNlPFVwc2VydFJlc3VsdFtdPjtcbiAgdXBzZXJ0PFxuICAgIE0gZXh0ZW5kcyBNZXRhZGF0YSA9IE1ldGFkYXRhLFxuICAgIFQgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmcsXG4gICAgTUQgZXh0ZW5kcyBJbnB1dE1ldGFkYXRhRGVmaW5pdGlvbjxULCBNPiA9IElucHV0TWV0YWRhdGFEZWZpbml0aW9uPFQsIE0+XG4gID4odHlwZTogVCwgbWV0YWRhdGE6IE1EKTogUHJvbWlzZTxVcHNlcnRSZXN1bHQ+O1xuICB1cHNlcnQ8XG4gICAgTSBleHRlbmRzIE1ldGFkYXRhID0gTWV0YWRhdGEsXG4gICAgVCBleHRlbmRzIHN0cmluZyA9IHN0cmluZyxcbiAgICBNRCBleHRlbmRzIElucHV0TWV0YWRhdGFEZWZpbml0aW9uPFQsIE0+ID0gSW5wdXRNZXRhZGF0YURlZmluaXRpb248VCwgTT5cbiAgPih0eXBlOiBULCBtZXRhZGF0YTogTUQgfCBNRFtdKTogUHJvbWlzZTxVcHNlcnRSZXN1bHQgfCBVcHNlcnRSZXN1bHRbXT47XG4gIHVwc2VydCh0eXBlOiBzdHJpbmcsIG1ldGFkYXRhOiBNZXRhZGF0YSB8IE1ldGFkYXRhW10pIHtcbiAgICBjb25zdCBpc0FycmF5ID0gQXJyYXkuaXNBcnJheShtZXRhZGF0YSk7XG4gICAgbWV0YWRhdGEgPSBhc3NpZ25UeXBlV2l0aE1ldGFkYXRhKG1ldGFkYXRhLCB0eXBlKTtcbiAgICBjb25zdCBzY2hlbWEgPSBpc0FycmF5XG4gICAgICA/IFtBcGlTY2hlbWFzLlVwc2VydFJlc3VsdF1cbiAgICAgIDogQXBpU2NoZW1hcy5VcHNlcnRSZXN1bHQ7XG4gICAgcmV0dXJuIHRoaXMuX2ludm9rZSgndXBzZXJ0TWV0YWRhdGEnLCB7IG1ldGFkYXRhIH0sIHNjaGVtYSk7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlcyBzcGVjaWZpZWQgbWV0YWRhdGEgY29tcG9uZW50cyBpbiB0aGUgb3JnYW5pemF0aW9uLlxuICAgKi9cbiAgZGVsZXRlKHR5cGU6IHN0cmluZywgZnVsbE5hbWVzOiBzdHJpbmdbXSk6IFByb21pc2U8U2F2ZVJlc3VsdFtdPjtcbiAgZGVsZXRlKHR5cGU6IHN0cmluZywgZnVsbE5hbWVzOiBzdHJpbmcpOiBQcm9taXNlPFNhdmVSZXN1bHQ+O1xuICBkZWxldGUoXG4gICAgdHlwZTogc3RyaW5nLFxuICAgIGZ1bGxOYW1lczogc3RyaW5nIHwgc3RyaW5nW10sXG4gICk6IFByb21pc2U8U2F2ZVJlc3VsdCB8IFNhdmVSZXN1bHRbXT47XG4gIGRlbGV0ZSh0eXBlOiBzdHJpbmcsIGZ1bGxOYW1lczogc3RyaW5nIHwgc3RyaW5nW10pIHtcbiAgICBjb25zdCBzY2hlbWEgPSBBcnJheS5pc0FycmF5KGZ1bGxOYW1lcylcbiAgICAgID8gW0FwaVNjaGVtYXMuU2F2ZVJlc3VsdF1cbiAgICAgIDogQXBpU2NoZW1hcy5TYXZlUmVzdWx0O1xuICAgIHJldHVybiB0aGlzLl9pbnZva2UoJ2RlbGV0ZU1ldGFkYXRhJywgeyB0eXBlLCBmdWxsTmFtZXMgfSwgc2NoZW1hKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5hbWUgZnVsbG5hbWUgb2YgYSBtZXRhZGF0YSBjb21wb25lbnQgaW4gdGhlIG9yZ2FuaXphdGlvblxuICAgKi9cbiAgcmVuYW1lKFxuICAgIHR5cGU6IHN0cmluZyxcbiAgICBvbGRGdWxsTmFtZTogc3RyaW5nLFxuICAgIG5ld0Z1bGxOYW1lOiBzdHJpbmcsXG4gICk6IFByb21pc2U8U2F2ZVJlc3VsdD4ge1xuICAgIHJldHVybiB0aGlzLl9pbnZva2UoXG4gICAgICAncmVuYW1lTWV0YWRhdGEnLFxuICAgICAgeyB0eXBlLCBvbGRGdWxsTmFtZSwgbmV3RnVsbE5hbWUgfSxcbiAgICAgIEFwaVNjaGVtYXMuU2F2ZVJlc3VsdCxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgbWV0YWRhdGEgd2hpY2ggZGVzY3JpYmVzIHlvdXIgb3JnYW5pemF0aW9uLCBpbmNsdWRpbmcgQXBleCBjbGFzc2VzIGFuZCB0cmlnZ2VycyxcbiAgICogY3VzdG9tIG9iamVjdHMsIGN1c3RvbSBmaWVsZHMgb24gc3RhbmRhcmQgb2JqZWN0cywgdGFiIHNldHMgdGhhdCBkZWZpbmUgYW4gYXBwLFxuICAgKiBhbmQgbWFueSBvdGhlciBjb21wb25lbnRzLlxuICAgKi9cbiAgZGVzY3JpYmUoYXNPZlZlcnNpb24/OiBzdHJpbmcpOiBQcm9taXNlPERlc2NyaWJlTWV0YWRhdGFSZXN1bHQ+IHtcbiAgICBpZiAoIWFzT2ZWZXJzaW9uKSB7XG4gICAgICBhc09mVmVyc2lvbiA9IHRoaXMuX2Nvbm4udmVyc2lvbjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2ludm9rZShcbiAgICAgICdkZXNjcmliZU1ldGFkYXRhJyxcbiAgICAgIHsgYXNPZlZlcnNpb24gfSxcbiAgICAgIEFwaVNjaGVtYXMuRGVzY3JpYmVNZXRhZGF0YVJlc3VsdCxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyBwcm9wZXJ0eSBpbmZvcm1hdGlvbiBhYm91dCBtZXRhZGF0YSBjb21wb25lbnRzIGluIHlvdXIgb3JnYW5pemF0aW9uXG4gICAqL1xuICBsaXN0KFxuICAgIHF1ZXJpZXM6IExpc3RNZXRhZGF0YVF1ZXJ5IHwgTGlzdE1ldGFkYXRhUXVlcnlbXSxcbiAgICBhc09mVmVyc2lvbj86IHN0cmluZyxcbiAgKTogUHJvbWlzZTxGaWxlUHJvcGVydGllc1tdPiB7XG4gICAgaWYgKCFhc09mVmVyc2lvbikge1xuICAgICAgYXNPZlZlcnNpb24gPSB0aGlzLl9jb25uLnZlcnNpb247XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9pbnZva2UoJ2xpc3RNZXRhZGF0YScsIHsgcXVlcmllcywgYXNPZlZlcnNpb24gfSwgW1xuICAgICAgQXBpU2NoZW1hcy5GaWxlUHJvcGVydGllcyxcbiAgICBdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIHN0YXR1cyBvZiBhc3luY2hyb25vdXMgbWV0YWRhdGEgY2FsbHNcbiAgICovXG4gIGNoZWNrU3RhdHVzKGFzeW5jUHJvY2Vzc0lkOiBzdHJpbmcpIHtcbiAgICBjb25zdCByZXMgPSB0aGlzLl9pbnZva2UoXG4gICAgICAnY2hlY2tTdGF0dXMnLFxuICAgICAgeyBhc3luY1Byb2Nlc3NJZCB9LFxuICAgICAgQXBpU2NoZW1hcy5Bc3luY1Jlc3VsdCxcbiAgICApO1xuICAgIHJldHVybiBuZXcgQXN5bmNSZXN1bHRMb2NhdG9yKHRoaXMsIHJlcyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIFhNTCBmaWxlIHJlcHJlc2VudGF0aW9ucyBvZiBjb21wb25lbnRzIGluIGFuIG9yZ2FuaXphdGlvblxuICAgKi9cbiAgcmV0cmlldmUocmVxdWVzdDogUGFydGlhbDxSZXRyaWV2ZVJlcXVlc3Q+KSB7XG4gICAgY29uc3QgcmVzID0gdGhpcy5faW52b2tlKFxuICAgICAgJ3JldHJpZXZlJyxcbiAgICAgIHsgcmVxdWVzdCB9LFxuICAgICAgQXBpU2NoZW1hcy5SZXRyaWV2ZVJlc3VsdCxcbiAgICApO1xuICAgIHJldHVybiBuZXcgUmV0cmlldmVSZXN1bHRMb2NhdG9yKHRoaXMsIHJlcyk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBzdGF0dXMgb2YgZGVjbGFyYXRpdmUgbWV0YWRhdGEgY2FsbCByZXRyaWV2ZSgpIGFuZCByZXR1cm5zIHRoZSB6aXAgZmlsZSBjb250ZW50c1xuICAgKi9cbiAgY2hlY2tSZXRyaWV2ZVN0YXR1cyhhc3luY1Byb2Nlc3NJZDogc3RyaW5nKTogUHJvbWlzZTxSZXRyaWV2ZVJlc3VsdD4ge1xuICAgIHJldHVybiB0aGlzLl9pbnZva2UoXG4gICAgICAnY2hlY2tSZXRyaWV2ZVN0YXR1cycsXG4gICAgICB7IGFzeW5jUHJvY2Vzc0lkIH0sXG4gICAgICBBcGlTY2hlbWFzLlJldHJpZXZlUmVzdWx0LFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogRGVwbG95IGNvbXBvbmVudHMgaW50byBhbiBvcmdhbml6YXRpb24gdXNpbmcgemlwcGVkIGZpbGUgcmVwcmVzZW50YXRpb25zXG4gICAqIHVzaW5nIHRoZSBSRVNUIE1ldGFkYXRhIEFQSSBpbnN0ZWFkIG9mIFNPQVBcbiAgICovXG4gIGRlcGxveVJlc3QoXG4gICAgemlwSW5wdXQ6IEJ1ZmZlcixcbiAgICBvcHRpb25zOiBQYXJ0aWFsPERlcGxveU9wdGlvbnM+ID0ge30sXG4gICk6IERlcGxveVJlc3VsdExvY2F0b3I8Uz4ge1xuICAgIGNvbnN0IGZvcm0gPSBuZXcgRm9ybURhdGEoKTtcbiAgICBmb3JtLmFwcGVuZCgnZmlsZScsIHppcElucHV0LCB7XG4gICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL3ppcCcsXG4gICAgICBmaWxlbmFtZTogJ3BhY2thZ2UueG1sJyxcbiAgICB9KTtcblxuICAgIC8vIEFkZCB0aGUgZGVwbG95IG9wdGlvbnNcbiAgICBmb3JtLmFwcGVuZCgnZW50aXR5X2NvbnRlbnQnLCBKU09OLnN0cmluZ2lmeSh7IGRlcGxveU9wdGlvbnM6IG9wdGlvbnMgfSksIHtcbiAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfSk7XG5cbiAgICBjb25zdCByZXF1ZXN0OiBIdHRwUmVxdWVzdCA9IHtcbiAgICAgIHVybDogJy9tZXRhZGF0YS9kZXBsb3lSZXF1ZXN0JyxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAuLi5mb3JtLmdldEhlYWRlcnMoKSB9LFxuICAgICAgYm9keTogZm9ybS5nZXRCdWZmZXIoKSxcbiAgICB9O1xuICAgIGNvbnN0IHJlcyA9IHRoaXMuX2Nvbm4ucmVxdWVzdDxBc3luY1Jlc3VsdD4ocmVxdWVzdCk7XG5cbiAgICByZXR1cm4gbmV3IERlcGxveVJlc3VsdExvY2F0b3IodGhpcywgcmVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXBsb3kgY29tcG9uZW50cyBpbnRvIGFuIG9yZ2FuaXphdGlvbiB1c2luZyB6aXBwZWQgZmlsZSByZXByZXNlbnRhdGlvbnNcbiAgICovXG4gIGRlcGxveShcbiAgICB6aXBJbnB1dDogUmVhZGFibGUgfCBCdWZmZXIgfCBzdHJpbmcsXG4gICAgb3B0aW9uczogUGFydGlhbDxEZXBsb3lPcHRpb25zPiA9IHt9LFxuICApOiBEZXBsb3lSZXN1bHRMb2NhdG9yPFM+IHtcbiAgICBjb25zdCByZXMgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgemlwQ29udGVudEI2NCA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGlzT2JqZWN0KHppcElucHV0KSAmJlxuICAgICAgICAgICdwaXBlJyBpbiB6aXBJbnB1dCAmJlxuICAgICAgICAgIHR5cGVvZiB6aXBJbnB1dC5waXBlID09PSAnZnVuY3Rpb24nXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IGJ1ZnM6IEJ1ZmZlcltdID0gW107XG4gICAgICAgICAgemlwSW5wdXQub24oJ2RhdGEnLCAoZCkgPT4gYnVmcy5wdXNoKGQpKTtcbiAgICAgICAgICB6aXBJbnB1dC5vbignZXJyb3InLCByZWplY3QpO1xuICAgICAgICAgIHppcElucHV0Lm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKEJ1ZmZlci5jb25jYXQoYnVmcykudG9TdHJpbmcoJ2Jhc2U2NCcpKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyB6aXBJbnB1dC5yZXN1bWUoKTtcbiAgICAgICAgfSBlbHNlIGlmICh6aXBJbnB1dCBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgICAgIHJlc29sdmUoemlwSW5wdXQudG9TdHJpbmcoJ2Jhc2U2NCcpKTtcbiAgICAgICAgfSBlbHNlIGlmICh6aXBJbnB1dCBpbnN0YW5jZW9mIFN0cmluZyB8fCB0eXBlb2YgemlwSW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcmVzb2x2ZSh6aXBJbnB1dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgJ1VuZXhwZWN0ZWQgemlwSW5wdXQgdHlwZSc7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gdGhpcy5faW52b2tlKFxuICAgICAgICAnZGVwbG95JyxcbiAgICAgICAge1xuICAgICAgICAgIFppcEZpbGU6IHppcENvbnRlbnRCNjQsXG4gICAgICAgICAgRGVwbG95T3B0aW9uczogb3B0aW9ucyxcbiAgICAgICAgfSxcbiAgICAgICAgQXBpU2NoZW1hcy5EZXBsb3lSZXN1bHQsXG4gICAgICApO1xuICAgIH0pKCk7XG5cbiAgICByZXR1cm4gbmV3IERlcGxveVJlc3VsdExvY2F0b3IodGhpcywgcmVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIHN0YXR1cyBvZiBkZWNsYXJhdGl2ZSBtZXRhZGF0YSBjYWxsIGRlcGxveSgpXG4gICAqL1xuICBjaGVja0RlcGxveVN0YXR1cyhcbiAgICBhc3luY1Byb2Nlc3NJZDogc3RyaW5nLFxuICAgIGluY2x1ZGVEZXRhaWxzOiBib29sZWFuID0gZmFsc2UsXG4gICk6IFByb21pc2U8RGVwbG95UmVzdWx0PiB7XG4gICAgcmV0dXJuIHRoaXMuX2ludm9rZShcbiAgICAgICdjaGVja0RlcGxveVN0YXR1cycsXG4gICAgICB7XG4gICAgICAgIGFzeW5jUHJvY2Vzc0lkLFxuICAgICAgICBpbmNsdWRlRGV0YWlscyxcbiAgICAgIH0sXG4gICAgICBBcGlTY2hlbWFzLkRlcGxveVJlc3VsdCxcbiAgICApO1xuICB9XG59XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4vKipcbiAqIFRoZSBsb2NhdG9yIGNsYXNzIGZvciBNZXRhZGF0YSBBUEkgYXN5bmNocm9ub3VzIGNhbGwgcmVzdWx0XG4gKi9cbmV4cG9ydCBjbGFzcyBBc3luY1Jlc3VsdExvY2F0b3I8XG4gIFMgZXh0ZW5kcyBTY2hlbWEsXG4gIFIgZXh0ZW5kcyB7fSA9IEFzeW5jUmVzdWx0XG4+IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgX21ldGE6IE1ldGFkYXRhQXBpPFM+O1xuICBfcHJvbWlzZTogUHJvbWlzZTxBc3luY1Jlc3VsdD47XG4gIF9pZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgY29uc3RydWN0b3IobWV0YTogTWV0YWRhdGFBcGk8Uz4sIHByb21pc2U6IFByb21pc2U8QXN5bmNSZXN1bHQ+KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9tZXRhID0gbWV0YTtcbiAgICB0aGlzLl9wcm9taXNlID0gcHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9taXNlL0ErIGludGVyZmFjZVxuICAgKiBodHRwOi8vcHJvbWlzZXMtYXBsdXMuZ2l0aHViLmlvL3Byb21pc2VzLXNwZWMvXG4gICAqXG4gICAqIEBtZXRob2QgTWV0YWRhdGF+QXN5bmNSZXN1bHRMb2NhdG9yI3RoZW5cbiAgICovXG4gIHRoZW48VSwgVj4oXG4gICAgb25SZXNvbHZlPzogKChyZXN1bHQ6IEFzeW5jUmVzdWx0KSA9PiBVIHwgUHJvbWlzZTxVPikgfCBudWxsIHwgdW5kZWZpbmVkLFxuICAgIG9uUmVqZWN0PzogKChlcnI6IEVycm9yKSA9PiBWIHwgUHJvbWlzZTxWPikgfCBudWxsIHwgdW5kZWZpbmVkLFxuICApOiBQcm9taXNlPFUgfCBWPiB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb21pc2UudGhlbihvblJlc29sdmUsIG9uUmVqZWN0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB0aGUgc3RhdHVzIG9mIGFzeW5jIHJlcXVlc3RcbiAgICovXG4gIGFzeW5jIGNoZWNrKCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX3Byb21pc2U7XG4gICAgdGhpcy5faWQgPSByZXN1bHQuaWQ7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX21ldGEuY2hlY2tTdGF0dXMocmVzdWx0LmlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQb2xsaW5nIHVudGlsIGFzeW5jIGNhbGwgc3RhdHVzIGJlY29tZXMgY29tcGxldGUgb3IgZXJyb3JcbiAgICovXG4gIHBvbGwoaW50ZXJ2YWw6IG51bWJlciwgdGltZW91dDogbnVtYmVyKSB7XG4gICAgY29uc3Qgc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgY29uc3QgcG9sbCA9IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBpZiAoc3RhcnRUaW1lICsgdGltZW91dCA8IG5vdykge1xuICAgICAgICAgIGxldCBlcnJNc2cgPSAnUG9sbGluZyB0aW1lIG91dC4nO1xuICAgICAgICAgIGlmICh0aGlzLl9pZCkge1xuICAgICAgICAgICAgZXJyTXNnICs9ICcgUHJvY2VzcyBJZCA9ICcgKyB0aGlzLl9pZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIG5ldyBFcnJvcihlcnJNc2cpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5jaGVjaygpO1xuICAgICAgICBpZiAocmVzdWx0LmRvbmUpIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJ2NvbXBsZXRlJywgcmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJ3Byb2dyZXNzJywgcmVzdWx0KTtcbiAgICAgICAgICBzZXRUaW1lb3V0KHBvbGwsIGludGVydmFsKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgfVxuICAgIH07XG4gICAgc2V0VGltZW91dChwb2xsLCBpbnRlcnZhbCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgYW5kIHdhaXQgdW50aWwgdGhlIGFzeW5jIHJlcXVlc3RzIGJlY29tZSBpbiBjb21wbGV0ZWQgc3RhdHVzXG4gICAqL1xuICBjb21wbGV0ZSgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8Uj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5vbignY29tcGxldGUnLCByZXNvbHZlKTtcbiAgICAgIHRoaXMub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgIHRoaXMucG9sbCh0aGlzLl9tZXRhLnBvbGxJbnRlcnZhbCwgdGhpcy5fbWV0YS5wb2xsVGltZW91dCk7XG4gICAgfSk7XG4gIH1cbn1cblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKipcbiAqIFRoZSBsb2NhdG9yIGNsYXNzIHRvIHRyYWNrIHJldHJlaXZlKCkgTWV0YWRhdGEgQVBJIGNhbGwgcmVzdWx0XG4gKi9cbmV4cG9ydCBjbGFzcyBSZXRyaWV2ZVJlc3VsdExvY2F0b3I8UyBleHRlbmRzIFNjaGVtYT4gZXh0ZW5kcyBBc3luY1Jlc3VsdExvY2F0b3I8XG4gIFMsXG4gIFJldHJpZXZlUmVzdWx0XG4+IHtcbiAgLyoqXG4gICAqIENoZWNrIGFuZCB3YWl0IHVudGlsIHRoZSBhc3luYyByZXF1ZXN0IGJlY29tZXMgaW4gY29tcGxldGVkIHN0YXR1cyxcbiAgICogYW5kIHJldHJpZXZlIHRoZSByZXN1bHQgZGF0YS5cbiAgICovXG4gIGFzeW5jIGNvbXBsZXRlKCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHN1cGVyLmNvbXBsZXRlKCk7XG4gICAgcmV0dXJuIHRoaXMuX21ldGEuY2hlY2tSZXRyaWV2ZVN0YXR1cyhyZXN1bHQuaWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZSB0aGUgcmV0cmlldmVkIHJlc3VsdCB0byBOb2RlLmpzIHJlYWRhYmxlIHN0cmVhbVxuICAgKi9cbiAgc3RyZWFtKCkge1xuICAgIGNvbnN0IHJlc3VsdFN0cmVhbSA9IG5ldyBSZWFkYWJsZSgpO1xuICAgIGxldCByZWFkaW5nID0gZmFsc2U7XG4gICAgcmVzdWx0U3RyZWFtLl9yZWFkID0gYXN5bmMgKCkgPT4ge1xuICAgICAgaWYgKHJlYWRpbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmVhZGluZyA9IHRydWU7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmNvbXBsZXRlKCk7XG4gICAgICAgIHJlc3VsdFN0cmVhbS5wdXNoKEJ1ZmZlci5mcm9tKHJlc3VsdC56aXBGaWxlLCAnYmFzZTY0JykpO1xuICAgICAgICByZXN1bHRTdHJlYW0ucHVzaChudWxsKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmVzdWx0U3RyZWFtLmVtaXQoJ2Vycm9yJywgZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0U3RyZWFtO1xuICB9XG59XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyoqXG4gKiBUaGUgbG9jYXRvciBjbGFzcyB0byB0cmFjayBkZXBsb3koKSBNZXRhZGF0YSBBUEkgY2FsbCByZXN1bHRcbiAqXG4gKiBAcHJvdGVjdGVkXG4gKiBAY2xhc3MgTWV0YWRhdGF+RGVwbG95UmVzdWx0TG9jYXRvclxuICogQGV4dGVuZHMgTWV0YWRhdGF+QXN5bmNSZXN1bHRMb2NhdG9yXG4gKiBAcGFyYW0ge01ldGFkYXRhfSBtZXRhIC0gTWV0YWRhdGEgQVBJIG9iamVjdFxuICogQHBhcmFtIHtQcm9taXNlLjxNZXRhZGF0YX5Bc3luY1Jlc3VsdD59IHJlc3VsdCAtIFByb21pc2Ugb2JqZWN0IGZvciBhc3luYyByZXN1bHQgb2YgZGVwbG95KCkgY2FsbFxuICovXG5leHBvcnQgY2xhc3MgRGVwbG95UmVzdWx0TG9jYXRvcjxTIGV4dGVuZHMgU2NoZW1hPiBleHRlbmRzIEFzeW5jUmVzdWx0TG9jYXRvcjxcbiAgUyxcbiAgRGVwbG95UmVzdWx0XG4+IHtcbiAgLyoqXG4gICAqIENoZWNrIGFuZCB3YWl0IHVudGlsIHRoZSBhc3luYyByZXF1ZXN0IGJlY29tZXMgaW4gY29tcGxldGVkIHN0YXR1cyxcbiAgICogYW5kIHJldHJpZXZlIHRoZSByZXN1bHQgZGF0YS5cbiAgICovXG4gIGFzeW5jIGNvbXBsZXRlKGluY2x1ZGVEZXRhaWxzPzogYm9vbGVhbikge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHN1cGVyLmNvbXBsZXRlKCk7XG4gICAgcmV0dXJuIHRoaXMuX21ldGEuY2hlY2tEZXBsb3lTdGF0dXMocmVzdWx0LmlkLCBpbmNsdWRlRGV0YWlscyk7XG4gIH1cbn1cblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKlxuICogUmVnaXN0ZXIgaG9vayBpbiBjb25uZWN0aW9uIGluc3RhbnRpYXRpb24gZm9yIGR5bmFtaWNhbGx5IGFkZGluZyB0aGlzIEFQSSBtb2R1bGUgZmVhdHVyZXNcbiAqL1xucmVnaXN0ZXJNb2R1bGUoJ21ldGFkYXRhJywgKGNvbm4pID0+IG5ldyBNZXRhZGF0YUFwaShjb25uKSk7XG5cbmV4cG9ydCBkZWZhdWx0IE1ldGFkYXRhQXBpO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBRUE7O0FBZ0JBO0VBQUE7RUFBQTtFQUFBOztFQUFBO0lBQUE7SUFBQTtNQUFBO0lBQUE7RUFBQTtBQUFBOzs7Ozs7OztBQXFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTQSwwQkFBVCxDQUF3REMsUUFBeEQsRUFBd0U7RUFDdEUsYUFBcUJBLFFBQXJCO0VBQUEsTUFBTTtJQUFFQztFQUFGLENBQU47RUFBQSxNQUFjQyxFQUFkO0VBQ0EsT0FBT0EsRUFBUDtBQUNEOztBQUVELFNBQVNDLHNCQUFULENBQWdDSCxRQUFoQyxFQUFpRUksSUFBakUsRUFBK0U7RUFDN0UsTUFBTUMsT0FBTyxHQUFJSCxFQUFEO0lB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