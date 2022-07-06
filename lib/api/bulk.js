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

exports.default = exports.Job = exports.Bulk = exports.Batch = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectWithoutProperties"));

require("core-js/modules/es.promise.js");

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/trim"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys"));

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/parse-int"));

var _setTimeout2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/set-timeout"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _events = require("events");

var _stream = require("stream");

var _multistream = _interopRequireDefault(require("multistream"));

var _recordStream = require("../record-stream");

var _httpApi = _interopRequireDefault(require("../http-api"));

var _jsforce = require("../jsforce");

var _stream2 = require("../util/stream");

var _function = require("../util/function");

const _excluded = ["Id", "type", "attributes"],
      _excluded2 = ["path", "responseType"];

function ownKeys(object, enumerableOnly) { var keys = _Object$keys2(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context4, _context5; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context4 = ownKeys(Object(source), !0)).call(_context4, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context5 = ownKeys(Object(source))).call(_context5, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * Class for Bulk API Job
 */
class Job extends _events.EventEmitter {
  /**
   *
   */
  constructor(bulk, type, operation, options, jobId) {
    super();
    (0, _defineProperty2.default)(this, "type", void 0);
    (0, _defineProperty2.default)(this, "operation", void 0);
    (0, _defineProperty2.default)(this, "options", void 0);
    (0, _defineProperty2.default)(this, "id", void 0);
    (0, _defineProperty2.default)(this, "state", void 0);
    (0, _defineProperty2.default)(this, "_bulk", void 0);
    (0, _defineProperty2.default)(this, "_batches", void 0);
    (0, _defineProperty2.default)(this, "_jobInfo", void 0);
    (0, _defineProperty2.default)(this, "_error", void 0);
    this._bulk = bulk;
    this.type = type;
    this.operation = operation;
    this.options = options || {};
    this.id = jobId !== null && jobId !== void 0 ? jobId : null;
    this.state = this.id ? 'Open' : 'Unknown';
    this._batches = {}; // default error handler to keep the latest error

    this.on('error', error => this._error = error);
  }
  /**
   * Return latest jobInfo from cache
   */


  info() {
    // if cache is not available, check the latest
    if (!this._jobInfo) {
      this._jobInfo = this.check();
    }

    return this._jobInfo;
  }
  /**
   * Open new job and get jobinfo
   */


  open() {
    const bulk = this._bulk;
    const options = this.options; // if sobject type / operation is not provided

    if (!this.type || !this.operation) {
      throw new Error('type / operation is required to open a new job');
    } // if not requested opening job


    if (!this._jobInfo) {
      var _context;

      let operation = this.operation.toLowerCase();

      if (operation === 'harddelete') {
        operation = 'hardDelete';
      }

      if (operation === 'queryall') {
        operation = 'queryAll';
      }

      const body = (0, _trim.default)(_context = `
<?xml version="1.0" encoding="UTF-8"?>
<jobInfo  xmlns="http://www.force.com/2009/06/asyncapi/dataload">
  <operation>${operation}</operation>
  <object>${this.type}</object>
  ${options.extIdField ? `<externalIdFieldName>${options.extIdField}</externalIdFieldName>` : ''}
  ${options.concurrencyMode ? `<concurrencyMode>${options.concurrencyMode}</concurrencyMode>` : ''}
  ${options.assignmentRuleId ? `<assignmentRuleId>${options.assignmentRuleId}</assignmentRuleId>` : ''}
  <contentType>CSV</contentType>
</jobInfo>
      `).call(_context);

      this._jobInfo = (async () => {
        try {
          const res = await bulk._request({
            method: 'POST',
            path: '/job',
            body,
            headers: {
              'Content-Type': 'application/xml; charset=utf-8'
            },
            responseType: 'application/xml'
          });
          this.emit('open', res.jobInfo);
          this.id = res.jobInfo.id;
          this.state = res.jobInfo.state;
          return res.jobInfo;
        } catch (err) {
          this.emit('error', err);
          throw err;
        }
      })();
    }

    return this._jobInfo;
  }
  /**
   * Create a new batch instance in the job
   */


  createBatch() {
    const batch = new Batch(this);
    batch.on('queue', () => {
      this._batches[batch.id] = batch;
    });
    return batch;
  }
  /**
   * Get a batch instance specified by given batch ID
   */


  batch(batchId) {
    let batch = this._batches[batchId];

    if (!batch) {
      batch = new Batch(this, batchId);
      this._batches[batchId] = batch;
    }

    return batch;
  }
  /**
   * Check the latest job status from server
   */


  check() {
    const bulk = this._bulk;
    const logger = bulk._logger;

    this._jobInfo = (async () => {
      const jobId = await this.ready();
      const res = await bulk._request({
        method: 'GET',
        path: '/job/' + jobId,
        responseType: 'application/xml'
      });
      logger.debug(res.jobInfo);
      this.id = res.jobInfo.id;
      this.type = res.jobInfo.object;
      this.operation = res.jobInfo.operation;
      this.state = res.jobInfo.state;
      return res.jobInfo;
    })();

    return this._jobInfo;
  }
  /**
   * Wait till the job is assigned to server
   */


  ready() {
    return this.id ? _promise.default.resolve(this.id) : this.open().then(({
      id
    }) => id);
  }
  /**
   * List all registered batch info in job
   */


  async list() {
    const bulk = this._bulk;
    const logger = bulk._logger;
    const jobId = await this.ready();
    const res = await bulk._request({
      method: 'GET',
      path: '/job/' + jobId + '/batch',
      responseType: 'application/xml'
    });
    logger.debug(res.batchInfoList.batchInfo);
    const batchInfoList = (0, _isArray.default)(res.batchInfoList.batchInfo) ? res.batchInfoList.batchInfo : [res.batchInfoList.batchInfo];
    return batchInfoList;
  }
  /**
   * Close opened job
   */


  async close() {
    if (!this.id) {
      return;
    }

    try {
      const jobInfo = await this._changeState('Closed');
      this.id = null;
      this.emit('close', jobInfo);
      return jobInfo;
    } catch (err) {
      this.emit('error', err);
      throw err;
    }
  }
  /**
   * Set the status to abort
   */


  async abort() {
    if (!this.id) {
      return;
    }

    try {
      const jobInfo = await this._changeState('Aborted');
      this.id = null;
      this.emit('abort', jobInfo);
      return jobInfo;
    } catch (err) {
      this.emit('error', err);
      throw err;
    }
  }
  /**
   * @private
   */


  async _changeState(state) {
    const bulk = this._bulk;
    const logger = bulk._logger;

    this._jobInfo = (async () => {
      var _context2;

      const jobId = await this.ready();
      const body = (0, _trim.default)(_context2 = ` 
<?xml version="1.0" encoding="UTF-8"?>
  <jobInfo xmlns="http://www.force.com/2009/06/asyncapi/dataload">
  <state>${state}</state>
</jobInfo>
      `).call(_context2);
      const res = await bulk._request({
        method: 'POST',
        path: '/job/' + jobId,
        body: body,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8'
        },
        responseType: 'application/xml'
      });
      logger.debug(res.jobInfo);
      this.state = res.jobInfo.state;
      return res.jobInfo;
    })();

    return this._jobInfo;
  }

}
/*--------------------------------------------*/


exports.Job = Job;

class PollingTimeoutError extends Error {
  /**
   *
   */
  constructor(message, jobId, batchId) {
    super(message);
    (0, _defineProperty2.default)(this, "jobId", void 0);
    (0, _defineProperty2.default)(this, "batchId", void 0);
    this.name = 'PollingTimeout';
    this.jobId = jobId;
    this.batchId = batchId;
  }

}
/*--------------------------------------------*/

/**
 * Batch (extends Writable)
 */


class Batch extends _stream.Writable {
  /**
   *
   */
  constructor(job, id) {
    super({
      objectMode: true
    });
    (0, _defineProperty2.default)(this, "job", void 0);
    (0, _defineProperty2.default)(this, "id", void 0);
    (0, _defineProperty2.default)(this, "_bulk", void 0);
    (0, _defineProperty2.default)(this, "_uploadStream", void 0);
    (0, _defineProperty2.default)(this, "_downloadStream", void 0);
    (0, _defineProperty2.default)(this, "_dataStream", void 0);
    (0, _defineProperty2.default)(this, "_result", void 0);
    (0, _defineProperty2.default)(this, "_error", void 0);
    (0, _defineProperty2.default)(this, "run", this.execute);
    (0, _defineProperty2.default)(this, "exec", this.execute);
    this.job = job;
    this.id = id;
    this._bulk = job._bulk; // default error handler to keep the latest error

    this.on('error', error => this._error = error); //
    // setup data streams
    //

    const converterOptions = {
      nullValue: '#N/A'
    };
    const uploadStream = this._uploadStream = new _recordStream.Serializable();
    const uploadDataStream = uploadStream.stream('csv', converterOptions);
    const downloadStream = this._downloadStream = new _recordStream.Parsable();
    const downloadDataStream = downloadStream.stream('csv', converterOptions);
    this.on('finish', () => uploadStream.end());
    uploadDataStream.once('readable', async () => {
      try {
        // ensure the job is opened in server or job id is already assigned
        await this.job.ready(); // pipe upload data to batch API request stream

        uploadDataStream.pipe(this._createRequestStream());
      } catch (err) {
        this.emit('error', err);
      }
    }); // duplex data stream, opened access to API programmers by Batch#stream()

    this._dataStream = (0, _stream2.concatStreamsAsDuplex)(uploadDataStream, downloadDataStream);
  }
  /**
   * Connect batch API and create stream instance of request/response
   *
   * @private
   */


  _createRequestStream() {
    const bulk = this._bulk;
    const logger = bulk._logger;

    const req = bulk._request({
      method: 'POST',
      path: '/job/' + this.job.id + '/batch',
      headers: {
        'Content-Type': 'text/csv'
      },
      responseType: 'application/xml'
    });

    (async () => {
      try {
        const res = await req;
        logger.debug(res.batchInfo);
        this.id = res.batchInfo.id;
        this.emit('queue', res.batchInfo);
      } catch (err) {
        this.emit('error', err);
      }
    })();

    return req.stream();
  }
  /**
   * Implementation of Writable
   */


  _write(record_, enc, cb) {
    const {
      Id,
      type,
      attributes
    } = record_,
          rrec = (0, _objectWithoutProperties2.default)(record_, _excluded);
    let record;

    switch (this.job.operation) {
      case 'insert':
        record = rrec;
        break;

      case 'delete':
      case 'hardDelete':
        record = {
          Id
        };
        break;

      default:
        record = _objectSpread({
          Id
        }, rrec);
    }

    this._uploadStream.write(record, enc, cb);
  }
  /**
   * Returns duplex stream which accepts CSV data input and batch result output
   */


  stream() {
    return this._dataStream;
  }
  /**
   * Execute batch operation
   */


  execute(input) {
    // if batch is already executed
    if (this._result) {
      throw new Error('Batch already executed.');
    }

    this._result = new _promise.default((resolve, reject) => {
      this.once('response', resolve);
      this.once('error', reject);
    });

    if ((0, _function.isObject)(input) && 'pipe' in input && (0, _function.isFunction)(input.pipe)) {
      // if input has stream.Readable interface
      input.pipe(this._dataStream);
    } else {
      if ((0, _isArray.default)(input)) {
        for (const record of input) {
          for (const key of (0, _keys.default)(record)) {
            if (typeof record[key] === 'boolean') {
              record[key] = String(record[key]);
            }
          }

          this.write(record);
        }

        this.end();
      } else if (typeof input === 'string') {
        this._dataStream.write(input, 'utf8');

        this._dataStream.end();
      }
    } // return Batch instance for chaining


    return this;
  }

  /**
   * Promise/A+ interface
   * Delegate to promise, return promise instance for batch result
   */
  then(onResolved, onReject) {
    if (!this._result) {
      this.execute();
    }

    return this._result.then(onResolved, onReject);
  }
  /**
   * Check the latest batch status in server
   */


  async check() {
    const bulk = this._bulk;
    const logger = bulk._logger;
    const jobId = this.job.id;
    const batchId = this.id;

    if (!jobId || !batchId) {
      throw new Error('Batch not started.');
    }

    const res = await bulk._request({
      method: 'GET',
      path: '/job/' + jobId + '/batch/' + batchId,
      responseType: 'application/xml'
    });
    logger.debug(res.batchInfo);
    return res.batchInfo;
  }
  /**
   * Polling the batch result and retrieve
   */


  poll(interval, timeout) {
    const jobId = this.job.id;
    const batchId = this.id;

    if (!jobId || !batchId) {
      throw new Error('Batch not started.');
    }

    const startTime = new Date().getTime();

    const poll = async () => {
      const now = new Date().getTime();

      if (startTime + timeout < now) {
        const err = new PollingTimeoutError('Polling time out. Job Id = ' + jobId + ' , batch Id = ' + batchId, jobId, batchId);
        this.emit('error', err);
        return;
      }

      let res;

      try {
        res = await this.check();
      } catch (err) {
        this.emit('error', err);
        return;
      }

      if (res.state === 'Failed') {
        if ((0, _parseInt2.default)(res.numberRecordsProcessed, 10) > 0) {
          this.retrieve();
        } else {
          this.emit('error', new Error(res.stateMessage));
        }
      } else if (res.state === 'Completed') {
        this.retrieve();
      } else {
        this.emit('progress', res);
        (0, _setTimeout2.default)(poll, interval);
      }
    };

    (0, _setTimeout2.default)(poll, interval);
  }
  /**
   * Retrieve batch result
   */


  async retrieve() {
    const bulk = this._bulk;
    const jobId = this.job.id;
    const job = this.job;
    const batchId = this.id;

    if (!jobId || !batchId) {
      throw new Error('Batch not started.');
    }

    try {
      const resp = await bulk._request({
        method: 'GET',
        path: '/job/' + jobId + '/batch/' + batchId + '/result'
      });
      let results;

      if (job.operation === 'query' || job.operation === 'queryAll') {
        var _context3;

        const res = resp;
        let resultId = res['result-list'].result;
        results = (0, _map.default)(_context3 = (0, _isArray.default)(resultId) ? resultId : [resultId]).call(_context3, id => ({
          id,
          batchId,
          jobId
        }));
      } else {
        const res = resp;
        results = (0, _map.default)(res).call(res, ret => ({
          id: ret.Id || null,
          success: ret.Success === 'true',
          errors: ret.Error ? [ret.Error] : []
        }));
      }

      this.emit('response', results);
      return results;
    } catch (err) {
      this.emit('error', err);
      throw err;
    }
  }
  /**
   * Fetch query result as a record stream
   * @param {String} resultId - Result id
   * @returns {RecordStream} - Record stream, convertible to CSV data stream
   */


  result(resultId) {
    const jobId = this.job.id;
    const batchId = this.id;

    if (!jobId || !batchId) {
      throw new Error('Batch not started.');
    }

    const resultStream = new _recordStream.Parsable();
    const resultDataStream = resultStream.stream('csv');

    this._bulk._request({
      method: 'GET',
      path: '/job/' + jobId + '/batch/' + batchId + '/result/' + resultId,
      responseType: 'application/octet-stream'
    }).stream().pipe(resultDataStream);

    return resultStream;
  }

}
/*--------------------------------------------*/

/**
 *
 */


exports.Batch = Batch;

class BulkApi extends _httpApi.default {
  beforeSend(request) {
    var _this$_conn$accessTok;

    request.headers = _objectSpread(_objectSpread({}, request.headers), {}, {
      'X-SFDC-SESSION': (_this$_conn$accessTok = this._conn.accessToken) !== null && _this$_conn$accessTok !== void 0 ? _this$_conn$accessTok : ''
    });
  }

  isSessionExpired(response) {
    return response.statusCode === 400 && /<exceptionCode>InvalidSessionId<\/exceptionCode>/.test(response.body);
  }

  hasErrorInResponseBody(body) {
    return !!body.error;
  }

  parseError(body) {
    return {
      errorCode: body.error.exceptionCode,
      message: body.error.exceptionMessage
    };
  }

}
/*--------------------------------------------*/

/**
 * Class for Bulk API
 *
 * @class
 */


class Bulk {
  /**
   * Polling interval in milliseconds
   */

  /**
   * Polling timeout in milliseconds
   * @type {Number}
   */

  /**
   *
   */
  constructor(conn) {
    (0, _defineProperty2.default)(this, "_conn", void 0);
    (0, _defineProperty2.default)(this, "_logger", void 0);
    (0, _defineProperty2.default)(this, "pollInterval", 1000);
    (0, _defineProperty2.default)(this, "pollTimeout", 10000);
    this._conn = conn;
    this._logger = conn._logger;
  }
  /**
   *
   */


  _request(request_) {
    const conn = this._conn;
    const {
      path,
      responseType
    } = request_,
          rreq = (0, _objectWithoutProperties2.default)(request_, _excluded2);
    const baseUrl = [conn.instanceUrl, 'services/async', conn.version].join('/');

    const request = _objectSpread(_objectSpread({}, rreq), {}, {
      url: baseUrl + path
    });

    return new BulkApi(this._conn, {
      responseType
    }).request(request);
  }
  /**
   * Create and start bulkload job and batch
   */


  load(type, operation, optionsOrInput, input) {
    let options = {};

    if (typeof optionsOrInput === 'string' || (0, _isArray.default)(optionsOrInput) || (0, _function.isObject)(optionsOrInput) && 'pipe' in optionsOrInput && typeof optionsOrInput.pipe === 'function') {
      // when options is not plain hash object, it is omitted
      input = optionsOrInput;
    } else {
      options = optionsOrInput;
    }

    const job = this.createJob(type, operation, options);
    const batch = job.createBatch();

    const cleanup = () => job.close();

    const cleanupOnError = err => {
      if (err.name !== 'PollingTimeout') {
        cleanup();
      }
    };

    batch.on('response', cleanup);
    batch.on('error', cleanupOnError);
    batch.on('queue', () => {
      batch === null || batch === void 0 ? void 0 : batch.poll(this.pollInterval, this.pollTimeout);
    });
    return batch.execute(input);
  }
  /**
   * Execute bulk query and get record stream
   */


  query(soql) {
    const m = soql.replace(/\([\s\S]+\)/g, '').match(/FROM\s+(\w+)/i);

    if (!m) {
      throw new Error('No sobject type found in query, maybe caused by invalid SOQL.');
    }

    const type = m[1];
    const recordStream = new _recordStream.Parsable();
    const dataStream = recordStream.stream('csv');

    (async () => {
      try {
        const results = await this.load(type, 'query', soql);
        const streams = (0, _map.default)(results).call(results, result => this.job(result.jobId).batch(result.batchId).result(result.id).stream());
        (0, _multistream.default)(streams).pipe(dataStream);
      } catch (err) {
        recordStream.emit('error', err);
      }
    })();

    return recordStream;
  }
  /**
   * Create a new job instance
   */


  createJob(type, operation, options = {}) {
    return new Job(this, type, operation, options);
  }
  /**
   * Get a job instance specified by given job ID
   *
   * @param {String} jobId - Job ID
   * @returns {Bulk~Job}
   */


  job(jobId) {
    return new Job(this, null, null, null, jobId);
  }

}
/*--------------------------------------------*/

/*
 * Register hook in connection instantiation for dynamically adding this API module features
 */


exports.Bulk = Bulk;
(0, _jsforce.registerModule)('bulk', conn => new Bulk(conn));
var _default = Bulk;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJKb2IiLCJFdmVudEVtaXR0ZXIiLCJjb25zdHJ1Y3RvciIsImJ1bGsiLCJ0eXBlIiwib3BlcmF0aW9uIiwib3B0aW9ucyIsImpvYklkIiwiX2J1bGsiLCJpZCIsInN0YXRlIiwiX2JhdGNoZXMiLCJvbiIsImVycm9yIiwiX2Vycm9yIiwiaW5mbyIsIl9qb2JJbmZvIiwiY2hlY2siLCJvcGVuIiwiRXJyb3IiLCJ0b0xvd2VyQ2FzZSIsImJvZHkiLCJleHRJZEZpZWxkIiwiY29uY3VycmVuY3lNb2RlIiwiYXNzaWdubWVudFJ1bGVJZCIsInJlcyIsIl9yZXF1ZXN0IiwibWV0aG9kIiwicGF0aCIsImhlYWRlcnMiLCJyZXNwb25zZVR5cGUiLCJlbWl0Iiwiam9iSW5mbyIsImVyciIsImNyZWF0ZUJhdGNoIiwiYmF0Y2giLCJCYXRjaCIsImJhdGNoSWQiLCJsb2dnZXIiLCJfbG9nZ2VyIiwicmVhZHkiLCJkZWJ1ZyIsIm9iamVjdCIsInJlc29sdmUiLCJ0aGVuIiwibGlzdCIsImJhdGNoSW5mb0xpc3QiLCJiYXRjaEluZm8iLCJjbG9zZSIsIl9jaGFuZ2VTdGF0ZSIsImFib3J0IiwiUG9sbGluZ1RpbWVvdXRFcnJvciIsIm1lc3NhZ2UiLCJuYW1lIiwiV3JpdGFibGUiLCJqb2IiLCJvYmplY3RNb2RlIiwiZXhlY3V0ZSIsImNvbnZlcnRlck9wdGlvbnMiLCJudWxsVmFsdWUiLCJ1cGxvYWRTdHJlYW0iLCJfdXBsb2FkU3RyZWFtIiwiU2VyaWFsaXphYmxlIiwidXBsb2FkRGF0YVN0cmVhbSIsInN0cmVhbSIsImRvd25sb2FkU3RyZWFtIiwiX2Rvd25sb2FkU3RyZWFtIiwiUGFyc2FibGUiLCJkb3dubG9hZERhdGFTdHJlYW0iLCJlbmQiLCJvbmNlIiwicGlwZSIsIl9jcmVhdGVSZXF1ZXN0U3RyZWFtIiwiX2RhdGFTdHJlYW0iLCJjb25jYXRTdHJlYW1zQXNEdXBsZXgiLCJyZXEiLCJfd3JpdGUiLCJyZWNvcmRfIiwiZW5jIiwiY2IiLCJJZCIsImF0dHJpYnV0ZXMiLCJycmVjIiwicmVjb3JkIiwid3JpdGUiLCJpbnB1dCIsIl9yZXN1bHQiLCJyZWplY3QiLCJpc09iamVjdCIsImlzRnVuY3Rpb24iLCJrZXkiLCJTdHJpbmciLCJvblJlc29sdmVkIiwib25SZWplY3QiLCJwb2xsIiwiaW50ZXJ2YWwiLCJ0aW1lb3V0Iiwic3RhcnRUaW1lIiwiRGF0ZSIsImdldFRpbWUiLCJub3ciLCJudW1iZXJSZWNvcmRzUHJvY2Vzc2VkIiwicmV0cmlldmUiLCJzdGF0ZU1lc3NhZ2UiLCJyZXNwIiwicmVzdWx0cyIsInJlc3VsdElkIiwicmVzdWx0IiwicmV0Iiwic3VjY2VzcyIsIlN1Y2Nlc3MiLCJlcnJvcnMiLCJyZXN1bHRTdHJlYW0iLCJyZXN1bHREYXRhU3RyZWFtIiwiQnVsa0FwaSIsIkh0dHBBcGkiLCJiZWZvcmVTZW5kIiwicmVxdWVzdCIsIl9jb25uIiwiYWNjZXNzVG9rZW4iLCJpc1Nlc3Npb25FeHBpcmVkIiwicmVzcG9uc2UiLCJzdGF0dXNDb2RlIiwidGVzdCIsImhhc0Vycm9ySW5SZXNwb25zZUJvZHkiLCJwYXJzZUVycm9yIiwiZXJyb3JDb2RlIiwiZXhjZXB0aW9uQ29kZSIsImV4Y2VwdGlvbk1lc3NhZ2UiLCJCdWxrIiwiY29ubiIsInJlcXVlc3RfIiwicnJlcSIsImJhc2VVcmwiLCJpbnN0YW5jZVVybCIsInZlcnNpb24iLCJqb2luIiwidXJsIiwibG9hZCIsIm9wdGlvbnNPcklucHV0IiwiY3JlYXRlSm9iIiwiY2xlYW51cCIsImNsZWFudXBPbkVycm9yIiwicG9sbEludGVydmFsIiwicG9sbFRpbWVvdXQiLCJxdWVyeSIsInNvcWwiLCJtIiwicmVwbGFjZSIsIm1hdGNoIiwicmVjb3JkU3RyZWFtIiwiZGF0YVN0cmVhbSIsInN0cmVhbXMiLCJqb2luU3RyZWFtcyIsInJlZ2lzdGVyTW9kdWxlIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FwaS9idWxrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgTWFuYWdlcyBTYWxlc2ZvcmNlIEJ1bGsgQVBJIHJlbGF0ZWQgb3BlcmF0aW9uc1xuICogQGF1dGhvciBTaGluaWNoaSBUb21pdGEgPHNoaW5pY2hpLnRvbWl0YUBnbWFpbC5jb20+XG4gKi9cbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBEdXBsZXgsIFJlYWRhYmxlLCBXcml0YWJsZSB9IGZyb20gJ3N0cmVhbSc7XG5pbXBvcnQgam9pblN0cmVhbXMgZnJvbSAnbXVsdGlzdHJlYW0nO1xuaW1wb3J0IENvbm5lY3Rpb24gZnJvbSAnLi4vY29ubmVjdGlvbic7XG5pbXBvcnQgeyBTZXJpYWxpemFibGUsIFBhcnNhYmxlIH0gZnJvbSAnLi4vcmVjb3JkLXN0cmVhbSc7XG5pbXBvcnQgSHR0cEFwaSBmcm9tICcuLi9odHRwLWFwaSc7XG5pbXBvcnQgeyByZWdpc3Rlck1vZHVsZSB9IGZyb20gJy4uL2pzZm9yY2UnO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnLi4vdXRpbC9sb2dnZXInO1xuaW1wb3J0IHsgY29uY2F0U3RyZWFtc0FzRHVwbGV4IH0gZnJvbSAnLi4vdXRpbC9zdHJlYW0nO1xuaW1wb3J0IHtcbiAgSHR0cE1ldGhvZHMsXG4gIEh0dHBSZXF1ZXN0LFxuICBIdHRwUmVzcG9uc2UsXG4gIFJlY29yZCxcbiAgU2NoZW1hLFxufSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBpc0Z1bmN0aW9uLCBpc09iamVjdCB9IGZyb20gJy4uL3V0aWwvZnVuY3Rpb24nO1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuZXhwb3J0IHR5cGUgQnVsa09wZXJhdGlvbiA9XG4gIHwgJ2luc2VydCdcbiAgfCAndXBkYXRlJ1xuICB8ICd1cHNlcnQnXG4gIHwgJ2RlbGV0ZSdcbiAgfCAnaGFyZERlbGV0ZSdcbiAgfCAncXVlcnknXG4gIHwgJ3F1ZXJ5QWxsJztcblxuZXhwb3J0IHR5cGUgQnVsa09wdGlvbnMgPSB7XG4gIGV4dElkRmllbGQ/OiBzdHJpbmc7XG4gIGNvbmN1cnJlbmN5TW9kZT86ICdTZXJpYWwnIHwgJ1BhcmFsbGVsJztcbiAgYXNzaWdubWVudFJ1bGVJZD86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIEpvYlN0YXRlID0gJ09wZW4nIHwgJ0Nsb3NlZCcgfCAnQWJvcnRlZCcgfCAnRmFpbGVkJyB8ICdVbmtub3duJztcblxuZXhwb3J0IHR5cGUgSm9iSW5mbyA9IHtcbiAgaWQ6IHN0cmluZztcbiAgb2JqZWN0OiBzdHJpbmc7XG4gIG9wZXJhdGlvbjogQnVsa09wZXJhdGlvbjtcbiAgc3RhdGU6IEpvYlN0YXRlO1xufTtcblxudHlwZSBKb2JJbmZvUmVzcG9uc2UgPSB7XG4gIGpvYkluZm86IEpvYkluZm87XG59O1xuXG5leHBvcnQgdHlwZSBCYXRjaFN0YXRlID1cbiAgfCAnUXVldWVkJ1xuICB8ICdJblByb2dyZXNzJ1xuICB8ICdDb21wbGV0ZWQnXG4gIHwgJ0ZhaWxlZCdcbiAgfCAnTm90UHJvY2Vzc2VkJztcblxuZXhwb3J0IHR5cGUgQmF0Y2hJbmZvID0ge1xuICBpZDogc3RyaW5nO1xuICBqb2JJZDogc3RyaW5nO1xuICBzdGF0ZTogQmF0Y2hTdGF0ZTtcbiAgc3RhdGVNZXNzYWdlOiBzdHJpbmc7XG4gIG51bWJlclJlY29yZHNQcm9jZXNzZWQ6IHN0cmluZztcbiAgbnVtYmVyUmVjb3Jkc0ZhaWxlZDogc3RyaW5nO1xuICB0b3RhbFByb2Nlc3NpbmdUaW1lOiBzdHJpbmc7XG59O1xuXG50eXBlIEJhdGNoSW5mb1Jlc3BvbnNlID0ge1xuICBiYXRjaEluZm86IEJhdGNoSW5mbztcbn07XG5cbnR5cGUgQmF0Y2hJbmZvTGlzdFJlc3BvbnNlID0ge1xuICBiYXRjaEluZm9MaXN0OiB7XG4gICAgYmF0Y2hJbmZvOiBCYXRjaEluZm8gfCBCYXRjaEluZm9bXTtcbiAgfTtcbn07XG5cbmV4cG9ydCB0eXBlIEJ1bGtRdWVyeUJhdGNoUmVzdWx0ID0gQXJyYXk8e1xuICBpZDogc3RyaW5nO1xuICBiYXRjaElkOiBzdHJpbmc7XG4gIGpvYklkOiBzdHJpbmc7XG59PjtcblxuZXhwb3J0IHR5cGUgQnVsa0luZ2VzdEJhdGNoUmVzdWx0ID0gQXJyYXk8e1xuICBpZDogc3RyaW5nIHwgbnVsbDtcbiAgc3VjY2VzczogYm9vbGVhbjtcbiAgZXJyb3JzOiBzdHJpbmdbXTtcbn0+O1xuXG5leHBvcnQgdHlwZSBCYXRjaFJlc3VsdDxPcHIgZXh0ZW5kcyBCdWxrT3BlcmF0aW9uPiA9IE9wciBleHRlbmRzXG4gIHwgJ3F1ZXJ5J1xuICB8ICdxdWVyeUFsbCdcbiAgPyBCdWxrUXVlcnlCYXRjaFJlc3VsdFxuICA6IEJ1bGtJbmdlc3RCYXRjaFJlc3VsdDtcblxudHlwZSBCdWxrSW5nZXN0UmVzdWx0UmVzcG9uc2UgPSBBcnJheTx7XG4gIElkOiBzdHJpbmc7XG4gIFN1Y2Nlc3M6IHN0cmluZztcbiAgRXJyb3I6IHN0cmluZztcbn0+O1xuXG50eXBlIEJ1bGtRdWVyeVJlc3VsdFJlc3BvbnNlID0ge1xuICAncmVzdWx0LWxpc3QnOiB7XG4gICAgcmVzdWx0OiBzdHJpbmcgfCBzdHJpbmdbXTtcbiAgfTtcbn07XG5cbnR5cGUgQnVsa1JlcXVlc3QgPSB7XG4gIG1ldGhvZDogSHR0cE1ldGhvZHM7XG4gIHBhdGg6IHN0cmluZztcbiAgYm9keT86IHN0cmluZztcbiAgaGVhZGVycz86IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9O1xuICByZXNwb25zZVR5cGU/OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIENsYXNzIGZvciBCdWxrIEFQSSBKb2JcbiAqL1xuZXhwb3J0IGNsYXNzIEpvYjxcbiAgUyBleHRlbmRzIFNjaGVtYSxcbiAgT3ByIGV4dGVuZHMgQnVsa09wZXJhdGlvblxuPiBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIHR5cGU6IHN0cmluZyB8IG51bGw7XG4gIG9wZXJhdGlvbjogT3ByIHwgbnVsbDtcbiAgb3B0aW9uczogQnVsa09wdGlvbnM7XG4gIGlkOiBzdHJpbmcgfCBudWxsO1xuICBzdGF0ZTogSm9iU3RhdGU7XG4gIF9idWxrOiBCdWxrPFM+O1xuICBfYmF0Y2hlczogeyBbaWQ6IHN0cmluZ106IEJhdGNoPFMsIE9wcj4gfTtcbiAgX2pvYkluZm86IFByb21pc2U8Sm9iSW5mbz4gfCB1bmRlZmluZWQ7XG4gIF9lcnJvcjogRXJyb3IgfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBidWxrOiBCdWxrPFM+LFxuICAgIHR5cGU6IHN0cmluZyB8IG51bGwsXG4gICAgb3BlcmF0aW9uOiBPcHIgfCBudWxsLFxuICAgIG9wdGlvbnM6IEJ1bGtPcHRpb25zIHwgbnVsbCxcbiAgICBqb2JJZD86IHN0cmluZyxcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9idWxrID0gYnVsaztcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMub3BlcmF0aW9uID0gb3BlcmF0aW9uO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5pZCA9IGpvYklkID8/IG51bGw7XG4gICAgdGhpcy5zdGF0ZSA9IHRoaXMuaWQgPyAnT3BlbicgOiAnVW5rbm93bic7XG4gICAgdGhpcy5fYmF0Y2hlcyA9IHt9O1xuICAgIC8vIGRlZmF1bHQgZXJyb3IgaGFuZGxlciB0byBrZWVwIHRoZSBsYXRlc3QgZXJyb3JcbiAgICB0aGlzLm9uKCdlcnJvcicsIChlcnJvcikgPT4gKHRoaXMuX2Vycm9yID0gZXJyb3IpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gbGF0ZXN0IGpvYkluZm8gZnJvbSBjYWNoZVxuICAgKi9cbiAgaW5mbygpIHtcbiAgICAvLyBpZiBjYWNoZSBpcyBub3QgYXZhaWxhYmxlLCBjaGVjayB0aGUgbGF0ZXN0XG4gICAgaWYgKCF0aGlzLl9qb2JJbmZvKSB7XG4gICAgICB0aGlzLl9qb2JJbmZvID0gdGhpcy5jaGVjaygpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fam9iSW5mbztcbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVuIG5ldyBqb2IgYW5kIGdldCBqb2JpbmZvXG4gICAqL1xuICBvcGVuKCk6IFByb21pc2U8Sm9iSW5mbz4ge1xuICAgIGNvbnN0IGJ1bGsgPSB0aGlzLl9idWxrO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAvLyBpZiBzb2JqZWN0IHR5cGUgLyBvcGVyYXRpb24gaXMgbm90IHByb3ZpZGVkXG4gICAgaWYgKCF0aGlzLnR5cGUgfHwgIXRoaXMub3BlcmF0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3R5cGUgLyBvcGVyYXRpb24gaXMgcmVxdWlyZWQgdG8gb3BlbiBhIG5ldyBqb2InKTtcbiAgICB9XG5cbiAgICAvLyBpZiBub3QgcmVxdWVzdGVkIG9wZW5pbmcgam9iXG4gICAgaWYgKCF0aGlzLl9qb2JJbmZvKSB7XG4gICAgICBsZXQgb3BlcmF0aW9uID0gdGhpcy5vcGVyYXRpb24udG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmIChvcGVyYXRpb24gPT09ICdoYXJkZGVsZXRlJykge1xuICAgICAgICBvcGVyYXRpb24gPSAnaGFyZERlbGV0ZSc7XG4gICAgICB9XG4gICAgICBpZiAob3BlcmF0aW9uID09PSAncXVlcnlhbGwnKSB7XG4gICAgICAgIG9wZXJhdGlvbiA9ICdxdWVyeUFsbCc7XG4gICAgICB9XG4gICAgICBjb25zdCBib2R5ID0gYFxuPD94bWwgdmVyc2lvbj1cIjEuMFwiIGVuY29kaW5nPVwiVVRGLThcIj8+XG48am9iSW5mbyAgeG1sbnM9XCJodHRwOi8vd3d3LmZvcmNlLmNvbS8yMDA5LzA2L2FzeW5jYXBpL2RhdGFsb2FkXCI+XG4gIDxvcGVyYXRpb24+JHtvcGVyYXRpb259PC9vcGVyYXRpb24+XG4gIDxvYmplY3Q+JHt0aGlzLnR5cGV9PC9vYmplY3Q+XG4gICR7XG4gICAgb3B0aW9ucy5leHRJZEZpZWxkXG4gICAgICA/IGA8ZXh0ZXJuYWxJZEZpZWxkTmFtZT4ke29wdGlvbnMuZXh0SWRGaWVsZH08L2V4dGVybmFsSWRGaWVsZE5hbWU+YFxuICAgICAgOiAnJ1xuICB9XG4gICR7XG4gICAgb3B0aW9ucy5jb25jdXJyZW5jeU1vZGVcbiAgICAgID8gYDxjb25jdXJyZW5jeU1vZGU+JHtvcHRpb25zLmNvbmN1cnJlbmN5TW9kZX08L2NvbmN1cnJlbmN5TW9kZT5gXG4gICAgICA6ICcnXG4gIH1cbiAgJHtcbiAgICBvcHRpb25zLmFzc2lnbm1lbnRSdWxlSWRcbiAgICAgID8gYDxhc3NpZ25tZW50UnVsZUlkPiR7b3B0aW9ucy5hc3NpZ25tZW50UnVsZUlkfTwvYXNzaWdubWVudFJ1bGVJZD5gXG4gICAgICA6ICcnXG4gIH1cbiAgPGNvbnRlbnRUeXBlPkNTVjwvY29udGVudFR5cGU+XG48L2pvYkluZm8+XG4gICAgICBgLnRyaW0oKTtcblxuICAgICAgdGhpcy5fam9iSW5mbyA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgYnVsay5fcmVxdWVzdDxKb2JJbmZvUmVzcG9uc2U+KHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgcGF0aDogJy9qb2InLFxuICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94bWw7IGNoYXJzZXQ9dXRmLTgnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3BvbnNlVHlwZTogJ2FwcGxpY2F0aW9uL3htbCcsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5lbWl0KCdvcGVuJywgcmVzLmpvYkluZm8pO1xuICAgICAgICAgIHRoaXMuaWQgPSByZXMuam9iSW5mby5pZDtcbiAgICAgICAgICB0aGlzLnN0YXRlID0gcmVzLmpvYkluZm8uc3RhdGU7XG4gICAgICAgICAgcmV0dXJuIHJlcy5qb2JJbmZvO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgIH0pKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9qb2JJbmZvO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBiYXRjaCBpbnN0YW5jZSBpbiB0aGUgam9iXG4gICAqL1xuICBjcmVhdGVCYXRjaCgpOiBCYXRjaDxTLCBPcHI+IHtcbiAgICBjb25zdCBiYXRjaCA9IG5ldyBCYXRjaCh0aGlzKTtcbiAgICBiYXRjaC5vbigncXVldWUnLCAoKSA9PiB7XG4gICAgICB0aGlzLl9iYXRjaGVzW2JhdGNoLmlkIV0gPSBiYXRjaDtcbiAgICB9KTtcbiAgICByZXR1cm4gYmF0Y2g7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgYmF0Y2ggaW5zdGFuY2Ugc3BlY2lmaWVkIGJ5IGdpdmVuIGJhdGNoIElEXG4gICAqL1xuICBiYXRjaChiYXRjaElkOiBzdHJpbmcpOiBCYXRjaDxTLCBPcHI+IHtcbiAgICBsZXQgYmF0Y2ggPSB0aGlzLl9iYXRjaGVzW2JhdGNoSWRdO1xuICAgIGlmICghYmF0Y2gpIHtcbiAgICAgIGJhdGNoID0gbmV3IEJhdGNoKHRoaXMsIGJhdGNoSWQpO1xuICAgICAgdGhpcy5fYmF0Y2hlc1tiYXRjaElkXSA9IGJhdGNoO1xuICAgIH1cbiAgICByZXR1cm4gYmF0Y2g7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgdGhlIGxhdGVzdCBqb2Igc3RhdHVzIGZyb20gc2VydmVyXG4gICAqL1xuICBjaGVjaygpIHtcbiAgICBjb25zdCBidWxrID0gdGhpcy5fYnVsaztcbiAgICBjb25zdCBsb2dnZXIgPSBidWxrLl9sb2dnZXI7XG5cbiAgICB0aGlzLl9qb2JJbmZvID0gKGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGpvYklkID0gYXdhaXQgdGhpcy5yZWFkeSgpO1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgYnVsay5fcmVxdWVzdDxKb2JJbmZvUmVzcG9uc2U+KHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgcGF0aDogJy9qb2IvJyArIGpvYklkLFxuICAgICAgICByZXNwb25zZVR5cGU6ICdhcHBsaWNhdGlvbi94bWwnLFxuICAgICAgfSk7XG4gICAgICBsb2dnZXIuZGVidWcocmVzLmpvYkluZm8pO1xuICAgICAgdGhpcy5pZCA9IHJlcy5qb2JJbmZvLmlkO1xuICAgICAgdGhpcy50eXBlID0gcmVzLmpvYkluZm8ub2JqZWN0O1xuICAgICAgdGhpcy5vcGVyYXRpb24gPSByZXMuam9iSW5mby5vcGVyYXRpb24gYXMgT3ByO1xuICAgICAgdGhpcy5zdGF0ZSA9IHJlcy5qb2JJbmZvLnN0YXRlO1xuICAgICAgcmV0dXJuIHJlcy5qb2JJbmZvO1xuICAgIH0pKCk7XG5cbiAgICByZXR1cm4gdGhpcy5fam9iSW5mbztcbiAgfVxuXG4gIC8qKlxuICAgKiBXYWl0IHRpbGwgdGhlIGpvYiBpcyBhc3NpZ25lZCB0byBzZXJ2ZXJcbiAgICovXG4gIHJlYWR5KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuaWRcbiAgICAgID8gUHJvbWlzZS5yZXNvbHZlKHRoaXMuaWQpXG4gICAgICA6IHRoaXMub3BlbigpLnRoZW4oKHsgaWQgfSkgPT4gaWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIExpc3QgYWxsIHJlZ2lzdGVyZWQgYmF0Y2ggaW5mbyBpbiBqb2JcbiAgICovXG4gIGFzeW5jIGxpc3QoKSB7XG4gICAgY29uc3QgYnVsayA9IHRoaXMuX2J1bGs7XG4gICAgY29uc3QgbG9nZ2VyID0gYnVsay5fbG9nZ2VyO1xuICAgIGNvbnN0IGpvYklkID0gYXdhaXQgdGhpcy5yZWFkeSgpO1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGJ1bGsuX3JlcXVlc3Q8QmF0Y2hJbmZvTGlzdFJlc3BvbnNlPih7XG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgcGF0aDogJy9qb2IvJyArIGpvYklkICsgJy9iYXRjaCcsXG4gICAgICByZXNwb25zZVR5cGU6ICdhcHBsaWNhdGlvbi94bWwnLFxuICAgIH0pO1xuICAgIGxvZ2dlci5kZWJ1ZyhyZXMuYmF0Y2hJbmZvTGlzdC5iYXRjaEluZm8pO1xuICAgIGNvbnN0IGJhdGNoSW5mb0xpc3QgPSBBcnJheS5pc0FycmF5KHJlcy5iYXRjaEluZm9MaXN0LmJhdGNoSW5mbylcbiAgICAgID8gcmVzLmJhdGNoSW5mb0xpc3QuYmF0Y2hJbmZvXG4gICAgICA6IFtyZXMuYmF0Y2hJbmZvTGlzdC5iYXRjaEluZm9dO1xuICAgIHJldHVybiBiYXRjaEluZm9MaXN0O1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlIG9wZW5lZCBqb2JcbiAgICovXG4gIGFzeW5jIGNsb3NlKCkge1xuICAgIGlmICghdGhpcy5pZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3Qgam9iSW5mbyA9IGF3YWl0IHRoaXMuX2NoYW5nZVN0YXRlKCdDbG9zZWQnKTtcbiAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgdGhpcy5lbWl0KCdjbG9zZScsIGpvYkluZm8pO1xuICAgICAgcmV0dXJuIGpvYkluZm87XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBzdGF0dXMgdG8gYWJvcnRcbiAgICovXG4gIGFzeW5jIGFib3J0KCkge1xuICAgIGlmICghdGhpcy5pZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3Qgam9iSW5mbyA9IGF3YWl0IHRoaXMuX2NoYW5nZVN0YXRlKCdBYm9ydGVkJyk7XG4gICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgIHRoaXMuZW1pdCgnYWJvcnQnLCBqb2JJbmZvKTtcbiAgICAgIHJldHVybiBqb2JJbmZvO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhc3luYyBfY2hhbmdlU3RhdGUoc3RhdGU6IEpvYlN0YXRlKSB7XG4gICAgY29uc3QgYnVsayA9IHRoaXMuX2J1bGs7XG4gICAgY29uc3QgbG9nZ2VyID0gYnVsay5fbG9nZ2VyO1xuXG4gICAgdGhpcy5fam9iSW5mbyA9IChhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBqb2JJZCA9IGF3YWl0IHRoaXMucmVhZHkoKTtcbiAgICAgIGNvbnN0IGJvZHkgPSBgIFxuPD94bWwgdmVyc2lvbj1cIjEuMFwiIGVuY29kaW5nPVwiVVRGLThcIj8+XG4gIDxqb2JJbmZvIHhtbG5zPVwiaHR0cDovL3d3dy5mb3JjZS5jb20vMjAwOS8wNi9hc3luY2FwaS9kYXRhbG9hZFwiPlxuICA8c3RhdGU+JHtzdGF0ZX08L3N0YXRlPlxuPC9qb2JJbmZvPlxuICAgICAgYC50cmltKCk7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBidWxrLl9yZXF1ZXN0PEpvYkluZm9SZXNwb25zZT4oe1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgcGF0aDogJy9qb2IvJyArIGpvYklkLFxuICAgICAgICBib2R5OiBib2R5LFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94bWw7IGNoYXJzZXQ9dXRmLTgnLFxuICAgICAgICB9LFxuICAgICAgICByZXNwb25zZVR5cGU6ICdhcHBsaWNhdGlvbi94bWwnLFxuICAgICAgfSk7XG4gICAgICBsb2dnZXIuZGVidWcocmVzLmpvYkluZm8pO1xuICAgICAgdGhpcy5zdGF0ZSA9IHJlcy5qb2JJbmZvLnN0YXRlO1xuICAgICAgcmV0dXJuIHJlcy5qb2JJbmZvO1xuICAgIH0pKCk7XG4gICAgcmV0dXJuIHRoaXMuX2pvYkluZm87XG4gIH1cbn1cblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5jbGFzcyBQb2xsaW5nVGltZW91dEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBqb2JJZDogc3RyaW5nO1xuICBiYXRjaElkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIGpvYklkOiBzdHJpbmcsIGJhdGNoSWQ6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9ICdQb2xsaW5nVGltZW91dCc7XG4gICAgdGhpcy5qb2JJZCA9IGpvYklkO1xuICAgIHRoaXMuYmF0Y2hJZCA9IGJhdGNoSWQ7XG4gIH1cbn1cblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKipcbiAqIEJhdGNoIChleHRlbmRzIFdyaXRhYmxlKVxuICovXG5leHBvcnQgY2xhc3MgQmF0Y2g8XG4gIFMgZXh0ZW5kcyBTY2hlbWEsXG4gIE9wciBleHRlbmRzIEJ1bGtPcGVyYXRpb25cbj4gZXh0ZW5kcyBXcml0YWJsZSB7XG4gIGpvYjogSm9iPFMsIE9wcj47XG4gIGlkOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIF9idWxrOiBCdWxrPFM+O1xuICBfdXBsb2FkU3RyZWFtOiBTZXJpYWxpemFibGU7XG4gIF9kb3dubG9hZFN0cmVhbTogUGFyc2FibGU7XG4gIF9kYXRhU3RyZWFtOiBEdXBsZXg7XG4gIF9yZXN1bHQ6IFByb21pc2U8QmF0Y2hSZXN1bHQ8T3ByPj4gfCB1bmRlZmluZWQ7XG4gIF9lcnJvcjogRXJyb3IgfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihqb2I6IEpvYjxTLCBPcHI+LCBpZD86IHN0cmluZykge1xuICAgIHN1cGVyKHsgb2JqZWN0TW9kZTogdHJ1ZSB9KTtcbiAgICB0aGlzLmpvYiA9IGpvYjtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5fYnVsayA9IGpvYi5fYnVsaztcblxuICAgIC8vIGRlZmF1bHQgZXJyb3IgaGFuZGxlciB0byBrZWVwIHRoZSBsYXRlc3QgZXJyb3JcbiAgICB0aGlzLm9uKCdlcnJvcicsIChlcnJvcikgPT4gKHRoaXMuX2Vycm9yID0gZXJyb3IpKTtcblxuICAgIC8vXG4gICAgLy8gc2V0dXAgZGF0YSBzdHJlYW1zXG4gICAgLy9cbiAgICBjb25zdCBjb252ZXJ0ZXJPcHRpb25zID0geyBudWxsVmFsdWU6ICcjTi9BJyB9O1xuICAgIGNvbnN0IHVwbG9hZFN0cmVhbSA9ICh0aGlzLl91cGxvYWRTdHJlYW0gPSBuZXcgU2VyaWFsaXphYmxlKCkpO1xuICAgIGNvbnN0IHVwbG9hZERhdGFTdHJlYW0gPSB1cGxvYWRTdHJlYW0uc3RyZWFtKCdjc3YnLCBjb252ZXJ0ZXJPcHRpb25zKTtcbiAgICBjb25zdCBkb3dubG9hZFN0cmVhbSA9ICh0aGlzLl9kb3dubG9hZFN0cmVhbSA9IG5ldyBQYXJzYWJsZSgpKTtcbiAgICBjb25zdCBkb3dubG9hZERhdGFTdHJlYW0gPSBkb3dubG9hZFN0cmVhbS5zdHJlYW0oJ2NzdicsIGNvbnZlcnRlck9wdGlvbnMpO1xuXG4gICAgdGhpcy5vbignZmluaXNoJywgKCkgPT4gdXBsb2FkU3RyZWFtLmVuZCgpKTtcbiAgICB1cGxvYWREYXRhU3RyZWFtLm9uY2UoJ3JlYWRhYmxlJywgYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gZW5zdXJlIHRoZSBqb2IgaXMgb3BlbmVkIGluIHNlcnZlciBvciBqb2IgaWQgaXMgYWxyZWFkeSBhc3NpZ25lZFxuICAgICAgICBhd2FpdCB0aGlzLmpvYi5yZWFkeSgpO1xuICAgICAgICAvLyBwaXBlIHVwbG9hZCBkYXRhIHRvIGJhdGNoIEFQSSByZXF1ZXN0IHN0cmVhbVxuICAgICAgICB1cGxvYWREYXRhU3RyZWFtLnBpcGUodGhpcy5fY3JlYXRlUmVxdWVzdFN0cmVhbSgpKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGR1cGxleCBkYXRhIHN0cmVhbSwgb3BlbmVkIGFjY2VzcyB0byBBUEkgcHJvZ3JhbW1lcnMgYnkgQmF0Y2gjc3RyZWFtKClcbiAgICB0aGlzLl9kYXRhU3RyZWFtID0gY29uY2F0U3RyZWFtc0FzRHVwbGV4KFxuICAgICAgdXBsb2FkRGF0YVN0cmVhbSxcbiAgICAgIGRvd25sb2FkRGF0YVN0cmVhbSxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbm5lY3QgYmF0Y2ggQVBJIGFuZCBjcmVhdGUgc3RyZWFtIGluc3RhbmNlIG9mIHJlcXVlc3QvcmVzcG9uc2VcbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9jcmVhdGVSZXF1ZXN0U3RyZWFtKCkge1xuICAgIGNvbnN0IGJ1bGsgPSB0aGlzLl9idWxrO1xuICAgIGNvbnN0IGxvZ2dlciA9IGJ1bGsuX2xvZ2dlcjtcbiAgICBjb25zdCByZXEgPSBidWxrLl9yZXF1ZXN0PEJhdGNoSW5mb1Jlc3BvbnNlPih7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHBhdGg6ICcvam9iLycgKyB0aGlzLmpvYi5pZCArICcvYmF0Y2gnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ3RleHQvY3N2JyxcbiAgICAgIH0sXG4gICAgICByZXNwb25zZVR5cGU6ICdhcHBsaWNhdGlvbi94bWwnLFxuICAgIH0pO1xuICAgIChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCByZXE7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhyZXMuYmF0Y2hJbmZvKTtcbiAgICAgICAgdGhpcy5pZCA9IHJlcy5iYXRjaEluZm8uaWQ7XG4gICAgICAgIHRoaXMuZW1pdCgncXVldWUnLCByZXMuYmF0Y2hJbmZvKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgIH1cbiAgICB9KSgpO1xuICAgIHJldHVybiByZXEuc3RyZWFtKCk7XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50YXRpb24gb2YgV3JpdGFibGVcbiAgICovXG4gIF93cml0ZShyZWNvcmRfOiBSZWNvcmQsIGVuYzogc3RyaW5nLCBjYjogKCkgPT4gdm9pZCkge1xuICAgIGNvbnN0IHsgSWQsIHR5cGUsIGF0dHJpYnV0ZXMsIC4uLnJyZWMgfSA9IHJlY29yZF87XG4gICAgbGV0IHJlY29yZDtcbiAgICBzd2l0Y2ggKHRoaXMuam9iLm9wZXJhdGlvbikge1xuICAgICAgY2FzZSAnaW5zZXJ0JzpcbiAgICAgICAgcmVjb3JkID0gcnJlYztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkZWxldGUnOlxuICAgICAgY2FzZSAnaGFyZERlbGV0ZSc6XG4gICAgICAgIHJlY29yZCA9IHsgSWQgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZWNvcmQgPSB7IElkLCAuLi5ycmVjIH07XG4gICAgfVxuICAgIHRoaXMuX3VwbG9hZFN0cmVhbS53cml0ZShyZWNvcmQsIGVuYywgY2IpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgZHVwbGV4IHN0cmVhbSB3aGljaCBhY2NlcHRzIENTViBkYXRhIGlucHV0IGFuZCBiYXRjaCByZXN1bHQgb3V0cHV0XG4gICAqL1xuICBzdHJlYW0oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGFTdHJlYW07XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZSBiYXRjaCBvcGVyYXRpb25cbiAgICovXG4gIGV4ZWN1dGUoaW5wdXQ/OiBzdHJpbmcgfCBSZWNvcmRbXSB8IFJlYWRhYmxlKSB7XG4gICAgLy8gaWYgYmF0Y2ggaXMgYWxyZWFkeSBleGVjdXRlZFxuICAgIGlmICh0aGlzLl9yZXN1bHQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQmF0Y2ggYWxyZWFkeSBleGVjdXRlZC4nKTtcbiAgICB9XG5cbiAgICB0aGlzLl9yZXN1bHQgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLm9uY2UoJ3Jlc3BvbnNlJywgcmVzb2x2ZSk7XG4gICAgICB0aGlzLm9uY2UoJ2Vycm9yJywgcmVqZWN0KTtcbiAgICB9KTtcblxuICAgIGlmIChpc09iamVjdChpbnB1dCkgJiYgJ3BpcGUnIGluIGlucHV0ICYmIGlzRnVuY3Rpb24oaW5wdXQucGlwZSkpIHtcbiAgICAgIC8vIGlmIGlucHV0IGhhcyBzdHJlYW0uUmVhZGFibGUgaW50ZXJmYWNlXG4gICAgICBpbnB1dC5waXBlKHRoaXMuX2RhdGFTdHJlYW0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShpbnB1dCkpIHtcbiAgICAgICAgZm9yIChjb25zdCByZWNvcmQgb2YgaW5wdXQpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhyZWNvcmQpKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlY29yZFtrZXldID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgICAgcmVjb3JkW2tleV0gPSBTdHJpbmcocmVjb3JkW2tleV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLndyaXRlKHJlY29yZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbmQoKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9kYXRhU3RyZWFtLndyaXRlKGlucHV0LCAndXRmOCcpO1xuICAgICAgICB0aGlzLl9kYXRhU3RyZWFtLmVuZCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJldHVybiBCYXRjaCBpbnN0YW5jZSBmb3IgY2hhaW5pbmdcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJ1biA9IHRoaXMuZXhlY3V0ZTtcblxuICBleGVjID0gdGhpcy5leGVjdXRlO1xuXG4gIC8qKlxuICAgKiBQcm9taXNlL0ErIGludGVyZmFjZVxuICAgKiBEZWxlZ2F0ZSB0byBwcm9taXNlLCByZXR1cm4gcHJvbWlzZSBpbnN0YW5jZSBmb3IgYmF0Y2ggcmVzdWx0XG4gICAqL1xuICB0aGVuKFxuICAgIG9uUmVzb2x2ZWQ6IChyZXM6IEJhdGNoUmVzdWx0PE9wcj4pID0+IHZvaWQsXG4gICAgb25SZWplY3Q6IChlcnI6IGFueSkgPT4gdm9pZCxcbiAgKSB7XG4gICAgaWYgKCF0aGlzLl9yZXN1bHQpIHtcbiAgICAgIHRoaXMuZXhlY3V0ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcmVzdWx0IS50aGVuKG9uUmVzb2x2ZWQsIG9uUmVqZWN0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB0aGUgbGF0ZXN0IGJhdGNoIHN0YXR1cyBpbiBzZXJ2ZXJcbiAgICovXG4gIGFzeW5jIGNoZWNrKCkge1xuICAgIGNvbnN0IGJ1bGsgPSB0aGlzLl9idWxrO1xuICAgIGNvbnN0IGxvZ2dlciA9IGJ1bGsuX2xvZ2dlcjtcbiAgICBjb25zdCBqb2JJZCA9IHRoaXMuam9iLmlkO1xuICAgIGNvbnN0IGJhdGNoSWQgPSB0aGlzLmlkO1xuXG4gICAgaWYgKCFqb2JJZCB8fCAhYmF0Y2hJZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdCYXRjaCBub3Qgc3RhcnRlZC4nKTtcbiAgICB9XG4gICAgY29uc3QgcmVzID0gYXdhaXQgYnVsay5fcmVxdWVzdDxCYXRjaEluZm9SZXNwb25zZT4oe1xuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIHBhdGg6ICcvam9iLycgKyBqb2JJZCArICcvYmF0Y2gvJyArIGJhdGNoSWQsXG4gICAgICByZXNwb25zZVR5cGU6ICdhcHBsaWNhdGlvbi94bWwnLFxuICAgIH0pO1xuICAgIGxvZ2dlci5kZWJ1ZyhyZXMuYmF0Y2hJbmZvKTtcbiAgICByZXR1cm4gcmVzLmJhdGNoSW5mbztcbiAgfVxuXG4gIC8qKlxuICAgKiBQb2xsaW5nIHRoZSBiYXRjaCByZXN1bHQgYW5kIHJldHJpZXZlXG4gICAqL1xuICBwb2xsKGludGVydmFsOiBudW1iZXIsIHRpbWVvdXQ6IG51bWJlcikge1xuICAgIGNvbnN0IGpvYklkID0gdGhpcy5qb2IuaWQ7XG4gICAgY29uc3QgYmF0Y2hJZCA9IHRoaXMuaWQ7XG5cbiAgICBpZiAoIWpvYklkIHx8ICFiYXRjaElkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JhdGNoIG5vdCBzdGFydGVkLicpO1xuICAgIH1cbiAgICBjb25zdCBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICBjb25zdCBwb2xsID0gYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICBpZiAoc3RhcnRUaW1lICsgdGltZW91dCA8IG5vdykge1xuICAgICAgICBjb25zdCBlcnIgPSBuZXcgUG9sbGluZ1RpbWVvdXRFcnJvcihcbiAgICAgICAgICAnUG9sbGluZyB0aW1lIG91dC4gSm9iIElkID0gJyArIGpvYklkICsgJyAsIGJhdGNoIElkID0gJyArIGJhdGNoSWQsXG4gICAgICAgICAgam9iSWQsXG4gICAgICAgICAgYmF0Y2hJZCxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxldCByZXM7XG4gICAgICB0cnkge1xuICAgICAgICByZXMgPSBhd2FpdCB0aGlzLmNoZWNrKCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChyZXMuc3RhdGUgPT09ICdGYWlsZWQnKSB7XG4gICAgICAgIGlmIChwYXJzZUludChyZXMubnVtYmVyUmVjb3Jkc1Byb2Nlc3NlZCwgMTApID4gMCkge1xuICAgICAgICAgIHRoaXMucmV0cmlldmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKHJlcy5zdGF0ZU1lc3NhZ2UpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChyZXMuc3RhdGUgPT09ICdDb21wbGV0ZWQnKSB7XG4gICAgICAgIHRoaXMucmV0cmlldmUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZW1pdCgncHJvZ3Jlc3MnLCByZXMpO1xuICAgICAgICBzZXRUaW1lb3V0KHBvbGwsIGludGVydmFsKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHNldFRpbWVvdXQocG9sbCwgaW50ZXJ2YWwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIGJhdGNoIHJlc3VsdFxuICAgKi9cbiAgYXN5bmMgcmV0cmlldmUoKSB7XG4gICAgY29uc3QgYnVsayA9IHRoaXMuX2J1bGs7XG4gICAgY29uc3Qgam9iSWQgPSB0aGlzLmpvYi5pZDtcbiAgICBjb25zdCBqb2IgPSB0aGlzLmpvYjtcbiAgICBjb25zdCBiYXRjaElkID0gdGhpcy5pZDtcblxuICAgIGlmICgham9iSWQgfHwgIWJhdGNoSWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQmF0Y2ggbm90IHN0YXJ0ZWQuJyk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBidWxrLl9yZXF1ZXN0PFxuICAgICAgICBCdWxrSW5nZXN0UmVzdWx0UmVzcG9uc2UgfCBCdWxrUXVlcnlSZXN1bHRSZXNwb25zZVxuICAgICAgPih7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHBhdGg6ICcvam9iLycgKyBqb2JJZCArICcvYmF0Y2gvJyArIGJhdGNoSWQgKyAnL3Jlc3VsdCcsXG4gICAgICB9KTtcbiAgICAgIGxldCByZXN1bHRzOiBCdWxrSW5nZXN0QmF0Y2hSZXN1bHQgfCBCdWxrUXVlcnlCYXRjaFJlc3VsdDtcbiAgICAgIGlmIChqb2Iub3BlcmF0aW9uID09PSAncXVlcnknIHx8IGpvYi5vcGVyYXRpb24gPT09ICdxdWVyeUFsbCcpIHtcbiAgICAgICAgY29uc3QgcmVzID0gcmVzcCBhcyBCdWxrUXVlcnlSZXN1bHRSZXNwb25zZTtcbiAgICAgICAgbGV0IHJlc3VsdElkID0gcmVzWydyZXN1bHQtbGlzdCddLnJlc3VsdDtcbiAgICAgICAgcmVzdWx0cyA9IChBcnJheS5pc0FycmF5KHJlc3VsdElkKVxuICAgICAgICAgID8gcmVzdWx0SWRcbiAgICAgICAgICA6IFtyZXN1bHRJZF1cbiAgICAgICAgKS5tYXAoKGlkKSA9PiAoeyBpZCwgYmF0Y2hJZCwgam9iSWQgfSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmVzID0gcmVzcCBhcyBCdWxrSW5nZXN0UmVzdWx0UmVzcG9uc2U7XG4gICAgICAgIHJlc3VsdHMgPSByZXMubWFwKChyZXQpID0+ICh7XG4gICAgICAgICAgaWQ6IHJldC5JZCB8fCBudWxsLFxuICAgICAgICAgIHN1Y2Nlc3M6IHJldC5TdWNjZXNzID09PSAndHJ1ZScsXG4gICAgICAgICAgZXJyb3JzOiByZXQuRXJyb3IgPyBbcmV0LkVycm9yXSA6IFtdLFxuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgICB0aGlzLmVtaXQoJ3Jlc3BvbnNlJywgcmVzdWx0cyk7XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCBxdWVyeSByZXN1bHQgYXMgYSByZWNvcmQgc3RyZWFtXG4gICAqIEBwYXJhbSB7U3RyaW5nfSByZXN1bHRJZCAtIFJlc3VsdCBpZFxuICAgKiBAcmV0dXJucyB7UmVjb3JkU3RyZWFtfSAtIFJlY29yZCBzdHJlYW0sIGNvbnZlcnRpYmxlIHRvIENTViBkYXRhIHN0cmVhbVxuICAgKi9cbiAgcmVzdWx0KHJlc3VsdElkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBqb2JJZCA9IHRoaXMuam9iLmlkO1xuICAgIGNvbnN0IGJhdGNoSWQgPSB0aGlzLmlkO1xuICAgIGlmICgham9iSWQgfHwgIWJhdGNoSWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQmF0Y2ggbm90IHN0YXJ0ZWQuJyk7XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdFN0cmVhbSA9IG5ldyBQYXJzYWJsZSgpO1xuICAgIGNvbnN0IHJlc3VsdERhdGFTdHJlYW0gPSByZXN1bHRTdHJlYW0uc3RyZWFtKCdjc3YnKTtcbiAgICB0aGlzLl9idWxrXG4gICAgICAuX3JlcXVlc3Qoe1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBwYXRoOiAnL2pvYi8nICsgam9iSWQgKyAnL2JhdGNoLycgKyBiYXRjaElkICsgJy9yZXN1bHQvJyArIHJlc3VsdElkLFxuICAgICAgICByZXNwb25zZVR5cGU6ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nLFxuICAgICAgfSlcbiAgICAgIC5zdHJlYW0oKVxuICAgICAgLnBpcGUocmVzdWx0RGF0YVN0cmVhbSk7XG4gICAgcmV0dXJuIHJlc3VsdFN0cmVhbTtcbiAgfVxufVxuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qKlxuICpcbiAqL1xuY2xhc3MgQnVsa0FwaTxTIGV4dGVuZHMgU2NoZW1hPiBleHRlbmRzIEh0dHBBcGk8Uz4ge1xuICBiZWZvcmVTZW5kKHJlcXVlc3Q6IEh0dHBSZXF1ZXN0KSB7XG4gICAgcmVxdWVzdC5oZWFkZXJzID0ge1xuICAgICAgLi4ucmVxdWVzdC5oZWFkZXJzLFxuICAgICAgJ1gtU0ZEQy1TRVNTSU9OJzogdGhpcy5fY29ubi5hY2Nlc3NUb2tlbiA/PyAnJyxcbiAgICB9O1xuICB9XG5cbiAgaXNTZXNzaW9uRXhwaXJlZChyZXNwb25zZTogSHR0cFJlc3BvbnNlKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDQwMCAmJlxuICAgICAgLzxleGNlcHRpb25Db2RlPkludmFsaWRTZXNzaW9uSWQ8XFwvZXhjZXB0aW9uQ29kZT4vLnRlc3QocmVzcG9uc2UuYm9keSlcbiAgICApO1xuICB9XG5cbiAgaGFzRXJyb3JJblJlc3BvbnNlQm9keShib2R5OiBhbnkpIHtcbiAgICByZXR1cm4gISFib2R5LmVycm9yO1xuICB9XG5cbiAgcGFyc2VFcnJvcihib2R5OiBhbnkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZXJyb3JDb2RlOiBib2R5LmVycm9yLmV4Y2VwdGlvbkNvZGUsXG4gICAgICBtZXNzYWdlOiBib2R5LmVycm9yLmV4Y2VwdGlvbk1lc3NhZ2UsXG4gICAgfTtcbiAgfVxufVxuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuLyoqXG4gKiBDbGFzcyBmb3IgQnVsayBBUElcbiAqXG4gKiBAY2xhc3NcbiAqL1xuZXhwb3J0IGNsYXNzIEJ1bGs8UyBleHRlbmRzIFNjaGVtYT4ge1xuICBfY29ubjogQ29ubmVjdGlvbjxTPjtcbiAgX2xvZ2dlcjogTG9nZ2VyO1xuXG4gIC8qKlxuICAgKiBQb2xsaW5nIGludGVydmFsIGluIG1pbGxpc2Vjb25kc1xuICAgKi9cbiAgcG9sbEludGVydmFsID0gMTAwMDtcblxuICAvKipcbiAgICogUG9sbGluZyB0aW1lb3V0IGluIG1pbGxpc2Vjb25kc1xuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgcG9sbFRpbWVvdXQgPSAxMDAwMDtcblxuICAvKipcbiAgICpcbiAgICovXG4gIGNvbnN0cnVjdG9yKGNvbm46IENvbm5lY3Rpb248Uz4pIHtcbiAgICB0aGlzLl9jb25uID0gY29ubjtcbiAgICB0aGlzLl9sb2dnZXIgPSBjb25uLl9sb2dnZXI7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICovXG4gIF9yZXF1ZXN0PFQ+KHJlcXVlc3RfOiBCdWxrUmVxdWVzdCkge1xuICAgIGNvbnN0IGNvbm4gPSB0aGlzLl9jb25uO1xuICAgIGNvbnN0IHsgcGF0aCwgcmVzcG9uc2VUeXBlLCAuLi5ycmVxIH0gPSByZXF1ZXN0XztcbiAgICBjb25zdCBiYXNlVXJsID0gW2Nvbm4uaW5zdGFuY2VVcmwsICdzZXJ2aWNlcy9hc3luYycsIGNvbm4udmVyc2lvbl0uam9pbihcbiAgICAgICcvJyxcbiAgICApO1xuICAgIGNvbnN0IHJlcXVlc3QgPSB7XG4gICAgICAuLi5ycmVxLFxuICAgICAgdXJsOiBiYXNlVXJsICsgcGF0aCxcbiAgICB9O1xuICAgIHJldHVybiBuZXcgQnVsa0FwaSh0aGlzLl9jb25uLCB7IHJlc3BvbnNlVHlwZSB9KS5yZXF1ZXN0PFQ+KHJlcXVlc3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbmQgc3RhcnQgYnVsa2xvYWQgam9iIGFuZCBiYXRjaFxuICAgKi9cbiAgbG9hZDxPcHIgZXh0ZW5kcyBCdWxrT3BlcmF0aW9uPihcbiAgICB0eXBlOiBzdHJpbmcsXG4gICAgb3BlcmF0aW9uOiBPcHIsXG4gICAgaW5wdXQ/OiBSZWNvcmRbXSB8IFJlYWRhYmxlIHwgc3RyaW5nLFxuICApOiBCYXRjaDxTLCBPcHI+O1xuICBsb2FkPE9wciBleHRlbmRzIEJ1bGtPcGVyYXRpb24+KFxuICAgIHR5cGU6IHN0cmluZyxcbiAgICBvcGVyYXRpb246IE9wcixcbiAgICBvcHRpb25zT3JJbnB1dD86IEJ1bGtPcHRpb25zIHwgUmVjb3JkW10gfCBSZWFkYWJsZSB8IHN0cmluZyxcbiAgICBpbnB1dD86IFJlY29yZFtdIHwgUmVhZGFibGUgfCBzdHJpbmcsXG4gICk6IEJhdGNoPFMsIE9wcj47XG4gIGxvYWQ8T3ByIGV4dGVuZHMgQnVsa09wZXJhdGlvbj4oXG4gICAgdHlwZTogc3RyaW5nLFxuICAgIG9wZXJhdGlvbjogT3ByLFxuICAgIG9wdGlvbnNPcklucHV0PzogQnVsa09wdGlvbnMgfCBSZWNvcmRbXSB8IFJlYWRhYmxlIHwgc3RyaW5nLFxuICAgIGlucHV0PzogUmVjb3JkW10gfCBSZWFkYWJsZSB8IHN0cmluZyxcbiAgKSB7XG4gICAgbGV0IG9wdGlvbnM6IEJ1bGtPcHRpb25zID0ge307XG4gICAgaWYgKFxuICAgICAgdHlwZW9mIG9wdGlvbnNPcklucHV0ID09PSAnc3RyaW5nJyB8fFxuICAgICAgQXJyYXkuaXNBcnJheShvcHRpb25zT3JJbnB1dCkgfHxcbiAgICAgIChpc09iamVjdChvcHRpb25zT3JJbnB1dCkgJiZcbiAgICAgICAgJ3BpcGUnIGluIG9wdGlvbnNPcklucHV0ICYmXG4gICAgICAgIHR5cGVvZiBvcHRpb25zT3JJbnB1dC5waXBlID09PSAnZnVuY3Rpb24nKVxuICAgICkge1xuICAgICAgLy8gd2hlbiBvcHRpb25zIGlzIG5vdCBwbGFpbiBoYXNoIG9iamVjdCwgaXQgaXMgb21pdHRlZFxuICAgICAgaW5wdXQgPSBvcHRpb25zT3JJbnB1dDtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnNPcklucHV0IGFzIEJ1bGtPcHRpb25zO1xuICAgIH1cbiAgICBjb25zdCBqb2IgPSB0aGlzLmNyZWF0ZUpvYih0eXBlLCBvcGVyYXRpb24sIG9wdGlvbnMpO1xuICAgIGNvbnN0IGJhdGNoID0gam9iLmNyZWF0ZUJhdGNoKCk7XG4gICAgY29uc3QgY2xlYW51cCA9ICgpID0+IGpvYi5jbG9zZSgpO1xuICAgIGNvbnN0IGNsZWFudXBPbkVycm9yID0gKGVycjogRXJyb3IpID0+IHtcbiAgICAgIGlmIChlcnIubmFtZSAhPT0gJ1BvbGxpbmdUaW1lb3V0Jykge1xuICAgICAgICBjbGVhbnVwKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBiYXRjaC5vbigncmVzcG9uc2UnLCBjbGVhbnVwKTtcbiAgICBiYXRjaC5vbignZXJyb3InLCBjbGVhbnVwT25FcnJvcik7XG4gICAgYmF0Y2gub24oJ3F1ZXVlJywgKCkgPT4ge1xuICAgICAgYmF0Y2g/LnBvbGwodGhpcy5wb2xsSW50ZXJ2YWwsIHRoaXMucG9sbFRpbWVvdXQpO1xuICAgIH0pO1xuICAgIHJldHVybiBiYXRjaC5leGVjdXRlKGlucHV0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIGJ1bGsgcXVlcnkgYW5kIGdldCByZWNvcmQgc3RyZWFtXG4gICAqL1xuICBxdWVyeShzb3FsOiBzdHJpbmcpIHtcbiAgICBjb25zdCBtID0gc29xbC5yZXBsYWNlKC9cXChbXFxzXFxTXStcXCkvZywgJycpLm1hdGNoKC9GUk9NXFxzKyhcXHcrKS9pKTtcbiAgICBpZiAoIW0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ05vIHNvYmplY3QgdHlwZSBmb3VuZCBpbiBxdWVyeSwgbWF5YmUgY2F1c2VkIGJ5IGludmFsaWQgU09RTC4nLFxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3QgdHlwZSA9IG1bMV07XG4gICAgY29uc3QgcmVjb3JkU3RyZWFtID0gbmV3IFBhcnNhYmxlKCk7XG4gICAgY29uc3QgZGF0YVN0cmVhbSA9IHJlY29yZFN0cmVhbS5zdHJlYW0oJ2NzdicpO1xuICAgIChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5sb2FkKHR5cGUsICdxdWVyeScsIHNvcWwpO1xuICAgICAgICBjb25zdCBzdHJlYW1zID0gcmVzdWx0cy5tYXAoKHJlc3VsdCkgPT5cbiAgICAgICAgICB0aGlzLmpvYihyZXN1bHQuam9iSWQpXG4gICAgICAgICAgICAuYmF0Y2gocmVzdWx0LmJhdGNoSWQpXG4gICAgICAgICAgICAucmVzdWx0KHJlc3VsdC5pZClcbiAgICAgICAgICAgIC5zdHJlYW0oKSxcbiAgICAgICAgKTtcbiAgICAgICAgam9pblN0cmVhbXMoc3RyZWFtcykucGlwZShkYXRhU3RyZWFtKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZWNvcmRTdHJlYW0uZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgfVxuICAgIH0pKCk7XG4gICAgcmV0dXJuIHJlY29yZFN0cmVhbTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgam9iIGluc3RhbmNlXG4gICAqL1xuICBjcmVhdGVKb2I8T3ByIGV4dGVuZHMgQnVsa09wZXJhdGlvbj4oXG4gICAgdHlwZTogc3RyaW5nLFxuICAgIG9wZXJhdGlvbjogT3ByLFxuICAgIG9wdGlvbnM6IEJ1bGtPcHRpb25zID0ge30sXG4gICkge1xuICAgIHJldHVybiBuZXcgSm9iKHRoaXMsIHR5cGUsIG9wZXJhdGlvbiwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgam9iIGluc3RhbmNlIHNwZWNpZmllZCBieSBnaXZlbiBqb2IgSURcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGpvYklkIC0gSm9iIElEXG4gICAqIEByZXR1cm5zIHtCdWxrfkpvYn1cbiAgICovXG4gIGpvYjxPcHIgZXh0ZW5kcyBCdWxrT3BlcmF0aW9uPihqb2JJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBKb2I8UywgT3ByPih0aGlzLCBudWxsLCBudWxsLCBudWxsLCBqb2JJZCk7XG4gIH1cbn1cblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKlxuICogUmVnaXN0ZXIgaG9vayBpbiBjb25uZWN0aW9uIGluc3RhbnRpYXRpb24gZm9yIGR5bmFtaWNhbGx5IGFkZGluZyB0aGlzIEFQSSBtb2R1bGUgZmVhdHVyZXNcbiAqL1xucmVnaXN0ZXJNb2R1bGUoJ2J1bGsnLCAoY29ubikgPT4gbmV3IEJ1bGsoY29ubikpO1xuXG5leHBvcnQgZGVmYXVsdCBCdWxrO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBUUE7Ozs7Ozs7OztBQWlHQTtBQUNBO0FBQ0E7QUFDTyxNQUFNQSxHQUFOLFNBR0dDLG9CQUhILENBR2dCO0VBV3JCO0FBQ0Y7QUFDQTtFQUNFQyxXQUFXLENBQ1RDLElBRFMsRUFFVEMsSUFGUyxFQUdUQyxTQUhTLEVBSVRDLE9BSlMsRUFLVEMsS0FMUyxFQU1U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