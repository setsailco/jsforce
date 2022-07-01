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

exports.SOAP = void 0;
exports.castTypeUsingSchema = castTypeUsingSchema;
exports.default = void 0;

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

require("core-js/modules/es.promise.js");

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));

var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/reduce"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _httpApi = _interopRequireDefault(require("./http-api"));

var _function = require("./util/function");

function ownKeys(object, enumerableOnly) { var keys = _Object$keys2(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context3, _context4; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context3 = ownKeys(Object(source), !0)).call(_context3, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context4 = ownKeys(Object(source))).call(_context4, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 *
 */
function getPropsSchema(schema, schemaDict) {
  if (schema.extends && schemaDict[schema.extends]) {
    const extendSchema = schemaDict[schema.extends];
    return _objectSpread(_objectSpread({}, getPropsSchema(extendSchema, schemaDict)), schema.props);
  }

  return schema.props;
}

function isNillValue(value) {
  return value == null || (0, _function.isMapObject)(value) && (0, _function.isMapObject)(value.$) && value.$['xsi:nil'] === 'true';
}
/**
 *
 */


function castTypeUsingSchema(value, schema, schemaDict = {}) {
  if ((0, _isArray.default)(schema)) {
    var _context;

    const nillable = schema.length === 2 && schema[0] === '?';
    const schema_ = nillable ? schema[1] : schema[0];

    if (value == null) {
      return nillable ? null : [];
    }

    return (0, _map.default)(_context = (0, _isArray.default)(value) ? value : [value]).call(_context, v => castTypeUsingSchema(v, schema_, schemaDict));
  } else if ((0, _function.isMapObject)(schema)) {
    var _context2;

    // if schema is Schema Definition, not schema element
    if ('type' in schema && 'props' in schema && (0, _function.isMapObject)(schema.props)) {
      const props = getPropsSchema(schema, schemaDict);
      return castTypeUsingSchema(value, props, schemaDict);
    }

    const nillable = ('?' in schema);
    const schema_ = '?' in schema ? schema['?'] : schema;

    if (nillable && isNillValue(value)) {
      return null;
    }

    const obj = (0, _function.isMapObject)(value) ? value : {};
    return (0, _reduce.default)(_context2 = (0, _keys.default)(schema_)).call(_context2, (o, k) => {
      const s = schema_[k];
      const v = obj[k];
      const nillable = (0, _isArray.default)(s) && s.length === 2 && s[0] === '?' || (0, _function.isMapObject)(s) && '?' in s || typeof s === 'string' && s[0] === '?';

      if (typeof v === 'undefined' && nillable) {
        return o;
      }

      return _objectSpread(_objectSpread({}, o), {}, {
        [k]: castTypeUsingSchema(v, s, schemaDict)
      });
    }, obj);
  } else {
    const nillable = typeof schema === 'string' && schema[0] === '?';
    const type = typeof schema === 'string' ? nillable ? schema.substring(1) : schema : 'any';

    switch (type) {
      case 'string':
        return isNillValue(value) ? nillable ? null : '' : String(value);

      case 'number':
        return isNillValue(value) ? nillable ? null : 0 : Number(value);

      case 'boolean':
        return isNillValue(value) ? nillable ? null : false : value === 'true';

      case 'null':
        return null;

      default:
        {
          if (schemaDict[type]) {
            const cvalue = castTypeUsingSchema(value, schemaDict[type], schemaDict);
            const isEmpty = (0, _function.isMapObject)(cvalue) && (0, _keys.default)(cvalue).length === 0;
            return isEmpty && nillable ? null : cvalue;
          }

          return value;
        }
    }
  }
}
/**
 * @private
 */


function lookupValue(obj, propRegExps) {
  const regexp = propRegExps.shift();

  if (!regexp) {
    return obj;
  }

  if ((0, _function.isMapObject)(obj)) {
    for (const prop of (0, _keys.default)(obj)) {
      if (regexp.test(prop)) {
        return lookupValue(obj[prop], propRegExps);
      }
    }

    return null;
  }
}
/**
 * @private
 */


function toXML(name, value) {
  if ((0, _function.isObject)(name)) {
    value = name;
    name = null;
  }

  if ((0, _isArray.default)(value)) {
    return (0, _map.default)(value).call(value, v => toXML(name, v)).join('');
  } else {
    const attrs = [];
    const elems = [];

    if ((0, _function.isMapObject)(value)) {
      for (const k of (0, _keys.default)(value)) {
        const v = value[k];

        if (k[0] === '@') {
          const kk = k.substring(1);
          attrs.push(kk + '="' + v + '"');
        } else {
          elems.push(toXML(k, v));
        }
      }

      value = elems.join('');
    } else {
      value = String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    }

    const startTag = name ? '<' + name + (attrs.length > 0 ? ' ' + attrs.join(' ') : '') + '>' : '';
    const endTag = name ? '</' + name + '>' : '';
    return startTag + value + endTag;
  }
}
/**
 *
 */


/**
 * Class for SOAP endpoint of Salesforce
 *
 * @protected
 * @class
 * @constructor
 * @param {Connection} conn - Connection instance
 * @param {Object} options - SOAP endpoint setting options
 * @param {String} options.endpointUrl - SOAP endpoint URL
 * @param {String} [options.xmlns] - XML namespace for method call (default is "urn:partner.soap.sforce.com")
 */
class SOAP extends _httpApi.default {
  constructor(conn, options) {
    super(conn, options);
    (0, _defineProperty2.default)(this, "_endpointUrl", void 0);
    (0, _defineProperty2.default)(this, "_xmlns", void 0);
    this._endpointUrl = options.endpointUrl;
    this._xmlns = options.xmlns || 'urn:partner.soap.sforce.com';
  }
  /**
   * Invoke SOAP call using method and arguments
   */


  async invoke(method, args, schema, schemaDict) {
    const res = await this.request({
      method: 'POST',
      url: this._endpointUrl,
      headers: {
        'Content-Type': 'text/xml',
        SOAPAction: '""'
      },
      _message: {
        [method]: args
      }
    });
    return schema ? castTypeUsingSchema(res, schema, schemaDict) : res;
  }
  /** @override */


  beforeSend(request) {
    request.body = this._createEnvelope(request._message);
  }
  /** @override **/


  isSessionExpired(response) {
    return response.statusCode === 500 && /<faultcode>[a-zA-Z]+:INVALID_SESSION_ID<\/faultcode>/.test(response.body);
  }
  /** @override **/


  parseError(body) {
    const error = lookupValue(body, [/:Envelope$/, /:Body$/, /:Fault$/]);
    return {
      errorCode: error.faultcode,
      message: error.faultstring
    };
  }
  /** @override **/


  async getResponseBody(response) {
    const body = await super.getResponseBody(response);
    return lookupValue(body, [/:Envelope$/, /:Body$/, /.+/]);
  }
  /**
   * @private
   */


  _createEnvelope(message) {
    const header = {};
    const conn = this._conn;

    if (conn.accessToken) {
      header.SessionHeader = {
        sessionId: conn.accessToken
      };
    }

    if (conn._callOptions) {
      header.CallOptions = conn._callOptions;
    }

    return ['<?xml version="1.0" encoding="UTF-8"?>', '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"', ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"', ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">', '<soapenv:Header xmlns="' + this._xmlns + '">', toXML(header), '</soapenv:Header>', '<soapenv:Body xmlns="' + this._xmlns + '">', toXML(message), '</soapenv:Body>', '</soapenv:Envelope>'].join('');
  }

}

exports.SOAP = SOAP;
var _default = SOAP;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRQcm9wc1NjaGVtYSIsInNjaGVtYSIsInNjaGVtYURpY3QiLCJleHRlbmRzIiwiZXh0ZW5kU2NoZW1hIiwicHJvcHMiLCJpc05pbGxWYWx1ZSIsInZhbHVlIiwiaXNNYXBPYmplY3QiLCIkIiwiY2FzdFR5cGVVc2luZ1NjaGVtYSIsIm5pbGxhYmxlIiwibGVuZ3RoIiwic2NoZW1hXyIsInYiLCJvYmoiLCJvIiwiayIsInMiLCJ0eXBlIiwic3Vic3RyaW5nIiwiU3RyaW5nIiwiTnVtYmVyIiwiY3ZhbHVlIiwiaXNFbXB0eSIsImxvb2t1cFZhbHVlIiwicHJvcFJlZ0V4cHMiLCJyZWdleHAiLCJzaGlmdCIsInByb3AiLCJ0ZXN0IiwidG9YTUwiLCJuYW1lIiwiaXNPYmplY3QiLCJqb2luIiwiYXR0cnMiLCJlbGVtcyIsImtrIiwicHVzaCIsInJlcGxhY2UiLCJzdGFydFRhZyIsImVuZFRhZyIsIlNPQVAiLCJIdHRwQXBpIiwiY29uc3RydWN0b3IiLCJjb25uIiwib3B0aW9ucyIsIl9lbmRwb2ludFVybCIsImVuZHBvaW50VXJsIiwiX3htbG5zIiwieG1sbnMiLCJpbnZva2UiLCJtZXRob2QiLCJhcmdzIiwicmVzIiwicmVxdWVzdCIsInVybCIsImhlYWRlcnMiLCJTT0FQQWN0aW9uIiwiX21lc3NhZ2UiLCJiZWZvcmVTZW5kIiwiYm9keSIsIl9jcmVhdGVFbnZlbG9wZSIsImlzU2Vzc2lvbkV4cGlyZWQiLCJyZXNwb25zZSIsInN0YXR1c0NvZGUiLCJwYXJzZUVycm9yIiwiZXJyb3IiLCJlcnJvckNvZGUiLCJmYXVsdGNvZGUiLCJtZXNzYWdlIiwiZmF1bHRzdHJpbmciLCJnZXRSZXNwb25zZUJvZHkiLCJoZWFkZXIiLCJfY29ubiIsImFjY2Vzc1Rva2VuIiwiU2Vzc2lvbkhlYWRlciIsInNlc3Npb25JZCIsIl9jYWxsT3B0aW9ucyIsIkNhbGxPcHRpb25zIl0sInNvdXJjZXMiOlsiLi4vc3JjL3NvYXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBNYW5hZ2VzIG1ldGhvZCBjYWxsIHRvIFNPQVAgZW5kcG9pbnRcbiAqIEBhdXRob3IgU2hpbmljaGkgVG9taXRhIDxzaGluaWNoaS50b21pdGFAZ21haWwuY29tPlxuICovXG5pbXBvcnQgSHR0cEFwaSBmcm9tICcuL2h0dHAtYXBpJztcbmltcG9ydCBDb25uZWN0aW9uIGZyb20gJy4vY29ubmVjdGlvbic7XG5pbXBvcnQge1xuICBTY2hlbWEsXG4gIEh0dHBSZXNwb25zZSxcbiAgSHR0cFJlcXVlc3QsXG4gIFNvYXBTY2hlbWEsXG4gIFNvYXBTY2hlbWFEZWYsXG59IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgaXNNYXBPYmplY3QsIGlzT2JqZWN0IH0gZnJvbSAnLi91dGlsL2Z1bmN0aW9uJztcblxuLyoqXG4gKlxuICovXG5mdW5jdGlvbiBnZXRQcm9wc1NjaGVtYShcbiAgc2NoZW1hOiBTb2FwU2NoZW1hRGVmLFxuICBzY2hlbWFEaWN0OiB7IFtuYW1lOiBzdHJpbmddOiBTb2FwU2NoZW1hRGVmIH0sXG4pOiBTb2FwU2NoZW1hRGVmWydwcm9wcyddIHtcbiAgaWYgKHNjaGVtYS5leHRlbmRzICYmIHNjaGVtYURpY3Rbc2NoZW1hLmV4dGVuZHNdKSB7XG4gICAgY29uc3QgZXh0ZW5kU2NoZW1hID0gc2NoZW1hRGljdFtzY2hlbWEuZXh0ZW5kc107XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmdldFByb3BzU2NoZW1hKGV4dGVuZFNjaGVtYSwgc2NoZW1hRGljdCksXG4gICAgICAuLi5zY2hlbWEucHJvcHMsXG4gICAgfTtcbiAgfVxuICByZXR1cm4gc2NoZW1hLnByb3BzO1xufVxuXG5mdW5jdGlvbiBpc05pbGxWYWx1ZSh2YWx1ZTogdW5rbm93bikge1xuICByZXR1cm4gKFxuICAgIHZhbHVlID09IG51bGwgfHxcbiAgICAoaXNNYXBPYmplY3QodmFsdWUpICYmXG4gICAgICBpc01hcE9iamVjdCh2YWx1ZS4kKSAmJlxuICAgICAgdmFsdWUuJFsneHNpOm5pbCddID09PSAndHJ1ZScpXG4gICk7XG59XG5cbi8qKlxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhc3RUeXBlVXNpbmdTY2hlbWEoXG4gIHZhbHVlOiB1bmtub3duLFxuICBzY2hlbWE/OiBTb2FwU2NoZW1hIHwgU29hcFNjaGVtYURlZixcbiAgc2NoZW1hRGljdDogeyBbbmFtZTogc3RyaW5nXTogU29hcFNjaGVtYURlZiB9ID0ge30sXG4pOiBhbnkge1xuICBpZiAoQXJyYXkuaXNBcnJheShzY2hlbWEpKSB7XG4gICAgY29uc3QgbmlsbGFibGUgPSBzY2hlbWEubGVuZ3RoID09PSAyICYmIHNjaGVtYVswXSA9PT0gJz8nO1xuICAgIGNvbnN0IHNjaGVtYV8gPSBuaWxsYWJsZSA/IHNjaGVtYVsxXSA6IHNjaGVtYVswXTtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG5pbGxhYmxlID8gbnVsbCA6IFtdO1xuICAgIH1cbiAgICByZXR1cm4gKEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUgOiBbdmFsdWVdKS5tYXAoKHYpID0+XG4gICAgICBjYXN0VHlwZVVzaW5nU2NoZW1hKHYsIHNjaGVtYV8sIHNjaGVtYURpY3QpLFxuICAgICk7XG4gIH0gZWxzZSBpZiAoaXNNYXBPYmplY3Qoc2NoZW1hKSkge1xuICAgIC8vIGlmIHNjaGVtYSBpcyBTY2hlbWEgRGVmaW5pdGlvbiwgbm90IHNjaGVtYSBlbGVtZW50XG4gICAgaWYgKCd0eXBlJyBpbiBzY2hlbWEgJiYgJ3Byb3BzJyBpbiBzY2hlbWEgJiYgaXNNYXBPYmplY3Qoc2NoZW1hLnByb3BzKSkge1xuICAgICAgY29uc3QgcHJvcHMgPSBnZXRQcm9wc1NjaGVtYShzY2hlbWEgYXMgU29hcFNjaGVtYURlZiwgc2NoZW1hRGljdCk7XG4gICAgICByZXR1cm4gY2FzdFR5cGVVc2luZ1NjaGVtYSh2YWx1ZSwgcHJvcHMsIHNjaGVtYURpY3QpO1xuICAgIH1cbiAgICBjb25zdCBuaWxsYWJsZSA9ICc/JyBpbiBzY2hlbWE7XG4gICAgY29uc3Qgc2NoZW1hXyA9XG4gICAgICAnPycgaW4gc2NoZW1hID8gKHNjaGVtYVsnPyddIGFzIHsgW2tleTogc3RyaW5nXTogYW55IH0pIDogc2NoZW1hO1xuICAgIGlmIChuaWxsYWJsZSAmJiBpc05pbGxWYWx1ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBvYmogPSBpc01hcE9iamVjdCh2YWx1ZSkgPyB2YWx1ZSA6IHt9O1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhzY2hlbWFfKS5yZWR1Y2UoKG8sIGspID0+IHtcbiAgICAgIGNvbnN0IHMgPSBzY2hlbWFfW2tdO1xuICAgICAgY29uc3QgdiA9IG9ialtrXTtcbiAgICAgIGNvbnN0IG5pbGxhYmxlID1cbiAgICAgICAgKEFycmF5LmlzQXJyYXkocykgJiYgcy5sZW5ndGggPT09IDIgJiYgc1swXSA9PT0gJz8nKSB8fFxuICAgICAgICAoaXNNYXBPYmplY3QocykgJiYgJz8nIGluIHMpIHx8XG4gICAgICAgICh0eXBlb2YgcyA9PT0gJ3N0cmluZycgJiYgc1swXSA9PT0gJz8nKTtcbiAgICAgIGlmICh0eXBlb2YgdiA9PT0gJ3VuZGVmaW5lZCcgJiYgbmlsbGFibGUpIHtcbiAgICAgICAgcmV0dXJuIG87XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5vLFxuICAgICAgICBba106IGNhc3RUeXBlVXNpbmdTY2hlbWEodiwgcywgc2NoZW1hRGljdCksXG4gICAgICB9O1xuICAgIH0sIG9iaik7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgbmlsbGFibGUgPSB0eXBlb2Ygc2NoZW1hID09PSAnc3RyaW5nJyAmJiBzY2hlbWFbMF0gPT09ICc/JztcbiAgICBjb25zdCB0eXBlID1cbiAgICAgIHR5cGVvZiBzY2hlbWEgPT09ICdzdHJpbmcnXG4gICAgICAgID8gbmlsbGFibGVcbiAgICAgICAgICA/IHNjaGVtYS5zdWJzdHJpbmcoMSlcbiAgICAgICAgICA6IHNjaGVtYVxuICAgICAgICA6ICdhbnknO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgcmV0dXJuIGlzTmlsbFZhbHVlKHZhbHVlKSA/IChuaWxsYWJsZSA/IG51bGwgOiAnJykgOiBTdHJpbmcodmFsdWUpO1xuICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgcmV0dXJuIGlzTmlsbFZhbHVlKHZhbHVlKSA/IChuaWxsYWJsZSA/IG51bGwgOiAwKSA6IE51bWJlcih2YWx1ZSk7XG4gICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgcmV0dXJuIGlzTmlsbFZhbHVlKHZhbHVlKVxuICAgICAgICAgID8gbmlsbGFibGVcbiAgICAgICAgICAgID8gbnVsbFxuICAgICAgICAgICAgOiBmYWxzZVxuICAgICAgICAgIDogdmFsdWUgPT09ICd0cnVlJztcbiAgICAgIGNhc2UgJ251bGwnOlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgaWYgKHNjaGVtYURpY3RbdHlwZV0pIHtcbiAgICAgICAgICBjb25zdCBjdmFsdWUgPSBjYXN0VHlwZVVzaW5nU2NoZW1hKFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBzY2hlbWFEaWN0W3R5cGVdLFxuICAgICAgICAgICAgc2NoZW1hRGljdCxcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnN0IGlzRW1wdHkgPVxuICAgICAgICAgICAgaXNNYXBPYmplY3QoY3ZhbHVlKSAmJiBPYmplY3Qua2V5cyhjdmFsdWUpLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgICByZXR1cm4gaXNFbXB0eSAmJiBuaWxsYWJsZSA/IG51bGwgOiBjdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlIGFzIGFueTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBsb29rdXBWYWx1ZShvYmo6IHVua25vd24sIHByb3BSZWdFeHBzOiBSZWdFeHBbXSk6IHVua25vd24ge1xuICBjb25zdCByZWdleHAgPSBwcm9wUmVnRXhwcy5zaGlmdCgpO1xuICBpZiAoIXJlZ2V4cCkge1xuICAgIHJldHVybiBvYmo7XG4gIH1cbiAgaWYgKGlzTWFwT2JqZWN0KG9iaikpIHtcbiAgICBmb3IgKGNvbnN0IHByb3Agb2YgT2JqZWN0LmtleXMob2JqKSkge1xuICAgICAgaWYgKHJlZ2V4cC50ZXN0KHByb3ApKSB7XG4gICAgICAgIHJldHVybiBsb29rdXBWYWx1ZShvYmpbcHJvcF0sIHByb3BSZWdFeHBzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiB0b1hNTChuYW1lOiBvYmplY3QgfCBzdHJpbmcgfCBudWxsLCB2YWx1ZT86IGFueSk6IHN0cmluZyB7XG4gIGlmIChpc09iamVjdChuYW1lKSkge1xuICAgIHZhbHVlID0gbmFtZTtcbiAgICBuYW1lID0gbnVsbDtcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWUubWFwKCh2KSA9PiB0b1hNTChuYW1lLCB2KSkuam9pbignJyk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgYXR0cnMgPSBbXTtcbiAgICBjb25zdCBlbGVtcyA9IFtdO1xuICAgIGlmIChpc01hcE9iamVjdCh2YWx1ZSkpIHtcbiAgICAgIGZvciAoY29uc3QgayBvZiBPYmplY3Qua2V5cyh2YWx1ZSkpIHtcbiAgICAgICAgY29uc3QgdiA9IHZhbHVlW2tdO1xuICAgICAgICBpZiAoa1swXSA9PT0gJ0AnKSB7XG4gICAgICAgICAgY29uc3Qga2sgPSBrLnN1YnN0cmluZygxKTtcbiAgICAgICAgICBhdHRycy5wdXNoKGtrICsgJz1cIicgKyB2ICsgJ1wiJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWxlbXMucHVzaCh0b1hNTChrLCB2KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhbHVlID0gZWxlbXMuam9pbignJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKVxuICAgICAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgICAgICAucmVwbGFjZSgvJy9nLCAnJmFwb3M7Jyk7XG4gICAgfVxuICAgIGNvbnN0IHN0YXJ0VGFnID0gbmFtZVxuICAgICAgPyAnPCcgKyBuYW1lICsgKGF0dHJzLmxlbmd0aCA+IDAgPyAnICcgKyBhdHRycy5qb2luKCcgJykgOiAnJykgKyAnPidcbiAgICAgIDogJyc7XG4gICAgY29uc3QgZW5kVGFnID0gbmFtZSA/ICc8LycgKyBuYW1lICsgJz4nIDogJyc7XG4gICAgcmV0dXJuIHN0YXJ0VGFnICsgdmFsdWUgKyBlbmRUYWc7XG4gIH1cbn1cblxuLyoqXG4gKlxuICovXG5leHBvcnQgdHlwZSBTT0FQT3B0aW9ucyA9IHtcbiAgZW5kcG9pbnRVcmw6IHN0cmluZztcbiAgeG1sbnM/OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIENsYXNzIGZvciBTT0FQIGVuZHBvaW50IG9mIFNhbGVzZm9yY2VcbiAqXG4gKiBAcHJvdGVjdGVkXG4gKiBAY2xhc3NcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtDb25uZWN0aW9ufSBjb25uIC0gQ29ubmVjdGlvbiBpbnN0YW5jZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBTT0FQIGVuZHBvaW50IHNldHRpbmcgb3B0aW9uc1xuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMuZW5kcG9pbnRVcmwgLSBTT0FQIGVuZHBvaW50IFVSTFxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLnhtbG5zXSAtIFhNTCBuYW1lc3BhY2UgZm9yIG1ldGhvZCBjYWxsIChkZWZhdWx0IGlzIFwidXJuOnBhcnRuZXIuc29hcC5zZm9yY2UuY29tXCIpXG4gKi9cbmV4cG9ydCBjbGFzcyBTT0FQPFMgZXh0ZW5kcyBTY2hlbWE+IGV4dGVuZHMgSHR0cEFwaTxTPiB7XG4gIF9lbmRwb2ludFVybDogc3RyaW5nO1xuICBfeG1sbnM6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihjb25uOiBDb25uZWN0aW9uPFM+LCBvcHRpb25zOiBTT0FQT3B0aW9ucykge1xuICAgIHN1cGVyKGNvbm4sIG9wdGlvbnMpO1xuICAgIHRoaXMuX2VuZHBvaW50VXJsID0gb3B0aW9ucy5lbmRwb2ludFVybDtcbiAgICB0aGlzLl94bWxucyA9IG9wdGlvbnMueG1sbnMgfHwgJ3VybjpwYXJ0bmVyLnNvYXAuc2ZvcmNlLmNvbSc7XG4gIH1cblxuICAvKipcbiAgICogSW52b2tlIFNPQVAgY2FsbCB1c2luZyBtZXRob2QgYW5kIGFyZ3VtZW50c1xuICAgKi9cbiAgYXN5bmMgaW52b2tlKFxuICAgIG1ldGhvZDogc3RyaW5nLFxuICAgIGFyZ3M6IG9iamVjdCxcbiAgICBzY2hlbWE/OiBTb2FwU2NoZW1hIHwgU29hcFNjaGVtYURlZixcbiAgICBzY2hlbWFEaWN0PzogeyBbbmFtZTogc3RyaW5nXTogU29hcFNjaGVtYURlZiB9LFxuICApIHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLnJlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICB1cmw6IHRoaXMuX2VuZHBvaW50VXJsLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ3RleHQveG1sJyxcbiAgICAgICAgU09BUEFjdGlvbjogJ1wiXCInLFxuICAgICAgfSxcbiAgICAgIF9tZXNzYWdlOiB7IFttZXRob2RdOiBhcmdzIH0sXG4gICAgfSBhcyBIdHRwUmVxdWVzdCk7XG4gICAgcmV0dXJuIHNjaGVtYSA/IGNhc3RUeXBlVXNpbmdTY2hlbWEocmVzLCBzY2hlbWEsIHNjaGVtYURpY3QpIDogcmVzO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBiZWZvcmVTZW5kKHJlcXVlc3Q6IEh0dHBSZXF1ZXN0ICYgeyBfbWVzc2FnZTogb2JqZWN0IH0pIHtcbiAgICByZXF1ZXN0LmJvZHkgPSB0aGlzLl9jcmVhdGVFbnZlbG9wZShyZXF1ZXN0Ll9tZXNzYWdlKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKiovXG4gIGlzU2Vzc2lvbkV4cGlyZWQocmVzcG9uc2U6IEh0dHBSZXNwb25zZSkge1xuICAgIHJldHVybiAoXG4gICAgICByZXNwb25zZS5zdGF0dXNDb2RlID09PSA1MDAgJiZcbiAgICAgIC88ZmF1bHRjb2RlPlthLXpBLVpdKzpJTlZBTElEX1NFU1NJT05fSUQ8XFwvZmF1bHRjb2RlPi8udGVzdChyZXNwb25zZS5ib2R5KVxuICAgICk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICoqL1xuICBwYXJzZUVycm9yKGJvZHk6IHN0cmluZykge1xuICAgIGNvbnN0IGVycm9yID0gbG9va3VwVmFsdWUoYm9keSwgWy86RW52ZWxvcGUkLywgLzpCb2R5JC8sIC86RmF1bHQkL10pIGFzIHtcbiAgICAgIFtuYW1lOiBzdHJpbmddOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgfTtcbiAgICByZXR1cm4ge1xuICAgICAgZXJyb3JDb2RlOiBlcnJvci5mYXVsdGNvZGUsXG4gICAgICBtZXNzYWdlOiBlcnJvci5mYXVsdHN0cmluZyxcbiAgICB9O1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqKi9cbiAgYXN5bmMgZ2V0UmVzcG9uc2VCb2R5KHJlc3BvbnNlOiBIdHRwUmVzcG9uc2UpIHtcbiAgICBjb25zdCBib2R5ID0gYXdhaXQgc3VwZXIuZ2V0UmVzcG9uc2VCb2R5KHJlc3BvbnNlKTtcbiAgICByZXR1cm4gbG9va3VwVmFsdWUoYm9keSwgWy86RW52ZWxvcGUkLywgLzpCb2R5JC8sIC8uKy9dKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2NyZWF0ZUVudmVsb3BlKG1lc3NhZ2U6IG9iamVjdCkge1xuICAgIGNvbnN0IGhlYWRlcjogeyBbbmFtZTogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgICBjb25zdCBjb25uID0gdGhpcy5fY29ubjtcbiAgICBpZiAoY29ubi5hY2Nlc3NUb2tlbikge1xuICAgICAgaGVhZGVyLlNlc3Npb25IZWFkZXIgPSB7IHNlc3Npb25JZDogY29ubi5hY2Nlc3NUb2tlbiB9O1xuICAgIH1cbiAgICBpZiAoY29ubi5fY2FsbE9wdGlvbnMpIHtcbiAgICAgIGhlYWRlci5DYWxsT3B0aW9ucyA9IGNvbm4uX2NhbGxPcHRpb25zO1xuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAgJzw/eG1sIHZlcnNpb249XCIxLjBcIiBlbmNvZGluZz1cIlVURi04XCI/PicsXG4gICAgICAnPHNvYXBlbnY6RW52ZWxvcGUgeG1sbnM6c29hcGVudj1cImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3NvYXAvZW52ZWxvcGUvXCInLFxuICAgICAgJyB4bWxuczp4c2Q9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYVwiJyxcbiAgICAgICcgeG1sbnM6eHNpPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2VcIj4nLFxuICAgICAgJzxzb2FwZW52OkhlYWRlciB4bWxucz1cIicgKyB0aGlzLl94bWxucyArICdcIj4nLFxuICAgICAgdG9YTUwoaGVhZGVyKSxcbiAgICAgICc8L3NvYXBlbnY6SGVhZGVyPicsXG4gICAgICAnPHNvYXBlbnY6Qm9keSB4bWxucz1cIicgKyB0aGlzLl94bWxucyArICdcIj4nLFxuICAgICAgdG9YTUwobWVzc2FnZSksXG4gICAgICAnPC9zb2FwZW52OkJvZHk+JyxcbiAgICAgICc8L3NvYXBlbnY6RW52ZWxvcGU+JyxcbiAgICBdLmpvaW4oJycpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNPQVA7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJQTs7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