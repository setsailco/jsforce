"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.createSOQL = createSOQL;

var _values = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/values"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys"));

var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/entries"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/filter"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/includes"));

var _sort2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/sort"));

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

require("core-js/modules/es.array.iterator.js");

var _date = _interopRequireDefault(require("./date"));

/**
 * @file Create and build SOQL string from configuration
 * @author Shinichi Tomita <shinichi.tomita@gmail.com>
 */

/** @private **/
function escapeSOQLString(str) {
  return String(str || '').replace(/'/g, "\\'");
}
/** @private **/


function createFieldsClause(fields, childQueries = {}) {
  const cqueries = (0, _values.default)(childQueries); // eslint-disable-next-line no-use-before-define

  return [...(fields || ['Id']), ...(0, _map.default)(cqueries).call(cqueries, cquery => `(${createSOQL(cquery)})`)].join(', ');
}
/** @private **/


function createValueExpression(value) {
  if ((0, _isArray.default)(value)) {
    return value.length > 0 ? `(${(0, _map.default)(value).call(value, createValueExpression).join(', ')})` : undefined;
  }

  if (value instanceof _date.default) {
    return value.toString();
  }

  if (typeof value === 'string') {
    return `'${escapeSOQLString(value)}'`;
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (value === null) {
    return 'null';
  }

  return value;
}

const opMap = {
  '=': '=',
  $eq: '=',
  '!=': '!=',
  $ne: '!=',
  '>': '>',
  $gt: '>',
  '<': '<',
  $lt: '<',
  '>=': '>=',
  $gte: '>=',
  '<=': '<=',
  $lte: '<=',
  $like: 'LIKE',
  $nlike: 'NOT LIKE',
  $in: 'IN',
  $nin: 'NOT IN',
  $includes: 'INCLUDES',
  $excludes: 'EXCLUDES',
  $exists: 'EXISTS'
};
/** @private **/

function createFieldExpression(field, value) {
  let op = '$eq';
  let _value = value; // Assume the `$in` operator if value is an array and none was supplied.

  if ((0, _isArray.default)(value)) {
    op = '$in';
  } else if (typeof value === 'object' && value !== null) {
    // Otherwise, if an object was passed then process the supplied ops.
    for (const k of (0, _keys.default)(value)) {
      if (k[0] === '$') {
        op = k;
        _value = value[k];
        break;
      }
    }
  }

  const sfop = opMap[op];

  if (!sfop || typeof _value === 'undefined') {
    return null;
  }

  const valueExpr = createValueExpression(_value);

  if (typeof valueExpr === 'undefined') {
    return null;
  }

  switch (sfop) {
    case 'NOT LIKE':
      return `(${['NOT', field, 'LIKE', valueExpr].join(' ')})`;

    case 'EXISTS':
      return [field, _value ? '!=' : '=', 'null'].join(' ');

    default:
      return [field, sfop, valueExpr].join(' ');
  }
}
/** @private **/


function createOrderByClause(sort = []) {
  let _sort = [];

  if (typeof sort === 'string') {
    var _context;

    if (/,|\s+(asc|desc)\s*$/.test(sort)) {
      // must be specified in pure "order by" clause. Return raw config.
      return sort;
    } // sort order in mongoose-style expression.
    // e.g. "FieldA -FieldB" => "ORDER BY FieldA ASC, FieldB DESC"


    _sort = (0, _map.default)(_context = sort.split(/\s+/)).call(_context, field => {
      let dir = 'ASC'; // ascending

      const flag = field[0];

      if (flag === '-') {
        dir = 'DESC';
        field = field.substring(1); // eslint-disable-line no-param-reassign
      } else if (flag === '+') {
        field = field.substring(1); // eslint-disable-line no-param-reassign
      }

      return [field, dir];
    });
  } else if ((0, _isArray.default)(sort)) {
    _sort = sort;
  } else {
    var _context2;

    _sort = (0, _map.default)(_context2 = (0, _entries.default)(sort)).call(_context2, ([field, dir]) => [field, dir]);
  }

  return (0, _map.default)(_sort).call(_sort, ([field, dir]) => {
    /* eslint-disable no-param-reassign */
    switch (String(dir)) {
      case 'DESC':
      case 'desc':
      case 'descending':
      case '-':
      case '-1':
        dir = 'DESC';
        break;

      default:
        dir = 'ASC';
    }

    return `${field} ${dir}`;
  }).join(', ');
}

/** @private **/
function createConditionClause(conditions = {}, operator = 'AND', depth = 0) {
  var _context5;

  if (typeof conditions === 'string') {
    return conditions;
  }

  let conditionList = [];

  if (!(0, _isArray.default)(conditions)) {
    var _context3;

    // if passed in hash object
    const conditionsMap = conditions;
    conditionList = (0, _map.default)(_context3 = (0, _keys.default)(conditionsMap)).call(_context3, key => ({
      key,
      value: conditionsMap[key]
    }));
  } else {
    conditionList = (0, _map.default)(conditions).call(conditions, cond => {
      var _context4;

      const conds = (0, _map.default)(_context4 = (0, _keys.default)(cond)).call(_context4, key => ({
        key,
        value: cond[key]
      }));
      return conds.length > 1 ? {
        key: '$and',
        value: (0, _map.default)(conds).call(conds, c => ({
          [c.key]: c.value
        }))
      } : conds[0];
    });
  }

  const conditionClauses = (0, _filter.default)(_context5 = (0, _map.default)(conditionList).call(conditionList, cond => {
    let d = depth + 1;
    let op;

    switch (cond.key) {
      case '$or':
      case '$and':
      case '$not':
        if (operator !== 'NOT' && conditionList.length === 1) {
          d = depth; // not change tree depth
        }

        op = cond.key === '$or' ? 'OR' : cond.key === '$and' ? 'AND' : 'NOT';
        return createConditionClause(cond.value, op, d);

      default:
        return createFieldExpression(cond.key, cond.value);
    }
  })).call(_context5, expr => expr);
  let hasParen;

  if (operator === 'NOT') {
    hasParen = depth > 0;
    return `${hasParen ? '(' : ''}NOT ${conditionClauses[0]}${hasParen ? ')' : ''}`;
  }

  hasParen = depth > 0 && conditionClauses.length > 1;
  return (hasParen ? '(' : '') + conditionClauses.join(` ${operator} `) + (hasParen ? ')' : '');
}
/**
 * Create SOQL
 * @private
 */


function createSOQL(query) {
  let soql = ['SELECT ', createFieldsClause(query.fields, (0, _includes.default)(query)), ' FROM ', query.table].join('');
  const cond = createConditionClause(query.conditions);

  if (cond) {
    soql += ` WHERE ${cond}`;
  }

  const orderby = createOrderByClause((0, _sort2.default)(query));

  if (orderby) {
    soql += ` ORDER BY ${orderby}`;
  }

  if (query.limit) {
    soql += ` LIMIT ${query.limit}`;
  }

  if (query.offset) {
    soql += ` OFFSET ${query.offset}`;
  }

  return soql;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJlc2NhcGVTT1FMU3RyaW5nIiwic3RyIiwiU3RyaW5nIiwicmVwbGFjZSIsImNyZWF0ZUZpZWxkc0NsYXVzZSIsImZpZWxkcyIsImNoaWxkUXVlcmllcyIsImNxdWVyaWVzIiwiY3F1ZXJ5IiwiY3JlYXRlU09RTCIsImpvaW4iLCJjcmVhdGVWYWx1ZUV4cHJlc3Npb24iLCJ2YWx1ZSIsImxlbmd0aCIsInVuZGVmaW5lZCIsIlNmRGF0ZSIsInRvU3RyaW5nIiwib3BNYXAiLCIkZXEiLCIkbmUiLCIkZ3QiLCIkbHQiLCIkZ3RlIiwiJGx0ZSIsIiRsaWtlIiwiJG5saWtlIiwiJGluIiwiJG5pbiIsIiRpbmNsdWRlcyIsIiRleGNsdWRlcyIsIiRleGlzdHMiLCJjcmVhdGVGaWVsZEV4cHJlc3Npb24iLCJmaWVsZCIsIm9wIiwiX3ZhbHVlIiwiayIsInNmb3AiLCJ2YWx1ZUV4cHIiLCJjcmVhdGVPcmRlckJ5Q2xhdXNlIiwic29ydCIsIl9zb3J0IiwidGVzdCIsInNwbGl0IiwiZGlyIiwiZmxhZyIsInN1YnN0cmluZyIsImNyZWF0ZUNvbmRpdGlvbkNsYXVzZSIsImNvbmRpdGlvbnMiLCJvcGVyYXRvciIsImRlcHRoIiwiY29uZGl0aW9uTGlzdCIsImNvbmRpdGlvbnNNYXAiLCJrZXkiLCJjb25kIiwiY29uZHMiLCJjIiwiY29uZGl0aW9uQ2xhdXNlcyIsImQiLCJleHByIiwiaGFzUGFyZW4iLCJxdWVyeSIsInNvcWwiLCJ0YWJsZSIsIm9yZGVyYnkiLCJsaW1pdCIsIm9mZnNldCJdLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3FsLWJ1aWxkZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBDcmVhdGUgYW5kIGJ1aWxkIFNPUUwgc3RyaW5nIGZyb20gY29uZmlndXJhdGlvblxuICogQGF1dGhvciBTaGluaWNoaSBUb21pdGEgPHNoaW5pY2hpLnRvbWl0YUBnbWFpbC5jb20+XG4gKi9cbmltcG9ydCBTZkRhdGUgZnJvbSAnLi9kYXRlJztcbmltcG9ydCB7IE9wdGlvbmFsIH0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCB0eXBlIENvbmRpdGlvbiA9XG4gIHwgc3RyaW5nXG4gIHwgeyBbZmllbGQ6IHN0cmluZ106IGFueSB9XG4gIHwgQXJyYXk8eyBbZmllbGQ6IHN0cmluZ106IGFueSB9PjtcblxuZXhwb3J0IHR5cGUgU29ydERpciA9ICdBU0MnIHwgJ0RFU0MnIHwgJ2FzYycgfCAnZGVzYycgfCAxIHwgLTE7XG5cbmV4cG9ydCB0eXBlIFNvcnQgPVxuICB8IHN0cmluZ1xuICB8IEFycmF5PFtzdHJpbmcsIFNvcnREaXJdPlxuICB8IHsgW2ZpZWxkOiBzdHJpbmddOiBTb3J0RGlyIH07XG5cbmV4cG9ydCB0eXBlIFF1ZXJ5Q29uZmlnID0ge1xuICBmaWVsZHM/OiBzdHJpbmdbXTtcbiAgaW5jbHVkZXM/OiB7IFtmaWVsZDogc3RyaW5nXTogUXVlcnlDb25maWcgfTtcbiAgdGFibGU/OiBzdHJpbmc7XG4gIGNvbmRpdGlvbnM/OiBDb25kaXRpb247XG4gIHNvcnQ/OiBTb3J0O1xuICBsaW1pdD86IG51bWJlcjtcbiAgb2Zmc2V0PzogbnVtYmVyO1xufTtcblxuLyoqIEBwcml2YXRlICoqL1xuZnVuY3Rpb24gZXNjYXBlU09RTFN0cmluZyhzdHI6IE9wdGlvbmFsPHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4+KSB7XG4gIHJldHVybiBTdHJpbmcoc3RyIHx8ICcnKS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIik7XG59XG5cbi8qKiBAcHJpdmF0ZSAqKi9cbmZ1bmN0aW9uIGNyZWF0ZUZpZWxkc0NsYXVzZShcbiAgZmllbGRzPzogc3RyaW5nW10sXG4gIGNoaWxkUXVlcmllczogeyBbbmFtZTogc3RyaW5nXTogUXVlcnlDb25maWcgfSA9IHt9LFxuKTogc3RyaW5nIHtcbiAgY29uc3QgY3F1ZXJpZXM6IFF1ZXJ5Q29uZmlnW10gPSAoT2JqZWN0LnZhbHVlcyhcbiAgICBjaGlsZFF1ZXJpZXMsXG4gICkgYXMgYW55KSBhcyBRdWVyeUNvbmZpZ1tdO1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlLWJlZm9yZS1kZWZpbmVcbiAgcmV0dXJuIFtcbiAgICAuLi4oZmllbGRzIHx8IFsnSWQnXSksXG4gICAgLi4uY3F1ZXJpZXMubWFwKChjcXVlcnkpID0+IGAoJHtjcmVhdGVTT1FMKGNxdWVyeSl9KWApLFxuICBdLmpvaW4oJywgJyk7XG59XG5cbi8qKiBAcHJpdmF0ZSAqKi9cbmZ1bmN0aW9uIGNyZWF0ZVZhbHVlRXhwcmVzc2lvbih2YWx1ZTogYW55KTogT3B0aW9uYWw8c3RyaW5nPiB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPiAwXG4gICAgICA/IGAoJHt2YWx1ZS5tYXAoY3JlYXRlVmFsdWVFeHByZXNzaW9uKS5qb2luKCcsICcpfSlgXG4gICAgICA6IHVuZGVmaW5lZDtcbiAgfVxuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBTZkRhdGUpIHtcbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBgJyR7ZXNjYXBlU09RTFN0cmluZyh2YWx1ZSl9J2A7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgfVxuICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gJ251bGwnO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuY29uc3Qgb3BNYXA6IHsgW29wOiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcbiAgJz0nOiAnPScsXG4gICRlcTogJz0nLFxuICAnIT0nOiAnIT0nLFxuICAkbmU6ICchPScsXG4gICc+JzogJz4nLFxuICAkZ3Q6ICc+JyxcbiAgJzwnOiAnPCcsXG4gICRsdDogJzwnLFxuICAnPj0nOiAnPj0nLFxuICAkZ3RlOiAnPj0nLFxuICAnPD0nOiAnPD0nLFxuICAkbHRlOiAnPD0nLFxuICAkbGlrZTogJ0xJS0UnLFxuICAkbmxpa2U6ICdOT1QgTElLRScsXG4gICRpbjogJ0lOJyxcbiAgJG5pbjogJ05PVCBJTicsXG4gICRpbmNsdWRlczogJ0lOQ0xVREVTJyxcbiAgJGV4Y2x1ZGVzOiAnRVhDTFVERVMnLFxuICAkZXhpc3RzOiAnRVhJU1RTJyxcbn07XG5cbi8qKiBAcHJpdmF0ZSAqKi9cbmZ1bmN0aW9uIGNyZWF0ZUZpZWxkRXhwcmVzc2lvbihmaWVsZDogc3RyaW5nLCB2YWx1ZTogYW55KTogT3B0aW9uYWw8c3RyaW5nPiB7XG4gIGxldCBvcCA9ICckZXEnO1xuICBsZXQgX3ZhbHVlID0gdmFsdWU7XG5cbiAgLy8gQXNzdW1lIHRoZSBgJGluYCBvcGVyYXRvciBpZiB2YWx1ZSBpcyBhbiBhcnJheSBhbmQgbm9uZSB3YXMgc3VwcGxpZWQuXG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIG9wID0gJyRpbic7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgIC8vIE90aGVyd2lzZSwgaWYgYW4gb2JqZWN0IHdhcyBwYXNzZWQgdGhlbiBwcm9jZXNzIHRoZSBzdXBwbGllZCBvcHMuXG4gICAgZm9yIChjb25zdCBrIG9mIE9iamVjdC5rZXlzKHZhbHVlKSkge1xuICAgICAgaWYgKGtbMF0gPT09ICckJykge1xuICAgICAgICBvcCA9IGs7XG4gICAgICAgIF92YWx1ZSA9IHZhbHVlW2tdO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgY29uc3Qgc2ZvcCA9IG9wTWFwW29wXTtcbiAgaWYgKCFzZm9wIHx8IHR5cGVvZiBfdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgdmFsdWVFeHByID0gY3JlYXRlVmFsdWVFeHByZXNzaW9uKF92YWx1ZSk7XG4gIGlmICh0eXBlb2YgdmFsdWVFeHByID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHN3aXRjaCAoc2ZvcCkge1xuICAgIGNhc2UgJ05PVCBMSUtFJzpcbiAgICAgIHJldHVybiBgKCR7WydOT1QnLCBmaWVsZCwgJ0xJS0UnLCB2YWx1ZUV4cHJdLmpvaW4oJyAnKX0pYDtcbiAgICBjYXNlICdFWElTVFMnOlxuICAgICAgcmV0dXJuIFtmaWVsZCwgX3ZhbHVlID8gJyE9JyA6ICc9JywgJ251bGwnXS5qb2luKCcgJyk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBbZmllbGQsIHNmb3AsIHZhbHVlRXhwcl0uam9pbignICcpO1xuICB9XG59XG5cbi8qKiBAcHJpdmF0ZSAqKi9cbmZ1bmN0aW9uIGNyZWF0ZU9yZGVyQnlDbGF1c2Uoc29ydDogU29ydCA9IFtdKTogc3RyaW5nIHtcbiAgbGV0IF9zb3J0OiBBcnJheTxbc3RyaW5nLCBTb3J0RGlyXT4gPSBbXTtcbiAgaWYgKHR5cGVvZiBzb3J0ID09PSAnc3RyaW5nJykge1xuICAgIGlmICgvLHxcXHMrKGFzY3xkZXNjKVxccyokLy50ZXN0KHNvcnQpKSB7XG4gICAgICAvLyBtdXN0IGJlIHNwZWNpZmllZCBpbiBwdXJlIFwib3JkZXIgYnlcIiBjbGF1c2UuIFJldHVybiByYXcgY29uZmlnLlxuICAgICAgcmV0dXJuIHNvcnQ7XG4gICAgfVxuICAgIC8vIHNvcnQgb3JkZXIgaW4gbW9uZ29vc2Utc3R5bGUgZXhwcmVzc2lvbi5cbiAgICAvLyBlLmcuIFwiRmllbGRBIC1GaWVsZEJcIiA9PiBcIk9SREVSIEJZIEZpZWxkQSBBU0MsIEZpZWxkQiBERVNDXCJcbiAgICBfc29ydCA9IHNvcnQuc3BsaXQoL1xccysvKS5tYXAoKGZpZWxkKSA9PiB7XG4gICAgICBsZXQgZGlyOiBTb3J0RGlyID0gJ0FTQyc7IC8vIGFzY2VuZGluZ1xuICAgICAgY29uc3QgZmxhZyA9IGZpZWxkWzBdO1xuICAgICAgaWYgKGZsYWcgPT09ICctJykge1xuICAgICAgICBkaXIgPSAnREVTQyc7XG4gICAgICAgIGZpZWxkID0gZmllbGQuc3Vic3RyaW5nKDEpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgICB9IGVsc2UgaWYgKGZsYWcgPT09ICcrJykge1xuICAgICAgICBmaWVsZCA9IGZpZWxkLnN1YnN0cmluZygxKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgfVxuICAgICAgcmV0dXJuIFtmaWVsZCwgZGlyXSBhcyBbc3RyaW5nLCBTb3J0RGlyXTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHNvcnQpKSB7XG4gICAgX3NvcnQgPSBzb3J0O1xuICB9IGVsc2Uge1xuICAgIF9zb3J0ID0gT2JqZWN0LmVudHJpZXMoc29ydCkubWFwKFxuICAgICAgKFtmaWVsZCwgZGlyXSkgPT4gW2ZpZWxkLCBkaXJdIGFzIFtzdHJpbmcsIFNvcnREaXJdLFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIF9zb3J0XG4gICAgLm1hcCgoW2ZpZWxkLCBkaXJdKSA9PiB7XG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1wYXJhbS1yZWFzc2lnbiAqL1xuICAgICAgc3dpdGNoIChTdHJpbmcoZGlyKSkge1xuICAgICAgICBjYXNlICdERVNDJzpcbiAgICAgICAgY2FzZSAnZGVzYyc6XG4gICAgICAgIGNhc2UgJ2Rlc2NlbmRpbmcnOlxuICAgICAgICBjYXNlICctJzpcbiAgICAgICAgY2FzZSAnLTEnOlxuICAgICAgICAgIGRpciA9ICdERVNDJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBkaXIgPSAnQVNDJztcbiAgICAgIH1cbiAgICAgIHJldHVybiBgJHtmaWVsZH0gJHtkaXJ9YDtcbiAgICB9KVxuICAgIC5qb2luKCcsICcpO1xufVxuXG50eXBlIExvZ2ljYWxPcGVyYXRvciA9ICdBTkQnIHwgJ09SJyB8ICdOT1QnO1xuXG4vKiogQHByaXZhdGUgKiovXG5mdW5jdGlvbiBjcmVhdGVDb25kaXRpb25DbGF1c2UoXG4gIGNvbmRpdGlvbnM6IENvbmRpdGlvbiA9IHt9LFxuICBvcGVyYXRvcjogTG9naWNhbE9wZXJhdG9yID0gJ0FORCcsXG4gIGRlcHRoOiBudW1iZXIgPSAwLFxuKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiBjb25kaXRpb25zID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBjb25kaXRpb25zO1xuICB9XG4gIGxldCBjb25kaXRpb25MaXN0OiBBcnJheTx7IGtleTogc3RyaW5nOyB2YWx1ZTogQ29uZGl0aW9uIH0+ID0gW107XG4gIGlmICghQXJyYXkuaXNBcnJheShjb25kaXRpb25zKSkge1xuICAgIC8vIGlmIHBhc3NlZCBpbiBoYXNoIG9iamVjdFxuICAgIGNvbnN0IGNvbmRpdGlvbnNNYXAgPSBjb25kaXRpb25zO1xuICAgIGNvbmRpdGlvbkxpc3QgPSBPYmplY3Qua2V5cyhjb25kaXRpb25zTWFwKS5tYXAoKGtleSkgPT4gKHtcbiAgICAgIGtleSxcbiAgICAgIHZhbHVlOiBjb25kaXRpb25zTWFwW2tleV0sXG4gICAgfSkpO1xuICB9IGVsc2Uge1xuICAgIGNvbmRpdGlvbkxpc3QgPSBjb25kaXRpb25zLm1hcCgoY29uZCkgPT4ge1xuICAgICAgY29uc3QgY29uZHMgPSBPYmplY3Qua2V5cyhjb25kKS5tYXAoKGtleSkgPT4gKHsga2V5LCB2YWx1ZTogY29uZFtrZXldIH0pKTtcbiAgICAgIHJldHVybiBjb25kcy5sZW5ndGggPiAxXG4gICAgICAgID8geyBrZXk6ICckYW5kJywgdmFsdWU6IGNvbmRzLm1hcCgoYykgPT4gKHsgW2Mua2V5XTogYy52YWx1ZSB9KSkgfVxuICAgICAgICA6IGNvbmRzWzBdO1xuICAgIH0pO1xuICB9XG4gIGNvbnN0IGNvbmRpdGlvbkNsYXVzZXMgPSAoY29uZGl0aW9uTGlzdFxuICAgIC5tYXAoKGNvbmQpID0+IHtcbiAgICAgIGxldCBkID0gZGVwdGggKyAxO1xuICAgICAgbGV0IG9wOiBPcHRpb25hbDxMb2dpY2FsT3BlcmF0b3I+O1xuICAgICAgc3dpdGNoIChjb25kLmtleSkge1xuICAgICAgICBjYXNlICckb3InOlxuICAgICAgICBjYXNlICckYW5kJzpcbiAgICAgICAgY2FzZSAnJG5vdCc6XG4gICAgICAgICAgaWYgKG9wZXJhdG9yICE9PSAnTk9UJyAmJiBjb25kaXRpb25MaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgZCA9IGRlcHRoOyAvLyBub3QgY2hhbmdlIHRyZWUgZGVwdGhcbiAgICAgICAgICB9XG4gICAgICAgICAgb3AgPSBjb25kLmtleSA9PT0gJyRvcicgPyAnT1InIDogY29uZC5rZXkgPT09ICckYW5kJyA/ICdBTkQnIDogJ05PVCc7XG4gICAgICAgICAgcmV0dXJuIGNyZWF0ZUNvbmRpdGlvbkNsYXVzZShjb25kLnZhbHVlLCBvcCwgZCk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIGNyZWF0ZUZpZWxkRXhwcmVzc2lvbihjb25kLmtleSwgY29uZC52YWx1ZSk7XG4gICAgICB9XG4gICAgfSlcbiAgICAuZmlsdGVyKChleHByKSA9PiBleHByKSBhcyBhbnkpIGFzIHN0cmluZ1tdO1xuXG4gIGxldCBoYXNQYXJlbjogYm9vbGVhbjtcbiAgaWYgKG9wZXJhdG9yID09PSAnTk9UJykge1xuICAgIGhhc1BhcmVuID0gZGVwdGggPiAwO1xuICAgIHJldHVybiBgJHtoYXNQYXJlbiA/ICcoJyA6ICcnfU5PVCAke2NvbmRpdGlvbkNsYXVzZXNbMF19JHtcbiAgICAgIGhhc1BhcmVuID8gJyknIDogJydcbiAgICB9YDtcbiAgfVxuICBoYXNQYXJlbiA9IGRlcHRoID4gMCAmJiBjb25kaXRpb25DbGF1c2VzLmxlbmd0aCA+IDE7XG4gIHJldHVybiAoXG4gICAgKGhhc1BhcmVuID8gJygnIDogJycpICtcbiAgICBjb25kaXRpb25DbGF1c2VzLmpvaW4oYCAke29wZXJhdG9yfSBgKSArXG4gICAgKGhhc1BhcmVuID8gJyknIDogJycpXG4gICk7XG59XG5cbi8qKlxuICogQ3JlYXRlIFNPUUxcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTT1FMKHF1ZXJ5OiBRdWVyeUNvbmZpZyk6IHN0cmluZyB7XG4gIGxldCBzb3FsID0gW1xuICAgICdTRUxFQ1QgJyxcbiAgICBjcmVhdGVGaWVsZHNDbGF1c2UocXVlcnkuZmllbGRzLCBxdWVyeS5pbmNsdWRlcyksXG4gICAgJyBGUk9NICcsXG4gICAgcXVlcnkudGFibGUsXG4gIF0uam9pbignJyk7XG4gIGNvbnN0IGNvbmQgPSBjcmVhdGVDb25kaXRpb25DbGF1c2UocXVlcnkuY29uZGl0aW9ucyk7XG4gIGlmIChjb25kKSB7XG4gICAgc29xbCArPSBgIFdIRVJFICR7Y29uZH1gO1xuICB9XG4gIGNvbnN0IG9yZGVyYnkgPSBjcmVhdGVPcmRlckJ5Q2xhdXNlKHF1ZXJ5LnNvcnQpO1xuICBpZiAob3JkZXJieSkge1xuICAgIHNvcWwgKz0gYCBPUkRFUiBCWSAke29yZGVyYnl9YDtcbiAgfVxuICBpZiAocXVlcnkubGltaXQpIHtcbiAgICBzb3FsICs9IGAgTElNSVQgJHtxdWVyeS5saW1pdH1gO1xuICB9XG4gIGlmIChxdWVyeS5vZmZzZXQpIHtcbiAgICBzb3FsICs9IGAgT0ZGU0VUICR7cXVlcnkub2Zmc2V0fWA7XG4gIH1cbiAgcmV0dXJuIHNvcWw7XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJQTs7QUFKQTtBQUNBO0FBQ0E7QUFDQTs7QUEwQkE7QUFDQSxTQUFTQSxnQkFBVCxDQUEwQkMsR0FBMUIsRUFBb0U7RUFDbEUsT0FBT0MsTUFBTSxDQUFDRCxHQUFHLElBQUksRUFBUixDQUFOLENBQWtCRSxPQUFsQixDQUEwQixJQUExQixFQUFnQyxLQUFoQyxDQUFQO0FBQ0Q7QUFFRDs7O0FBQ0EsU0FBU0Msa0JBQVQsQ0FDRUMsTUFERixFQUVFQyxZQUE2QyxHQUFHLEVBRmxELEVBR1U7RUFDUixNQUFNQyxRQUF1QixHQUFJLHFCQUMvQkQsWUFE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