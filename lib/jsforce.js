"use strict";

var _WeakMap = require("@babel/runtime-corejs3/core-js-stable/weak-map");

var _Object$defineProperty2 = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

var _Object$getOwnPropertyDescriptor = require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-descriptor");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.default = void 0;
exports.registerModule = registerModule;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/define-property"));

require("core-js/modules/es.array.iterator.js");

var _defineProperty3 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _events = require("events");

var _VERSION = _interopRequireDefault(require("./VERSION"));

var _connection = _interopRequireDefault(require("./connection"));

var _oauth = _interopRequireDefault(require("./oauth2"));

var _date = _interopRequireDefault(require("./date"));

var _registry = _interopRequireDefault(require("./registry"));

var _client = _interopRequireWildcard(require("./browser/client"));

function _getRequireWildcardCache(nodeInterop) { if (typeof _WeakMap !== "function") return null; var cacheBabelInterop = new _WeakMap(); var cacheNodeInterop = new _WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = _Object$defineProperty2 && _Object$getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? _Object$getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { _Object$defineProperty2(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 *
 */
class JSforce extends _events.EventEmitter {
  constructor(...args) {
    super(...args);
    (0, _defineProperty3.default)(this, "VERSION", _VERSION.default);
    (0, _defineProperty3.default)(this, "Connection", _connection.default);
    (0, _defineProperty3.default)(this, "OAuth2", _oauth.default);
    (0, _defineProperty3.default)(this, "SfDate", _date.default);
    (0, _defineProperty3.default)(this, "Date", _date.default);
    (0, _defineProperty3.default)(this, "BrowserClient", _client.BrowserClient);
    (0, _defineProperty3.default)(this, "registry", _registry.default);
    (0, _defineProperty3.default)(this, "browser", _client.default);
  }

}

function registerModule(name, factory) {
  jsforce.on('connection:new', conn => {
    let obj = undefined;
    (0, _defineProperty2.default)(conn, name, {
      get() {
        var _obj;

        obj = (_obj = obj) !== null && _obj !== void 0 ? _obj : factory(conn);
        return obj;
      },

      enumerable: true,
      configurable: true
    });
  });
}

const jsforce = new JSforce();
var _default = jsforce;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJKU2ZvcmNlIiwiRXZlbnRFbWl0dGVyIiwiVkVSU0lPTiIsIkNvbm5lY3Rpb24iLCJPQXV0aDIiLCJTZkRhdGUiLCJCcm93c2VyQ2xpZW50IiwicmVnaXN0cnkiLCJjbGllbnQiLCJyZWdpc3Rlck1vZHVsZSIsIm5hbWUiLCJmYWN0b3J5IiwianNmb3JjZSIsIm9uIiwiY29ubiIsIm9iaiIsInVuZGVmaW5lZCIsImdldCIsImVudW1lcmFibGUiLCJjb25maWd1cmFibGUiXSwic291cmNlcyI6WyIuLi9zcmMvanNmb3JjZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IFZFUlNJT04gZnJvbSAnLi9WRVJTSU9OJztcbmltcG9ydCBDb25uZWN0aW9uIGZyb20gJy4vY29ubmVjdGlvbic7XG5pbXBvcnQgT0F1dGgyIGZyb20gJy4vb2F1dGgyJztcbmltcG9ydCBTZkRhdGUgZnJvbSAnLi9kYXRlJztcbmltcG9ydCByZWdpc3RyeSwgeyBSZWdpc3RyeSB9IGZyb20gJy4vcmVnaXN0cnknO1xuaW1wb3J0IGNsaWVudCwgeyBCcm93c2VyQ2xpZW50IH0gZnJvbSAnLi9icm93c2VyL2NsaWVudCc7XG5cbi8qKlxuICpcbiAqL1xuY2xhc3MgSlNmb3JjZSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIFZFUlNJT046IHR5cGVvZiBWRVJTSU9OID0gVkVSU0lPTjtcbiAgQ29ubmVjdGlvbjogdHlwZW9mIENvbm5lY3Rpb24gPSBDb25uZWN0aW9uO1xuICBPQXV0aDI6IHR5cGVvZiBPQXV0aDIgPSBPQXV0aDI7XG4gIFNmRGF0ZTogdHlwZW9mIFNmRGF0ZSA9IFNmRGF0ZTtcbiAgRGF0ZTogdHlwZW9mIFNmRGF0ZSA9IFNmRGF0ZTtcbiAgQnJvd3NlckNsaWVudDogdHlwZW9mIEJyb3dzZXJDbGllbnQgPSBCcm93c2VyQ2xpZW50O1xuICByZWdpc3RyeTogUmVnaXN0cnkgPSByZWdpc3RyeTtcbiAgYnJvd3NlcjogQnJvd3NlckNsaWVudCA9IGNsaWVudDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyTW9kdWxlKFxuICBuYW1lOiBzdHJpbmcsXG4gIGZhY3Rvcnk6IChjb25uOiBDb25uZWN0aW9uKSA9PiBhbnksXG4pIHtcbiAganNmb3JjZS5vbignY29ubmVjdGlvbjpuZXcnLCAoY29ubjogQ29ubmVjdGlvbikgPT4ge1xuICAgIGxldCBvYmo6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29ubiwgbmFtZSwge1xuICAgICAgZ2V0KCkge1xuICAgICAgICBvYmogPSBvYmogPz8gZmFjdG9yeShjb25uKTtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH0sXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIH0pO1xuICB9KTtcbn1cblxuY29uc3QganNmb3JjZSA9IG5ldyBKU2ZvcmNlKCk7XG5leHBvcnQgZGVmYXVsdCBqc2ZvcmNlO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQSxPQUFOLFNBQXNCQyxvQkFBdEIsQ0FBbUM7RUFBQTtJQUFBO0lBQUEsK0NBQ1BDLGdCQURPO0lBQUEsa0RBRURDLG1CQUZDO0lBQUEsOENBR1RDLGNBSFM7SUFBQSw4Q0FJVEMsYUFKUztJQUFBLDRDQUtYQSxhQUxXO0lBQUEscURBTUtDLHFCQU5MO0lBQUEsZ0RBT1pDLGlCQVBZO0lBQUEsK0NBUVJDLGVBUlE7RUFBQTs7QUFBQTs7QUFXNUIsU0FBU0MsY0FBVCxDQUNMQyxJQURLLEVBRUxDLE9BRkssRUFHTDtFQUNBQyxPQUFPLENBQUNDLEVBQVIsQ0FBVyxnQkFBWCxFQUE4QkMsSUFBRCxJQUFzQjtJQUNqRCxJQUFJQyxHQUFRLEdBQUdDLFNBQWY7SUFDQSw4QkFBc0JGLElBQXRCLEVBQTRCSixJQUE1QixFQUFrQztNQUNoQ08sR0FBRyxHQUFHO1FBQUE7O1FBQ0pGLEdBQUcsV0FBR0EsR0FBSCx1Q0FBVUosT0FBTyxDQUFDRyxJQUFELENBQXBCO1FBQ0EsT0FBT0MsR0FBUDtNQUNELENBSitCOztNQUtoQ0csVUFBVSxFQUFFLElBTG9CO01BTWhDQyxZQUFZLEVBQUU7SUFOa0IsQ0FBbEM7RUFRRCxDQVZEO0FBV0Q7O0FBRUQsTUFBTVAsT0FBTyxHQUFHLElBQUlaLE9BQUosRUFBaEI7ZUFDZVksTyJ9