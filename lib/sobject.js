"use strict";

var _Object$keys = require("@babel/runtime-corejs3/core-js-stable/object/keys");

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

exports.default = exports.SObject = void 0;

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/includes"));

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/find"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectWithoutProperties"));

require("core-js/modules/es.promise.js");

require("core-js/modules/es.array.sort.js");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _logger = require("./util/logger");

var _recordReference = _interopRequireDefault(require("./record-reference"));

var _query = _interopRequireWildcard(require("./query"));

var _quickAction = _interopRequireDefault(require("./quick-action"));

const _excluded = ["sort", "limit", "offset"];

function _getRequireWildcardCache(nodeInterop) { if (typeof _WeakMap !== "function") return null; var cacheBabelInterop = new _WeakMap(); var cacheNodeInterop = new _WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = _Object$defineProperty && _Object$getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? _Object$getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { _Object$defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = _Object$keys(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var _context4, _context5; var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? _forEachInstanceProperty(_context4 = ownKeys(Object(source), !0)).call(_context4, function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : _forEachInstanceProperty(_context5 = ownKeys(Object(source))).call(_context5, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * A class for organizing all SObject access
 */
class SObject {
  // layouts: (ln?: string) => Promise<DescribeLayoutResult>;
  // compactLayouts: () => Promise<DescribeCompactLayoutsResult>;
  // approvalLayouts: () => Promise<DescribeApprovalLayoutsResult>;

  /**
   *
   */
  constructor(conn, type) {
    (0, _defineProperty2.default)(this, "type", void 0);
    (0, _defineProperty2.default)(this, "_conn", void 0);
    (0, _defineProperty2.default)(this, "_logger", void 0);
    (0, _defineProperty2.default)(this, "layouts$", void 0);
    (0, _defineProperty2.default)(this, "layouts$$", void 0);
    (0, _defineProperty2.default)(this, "compactLayouts$", void 0);
    (0, _defineProperty2.default)(this, "compactLayouts$$", void 0);
    (0, _defineProperty2.default)(this, "approvalLayouts$", void 0);
    (0, _defineProperty2.default)(this, "approvalLayouts$$", void 0);
    (0, _defineProperty2.default)(this, "insert", this.create);
    (0, _defineProperty2.default)(this, "delete", this.destroy);
    (0, _defineProperty2.default)(this, "del", this.destroy);
    (0, _defineProperty2.default)(this, "insertBulk", this.createBulk);
    (0, _defineProperty2.default)(this, "deleteBulk", this.destroyBulk);
    (0, _defineProperty2.default)(this, "deleteHardBulk", this.destroyHardBulk);
    this.type = type;
    this._conn = conn;
    this._logger = conn._logLevel ? SObject._logger.createInstance(conn._logLevel) : SObject._logger;
    const cache = this._conn.cache;

    const layoutCacheKey = layoutName => layoutName ? `layouts.namedLayouts.${layoutName}` : `layouts.${this.type}`;

    const layouts = SObject.prototype.layouts;
    this.layouts = cache.createCachedFunction(layouts, this, {
      key: layoutCacheKey,
      strategy: 'NOCACHE'
    });
    this.layouts$ = cache.createCachedFunction(layouts, this, {
      key: layoutCacheKey,
      strategy: 'HIT'
    });
    this.layouts$$ = cache.createCachedFunction(layouts, this, {
      key: layoutCacheKey,
      strategy: 'IMMEDIATE'
    });
    const compactLayoutCacheKey = `compactLayouts.${this.type}`;
    const compactLayouts = SObject.prototype.compactLayouts;
    this.compactLayouts = cache.createCachedFunction(compactLayouts, this, {
      key: compactLayoutCacheKey,
      strategy: 'NOCACHE'
    });
    this.compactLayouts$ = cache.createCachedFunction(compactLayouts, this, {
      key: compactLayoutCacheKey,
      strategy: 'HIT'
    });
    this.compactLayouts$$ = cache.createCachedFunction(compactLayouts, this, {
      key: compactLayoutCacheKey,
      strategy: 'IMMEDIATE'
    });
    const approvalLayoutCacheKey = `approvalLayouts.${this.type}`;
    const approvalLayouts = SObject.prototype.approvalLayouts;
    this.approvalLayouts = cache.createCachedFunction(approvalLayouts, this, {
      key: approvalLayoutCacheKey,
      strategy: 'NOCACHE'
    });
    this.approvalLayouts$ = cache.createCachedFunction(approvalLayouts, this, {
      key: approvalLayoutCacheKey,
      strategy: 'HIT'
    });
    this.approvalLayouts$$ = cache.createCachedFunction(approvalLayouts, this, {
      key: approvalLayoutCacheKey,
      strategy: 'IMMEDIATE'
    });
  }
  /**
   * Create records
   */


  create(records, options) {
    return this._conn.create(this.type, records, options);
  }
  /**
   * Synonym of SObject#create()
   */


  retrieve(ids, options) {
    return this._conn.retrieve(this.type, ids, options);
  }
  /**
   * Update records
   */


  update(records, options) {
    return this._conn.update(this.type, records, options);
  }
  /**
   * Upsert records
   */


  upsert(records, extIdField, options) {
    return this._conn.upsert(this.type, records, extIdField, options);
  }
  /**
   * Delete records
   */


  destroy(ids, options) {
    return this._conn.destroy(this.type, ids, options);
  }
  /**
   * Synonym of SObject#destroy()
   */


  /**
   * Call Bulk#load() to execute bulkload, returning batch object
   */
  bulkload(operation, optionsOrInput, input) {
    return this._conn.bulk.load(this.type, operation, optionsOrInput, input);
  }
  /**
   * Bulkly insert input data using bulk API
   */


  createBulk(input) {
    return this.bulkload('insert', input);
  }
  /**
   * Synonym of SObject#createBulk()
   */


  /**
   * Bulkly update records by input data using bulk API
   */
  updateBulk(input) {
    return this.bulkload('update', input);
  }
  /**
   * Bulkly upsert records by input data using bulk API
   */


  upsertBulk(input, extIdField) {
    return this.bulkload('upsert', {
      extIdField
    }, input);
  }
  /**
   * Bulkly delete records specified by input data using bulk API
   */


  destroyBulk(input) {
    return this.bulkload('delete', input);
  }
  /**
   * Synonym of SObject#destroyBulk()
   */


  /**
   * Bulkly hard delete records specified in input data using bulk API
   */
  destroyHardBulk(input) {
    return this.bulkload('hardDelete', input);
  }
  /**
   * Synonym of SObject#destroyHardBulk()
   */


  /**
   * Describe SObject metadata
   */
  describe() {
    return this._conn.describe(this.type);
  }
  /**
   *
   */


  describe$() {
    return this._conn.describe$(this.type);
  }
  /**
   *
   */


  describe$$() {
    return this._conn.describe$$(this.type);
  }
  /**
   * Get record representation instance by given id
   */


  record(id) {
    return new _recordReference.default(this._conn, this.type, id);
  }
  /**
   * Retrieve recently accessed records
   */


  recent() {
    return this._conn.recent(this.type);
  }
  /**
   * Retrieve the updated records
   */


  updated(start, end) {
    return this._conn.updated(this.type, start, end);
  }
  /**
   * Retrieve the deleted records
   */


  deleted(start, end) {
    return this._conn.deleted(this.type, start, end);
  }
  /**
   * Describe layout information for SObject
   */


  async layouts(layoutName) {
    const url = `/sobjects/${this.type}/describe/${layoutName ? `namedLayouts/${layoutName}` : 'layouts'}`;
    const body = await this._conn.request(url);
    return body;
  }
  /**
   * @typedef {Object} CompactLayoutInfo
   * @prop {Array.<Object>} compactLayouts - Array of compact layouts
   * @prop {String} defaultCompactLayoutId - ID of default compact layout
   * @prop {Array.<Object>} recordTypeCompactLayoutMappings - Array of record type mappings
   */

  /**
   * Describe compact layout information defined for SObject
   *
   * @param {Callback.<CompactLayoutInfo>} [callback] - Callback function
   * @returns {Promise.<CompactLayoutInfo>}
   */


  async compactLayouts() {
    const url = `/sobjects/${this.type}/describe/compactLayouts`;
    const body = await this._conn.request(url);
    return body;
  }
  /**
   * Describe compact layout information defined for SObject
   *
   * @param {Callback.<ApprovalLayoutInfo>} [callback] - Callback function
   * @returns {Promise.<ApprovalLayoutInfo>}
   */


  async approvalLayouts() {
    const url = `/sobjects/${this.type}/describe/approvalLayouts`;
    const body = await this._conn.request(url);
    return body;
  }
  /**
   * Find and fetch records which matches given conditions
   */


  find(conditions, fields, options = {}) {
    const {
      sort,
      limit,
      offset
    } = options,
          qoptions = (0, _objectWithoutProperties2.default)(options, _excluded);
    const config = {
      fields: fields == null ? undefined : fields,
      includes: (0, _includes.default)(options),
      table: this.type,
      conditions: conditions == null ? undefined : conditions,
      sort,
      limit,
      offset
    };
    const query = new _query.default(this._conn, config, qoptions);
    return query.setResponseTarget(_query.ResponseTargets.Records);
  }
  /**
   * Fetch one record which matches given conditions
   */


  findOne(conditions, fields, options = {}) {
    var _context;

    const query = (0, _find.default)(_context = this).call(_context, conditions, fields, _objectSpread(_objectSpread({}, options), {}, {
      limit: 1
    }));
    return query.setResponseTarget(_query.ResponseTargets.SingleRecord);
  }
  /**
   * Find and fetch records only by specifying fields to fetch.
   */


  select(fields) {
    var _context2;

    return (0, _find.default)(_context2 = this).call(_context2, null, fields);
  }
  /**
   * Count num of records which matches given conditions
   */


  count(conditions) {
    var _context3;

    const query = (0, _find.default)(_context3 = this).call(_context3, conditions, 'count()');
    return query.setResponseTarget(_query.ResponseTargets.Count);
  }
  /**
   * Returns the list of list views for the SObject
   *
   * @param {Callback.<ListViewsInfo>} [callback] - Callback function
   * @returns {Promise.<ListViewsInfo>}
   */


  listviews() {
    const url = `${this._conn._baseUrl()}/sobjects/${this.type}/listviews`;
    return this._conn.request(url);
  }
  /**
   * Returns the list view info in specifed view id
   *
   * @param {String} id - List view ID
   * @returns {ListView}
   */


  listview(id) {
    return new ListView(this._conn, this.type, id); // eslint-disable-line no-use-before-define
  }
  /**
   * Returns all registered quick actions for the SObject
   *
   * @param {Callback.<Array.<QuickAction~QuickActionInfo>>} [callback] - Callback function
   * @returns {Promise.<Array.<QuickAction~QuickActionInfo>>}
   */


  quickActions() {
    return this._conn.request(`/sobjects/${this.type}/quickActions`);
  }
  /**
   * Get reference for specified quick aciton in the SObject
   *
   * @param {String} actionName - Name of the quick action
   * @returns {QuickAction}
   */


  quickAction(actionName) {
    return new _quickAction.default(this._conn, `/sobjects/${this.type}/quickActions/${actionName}`);
  }

}
/**
 * A class for organizing list view information
 *
 * @protected
 * @class ListView
 * @param {Connection} conn - Connection instance
 * @param {SObject} type - SObject type
 * @param {String} id - List view ID
 */


exports.SObject = SObject;
(0, _defineProperty2.default)(SObject, "_logger", (0, _logger.getLogger)('sobject'));

class ListView {
  /**
   *
   */
  constructor(conn, type, id) {
    (0, _defineProperty2.default)(this, "_conn", void 0);
    (0, _defineProperty2.default)(this, "type", void 0);
    (0, _defineProperty2.default)(this, "id", void 0);
    this._conn = conn;
    this.type = type;
    this.id = id;
  }
  /**
   * Executes query for the list view and returns the resulting data and presentation information.
   */


  results() {
    const url = `${this._conn._baseUrl()}/sobjects/${this.type}/listviews/${this.id}/results`;
    return this._conn.request(url);
  }
  /**
   * Returns detailed information about a list view
   */


  describe(options = {}) {
    const url = `${this._conn._baseUrl()}/sobjects/${this.type}/listviews/${this.id}/describe`;
    return this._conn.request({
      method: 'GET',
      url,
      headers: options.headers
    });
  }
  /**
   * Explain plan for executing list view
   */


  explain() {
    const url = `/query/?explain=${this.id}`;
    return this._conn.request(url);
  }

}

var _default = SObject; // TODO Bulk

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTT2JqZWN0IiwiY29uc3RydWN0b3IiLCJjb25uIiwidHlwZSIsImNyZWF0ZSIsImRlc3Ryb3kiLCJjcmVhdGVCdWxrIiwiZGVzdHJveUJ1bGsiLCJkZXN0cm95SGFyZEJ1bGsiLCJfY29ubiIsIl9sb2dnZXIiLCJfbG9nTGV2ZWwiLCJjcmVhdGVJbnN0YW5jZSIsImNhY2hlIiwibGF5b3V0Q2FjaGVLZXkiLCJsYXlvdXROYW1lIiwibGF5b3V0cyIsInByb3RvdHlwZSIsImNyZWF0ZUNhY2hlZEZ1bmN0aW9uIiwia2V5Iiwic3RyYXRlZ3kiLCJsYXlvdXRzJCIsImxheW91dHMkJCIsImNvbXBhY3RMYXlvdXRDYWNoZUtleSIsImNvbXBhY3RMYXlvdXRzIiwiY29tcGFjdExheW91dHMkIiwiY29tcGFjdExheW91dHMkJCIsImFwcHJvdmFsTGF5b3V0Q2FjaGVLZXkiLCJhcHByb3ZhbExheW91dHMiLCJhcHByb3ZhbExheW91dHMkIiwiYXBwcm92YWxMYXlvdXRzJCQiLCJyZWNvcmRzIiwib3B0aW9ucyIsInJldHJpZXZlIiwiaWRzIiwidXBkYXRlIiwidXBzZXJ0IiwiZXh0SWRGaWVsZCIsImJ1bGtsb2FkIiwib3BlcmF0aW9uIiwib3B0aW9uc09ySW5wdXQiLCJpbnB1dCIsImJ1bGsiLCJsb2FkIiwidXBkYXRlQnVsayIsInVwc2VydEJ1bGsiLCJkZXNjcmliZSIsImRlc2NyaWJlJCIsImRlc2NyaWJlJCQiLCJyZWNvcmQiLCJpZCIsIlJlY29yZFJlZmVyZW5jZSIsInJlY2VudCIsInVwZGF0ZWQiLCJzdGFydCIsImVuZCIsImRlbGV0ZWQiLCJ1cmwiLCJib2R5IiwicmVxdWVzdCIsImZpbmQiLCJjb25kaXRpb25zIiwiZmllbGRzIiwic29ydCIsImxpbWl0Iiwib2Zmc2V0IiwicW9wdGlvbnMiLCJjb25maWciLCJ1bmRlZmluZWQiLCJpbmNsdWRlcyIsInRhYmxlIiwicXVlcnkiLCJRdWVyeSIsInNldFJlc3BvbnNlVGFyZ2V0IiwiUmVzcG9uc2VUYXJnZXRzIiwiUmVjb3JkcyIsImZpbmRPbmUiLCJTaW5nbGVSZWNvcmQiLCJzZWxlY3QiLCJjb3VudCIsIkNvdW50IiwibGlzdHZpZXdzIiwiX2Jhc2VVcmwiLCJsaXN0dmlldyIsIkxpc3RWaWV3IiwicXVpY2tBY3Rpb25zIiwicXVpY2tBY3Rpb24iLCJhY3Rpb25OYW1lIiwiUXVpY2tBY3Rpb24iLCJnZXRMb2dnZXIiLCJyZXN1bHRzIiwibWV0aG9kIiwiaGVhZGVycyIsImV4cGxhaW4iXSwic291cmNlcyI6WyIuLi9zcmMvc29iamVjdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqXG4gKi9cbmltcG9ydCB7IExvZ2dlciwgZ2V0TG9nZ2VyIH0gZnJvbSAnLi91dGlsL2xvZ2dlcic7XG5pbXBvcnQge1xuICBSZWNvcmQsXG4gIERlc2NyaWJlTGF5b3V0UmVzdWx0LFxuICBEZXNjcmliZUNvbXBhY3RMYXlvdXRzUmVzdWx0LFxuICBEZXNjcmliZUFwcHJvdmFsTGF5b3V0c1Jlc3VsdCxcbiAgT3B0aW9uYWwsXG4gIERtbE9wdGlvbnMsXG4gIFNhdmVSZXN1bHQsXG4gIFVwc2VydFJlc3VsdCxcbiAgUmV0cmlldmVPcHRpb25zLFxuICBTY2hlbWEsXG4gIFNPYmplY3ROYW1lcyxcbiAgU09iamVjdFJlY29yZCxcbiAgU09iamVjdElucHV0UmVjb3JkLFxuICBTT2JqZWN0VXBkYXRlUmVjb3JkLFxuICBTT2JqZWN0RmllbGROYW1lcyxcbiAgRmllbGRQcm9qZWN0aW9uQ29uZmlnLFxuICBGaWVsZFBhdGhTcGVjaWZpZXIsXG4gIEZpZWxkUGF0aFNjb3BlZFByb2plY3Rpb24sXG59IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IENvbm5lY3Rpb24gZnJvbSAnLi9jb25uZWN0aW9uJztcbmltcG9ydCBSZWNvcmRSZWZlcmVuY2UgZnJvbSAnLi9yZWNvcmQtcmVmZXJlbmNlJztcbmltcG9ydCBRdWVyeSwge1xuICBSZXNwb25zZVRhcmdldHMsXG4gIFF1ZXJ5T3B0aW9ucyxcbiAgUXVlcnlGaWVsZCxcbiAgUXVlcnlDb25kaXRpb24sXG4gIFF1ZXJ5Q29uZmlnLFxufSBmcm9tICcuL3F1ZXJ5JztcbmltcG9ydCBRdWlja0FjdGlvbiBmcm9tICcuL3F1aWNrLWFjdGlvbic7XG5pbXBvcnQgeyBDYWNoZWRGdW5jdGlvbiB9IGZyb20gJy4vY2FjaGUnO1xuaW1wb3J0IHsgUmVhZGFibGUgfSBmcm9tICdzdHJlYW0nO1xuXG5leHBvcnQgdHlwZSBGaW5kT3B0aW9uczxTIGV4dGVuZHMgU2NoZW1hLCBOIGV4dGVuZHMgU09iamVjdE5hbWVzPFM+PiA9IFBhcnRpYWw8XG4gIFF1ZXJ5T3B0aW9ucyAmXG4gICAgUGljazxRdWVyeUNvbmZpZzxTLCBOPiwgJ3NvcnQnIHwgJ2luY2x1ZGVzJz4gJiB7XG4gICAgICBsaW1pdDogbnVtYmVyO1xuICAgICAgb2Zmc2V0OiBudW1iZXI7XG4gICAgfVxuPjtcblxuLyoqXG4gKiBBIGNsYXNzIGZvciBvcmdhbml6aW5nIGFsbCBTT2JqZWN0IGFjY2Vzc1xuICovXG5leHBvcnQgY2xhc3MgU09iamVjdDxcbiAgUyBleHRlbmRzIFNjaGVtYSxcbiAgTiBleHRlbmRzIFNPYmplY3ROYW1lczxTPixcbiAgRmllbGROYW1lcyBleHRlbmRzIFNPYmplY3RGaWVsZE5hbWVzPFMsIE4+ID0gU09iamVjdEZpZWxkTmFtZXM8UywgTj4sXG4gIFJldHJpZXZlUmVjb3JkIGV4dGVuZHMgU09iamVjdFJlY29yZDxTLCBOLCAnKic+ID0gU09iamVjdFJlY29yZDxTLCBOLCAnKic+LFxuICBJbnB1dFJlY29yZCBleHRlbmRzIFNPYmplY3RJbnB1dFJlY29yZDxTLCBOPiA9IFNPYmplY3RJbnB1dFJlY29yZDxTLCBOPixcbiAgVXBkYXRlUmVjb3JkIGV4dGVuZHMgU09iamVjdFVwZGF0ZVJlY29yZDxTLCBOPiA9IFNPYmplY3RVcGRhdGVSZWNvcmQ8UywgTj5cbj4ge1xuICBzdGF0aWMgX2xvZ2dlciA9IGdldExvZ2dlcignc29iamVjdCcpO1xuXG4gIHR5cGU6IE47XG4gIF9jb25uOiBDb25uZWN0aW9uPFM+O1xuICBfbG9nZ2VyOiBMb2dnZXI7XG5cbiAgLy8gbGF5b3V0czogKGxuPzogc3RyaW5nKSA9PiBQcm9taXNlPERlc2NyaWJlTGF5b3V0UmVzdWx0PjtcbiAgbGF5b3V0cyQ6IENhY2hlZEZ1bmN0aW9uPChsbj86IHN0cmluZykgPT4gUHJvbWlzZTxEZXNjcmliZUxheW91dFJlc3VsdD4+O1xuICBsYXlvdXRzJCQ6IENhY2hlZEZ1bmN0aW9uPChsbj86IHN0cmluZykgPT4gRGVzY3JpYmVMYXlvdXRSZXN1bHQ+O1xuICAvLyBjb21wYWN0TGF5b3V0czogKCkgPT4gUHJvbWlzZTxEZXNjcmliZUNvbXBhY3RMYXlvdXRzUmVzdWx0PjtcbiAgY29tcGFjdExheW91dHMkOiBDYWNoZWRGdW5jdGlvbjwoKSA9PiBQcm9taXNlPERlc2NyaWJlQ29tcGFjdExheW91dHNSZXN1bHQ+PjtcbiAgY29tcGFjdExheW91dHMkJDogQ2FjaGVkRnVuY3Rpb248KCkgPT4gRGVzY3JpYmVDb21wYWN0TGF5b3V0c1Jlc3VsdD47XG4gIC8vIGFwcHJvdmFsTGF5b3V0czogKCkgPT4gUHJvbWlzZTxEZXNjcmliZUFwcHJvdmFsTGF5b3V0c1Jlc3VsdD47XG4gIGFwcHJvdmFsTGF5b3V0cyQ6IENhY2hlZEZ1bmN0aW9uPFxuICAgICgpID0+IFByb21pc2U8RGVzY3JpYmVBcHByb3ZhbExheW91dHNSZXN1bHQ+XG4gID47XG4gIGFwcHJvdmFsTGF5b3V0cyQkOiBDYWNoZWRGdW5jdGlvbjwoKSA9PiBEZXNjcmliZUFwcHJvdmFsTGF5b3V0c1Jlc3VsdD47XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb25uOiBDb25uZWN0aW9uPFM+LCB0eXBlOiBOKSB7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLl9jb25uID0gY29ubjtcbiAgICB0aGlzLl9sb2dnZXIgPSBjb25uLl9sb2dMZXZlbFxuICAgICAgPyBTT2JqZWN0Ll9sb2dnZXIuY3JlYXRlSW5zdGFuY2UoY29ubi5fbG9nTGV2ZWwpXG4gICAgICA6IFNPYmplY3QuX2xvZ2dlcjtcbiAgICBjb25zdCBjYWNoZSA9IHRoaXMuX2Nvbm4uY2FjaGU7XG4gICAgY29uc3QgbGF5b3V0Q2FjaGVLZXkgPSAobGF5b3V0TmFtZTogc3RyaW5nKSA9PlxuICAgICAgbGF5b3V0TmFtZVxuICAgICAgICA/IGBsYXlvdXRzLm5hbWVkTGF5b3V0cy4ke2xheW91dE5hbWV9YFxuICAgICAgICA6IGBsYXlvdXRzLiR7dGhpcy50eXBlfWA7XG4gICAgY29uc3QgbGF5b3V0cyA9IFNPYmplY3QucHJvdG90eXBlLmxheW91dHM7XG4gICAgdGhpcy5sYXlvdXRzID0gY2FjaGUuY3JlYXRlQ2FjaGVkRnVuY3Rpb24obGF5b3V0cywgdGhpcywge1xuICAgICAga2V5OiBsYXlvdXRDYWNoZUtleSxcbiAgICAgIHN0cmF0ZWd5OiAnTk9DQUNIRScsXG4gICAgfSk7XG4gICAgdGhpcy5sYXlvdXRzJCA9IGNhY2hlLmNyZWF0ZUNhY2hlZEZ1bmN0aW9uKGxheW91dHMsIHRoaXMsIHtcbiAgICAgIGtleTogbGF5b3V0Q2FjaGVLZXksXG4gICAgICBzdHJhdGVneTogJ0hJVCcsXG4gICAgfSk7XG4gICAgdGhpcy5sYXlvdXRzJCQgPSBjYWNoZS5jcmVhdGVDYWNoZWRGdW5jdGlvbihsYXlvdXRzLCB0aGlzLCB7XG4gICAgICBrZXk6IGxheW91dENhY2hlS2V5LFxuICAgICAgc3RyYXRlZ3k6ICdJTU1FRElBVEUnLFxuICAgIH0pIGFzIGFueTtcbiAgICBjb25zdCBjb21wYWN0TGF5b3V0Q2FjaGVLZXkgPSBgY29tcGFjdExheW91dHMuJHt0aGlzLnR5cGV9YDtcbiAgICBjb25zdCBjb21wYWN0TGF5b3V0cyA9IFNPYmplY3QucHJvdG90eXBlLmNvbXBhY3RMYXlvdXRzO1xuICAgIHRoaXMuY29tcGFjdExheW91dHMgPSBjYWNoZS5jcmVhdGVDYWNoZWRGdW5jdGlvbihjb21wYWN0TGF5b3V0cywgdGhpcywge1xuICAgICAga2V5OiBjb21wYWN0TGF5b3V0Q2FjaGVLZXksXG4gICAgICBzdHJhdGVneTogJ05PQ0FDSEUnLFxuICAgIH0pO1xuICAgIHRoaXMuY29tcGFjdExheW91dHMkID0gY2FjaGUuY3JlYXRlQ2FjaGVkRnVuY3Rpb24oY29tcGFjdExheW91dHMsIHRoaXMsIHtcbiAgICAgIGtleTogY29tcGFjdExheW91dENhY2hlS2V5LFxuICAgICAgc3RyYXRlZ3k6ICdISVQnLFxuICAgIH0pO1xuICAgIHRoaXMuY29tcGFjdExheW91dHMkJCA9IGNhY2hlLmNyZWF0ZUNhY2hlZEZ1bmN0aW9uKGNvbXBhY3RMYXlvdXRzLCB0aGlzLCB7XG4gICAgICBrZXk6IGNvbXBhY3RMYXlvdXRDYWNoZUtleSxcbiAgICAgIHN0cmF0ZWd5OiAnSU1NRURJQVRFJyxcbiAgICB9KSBhcyBhbnk7XG4gICAgY29uc3QgYXBwcm92YWxMYXlvdXRDYWNoZUtleSA9IGBhcHByb3ZhbExheW91dHMuJHt0aGlzLnR5cGV9YDtcbiAgICBjb25zdCBhcHByb3ZhbExheW91dHMgPSBTT2JqZWN0LnByb3RvdHlwZS5hcHByb3ZhbExheW91dHM7XG4gICAgdGhpcy5hcHByb3ZhbExheW91dHMgPSBjYWNoZS5jcmVhdGVDYWNoZWRGdW5jdGlvbihhcHByb3ZhbExheW91dHMsIHRoaXMsIHtcbiAgICAgIGtleTogYXBwcm92YWxMYXlvdXRDYWNoZUtleSxcbiAgICAgIHN0cmF0ZWd5OiAnTk9DQUNIRScsXG4gICAgfSk7XG4gICAgdGhpcy5hcHByb3ZhbExheW91dHMkID0gY2FjaGUuY3JlYXRlQ2FjaGVkRnVuY3Rpb24oYXBwcm92YWxMYXlvdXRzLCB0aGlzLCB7XG4gICAgICBrZXk6IGFwcHJvdmFsTGF5b3V0Q2FjaGVLZXksXG4gICAgICBzdHJhdGVneTogJ0hJVCcsXG4gICAgfSk7XG4gICAgdGhpcy5hcHByb3ZhbExheW91dHMkJCA9IGNhY2hlLmNyZWF0ZUNhY2hlZEZ1bmN0aW9uKGFwcHJvdmFsTGF5b3V0cywgdGhpcywge1xuICAgICAga2V5OiBhcHByb3ZhbExheW91dENhY2hlS2V5LFxuICAgICAgc3RyYXRlZ3k6ICdJTU1FRElBVEUnLFxuICAgIH0pIGFzIGFueTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgcmVjb3Jkc1xuICAgKi9cbiAgY3JlYXRlKHJlY29yZHM6IElucHV0UmVjb3JkW10sIG9wdGlvbnM/OiBEbWxPcHRpb25zKTogUHJvbWlzZTxTYXZlUmVzdWx0W10+O1xuICBjcmVhdGUocmVjb3JkczogSW5wdXRSZWNvcmQsIG9wdGlvbnM/OiBEbWxPcHRpb25zKTogUHJvbWlzZTxTYXZlUmVzdWx0PjtcbiAgY3JlYXRlKFxuICAgIHJlY29yZHM6IElucHV0UmVjb3JkIHwgSW5wdXRSZWNvcmRbXSxcbiAgICBvcHRpb25zPzogRG1sT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxTYXZlUmVzdWx0IHwgU2F2ZVJlc3VsdFtdPjtcbiAgY3JlYXRlKHJlY29yZHM6IElucHV0UmVjb3JkIHwgSW5wdXRSZWNvcmRbXSwgb3B0aW9ucz86IERtbE9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubi5jcmVhdGUodGhpcy50eXBlLCByZWNvcmRzLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTeW5vbnltIG9mIFNPYmplY3QjY3JlYXRlKClcbiAgICovXG4gIGluc2VydCA9IHRoaXMuY3JlYXRlO1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSBzcGVjaWZpZWQgcmVjb3Jkc1xuICAgKi9cbiAgcmV0cmlldmUoaWRzOiBzdHJpbmdbXSwgb3B0aW9ucz86IFJldHJpZXZlT3B0aW9ucyk6IFByb21pc2U8UmV0cmlldmVSZWNvcmRbXT47XG4gIHJldHJpZXZlKGlkczogc3RyaW5nLCBvcHRpb25zPzogUmV0cmlldmVPcHRpb25zKTogUHJvbWlzZTxSZXRyaWV2ZVJlY29yZD47XG4gIHJldHJpZXZlKFxuICAgIGlkczogc3RyaW5nIHwgc3RyaW5nW10sXG4gICAgb3B0aW9ucz86IFJldHJpZXZlT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxSZXRyaWV2ZVJlY29yZCB8IFJldHJpZXZlUmVjb3JkW10+O1xuICByZXRyaWV2ZShpZHM6IHN0cmluZyB8IHN0cmluZ1tdLCBvcHRpb25zPzogUmV0cmlldmVPcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm4ucmV0cmlldmUodGhpcy50eXBlLCBpZHMsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSByZWNvcmRzXG4gICAqL1xuICB1cGRhdGUocmVjb3JkczogVXBkYXRlUmVjb3JkW10sIG9wdGlvbnM/OiBEbWxPcHRpb25zKTogUHJvbWlzZTxTYXZlUmVzdWx0W10+O1xuICB1cGRhdGUocmVjb3JkczogVXBkYXRlUmVjb3JkLCBvcHRpb25zPzogRG1sT3B0aW9ucyk6IFByb21pc2U8U2F2ZVJlc3VsdD47XG4gIHVwZGF0ZShcbiAgICByZWNvcmRzOiBVcGRhdGVSZWNvcmQgfCBVcGRhdGVSZWNvcmRbXSxcbiAgICBvcHRpb25zPzogRG1sT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxTYXZlUmVzdWx0IHwgU2F2ZVJlc3VsdFtdPjtcbiAgdXBkYXRlKHJlY29yZHM6IFVwZGF0ZVJlY29yZCB8IFVwZGF0ZVJlY29yZFtdLCBvcHRpb25zPzogRG1sT3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLl9jb25uLnVwZGF0ZSh0aGlzLnR5cGUsIHJlY29yZHMsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwc2VydCByZWNvcmRzXG4gICAqL1xuICB1cHNlcnQoXG4gICAgcmVjb3JkczogSW5wdXRSZWNvcmRbXSxcbiAgICBleHRJZEZpZWxkOiBGaWVsZE5hbWVzLFxuICAgIG9wdGlvbnM/OiBEbWxPcHRpb25zLFxuICApOiBQcm9taXNlPFVwc2VydFJlc3VsdFtdPjtcbiAgdXBzZXJ0KFxuICAgIHJlY29yZHM6IElucHV0UmVjb3JkLFxuICAgIGV4dElkRmllbGQ6IEZpZWxkTmFtZXMsXG4gICAgb3B0aW9ucz86IERtbE9wdGlvbnMsXG4gICk6IFByb21pc2U8VXBzZXJ0UmVzdWx0PjtcbiAgdXBzZXJ0KFxuICAgIHJlY29yZHM6IElucHV0UmVjb3JkIHwgSW5wdXRSZWNvcmRbXSxcbiAgICBleHRJZEZpZWxkOiBGaWVsZE5hbWVzLFxuICAgIG9wdGlvbnM/OiBEbWxPcHRpb25zLFxuICApOiBQcm9taXNlPFVwc2VydFJlc3VsdCB8IFVwc2VydFJlc3VsdFtdPjtcbiAgdXBzZXJ0KFxuICAgIHJlY29yZHM6IElucHV0UmVjb3JkIHwgSW5wdXRSZWNvcmRbXSxcbiAgICBleHRJZEZpZWxkOiBGaWVsZE5hbWVzLFxuICAgIG9wdGlvbnM/OiBEbWxPcHRpb25zLFxuICApIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubi51cHNlcnQodGhpcy50eXBlLCByZWNvcmRzLCBleHRJZEZpZWxkLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGUgcmVjb3Jkc1xuICAgKi9cbiAgZGVzdHJveShpZHM6IHN0cmluZ1tdLCBvcHRpb25zPzogRG1sT3B0aW9ucyk6IFByb21pc2U8U2F2ZVJlc3VsdFtdPjtcbiAgZGVzdHJveShpZHM6IHN0cmluZywgb3B0aW9ucz86IERtbE9wdGlvbnMpOiBQcm9taXNlPFNhdmVSZXN1bHQ+O1xuICBkZXN0cm95KFxuICAgIGlkczogc3RyaW5nIHwgc3RyaW5nW10sXG4gICAgb3B0aW9ucz86IERtbE9wdGlvbnMsXG4gICk6IFByb21pc2U8U2F2ZVJlc3VsdCB8IFNhdmVSZXN1bHRbXT47XG4gIGRlc3Ryb3koaWRzOiBzdHJpbmcgfCBzdHJpbmdbXSwgb3B0aW9ucz86IERtbE9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubi5kZXN0cm95KHRoaXMudHlwZSwgaWRzLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTeW5vbnltIG9mIFNPYmplY3QjZGVzdHJveSgpXG4gICAqL1xuICBkZWxldGUgPSB0aGlzLmRlc3Ryb3k7XG5cbiAgLyoqXG4gICAqIFN5bm9ueW0gb2YgU09iamVjdCNkZXN0cm95KClcbiAgICovXG4gIGRlbCA9IHRoaXMuZGVzdHJveTtcblxuICAvKipcbiAgICogQ2FsbCBCdWxrI2xvYWQoKSB0byBleGVjdXRlIGJ1bGtsb2FkLCByZXR1cm5pbmcgYmF0Y2ggb2JqZWN0XG4gICAqL1xuICBidWxrbG9hZChcbiAgICBvcGVyYXRpb246ICdpbnNlcnQnIHwgJ3VwZGF0ZScgfCAndXBzZXJ0JyB8ICdkZWxldGUnIHwgJ2hhcmREZWxldGUnLFxuICAgIG9wdGlvbnNPcklucHV0PzogT2JqZWN0IHwgUmVjb3JkW10gfCBSZWFkYWJsZSB8IHN0cmluZyxcbiAgICBpbnB1dD86IFJlY29yZFtdIHwgUmVhZGFibGUgfCBzdHJpbmcsXG4gICkge1xuICAgIHJldHVybiB0aGlzLl9jb25uLmJ1bGsubG9hZCh0aGlzLnR5cGUsIG9wZXJhdGlvbiwgb3B0aW9uc09ySW5wdXQsIGlucHV0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWxrbHkgaW5zZXJ0IGlucHV0IGRhdGEgdXNpbmcgYnVsayBBUElcbiAgICovXG4gIGNyZWF0ZUJ1bGsoaW5wdXQ/OiBSZWNvcmRbXSB8IFJlYWRhYmxlIHwgc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVsa2xvYWQoJ2luc2VydCcsIGlucHV0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTeW5vbnltIG9mIFNPYmplY3QjY3JlYXRlQnVsaygpXG4gICAqL1xuICBpbnNlcnRCdWxrID0gdGhpcy5jcmVhdGVCdWxrO1xuXG4gIC8qKlxuICAgKiBCdWxrbHkgdXBkYXRlIHJlY29yZHMgYnkgaW5wdXQgZGF0YSB1c2luZyBidWxrIEFQSVxuICAgKi9cbiAgdXBkYXRlQnVsayhpbnB1dD86IFJlY29yZFtdIHwgUmVhZGFibGUgfCBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5idWxrbG9hZCgndXBkYXRlJywgaW5wdXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1bGtseSB1cHNlcnQgcmVjb3JkcyBieSBpbnB1dCBkYXRhIHVzaW5nIGJ1bGsgQVBJXG4gICAqL1xuICB1cHNlcnRCdWxrKGlucHV0PzogUmVjb3JkW10gfCBSZWFkYWJsZSB8IHN0cmluZywgZXh0SWRGaWVsZD86IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmJ1bGtsb2FkKCd1cHNlcnQnLCB7IGV4dElkRmllbGQgfSwgaW5wdXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1bGtseSBkZWxldGUgcmVjb3JkcyBzcGVjaWZpZWQgYnkgaW5wdXQgZGF0YSB1c2luZyBidWxrIEFQSVxuICAgKi9cbiAgZGVzdHJveUJ1bGsoaW5wdXQ/OiBSZWNvcmRbXSB8IFJlYWRhYmxlIHwgc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVsa2xvYWQoJ2RlbGV0ZScsIGlucHV0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTeW5vbnltIG9mIFNPYmplY3QjZGVzdHJveUJ1bGsoKVxuICAgKi9cbiAgZGVsZXRlQnVsayA9IHRoaXMuZGVzdHJveUJ1bGs7XG5cbiAgLyoqXG4gICAqIEJ1bGtseSBoYXJkIGRlbGV0ZSByZWNvcmRzIHNwZWNpZmllZCBpbiBpbnB1dCBkYXRhIHVzaW5nIGJ1bGsgQVBJXG4gICAqL1xuICBkZXN0cm95SGFyZEJ1bGsoaW5wdXQ6IFJlY29yZFtdIHwgUmVhZGFibGUpIHtcbiAgICByZXR1cm4gdGhpcy5idWxrbG9hZCgnaGFyZERlbGV0ZScsIGlucHV0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTeW5vbnltIG9mIFNPYmplY3QjZGVzdHJveUhhcmRCdWxrKClcbiAgICovXG4gIGRlbGV0ZUhhcmRCdWxrID0gdGhpcy5kZXN0cm95SGFyZEJ1bGs7XG5cbiAgLyoqXG4gICAqIERlc2NyaWJlIFNPYmplY3QgbWV0YWRhdGFcbiAgICovXG4gIGRlc2NyaWJlKCkge1xuICAgIHJldHVybiB0aGlzLl9jb25uLmRlc2NyaWJlKHRoaXMudHlwZSk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICovXG4gIGRlc2NyaWJlJCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubi5kZXNjcmliZSQodGhpcy50eXBlKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgZGVzY3JpYmUkJCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubi5kZXNjcmliZSQkKHRoaXMudHlwZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHJlY29yZCByZXByZXNlbnRhdGlvbiBpbnN0YW5jZSBieSBnaXZlbiBpZFxuICAgKi9cbiAgcmVjb3JkKGlkOiBzdHJpbmcpOiBSZWNvcmRSZWZlcmVuY2U8UywgTj4ge1xuICAgIHJldHVybiBuZXcgUmVjb3JkUmVmZXJlbmNlKHRoaXMuX2Nvbm4sIHRoaXMudHlwZSwgaWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHJlY2VudGx5IGFjY2Vzc2VkIHJlY29yZHNcbiAgICovXG4gIHJlY2VudCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubi5yZWNlbnQodGhpcy50eXBlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgdXBkYXRlZCByZWNvcmRzXG4gICAqL1xuICB1cGRhdGVkKHN0YXJ0OiBzdHJpbmcgfCBEYXRlLCBlbmQ6IHN0cmluZyB8IERhdGUpIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubi51cGRhdGVkKHRoaXMudHlwZSwgc3RhcnQsIGVuZCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIGRlbGV0ZWQgcmVjb3Jkc1xuICAgKi9cbiAgZGVsZXRlZChzdGFydDogc3RyaW5nIHwgRGF0ZSwgZW5kOiBzdHJpbmcgfCBEYXRlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm4uZGVsZXRlZCh0aGlzLnR5cGUsIHN0YXJ0LCBlbmQpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc2NyaWJlIGxheW91dCBpbmZvcm1hdGlvbiBmb3IgU09iamVjdFxuICAgKi9cbiAgYXN5bmMgbGF5b3V0cyhsYXlvdXROYW1lPzogc3RyaW5nKTogUHJvbWlzZTxEZXNjcmliZUxheW91dFJlc3VsdD4ge1xuICAgIGNvbnN0IHVybCA9IGAvc29iamVjdHMvJHt0aGlzLnR5cGV9L2Rlc2NyaWJlLyR7XG4gICAgICBsYXlvdXROYW1lID8gYG5hbWVkTGF5b3V0cy8ke2xheW91dE5hbWV9YCA6ICdsYXlvdXRzJ1xuICAgIH1gO1xuICAgIGNvbnN0IGJvZHkgPSBhd2FpdCB0aGlzLl9jb25uLnJlcXVlc3QodXJsKTtcbiAgICByZXR1cm4gYm9keSBhcyBEZXNjcmliZUxheW91dFJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBDb21wYWN0TGF5b3V0SW5mb1xuICAgKiBAcHJvcCB7QXJyYXkuPE9iamVjdD59IGNvbXBhY3RMYXlvdXRzIC0gQXJyYXkgb2YgY29tcGFjdCBsYXlvdXRzXG4gICAqIEBwcm9wIHtTdHJpbmd9IGRlZmF1bHRDb21wYWN0TGF5b3V0SWQgLSBJRCBvZiBkZWZhdWx0IGNvbXBhY3QgbGF5b3V0XG4gICAqIEBwcm9wIHtBcnJheS48T2JqZWN0Pn0gcmVjb3JkVHlwZUNvbXBhY3RMYXlvdXRNYXBwaW5ncyAtIEFycmF5IG9mIHJlY29yZCB0eXBlIG1hcHBpbmdzXG4gICAqL1xuICAvKipcbiAgICogRGVzY3JpYmUgY29tcGFjdCBsYXlvdXQgaW5mb3JtYXRpb24gZGVmaW5lZCBmb3IgU09iamVjdFxuICAgKlxuICAgKiBAcGFyYW0ge0NhbGxiYWNrLjxDb21wYWN0TGF5b3V0SW5mbz59IFtjYWxsYmFja10gLSBDYWxsYmFjayBmdW5jdGlvblxuICAgKiBAcmV0dXJucyB7UHJvbWlzZS48Q29tcGFjdExheW91dEluZm8+fVxuICAgKi9cbiAgYXN5bmMgY29tcGFjdExheW91dHMoKTogUHJvbWlzZTxEZXNjcmliZUNvbXBhY3RMYXlvdXRzUmVzdWx0PiB7XG4gICAgY29uc3QgdXJsID0gYC9zb2JqZWN0cy8ke3RoaXMudHlwZX0vZGVzY3JpYmUvY29tcGFjdExheW91dHNgO1xuICAgIGNvbnN0IGJvZHkgPSBhd2FpdCB0aGlzLl9jb25uLnJlcXVlc3QodXJsKTtcbiAgICByZXR1cm4gYm9keSBhcyBEZXNjcmliZUNvbXBhY3RMYXlvdXRzUmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIERlc2NyaWJlIGNvbXBhY3QgbGF5b3V0IGluZm9ybWF0aW9uIGRlZmluZWQgZm9yIFNPYmplY3RcbiAgICpcbiAgICogQHBhcmFtIHtDYWxsYmFjay48QXBwcm92YWxMYXlvdXRJbmZvPn0gW2NhbGxiYWNrXSAtIENhbGxiYWNrIGZ1bmN0aW9uXG4gICAqIEByZXR1cm5zIHtQcm9taXNlLjxBcHByb3ZhbExheW91dEluZm8+fVxuICAgKi9cbiAgYXN5bmMgYXBwcm92YWxMYXlvdXRzKCk6IFByb21pc2U8RGVzY3JpYmVBcHByb3ZhbExheW91dHNSZXN1bHQ+IHtcbiAgICBjb25zdCB1cmwgPSBgL3NvYmplY3RzLyR7dGhpcy50eXBlfS9kZXNjcmliZS9hcHByb3ZhbExheW91dHNgO1xuICAgIGNvbnN0IGJvZHkgPSBhd2FpdCB0aGlzLl9jb25uLnJlcXVlc3QodXJsKTtcbiAgICByZXR1cm4gYm9keSBhcyBEZXNjcmliZUFwcHJvdmFsTGF5b3V0c1Jlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGFuZCBmZXRjaCByZWNvcmRzIHdoaWNoIG1hdGNoZXMgZ2l2ZW4gY29uZGl0aW9uc1xuICAgKi9cbiAgZmluZDxSIGV4dGVuZHMgUmVjb3JkID0gUmVjb3JkPihcbiAgICBjb25kaXRpb25zPzogT3B0aW9uYWw8UXVlcnlDb25kaXRpb248UywgTj4+LFxuICApOiBRdWVyeTxTLCBOLCBTT2JqZWN0UmVjb3JkPFMsIE4sICcqJywgUj4sICdSZWNvcmRzJz47XG4gIGZpbmQ8XG4gICAgUiBleHRlbmRzIFJlY29yZCA9IFJlY29yZCxcbiAgICBGUCBleHRlbmRzIEZpZWxkUGF0aFNwZWNpZmllcjxTLCBOPiA9IEZpZWxkUGF0aFNwZWNpZmllcjxTLCBOPixcbiAgICBGUEMgZXh0ZW5kcyBGaWVsZFByb2plY3Rpb25Db25maWcgPSBGaWVsZFBhdGhTY29wZWRQcm9qZWN0aW9uPFMsIE4sIEZQPlxuICA+KFxuICAgIGNvbmRpdGlvbnM6IE9wdGlvbmFsPFF1ZXJ5Q29uZGl0aW9uPFMsIE4+PixcbiAgICBmaWVsZHM/OiBPcHRpb25hbDxRdWVyeUZpZWxkPFMsIE4sIEZQPj4sXG4gICAgb3B0aW9ucz86IEZpbmRPcHRpb25zPFMsIE4+LFxuICApOiBRdWVyeTxTLCBOLCBTT2JqZWN0UmVjb3JkPFMsIE4sIEZQQywgUj4sICdSZWNvcmRzJz47XG4gIGZpbmQoXG4gICAgY29uZGl0aW9ucz86IE9wdGlvbmFsPFF1ZXJ5Q29uZGl0aW9uPFMsIE4+PixcbiAgICBmaWVsZHM/OiBPcHRpb25hbDxRdWVyeUZpZWxkPFMsIE4sIEZpZWxkUGF0aFNwZWNpZmllcjxTLCBOPj4+LFxuICAgIG9wdGlvbnM6IEZpbmRPcHRpb25zPFMsIE4+ID0ge30sXG4gICk6IFF1ZXJ5PFMsIE4sIGFueSwgJ1JlY29yZHMnPiB7XG4gICAgY29uc3QgeyBzb3J0LCBsaW1pdCwgb2Zmc2V0LCAuLi5xb3B0aW9ucyB9ID0gb3B0aW9ucztcbiAgICBjb25zdCBjb25maWc6IFF1ZXJ5Q29uZmlnPFMsIE4+ID0ge1xuICAgICAgZmllbGRzOiBmaWVsZHMgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IGZpZWxkcyxcbiAgICAgIGluY2x1ZGVzOiBvcHRpb25zLmluY2x1ZGVzLFxuICAgICAgdGFibGU6IHRoaXMudHlwZSxcbiAgICAgIGNvbmRpdGlvbnM6IGNvbmRpdGlvbnMgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IGNvbmRpdGlvbnMsXG4gICAgICBzb3J0LFxuICAgICAgbGltaXQsXG4gICAgICBvZmZzZXQsXG4gICAgfTtcbiAgICBjb25zdCBxdWVyeSA9IG5ldyBRdWVyeTxTLCBOPih0aGlzLl9jb25uLCBjb25maWcsIHFvcHRpb25zKTtcbiAgICByZXR1cm4gcXVlcnkuc2V0UmVzcG9uc2VUYXJnZXQoUmVzcG9uc2VUYXJnZXRzLlJlY29yZHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIG9uZSByZWNvcmQgd2hpY2ggbWF0Y2hlcyBnaXZlbiBjb25kaXRpb25zXG4gICAqL1xuICBmaW5kT25lPFIgZXh0ZW5kcyBSZWNvcmQgPSBSZWNvcmQ+KFxuICAgIGNvbmRpdGlvbnM/OiBPcHRpb25hbDxRdWVyeUNvbmRpdGlvbjxTLCBOPj4sXG4gICk6IFF1ZXJ5PFMsIE4sIFNPYmplY3RSZWNvcmQ8UywgTiwgJyonLCBSPiwgJ1NpbmdsZVJlY29yZCc+O1xuICBmaW5kT25lPFxuICAgIFIgZXh0ZW5kcyBSZWNvcmQgPSBSZWNvcmQsXG4gICAgRlAgZXh0ZW5kcyBGaWVsZFBhdGhTcGVjaWZpZXI8UywgTj4gPSBGaWVsZFBhdGhTcGVjaWZpZXI8UywgTj4sXG4gICAgRlBDIGV4dGVuZHMgRmllbGRQcm9qZWN0aW9uQ29uZmlnID0gRmllbGRQYXRoU2NvcGVkUHJvamVjdGlvbjxTLCBOLCBGUD5cbiAgPihcbiAgICBjb25kaXRpb25zOiBPcHRpb25hbDxRdWVyeUNvbmRpdGlvbjxTLCBOPj4sXG4gICAgZmllbGRzPzogT3B0aW9uYWw8UXVlcnlGaWVsZDxTLCBOLCBGUD4+LFxuICAgIG9wdGlvbnM/OiBGaW5kT3B0aW9uczxTLCBOPixcbiAgKTogUXVlcnk8UywgTiwgU09iamVjdFJlY29yZDxTLCBOLCBGUEMsIFI+LCAnU2luZ2xlUmVjb3JkJz47XG4gIGZpbmRPbmUoXG4gICAgY29uZGl0aW9ucz86IE9wdGlvbmFsPFF1ZXJ5Q29uZGl0aW9uPFMsIE4+PixcbiAgICBmaWVsZHM/OiBPcHRpb25hbDxRdWVyeUZpZWxkPFMsIE4sIEZpZWxkUGF0aFNwZWNpZmllcjxTLCBOPj4+LFxuICAgIG9wdGlvbnM6IEZpbmRPcHRpb25zPFMsIE4+ID0ge30sXG4gICk6IFF1ZXJ5PFMsIE4sIGFueSwgJ1NpbmdsZVJlY29yZCc+IHtcbiAgICBjb25zdCBxdWVyeSA9IHRoaXMuZmluZChjb25kaXRpb25zLCBmaWVsZHMsIHsgLi4ub3B0aW9ucywgbGltaXQ6IDEgfSk7XG4gICAgcmV0dXJuIHF1ZXJ5LnNldFJlc3BvbnNlVGFyZ2V0KFJlc3BvbnNlVGFyZ2V0cy5TaW5nbGVSZWNvcmQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgYW5kIGZldGNoIHJlY29yZHMgb25seSBieSBzcGVjaWZ5aW5nIGZpZWxkcyB0byBmZXRjaC5cbiAgICovXG4gIHNlbGVjdDxcbiAgICBSIGV4dGVuZHMgUmVjb3JkID0gUmVjb3JkLFxuICAgIEZQIGV4dGVuZHMgRmllbGRQYXRoU3BlY2lmaWVyPFMsIE4+ID0gRmllbGRQYXRoU3BlY2lmaWVyPFMsIE4+LFxuICAgIEZQQyBleHRlbmRzIEZpZWxkUHJvamVjdGlvbkNvbmZpZyA9IEZpZWxkUGF0aFNjb3BlZFByb2plY3Rpb248UywgTiwgRlA+XG4gID4oXG4gICAgZmllbGRzOiBRdWVyeUZpZWxkPFMsIE4sIEZQPixcbiAgKTogUXVlcnk8UywgTiwgU09iamVjdFJlY29yZDxTLCBOLCBGUEMsIFI+LCAnUmVjb3Jkcyc+IHtcbiAgICByZXR1cm4gdGhpcy5maW5kKG51bGwsIGZpZWxkcyk7XG4gIH1cblxuICAvKipcbiAgICogQ291bnQgbnVtIG9mIHJlY29yZHMgd2hpY2ggbWF0Y2hlcyBnaXZlbiBjb25kaXRpb25zXG4gICAqL1xuICBjb3VudChjb25kaXRpb25zPzogT3B0aW9uYWw8UXVlcnlDb25kaXRpb248UywgTj4+KSB7XG4gICAgY29uc3QgcXVlcnkgPSB0aGlzLmZpbmQoY29uZGl0aW9ucywgJ2NvdW50KCknKTtcbiAgICByZXR1cm4gcXVlcnkuc2V0UmVzcG9uc2VUYXJnZXQoUmVzcG9uc2VUYXJnZXRzLkNvdW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBsaXN0IG9mIGxpc3Qgdmlld3MgZm9yIHRoZSBTT2JqZWN0XG4gICAqXG4gICAqIEBwYXJhbSB7Q2FsbGJhY2suPExpc3RWaWV3c0luZm8+fSBbY2FsbGJhY2tdIC0gQ2FsbGJhY2sgZnVuY3Rpb25cbiAgICogQHJldHVybnMge1Byb21pc2UuPExpc3RWaWV3c0luZm8+fVxuICAgKi9cbiAgbGlzdHZpZXdzKCkge1xuICAgIGNvbnN0IHVybCA9IGAke3RoaXMuX2Nvbm4uX2Jhc2VVcmwoKX0vc29iamVjdHMvJHt0aGlzLnR5cGV9L2xpc3R2aWV3c2A7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm4ucmVxdWVzdCh1cmwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGxpc3QgdmlldyBpbmZvIGluIHNwZWNpZmVkIHZpZXcgaWRcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gTGlzdCB2aWV3IElEXG4gICAqIEByZXR1cm5zIHtMaXN0Vmlld31cbiAgICovXG4gIGxpc3R2aWV3KGlkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IExpc3RWaWV3KHRoaXMuX2Nvbm4sIHRoaXMudHlwZSwgaWQpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVzZS1iZWZvcmUtZGVmaW5lXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbGwgcmVnaXN0ZXJlZCBxdWljayBhY3Rpb25zIGZvciB0aGUgU09iamVjdFxuICAgKlxuICAgKiBAcGFyYW0ge0NhbGxiYWNrLjxBcnJheS48UXVpY2tBY3Rpb25+UXVpY2tBY3Rpb25JbmZvPj59IFtjYWxsYmFja10gLSBDYWxsYmFjayBmdW5jdGlvblxuICAgKiBAcmV0dXJucyB7UHJvbWlzZS48QXJyYXkuPFF1aWNrQWN0aW9uflF1aWNrQWN0aW9uSW5mbz4+fVxuICAgKi9cbiAgcXVpY2tBY3Rpb25zKCkge1xuICAgIHJldHVybiB0aGlzLl9jb25uLnJlcXVlc3QoYC9zb2JqZWN0cy8ke3RoaXMudHlwZX0vcXVpY2tBY3Rpb25zYCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHJlZmVyZW5jZSBmb3Igc3BlY2lmaWVkIHF1aWNrIGFjaXRvbiBpbiB0aGUgU09iamVjdFxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gYWN0aW9uTmFtZSAtIE5hbWUgb2YgdGhlIHF1aWNrIGFjdGlvblxuICAgKiBAcmV0dXJucyB7UXVpY2tBY3Rpb259XG4gICAqL1xuICBxdWlja0FjdGlvbihhY3Rpb25OYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFF1aWNrQWN0aW9uKFxuICAgICAgdGhpcy5fY29ubixcbiAgICAgIGAvc29iamVjdHMvJHt0aGlzLnR5cGV9L3F1aWNrQWN0aW9ucy8ke2FjdGlvbk5hbWV9YCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogQSBjbGFzcyBmb3Igb3JnYW5pemluZyBsaXN0IHZpZXcgaW5mb3JtYXRpb25cbiAqXG4gKiBAcHJvdGVjdGVkXG4gKiBAY2xhc3MgTGlzdFZpZXdcbiAqIEBwYXJhbSB7Q29ubmVjdGlvbn0gY29ubiAtIENvbm5lY3Rpb24gaW5zdGFuY2VcbiAqIEBwYXJhbSB7U09iamVjdH0gdHlwZSAtIFNPYmplY3QgdHlwZVxuICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gTGlzdCB2aWV3IElEXG4gKi9cbmNsYXNzIExpc3RWaWV3IHtcbiAgX2Nvbm46IENvbm5lY3Rpb247XG4gIHR5cGU6IHN0cmluZztcbiAgaWQ6IHN0cmluZztcblxuICAvKipcbiAgICpcbiAgICovXG4gIGNvbnN0cnVjdG9yKGNvbm46IENvbm5lY3Rpb24sIHR5cGU6IHN0cmluZywgaWQ6IHN0cmluZykge1xuICAgIHRoaXMuX2Nvbm4gPSBjb25uO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5pZCA9IGlkO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGVzIHF1ZXJ5IGZvciB0aGUgbGlzdCB2aWV3IGFuZCByZXR1cm5zIHRoZSByZXN1bHRpbmcgZGF0YSBhbmQgcHJlc2VudGF0aW9uIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgcmVzdWx0cygpIHtcbiAgICBjb25zdCB1cmwgPSBgJHt0aGlzLl9jb25uLl9iYXNlVXJsKCl9L3NvYmplY3RzLyR7dGhpcy50eXBlfS9saXN0dmlld3MvJHtcbiAgICAgIHRoaXMuaWRcbiAgICB9L3Jlc3VsdHNgO1xuICAgIHJldHVybiB0aGlzLl9jb25uLnJlcXVlc3QodXJsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGRldGFpbGVkIGluZm9ybWF0aW9uIGFib3V0IGEgbGlzdCB2aWV3XG4gICAqL1xuICBkZXNjcmliZShvcHRpb25zOiB7IGhlYWRlcnM/OiB7IFtuYW1lOiBzdHJpbmddOiBzdHJpbmcgfSB9ID0ge30pIHtcbiAgICBjb25zdCB1cmwgPSBgJHt0aGlzLl9jb25uLl9iYXNlVXJsKCl9L3NvYmplY3RzLyR7dGhpcy50eXBlfS9saXN0dmlld3MvJHtcbiAgICAgIHRoaXMuaWRcbiAgICB9L2Rlc2NyaWJlYDtcbiAgICByZXR1cm4gdGhpcy5fY29ubi5yZXF1ZXN0KHsgbWV0aG9kOiAnR0VUJywgdXJsLCBoZWFkZXJzOiBvcHRpb25zLmhlYWRlcnMgfSk7XG4gIH1cblxuICAvKipcbiAgICogRXhwbGFpbiBwbGFuIGZvciBleGVjdXRpbmcgbGlzdCB2aWV3XG4gICAqL1xuICBleHBsYWluKCkge1xuICAgIGNvbnN0IHVybCA9IGAvcXVlcnkvP2V4cGxhaW49JHt0aGlzLmlkfWA7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm4ucmVxdWVzdDxhbnk+KHVybCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU09iamVjdDtcblxuLy8gVE9ETyBCdWxrXG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHQTs7QUFzQkE7O0FBQ0E7O0FBT0E7Ozs7Ozs7Ozs7OztBQVlBO0FBQ0E7QUFDQTtBQUNPLE1BQU1BLE9BQU4sQ0FPTDtFQU9BO0VBR0E7RUFHQTs7RUFNQTtBQUNGO0FBQ0E7RUFDRUMsV0FBVyxDQUFDQyxJQUFELEVBQXNCQyxJQUF0QixFQUErQjtJQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBLDhDQXNFakMsS0FBS0MsTUF0RTRCO0lBQUEsOENBNElqQyxLQUFLQyxPQTVJNEI7SUFBQSwyQ0FpSnBDLEtBQUtBLE9BakorQjtJQUFBLGtEQXdLN0IsS0FBS0MsVUF4S3dCO0lBQUEsa0RBa003QixLQUFLQyxXQWxNd0I7SUFBQSxzREE4TXpCLEtBQUtDLGVBOU1vQjtJQUN4QyxLQUFLTCxJQUFMLEdBQVlBLElBQVo7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