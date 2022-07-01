"use strict";

var _WeakMap = require("@babel/runtime-corejs3/core-js-stable/weak-map");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

var _Object$getOwnPropertyDescriptor = require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-descriptor");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

_Object$defineProperty(exports, "Client", {
  enumerable: true,
  get: function () {
    return _faye.Client;
  }
});

exports.StreamingExtension = exports.Streaming = void 0;

_Object$defineProperty(exports, "Subscription", {
  enumerable: true,
  get: function () {
    return _faye.Subscription;
  }
});

exports.default = void 0;

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/index-of"));

require("core-js/modules/es.promise.js");

require("core-js/modules/es.array.iterator.js");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _events = require("events");

var _faye = require("faye");

var _jsforce = require("../jsforce");

var StreamingExtension = _interopRequireWildcard(require("./streaming/extension"));

exports.StreamingExtension = StreamingExtension;

function _getRequireWildcardCache(nodeInterop) { if (typeof _WeakMap !== "function") return null; var cacheBabelInterop = new _WeakMap(); var cacheNodeInterop = new _WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = _Object$defineProperty && _Object$getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? _Object$getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { _Object$defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * @file Manages Streaming APIs
 * @author Shinichi Tomita <shinichi.tomita@gmail.com>
 */

/*--------------------------------------------*/

/**
 * Streaming API topic class
 */
class Topic {
  constructor(streaming, name) {
    (0, _defineProperty2.default)(this, "_streaming", void 0);
    (0, _defineProperty2.default)(this, "name", void 0);
    this._streaming = streaming;
    this.name = name;
  }
  /**
   * Subscribe listener to topic
   */


  subscribe(listener) {
    return this._streaming.subscribe(this.name, listener);
  }
  /**
   * Unsubscribe listener from topic
   */


  unsubscribe(subscr) {
    this._streaming.unsubscribe(this.name, subscr);

    return this;
  }

}
/*--------------------------------------------*/

/**
 * Streaming API Generic Streaming Channel
 */


class Channel {
  constructor(streaming, name) {
    (0, _defineProperty2.default)(this, "_streaming", void 0);
    (0, _defineProperty2.default)(this, "_id", void 0);
    (0, _defineProperty2.default)(this, "name", void 0);
    this._streaming = streaming;
    this.name = name;
  }
  /**
   * Subscribe to channel
   */


  subscribe(listener) {
    return this._streaming.subscribe(this.name, listener);
  }

  unsubscribe(subscr) {
    this._streaming.unsubscribe(this.name, subscr);

    return this;
  }

  async push(events) {
    const isArray = (0, _isArray.default)(events);
    const pushEvents = (0, _isArray.default)(events) ? events : [events];
    const conn = this._streaming._conn;

    if (!this._id) {
      this._id = conn.sobject('StreamingChannel').findOne({
        Name: this.name
      }, ['Id']).then(rec => rec === null || rec === void 0 ? void 0 : rec.Id);
    }

    const id = await this._id;

    if (!id) {
      throw new Error(`No streaming channel available for name: ${this.name}`);
    }

    const channelUrl = `/sobjects/StreamingChannel/${id}/push`;
    const rets = await conn.requestPost(channelUrl, {
      pushEvents
    });
    return isArray ? rets : rets[0];
  }

}
/*--------------------------------------------*/

/**
 * Streaming API class
 */


class Streaming extends _events.EventEmitter {
  /**
   *
   */
  constructor(conn) {
    super();
    (0, _defineProperty2.default)(this, "_conn", void 0);
    (0, _defineProperty2.default)(this, "_topics", {});
    (0, _defineProperty2.default)(this, "_fayeClients", {});
    this._conn = conn;
  }
  /* @private */


  _createClient(forChannelName, extensions) {
    var _context;

    // forChannelName is advisory, for an API workaround. It does not restrict or select the channel.
    const needsReplayFix = typeof forChannelName === 'string' && (0, _indexOf.default)(forChannelName).call(forChannelName, '/u/') === 0;
    const endpointUrl = [this._conn.instanceUrl, // special endpoint "/cometd/replay/xx.x" is only available in 36.0.
    // See https://releasenotes.docs.salesforce.com/en-us/summer16/release-notes/rn_api_streaming_classic_replay.htm
    'cometd' + (needsReplayFix === true && this._conn.version === '36.0' ? '/replay' : ''), this._conn.version].join('/');
    const fayeClient = new _faye.Client(endpointUrl, {});
    fayeClient.setHeader('Authorization', 'OAuth ' + this._conn.accessToken);

    if ((0, _isArray.default)(extensions)) {
      for (const extension of extensions) {
        fayeClient.addExtension(extension);
      }
    } // prevent streaming API server error


    const dispatcher = fayeClient._dispatcher;

    if ((0, _indexOf.default)(_context = dispatcher.getConnectionTypes()).call(_context, 'callback-polling') === -1) {
      dispatcher.selectTransport('long-polling');
      dispatcher._transport.batching = false;
    }

    return fayeClient;
  }
  /** @private **/


  _getFayeClient(channelName) {
    const isGeneric = (0, _indexOf.default)(channelName).call(channelName, '/u/') === 0;
    const clientType = isGeneric ? 'generic' : 'pushTopic';

    if (!this._fayeClients[clientType]) {
      this._fayeClients[clientType] = this._createClient(channelName);
    }

    return this._fayeClients[clientType];
  }
  /**
   * Get named topic
   */


  topic(name) {
    this._topics = this._topics || {};
    const topic = this._topics[name] = this._topics[name] || new Topic(this, name);
    return topic;
  }
  /**
   * Get channel for channel name
   */


  channel(name) {
    return new Channel(this, name);
  }
  /**
   * Subscribe topic/channel
   */


  subscribe(name, listener) {
    const channelName = (0, _indexOf.default)(name).call(name, '/') === 0 ? name : '/topic/' + name;

    const fayeClient = this._getFayeClient(channelName);

    return fayeClient.subscribe(channelName, listener);
  }
  /**
   * Unsubscribe topic
   */


  unsubscribe(name, subscription) {
    const channelName = (0, _indexOf.default)(name).call(name, '/') === 0 ? name : '/topic/' + name;

    const fayeClient = this._getFayeClient(channelName);

    fayeClient.unsubscribe(channelName, subscription);
    return this;
  }
  /**
   * Create a Streaming client, optionally with extensions
   *
   * See Faye docs for implementation details: https://faye.jcoglan.com/browser/extensions.html
   *
   * Example usage:
   *
   * ```javascript
   * const jsforce = require('jsforce');
   *
   * // Establish a Salesforce connection. (Details elided)
   * const conn = new jsforce.Connection({ … });
   *
   * const fayeClient = conn.streaming.createClient();
   *
   * const subscription = fayeClient.subscribe(channel, data => {
   *   console.log('topic received data', data);
   * });
   *
   * subscription.cancel();
   * ```
   *
   * Example with extensions, using Replay & Auth Failure extensions in a server-side Node.js app:
   *
   * ```javascript
   * const jsforce = require('jsforce');
   * const { StreamingExtension } = require('jsforce/api/streaming');
   *
   * // Establish a Salesforce connection. (Details elided)
   * const conn = new jsforce.Connection({ … });
   *
   * const channel = "/event/My_Event__e";
   * const replayId = -2; // -2 is all retained events
   *
   * const exitCallback = () => process.exit(1);
   * const authFailureExt = new StreamingExtension.AuthFailure(exitCallback);
   *
   * const replayExt = new StreamingExtension.Replay(channel, replayId);
   *
   * const fayeClient = conn.streaming.createClient([
   *   authFailureExt,
   *   replayExt
   * ]);
   *
   * const subscription = fayeClient.subscribe(channel, data => {
   *   console.log('topic received data', data);
   * });
   *
   * subscription.cancel();
   * ```
   */


  createClient(extensions) {
    return this._createClient(null, extensions);
  }

}

exports.Streaming = Streaming;

/*--------------------------------------------*/

/*
 * Register hook in connection instantiation for dynamically adding this API module features
 */
(0, _jsforce.registerModule)('streaming', conn => new Streaming(conn));
var _default = Streaming;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUb3BpYyIsImNvbnN0cnVjdG9yIiwic3RyZWFtaW5nIiwibmFtZSIsIl9zdHJlYW1pbmciLCJzdWJzY3JpYmUiLCJsaXN0ZW5lciIsInVuc3Vic2NyaWJlIiwic3Vic2NyIiwiQ2hhbm5lbCIsInB1c2giLCJldmVudHMiLCJpc0FycmF5IiwicHVzaEV2ZW50cyIsImNvbm4iLCJfY29ubiIsIl9pZCIsInNvYmplY3QiLCJmaW5kT25lIiwiTmFtZSIsInRoZW4iLCJyZWMiLCJJZCIsImlkIiwiRXJyb3IiLCJjaGFubmVsVXJsIiwicmV0cyIsInJlcXVlc3RQb3N0IiwiU3RyZWFtaW5nIiwiRXZlbnRFbWl0dGVyIiwiX2NyZWF0ZUNsaWVudCIsImZvckNoYW5uZWxOYW1lIiwiZXh0ZW5zaW9ucyIsIm5lZWRzUmVwbGF5Rml4IiwiZW5kcG9pbnRVcmwiLCJpbnN0YW5jZVVybCIsInZlcnNpb24iLCJqb2luIiwiZmF5ZUNsaWVudCIsIkNsaWVudCIsInNldEhlYWRlciIsImFjY2Vzc1Rva2VuIiwiZXh0ZW5zaW9uIiwiYWRkRXh0ZW5zaW9uIiwiZGlzcGF0Y2hlciIsIl9kaXNwYXRjaGVyIiwiZ2V0Q29ubmVjdGlvblR5cGVzIiwic2VsZWN0VHJhbnNwb3J0IiwiX3RyYW5zcG9ydCIsImJhdGNoaW5nIiwiX2dldEZheWVDbGllbnQiLCJjaGFubmVsTmFtZSIsImlzR2VuZXJpYyIsImNsaWVudFR5cGUiLCJfZmF5ZUNsaWVudHMiLCJ0b3BpYyIsIl90b3BpY3MiLCJjaGFubmVsIiwic3Vic2NyaXB0aW9uIiwiY3JlYXRlQ2xpZW50IiwicmVnaXN0ZXJNb2R1bGUiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvYXBpL3N0cmVhbWluZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIE1hbmFnZXMgU3RyZWFtaW5nIEFQSXNcbiAqIEBhdXRob3IgU2hpbmljaGkgVG9taXRhIDxzaGluaWNoaS50b21pdGFAZ21haWwuY29tPlxuICovXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHsgQ2xpZW50LCBTdWJzY3JpcHRpb24gfSBmcm9tICdmYXllJztcbmltcG9ydCB7IHJlZ2lzdGVyTW9kdWxlIH0gZnJvbSAnLi4vanNmb3JjZSc7XG5pbXBvcnQgQ29ubmVjdGlvbiBmcm9tICcuLi9jb25uZWN0aW9uJztcbmltcG9ydCB7IFJlY29yZCwgU2NoZW1hIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0ICogYXMgU3RyZWFtaW5nRXh0ZW5zaW9uIGZyb20gJy4vc3RyZWFtaW5nL2V4dGVuc2lvbic7XG5cbi8qKlxuICpcbiAqL1xuZXhwb3J0IHR5cGUgU3RyZWFtaW5nTWVzc2FnZTxSIGV4dGVuZHMgUmVjb3JkPiA9IHtcbiAgZXZlbnQ6IHtcbiAgICB0eXBlOiBzdHJpbmc7XG4gICAgY3JlYXRlZERhdGU6IHN0cmluZztcbiAgICByZXBsYXlJZDogbnVtYmVyO1xuICB9O1xuICBzb2JqZWN0OiBSO1xufTtcblxuZXhwb3J0IHR5cGUgR2VuZXJpY1N0cmVhbWluZ01lc3NhZ2UgPSB7XG4gIGV2ZW50OiB7XG4gICAgY3JlYXRlZERhdGU6IHN0cmluZztcbiAgICByZXBsYXlJZDogbnVtYmVyO1xuICB9O1xuICBwYXlsb2FkOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBQdXNoRXZlbnQgPSB7XG4gIHBheWxvYWQ6IHN0cmluZztcbiAgdXNlcklkczogc3RyaW5nW107XG59O1xuXG5leHBvcnQgdHlwZSBQdXNoRXZlbnRSZXN1bHQgPSB7XG4gIGZhbm91dENvdW50OiBudW1iZXI7XG4gIHVzZXJPbmxpbmVTdGF0dXM6IHtcbiAgICBbdXNlcklkOiBzdHJpbmddOiBib29sZWFuO1xuICB9O1xufTtcblxuZXhwb3J0IHsgQ2xpZW50LCBTdWJzY3JpcHRpb24gfTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKipcbiAqIFN0cmVhbWluZyBBUEkgdG9waWMgY2xhc3NcbiAqL1xuY2xhc3MgVG9waWM8UyBleHRlbmRzIFNjaGVtYSwgUiBleHRlbmRzIFJlY29yZD4ge1xuICBfc3RyZWFtaW5nOiBTdHJlYW1pbmc8Uz47XG4gIG5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihzdHJlYW1pbmc6IFN0cmVhbWluZzxTPiwgbmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fc3RyZWFtaW5nID0gc3RyZWFtaW5nO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlIGxpc3RlbmVyIHRvIHRvcGljXG4gICAqL1xuICBzdWJzY3JpYmUobGlzdGVuZXI6IChtZXNzYWdlOiBTdHJlYW1pbmdNZXNzYWdlPFI+KSA9PiB2b2lkKTogU3Vic2NyaXB0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fc3RyZWFtaW5nLnN1YnNjcmliZSh0aGlzLm5hbWUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbnN1YnNjcmliZSBsaXN0ZW5lciBmcm9tIHRvcGljXG4gICAqL1xuICB1bnN1YnNjcmliZShzdWJzY3I6IFN1YnNjcmlwdGlvbikge1xuICAgIHRoaXMuX3N0cmVhbWluZy51bnN1YnNjcmliZSh0aGlzLm5hbWUsIHN1YnNjcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKipcbiAqIFN0cmVhbWluZyBBUEkgR2VuZXJpYyBTdHJlYW1pbmcgQ2hhbm5lbFxuICovXG5jbGFzcyBDaGFubmVsPFMgZXh0ZW5kcyBTY2hlbWE+IHtcbiAgX3N0cmVhbWluZzogU3RyZWFtaW5nPFM+O1xuICBfaWQ6IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPiB8IHVuZGVmaW5lZDtcbiAgbmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHN0cmVhbWluZzogU3RyZWFtaW5nPFM+LCBuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9zdHJlYW1pbmcgPSBzdHJlYW1pbmc7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmUgdG8gY2hhbm5lbFxuICAgKi9cbiAgc3Vic2NyaWJlKGxpc3RlbmVyOiBGdW5jdGlvbik6IFN1YnNjcmlwdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0cmVhbWluZy5zdWJzY3JpYmUodGhpcy5uYW1lLCBsaXN0ZW5lcik7XG4gIH1cblxuICB1bnN1YnNjcmliZShzdWJzY3I6IFN1YnNjcmlwdGlvbikge1xuICAgIHRoaXMuX3N0cmVhbWluZy51bnN1YnNjcmliZSh0aGlzLm5hbWUsIHN1YnNjcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdXNoKGV2ZW50czogUHVzaEV2ZW50KTogUHJvbWlzZTxQdXNoRXZlbnRSZXN1bHQ+O1xuICBwdXNoKGV2ZW50czogUHVzaEV2ZW50KTogUHJvbWlzZTxQdXNoRXZlbnRSZXN1bHRbXT47XG4gIGFzeW5jIHB1c2goZXZlbnRzOiBQdXNoRXZlbnQgfCBQdXNoRXZlbnRbXSkge1xuICAgIGNvbnN0IGlzQXJyYXkgPSBBcnJheS5pc0FycmF5KGV2ZW50cyk7XG4gICAgY29uc3QgcHVzaEV2ZW50cyA9IEFycmF5LmlzQXJyYXkoZXZlbnRzKSA/IGV2ZW50cyA6IFtldmVudHNdO1xuICAgIGNvbnN0IGNvbm46IENvbm5lY3Rpb24gPSAodGhpcy5fc3RyZWFtaW5nLl9jb25uIGFzIHVua25vd24pIGFzIENvbm5lY3Rpb247XG4gICAgaWYgKCF0aGlzLl9pZCkge1xuICAgICAgdGhpcy5faWQgPSBjb25uXG4gICAgICAgIC5zb2JqZWN0KCdTdHJlYW1pbmdDaGFubmVsJylcbiAgICAgICAgLmZpbmRPbmUoeyBOYW1lOiB0aGlzLm5hbWUgfSwgWydJZCddKVxuICAgICAgICAudGhlbigocmVjKSA9PiByZWM/LklkKTtcbiAgICB9XG4gICAgY29uc3QgaWQgPSBhd2FpdCB0aGlzLl9pZDtcbiAgICBpZiAoIWlkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHN0cmVhbWluZyBjaGFubmVsIGF2YWlsYWJsZSBmb3IgbmFtZTogJHt0aGlzLm5hbWV9YCk7XG4gICAgfVxuICAgIGNvbnN0IGNoYW5uZWxVcmwgPSBgL3NvYmplY3RzL1N0cmVhbWluZ0NoYW5uZWwvJHtpZH0vcHVzaGA7XG4gICAgY29uc3QgcmV0cyA9IGF3YWl0IGNvbm4ucmVxdWVzdFBvc3Q8UHVzaEV2ZW50UmVzdWx0W10+KGNoYW5uZWxVcmwsIHtcbiAgICAgIHB1c2hFdmVudHMsXG4gICAgfSk7XG4gICAgcmV0dXJuIGlzQXJyYXkgPyByZXRzIDogcmV0c1swXTtcbiAgfVxufVxuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qKlxuICogU3RyZWFtaW5nIEFQSSBjbGFzc1xuICovXG5leHBvcnQgY2xhc3MgU3RyZWFtaW5nPFMgZXh0ZW5kcyBTY2hlbWE+IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgX2Nvbm46IENvbm5lY3Rpb248Uz47XG4gIF90b3BpY3M6IHsgW25hbWU6IHN0cmluZ106IFRvcGljPFMsIFJlY29yZD4gfSA9IHt9O1xuICBfZmF5ZUNsaWVudHM6IHsgW2NsaWVudFR5cGU6IHN0cmluZ106IENsaWVudCB9ID0ge307XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb25uOiBDb25uZWN0aW9uPFM+KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9jb25uID0gY29ubjtcbiAgfVxuXG4gIC8qIEBwcml2YXRlICovXG4gIF9jcmVhdGVDbGllbnQoZm9yQ2hhbm5lbE5hbWU/OiBzdHJpbmcgfCBudWxsLCBleHRlbnNpb25zPzogYW55W10pIHtcbiAgICAvLyBmb3JDaGFubmVsTmFtZSBpcyBhZHZpc29yeSwgZm9yIGFuIEFQSSB3b3JrYXJvdW5kLiBJdCBkb2VzIG5vdCByZXN0cmljdCBvciBzZWxlY3QgdGhlIGNoYW5uZWwuXG4gICAgY29uc3QgbmVlZHNSZXBsYXlGaXggPVxuICAgICAgdHlwZW9mIGZvckNoYW5uZWxOYW1lID09PSAnc3RyaW5nJyAmJiBmb3JDaGFubmVsTmFtZS5pbmRleE9mKCcvdS8nKSA9PT0gMDtcbiAgICBjb25zdCBlbmRwb2ludFVybCA9IFtcbiAgICAgIHRoaXMuX2Nvbm4uaW5zdGFuY2VVcmwsXG4gICAgICAvLyBzcGVjaWFsIGVuZHBvaW50IFwiL2NvbWV0ZC9yZXBsYXkveHgueFwiIGlzIG9ubHkgYXZhaWxhYmxlIGluIDM2LjAuXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9yZWxlYXNlbm90ZXMuZG9jcy5zYWxlc2ZvcmNlLmNvbS9lbi11cy9zdW1tZXIxNi9yZWxlYXNlLW5vdGVzL3JuX2FwaV9zdHJlYW1pbmdfY2xhc3NpY19yZXBsYXkuaHRtXG4gICAgICAnY29tZXRkJyArXG4gICAgICAgIChuZWVkc1JlcGxheUZpeCA9PT0gdHJ1ZSAmJiB0aGlzLl9jb25uLnZlcnNpb24gPT09ICczNi4wJ1xuICAgICAgICAgID8gJy9yZXBsYXknXG4gICAgICAgICAgOiAnJyksXG4gICAgICB0aGlzLl9jb25uLnZlcnNpb24sXG4gICAgXS5qb2luKCcvJyk7XG4gICAgY29uc3QgZmF5ZUNsaWVudCA9IG5ldyBDbGllbnQoZW5kcG9pbnRVcmwsIHt9KTtcbiAgICBmYXllQ2xpZW50LnNldEhlYWRlcignQXV0aG9yaXphdGlvbicsICdPQXV0aCAnICsgdGhpcy5fY29ubi5hY2Nlc3NUb2tlbik7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZXh0ZW5zaW9ucykpIHtcbiAgICAgIGZvciAoY29uc3QgZXh0ZW5zaW9uIG9mIGV4dGVuc2lvbnMpIHtcbiAgICAgICAgZmF5ZUNsaWVudC5hZGRFeHRlbnNpb24oZXh0ZW5zaW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gcHJldmVudCBzdHJlYW1pbmcgQVBJIHNlcnZlciBlcnJvclxuICAgIGNvbnN0IGRpc3BhdGNoZXIgPSAoZmF5ZUNsaWVudCBhcyBhbnkpLl9kaXNwYXRjaGVyO1xuICAgIGlmIChkaXNwYXRjaGVyLmdldENvbm5lY3Rpb25UeXBlcygpLmluZGV4T2YoJ2NhbGxiYWNrLXBvbGxpbmcnKSA9PT0gLTEpIHtcbiAgICAgIGRpc3BhdGNoZXIuc2VsZWN0VHJhbnNwb3J0KCdsb25nLXBvbGxpbmcnKTtcbiAgICAgIGRpc3BhdGNoZXIuX3RyYW5zcG9ydC5iYXRjaGluZyA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gZmF5ZUNsaWVudDtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqKi9cbiAgX2dldEZheWVDbGllbnQoY2hhbm5lbE5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGlzR2VuZXJpYyA9IGNoYW5uZWxOYW1lLmluZGV4T2YoJy91LycpID09PSAwO1xuICAgIGNvbnN0IGNsaWVudFR5cGUgPSBpc0dlbmVyaWMgPyAnZ2VuZXJpYycgOiAncHVzaFRvcGljJztcbiAgICBpZiAoIXRoaXMuX2ZheWVDbGllbnRzW2NsaWVudFR5cGVdKSB7XG4gICAgICB0aGlzLl9mYXllQ2xpZW50c1tjbGllbnRUeXBlXSA9IHRoaXMuX2NyZWF0ZUNsaWVudChjaGFubmVsTmFtZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9mYXllQ2xpZW50c1tjbGllbnRUeXBlXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgbmFtZWQgdG9waWNcbiAgICovXG4gIHRvcGljPFIgZXh0ZW5kcyBSZWNvcmQgPSBSZWNvcmQ+KG5hbWU6IHN0cmluZyk6IFRvcGljPFMsIFI+IHtcbiAgICB0aGlzLl90b3BpY3MgPSB0aGlzLl90b3BpY3MgfHwge307XG4gICAgY29uc3QgdG9waWMgPSAodGhpcy5fdG9waWNzW25hbWVdID1cbiAgICAgIHRoaXMuX3RvcGljc1tuYW1lXSB8fCBuZXcgVG9waWM8UywgUj4odGhpcywgbmFtZSkpO1xuICAgIHJldHVybiB0b3BpYyBhcyBUb3BpYzxTLCBSPjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY2hhbm5lbCBmb3IgY2hhbm5lbCBuYW1lXG4gICAqL1xuICBjaGFubmVsKG5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgQ2hhbm5lbCh0aGlzLCBuYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmUgdG9waWMvY2hhbm5lbFxuICAgKi9cbiAgc3Vic2NyaWJlKG5hbWU6IHN0cmluZywgbGlzdGVuZXI6IEZ1bmN0aW9uKTogU3Vic2NyaXB0aW9uIHtcbiAgICBjb25zdCBjaGFubmVsTmFtZSA9IG5hbWUuaW5kZXhPZignLycpID09PSAwID8gbmFtZSA6ICcvdG9waWMvJyArIG5hbWU7XG4gICAgY29uc3QgZmF5ZUNsaWVudCA9IHRoaXMuX2dldEZheWVDbGllbnQoY2hhbm5lbE5hbWUpO1xuICAgIHJldHVybiBmYXllQ2xpZW50LnN1YnNjcmliZShjaGFubmVsTmFtZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVuc3Vic2NyaWJlIHRvcGljXG4gICAqL1xuICB1bnN1YnNjcmliZShuYW1lOiBzdHJpbmcsIHN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uKSB7XG4gICAgY29uc3QgY2hhbm5lbE5hbWUgPSBuYW1lLmluZGV4T2YoJy8nKSA9PT0gMCA/IG5hbWUgOiAnL3RvcGljLycgKyBuYW1lO1xuICAgIGNvbnN0IGZheWVDbGllbnQgPSB0aGlzLl9nZXRGYXllQ2xpZW50KGNoYW5uZWxOYW1lKTtcbiAgICBmYXllQ2xpZW50LnVuc3Vic2NyaWJlKGNoYW5uZWxOYW1lLCBzdWJzY3JpcHRpb24pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIFN0cmVhbWluZyBjbGllbnQsIG9wdGlvbmFsbHkgd2l0aCBleHRlbnNpb25zXG4gICAqXG4gICAqIFNlZSBGYXllIGRvY3MgZm9yIGltcGxlbWVudGF0aW9uIGRldGFpbHM6IGh0dHBzOi8vZmF5ZS5qY29nbGFuLmNvbS9icm93c2VyL2V4dGVuc2lvbnMuaHRtbFxuICAgKlxuICAgKiBFeGFtcGxlIHVzYWdlOlxuICAgKlxuICAgKiBgYGBqYXZhc2NyaXB0XG4gICAqIGNvbnN0IGpzZm9yY2UgPSByZXF1aXJlKCdqc2ZvcmNlJyk7XG4gICAqXG4gICAqIC8vIEVzdGFibGlzaCBhIFNhbGVzZm9yY2UgY29ubmVjdGlvbi4gKERldGFpbHMgZWxpZGVkKVxuICAgKiBjb25zdCBjb25uID0gbmV3IGpzZm9yY2UuQ29ubmVjdGlvbih7IOKApiB9KTtcbiAgICpcbiAgICogY29uc3QgZmF5ZUNsaWVudCA9IGNvbm4uc3RyZWFtaW5nLmNyZWF0ZUNsaWVudCgpO1xuICAgKlxuICAgKiBjb25zdCBzdWJzY3JpcHRpb24gPSBmYXllQ2xpZW50LnN1YnNjcmliZShjaGFubmVsLCBkYXRhID0+IHtcbiAgICogICBjb25zb2xlLmxvZygndG9waWMgcmVjZWl2ZWQgZGF0YScsIGRhdGEpO1xuICAgKiB9KTtcbiAgICpcbiAgICogc3Vic2NyaXB0aW9uLmNhbmNlbCgpO1xuICAgKiBgYGBcbiAgICpcbiAgICogRXhhbXBsZSB3aXRoIGV4dGVuc2lvbnMsIHVzaW5nIFJlcGxheSAmIEF1dGggRmFpbHVyZSBleHRlbnNpb25zIGluIGEgc2VydmVyLXNpZGUgTm9kZS5qcyBhcHA6XG4gICAqXG4gICAqIGBgYGphdmFzY3JpcHRcbiAgICogY29uc3QganNmb3JjZSA9IHJlcXVpcmUoJ2pzZm9yY2UnKTtcbiAgICogY29uc3QgeyBTdHJlYW1pbmdFeHRlbnNpb24gfSA9IHJlcXVpcmUoJ2pzZm9yY2UvYXBpL3N0cmVhbWluZycpO1xuICAgKlxuICAgKiAvLyBFc3RhYmxpc2ggYSBTYWxlc2ZvcmNlIGNvbm5lY3Rpb24uIChEZXRhaWxzIGVsaWRlZClcbiAgICogY29uc3QgY29ubiA9IG5ldyBqc2ZvcmNlLkNvbm5lY3Rpb24oeyDigKYgfSk7XG4gICAqXG4gICAqIGNvbnN0IGNoYW5uZWwgPSBcIi9ldmVudC9NeV9FdmVudF9fZVwiO1xuICAgKiBjb25zdCByZXBsYXlJZCA9IC0yOyAvLyAtMiBpcyBhbGwgcmV0YWluZWQgZXZlbnRzXG4gICAqXG4gICAqIGNvbnN0IGV4aXRDYWxsYmFjayA9ICgpID0+IHByb2Nlc3MuZXhpdCgxKTtcbiAgICogY29uc3QgYXV0aEZhaWx1cmVFeHQgPSBuZXcgU3RyZWFtaW5nRXh0ZW5zaW9uLkF1dGhGYWlsdXJlKGV4aXRDYWxsYmFjayk7XG4gICAqXG4gICAqIGNvbnN0IHJlcGxheUV4dCA9IG5ldyBTdHJlYW1pbmdFeHRlbnNpb24uUmVwbGF5KGNoYW5uZWwsIHJlcGxheUlkKTtcbiAgICpcbiAgICogY29uc3QgZmF5ZUNsaWVudCA9IGNvbm4uc3RyZWFtaW5nLmNyZWF0ZUNsaWVudChbXG4gICAqICAgYXV0aEZhaWx1cmVFeHQsXG4gICAqICAgcmVwbGF5RXh0XG4gICAqIF0pO1xuICAgKlxuICAgKiBjb25zdCBzdWJzY3JpcHRpb24gPSBmYXllQ2xpZW50LnN1YnNjcmliZShjaGFubmVsLCBkYXRhID0+IHtcbiAgICogICBjb25zb2xlLmxvZygndG9waWMgcmVjZWl2ZWQgZGF0YScsIGRhdGEpO1xuICAgKiB9KTtcbiAgICpcbiAgICogc3Vic2NyaXB0aW9uLmNhbmNlbCgpO1xuICAgKiBgYGBcbiAgICovXG4gIGNyZWF0ZUNsaWVudChleHRlbnNpb25zOiBhbnlbXSkge1xuICAgIHJldHVybiB0aGlzLl9jcmVhdGVDbGllbnQobnVsbCwgZXh0ZW5zaW9ucyk7XG4gIH1cbn1cblxuZXhwb3J0IHsgU3RyZWFtaW5nRXh0ZW5zaW9uIH07XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLypcbiAqIFJlZ2lzdGVyIGhvb2sgaW4gY29ubmVjdGlvbiBpbnN0YW50aWF0aW9uIGZvciBkeW5hbWljYWxseSBhZGRpbmcgdGhpcyBBUEkgbW9kdWxlIGZlYXR1cmVzXG4gKi9cbnJlZ2lzdGVyTW9kdWxlKCdzdHJlYW1pbmcnLCAoY29ubikgPT4gbmV3IFN0cmVhbWluZyhjb25uKSk7XG5cbmV4cG9ydCBkZWZhdWx0IFN0cmVhbWluZztcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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