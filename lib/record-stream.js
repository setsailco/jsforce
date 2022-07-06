"use strict";

var _Object$keys2 = require("@babel/runtime-corejs3/core-js-stable/object/keys");

var _Object$getOwnPropertySymbols = require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-symbols");

var _filterInstanceProperty2 = require("@babel/runtime-corejs3/core-js-stable/instance/filter");

var _Object$getOwnPropertyDescriptor = require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-descriptor");

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js-stable/instance/for-each");

var _Object$getOwnPropertyDescriptors = require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-descriptors");

var _Object$defineProperties = require("@babel/runtime-corejs3/core-js-stable/object/define-properties");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = exports.Serializable = exports.RecordStream = exports.Parsable = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/reduce"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/filter"));

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

require("core-js/modules/es.array.iterator.js");

var _stream = require("stream");

var _csv = require("./csv");

var _stream2 = require("./util/stream");

const _excluded = ["nullValue"];

function ownKeys(object, enumerableOnly) { var keys = _Object$keys2(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty2(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context3, _context4; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context3 = ownKeys(Object(source), !0)).call(_context3, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context4 = ownKeys(Object(source))).call(_context4, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * @private
 */
function evalMapping(value, mapping) {
  if (typeof value === 'string') {
    const m = /^\$\{(\w+)\}$/.exec(value);

    if (m) {
      return mapping[m[1]];
    }

    return value.replace(/\$\{(\w+)\}/g, ($0, prop) => {
      const v = mapping[prop];
      return typeof v === 'undefined' || v === null ? '' : String(v);
    });
  }

  return value;
}
/**
 * @private
 */


function convertRecordForSerialization(record, options = {}) {
  var _context;

  return (0, _reduce.default)(_context = (0, _keys.default)(record)).call(_context, (rec, key) => {
    const value = rec[key];
    let urec;

    if (key === 'attributes') {
      // 'attributes' prop will be ignored
      urec = _objectSpread({}, rec);
      delete urec[key];
      return urec;
    } else if (options.nullValue && value === null) {
      return _objectSpread(_objectSpread({}, rec), {}, {
        [key]: options.nullValue
      });
    } else if (value !== null && typeof value === 'object') {
      var _context2;

      const precord = convertRecordForSerialization(value, options);
      return (0, _reduce.default)(_context2 = (0, _keys.default)(precord)).call(_context2, (prec, pkey) => {
        prec[`${key}.${pkey}`] = precord[pkey]; // eslint-disable-line no-param-reassign

        return prec;
      }, _objectSpread({}, rec));
    }

    return rec;
  }, record);
}
/**
 * @private
 */


function createPipelineStream(s1, s2) {
  s1.pipe(s2);
  return (0, _stream2.concatStreamsAsDuplex)(s1, s2, {
    writableObjectMode: true
  });
}

/**
 * @private
 */
const CSVStreamConverter = {
  serialize(options = {}) {
    const {
      nullValue
    } = options,
          csvOpts = (0, _objectWithoutProperties2.default)(options, _excluded);
    return createPipelineStream( // eslint-disable-next-line no-use-before-define
    (0, _map.default)(RecordStream).call(RecordStream, record => convertRecordForSerialization(record, options)), (0, _csv.serializeCSVStream)(csvOpts));
  },

  parse(options = {}) {
    return (0, _csv.parseCSVStream)(options);
  }

};
/**
 * @private
 */

const DataStreamConverters = {
  csv: CSVStreamConverter
};
/**
 * Class for Record Stream
 *
 * @class
 * @constructor
 * @extends stream.Transform
 */

class RecordStream extends _stream.PassThrough {
  /**
   *
   */
  constructor() {
    super({
      objectMode: true
    });
    (0, _defineProperty2.default)(this, "addListener", this.on);
  }
  /**
   * Get record stream of queried records applying the given mapping function
   */


  map(fn) {
    return this.pipe((0, _map.default)(RecordStream).call(RecordStream, fn));
  }
  /**
   * Get record stream of queried records, applying the given filter function
   */


  filter(fn) {
    return this.pipe((0, _filter.default)(RecordStream).call(RecordStream, fn));
  }
  /* @override */


  on(ev, fn) {
    return super.on(ev === 'record' ? 'data' : ev, fn);
  }
  /* @override */


  /* --------------------------------------------------- */

  /**
   * Create a record stream which maps records and pass them to downstream
   */
  static map(fn) {
    const mapStream = new _stream.Transform({
      objectMode: true,

      transform(record, enc, callback) {
        const rec = fn(record) || record; // if not returned record, use same record

        mapStream.push(rec);
        callback();
      }

    });
    return mapStream;
  }
  /**
   * Create mapping stream using given record template
   */


  static recordMapStream(record, noeval) {
    return (0, _map.default)(RecordStream).call(RecordStream, rec => {
      const mapped = {
        Id: rec.Id
      };

      for (const prop of (0, _keys.default)(record)) {
        mapped[prop] = noeval ? record[prop] : evalMapping(record[prop], rec);
      }

      return mapped;
    });
  }
  /**
   * Create a record stream which filters records and pass them to downstream
   *
   * @param {RecordFilterFunction} fn - Record filtering function
   * @returns {RecordStream.Serializable}
   */


  static filter(fn) {
    const filterStream = new _stream.Transform({
      objectMode: true,

      transform(record, enc, callback) {
        if (fn(record)) {
          filterStream.push(record);
        }

        callback();
      }

    });
    return filterStream;
  }

}
/**
 * @class RecordStream.Serializable
 * @extends {RecordStream}
 */


exports.RecordStream = RecordStream;

class Serializable extends RecordStream {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_dataStreams", {});
  }

  /**
   * Get readable data stream which emits serialized record data
   */
  stream(type = 'csv', options = {}) {
    if (this._dataStreams[type]) {
      return this._dataStreams[type];
    }

    const converter = DataStreamConverters[type];

    if (!converter) {
      throw new Error(`Converting [${type}] data stream is not supported.`);
    }

    const dataStream = new _stream.PassThrough();
    this.pipe(converter.serialize(options)).pipe(dataStream);
    this._dataStreams[type] = dataStream;
    return dataStream;
  }

}
/**
 * @class RecordStream.Parsable
 * @extends {RecordStream}
 */


exports.Serializable = Serializable;

class Parsable extends RecordStream {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_dataStreams", {});
    (0, _defineProperty2.default)(this, "_execParse", false);
    (0, _defineProperty2.default)(this, "_incomings", []);
    (0, _defineProperty2.default)(this, "addListener", this.on);
  }

  /**
   * Get writable data stream which accepts serialized record data
   */
  stream(type = 'csv', options = {}) {
    if (this._dataStreams[type]) {
      return this._dataStreams[type];
    }

    const converter = DataStreamConverters[type];

    if (!converter) {
      throw new Error(`Converting [${type}] data stream is not supported.`);
    }

    const dataStream = new _stream.PassThrough();
    const parserStream = converter.parse(options);
    parserStream.on('error', err => this.emit('error', err));
    parserStream.pipe(this).pipe(new _stream.PassThrough({
      objectMode: true,
      highWaterMark: 500 * 1000
    }));

    if (this._execParse) {
      dataStream.pipe(parserStream);
    } else {
      this._incomings.push([dataStream, parserStream]);
    }

    this._dataStreams[type] = dataStream;
    return dataStream;
  }
  /* @override */


  on(ev, fn) {
    if (ev === 'readable' || ev === 'record') {
      if (!this._execParse) {
        this._execParse = true;

        for (const [dataStream, parserStream] of this._incomings) {
          dataStream.pipe(parserStream);
        }
      }
    }

    return super.on(ev, fn);
  }
  /* @override */


}

exports.Parsable = Parsable;
var _default = RecordStream;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJldmFsTWFwcGluZyIsInZhbHVlIiwibWFwcGluZyIsIm0iLCJleGVjIiwicmVwbGFjZSIsIiQwIiwicHJvcCIsInYiLCJTdHJpbmciLCJjb252ZXJ0UmVjb3JkRm9yU2VyaWFsaXphdGlvbiIsInJlY29yZCIsIm9wdGlvbnMiLCJyZWMiLCJrZXkiLCJ1cmVjIiwibnVsbFZhbHVlIiwicHJlY29yZCIsInByZWMiLCJwa2V5IiwiY3JlYXRlUGlwZWxpbmVTdHJlYW0iLCJzMSIsInMyIiwicGlwZSIsImNvbmNhdFN0cmVhbXNBc0R1cGxleCIsIndyaXRhYmxlT2JqZWN0TW9kZSIsIkNTVlN0cmVhbUNvbnZlcnRlciIsInNlcmlhbGl6ZSIsImNzdk9wdHMiLCJSZWNvcmRTdHJlYW0iLCJzZXJpYWxpemVDU1ZTdHJlYW0iLCJwYXJzZSIsInBhcnNlQ1NWU3RyZWFtIiwiRGF0YVN0cmVhbUNvbnZlcnRlcnMiLCJjc3YiLCJQYXNzVGhyb3VnaCIsImNvbnN0cnVjdG9yIiwib2JqZWN0TW9kZSIsIm9uIiwibWFwIiwiZm4iLCJmaWx0ZXIiLCJldiIsIm1hcFN0cmVhbSIsIlRyYW5zZm9ybSIsInRyYW5zZm9ybSIsImVuYyIsImNhbGxiYWNrIiwicHVzaCIsInJlY29yZE1hcFN0cmVhbSIsIm5vZXZhbCIsIm1hcHBlZCIsIklkIiwiZmlsdGVyU3RyZWFtIiwiU2VyaWFsaXphYmxlIiwic3RyZWFtIiwidHlwZSIsIl9kYXRhU3RyZWFtcyIsImNvbnZlcnRlciIsIkVycm9yIiwiZGF0YVN0cmVhbSIsIlBhcnNhYmxlIiwicGFyc2VyU3RyZWFtIiwiZXJyIiwiZW1pdCIsImhpZ2hXYXRlck1hcmsiLCJfZXhlY1BhcnNlIiwiX2luY29taW5ncyJdLCJzb3VyY2VzIjpbIi4uL3NyYy9yZWNvcmQtc3RyZWFtLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgUmVwcmVzZW50cyBzdHJlYW0gdGhhdCBoYW5kbGVzIFNhbGVzZm9yY2UgcmVjb3JkIGFzIHN0cmVhbSBkYXRhXG4gKiBAYXV0aG9yIFNoaW5pY2hpIFRvbWl0YSA8c2hpbmljaGkudG9taXRhQGdtYWlsLmNvbT5cbiAqL1xuaW1wb3J0IHsgUmVhZGFibGUsIFdyaXRhYmxlLCBEdXBsZXgsIFRyYW5zZm9ybSwgUGFzc1Rocm91Z2ggfSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0IHsgUmVjb3JkLCBPcHRpb25hbCB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgc2VyaWFsaXplQ1NWU3RyZWFtLCBwYXJzZUNTVlN0cmVhbSB9IGZyb20gJy4vY3N2JztcbmltcG9ydCB7IGNvbmNhdFN0cmVhbXNBc0R1cGxleCB9IGZyb20gJy4vdXRpbC9zdHJlYW0nO1xuXG4vKipcbiAqIHR5cGUgZGVmc1xuICovXG5leHBvcnQgdHlwZSBSZWNvcmRTdHJlYW1TZXJpYWxpemVPcHRpb24gPSB7XG4gIG51bGxWYWx1ZT86IGFueTtcbn07XG5cbmV4cG9ydCB0eXBlIFJlY29yZFN0cmVhbVBhcnNlT3B0aW9uID0ge307XG5cbi8qKlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gZXZhbE1hcHBpbmcodmFsdWU6IGFueSwgbWFwcGluZzogeyBbcHJvcDogc3RyaW5nXTogc3RyaW5nIH0pIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25zdCBtID0gL15cXCRcXHsoXFx3KylcXH0kLy5leGVjKHZhbHVlKTtcbiAgICBpZiAobSkge1xuICAgICAgcmV0dXJuIG1hcHBpbmdbbVsxXV07XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9cXCRcXHsoXFx3KylcXH0vZywgKCQwLCBwcm9wKSA9PiB7XG4gICAgICBjb25zdCB2ID0gbWFwcGluZ1twcm9wXTtcbiAgICAgIHJldHVybiB0eXBlb2YgdiA9PT0gJ3VuZGVmaW5lZCcgfHwgdiA9PT0gbnVsbCA/ICcnIDogU3RyaW5nKHYpO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBjb252ZXJ0UmVjb3JkRm9yU2VyaWFsaXphdGlvbihcbiAgcmVjb3JkOiBSZWNvcmQsXG4gIG9wdGlvbnM6IHsgbnVsbFZhbHVlPzogYm9vbGVhbiB9ID0ge30sXG4pOiBSZWNvcmQge1xuICByZXR1cm4gT2JqZWN0LmtleXMocmVjb3JkKS5yZWR1Y2UoKHJlYzogUmVjb3JkLCBrZXk6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHZhbHVlID0gKHJlYyBhcyBhbnkpW2tleV07XG4gICAgbGV0IHVyZWM6IFJlY29yZDtcbiAgICBpZiAoa2V5ID09PSAnYXR0cmlidXRlcycpIHtcbiAgICAgIC8vICdhdHRyaWJ1dGVzJyBwcm9wIHdpbGwgYmUgaWdub3JlZFxuICAgICAgdXJlYyA9IHsgLi4ucmVjIH07XG4gICAgICBkZWxldGUgdXJlY1trZXldO1xuICAgICAgcmV0dXJuIHVyZWM7XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLm51bGxWYWx1ZSAmJiB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHsgLi4ucmVjLCBba2V5XTogb3B0aW9ucy5udWxsVmFsdWUgfSBhcyBSZWNvcmQ7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICBjb25zdCBwcmVjb3JkID0gY29udmVydFJlY29yZEZvclNlcmlhbGl6YXRpb24odmFsdWUsIG9wdGlvbnMpO1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHByZWNvcmQpLnJlZHVjZShcbiAgICAgICAgKHByZWM6IFJlY29yZCwgcGtleSkgPT4ge1xuICAgICAgICAgIHByZWNbYCR7a2V5fS4ke3BrZXl9YF0gPSBwcmVjb3JkW3BrZXldOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgICAgICAgcmV0dXJuIHByZWM7XG4gICAgICAgIH0sXG4gICAgICAgIHsgLi4ucmVjIH0sXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gcmVjO1xuICB9LCByZWNvcmQpO1xufVxuXG4vKipcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVBpcGVsaW5lU3RyZWFtKHMxOiBEdXBsZXgsIHMyOiBEdXBsZXgpIHtcbiAgczEucGlwZShzMik7XG4gIHJldHVybiBjb25jYXRTdHJlYW1zQXNEdXBsZXgoczEsIHMyLCB7IHdyaXRhYmxlT2JqZWN0TW9kZTogdHJ1ZSB9KTtcbn1cblxudHlwZSBTdHJlYW1Db252ZXJ0ZXIgPSB7XG4gIHNlcmlhbGl6ZTogKG9wdGlvbnM/OiBSZWNvcmRTdHJlYW1TZXJpYWxpemVPcHRpb24pID0+IER1cGxleDtcbiAgcGFyc2U6IChvcHRpb25zPzogUmVjb3JkU3RyZWFtUGFyc2VPcHRpb24pID0+IER1cGxleDtcbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqL1xuY29uc3QgQ1NWU3RyZWFtQ29udmVydGVyOiBTdHJlYW1Db252ZXJ0ZXIgPSB7XG4gIHNlcmlhbGl6ZShvcHRpb25zOiBSZWNvcmRTdHJlYW1TZXJpYWxpemVPcHRpb24gPSB7fSkge1xuICAgIGNvbnN0IHsgbnVsbFZhbHVlLCAuLi5jc3ZPcHRzIH0gPSBvcHRpb25zO1xuICAgIHJldHVybiBjcmVhdGVQaXBlbGluZVN0cmVhbShcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2UtYmVmb3JlLWRlZmluZVxuICAgICAgUmVjb3JkU3RyZWFtLm1hcCgocmVjb3JkKSA9PlxuICAgICAgICBjb252ZXJ0UmVjb3JkRm9yU2VyaWFsaXphdGlvbihyZWNvcmQsIG9wdGlvbnMpLFxuICAgICAgKSxcbiAgICAgIHNlcmlhbGl6ZUNTVlN0cmVhbShjc3ZPcHRzKSxcbiAgICApO1xuICB9LFxuICBwYXJzZShvcHRpb25zOiBSZWNvcmRTdHJlYW1QYXJzZU9wdGlvbiA9IHt9KSB7XG4gICAgcmV0dXJuIHBhcnNlQ1NWU3RyZWFtKG9wdGlvbnMpO1xuICB9LFxufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBEYXRhU3RyZWFtQ29udmVydGVyczogeyBba2V5OiBzdHJpbmddOiBTdHJlYW1Db252ZXJ0ZXIgfSA9IHtcbiAgY3N2OiBDU1ZTdHJlYW1Db252ZXJ0ZXIsXG59O1xuXG4vKipcbiAqIENsYXNzIGZvciBSZWNvcmQgU3RyZWFtXG4gKlxuICogQGNsYXNzXG4gKiBAY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIHN0cmVhbS5UcmFuc2Zvcm1cbiAqL1xuZXhwb3J0IGNsYXNzIFJlY29yZFN0cmVhbTxSIGV4dGVuZHMgUmVjb3JkID0gUmVjb3JkPiBleHRlbmRzIFBhc3NUaHJvdWdoIHtcbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcih7IG9iamVjdE1vZGU6IHRydWUgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHJlY29yZCBzdHJlYW0gb2YgcXVlcmllZCByZWNvcmRzIGFwcGx5aW5nIHRoZSBnaXZlbiBtYXBwaW5nIGZ1bmN0aW9uXG4gICAqL1xuICBtYXA8UlIgZXh0ZW5kcyBSZWNvcmQ+KGZuOiAocmVjOiBSKSA9PiBPcHRpb25hbDxSUj4pIHtcbiAgICByZXR1cm4gdGhpcy5waXBlKFJlY29yZFN0cmVhbS5tYXA8UiwgUlI+KGZuKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHJlY29yZCBzdHJlYW0gb2YgcXVlcmllZCByZWNvcmRzLCBhcHBseWluZyB0aGUgZ2l2ZW4gZmlsdGVyIGZ1bmN0aW9uXG4gICAqL1xuICBmaWx0ZXIoZm46IChyZWM6IFIpID0+IGJvb2xlYW4pOiBEdXBsZXgge1xuICAgIHJldHVybiB0aGlzLnBpcGUoUmVjb3JkU3RyZWFtLmZpbHRlcjxSPihmbikpO1xuICB9XG5cbiAgLyogQG92ZXJyaWRlICovXG4gIG9uKGV2OiBzdHJpbmcsIGZuOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQpIHtcbiAgICByZXR1cm4gc3VwZXIub24oZXYgPT09ICdyZWNvcmQnID8gJ2RhdGEnIDogZXYsIGZuKTtcbiAgfVxuXG4gIC8qIEBvdmVycmlkZSAqL1xuICBhZGRMaXN0ZW5lciA9IHRoaXMub247XG5cbiAgLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIHJlY29yZCBzdHJlYW0gd2hpY2ggbWFwcyByZWNvcmRzIGFuZCBwYXNzIHRoZW0gdG8gZG93bnN0cmVhbVxuICAgKi9cbiAgc3RhdGljIG1hcDxSMSBleHRlbmRzIFJlY29yZCA9IFJlY29yZCwgUjIgZXh0ZW5kcyBSZWNvcmQgPSBSZWNvcmQ+KFxuICAgIGZuOiAocmVjOiBSMSkgPT4gT3B0aW9uYWw8UjI+LFxuICApIHtcbiAgICBjb25zdCBtYXBTdHJlYW0gPSBuZXcgVHJhbnNmb3JtKHtcbiAgICAgIG9iamVjdE1vZGU6IHRydWUsXG4gICAgICB0cmFuc2Zvcm0ocmVjb3JkLCBlbmMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNvbnN0IHJlYyA9IGZuKHJlY29yZCkgfHwgcmVjb3JkOyAvLyBpZiBub3QgcmV0dXJuZWQgcmVjb3JkLCB1c2Ugc2FtZSByZWNvcmRcbiAgICAgICAgbWFwU3RyZWFtLnB1c2gocmVjKTtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgcmV0dXJuIG1hcFN0cmVhbTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgbWFwcGluZyBzdHJlYW0gdXNpbmcgZ2l2ZW4gcmVjb3JkIHRlbXBsYXRlXG4gICAqL1xuICBzdGF0aWMgcmVjb3JkTWFwU3RyZWFtPFxuICAgIFIxIGV4dGVuZHMgUmVjb3JkID0gUmVjb3JkLFxuICAgIFIyIGV4dGVuZHMgUmVjb3JkID0gUmVjb3JkXG4gID4ocmVjb3JkOiBSMiwgbm9ldmFsPzogYm9vbGVhbikge1xuICAgIHJldHVybiBSZWNvcmRTdHJlYW0ubWFwPFIxLCBSMj4oKHJlYykgPT4ge1xuICAgICAgY29uc3QgbWFwcGVkOiBSZWNvcmQgPSB7IElkOiByZWMuSWQgfTtcbiAgICAgIGZvciAoY29uc3QgcHJvcCBvZiBPYmplY3Qua2V5cyhyZWNvcmQpKSB7XG4gICAgICAgIG1hcHBlZFtwcm9wXSA9IG5vZXZhbCA/IHJlY29yZFtwcm9wXSA6IGV2YWxNYXBwaW5nKHJlY29yZFtwcm9wXSwgcmVjKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXBwZWQgYXMgUjI7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgcmVjb3JkIHN0cmVhbSB3aGljaCBmaWx0ZXJzIHJlY29yZHMgYW5kIHBhc3MgdGhlbSB0byBkb3duc3RyZWFtXG4gICAqXG4gICAqIEBwYXJhbSB7UmVjb3JkRmlsdGVyRnVuY3Rpb259IGZuIC0gUmVjb3JkIGZpbHRlcmluZyBmdW5jdGlvblxuICAgKiBAcmV0dXJucyB7UmVjb3JkU3RyZWFtLlNlcmlhbGl6YWJsZX1cbiAgICovXG4gIHN0YXRpYyBmaWx0ZXI8UjEgZXh0ZW5kcyBSZWNvcmQgPSBSZWNvcmQ+KGZuOiAocmVjOiBSMSkgPT4gYm9vbGVhbik6IER1cGxleCB7XG4gICAgY29uc3QgZmlsdGVyU3RyZWFtID0gbmV3IFRyYW5zZm9ybSh7XG4gICAgICBvYmplY3RNb2RlOiB0cnVlLFxuICAgICAgdHJhbnNmb3JtKHJlY29yZCwgZW5jLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoZm4ocmVjb3JkKSkge1xuICAgICAgICAgIGZpbHRlclN0cmVhbS5wdXNoKHJlY29yZCk7XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgcmV0dXJuIGZpbHRlclN0cmVhbTtcbiAgfVxufVxuXG4vKipcbiAqIEBjbGFzcyBSZWNvcmRTdHJlYW0uU2VyaWFsaXphYmxlXG4gKiBAZXh0ZW5kcyB7UmVjb3JkU3RyZWFtfVxuICovXG5leHBvcnQgY2xhc3MgU2VyaWFsaXphYmxlPFIgZXh0ZW5kcyBSZWNvcmQgPSBSZWNvcmQ+IGV4dGVuZHMgUmVjb3JkU3RyZWFtPFI+IHtcbiAgX2RhdGFTdHJlYW1zOiB7IFt0eXBlOiBzdHJpbmddOiBEdXBsZXggfSA9IHt9O1xuXG4gIC8qKlxuICAgKiBHZXQgcmVhZGFibGUgZGF0YSBzdHJlYW0gd2hpY2ggZW1pdHMgc2VyaWFsaXplZCByZWNvcmQgZGF0YVxuICAgKi9cbiAgc3RyZWFtKHR5cGU6IHN0cmluZyA9ICdjc3YnLCBvcHRpb25zOiBPYmplY3QgPSB7fSk6IER1cGxleCB7XG4gICAgaWYgKHRoaXMuX2RhdGFTdHJlYW1zW3R5cGVdKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZGF0YVN0cmVhbXNbdHlwZV07XG4gICAgfVxuICAgIGNvbnN0IGNvbnZlcnRlcjogT3B0aW9uYWw8U3RyZWFtQ29udmVydGVyPiA9IERhdGFTdHJlYW1Db252ZXJ0ZXJzW3R5cGVdO1xuICAgIGlmICghY29udmVydGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbnZlcnRpbmcgWyR7dHlwZX1dIGRhdGEgc3RyZWFtIGlzIG5vdCBzdXBwb3J0ZWQuYCk7XG4gICAgfVxuICAgIGNvbnN0IGRhdGFTdHJlYW0gPSBuZXcgUGFzc1Rocm91Z2goKTtcbiAgICB0aGlzLnBpcGUoY29udmVydGVyLnNlcmlhbGl6ZShvcHRpb25zKSkucGlwZShkYXRhU3RyZWFtKTtcbiAgICB0aGlzLl9kYXRhU3RyZWFtc1t0eXBlXSA9IGRhdGFTdHJlYW07XG4gICAgcmV0dXJuIGRhdGFTdHJlYW07XG4gIH1cbn1cblxuLyoqXG4gKiBAY2xhc3MgUmVjb3JkU3RyZWFtLlBhcnNhYmxlXG4gKiBAZXh0ZW5kcyB7UmVjb3JkU3RyZWFtfVxuICovXG5leHBvcnQgY2xhc3MgUGFyc2FibGU8UiBleHRlbmRzIFJlY29yZCA9IFJlY29yZD4gZXh0ZW5kcyBSZWNvcmRTdHJlYW08Uj4ge1xuICBfZGF0YVN0cmVhbXM6IHsgW3R5cGU6IHN0cmluZ106IER1cGxleCB9ID0ge307XG4gIF9leGVjUGFyc2U6IGJvb2xlYW4gPSBmYWxzZTtcbiAgX2luY29taW5nczogQXJyYXk8W1JlYWRhYmxlLCBXcml0YWJsZV0+ID0gW107XG5cbiAgLyoqXG4gICAqIEdldCB3cml0YWJsZSBkYXRhIHN0cmVhbSB3aGljaCBhY2NlcHRzIHNlcmlhbGl6ZWQgcmVjb3JkIGRhdGFcbiAgICovXG4gIHN0cmVhbSh0eXBlOiBzdHJpbmcgPSAnY3N2Jywgb3B0aW9uczogT2JqZWN0ID0ge30pOiBEdXBsZXgge1xuICAgIGlmICh0aGlzLl9kYXRhU3RyZWFtc1t0eXBlXSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2RhdGFTdHJlYW1zW3R5cGVdO1xuICAgIH1cbiAgICBjb25zdCBjb252ZXJ0ZXI6IE9wdGlvbmFsPFN0cmVhbUNvbnZlcnRlcj4gPSBEYXRhU3RyZWFtQ29udmVydGVyc1t0eXBlXTtcbiAgICBpZiAoIWNvbnZlcnRlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb252ZXJ0aW5nIFske3R5cGV9XSBkYXRhIHN0cmVhbSBpcyBub3Qgc3VwcG9ydGVkLmApO1xuICAgIH1cbiAgICBjb25zdCBkYXRhU3RyZWFtID0gbmV3IFBhc3NUaHJvdWdoKCk7XG4gICAgY29uc3QgcGFyc2VyU3RyZWFtID0gY29udmVydGVyLnBhcnNlKG9wdGlvbnMpO1xuICAgIHBhcnNlclN0cmVhbS5vbignZXJyb3InLCAoZXJyKSA9PiB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKSk7XG4gICAgcGFyc2VyU3RyZWFtXG4gICAgICAucGlwZSh0aGlzKVxuICAgICAgLnBpcGUobmV3IFBhc3NUaHJvdWdoKHsgb2JqZWN0TW9kZTogdHJ1ZSwgaGlnaFdhdGVyTWFyazogNTAwICogMTAwMCB9KSk7XG4gICAgaWYgKHRoaXMuX2V4ZWNQYXJzZSkge1xuICAgICAgZGF0YVN0cmVhbS5waXBlKHBhcnNlclN0cmVhbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2luY29taW5ncy5wdXNoKFtkYXRhU3RyZWFtLCBwYXJzZXJTdHJlYW1dKTtcbiAgICB9XG4gICAgdGhpcy5fZGF0YVN0cmVhbXNbdHlwZV0gPSBkYXRhU3RyZWFtO1xuICAgIHJldHVybiBkYXRhU3RyZWFtO1xuICB9XG5cbiAgLyogQG92ZXJyaWRlICovXG4gIG9uKGV2OiBzdHJpbmcsIGZuOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQpIHtcbiAgICBpZiAoZXYgPT09ICdyZWFkYWJsZScgfHwgZXYgPT09ICdyZWNvcmQnKSB7XG4gICAgICBpZiAoIXRoaXMuX2V4ZWNQYXJzZSkge1xuICAgICAgICB0aGlzLl9leGVjUGFyc2UgPSB0cnVlO1xuICAgICAgICBmb3IgKGNvbnN0IFtkYXRhU3RyZWFtLCBwYXJzZXJTdHJlYW1dIG9mIHRoaXMuX2luY29taW5ncykge1xuICAgICAgICAgIGRhdGFTdHJlYW0ucGlwZShwYXJzZXJTdHJlYW0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdXBlci5vbihldiwgZm4pO1xuICB9XG5cbiAgLyogQG92ZXJyaWRlICovXG4gIGFkZExpc3RlbmVyID0gdGhpcy5vbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgUmVjb3JkU3RyZWFtO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUlBOztBQUVBOztBQUNBOzs7Ozs7OztBQVdBO0FBQ0E7QUFDQTtBQUNBLFNBQVNBLFdBQVQsQ0FBcUJDLEtBQXJCLEVBQWlDQyxPQUFqQyxFQUFzRTtFQUNwRSxJQUFJLE9BQU9ELEtBQVAsS0FBaUIsUUFBckIsRUFBK0I7SUFDN0IsTUFBTUUsQ0FBQyxHQUFHLGdCQUFnQkMsSUFBaEIsQ0FBcUJILEtBQXJCLENBQVY7O0lBQ0EsSUFBSUUsQ0FBSixFQUFPO01BQ0wsT0FBT0QsT0FBTyxDQUFDQyxDQUFDLENBQUMsQ0FBRCxDQUFGLENBQWQ7SUFDRDs7SUFDRCxPQUFPRixLQUFLLENBQUNJLE9BQU4sQ0FBYyxjQUFkLEVBQThCLENBQUNDLEVBQUQsRUFBS0MsSUFBTCxLQUFjO01BQ2pELE1BQU1DLENBQUMsR0FBR04sT0FBTyxDQUFDSyxJQUFELENBQWpCO01BQ0EsT0FBTyxPQUFPQyxD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