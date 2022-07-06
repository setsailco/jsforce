"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = exports.Cache = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/json/stringify"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/index-of"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.promise.js");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _events = require("events");

/**
 * @file Manages asynchronous method response cache
 * @author Shinichi Tomita <shinichi.tomita@gmail.com>
 */

/**
 * Class for managing cache entry
 *
 * @private
 * @class
 * @constructor
 * @template T
 */
class CacheEntry extends _events.EventEmitter {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_fetching", false);
    (0, _defineProperty2.default)(this, "_value", undefined);
  }

  /**
   * Get value in the cache entry
   *
   * @param {() => Promise<T>} [callback] - Callback function callbacked the cache entry updated
   * @returns {T|undefined}
   */
  get(callback) {
    if (callback) {
      const cb = callback;
      this.once('value', v => cb(v));

      if (typeof this._value !== 'undefined') {
        this.emit('value', this._value);
      }
    }

    return this._value;
  }
  /**
   * Set value in the cache entry
   */


  set(value) {
    this._value = value;
    this.emit('value', this._value);
  }
  /**
   * Clear cached value
   */


  clear() {
    this._fetching = false;
    this._value = undefined;
  }

}
/**
 * create and return cache key from namespace and serialized arguments.
 * @private
 */


function createCacheKey(namespace, args) {
  var _context;

  return `${namespace || ''}(${(0, _map.default)(_context = [...args]).call(_context, a => (0, _stringify.default)(a)).join(',')})`;
}

function generateKeyString(options, scope, args) {
  return typeof options.key === 'string' ? options.key : typeof options.key === 'function' ? options.key.apply(scope, args) : createCacheKey(options.namespace, args);
}
/**
 * Caching manager for async methods
 *
 * @class
 * @constructor
 */


class Cache {
  constructor() {
    (0, _defineProperty2.default)(this, "_entries", {});
  }

  /**
   * retrive cache entry, or create if not exists.
   *
   * @param {String} [key] - Key of cache entry
   * @returns {CacheEntry}
   */
  get(key) {
    if (this._entries[key]) {
      return this._entries[key];
    }

    const entry = new CacheEntry();
    this._entries[key] = entry;
    return entry;
  }
  /**
   * clear cache entries prefix matching given key
   */


  clear(key) {
    for (const k of (0, _keys.default)(this._entries)) {
      if (!key || (0, _indexOf.default)(k).call(k, key) === 0) {
        this._entries[k].clear();
      }
    }
  }
  /**
   * Enable caching for async call fn to lookup the response cache first,
   * then invoke original if no cached value.
   */


  createCachedFunction(fn, scope, options = {
    strategy: 'NOCACHE'
  }) {
    const strategy = options.strategy;

    const $fn = (...args) => {
      const key = generateKeyString(options, scope, args);
      const entry = this.get(key);

      const executeFetch = async () => {
        entry._fetching = true;

        try {
          const result = await fn.apply(scope || this, args);
          entry.set({
            error: undefined,
            result
          });
          return result;
        } catch (error) {
          entry.set({
            error: error,
            result: undefined
          });
          throw error;
        }
      };

      let value;

      switch (strategy) {
        case 'IMMEDIATE':
          value = entry.get();

          if (!value) {
            throw new Error('Function call result is not cached yet.');
          }

          if (value.error) {
            throw value.error;
          }

          return value.result;

        case 'HIT':
          return (async () => {
            if (!entry._fetching) {
              // only when no other client is calling function
              await executeFetch();
            }

            return new _promise.default((resolve, reject) => {
              entry.get(({
                error,
                result
              }) => {
                if (error) reject(error);else resolve(result);
              });
            });
          })();

        case 'NOCACHE':
        default:
          return executeFetch();
      }
    };

    $fn.clear = (...args) => {
      const key = generateKeyString(options, scope, args);
      this.clear(key);
    };

    return $fn;
  }

}

exports.Cache = Cache;
var _default = Cache;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDYWNoZUVudHJ5IiwiRXZlbnRFbWl0dGVyIiwidW5kZWZpbmVkIiwiZ2V0IiwiY2FsbGJhY2siLCJjYiIsIm9uY2UiLCJ2IiwiX3ZhbHVlIiwiZW1pdCIsInNldCIsInZhbHVlIiwiY2xlYXIiLCJfZmV0Y2hpbmciLCJjcmVhdGVDYWNoZUtleSIsIm5hbWVzcGFjZSIsImFyZ3MiLCJhIiwiam9pbiIsImdlbmVyYXRlS2V5U3RyaW5nIiwib3B0aW9ucyIsInNjb3BlIiwia2V5IiwiYXBwbHkiLCJDYWNoZSIsIl9lbnRyaWVzIiwiZW50cnkiLCJrIiwiY3JlYXRlQ2FjaGVkRnVuY3Rpb24iLCJmbiIsInN0cmF0ZWd5IiwiJGZuIiwiZXhlY3V0ZUZldGNoIiwicmVzdWx0IiwiZXJyb3IiLCJFcnJvciIsInJlc29sdmUiLCJyZWplY3QiXSwic291cmNlcyI6WyIuLi9zcmMvY2FjaGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBNYW5hZ2VzIGFzeW5jaHJvbm91cyBtZXRob2QgcmVzcG9uc2UgY2FjaGVcbiAqIEBhdXRob3IgU2hpbmljaGkgVG9taXRhIDxzaGluaWNoaS50b21pdGFAZ21haWwuY29tPlxuICovXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuXG4vKipcbiAqIHR5cGUgZGVmXG4gKi9cbmV4cG9ydCB0eXBlIENhY2hpbmdPcHRpb25zID0ge1xuICBrZXk/OiBzdHJpbmcgfCAoKC4uLmFyZ3M6IGFueVtdKSA9PiBzdHJpbmcpO1xuICBuYW1lc3BhY2U/OiBzdHJpbmc7XG4gIHN0cmF0ZWd5OiAnTk9DQUNIRScgfCAnSElUJyB8ICdJTU1FRElBVEUnO1xufTtcblxudHlwZSBDYWNoZVZhbHVlPFQ+ID0ge1xuICBlcnJvcj86IEVycm9yO1xuICByZXN1bHQ6IFQ7XG59O1xuXG5leHBvcnQgdHlwZSBDYWNoZWRGdW5jdGlvbjxGbj4gPSBGbiAmIHsgY2xlYXI6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCB9O1xuXG4vKipcbiAqIENsYXNzIGZvciBtYW5hZ2luZyBjYWNoZSBlbnRyeVxuICpcbiAqIEBwcml2YXRlXG4gKiBAY2xhc3NcbiAqIEBjb25zdHJ1Y3RvclxuICogQHRlbXBsYXRlIFRcbiAqL1xuY2xhc3MgQ2FjaGVFbnRyeTxUPiBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIF9mZXRjaGluZzogYm9vbGVhbiA9IGZhbHNlO1xuICBfdmFsdWU6IENhY2hlVmFsdWU8VD4gfCB2b2lkID0gdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBHZXQgdmFsdWUgaW4gdGhlIGNhY2hlIGVudHJ5XG4gICAqXG4gICAqIEBwYXJhbSB7KCkgPT4gUHJvbWlzZTxUPn0gW2NhbGxiYWNrXSAtIENhbGxiYWNrIGZ1bmN0aW9uIGNhbGxiYWNrZWQgdGhlIGNhY2hlIGVudHJ5IHVwZGF0ZWRcbiAgICogQHJldHVybnMge1R8dW5kZWZpbmVkfVxuICAgKi9cbiAgZ2V0KGNhbGxiYWNrPzogKHY6IFQpID0+IGFueSk6IENhY2hlVmFsdWU8VD4gfCB2b2lkIHtcbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNiID0gY2FsbGJhY2s7XG4gICAgICB0aGlzLm9uY2UoJ3ZhbHVlJywgKHY6IFQpID0+IGNiKHYpKTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5fdmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuZW1pdCgndmFsdWUnLCB0aGlzLl92YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdmFsdWUgaW4gdGhlIGNhY2hlIGVudHJ5XG4gICAqL1xuICBzZXQodmFsdWU6IENhY2hlVmFsdWU8VD4pIHtcbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuZW1pdCgndmFsdWUnLCB0aGlzLl92YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgY2FjaGVkIHZhbHVlXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLl9mZXRjaGluZyA9IGZhbHNlO1xuICAgIHRoaXMuX3ZhbHVlID0gdW5kZWZpbmVkO1xuICB9XG59XG5cbi8qKlxuICogY3JlYXRlIGFuZCByZXR1cm4gY2FjaGUga2V5IGZyb20gbmFtZXNwYWNlIGFuZCBzZXJpYWxpemVkIGFyZ3VtZW50cy5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUNhY2hlS2V5KG5hbWVzcGFjZTogc3RyaW5nIHwgdm9pZCwgYXJnczogYW55W10pOiBzdHJpbmcge1xuICByZXR1cm4gYCR7bmFtZXNwYWNlIHx8ICcnfSgke1suLi5hcmdzXVxuICAgIC5tYXAoKGEpID0+IEpTT04uc3RyaW5naWZ5KGEpKVxuICAgIC5qb2luKCcsJyl9KWA7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlS2V5U3RyaW5nKFxuICBvcHRpb25zOiBDYWNoaW5nT3B0aW9ucyxcbiAgc2NvcGU6IGFueSxcbiAgYXJnczogYW55W10sXG4pOiBzdHJpbmcge1xuICByZXR1cm4gdHlwZW9mIG9wdGlvbnMua2V5ID09PSAnc3RyaW5nJ1xuICAgID8gb3B0aW9ucy5rZXlcbiAgICA6IHR5cGVvZiBvcHRpb25zLmtleSA9PT0gJ2Z1bmN0aW9uJ1xuICAgID8gb3B0aW9ucy5rZXkuYXBwbHkoc2NvcGUsIGFyZ3MpXG4gICAgOiBjcmVhdGVDYWNoZUtleShvcHRpb25zLm5hbWVzcGFjZSwgYXJncyk7XG59XG5cbi8qKlxuICogQ2FjaGluZyBtYW5hZ2VyIGZvciBhc3luYyBtZXRob2RzXG4gKlxuICogQGNsYXNzXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGNsYXNzIENhY2hlIHtcbiAgcHJpdmF0ZSBfZW50cmllczogeyBba2V5OiBzdHJpbmddOiBDYWNoZUVudHJ5PGFueT4gfSA9IHt9O1xuXG4gIC8qKlxuICAgKiByZXRyaXZlIGNhY2hlIGVudHJ5LCBvciBjcmVhdGUgaWYgbm90IGV4aXN0cy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IFtrZXldIC0gS2V5IG9mIGNhY2hlIGVudHJ5XG4gICAqIEByZXR1cm5zIHtDYWNoZUVudHJ5fVxuICAgKi9cbiAgZ2V0KGtleTogc3RyaW5nKSB7XG4gICAgaWYgKHRoaXMuX2VudHJpZXNba2V5XSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2VudHJpZXNba2V5XTtcbiAgICB9XG4gICAgY29uc3QgZW50cnkgPSBuZXcgQ2FjaGVFbnRyeSgpO1xuICAgIHRoaXMuX2VudHJpZXNba2V5XSA9IGVudHJ5O1xuICAgIHJldHVybiBlbnRyeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBjbGVhciBjYWNoZSBlbnRyaWVzIHByZWZpeCBtYXRjaGluZyBnaXZlbiBrZXlcbiAgICovXG4gIGNsZWFyKGtleT86IHN0cmluZykge1xuICAgIGZvciAoY29uc3QgayBvZiBPYmplY3Qua2V5cyh0aGlzLl9lbnRyaWVzKSkge1xuICAgICAgaWYgKCFrZXkgfHwgay5pbmRleE9mKGtleSkgPT09IDApIHtcbiAgICAgICAgdGhpcy5fZW50cmllc1trXS5jbGVhcigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFbmFibGUgY2FjaGluZyBmb3IgYXN5bmMgY2FsbCBmbiB0byBsb29rdXAgdGhlIHJlc3BvbnNlIGNhY2hlIGZpcnN0LFxuICAgKiB0aGVuIGludm9rZSBvcmlnaW5hbCBpZiBubyBjYWNoZWQgdmFsdWUuXG4gICAqL1xuICBjcmVhdGVDYWNoZWRGdW5jdGlvbjxGbiBleHRlbmRzIEZ1bmN0aW9uPihcbiAgICBmbjogRm4sXG4gICAgc2NvcGU6IGFueSxcbiAgICBvcHRpb25zOiBDYWNoaW5nT3B0aW9ucyA9IHsgc3RyYXRlZ3k6ICdOT0NBQ0hFJyB9LFxuICApOiBDYWNoZWRGdW5jdGlvbjxGbj4ge1xuICAgIGNvbnN0IHN0cmF0ZWd5ID0gb3B0aW9ucy5zdHJhdGVneTtcbiAgICBjb25zdCAkZm46IGFueSA9ICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgY29uc3Qga2V5ID0gZ2VuZXJhdGVLZXlTdHJpbmcob3B0aW9ucywgc2NvcGUsIGFyZ3MpO1xuICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmdldChrZXkpO1xuICAgICAgY29uc3QgZXhlY3V0ZUZldGNoID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBlbnRyeS5fZmV0Y2hpbmcgPSB0cnVlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZuLmFwcGx5KHNjb3BlIHx8IHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIGVudHJ5LnNldCh7IGVycm9yOiB1bmRlZmluZWQsIHJlc3VsdCB9KTtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGVudHJ5LnNldCh7IGVycm9yOiBlcnJvciBhcyBFcnJvciwgcmVzdWx0OiB1bmRlZmluZWQgfSk7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBsZXQgdmFsdWU7XG4gICAgICBzd2l0Y2ggKHN0cmF0ZWd5KSB7XG4gICAgICAgIGNhc2UgJ0lNTUVESUFURSc6XG4gICAgICAgICAgdmFsdWUgPSBlbnRyeS5nZXQoKTtcbiAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Z1bmN0aW9uIGNhbGwgcmVzdWx0IGlzIG5vdCBjYWNoZWQgeWV0LicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodmFsdWUuZXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IHZhbHVlLmVycm9yO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdmFsdWUucmVzdWx0O1xuICAgICAgICBjYXNlICdISVQnOlxuICAgICAgICAgIHJldHVybiAoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFlbnRyeS5fZmV0Y2hpbmcpIHtcbiAgICAgICAgICAgICAgLy8gb25seSB3aGVuIG5vIG90aGVyIGNsaWVudCBpcyBjYWxsaW5nIGZ1bmN0aW9uXG4gICAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGVGZXRjaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgZW50cnkuZ2V0KCh7IGVycm9yLCByZXN1bHQgfSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvcikgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICBlbHNlIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KSgpO1xuICAgICAgICBjYXNlICdOT0NBQ0hFJzpcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gZXhlY3V0ZUZldGNoKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICAkZm4uY2xlYXIgPSAoLi4uYXJnczogYW55W10pID0+IHtcbiAgICAgIGNvbnN0IGtleSA9IGdlbmVyYXRlS2V5U3RyaW5nKG9wdGlvbnMsIHNjb3BlLCBhcmdzKTtcbiAgICAgIHRoaXMuY2xlYXIoa2V5KTtcbiAgICB9O1xuICAgIHJldHVybiAkZm4gYXMgQ2FjaGVkRnVuY3Rpb248Rm4+O1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENhY2hlO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUE7O0FBSkE7QUFDQTtBQUNBO0FBQ0E7O0FBbUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQSxVQUFOLFNBQTRCQyxvQkFBNUIsQ0FBeUM7RUFBQTtJQUFBO0lBQUEsaURBQ2xCLEtBRGtCO0lBQUEsOENBRVJDLFNBRlE7RUFBQTs7RUFJdkM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLEdBQUcsQ0FBQ0MsUUFBRCxFQUFpRDtJQUNsRCxJQUFJQSxRQUFKLEVBQWM7TUFDWixNQUFNQyxFQUFF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