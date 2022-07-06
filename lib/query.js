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

exports.default = exports.SubQuery = exports.ResponseTargets = exports.Query = void 0;

require("core-js/modules/es.array.sort.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.promise.js");

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/reduce"));

var _sort = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/sort"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/includes"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));

var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/entries"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys"));

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/concat"));

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));

var _events = require("events");

var _logger = require("./util/logger");

var _recordStream = _interopRequireWildcard(require("./record-stream"));

var _soqlBuilder = require("./soql-builder");

const _excluded = ["fields", "includes", "sort"],
      _excluded2 = ["conditions", "fields"];

function _getRequireWildcardCache(nodeInterop) { if (typeof _WeakMap !== "function") return null; var cacheBabelInterop = new _WeakMap(); var cacheNodeInterop = new _WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = _Object$defineProperty && _Object$getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? _Object$getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { _Object$defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = _Object$keys2(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context13, _context14; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context13 = ownKeys(Object(source), !0)).call(_context13, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context14 = ownKeys(Object(source))).call(_context14, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

const ResponseTargetValues = ['QueryResult', 'Records', 'SingleRecord', 'Count'];
const ResponseTargets = (0, _reduce.default)(ResponseTargetValues).call(ResponseTargetValues, (values, target) => _objectSpread(_objectSpread({}, values), {}, {
  [target]: target
}), {});
exports.ResponseTargets = ResponseTargets;

/**
 *
 */
const DEFAULT_BULK_THRESHOLD = 200;
/**
 * Query
 */

class Query extends _events.EventEmitter {
  /**
   *
   */
  constructor(conn, config, options) {
    super();
    (0, _defineProperty2.default)(this, "_conn", void 0);
    (0, _defineProperty2.default)(this, "_logger", void 0);
    (0, _defineProperty2.default)(this, "_soql", void 0);
    (0, _defineProperty2.default)(this, "_locator", void 0);
    (0, _defineProperty2.default)(this, "_config", {});
    (0, _defineProperty2.default)(this, "_children", []);
    (0, _defineProperty2.default)(this, "_options", void 0);
    (0, _defineProperty2.default)(this, "_executed", false);
    (0, _defineProperty2.default)(this, "_finished", false);
    (0, _defineProperty2.default)(this, "_chaining", false);
    (0, _defineProperty2.default)(this, "_promise", void 0);
    (0, _defineProperty2.default)(this, "_stream", void 0);
    (0, _defineProperty2.default)(this, "totalSize", 0);
    (0, _defineProperty2.default)(this, "totalFetched", 0);
    (0, _defineProperty2.default)(this, "records", []);
    (0, _defineProperty2.default)(this, "offset", this.skip);
    (0, _defineProperty2.default)(this, "orderby", (0, _sort.default)(this));
    (0, _defineProperty2.default)(this, "exec", this.execute);
    (0, _defineProperty2.default)(this, "run", this.execute);
    (0, _defineProperty2.default)(this, "delete", this.destroy);
    (0, _defineProperty2.default)(this, "del", this.destroy);
    this._conn = conn;
    this._logger = conn._logLevel ? Query._logger.createInstance(conn._logLevel) : Query._logger;

    if (typeof config === 'string') {
      this._soql = config;

      this._logger.debug(`config is soql: ${config}`);
    } else if (typeof config.locator === 'string') {
      const locator = config.locator;

      this._logger.debug(`config is locator: ${locator}`);

      this._locator = (0, _includes.default)(locator).call(locator, '/') ? this.urlToLocator(locator) : locator;
    } else {
      this._logger.debug(`config is QueryConfig: ${config}`);

      const _ref = config,
            {
        fields,
        includes,
        sort
      } = _ref,
            _config = (0, _objectWithoutProperties2.default)(_ref, _excluded);

      this._config = _config;
      this.select(fields);

      if (includes) {
        this.includeChildren(includes);
      }

      if (sort) {
        var _context;

        (0, _sort.default)(_context = this).call(_context, sort);
      }
    }

    this._options = _objectSpread({
      headers: {},
      maxFetch: 10000,
      autoFetch: false,
      scanAll: false,
      responseTarget: 'QueryResult'
    }, options || {}); // promise instance

    this._promise = new _promise.default((resolve, reject) => {
      this.on('response', resolve);
      this.on('error', reject);
    });
    this._stream = new _recordStream.Serializable();
    this.on('record', record => this._stream.push(record));
    this.on('end', () => this._stream.push(null));
    this.on('error', err => {
      try {
        this._stream.emit('error', err);
      } catch (e) {// eslint-disable-line no-empty
      }
    });
  }
  /**
   * Select fields to include in the returning result
   */


  select(fields = '*') {
    if (this._soql) {
      throw Error('Cannot set select fields for the query which has already built SOQL.');
    }

    function toFieldArray(fields) {
      var _context2, _context3, _context4, _context5;

      return typeof fields === 'string' ? fields.split(/\s*,\s*/) : (0, _isArray.default)(fields) ? (0, _reduce.default)(_context2 = (0, _map.default)(_context3 = fields).call(_context3, toFieldArray)).call(_context2, (fs, f) => [...fs, ...f], []) : (0, _reduce.default)(_context4 = (0, _map.default)(_context5 = (0, _entries.default)(fields)).call(_context5, ([f, v]) => {
        if (typeof v === 'number' || typeof v === 'boolean') {
          return v ? [f] : [];
        } else {
          var _context6;

          return (0, _map.default)(_context6 = toFieldArray(v)).call(_context6, p => `${f}.${p}`);
        }
      })).call(_context4, (fs, f) => [...fs, ...f], []);
    }

    if (fields) {
      this._config.fields = toFieldArray(fields);
    } // force convert query record type without changing instance;


    return this;
  }
  /**
   * Set query conditions to filter the result records
   */


  where(conditions) {
    if (this._soql) {
      throw Error('Cannot set where conditions for the query which has already built SOQL.');
    }

    this._config.conditions = conditions;
    return this;
  }
  /**
   * Limit the returning result
   */


  limit(limit) {
    if (this._soql) {
      throw Error('Cannot set limit for the query which has already built SOQL.');
    }

    this._config.limit = limit;
    return this;
  }
  /**
   * Skip records
   */


  skip(offset) {
    if (this._soql) {
      throw Error('Cannot set skip/offset for the query which has already built SOQL.');
    }

    this._config.offset = offset;
    return this;
  }
  /**
   * Synonym of Query#skip()
   */


  sort(sort, dir) {
    if (this._soql) {
      throw Error('Cannot set sort for the query which has already built SOQL.');
    }

    if (typeof sort === 'string' && typeof dir !== 'undefined') {
      this._config.sort = [[sort, dir]];
    } else {
      this._config.sort = sort;
    }

    return this;
  }
  /**
   * Synonym of Query#sort()
   */


  include(childRelName, conditions, fields, options = {}) {
    if (this._soql) {
      throw Error('Cannot include child relationship into the query which has already built SOQL.');
    }

    const childConfig = {
      fields: fields === null ? undefined : fields,
      table: childRelName,
      conditions: conditions === null ? undefined : conditions,
      limit: options.limit,
      offset: options.offset,
      sort: (0, _sort.default)(options)
    }; // eslint-disable-next-line no-use-before-define

    const childQuery = new SubQuery(this._conn, childRelName, childConfig, this);

    this._children.push(childQuery);

    return childQuery;
  }
  /**
   * Include child relationship queries, but not moving down to the children context
   */


  includeChildren(includes) {
    if (this._soql) {
      throw Error('Cannot include child relationship into the query which has already built SOQL.');
    }

    for (const crname of (0, _keys.default)(includes)) {
      const _ref2 = includes[crname],
            {
        conditions,
        fields
      } = _ref2,
            options = (0, _objectWithoutProperties2.default)(_ref2, _excluded2);
      this.include(crname, conditions, fields, options);
    }

    return this;
  }
  /**
   * Setting maxFetch query option
   */


  maxFetch(maxFetch) {
    this._options.maxFetch = maxFetch;
    return this;
  }
  /**
   * Switching auto fetch mode
   */


  autoFetch(autoFetch) {
    this._options.autoFetch = autoFetch;
    return this;
  }
  /**
   * Set flag to scan all records including deleted and archived.
   */


  scanAll(scanAll) {
    this._options.scanAll = scanAll;
    return this;
  }
  /**
   *
   */


  setResponseTarget(responseTarget) {
    if (responseTarget in ResponseTargets) {
      this._options.responseTarget = responseTarget;
    } // force change query response target without changing instance


    return this;
  }
  /**
   * Execute query and fetch records from server.
   */


  execute(options_ = {}) {
    if (this._executed) {
      throw new Error('re-executing already executed query');
    }

    if (this._finished) {
      throw new Error('executing already closed query');
    }

    const options = {
      headers: options_.headers || this._options.headers,
      responseTarget: options_.responseTarget || this._options.responseTarget,
      autoFetch: options_.autoFetch || this._options.autoFetch,
      maxFetch: options_.maxFetch || this._options.maxFetch,
      scanAll: options_.scanAll || this._options.scanAll
    }; // collect fetched records in array
    // only when response target is Records and
    // either callback or chaining promises are available to this query.

    this.once('fetch', () => {
      if (options.responseTarget === ResponseTargets.Records && this._chaining) {
        this._logger.debug('--- collecting all fetched records ---');

        const records = [];

        const onRecord = record => records.push(record);

        this.on('record', onRecord);
        this.once('end', () => {
          this.removeListener('record', onRecord);
          this.emit('response', records, this);
        });
      }
    }); // flag to prevent re-execution

    this._executed = true;

    (async () => {
      // start actual query
      this._logger.debug('>>> Query start >>>');

      try {
        await this._execute(options);

        this._logger.debug('*** Query finished ***');
      } catch (error) {
        this._logger.debug('--- Query error ---', error);

        this.emit('error', error);
      }
    })(); // return Query instance for chaining


    return this;
  }
  /**
   * Synonym of Query#execute()
   */


  locatorToUrl() {
    return this._locator ? [this._conn._baseUrl(), '/query/', this._locator].join('') : '';
  }

  urlToLocator(url) {
    return url.split('/').pop();
  }

  constructResponse(rawDone, responseTarget) {
    var _this$records$, _this$records;

    switch (responseTarget) {
      case 'Count':
        return this.totalSize;

      case 'SingleRecord':
        return (_this$records$ = (_this$records = this.records) === null || _this$records === void 0 ? void 0 : _this$records[0]) !== null && _this$records$ !== void 0 ? _this$records$ : null;

      case 'Records':
        return this.records;
      // QueryResult is default response target

      default:
        return _objectSpread(_objectSpread({}, {
          records: this.records,
          totalSize: this.totalSize,
          done: rawDone !== null && rawDone !== void 0 ? rawDone : true // when no records, done is omitted

        }), this._locator ? {
          nextRecordsUrl: this.locatorToUrl()
        } : {});
    }
  }
  /**
   * @private
   */


  async _execute(options) {
    var _this$records2, _context7, _data$records$length, _data$records;

    const {
      headers,
      responseTarget,
      autoFetch,
      maxFetch,
      scanAll
    } = options;

    this._logger.debug('execute with options', options);

    let url;

    if (this._locator) {
      url = this.locatorToUrl();
    } else {
      const soql = await this.toSOQL();

      this._logger.debug(`SOQL = ${soql}`);

      url = [this._conn._baseUrl(), '/', scanAll ? 'queryAll' : 'query', '?q=', encodeURIComponent(soql)].join('');
    }

    const data = await this._conn.request({
      method: 'GET',
      url,
      headers
    });
    this.emit('fetch');
    this.totalSize = data.totalSize;
    this.records = (_this$records2 = this.records) === null || _this$records2 === void 0 ? void 0 : (0, _concat.default)(_this$records2).call(_this$records2, maxFetch - this.records.length > data.records.length ? data.records : (0, _slice.default)(_context7 = data.records).call(_context7, 0, maxFetch - this.records.length));
    this._locator = data.nextRecordsUrl ? this.urlToLocator(data.nextRecordsUrl) : undefined;
    this._finished = this._finished || data.done || !autoFetch || // this is what the response looks like when there are no results
    data.records.length === 0 && data.done === undefined; // streaming record instances

    const numRecords = (_data$records$length = (_data$records = data.records) === null || _data$records === void 0 ? void 0 : _data$records.length) !== null && _data$records$length !== void 0 ? _data$records$length : 0;
    let totalFetched = this.totalFetched;

    for (let i = 0; i < numRecords; i++) {
      if (totalFetched >= maxFetch) {
        this._finished = true;
        break;
      }

      const record = data.records[i];
      this.emit('record', record, totalFetched, this);
      totalFetched += 1;
    }

    this.totalFetched = totalFetched;

    if (this._finished) {
      const response = this.constructResponse(data.done, responseTarget); // only fire response event when it should be notified per fetch

      if (responseTarget !== ResponseTargets.Records) {
        this.emit('response', response, this);
      }

      this.emit('end');
      return response;
    } else {
      return this._execute(options);
    }
  }
  /**
   * Obtain readable stream instance
   */


  stream(type = 'csv') {
    if (!this._finished && !this._executed) {
      this.execute({
        autoFetch: true
      });
    }

    return type === 'record' ? this._stream : this._stream.stream(type);
  }
  /**
   * Pipe the queried records to another stream
   * This is for backward compatibility; Query is not a record stream instance anymore in 2.0.
   * If you want a record stream instance, use `Query#stream('record')`.
   */


  pipe(stream) {
    return this.stream('record').pipe(stream);
  }
  /**
   * @protected
   */


  async _expandFields(sobject_) {
    var _context8, _context9, _context10;

    if (this._soql) {
      throw new Error('Cannot expand fields for the query which has already built SOQL.');
    }

    const {
      fields = [],
      table = ''
    } = this._config;
    const sobject = sobject_ || table;

    this._logger.debug(`_expandFields: sobject = ${sobject}, fields = ${fields.join(', ')}`);

    const [efields] = await _promise.default.all([this._expandAsteriskFields(sobject, fields), ...(0, _map.default)(_context8 = this._children).call(_context8, async childQuery => {
      await childQuery._expandFields();
      return [];
    })]);
    this._config.fields = efields;
    this._config.includes = (0, _reduce.default)(_context9 = (0, _map.default)(_context10 = this._children).call(_context10, cquery => {
      const cconfig = cquery._query._config;
      return [cconfig.table, cconfig];
    })).call(_context9, (includes, [ctable, cconfig]) => _objectSpread(_objectSpread({}, includes), {}, {
      [ctable]: cconfig
    }), {});
  }
  /**
   *
   */


  async _findRelationObject(relName) {
    const table = this._config.table;

    if (!table) {
      throw new Error('No table information provided in the query');
    }

    this._logger.debug(`finding table for relation "${relName}" in "${table}"...`);

    const sobject = await this._conn.describe$(table);
    const upperRname = relName.toUpperCase();

    for (const cr of sobject.childRelationships) {
      if ((cr.relationshipName || '').toUpperCase() === upperRname && cr.childSObject) {
        return cr.childSObject;
      }
    }

    throw new Error(`No child relationship found: ${relName}`);
  }
  /**
   *
   */


  async _expandAsteriskFields(sobject, fields) {
    const expandedFields = await _promise.default.all((0, _map.default)(fields).call(fields, async field => this._expandAsteriskField(sobject, field)));
    return (0, _reduce.default)(expandedFields).call(expandedFields, (eflds, flds) => [...eflds, ...flds], []);
  }
  /**
   *
   */


  async _expandAsteriskField(sobject, field) {
    this._logger.debug(`expanding field "${field}" in "${sobject}"...`);

    const fpath = field.split('.');

    if (fpath[fpath.length - 1] === '*') {
      var _context11;

      const so = await this._conn.describe$(sobject);

      this._logger.debug(`table ${sobject} has been described`);

      if (fpath.length > 1) {
        const rname = fpath.shift();

        for (const f of so.fields) {
          if (f.relationshipName && rname && f.relationshipName.toUpperCase() === rname.toUpperCase()) {
            const rfield = f;
            const referenceTo = rfield.referenceTo || [];
            const rtable = referenceTo.length === 1 ? referenceTo[0] : 'Name';
            const fpaths = await this._expandAsteriskField(rtable, fpath.join('.'));
            return (0, _map.default)(fpaths).call(fpaths, fp => `${rname}.${fp}`);
          }
        }

        return [];
      }

      return (0, _map.default)(_context11 = so.fields).call(_context11, f => f.name);
    }

    return [field];
  }
  /**
   * Explain plan for executing query
   */


  async explain() {
    const soql = await this.toSOQL();

    this._logger.debug(`SOQL = ${soql}`);

    const url = `/query/?explain=${encodeURIComponent(soql)}`;
    return this._conn.request(url);
  }
  /**
   * Return SOQL expression for the query
   */


  async toSOQL() {
    if (this._soql) {
      return this._soql;
    }

    await this._expandFields();
    return (0, _soqlBuilder.createSOQL)(this._config);
  }
  /**
   * Promise/A+ interface
   * http://promises-aplus.github.io/promises-spec/
   *
   * Delegate to deferred promise, return promise instance for query result
   */


  then(onResolve, onReject) {
    this._chaining = true;

    if (!this._finished && !this._executed) {
      this.execute();
    }

    if (!this._promise) {
      throw new Error('invalid state: promise is not set after query execution');
    }

    return this._promise.then(onResolve, onReject);
  }

  catch(onReject) {
    return this.then(null, onReject);
  }

  promise() {
    return _promise.default.resolve(this);
  }
  /**
   * Bulk delete queried records
   */


  destroy(type, options) {
    if (typeof type === 'object' && type !== null) {
      options = type;
      type = undefined;
    }

    options = options || {};
    const type_ = type || this._config.table;

    if (!type_) {
      throw new Error('SOQL based query needs SObject type information to bulk delete.');
    } // Set the threshold number to pass to bulk API


    const thresholdNum = options.allowBulk === false ? -1 : typeof options.bulkThreshold === 'number' ? options.bulkThreshold : // determine threshold if the connection version supports SObject collection API or not
    this._conn._ensureVersion(42) ? DEFAULT_BULK_THRESHOLD : this._conn._maxRequest / 2;
    return new _promise.default((resolve, reject) => {
      const createBatch = () => this._conn.sobject(type_).deleteBulk().on('response', resolve).on('error', reject);

      let records = [];
      let batch = null;

      const handleRecord = rec => {
        if (!rec.Id) {
          const err = new Error('Queried record does not include Salesforce record ID.');
          this.emit('error', err);
          return;
        }

        const record = {
          Id: rec.Id
        };

        if (batch) {
          batch.write(record);
        } else {
          records.push(record);

          if (thresholdNum >= 0 && records.length > thresholdNum) {
            // Use bulk delete instead of SObject REST API
            batch = createBatch();

            for (const record of records) {
              batch.write(record);
            }

            records = [];
          }
        }
      };

      const handleEnd = () => {
        if (batch) {
          batch.end();
        } else {
          const ids = (0, _map.default)(records).call(records, record => record.Id);

          this._conn.sobject(type_).destroy(ids, {
            allowRecursive: true
          }).then(resolve, reject);
        }
      };

      this.stream('record').on('data', handleRecord).on('end', handleEnd).on('error', reject);
    });
  }
  /**
   * Synonym of Query#destroy()
   */


  update(mapping, type, options) {
    if (typeof type === 'object' && type !== null) {
      options = type;
      type = undefined;
    }

    options = options || {};
    const type_ = type || this._config && this._config.table;

    if (!type_) {
      throw new Error('SOQL based query needs SObject type information to bulk update.');
    }

    const updateStream = typeof mapping === 'function' ? (0, _map.default)(_recordStream.default).call(_recordStream.default, mapping) : _recordStream.default.recordMapStream(mapping); // Set the threshold number to pass to bulk API

    const thresholdNum = options.allowBulk === false ? -1 : typeof options.bulkThreshold === 'number' ? options.bulkThreshold : // determine threshold if the connection version supports SObject collection API or not
    this._conn._ensureVersion(42) ? DEFAULT_BULK_THRESHOLD : this._conn._maxRequest / 2;
    return new _promise.default((resolve, reject) => {
      const createBatch = () => this._conn.sobject(type_).updateBulk().on('response', resolve).on('error', reject);

      let records = [];
      let batch = null;

      const handleRecord = record => {
        if (batch) {
          batch.write(record);
        } else {
          records.push(record);
        }

        if (thresholdNum >= 0 && records.length > thresholdNum) {
          // Use bulk update instead of SObject REST API
          batch = createBatch();

          for (const record of records) {
            batch.write(record);
          }

          records = [];
        }
      };

      const handleEnd = () => {
        if (batch) {
          batch.end();
        } else {
          this._conn.sobject(type_).update(records, {
            allowRecursive: true
          }).then(resolve, reject);
        }
      };

      this.stream('record').on('error', reject).pipe(updateStream).on('data', handleRecord).on('end', handleEnd).on('error', reject);
    });
  }

}
/*--------------------------------------------*/

/**
 * SubQuery object for representing child relationship query
 */


exports.Query = Query;
(0, _defineProperty2.default)(Query, "_logger", (0, _logger.getLogger)('query'));

class SubQuery {
  /**
   *
   */
  constructor(conn, relName, config, parent) {
    (0, _defineProperty2.default)(this, "_relName", void 0);
    (0, _defineProperty2.default)(this, "_query", void 0);
    (0, _defineProperty2.default)(this, "_parent", void 0);
    (0, _defineProperty2.default)(this, "offset", this.skip);
    (0, _defineProperty2.default)(this, "orderby", (0, _sort.default)(this));
    this._relName = relName;
    this._query = new Query(conn, config);
    this._parent = parent;
  }
  /**
   *
   */


  select(fields) {
    // force convert query record type without changing instance
    this._query = this._query.select(fields);
    return this;
  }
  /**
   *
   */


  where(conditions) {
    this._query = this._query.where(conditions);
    return this;
  }
  /**
   * Limit the returning result
   */


  limit(limit) {
    this._query = this._query.limit(limit);
    return this;
  }
  /**
   * Skip records
   */


  skip(offset) {
    this._query = this._query.skip(offset);
    return this;
  }
  /**
   * Synonym of SubQuery#skip()
   */


  sort(sort, dir) {
    var _context12;

    this._query = (0, _sort.default)(_context12 = this._query).call(_context12, sort, dir);
    return this;
  }
  /**
   * Synonym of SubQuery#sort()
   */


  /**
   *
   */
  async _expandFields() {
    const sobject = await this._parent._findRelationObject(this._relName);
    return this._query._expandFields(sobject);
  }
  /**
   * Back the context to parent query object
   */


  end() {
    return this._parent;
  }

}

exports.SubQuery = SubQuery;
var _default = Query;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZXNwb25zZVRhcmdldFZhbHVlcyIsIlJlc3BvbnNlVGFyZ2V0cyIsInZhbHVlcyIsInRhcmdldCIsIkRFRkFVTFRfQlVMS19USFJFU0hPTEQiLCJRdWVyeSIsIkV2ZW50RW1pdHRlciIsImNvbnN0cnVjdG9yIiwiY29ubiIsImNvbmZpZyIsIm9wdGlvbnMiLCJza2lwIiwiZXhlY3V0ZSIsImRlc3Ryb3kiLCJfY29ubiIsIl9sb2dnZXIiLCJfbG9nTGV2ZWwiLCJjcmVhdGVJbnN0YW5jZSIsIl9zb3FsIiwiZGVidWciLCJsb2NhdG9yIiwiX2xvY2F0b3IiLCJ1cmxUb0xvY2F0b3IiLCJmaWVsZHMiLCJpbmNsdWRlcyIsInNvcnQiLCJfY29uZmlnIiwic2VsZWN0IiwiaW5jbHVkZUNoaWxkcmVuIiwiX29wdGlvbnMiLCJoZWFkZXJzIiwibWF4RmV0Y2giLCJhdXRvRmV0Y2giLCJzY2FuQWxsIiwicmVzcG9uc2VUYXJnZXQiLCJfcHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJvbiIsIl9zdHJlYW0iLCJTZXJpYWxpemFibGUiLCJyZWNvcmQiLCJwdXNoIiwiZXJyIiwiZW1pdCIsImUiLCJFcnJvciIsInRvRmllbGRBcnJheSIsInNwbGl0IiwiZnMiLCJmIiwidiIsInAiLCJ3aGVyZSIsImNvbmRpdGlvbnMiLCJsaW1pdCIsIm9mZnNldCIsImRpciIsImluY2x1ZGUiLCJjaGlsZFJlbE5hbWUiLCJjaGlsZENvbmZpZyIsInVuZGVmaW5lZCIsInRhYmxlIiwiY2hpbGRRdWVyeSIsIlN1YlF1ZXJ5IiwiX2NoaWxkcmVuIiwiY3JuYW1lIiwic2V0UmVzcG9uc2VUYXJnZXQiLCJvcHRpb25zXyIsIl9leGVjdXRlZCIsIl9maW5pc2hlZCIsIm9uY2UiLCJSZWNvcmRzIiwiX2NoYWluaW5nIiwicmVjb3JkcyIsIm9uUmVjb3JkIiwicmVtb3ZlTGlzdGVuZXIiLCJfZXhlY3V0ZSIsImVycm9yIiwibG9jYXRvclRvVXJsIiwiX2Jhc2VVcmwiLCJqb2luIiwidXJsIiwicG9wIiwiY29uc3RydWN0UmVzcG9uc2UiLCJyYXdEb25lIiwidG90YWxTaXplIiwiZG9uZSIsIm5leHRSZWNvcmRzVXJsIiwic29xbCIsInRvU09RTCIsImVuY29kZVVSSUNvbXBvbmVudCIsImRhdGEiLCJyZXF1ZXN0IiwibWV0aG9kIiwibGVuZ3RoIiwibnVtUmVjb3JkcyIsInRvdGFsRmV0Y2hlZCIsImkiLCJyZXNwb25zZSIsInN0cmVhbSIsInR5cGUiLCJwaXBlIiwiX2V4cGFuZEZpZWxkcyIsInNvYmplY3RfIiwic29iamVjdCIsImVmaWVsZHMiLCJhbGwiLCJfZXhwYW5kQXN0ZXJpc2tGaWVsZHMiLCJjcXVlcnkiLCJjY29uZmlnIiwiX3F1ZXJ5IiwiY3RhYmxlIiwiX2ZpbmRSZWxhdGlvbk9iamVjdCIsInJlbE5hbWUiLCJkZXNjcmliZSQiLCJ1cHBlclJuYW1lIiwidG9VcHBlckNhc2UiLCJjciIsImNoaWxkUmVsYXRpb25zaGlwcyIsInJlbGF0aW9uc2hpcE5hbWUiLCJjaGlsZFNPYmplY3QiLCJleHBhbmRlZEZpZWxkcyIsImZpZWxkIiwiX2V4cGFuZEFzdGVyaXNrRmllbGQiLCJlZmxkcyIsImZsZHMiLCJmcGF0aCIsInNvIiwicm5hbWUiLCJzaGlmdCIsInJmaWVsZCIsInJlZmVyZW5jZVRvIiwicnRhYmxlIiwiZnBhdGhzIiwiZnAiLCJuYW1lIiwiZXhwbGFpbiIsImNyZWF0ZVNPUUwiLCJ0aGVuIiwib25SZXNvbHZlIiwib25SZWplY3QiLCJjYXRjaCIsInByb21pc2UiLCJ0eXBlXyIsInRocmVzaG9sZE51bSIsImFsbG93QnVsayIsImJ1bGtUaHJlc2hvbGQiLCJfZW5zdXJlVmVyc2lvbiIsIl9tYXhSZXF1ZXN0IiwiY3JlYXRlQmF0Y2giLCJkZWxldGVCdWxrIiwiYmF0Y2giLCJoYW5kbGVSZWNvcmQiLCJyZWMiLCJJZCIsIndyaXRlIiwiaGFuZGxlRW5kIiwiZW5kIiwiaWRzIiwiYWxsb3dSZWN1cnNpdmUiLCJ1cGRhdGUiLCJtYXBwaW5nIiwidXBkYXRlU3RyZWFtIiwiUmVjb3JkU3RyZWFtIiwicmVjb3JkTWFwU3RyZWFtIiwidXBkYXRlQnVsayIsImdldExvZ2dlciIsInBhcmVudCIsIl9yZWxOYW1lIiwiX3BhcmVudCJdLCJzb3VyY2VzIjpbIi4uL3NyYy9xdWVyeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIE1hbmFnZXMgcXVlcnkgZm9yIHJlY29yZHMgaW4gU2FsZXNmb3JjZVxuICogQGF1dGhvciBTaGluaWNoaSBUb21pdGEgPHNoaW5pY2hpLnRvbWl0YUBnbWFpbC5jb20+XG4gKi9cbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBMb2dnZXIsIGdldExvZ2dlciB9IGZyb20gJy4vdXRpbC9sb2dnZXInO1xuaW1wb3J0IFJlY29yZFN0cmVhbSwgeyBTZXJpYWxpemFibGUgfSBmcm9tICcuL3JlY29yZC1zdHJlYW0nO1xuaW1wb3J0IENvbm5lY3Rpb24gZnJvbSAnLi9jb25uZWN0aW9uJztcbmltcG9ydCB7IGNyZWF0ZVNPUUwgfSBmcm9tICcuL3NvcWwtYnVpbGRlcic7XG5pbXBvcnQgeyBRdWVyeUNvbmZpZyBhcyBTT1FMUXVlcnlDb25maWcsIFNvcnREaXIgfSBmcm9tICcuL3NvcWwtYnVpbGRlcic7XG5pbXBvcnQge1xuICBSZWNvcmQsXG4gIE9wdGlvbmFsLFxuICBTY2hlbWEsXG4gIFNPYmplY3ROYW1lcyxcbiAgQ2hpbGRSZWxhdGlvbnNoaXBOYW1lcyxcbiAgQ2hpbGRSZWxhdGlvbnNoaXBTT2JqZWN0TmFtZSxcbiAgRmllbGRQcm9qZWN0aW9uQ29uZmlnLFxuICBGaWVsZFBhdGhTcGVjaWZpZXIsXG4gIEZpZWxkUGF0aFNjb3BlZFByb2plY3Rpb24sXG4gIFNPYmplY3RSZWNvcmQsXG4gIFNPYmplY3RJbnB1dFJlY29yZCxcbiAgU09iamVjdFVwZGF0ZVJlY29yZCxcbiAgU2F2ZVJlc3VsdCxcbiAgRGF0ZVN0cmluZyxcbiAgU09iamVjdENoaWxkUmVsYXRpb25zaGlwUHJvcCxcbiAgU09iamVjdEZpZWxkTmFtZXMsXG59IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgUmVhZGFibGUgfSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0IFNmRGF0ZSBmcm9tICcuL2RhdGUnO1xuXG4vKipcbiAqXG4gKi9cbmV4cG9ydCB0eXBlIFF1ZXJ5RmllbGQ8XG4gIFMgZXh0ZW5kcyBTY2hlbWEsXG4gIE4gZXh0ZW5kcyBTT2JqZWN0TmFtZXM8Uz4sXG4gIEZQIGV4dGVuZHMgRmllbGRQYXRoU3BlY2lmaWVyPFMsIE4+ID0gRmllbGRQYXRoU3BlY2lmaWVyPFMsIE4+XG4+ID0gRlAgfCBGUFtdIHwgc3RyaW5nIHwgc3RyaW5nW10gfCB7IFtmaWVsZDogc3RyaW5nXTogbnVtYmVyIHwgYm9vbGVhbiB9O1xuXG4vKipcbiAqXG4gKi9cbnR5cGUgQ1ZhbHVlPFQ+ID0gVCBleHRlbmRzIERhdGVTdHJpbmdcbiAgPyBTZkRhdGVcbiAgOiBUIGV4dGVuZHMgc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhblxuICA/IFRcbiAgOiBuZXZlcjtcblxudHlwZSBDb25kT3A8VD4gPVxuICB8IFsnJGVxJywgQ1ZhbHVlPFQ+IHwgbnVsbF1cbiAgfCBbJyRuZScsIENWYWx1ZTxUPiB8IG51bGxdXG4gIHwgWyckZ3QnLCBDVmFsdWU8VD5dXG4gIHwgWyckZ3RlJywgQ1ZhbHVlPFQ+XVxuICB8IFsnJGx0JywgQ1ZhbHVlPFQ+XVxuICB8IFsnJGx0ZScsIENWYWx1ZTxUPl1cbiAgfCBbJyRsaWtlJywgVCBleHRlbmRzIHN0cmluZyA/IFQgOiBuZXZlcl1cbiAgfCBbJyRubGlrZScsIFQgZXh0ZW5kcyBzdHJpbmcgPyBUIDogbmV2ZXJdXG4gIHwgWyckaW4nLCBBcnJheTxDVmFsdWU8VD4+XVxuICB8IFsnJG5pbicsIEFycmF5PENWYWx1ZTxUPj5dXG4gIHwgWyckaW5jbHVkZXMnLCBUIGV4dGVuZHMgc3RyaW5nID8gVFtdIDogbmV2ZXJdXG4gIHwgWyckZXhjbHVkZXMnLCBUIGV4dGVuZHMgc3RyaW5nID8gVFtdIDogbmV2ZXJdXG4gIHwgWyckZXhpc3RzJywgYm9vbGVhbl07XG5cbnR5cGUgQ29uZFZhbHVlT2JqPFQsIE9wID0gQ29uZE9wPFQ+WzBdPiA9IE9wIGV4dGVuZHMgQ29uZE9wPFQ+WzBdXG4gID8gT3AgZXh0ZW5kcyBzdHJpbmdcbiAgICA/IHsgW0sgaW4gT3BdOiBFeHRyYWN0PENvbmRPcDxUPiwgW09wLCBhbnldPlsxXSB9XG4gICAgOiBuZXZlclxuICA6IG5ldmVyO1xuXG50eXBlIENvbmRWYWx1ZTxUPiA9IENWYWx1ZTxUPiB8IEFycmF5PENWYWx1ZTxUPj4gfCBudWxsIHwgQ29uZFZhbHVlT2JqPFQ+O1xuXG50eXBlIENvbmRpdGlvblNldDxSIGV4dGVuZHMgUmVjb3JkPiA9IHtcbiAgW0sgaW4ga2V5b2YgUl0/OiBDb25kVmFsdWU8UltLXT47XG59O1xuXG5leHBvcnQgdHlwZSBRdWVyeUNvbmRpdGlvbjxTIGV4dGVuZHMgU2NoZW1hLCBOIGV4dGVuZHMgU09iamVjdE5hbWVzPFM+PiA9XG4gIHwge1xuICAgICAgJG9yOiBRdWVyeUNvbmRpdGlvbjxTLCBOPltdO1xuICAgIH1cbiAgfCB7XG4gICAgICAkYW5kOiBRdWVyeUNvbmRpdGlvbjxTLCBOPltdO1xuICAgIH1cbiAgfCBDb25kaXRpb25TZXQ8U09iamVjdFJlY29yZDxTLCBOPj47XG5cbmV4cG9ydCB0eXBlIFF1ZXJ5U29ydDxcbiAgUyBleHRlbmRzIFNjaGVtYSxcbiAgTiBleHRlbmRzIFNPYmplY3ROYW1lczxTPixcbiAgUiBleHRlbmRzIFNPYmplY3RSZWNvcmQ8UywgTj4gPSBTT2JqZWN0UmVjb3JkPFMsIE4+XG4+ID1cbiAgfCB7XG4gICAgICBbSyBpbiBrZXlvZiBSXT86IFNvcnREaXI7XG4gICAgfVxuICB8IEFycmF5PFtrZXlvZiBSLCBTb3J0RGlyXT47XG5cbi8qKlxuICpcbiAqL1xuZXhwb3J0IHR5cGUgUXVlcnlDb25maWc8XG4gIFMgZXh0ZW5kcyBTY2hlbWEsXG4gIE4gZXh0ZW5kcyBTT2JqZWN0TmFtZXM8Uz4sXG4gIEZQIGV4dGVuZHMgRmllbGRQYXRoU3BlY2lmaWVyPFMsIE4+ID0gRmllbGRQYXRoU3BlY2lmaWVyPFMsIE4+XG4+ID0ge1xuICBmaWVsZHM/OiBRdWVyeUZpZWxkPFMsIE4sIEZQPjtcbiAgaW5jbHVkZXM/OiB7XG4gICAgW0NSTiBpbiBDaGlsZFJlbGF0aW9uc2hpcE5hbWVzPFMsIE4+XT86IFF1ZXJ5Q29uZmlnPFxuICAgICAgUyxcbiAgICAgIENoaWxkUmVsYXRpb25zaGlwU09iamVjdE5hbWU8UywgTiwgQ1JOPlxuICAgID47XG4gIH07XG4gIHRhYmxlPzogc3RyaW5nO1xuICBjb25kaXRpb25zPzogUXVlcnlDb25kaXRpb248UywgTj47XG4gIHNvcnQ/OiBRdWVyeVNvcnQ8UywgTj47XG4gIGxpbWl0PzogbnVtYmVyO1xuICBvZmZzZXQ/OiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBRdWVyeU9wdGlvbnMgPSB7XG4gIGhlYWRlcnM6IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9O1xuICBtYXhGZXRjaDogbnVtYmVyO1xuICBhdXRvRmV0Y2g6IGJvb2xlYW47XG4gIHNjYW5BbGw6IGJvb2xlYW47XG4gIHJlc3BvbnNlVGFyZ2V0OiBRdWVyeVJlc3BvbnNlVGFyZ2V0O1xufTtcblxuZXhwb3J0IHR5cGUgUXVlcnlSZXN1bHQ8UiBleHRlbmRzIFJlY29yZD4gPSB7XG4gIGRvbmU6IGJvb2xlYW47XG4gIHRvdGFsU2l6ZTogbnVtYmVyO1xuICByZWNvcmRzOiBSW107XG4gIG5leHRSZWNvcmRzVXJsPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgUXVlcnlFeHBsYWluUmVzdWx0ID0ge1xuICBwbGFuczogQXJyYXk8e1xuICAgIGNhcmRpbmFsaXR5OiBudW1iZXI7XG4gICAgZmllbGRzOiBzdHJpbmdbXTtcbiAgICBsZWFkaW5nT3BlcmF0aW9uVHlwZTogJ0luZGV4JyB8ICdPdGhlcicgfCAnU2hhcmluZycgfCAnVGFibGVTY2FuJztcbiAgICBub3RlczogQXJyYXk8e1xuICAgICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICAgIGZpZWxkczogc3RyaW5nW107XG4gICAgICB0YWJsZUVudW1PcklkOiBzdHJpbmc7XG4gICAgfT47XG4gICAgcmVsYXRpdmVDb3N0OiBudW1iZXI7XG4gICAgc29iamVjdENhcmRpbmFsaXR5OiBudW1iZXI7XG4gICAgc29iamVjdFR5cGU6IHN0cmluZztcbiAgfT47XG59O1xuXG5jb25zdCBSZXNwb25zZVRhcmdldFZhbHVlcyA9IFtcbiAgJ1F1ZXJ5UmVzdWx0JyxcbiAgJ1JlY29yZHMnLFxuICAnU2luZ2xlUmVjb3JkJyxcbiAgJ0NvdW50Jyxcbl0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIFF1ZXJ5UmVzcG9uc2VUYXJnZXQgPSB0eXBlb2YgUmVzcG9uc2VUYXJnZXRWYWx1ZXNbbnVtYmVyXTtcblxuZXhwb3J0IGNvbnN0IFJlc3BvbnNlVGFyZ2V0czoge1xuICBbSyBpbiBRdWVyeVJlc3BvbnNlVGFyZ2V0XTogSztcbn0gPSBSZXNwb25zZVRhcmdldFZhbHVlcy5yZWR1Y2UoXG4gICh2YWx1ZXMsIHRhcmdldCkgPT4gKHsgLi4udmFsdWVzLCBbdGFyZ2V0XTogdGFyZ2V0IH0pLFxuICB7fSBhcyB7XG4gICAgW0sgaW4gUXVlcnlSZXNwb25zZVRhcmdldF06IEs7XG4gIH0sXG4pO1xuXG5leHBvcnQgdHlwZSBRdWVyeVJlc3BvbnNlPFxuICBSIGV4dGVuZHMgUmVjb3JkLFxuICBRUlQgZXh0ZW5kcyBRdWVyeVJlc3BvbnNlVGFyZ2V0ID0gUXVlcnlSZXNwb25zZVRhcmdldFxuPiA9IFFSVCBleHRlbmRzICdRdWVyeVJlc3VsdCdcbiAgPyBRdWVyeVJlc3VsdDxSPlxuICA6IFFSVCBleHRlbmRzICdSZWNvcmRzJ1xuICA/IFJbXVxuICA6IFFSVCBleHRlbmRzICdTaW5nbGVSZWNvcmQnXG4gID8gUiB8IG51bGxcbiAgOiBudW1iZXI7IC8vIFFSVCBleHRlbmRzICdDb3VudCdcblxuZXhwb3J0IHR5cGUgUXVlcnlEZXN0cm95T3B0aW9ucyA9IHtcbiAgYWxsb3dCdWxrPzogYm9vbGVhbjtcbiAgYnVsa1RocmVzaG9sZD86IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIFF1ZXJ5VXBkYXRlT3B0aW9ucyA9IHtcbiAgYWxsb3dCdWxrPzogYm9vbGVhbjtcbiAgYnVsa1RocmVzaG9sZD86IG51bWJlcjtcbn07XG5cbi8qKlxuICpcbiAqL1xuY29uc3QgREVGQVVMVF9CVUxLX1RIUkVTSE9MRCA9IDIwMDtcblxuLyoqXG4gKiBRdWVyeVxuICovXG5leHBvcnQgY2xhc3MgUXVlcnk8XG4gIFMgZXh0ZW5kcyBTY2hlbWEsXG4gIE4gZXh0ZW5kcyBTT2JqZWN0TmFtZXM8Uz4sXG4gIFIgZXh0ZW5kcyBSZWNvcmQgPSBSZWNvcmQsXG4gIFFSVCBleHRlbmRzIFF1ZXJ5UmVzcG9uc2VUYXJnZXQgPSBRdWVyeVJlc3BvbnNlVGFyZ2V0XG4+IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgc3RhdGljIF9sb2dnZXIgPSBnZXRMb2dnZXIoJ3F1ZXJ5Jyk7XG5cbiAgX2Nvbm46IENvbm5lY3Rpb248Uz47XG4gIF9sb2dnZXI6IExvZ2dlcjtcbiAgX3NvcWw6IE9wdGlvbmFsPHN0cmluZz47XG4gIF9sb2NhdG9yOiBPcHRpb25hbDxzdHJpbmc+O1xuICBfY29uZmlnOiBTT1FMUXVlcnlDb25maWcgPSB7fTtcbiAgX2NoaWxkcmVuOiBTdWJRdWVyeTxTLCBOLCBSLCBRUlQsIGFueSwgYW55LCBhbnk+W10gPSBbXTtcbiAgX29wdGlvbnM6IFF1ZXJ5T3B0aW9ucztcbiAgX2V4ZWN1dGVkOiBib29sZWFuID0gZmFsc2U7XG4gIF9maW5pc2hlZDogYm9vbGVhbiA9IGZhbHNlO1xuICBfY2hhaW5pbmc6IGJvb2xlYW4gPSBmYWxzZTtcbiAgX3Byb21pc2U6IFByb21pc2U8UXVlcnlSZXNwb25zZTxSLCBRUlQ+PjtcbiAgX3N0cmVhbTogU2VyaWFsaXphYmxlPFI+O1xuXG4gIHRvdGFsU2l6ZSA9IDA7XG4gIHRvdGFsRmV0Y2hlZCA9IDA7XG4gIHJlY29yZHM6IFJbXSA9IFtdO1xuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgY29ubjogQ29ubmVjdGlvbjxTPixcbiAgICBjb25maWc6IHN0cmluZyB8IFF1ZXJ5Q29uZmlnPFMsIE4+IHwgeyBsb2NhdG9yOiBzdHJpbmcgfSxcbiAgICBvcHRpb25zPzogUGFydGlhbDxRdWVyeU9wdGlvbnM+LFxuICApIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2Nvbm4gPSBjb25uO1xuICAgIHRoaXMuX2xvZ2dlciA9IGNvbm4uX2xvZ0xldmVsXG4gICAgICA/IFF1ZXJ5Ll9sb2dnZXIuY3JlYXRlSW5zdGFuY2UoY29ubi5fbG9nTGV2ZWwpXG4gICAgICA6IFF1ZXJ5Ll9sb2dnZXI7XG4gICAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLl9zb3FsID0gY29uZmlnO1xuICAgICAgdGhpcy5fbG9nZ2VyLmRlYnVnKGBjb25maWcgaXMgc29xbDogJHtjb25maWd9YCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgKGNvbmZpZyBhcyBhbnkpLmxvY2F0b3IgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBsb2NhdG9yOiBzdHJpbmcgPSAoY29uZmlnIGFzIGFueSkubG9jYXRvcjtcbiAgICAgIHRoaXMuX2xvZ2dlci5kZWJ1ZyhgY29uZmlnIGlzIGxvY2F0b3I6ICR7bG9jYXRvcn1gKTtcbiAgICAgIHRoaXMuX2xvY2F0b3IgPSBsb2NhdG9yLmluY2x1ZGVzKCcvJylcbiAgICAgICAgPyB0aGlzLnVybFRvTG9jYXRvcihsb2NhdG9yKVxuICAgICAgICA6IGxvY2F0b3I7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2xvZ2dlci5kZWJ1ZyhgY29uZmlnIGlzIFF1ZXJ5Q29uZmlnOiAke2NvbmZpZ31gKTtcbiAgICAgIGNvbnN0IHsgZmllbGRzLCBpbmNsdWRlcywgc29ydCwgLi4uX2NvbmZpZyB9ID0gY29uZmlnIGFzIFF1ZXJ5Q29uZmlnPFxuICAgICAgICBTLFxuICAgICAgICBOXG4gICAgICA+O1xuICAgICAgdGhpcy5fY29uZmlnID0gX2NvbmZpZztcbiAgICAgIHRoaXMuc2VsZWN0KGZpZWxkcyk7XG4gICAgICBpZiAoaW5jbHVkZXMpIHtcbiAgICAgICAgdGhpcy5pbmNsdWRlQ2hpbGRyZW4oaW5jbHVkZXMpO1xuICAgICAgfVxuICAgICAgaWYgKHNvcnQpIHtcbiAgICAgICAgdGhpcy5zb3J0KHNvcnQpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9vcHRpb25zID0ge1xuICAgICAgaGVhZGVyczoge30sXG4gICAgICBtYXhGZXRjaDogMTAwMDAsXG4gICAgICBhdXRvRmV0Y2g6IGZhbHNlLFxuICAgICAgc2NhbkFsbDogZmFsc2UsXG4gICAgICByZXNwb25zZVRhcmdldDogJ1F1ZXJ5UmVzdWx0JyxcbiAgICAgIC4uLihvcHRpb25zIHx8IHt9KSxcbiAgICB9IGFzIFF1ZXJ5T3B0aW9ucztcbiAgICAvLyBwcm9taXNlIGluc3RhbmNlXG4gICAgdGhpcy5fcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMub24oJ3Jlc3BvbnNlJywgcmVzb2x2ZSk7XG4gICAgICB0aGlzLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgfSk7XG4gICAgdGhpcy5fc3RyZWFtID0gbmV3IFNlcmlhbGl6YWJsZSgpO1xuICAgIHRoaXMub24oJ3JlY29yZCcsIChyZWNvcmQpID0+IHRoaXMuX3N0cmVhbS5wdXNoKHJlY29yZCkpO1xuICAgIHRoaXMub24oJ2VuZCcsICgpID0+IHRoaXMuX3N0cmVhbS5wdXNoKG51bGwpKTtcbiAgICB0aGlzLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuX3N0cmVhbS5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZW1wdHlcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3QgZmllbGRzIHRvIGluY2x1ZGUgaW4gdGhlIHJldHVybmluZyByZXN1bHRcbiAgICovXG4gIHNlbGVjdDxcbiAgICBSIGV4dGVuZHMgUmVjb3JkID0gUmVjb3JkLFxuICAgIEZQIGV4dGVuZHMgRmllbGRQYXRoU3BlY2lmaWVyPFMsIE4+ID0gRmllbGRQYXRoU3BlY2lmaWVyPFMsIE4+LFxuICAgIEZQQyBleHRlbmRzIEZpZWxkUHJvamVjdGlvbkNvbmZpZyA9IEZpZWxkUGF0aFNjb3BlZFByb2plY3Rpb248UywgTiwgRlA+LFxuICAgIFIyIGV4dGVuZHMgU09iamVjdFJlY29yZDxTLCBOLCBGUEMsIFI+ID0gU09iamVjdFJlY29yZDxTLCBOLCBGUEMsIFI+XG4gID4oZmllbGRzOiBRdWVyeUZpZWxkPFMsIE4sIEZQPiA9ICcqJyk6IFF1ZXJ5PFMsIE4sIFIyLCBRUlQ+IHtcbiAgICBpZiAodGhpcy5fc29xbCkge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICdDYW5ub3Qgc2V0IHNlbGVjdCBmaWVsZHMgZm9yIHRoZSBxdWVyeSB3aGljaCBoYXMgYWxyZWFkeSBidWlsdCBTT1FMLicsXG4gICAgICApO1xuICAgIH1cbiAgICBmdW5jdGlvbiB0b0ZpZWxkQXJyYXkoZmllbGRzOiBRdWVyeUZpZWxkPFMsIE4sIEZQPik6IHN0cmluZ1tdIHtcbiAgICAgIHJldHVybiB0eXBlb2YgZmllbGRzID09PSAnc3RyaW5nJ1xuICAgICAgICA/IGZpZWxkcy5zcGxpdCgvXFxzKixcXHMqLylcbiAgICAgICAgOiBBcnJheS5pc0FycmF5KGZpZWxkcylcbiAgICAgICAgPyAoZmllbGRzIGFzIEFycmF5PHN0cmluZyB8IEZQPilcbiAgICAgICAgICAgIC5tYXAodG9GaWVsZEFycmF5KVxuICAgICAgICAgICAgLnJlZHVjZSgoZnMsIGYpID0+IFsuLi5mcywgLi4uZl0sIFtdIGFzIHN0cmluZ1tdKVxuICAgICAgICA6IE9iamVjdC5lbnRyaWVzKGZpZWxkcyBhcyB7IFtuYW1lOiBzdHJpbmddOiBRdWVyeUZpZWxkPFMsIE4sIEZQPiB9KVxuICAgICAgICAgICAgLm1hcCgoW2YsIHZdKSA9PiB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdiA9PT0gJ251bWJlcicgfHwgdHlwZW9mIHYgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB2ID8gW2ZdIDogW107XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvRmllbGRBcnJheSh2KS5tYXAoKHApID0+IGAke2Z9LiR7cH1gKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5yZWR1Y2UoKGZzLCBmKSA9PiBbLi4uZnMsIC4uLmZdLCBbXSBhcyBzdHJpbmdbXSk7XG4gICAgfVxuICAgIGlmIChmaWVsZHMpIHtcbiAgICAgIHRoaXMuX2NvbmZpZy5maWVsZHMgPSB0b0ZpZWxkQXJyYXkoZmllbGRzKTtcbiAgICB9XG4gICAgLy8gZm9yY2UgY29udmVydCBxdWVyeSByZWNvcmQgdHlwZSB3aXRob3V0IGNoYW5naW5nIGluc3RhbmNlO1xuICAgIHJldHVybiAodGhpcyBhcyBhbnkpIGFzIFF1ZXJ5PFMsIE4sIFIyLCBRUlQ+O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBxdWVyeSBjb25kaXRpb25zIHRvIGZpbHRlciB0aGUgcmVzdWx0IHJlY29yZHNcbiAgICovXG4gIHdoZXJlKGNvbmRpdGlvbnM6IFF1ZXJ5Q29uZGl0aW9uPFMsIE4+IHwgc3RyaW5nKSB7XG4gICAgaWYgKHRoaXMuX3NvcWwpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAnQ2Fubm90IHNldCB3aGVyZSBjb25kaXRpb25zIGZvciB0aGUgcXVlcnkgd2hpY2ggaGFzIGFscmVhZHkgYnVpbHQgU09RTC4nLFxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5fY29uZmlnLmNvbmRpdGlvbnMgPSBjb25kaXRpb25zO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIExpbWl0IHRoZSByZXR1cm5pbmcgcmVzdWx0XG4gICAqL1xuICBsaW1pdChsaW1pdDogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuX3NvcWwpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAnQ2Fubm90IHNldCBsaW1pdCBmb3IgdGhlIHF1ZXJ5IHdoaWNoIGhhcyBhbHJlYWR5IGJ1aWx0IFNPUUwuJyxcbiAgICAgICk7XG4gICAgfVxuICAgIHRoaXMuX2NvbmZpZy5saW1pdCA9IGxpbWl0O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNraXAgcmVjb3Jkc1xuICAgKi9cbiAgc2tpcChvZmZzZXQ6IG51bWJlcikge1xuICAgIGlmICh0aGlzLl9zb3FsKSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgJ0Nhbm5vdCBzZXQgc2tpcC9vZmZzZXQgZm9yIHRoZSBxdWVyeSB3aGljaCBoYXMgYWxyZWFkeSBidWlsdCBTT1FMLicsXG4gICAgICApO1xuICAgIH1cbiAgICB0aGlzLl9jb25maWcub2Zmc2V0ID0gb2Zmc2V0O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFN5bm9ueW0gb2YgUXVlcnkjc2tpcCgpXG4gICAqL1xuICBvZmZzZXQgPSB0aGlzLnNraXA7XG5cbiAgLyoqXG4gICAqIFNldCBxdWVyeSBzb3J0IHdpdGggZGlyZWN0aW9uXG4gICAqL1xuICBzb3J0KHNvcnQ6IFF1ZXJ5U29ydDxTLCBOPik6IHRoaXM7XG4gIHNvcnQoc29ydDogc3RyaW5nKTogdGhpcztcbiAgc29ydChzb3J0OiBTT2JqZWN0RmllbGROYW1lczxTLCBOPiwgZGlyOiBTb3J0RGlyKTogdGhpcztcbiAgc29ydChzb3J0OiBzdHJpbmcsIGRpcjogU29ydERpcik6IHRoaXM7XG4gIHNvcnQoXG4gICAgc29ydDogUXVlcnlTb3J0PFMsIE4+IHwgU09iamVjdEZpZWxkTmFtZXM8UywgTj4gfCBzdHJpbmcsXG4gICAgZGlyPzogU29ydERpcixcbiAgKSB7XG4gICAgaWYgKHRoaXMuX3NvcWwpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAnQ2Fubm90IHNldCBzb3J0IGZvciB0aGUgcXVlcnkgd2hpY2ggaGFzIGFscmVhZHkgYnVpbHQgU09RTC4nLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBzb3J0ID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgZGlyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5fY29uZmlnLnNvcnQgPSBbW3NvcnQsIGRpcl1dO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jb25maWcuc29ydCA9IHNvcnQgYXMgc3RyaW5nIHwgeyBbZmllbGQ6IHN0cmluZ106IFNvcnREaXIgfTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU3lub255bSBvZiBRdWVyeSNzb3J0KClcbiAgICovXG4gIG9yZGVyYnk6IHR5cGVvZiBRdWVyeS5wcm90b3R5cGUuc29ydCA9IHRoaXMuc29ydDtcblxuICAvKipcbiAgICogSW5jbHVkZSBjaGlsZCByZWxhdGlvbnNoaXAgcXVlcnkgYW5kIG1vdmUgZG93biB0byB0aGUgY2hpbGQgcXVlcnkgY29udGV4dFxuICAgKi9cbiAgaW5jbHVkZTxcbiAgICBDUk4gZXh0ZW5kcyBDaGlsZFJlbGF0aW9uc2hpcE5hbWVzPFMsIE4+LFxuICAgIENOIGV4dGVuZHMgQ2hpbGRSZWxhdGlvbnNoaXBTT2JqZWN0TmFtZTxTLCBOLCBDUk4+LFxuICAgIENGUCBleHRlbmRzIEZpZWxkUGF0aFNwZWNpZmllcjxTLCBDTj4gPSBGaWVsZFBhdGhTcGVjaWZpZXI8UywgQ04+LFxuICAgIENGUEMgZXh0ZW5kcyBGaWVsZFByb2plY3Rpb25Db25maWcgPSBGaWVsZFBhdGhTY29wZWRQcm9qZWN0aW9uPFMsIENOLCBDRlA+LFxuICAgIENSIGV4dGVuZHMgUmVjb3JkID0gU09iamVjdFJlY29yZDxTLCBDTiwgQ0ZQQz5cbiAgPihcbiAgICBjaGlsZFJlbE5hbWU6IENSTixcbiAgICBjb25kaXRpb25zPzogT3B0aW9uYWw8UXVlcnlDb25kaXRpb248UywgQ04+PixcbiAgICBmaWVsZHM/OiBPcHRpb25hbDxRdWVyeUZpZWxkPFMsIENOLCBDRlA+PixcbiAgICBvcHRpb25zPzogeyBsaW1pdD86IG51bWJlcjsgb2Zmc2V0PzogbnVtYmVyOyBzb3J0PzogUXVlcnlTb3J0PFMsIENOPiB9LFxuICApOiBTdWJRdWVyeTxTLCBOLCBSLCBRUlQsIENSTiwgQ04sIENSPjtcbiAgaW5jbHVkZTxcbiAgICBDUk4gZXh0ZW5kcyBDaGlsZFJlbGF0aW9uc2hpcE5hbWVzPFMsIE4+LFxuICAgIENOIGV4dGVuZHMgU09iamVjdE5hbWVzPFM+LFxuICAgIENSIGV4dGVuZHMgUmVjb3JkID0gU09iamVjdFJlY29yZDxTLCBDTj5cbiAgPihcbiAgICBjaGlsZFJlbE5hbWU6IHN0cmluZyxcbiAgICBjb25kaXRpb25zPzogT3B0aW9uYWw8UXVlcnlDb25kaXRpb248UywgQ04+PixcbiAgICBmaWVsZHM/OiBPcHRpb25hbDxRdWVyeUZpZWxkPFMsIENOPj4sXG4gICAgb3B0aW9ucz86IHsgbGltaXQ/OiBudW1iZXI7IG9mZnNldD86IG51bWJlcjsgc29ydD86IFF1ZXJ5U29ydDxTLCBDTj4gfSxcbiAgKTogU3ViUXVlcnk8UywgTiwgUiwgUVJULCBDUk4sIENOLCBDUj47XG5cbiAgaW5jbHVkZTxcbiAgICBDUk4gZXh0ZW5kcyBDaGlsZFJlbGF0aW9uc2hpcE5hbWVzPFMsIE4+LFxuICAgIENOIGV4dGVuZHMgQ2hpbGRSZWxhdGlvbnNoaXBTT2JqZWN0TmFtZTxTLCBOLCBDUk4+LFxuICAgIENGUCBleHRlbmRzIEZpZWxkUGF0aFNwZWNpZmllcjxTLCBDTj4gPSBGaWVsZFBhdGhTcGVjaWZpZXI8UywgQ04+LFxuICAgIENGUEMgZXh0ZW5kcyBGaWVsZFByb2plY3Rpb25Db25maWcgPSBGaWVsZFBhdGhTY29wZWRQcm9qZWN0aW9uPFMsIENOLCBDRlA+LFxuICAgIENSIGV4dGVuZHMgUmVjb3JkID0gU09iamVjdFJlY29yZDxTLCBDTiwgQ0ZQQz5cbiAgPihcbiAgICBjaGlsZFJlbE5hbWU6IENSTiB8IHN0cmluZyxcbiAgICBjb25kaXRpb25zPzogT3B0aW9uYWw8UXVlcnlDb25kaXRpb248UywgQ04+PixcbiAgICBmaWVsZHM/OiBPcHRpb25hbDxRdWVyeUZpZWxkPFMsIENOLCBDRlA+PixcbiAgICBvcHRpb25zOiB7IGxpbWl0PzogbnVtYmVyOyBvZmZzZXQ/OiBudW1iZXI7IHNvcnQ/OiBRdWVyeVNvcnQ8UywgQ04+IH0gPSB7fSxcbiAgKTogU3ViUXVlcnk8UywgTiwgUiwgUVJULCBDUk4sIENOLCBDUj4ge1xuICAgIGlmICh0aGlzLl9zb3FsKSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgJ0Nhbm5vdCBpbmNsdWRlIGNoaWxkIHJlbGF0aW9uc2hpcCBpbnRvIHRoZSBxdWVyeSB3aGljaCBoYXMgYWxyZWFkeSBidWlsdCBTT1FMLicsXG4gICAgICApO1xuICAgIH1cbiAgICBjb25zdCBjaGlsZENvbmZpZzogUXVlcnlDb25maWc8UywgQ04sIENGUD4gPSB7XG4gICAgICBmaWVsZHM6IGZpZWxkcyA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IGZpZWxkcyxcbiAgICAgIHRhYmxlOiBjaGlsZFJlbE5hbWUsXG4gICAgICBjb25kaXRpb25zOiBjb25kaXRpb25zID09PSBudWxsID8gdW5kZWZpbmVkIDogY29uZGl0aW9ucyxcbiAgICAgIGxpbWl0OiBvcHRpb25zLmxpbWl0LFxuICAgICAgb2Zmc2V0OiBvcHRpb25zLm9mZnNldCxcbiAgICAgIHNvcnQ6IG9wdGlvbnMuc29ydCxcbiAgICB9O1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2UtYmVmb3JlLWRlZmluZVxuICAgIGNvbnN0IGNoaWxkUXVlcnkgPSBuZXcgU3ViUXVlcnk8UywgTiwgUiwgUVJULCBDUk4sIENOLCBDUj4oXG4gICAgICB0aGlzLl9jb25uLFxuICAgICAgY2hpbGRSZWxOYW1lIGFzIENSTixcbiAgICAgIGNoaWxkQ29uZmlnLFxuICAgICAgdGhpcyxcbiAgICApO1xuICAgIHRoaXMuX2NoaWxkcmVuLnB1c2goY2hpbGRRdWVyeSk7XG4gICAgcmV0dXJuIGNoaWxkUXVlcnk7XG4gIH1cblxuICAvKipcbiAgICogSW5jbHVkZSBjaGlsZCByZWxhdGlvbnNoaXAgcXVlcmllcywgYnV0IG5vdCBtb3ZpbmcgZG93biB0byB0aGUgY2hpbGRyZW4gY29udGV4dFxuICAgKi9cbiAgaW5jbHVkZUNoaWxkcmVuKFxuICAgIGluY2x1ZGVzOiB7XG4gICAgICBbQ1JOIGluIENoaWxkUmVsYXRpb25zaGlwTmFtZXM8UywgTj5dPzogUXVlcnlDb25maWc8XG4gICAgICAgIFMsXG4gICAgICAgIENoaWxkUmVsYXRpb25zaGlwU09iamVjdE5hbWU8UywgTiwgQ1JOPlxuICAgICAgPjtcbiAgICB9LFxuICApIHtcbiAgICB0eXBlIENSTiA9IENoaWxkUmVsYXRpb25zaGlwTmFtZXM8UywgTj47XG4gICAgaWYgKHRoaXMuX3NvcWwpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAnQ2Fubm90IGluY2x1ZGUgY2hpbGQgcmVsYXRpb25zaGlwIGludG8gdGhlIHF1ZXJ5IHdoaWNoIGhhcyBhbHJlYWR5IGJ1aWx0IFNPUUwuJyxcbiAgICAgICk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgY3JuYW1lIG9mIE9iamVjdC5rZXlzKGluY2x1ZGVzKSBhcyBDUk5bXSkge1xuICAgICAgY29uc3QgeyBjb25kaXRpb25zLCBmaWVsZHMsIC4uLm9wdGlvbnMgfSA9IGluY2x1ZGVzW1xuICAgICAgICBjcm5hbWVcbiAgICAgIF0gYXMgUXVlcnlDb25maWc8UywgQ2hpbGRSZWxhdGlvbnNoaXBTT2JqZWN0TmFtZTxTLCBOLCBDUk4+PjtcbiAgICAgIHRoaXMuaW5jbHVkZShjcm5hbWUsIGNvbmRpdGlvbnMsIGZpZWxkcywgb3B0aW9ucyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHRpbmcgbWF4RmV0Y2ggcXVlcnkgb3B0aW9uXG4gICAqL1xuICBtYXhGZXRjaChtYXhGZXRjaDogbnVtYmVyKSB7XG4gICAgdGhpcy5fb3B0aW9ucy5tYXhGZXRjaCA9IG1heEZldGNoO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFN3aXRjaGluZyBhdXRvIGZldGNoIG1vZGVcbiAgICovXG4gIGF1dG9GZXRjaChhdXRvRmV0Y2g6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9vcHRpb25zLmF1dG9GZXRjaCA9IGF1dG9GZXRjaDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgZmxhZyB0byBzY2FuIGFsbCByZWNvcmRzIGluY2x1ZGluZyBkZWxldGVkIGFuZCBhcmNoaXZlZC5cbiAgICovXG4gIHNjYW5BbGwoc2NhbkFsbDogYm9vbGVhbikge1xuICAgIHRoaXMuX29wdGlvbnMuc2NhbkFsbCA9IHNjYW5BbGw7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICovXG4gIHNldFJlc3BvbnNlVGFyZ2V0PFFSVDEgZXh0ZW5kcyBRdWVyeVJlc3BvbnNlVGFyZ2V0PihcbiAgICByZXNwb25zZVRhcmdldDogUVJUMSxcbiAgKTogUXVlcnk8UywgTiwgUiwgUVJUMT4ge1xuICAgIGlmIChyZXNwb25zZVRhcmdldCBpbiBSZXNwb25zZVRhcmdldHMpIHtcbiAgICAgIHRoaXMuX29wdGlvbnMucmVzcG9uc2VUYXJnZXQgPSByZXNwb25zZVRhcmdldDtcbiAgICB9XG4gICAgLy8gZm9yY2UgY2hhbmdlIHF1ZXJ5IHJlc3BvbnNlIHRhcmdldCB3aXRob3V0IGNoYW5naW5nIGluc3RhbmNlXG4gICAgcmV0dXJuICh0aGlzIGFzIFF1ZXJ5PFMsIE4sIFI+KSBhcyBRdWVyeTxTLCBOLCBSLCBRUlQxPjtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIHF1ZXJ5IGFuZCBmZXRjaCByZWNvcmRzIGZyb20gc2VydmVyLlxuICAgKi9cbiAgZXhlY3V0ZTxRUlQxIGV4dGVuZHMgUXVlcnlSZXNwb25zZVRhcmdldCA9IFFSVD4oXG4gICAgb3B0aW9uc186IFBhcnRpYWw8UXVlcnlPcHRpb25zPiAmIHsgcmVzcG9uc2VUYXJnZXQ/OiBRUlQxIH0gPSB7fSxcbiAgKTogUXVlcnk8UywgTiwgUiwgUVJUMT4ge1xuICAgIGlmICh0aGlzLl9leGVjdXRlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdyZS1leGVjdXRpbmcgYWxyZWFkeSBleGVjdXRlZCBxdWVyeScpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9maW5pc2hlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdleGVjdXRpbmcgYWxyZWFkeSBjbG9zZWQgcXVlcnknKTtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgaGVhZGVyczogb3B0aW9uc18uaGVhZGVycyB8fCB0aGlzLl9vcHRpb25zLmhlYWRlcnMsXG4gICAgICByZXNwb25zZVRhcmdldDogb3B0aW9uc18ucmVzcG9uc2VUYXJnZXQgfHwgdGhpcy5fb3B0aW9ucy5yZXNwb25zZVRhcmdldCxcbiAgICAgIGF1dG9GZXRjaDogb3B0aW9uc18uYXV0b0ZldGNoIHx8IHRoaXMuX29wdGlvbnMuYXV0b0ZldGNoLFxuICAgICAgbWF4RmV0Y2g6IG9wdGlvbnNfLm1heEZldGNoIHx8IHRoaXMuX29wdGlvbnMubWF4RmV0Y2gsXG4gICAgICBzY2FuQWxsOiBvcHRpb25zXy5zY2FuQWxsIHx8IHRoaXMuX29wdGlvbnMuc2NhbkFsbCxcbiAgICB9O1xuXG4gICAgLy8gY29sbGVjdCBmZXRjaGVkIHJlY29yZHMgaW4gYXJyYXlcbiAgICAvLyBvbmx5IHdoZW4gcmVzcG9uc2UgdGFyZ2V0IGlzIFJlY29yZHMgYW5kXG4gICAgLy8gZWl0aGVyIGNhbGxiYWNrIG9yIGNoYWluaW5nIHByb21pc2VzIGFyZSBhdmFpbGFibGUgdG8gdGhpcyBxdWVyeS5cbiAgICB0aGlzLm9uY2UoJ2ZldGNoJywgKCkgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICBvcHRpb25zLnJlc3BvbnNlVGFyZ2V0ID09PSBSZXNwb25zZVRhcmdldHMuUmVjb3JkcyAmJlxuICAgICAgICB0aGlzLl9jaGFpbmluZ1xuICAgICAgKSB7XG4gICAgICAgIHRoaXMuX2xvZ2dlci5kZWJ1ZygnLS0tIGNvbGxlY3RpbmcgYWxsIGZldGNoZWQgcmVjb3JkcyAtLS0nKTtcbiAgICAgICAgY29uc3QgcmVjb3JkczogUmVjb3JkW10gPSBbXTtcbiAgICAgICAgY29uc3Qgb25SZWNvcmQgPSAocmVjb3JkOiBSZWNvcmQpID0+IHJlY29yZHMucHVzaChyZWNvcmQpO1xuICAgICAgICB0aGlzLm9uKCdyZWNvcmQnLCBvblJlY29yZCk7XG4gICAgICAgIHRoaXMub25jZSgnZW5kJywgKCkgPT4ge1xuICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIoJ3JlY29yZCcsIG9uUmVjb3JkKTtcbiAgICAgICAgICB0aGlzLmVtaXQoJ3Jlc3BvbnNlJywgcmVjb3JkcywgdGhpcyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gZmxhZyB0byBwcmV2ZW50IHJlLWV4ZWN1dGlvblxuICAgIHRoaXMuX2V4ZWN1dGVkID0gdHJ1ZTtcblxuICAgIChhc3luYyAoKSA9PiB7XG4gICAgICAvLyBzdGFydCBhY3R1YWwgcXVlcnlcbiAgICAgIHRoaXMuX2xvZ2dlci5kZWJ1ZygnPj4+IFF1ZXJ5IHN0YXJ0ID4+PicpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5fZXhlY3V0ZShvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fbG9nZ2VyLmRlYnVnKCcqKiogUXVlcnkgZmluaXNoZWQgKioqJyk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICB0aGlzLl9sb2dnZXIuZGVidWcoJy0tLSBRdWVyeSBlcnJvciAtLS0nLCBlcnJvcik7XG4gICAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcnJvcik7XG4gICAgICB9XG4gICAgfSkoKTtcblxuICAgIC8vIHJldHVybiBRdWVyeSBpbnN0YW5jZSBmb3IgY2hhaW5pbmdcbiAgICByZXR1cm4gKHRoaXMgYXMgUXVlcnk8UywgTiwgUj4pIGFzIFF1ZXJ5PFMsIE4sIFIsIFFSVDE+O1xuICB9XG5cbiAgLyoqXG4gICAqIFN5bm9ueW0gb2YgUXVlcnkjZXhlY3V0ZSgpXG4gICAqL1xuICBleGVjID0gdGhpcy5leGVjdXRlO1xuXG4gIC8qKlxuICAgKiBTeW5vbnltIG9mIFF1ZXJ5I2V4ZWN1dGUoKVxuICAgKi9cbiAgcnVuID0gdGhpcy5leGVjdXRlO1xuXG4gIHByaXZhdGUgbG9jYXRvclRvVXJsKCkge1xuICAgIHJldHVybiB0aGlzLl9sb2NhdG9yXG4gICAgICA/IFt0aGlzLl9jb25uLl9iYXNlVXJsKCksICcvcXVlcnkvJywgdGhpcy5fbG9jYXRvcl0uam9pbignJylcbiAgICAgIDogJyc7XG4gIH1cblxuICBwcml2YXRlIHVybFRvTG9jYXRvcih1cmw6IHN0cmluZykge1xuICAgIHJldHVybiB1cmwuc3BsaXQoJy8nKS5wb3AoKTtcbiAgfVxuXG4gIHByaXZhdGUgY29uc3RydWN0UmVzcG9uc2UoXG4gICAgcmF3RG9uZTogYm9vbGVhbixcbiAgICByZXNwb25zZVRhcmdldDogUXVlcnlSZXNwb25zZVRhcmdldFszXSxcbiAgKTogbnVtYmVyO1xuICBwcml2YXRlIGNvbnN0cnVjdFJlc3BvbnNlKFxuICAgIHJhd0RvbmU6IGJvb2xlYW4sXG4gICAgcmVzcG9uc2VUYXJnZXQ6IFF1ZXJ5UmVzcG9uc2VUYXJnZXRbMl0sXG4gICk6IFI7XG4gIHByaXZhdGUgY29uc3RydWN0UmVzcG9uc2UoXG4gICAgcmF3RG9uZTogYm9vbGVhbixcbiAgICByZXNwb25zZVRhcmdldDogUXVlcnlSZXNwb25zZVRhcmdldFsxXSxcbiAgKTogUltdO1xuICBwcml2YXRlIGNvbnN0cnVjdFJlc3BvbnNlKFxuICAgIHJhd0RvbmU6IGJvb2xlYW4sXG4gICAgcmVzcG9uc2VUYXJnZXQ6IFF1ZXJ5UmVzcG9uc2VUYXJnZXRbMF0sXG4gICk6IFF1ZXJ5UmVzdWx0PFI+O1xuICBwcml2YXRlIGNvbnN0cnVjdFJlc3BvbnNlKFxuICAgIHJhd0RvbmU6IGJvb2xlYW4sXG4gICAgcmVzcG9uc2VUYXJnZXQ6IFF1ZXJ5UmVzcG9uc2VUYXJnZXQsXG4gICk6IFF1ZXJ5UmVzdWx0PFI+IHwgUltdIHwgbnVtYmVyIHwgUiB7XG4gICAgc3dpdGNoIChyZXNwb25zZVRhcmdldCkge1xuICAgICAgY2FzZSAnQ291bnQnOlxuICAgICAgICByZXR1cm4gdGhpcy50b3RhbFNpemU7XG4gICAgICBjYXNlICdTaW5nbGVSZWNvcmQnOlxuICAgICAgICByZXR1cm4gdGhpcy5yZWNvcmRzPy5bMF0gPz8gbnVsbDtcbiAgICAgIGNhc2UgJ1JlY29yZHMnOlxuICAgICAgICByZXR1cm4gdGhpcy5yZWNvcmRzO1xuICAgICAgLy8gUXVlcnlSZXN1bHQgaXMgZGVmYXVsdCByZXNwb25zZSB0YXJnZXRcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4ue1xuICAgICAgICAgICAgcmVjb3JkczogdGhpcy5yZWNvcmRzLFxuICAgICAgICAgICAgdG90YWxTaXplOiB0aGlzLnRvdGFsU2l6ZSxcbiAgICAgICAgICAgIGRvbmU6IHJhd0RvbmUgPz8gdHJ1ZSwgLy8gd2hlbiBubyByZWNvcmRzLCBkb25lIGlzIG9taXR0ZWRcbiAgICAgICAgICB9LFxuICAgICAgICAgIC4uLih0aGlzLl9sb2NhdG9yID8geyBuZXh0UmVjb3Jkc1VybDogdGhpcy5sb2NhdG9yVG9VcmwoKSB9IDoge30pLFxuICAgICAgICB9O1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGFzeW5jIF9leGVjdXRlKG9wdGlvbnM6IFF1ZXJ5T3B0aW9ucyk6IFByb21pc2U8UXVlcnlSZXNwb25zZTxSPj4ge1xuICAgIGNvbnN0IHsgaGVhZGVycywgcmVzcG9uc2VUYXJnZXQsIGF1dG9GZXRjaCwgbWF4RmV0Y2gsIHNjYW5BbGwgfSA9IG9wdGlvbnM7XG4gICAgdGhpcy5fbG9nZ2VyLmRlYnVnKCdleGVjdXRlIHdpdGggb3B0aW9ucycsIG9wdGlvbnMpO1xuICAgIGxldCB1cmw7XG4gICAgaWYgKHRoaXMuX2xvY2F0b3IpIHtcbiAgICAgIHVybCA9IHRoaXMubG9jYXRvclRvVXJsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNvcWwgPSBhd2FpdCB0aGlzLnRvU09RTCgpO1xuICAgICAgdGhpcy5fbG9nZ2VyLmRlYnVnKGBTT1FMID0gJHtzb3FsfWApO1xuICAgICAgdXJsID0gW1xuICAgICAgICB0aGlzLl9jb25uLl9iYXNlVXJsKCksXG4gICAgICAgICcvJyxcbiAgICAgICAgc2NhbkFsbCA/ICdxdWVyeUFsbCcgOiAncXVlcnknLFxuICAgICAgICAnP3E9JyxcbiAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KHNvcWwpLFxuICAgICAgXS5qb2luKCcnKTtcbiAgICB9XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuX2Nvbm4ucmVxdWVzdDxSPih7IG1ldGhvZDogJ0dFVCcsIHVybCwgaGVhZGVycyB9KTtcbiAgICB0aGlzLmVtaXQoJ2ZldGNoJyk7XG4gICAgdGhpcy50b3RhbFNpemUgPSBkYXRhLnRvdGFsU2l6ZTtcbiAgICB0aGlzLnJlY29yZHMgPSB0aGlzLnJlY29yZHM/LmNvbmNhdChcbiAgICAgIG1heEZldGNoIC0gdGhpcy5yZWNvcmRzLmxlbmd0aCA+IGRhdGEucmVjb3Jkcy5sZW5ndGhcbiAgICAgICAgPyBkYXRhLnJlY29yZHNcbiAgICAgICAgOiBkYXRhLnJlY29yZHMuc2xpY2UoMCwgbWF4RmV0Y2ggLSB0aGlzLnJlY29yZHMubGVuZ3RoKSxcbiAgICApO1xuICAgIHRoaXMuX2xvY2F0b3IgPSBkYXRhLm5leHRSZWNvcmRzVXJsXG4gICAgICA/IHRoaXMudXJsVG9Mb2NhdG9yKGRhdGEubmV4dFJlY29yZHNVcmwpXG4gICAgICA6IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9maW5pc2hlZCA9XG4gICAgICB0aGlzLl9maW5pc2hlZCB8fFxuICAgICAgZGF0YS5kb25lIHx8XG4gICAgICAhYXV0b0ZldGNoIHx8XG4gICAgICAvLyB0aGlzIGlzIHdoYXQgdGhlIHJlc3BvbnNlIGxvb2tzIGxpa2Ugd2hlbiB0aGVyZSBhcmUgbm8gcmVzdWx0c1xuICAgICAgKGRhdGEucmVjb3Jkcy5sZW5ndGggPT09IDAgJiYgZGF0YS5kb25lID09PSB1bmRlZmluZWQpO1xuXG4gICAgLy8gc3RyZWFtaW5nIHJlY29yZCBpbnN0YW5jZXNcbiAgICBjb25zdCBudW1SZWNvcmRzID0gZGF0YS5yZWNvcmRzPy5sZW5ndGggPz8gMDtcbiAgICBsZXQgdG90YWxGZXRjaGVkID0gdGhpcy50b3RhbEZldGNoZWQ7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1SZWNvcmRzOyBpKyspIHtcbiAgICAgIGlmICh0b3RhbEZldGNoZWQgPj0gbWF4RmV0Y2gpIHtcbiAgICAgICAgdGhpcy5fZmluaXNoZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlY29yZCA9IGRhdGEucmVjb3Jkc1tpXTtcbiAgICAgIHRoaXMuZW1pdCgncmVjb3JkJywgcmVjb3JkLCB0b3RhbEZldGNoZWQsIHRoaXMpO1xuICAgICAgdG90YWxGZXRjaGVkICs9IDE7XG4gICAgfVxuICAgIHRoaXMudG90YWxGZXRjaGVkID0gdG90YWxGZXRjaGVkO1xuXG4gICAgaWYgKHRoaXMuX2ZpbmlzaGVkKSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IHRoaXMuY29uc3RydWN0UmVzcG9uc2UoZGF0YS5kb25lLCByZXNwb25zZVRhcmdldCk7XG4gICAgICAvLyBvbmx5IGZpcmUgcmVzcG9uc2UgZXZlbnQgd2hlbiBpdCBzaG91bGQgYmUgbm90aWZpZWQgcGVyIGZldGNoXG4gICAgICBpZiAocmVzcG9uc2VUYXJnZXQgIT09IFJlc3BvbnNlVGFyZ2V0cy5SZWNvcmRzKSB7XG4gICAgICAgIHRoaXMuZW1pdCgncmVzcG9uc2UnLCByZXNwb25zZSwgdGhpcyk7XG4gICAgICB9XG4gICAgICB0aGlzLmVtaXQoJ2VuZCcpO1xuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fZXhlY3V0ZShvcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT2J0YWluIHJlYWRhYmxlIHN0cmVhbSBpbnN0YW5jZVxuICAgKi9cbiAgc3RyZWFtKHR5cGU6ICdyZWNvcmQnKTogU2VyaWFsaXphYmxlPFI+O1xuICBzdHJlYW0odHlwZTogJ2NzdicpOiBSZWFkYWJsZTtcbiAgc3RyZWFtKHR5cGU6ICdyZWNvcmQnIHwgJ2NzdicgPSAnY3N2Jykge1xuICAgIGlmICghdGhpcy5fZmluaXNoZWQgJiYgIXRoaXMuX2V4ZWN1dGVkKSB7XG4gICAgICB0aGlzLmV4ZWN1dGUoeyBhdXRvRmV0Y2g6IHRydWUgfSk7XG4gICAgfVxuICAgIHJldHVybiB0eXBlID09PSAncmVjb3JkJyA/IHRoaXMuX3N0cmVhbSA6IHRoaXMuX3N0cmVhbS5zdHJlYW0odHlwZSk7XG4gIH1cblxuICAvKipcbiAgICogUGlwZSB0aGUgcXVlcmllZCByZWNvcmRzIHRvIGFub3RoZXIgc3RyZWFtXG4gICAqIFRoaXMgaXMgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHk7IFF1ZXJ5IGlzIG5vdCBhIHJlY29yZCBzdHJlYW0gaW5zdGFuY2UgYW55bW9yZSBpbiAyLjAuXG4gICAqIElmIHlvdSB3YW50IGEgcmVjb3JkIHN0cmVhbSBpbnN0YW5jZSwgdXNlIGBRdWVyeSNzdHJlYW0oJ3JlY29yZCcpYC5cbiAgICovXG4gIHBpcGUoc3RyZWFtOiBOb2RlSlMuV3JpdGFibGVTdHJlYW0pIHtcbiAgICByZXR1cm4gdGhpcy5zdHJlYW0oJ3JlY29yZCcpLnBpcGUoc3RyZWFtKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICBhc3luYyBfZXhwYW5kRmllbGRzKHNvYmplY3RfPzogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuX3NvcWwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ0Nhbm5vdCBleHBhbmQgZmllbGRzIGZvciB0aGUgcXVlcnkgd2hpY2ggaGFzIGFscmVhZHkgYnVpbHQgU09RTC4nLFxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3QgeyBmaWVsZHMgPSBbXSwgdGFibGUgPSAnJyB9ID0gdGhpcy5fY29uZmlnO1xuICAgIGNvbnN0IHNvYmplY3QgPSBzb2JqZWN0XyB8fCB0YWJsZTtcbiAgICB0aGlzLl9sb2dnZXIuZGVidWcoXG4gICAgICBgX2V4cGFuZEZpZWxkczogc29iamVjdCA9ICR7c29iamVjdH0sIGZpZWxkcyA9ICR7ZmllbGRzLmpvaW4oJywgJyl9YCxcbiAgICApO1xuICAgIGNvbnN0IFtlZmllbGRzXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIHRoaXMuX2V4cGFuZEFzdGVyaXNrRmllbGRzKHNvYmplY3QsIGZpZWxkcyksXG4gICAgICAuLi50aGlzLl9jaGlsZHJlbi5tYXAoYXN5bmMgKGNoaWxkUXVlcnkpID0+IHtcbiAgICAgICAgYXdhaXQgY2hpbGRRdWVyeS5fZXhwYW5kRmllbGRzKCk7XG4gICAgICAgIHJldHVybiBbXSBhcyBzdHJpbmdbXTtcbiAgICAgIH0pLFxuICAgIF0pO1xuICAgIHRoaXMuX2NvbmZpZy5maWVsZHMgPSBlZmllbGRzO1xuICAgIHRoaXMuX2NvbmZpZy5pbmNsdWRlcyA9IHRoaXMuX2NoaWxkcmVuXG4gICAgICAubWFwKChjcXVlcnkpID0+IHtcbiAgICAgICAgY29uc3QgY2NvbmZpZyA9IGNxdWVyeS5fcXVlcnkuX2NvbmZpZztcbiAgICAgICAgcmV0dXJuIFtjY29uZmlnLnRhYmxlLCBjY29uZmlnXSBhcyBbc3RyaW5nLCBTT1FMUXVlcnlDb25maWddO1xuICAgICAgfSlcbiAgICAgIC5yZWR1Y2UoXG4gICAgICAgIChpbmNsdWRlcywgW2N0YWJsZSwgY2NvbmZpZ10pID0+ICh7XG4gICAgICAgICAgLi4uaW5jbHVkZXMsXG4gICAgICAgICAgW2N0YWJsZV06IGNjb25maWcsXG4gICAgICAgIH0pLFxuICAgICAgICB7fSBhcyB7IFtuYW1lOiBzdHJpbmddOiBTT1FMUXVlcnlDb25maWcgfSxcbiAgICAgICk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICovXG4gIGFzeW5jIF9maW5kUmVsYXRpb25PYmplY3QocmVsTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCB0YWJsZSA9IHRoaXMuX2NvbmZpZy50YWJsZTtcbiAgICBpZiAoIXRhYmxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHRhYmxlIGluZm9ybWF0aW9uIHByb3ZpZGVkIGluIHRoZSBxdWVyeScpO1xuICAgIH1cbiAgICB0aGlzLl9sb2dnZXIuZGVidWcoXG4gICAgICBgZmluZGluZyB0YWJsZSBmb3IgcmVsYXRpb24gXCIke3JlbE5hbWV9XCIgaW4gXCIke3RhYmxlfVwiLi4uYCxcbiAgICApO1xuICAgIGNvbnN0IHNvYmplY3QgPSBhd2FpdCB0aGlzLl9jb25uLmRlc2NyaWJlJCh0YWJsZSk7XG4gICAgY29uc3QgdXBwZXJSbmFtZSA9IHJlbE5hbWUudG9VcHBlckNhc2UoKTtcbiAgICBmb3IgKGNvbnN0IGNyIG9mIHNvYmplY3QuY2hpbGRSZWxhdGlvbnNoaXBzKSB7XG4gICAgICBpZiAoXG4gICAgICAgIChjci5yZWxhdGlvbnNoaXBOYW1lIHx8ICcnKS50b1VwcGVyQ2FzZSgpID09PSB1cHBlclJuYW1lICYmXG4gICAgICAgIGNyLmNoaWxkU09iamVjdFxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBjci5jaGlsZFNPYmplY3Q7XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihgTm8gY2hpbGQgcmVsYXRpb25zaGlwIGZvdW5kOiAke3JlbE5hbWV9YCk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICovXG4gIGFzeW5jIF9leHBhbmRBc3Rlcmlza0ZpZWxkcyhcbiAgICBzb2JqZWN0OiBzdHJpbmcsXG4gICAgZmllbGRzOiBzdHJpbmdbXSxcbiAgKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGNvbnN0IGV4cGFuZGVkRmllbGRzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICBmaWVsZHMubWFwKGFzeW5jIChmaWVsZCkgPT4gdGhpcy5fZXhwYW5kQXN0ZXJpc2tGaWVsZChzb2JqZWN0LCBmaWVsZCkpLFxuICAgICk7XG4gICAgcmV0dXJuIGV4cGFuZGVkRmllbGRzLnJlZHVjZShcbiAgICAgIChlZmxkczogc3RyaW5nW10sIGZsZHM6IHN0cmluZ1tdKTogc3RyaW5nW10gPT4gWy4uLmVmbGRzLCAuLi5mbGRzXSxcbiAgICAgIFtdLFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICovXG4gIGFzeW5jIF9leHBhbmRBc3Rlcmlza0ZpZWxkKFxuICAgIHNvYmplY3Q6IHN0cmluZyxcbiAgICBmaWVsZDogc3RyaW5nLFxuICApOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgdGhpcy5fbG9nZ2VyLmRlYnVnKGBleHBhbmRpbmcgZmllbGQgXCIke2ZpZWxkfVwiIGluIFwiJHtzb2JqZWN0fVwiLi4uYCk7XG4gICAgY29uc3QgZnBhdGggPSBmaWVsZC5zcGxpdCgnLicpO1xuICAgIGlmIChmcGF0aFtmcGF0aC5sZW5ndGggLSAxXSA9PT0gJyonKSB7XG4gICAgICBjb25zdCBzbyA9IGF3YWl0IHRoaXMuX2Nvbm4uZGVzY3JpYmUkKHNvYmplY3QpO1xuICAgICAgdGhpcy5fbG9nZ2VyLmRlYnVnKGB0YWJsZSAke3NvYmplY3R9IGhhcyBiZWVuIGRlc2NyaWJlZGApO1xuICAgICAgaWYgKGZwYXRoLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgY29uc3Qgcm5hbWUgPSBmcGF0aC5zaGlmdCgpO1xuICAgICAgICBmb3IgKGNvbnN0IGYgb2Ygc28uZmllbGRzKSB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgZi5yZWxhdGlvbnNoaXBOYW1lICYmXG4gICAgICAgICAgICBybmFtZSAmJlxuICAgICAgICAgICAgZi5yZWxhdGlvbnNoaXBOYW1lLnRvVXBwZXJDYXNlKCkgPT09IHJuYW1lLnRvVXBwZXJDYXNlKClcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnN0IHJmaWVsZCA9IGY7XG4gICAgICAgICAgICBjb25zdCByZWZlcmVuY2VUbyA9IHJmaWVsZC5yZWZlcmVuY2VUbyB8fCBbXTtcbiAgICAgICAgICAgIGNvbnN0IHJ0YWJsZSA9IHJlZmVyZW5jZVRvLmxlbmd0aCA9PT0gMSA/IHJlZmVyZW5jZVRvWzBdIDogJ05hbWUnO1xuICAgICAgICAgICAgY29uc3QgZnBhdGhzID0gYXdhaXQgdGhpcy5fZXhwYW5kQXN0ZXJpc2tGaWVsZChcbiAgICAgICAgICAgICAgcnRhYmxlLFxuICAgICAgICAgICAgICBmcGF0aC5qb2luKCcuJyksXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuIGZwYXRocy5tYXAoKGZwKSA9PiBgJHtybmFtZX0uJHtmcH1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNvLmZpZWxkcy5tYXAoKGYpID0+IGYubmFtZSk7XG4gICAgfVxuICAgIHJldHVybiBbZmllbGRdO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGxhaW4gcGxhbiBmb3IgZXhlY3V0aW5nIHF1ZXJ5XG4gICAqL1xuICBhc3luYyBleHBsYWluKCkge1xuICAgIGNvbnN0IHNvcWwgPSBhd2FpdCB0aGlzLnRvU09RTCgpO1xuICAgIHRoaXMuX2xvZ2dlci5kZWJ1ZyhgU09RTCA9ICR7c29xbH1gKTtcbiAgICBjb25zdCB1cmwgPSBgL3F1ZXJ5Lz9leHBsYWluPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNvcWwpfWA7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm4ucmVxdWVzdDxRdWVyeUV4cGxhaW5SZXN1bHQ+KHVybCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIFNPUUwgZXhwcmVzc2lvbiBmb3IgdGhlIHF1ZXJ5XG4gICAqL1xuICBhc3luYyB0b1NPUUwoKSB7XG4gICAgaWYgKHRoaXMuX3NvcWwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zb3FsO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLl9leHBhbmRGaWVsZHMoKTtcbiAgICByZXR1cm4gY3JlYXRlU09RTCh0aGlzLl9jb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21pc2UvQSsgaW50ZXJmYWNlXG4gICAqIGh0dHA6Ly9wcm9taXNlcy1hcGx1cy5naXRodWIuaW8vcHJvbWlzZXMtc3BlYy9cbiAgICpcbiAgICogRGVsZWdhdGUgdG8gZGVmZXJyZWQgcHJvbWlzZSwgcmV0dXJuIHByb21pc2UgaW5zdGFuY2UgZm9yIHF1ZXJ5IHJlc3VsdFxuICAgKi9cbiAgdGhlbjxVLCBWPihcbiAgICBvblJlc29sdmU/OlxuICAgICAgfCAoKHFyOiBRdWVyeVJlc3BvbnNlPFIsIFFSVD4pID0+IFUgfCBQcm9taXNlPFU+KVxuICAgICAgfCBudWxsXG4gICAgICB8IHVuZGVmaW5lZCxcbiAgICBvblJlamVjdD86ICgoZXJyOiBFcnJvcikgPT4gViB8IFByb21pc2U8Vj4pIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgKTogUHJvbWlzZTxVIHwgVj4ge1xuICAgIHRoaXMuX2NoYWluaW5nID0gdHJ1ZTtcbiAgICBpZiAoIXRoaXMuX2ZpbmlzaGVkICYmICF0aGlzLl9leGVjdXRlZCkge1xuICAgICAgdGhpcy5leGVjdXRlKCk7XG4gICAgfVxuICAgIGlmICghdGhpcy5fcHJvbWlzZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnaW52YWxpZCBzdGF0ZTogcHJvbWlzZSBpcyBub3Qgc2V0IGFmdGVyIHF1ZXJ5IGV4ZWN1dGlvbicsXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcHJvbWlzZS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpO1xuICB9XG5cbiAgY2F0Y2goXG4gICAgb25SZWplY3Q6IChcbiAgICAgIGVycjogRXJyb3IsXG4gICAgKSA9PiBRdWVyeVJlc3BvbnNlPFIsIFFSVD4gfCBQcm9taXNlPFF1ZXJ5UmVzcG9uc2U8UiwgUVJUPj4sXG4gICk6IFByb21pc2U8UXVlcnlSZXNwb25zZTxSLCBRUlQ+PiB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdCk7XG4gIH1cblxuICBwcm9taXNlKCk6IFByb21pc2U8UXVlcnlSZXNwb25zZTxSLCBRUlQ+PiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWxrIGRlbGV0ZSBxdWVyaWVkIHJlY29yZHNcbiAgICovXG4gIGRlc3Ryb3kob3B0aW9ucz86IFF1ZXJ5RGVzdHJveU9wdGlvbnMpOiBQcm9taXNlPFNhdmVSZXN1bHRbXT47XG4gIGRlc3Ryb3kodHlwZTogTiwgb3B0aW9ucz86IFF1ZXJ5RGVzdHJveU9wdGlvbnMpOiBQcm9taXNlPFNhdmVSZXN1bHRbXT47XG4gIGRlc3Ryb3kodHlwZT86IE4gfCBRdWVyeURlc3Ryb3lPcHRpb25zLCBvcHRpb25zPzogUXVlcnlEZXN0cm95T3B0aW9ucykge1xuICAgIGlmICh0eXBlb2YgdHlwZSA9PT0gJ29iamVjdCcgJiYgdHlwZSAhPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucyA9IHR5cGU7XG4gICAgICB0eXBlID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBjb25zdCB0eXBlXzogT3B0aW9uYWw8Tj4gPSB0eXBlIHx8ICh0aGlzLl9jb25maWcudGFibGUgYXMgT3B0aW9uYWw8Tj4pO1xuICAgIGlmICghdHlwZV8pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ1NPUUwgYmFzZWQgcXVlcnkgbmVlZHMgU09iamVjdCB0eXBlIGluZm9ybWF0aW9uIHRvIGJ1bGsgZGVsZXRlLicsXG4gICAgICApO1xuICAgIH1cbiAgICAvLyBTZXQgdGhlIHRocmVzaG9sZCBudW1iZXIgdG8gcGFzcyB0byBidWxrIEFQSVxuICAgIGNvbnN0IHRocmVzaG9sZE51bSA9XG4gICAgICBvcHRpb25zLmFsbG93QnVsayA9PT0gZmFsc2VcbiAgICAgICAgPyAtMVxuICAgICAgICA6IHR5cGVvZiBvcHRpb25zLmJ1bGtUaHJlc2hvbGQgPT09ICdudW1iZXInXG4gICAgICAgID8gb3B0aW9ucy5idWxrVGhyZXNob2xkXG4gICAgICAgIDogLy8gZGV0ZXJtaW5lIHRocmVzaG9sZCBpZiB0aGUgY29ubmVjdGlvbiB2ZXJzaW9uIHN1cHBvcnRzIFNPYmplY3QgY29sbGVjdGlvbiBBUEkgb3Igbm90XG4gICAgICAgIHRoaXMuX2Nvbm4uX2Vuc3VyZVZlcnNpb24oNDIpXG4gICAgICAgID8gREVGQVVMVF9CVUxLX1RIUkVTSE9MRFxuICAgICAgICA6IHRoaXMuX2Nvbm4uX21heFJlcXVlc3QgLyAyO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBjcmVhdGVCYXRjaCA9ICgpID0+XG4gICAgICAgIHRoaXMuX2Nvbm5cbiAgICAgICAgICAuc29iamVjdCh0eXBlXylcbiAgICAgICAgICAuZGVsZXRlQnVsaygpXG4gICAgICAgICAgLm9uKCdyZXNwb25zZScsIHJlc29sdmUpXG4gICAgICAgICAgLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgICBsZXQgcmVjb3JkczogUmVjb3JkW10gPSBbXTtcbiAgICAgIGxldCBiYXRjaDogUmV0dXJuVHlwZTx0eXBlb2YgY3JlYXRlQmF0Y2g+IHwgbnVsbCA9IG51bGw7XG4gICAgICBjb25zdCBoYW5kbGVSZWNvcmQgPSAocmVjOiBSZWNvcmQpID0+IHtcbiAgICAgICAgaWYgKCFyZWMuSWQpIHtcbiAgICAgICAgICBjb25zdCBlcnIgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnUXVlcmllZCByZWNvcmQgZG9lcyBub3QgaW5jbHVkZSBTYWxlc2ZvcmNlIHJlY29yZCBJRC4nLFxuICAgICAgICAgICk7XG4gICAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlY29yZDogUmVjb3JkID0geyBJZDogcmVjLklkIH07XG4gICAgICAgIGlmIChiYXRjaCkge1xuICAgICAgICAgIGJhdGNoLndyaXRlKHJlY29yZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVjb3Jkcy5wdXNoKHJlY29yZCk7XG4gICAgICAgICAgaWYgKHRocmVzaG9sZE51bSA+PSAwICYmIHJlY29yZHMubGVuZ3RoID4gdGhyZXNob2xkTnVtKSB7XG4gICAgICAgICAgICAvLyBVc2UgYnVsayBkZWxldGUgaW5zdGVhZCBvZiBTT2JqZWN0IFJFU1QgQVBJXG4gICAgICAgICAgICBiYXRjaCA9IGNyZWF0ZUJhdGNoKCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlY29yZCBvZiByZWNvcmRzKSB7XG4gICAgICAgICAgICAgIGJhdGNoLndyaXRlKHJlY29yZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWNvcmRzID0gW107XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY29uc3QgaGFuZGxlRW5kID0gKCkgPT4ge1xuICAgICAgICBpZiAoYmF0Y2gpIHtcbiAgICAgICAgICBiYXRjaC5lbmQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBpZHMgPSByZWNvcmRzLm1hcCgocmVjb3JkKSA9PiByZWNvcmQuSWQgYXMgc3RyaW5nKTtcbiAgICAgICAgICB0aGlzLl9jb25uXG4gICAgICAgICAgICAuc29iamVjdCh0eXBlXylcbiAgICAgICAgICAgIC5kZXN0cm95KGlkcywgeyBhbGxvd1JlY3Vyc2l2ZTogdHJ1ZSB9KVxuICAgICAgICAgICAgLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHRoaXMuc3RyZWFtKCdyZWNvcmQnKVxuICAgICAgICAub24oJ2RhdGEnLCBoYW5kbGVSZWNvcmQpXG4gICAgICAgIC5vbignZW5kJywgaGFuZGxlRW5kKVxuICAgICAgICAub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTeW5vbnltIG9mIFF1ZXJ5I2Rlc3Ryb3koKVxuICAgKi9cbiAgZGVsZXRlID0gdGhpcy5kZXN0cm95O1xuXG4gIC8qKlxuICAgKiBTeW5vbnltIG9mIFF1ZXJ5I2Rlc3Ryb3koKVxuICAgKi9cbiAgZGVsID0gdGhpcy5kZXN0cm95O1xuXG4gIC8qKlxuICAgKiBCdWxrIHVwZGF0ZSBxdWVyaWVkIHJlY29yZHMsIHVzaW5nIGdpdmVuIG1hcHBpbmcgZnVuY3Rpb24vb2JqZWN0XG4gICAqL1xuICB1cGRhdGU8VVIgZXh0ZW5kcyBTT2JqZWN0SW5wdXRSZWNvcmQ8UywgTj4+KFxuICAgIG1hcHBpbmc6ICgocmVjOiBSKSA9PiBVUikgfCBVUixcbiAgICB0eXBlOiBOLFxuICAgIG9wdGlvbnM/OiBRdWVyeVVwZGF0ZU9wdGlvbnMsXG4gICk6IFByb21pc2U8U2F2ZVJlc3VsdFtdPjtcbiAgdXBkYXRlPFVSIGV4dGVuZHMgU09iamVjdElucHV0UmVjb3JkPFMsIE4+PihcbiAgICBtYXBwaW5nOiAoKHJlYzogUikgPT4gVVIpIHwgVVIsXG4gICAgb3B0aW9ucz86IFF1ZXJ5VXBkYXRlT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxTYXZlUmVzdWx0W10+O1xuICB1cGRhdGU8VVIgZXh0ZW5kcyBTT2JqZWN0SW5wdXRSZWNvcmQ8UywgTj4+KFxuICAgIG1hcHBpbmc6ICgocmVjOiBSKSA9PiBVUikgfCBVUixcbiAgICB0eXBlPzogTiB8IFF1ZXJ5VXBkYXRlT3B0aW9ucyxcbiAgICBvcHRpb25zPzogUXVlcnlVcGRhdGVPcHRpb25zLFxuICApIHtcbiAgICBpZiAodHlwZW9mIHR5cGUgPT09ICdvYmplY3QnICYmIHR5cGUgIT09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMgPSB0eXBlO1xuICAgICAgdHlwZSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgY29uc3QgdHlwZV86IE9wdGlvbmFsPE4+ID1cbiAgICAgIHR5cGUgfHwgKHRoaXMuX2NvbmZpZyAmJiAodGhpcy5fY29uZmlnLnRhYmxlIGFzIE9wdGlvbmFsPE4+KSk7XG4gICAgaWYgKCF0eXBlXykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnU09RTCBiYXNlZCBxdWVyeSBuZWVkcyBTT2JqZWN0IHR5cGUgaW5mb3JtYXRpb24gdG8gYnVsayB1cGRhdGUuJyxcbiAgICAgICk7XG4gICAgfVxuICAgIGNvbnN0IHVwZGF0ZVN0cmVhbSA9XG4gICAgICB0eXBlb2YgbWFwcGluZyA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IFJlY29yZFN0cmVhbS5tYXAobWFwcGluZylcbiAgICAgICAgOiBSZWNvcmRTdHJlYW0ucmVjb3JkTWFwU3RyZWFtKG1hcHBpbmcpO1xuICAgIC8vIFNldCB0aGUgdGhyZXNob2xkIG51bWJlciB0byBwYXNzIHRvIGJ1bGsgQVBJXG4gICAgY29uc3QgdGhyZXNob2xkTnVtID1cbiAgICAgIG9wdGlvbnMuYWxsb3dCdWxrID09PSBmYWxzZVxuICAgICAgICA/IC0xXG4gICAgICAgIDogdHlwZW9mIG9wdGlvbnMuYnVsa1RocmVzaG9sZCA9PT0gJ251bWJlcidcbiAgICAgICAgPyBvcHRpb25zLmJ1bGtUaHJlc2hvbGRcbiAgICAgICAgOiAvLyBkZXRlcm1pbmUgdGhyZXNob2xkIGlmIHRoZSBjb25uZWN0aW9uIHZlcnNpb24gc3VwcG9ydHMgU09iamVjdCBjb2xsZWN0aW9uIEFQSSBvciBub3RcbiAgICAgICAgdGhpcy5fY29ubi5fZW5zdXJlVmVyc2lvbig0MilcbiAgICAgICAgPyBERUZBVUxUX0JVTEtfVEhSRVNIT0xEXG4gICAgICAgIDogdGhpcy5fY29ubi5fbWF4UmVxdWVzdCAvIDI7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGNyZWF0ZUJhdGNoID0gKCkgPT5cbiAgICAgICAgdGhpcy5fY29ublxuICAgICAgICAgIC5zb2JqZWN0KHR5cGVfKVxuICAgICAgICAgIC51cGRhdGVCdWxrKClcbiAgICAgICAgICAub24oJ3Jlc3BvbnNlJywgcmVzb2x2ZSlcbiAgICAgICAgICAub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgIGxldCByZWNvcmRzOiBTT2JqZWN0VXBkYXRlUmVjb3JkPFMsIE4+W10gPSBbXTtcbiAgICAgIGxldCBiYXRjaDogUmV0dXJuVHlwZTx0eXBlb2YgY3JlYXRlQmF0Y2g+IHwgbnVsbCA9IG51bGw7XG4gICAgICBjb25zdCBoYW5kbGVSZWNvcmQgPSAocmVjb3JkOiBSZWNvcmQpID0+IHtcbiAgICAgICAgaWYgKGJhdGNoKSB7XG4gICAgICAgICAgYmF0Y2gud3JpdGUocmVjb3JkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWNvcmRzLnB1c2gocmVjb3JkIGFzIFNPYmplY3RVcGRhdGVSZWNvcmQ8UywgTj4pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aHJlc2hvbGROdW0gPj0gMCAmJiByZWNvcmRzLmxlbmd0aCA+IHRocmVzaG9sZE51bSkge1xuICAgICAgICAgIC8vIFVzZSBidWxrIHVwZGF0ZSBpbnN0ZWFkIG9mIFNPYmplY3QgUkVTVCBBUElcbiAgICAgICAgICBiYXRjaCA9IGNyZWF0ZUJhdGNoKCk7XG4gICAgICAgICAgZm9yIChjb25zdCByZWNvcmQgb2YgcmVjb3Jkcykge1xuICAgICAgICAgICAgYmF0Y2gud3JpdGUocmVjb3JkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVjb3JkcyA9IFtdO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY29uc3QgaGFuZGxlRW5kID0gKCkgPT4ge1xuICAgICAgICBpZiAoYmF0Y2gpIHtcbiAgICAgICAgICBiYXRjaC5lbmQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9jb25uXG4gICAgICAgICAgICAuc29iamVjdCh0eXBlXylcbiAgICAgICAgICAgIC51cGRhdGUocmVjb3JkcywgeyBhbGxvd1JlY3Vyc2l2ZTogdHJ1ZSB9KVxuICAgICAgICAgICAgLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHRoaXMuc3RyZWFtKCdyZWNvcmQnKVxuICAgICAgICAub24oJ2Vycm9yJywgcmVqZWN0KVxuICAgICAgICAucGlwZSh1cGRhdGVTdHJlYW0pXG4gICAgICAgIC5vbignZGF0YScsIGhhbmRsZVJlY29yZClcbiAgICAgICAgLm9uKCdlbmQnLCBoYW5kbGVFbmQpXG4gICAgICAgIC5vbignZXJyb3InLCByZWplY3QpO1xuICAgIH0pO1xuICB9XG59XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4vKipcbiAqIFN1YlF1ZXJ5IG9iamVjdCBmb3IgcmVwcmVzZW50aW5nIGNoaWxkIHJlbGF0aW9uc2hpcCBxdWVyeVxuICovXG5leHBvcnQgY2xhc3MgU3ViUXVlcnk8XG4gIFMgZXh0ZW5kcyBTY2hlbWEsXG4gIFBOIGV4dGVuZHMgU09iamVjdE5hbWVzPFM+LFxuICBQUiBleHRlbmRzIFJlY29yZCxcbiAgUFFSVCBleHRlbmRzIFF1ZXJ5UmVzcG9uc2VUYXJnZXQsXG4gIENSTiBleHRlbmRzIENoaWxkUmVsYXRpb25zaGlwTmFtZXM8UywgUE4+ID0gQ2hpbGRSZWxhdGlvbnNoaXBOYW1lczxTLCBQTj4sXG4gIENOIGV4dGVuZHMgU09iamVjdE5hbWVzPFM+ID0gQ2hpbGRSZWxhdGlvbnNoaXBTT2JqZWN0TmFtZTxTLCBQTiwgQ1JOPixcbiAgQ1IgZXh0ZW5kcyBSZWNvcmQgPSBSZWNvcmRcbj4ge1xuICBfcmVsTmFtZTogQ1JOO1xuICBfcXVlcnk6IFF1ZXJ5PFMsIENOLCBDUj47XG4gIF9wYXJlbnQ6IFF1ZXJ5PFMsIFBOLCBQUiwgUFFSVD47XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBjb25uOiBDb25uZWN0aW9uPFM+LFxuICAgIHJlbE5hbWU6IENSTixcbiAgICBjb25maWc6IFF1ZXJ5Q29uZmlnPFMsIENOPixcbiAgICBwYXJlbnQ6IFF1ZXJ5PFMsIFBOLCBQUiwgUFFSVD4sXG4gICkge1xuICAgIHRoaXMuX3JlbE5hbWUgPSByZWxOYW1lO1xuICAgIHRoaXMuX3F1ZXJ5ID0gbmV3IFF1ZXJ5KGNvbm4sIGNvbmZpZyk7XG4gICAgdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBzZWxlY3Q8XG4gICAgUiBleHRlbmRzIFJlY29yZCA9IFJlY29yZCxcbiAgICBGUCBleHRlbmRzIEZpZWxkUGF0aFNwZWNpZmllcjxTLCBDTj4gPSBGaWVsZFBhdGhTcGVjaWZpZXI8UywgQ04+LFxuICAgIEZQQyBleHRlbmRzIEZpZWxkUHJvamVjdGlvbkNvbmZpZyA9IEZpZWxkUGF0aFNjb3BlZFByb2plY3Rpb248UywgQ04sIEZQPlxuICA+KFxuICAgIGZpZWxkczogUXVlcnlGaWVsZDxTLCBDTiwgRlA+LFxuICApOiBTdWJRdWVyeTxTLCBQTiwgUFIsIFBRUlQsIENSTiwgQ04sIFNPYmplY3RSZWNvcmQ8UywgQ04sIEZQQywgUj4+IHtcbiAgICAvLyBmb3JjZSBjb252ZXJ0IHF1ZXJ5IHJlY29yZCB0eXBlIHdpdGhvdXQgY2hhbmdpbmcgaW5zdGFuY2VcbiAgICB0aGlzLl9xdWVyeSA9IHRoaXMuX3F1ZXJ5LnNlbGVjdChmaWVsZHMpIGFzIGFueTtcbiAgICByZXR1cm4gKHRoaXMgYXMgYW55KSBhcyBTdWJRdWVyeTxcbiAgICAgIFMsXG4gICAgICBQTixcbiAgICAgIFBSLFxuICAgICAgUFFSVCxcbiAgICAgIENSTixcbiAgICAgIENOLFxuICAgICAgU09iamVjdFJlY29yZDxTLCBDTiwgRlBDLCBSPlxuICAgID47XG4gIH1cblxuICAvKipcbiAgICpcbiAgICovXG4gIHdoZXJlKGNvbmRpdGlvbnM6IFF1ZXJ5Q29uZGl0aW9uPFMsIENOPiB8IHN0cmluZyk6IHRoaXMge1xuICAgIHRoaXMuX3F1ZXJ5ID0gdGhpcy5fcXVlcnkud2hlcmUoY29uZGl0aW9ucyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTGltaXQgdGhlIHJldHVybmluZyByZXN1bHRcbiAgICovXG4gIGxpbWl0KGxpbWl0OiBudW1iZXIpIHtcbiAgICB0aGlzLl9xdWVyeSA9IHRoaXMuX3F1ZXJ5LmxpbWl0KGxpbWl0KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTa2lwIHJlY29yZHNcbiAgICovXG4gIHNraXAob2Zmc2V0OiBudW1iZXIpIHtcbiAgICB0aGlzLl9xdWVyeSA9IHRoaXMuX3F1ZXJ5LnNraXAob2Zmc2V0KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTeW5vbnltIG9mIFN1YlF1ZXJ5I3NraXAoKVxuICAgKi9cbiAgb2Zmc2V0ID0gdGhpcy5za2lwO1xuXG4gIC8qKlxuICAgKiBTZXQgcXVlcnkgc29ydCB3aXRoIGRpcmVjdGlvblxuICAgKi9cbiAgc29ydChzb3J0OiBRdWVyeVNvcnQ8UywgQ04+KTogdGhpcztcbiAgc29ydChzb3J0OiBzdHJpbmcpOiB0aGlzO1xuICBzb3J0KHNvcnQ6IFNPYmplY3RGaWVsZE5hbWVzPFMsIENOPiwgZGlyOiBTb3J0RGlyKTogdGhpcztcbiAgc29ydChzb3J0OiBzdHJpbmcsIGRpcjogU29ydERpcik6IHRoaXM7XG4gIHNvcnQoXG4gICAgc29ydDogUXVlcnlTb3J0PFMsIENOPiB8IFNPYmplY3RGaWVsZE5hbWVzPFMsIENOPiB8IHN0cmluZyxcbiAgICBkaXI/OiBTb3J0RGlyLFxuICApIHtcbiAgICB0aGlzLl9xdWVyeSA9IHRoaXMuX3F1ZXJ5LnNvcnQoc29ydCBhcyBhbnksIGRpciBhcyBTb3J0RGlyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTeW5vbnltIG9mIFN1YlF1ZXJ5I3NvcnQoKVxuICAgKi9cbiAgb3JkZXJieTogdHlwZW9mIFN1YlF1ZXJ5LnByb3RvdHlwZS5zb3J0ID0gdGhpcy5zb3J0O1xuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgYXN5bmMgX2V4cGFuZEZpZWxkcygpIHtcbiAgICBjb25zdCBzb2JqZWN0ID0gYXdhaXQgdGhpcy5fcGFyZW50Ll9maW5kUmVsYXRpb25PYmplY3QodGhpcy5fcmVsTmFtZSk7XG4gICAgcmV0dXJuIHRoaXMuX3F1ZXJ5Ll9leHBhbmRGaWVsZHMoc29iamVjdCk7XG4gIH1cblxuICAvKipcbiAgICogQmFjayB0aGUgY29udGV4dCB0byBwYXJlbnQgcXVlcnkgb2JqZWN0XG4gICAqL1xuICBlbmQ8XG4gICAgQ1JQIGV4dGVuZHMgU09iamVjdENoaWxkUmVsYXRpb25zaGlwUHJvcDxcbiAgICAgIENSTixcbiAgICAgIENSXG4gICAgPiA9IFNPYmplY3RDaGlsZFJlbGF0aW9uc2hpcFByb3A8Q1JOLCBDUj4sXG4gICAgUFIxIGV4dGVuZHMgUmVjb3JkID0gUFIgJiBDUlBcbiAgPigpOiBRdWVyeTxTLCBQTiwgUFIxLCBQUVJUPiB7XG4gICAgcmV0dXJuICh0aGlzLl9wYXJlbnQgYXMgYW55KSBhcyBRdWVyeTxTLCBQTiwgUFIxLCBQUVJUPjtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBRdWVyeTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUE7O0FBQ0E7O0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7Ozs7QUE0SUEsTUFBTUEsb0JBQW9CLEdBQUcsQ0FDM0IsYUFEMkIsRUFFM0IsU0FGMkIsRUFHM0IsY0FIMkIsRUFJM0IsT0FKMkIsQ0FBN0I7QUFTTyxNQUFNQyxlQUVaLEdBQUcscUJBQUFELG9CQUFvQixNQUFwQixDQUFBQSxvQkFB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