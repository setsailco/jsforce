"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.Replay = exports.AuthFailure = void 0;

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/parse-int"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

/**
 * Faye Client extensions: https://faye.jcoglan.com/browser/extensions.html
 *
 * For use with Streaming.prototype.createClient()
 **/

/*-------------------------------------------*/

/**
 * Constructor for an auth failure detector extension
 *
 * Based on new feature released with Salesforce Spring '18:
 * https://releasenotes.docs.salesforce.com/en-us/spring18/release-notes/rn_messaging_cometd_auth_validation.htm?edition=&impact=
 *
 * Example triggering error message:
 *
 * ```
 * {
 *   "ext":{
 *     "sfdc":{"failureReason":"401::Authentication invalid"},
 *     "replay":true},
 *   "advice":{"reconnect":"none"},
 *   "channel":"/meta/handshake",
 *   "error":"403::Handshake denied",
 *   "successful":false
 * }
 * ```
 *
 * Example usage:
 *
 * ```javascript
 * const jsforce = require('jsforce');
 * const { StreamingExtension } = require('jsforce/api/streaming');
 *
 * const conn = new jsforce.Connection({ … });
 *
 * const channel = "/event/My_Event__e";
 *
 * // Exit the Node process when auth fails
 * const exitCallback = () => process.exit(1);
 * const authFailureExt = new StreamingExtension.AuthFailure(exitCallback);
 *
 * const fayeClient = conn.streaming.createClient([ authFailureExt ]);
 *
 * const subscription = fayeClient.subscribe(channel, data => {
 *   console.log('topic received data', data);
 * });
 *
 * subscription.cancel();
 * ```
 *
 * @param {Function} failureCallback - Invoked when authentication becomes invalid
 */
class AuthFailure {
  constructor(failureCallback) {
    (0, _defineProperty2.default)(this, "_failureCallback", void 0);
    this._failureCallback = failureCallback;
  }

  incoming(message, callback) {
    if ((message.channel === '/meta/connect' || message.channel === '/meta/handshake') && message.advice && message.advice.reconnect == 'none') {
      this._failureCallback(message);
    } else {
      callback(message);
    }
  }

}
/*-------------------------------------------*/


exports.AuthFailure = AuthFailure;
const REPLAY_FROM_KEY = 'replay';
/**
 * Constructor for a durable streaming replay extension
 *
 * Modified from original Salesforce demo source code:
 * https://github.com/developerforce/SalesforceDurableStreamingDemo/blob/3d4a56eac956f744ad6c22e6a8141b6feb57abb9/staticresources/cometdReplayExtension.resource
 *
 * Example usage:
 *
 * ```javascript
 * const jsforce = require('jsforce');
 * const { StreamingExtension } = require('jsforce/api/streaming');
 
 * const conn = new jsforce.Connection({ … });
 *
 * const channel = "/event/My_Event__e";
 * const replayId = -2; // -2 is all retained events
 *
 * const replayExt = new StreamingExtension.Replay(channel, replayId);
 *
 * const fayeClient = conn.streaming.createClient([ replayExt ]);
 *
 * const subscription = fayeClient.subscribe(channel, data => {
 *   console.log('topic received data', data);
 * });
 *
 * subscription.cancel();
 * ```
 */

class Replay {
  constructor(channel, replayId) {
    (0, _defineProperty2.default)(this, "_extensionEnabled", void 0);
    (0, _defineProperty2.default)(this, "_replay", void 0);
    (0, _defineProperty2.default)(this, "_channel", void 0);
    this._extensionEnabled = replayId != null;
    this._channel = channel;
    this._replay = replayId;
  }

  setExtensionEnabled(extensionEnabled) {
    this._extensionEnabled = extensionEnabled;
  }

  setReplay(replay) {
    this._replay = (0, _parseInt2.default)(replay, 10);
  }

  setChannel(channel) {
    this._channel = channel;
  }

  incoming(message, callback) {
    if (message.channel === '/meta/handshake') {
      if (message.ext && message.ext[REPLAY_FROM_KEY] == true) {
        this._extensionEnabled = true;
      }
    } else if (message.channel === this._channel && message.data && message.data.event && message.data.event.replayId) {
      this._replay = message.data.event.replayId;
    }

    callback(message);
  }

  outgoing(message, callback) {
    if (message.channel === '/meta/subscribe') {
      if (this._extensionEnabled) {
        if (!message.ext) {
          message.ext = {};
        }

        const replayFromMap = {
          [this._channel]: this._replay
        }; // add "ext : { "replay" : { CHANNEL : REPLAY_VALUE }}" to subscribe message

        message.ext[REPLAY_FROM_KEY] = replayFromMap;
      }
    }

    callback(message);
  }

}

exports.Replay = Replay;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBdXRoRmFpbHVyZSIsImNvbnN0cnVjdG9yIiwiZmFpbHVyZUNhbGxiYWNrIiwiX2ZhaWx1cmVDYWxsYmFjayIsImluY29taW5nIiwibWVzc2FnZSIsImNhbGxiYWNrIiwiY2hhbm5lbCIsImFkdmljZSIsInJlY29ubmVjdCIsIlJFUExBWV9GUk9NX0tFWSIsIlJlcGxheSIsInJlcGxheUlkIiwiX2V4dGVuc2lvbkVuYWJsZWQiLCJfY2hhbm5lbCIsIl9yZXBsYXkiLCJzZXRFeHRlbnNpb25FbmFibGVkIiwiZXh0ZW5zaW9uRW5hYmxlZCIsInNldFJlcGxheSIsInJlcGxheSIsInNldENoYW5uZWwiLCJleHQiLCJkYXRhIiwiZXZlbnQiLCJvdXRnb2luZyIsInJlcGxheUZyb21NYXAiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpL3N0cmVhbWluZy9leHRlbnNpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBGYXllIENsaWVudCBleHRlbnNpb25zOiBodHRwczovL2ZheWUuamNvZ2xhbi5jb20vYnJvd3Nlci9leHRlbnNpb25zLmh0bWxcbiAqXG4gKiBGb3IgdXNlIHdpdGggU3RyZWFtaW5nLnByb3RvdHlwZS5jcmVhdGVDbGllbnQoKVxuICoqL1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyoqXG4gKiBDb25zdHJ1Y3RvciBmb3IgYW4gYXV0aCBmYWlsdXJlIGRldGVjdG9yIGV4dGVuc2lvblxuICpcbiAqIEJhc2VkIG9uIG5ldyBmZWF0dXJlIHJlbGVhc2VkIHdpdGggU2FsZXNmb3JjZSBTcHJpbmcgJzE4OlxuICogaHR0cHM6Ly9yZWxlYXNlbm90ZXMuZG9jcy5zYWxlc2ZvcmNlLmNvbS9lbi11cy9zcHJpbmcxOC9yZWxlYXNlLW5vdGVzL3JuX21lc3NhZ2luZ19jb21ldGRfYXV0aF92YWxpZGF0aW9uLmh0bT9lZGl0aW9uPSZpbXBhY3Q9XG4gKlxuICogRXhhbXBsZSB0cmlnZ2VyaW5nIGVycm9yIG1lc3NhZ2U6XG4gKlxuICogYGBgXG4gKiB7XG4gKiAgIFwiZXh0XCI6e1xuICogICAgIFwic2ZkY1wiOntcImZhaWx1cmVSZWFzb25cIjpcIjQwMTo6QXV0aGVudGljYXRpb24gaW52YWxpZFwifSxcbiAqICAgICBcInJlcGxheVwiOnRydWV9LFxuICogICBcImFkdmljZVwiOntcInJlY29ubmVjdFwiOlwibm9uZVwifSxcbiAqICAgXCJjaGFubmVsXCI6XCIvbWV0YS9oYW5kc2hha2VcIixcbiAqICAgXCJlcnJvclwiOlwiNDAzOjpIYW5kc2hha2UgZGVuaWVkXCIsXG4gKiAgIFwic3VjY2Vzc2Z1bFwiOmZhbHNlXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBFeGFtcGxlIHVzYWdlOlxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIGNvbnN0IGpzZm9yY2UgPSByZXF1aXJlKCdqc2ZvcmNlJyk7XG4gKiBjb25zdCB7IFN0cmVhbWluZ0V4dGVuc2lvbiB9ID0gcmVxdWlyZSgnanNmb3JjZS9hcGkvc3RyZWFtaW5nJyk7XG4gKlxuICogY29uc3QgY29ubiA9IG5ldyBqc2ZvcmNlLkNvbm5lY3Rpb24oeyDigKYgfSk7XG4gKlxuICogY29uc3QgY2hhbm5lbCA9IFwiL2V2ZW50L015X0V2ZW50X19lXCI7XG4gKlxuICogLy8gRXhpdCB0aGUgTm9kZSBwcm9jZXNzIHdoZW4gYXV0aCBmYWlsc1xuICogY29uc3QgZXhpdENhbGxiYWNrID0gKCkgPT4gcHJvY2Vzcy5leGl0KDEpO1xuICogY29uc3QgYXV0aEZhaWx1cmVFeHQgPSBuZXcgU3RyZWFtaW5nRXh0ZW5zaW9uLkF1dGhGYWlsdXJlKGV4aXRDYWxsYmFjayk7XG4gKlxuICogY29uc3QgZmF5ZUNsaWVudCA9IGNvbm4uc3RyZWFtaW5nLmNyZWF0ZUNsaWVudChbIGF1dGhGYWlsdXJlRXh0IF0pO1xuICpcbiAqIGNvbnN0IHN1YnNjcmlwdGlvbiA9IGZheWVDbGllbnQuc3Vic2NyaWJlKGNoYW5uZWwsIGRhdGEgPT4ge1xuICogICBjb25zb2xlLmxvZygndG9waWMgcmVjZWl2ZWQgZGF0YScsIGRhdGEpO1xuICogfSk7XG4gKlxuICogc3Vic2NyaXB0aW9uLmNhbmNlbCgpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZmFpbHVyZUNhbGxiYWNrIC0gSW52b2tlZCB3aGVuIGF1dGhlbnRpY2F0aW9uIGJlY29tZXMgaW52YWxpZFxuICovXG5leHBvcnQgY2xhc3MgQXV0aEZhaWx1cmUge1xuICBfZmFpbHVyZUNhbGxiYWNrOiBGdW5jdGlvbjtcblxuICBjb25zdHJ1Y3RvcihmYWlsdXJlQ2FsbGJhY2s6IEZ1bmN0aW9uKSB7XG4gICAgdGhpcy5fZmFpbHVyZUNhbGxiYWNrID0gZmFpbHVyZUNhbGxiYWNrO1xuICB9XG5cbiAgaW5jb21pbmcobWVzc2FnZTogYW55LCBjYWxsYmFjazogRnVuY3Rpb24pIHtcbiAgICBpZiAoXG4gICAgICAobWVzc2FnZS5jaGFubmVsID09PSAnL21ldGEvY29ubmVjdCcgfHxcbiAgICAgICAgbWVzc2FnZS5jaGFubmVsID09PSAnL21ldGEvaGFuZHNoYWtlJykgJiZcbiAgICAgIG1lc3NhZ2UuYWR2aWNlICYmXG4gICAgICBtZXNzYWdlLmFkdmljZS5yZWNvbm5lY3QgPT0gJ25vbmUnXG4gICAgKSB7XG4gICAgICB0aGlzLl9mYWlsdXJlQ2FsbGJhY2sobWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbGxiYWNrKG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxufVxuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuY29uc3QgUkVQTEFZX0ZST01fS0VZID0gJ3JlcGxheSc7XG5cbi8qKlxuICogQ29uc3RydWN0b3IgZm9yIGEgZHVyYWJsZSBzdHJlYW1pbmcgcmVwbGF5IGV4dGVuc2lvblxuICpcbiAqIE1vZGlmaWVkIGZyb20gb3JpZ2luYWwgU2FsZXNmb3JjZSBkZW1vIHNvdXJjZSBjb2RlOlxuICogaHR0cHM6Ly9naXRodWIuY29tL2RldmVsb3BlcmZvcmNlL1NhbGVzZm9yY2VEdXJhYmxlU3RyZWFtaW5nRGVtby9ibG9iLzNkNGE1NmVhYzk1NmY3NDRhZDZjMjJlNmE4MTQxYjZmZWI1N2FiYjkvc3RhdGljcmVzb3VyY2VzL2NvbWV0ZFJlcGxheUV4dGVuc2lvbi5yZXNvdXJjZVxuICpcbiAqIEV4YW1wbGUgdXNhZ2U6XG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogY29uc3QganNmb3JjZSA9IHJlcXVpcmUoJ2pzZm9yY2UnKTtcbiAqIGNvbnN0IHsgU3RyZWFtaW5nRXh0ZW5zaW9uIH0gPSByZXF1aXJlKCdqc2ZvcmNlL2FwaS9zdHJlYW1pbmcnKTtcbiBcbiAqIGNvbnN0IGNvbm4gPSBuZXcganNmb3JjZS5Db25uZWN0aW9uKHsg4oCmIH0pO1xuICpcbiAqIGNvbnN0IGNoYW5uZWwgPSBcIi9ldmVudC9NeV9FdmVudF9fZVwiO1xuICogY29uc3QgcmVwbGF5SWQgPSAtMjsgLy8gLTIgaXMgYWxsIHJldGFpbmVkIGV2ZW50c1xuICpcbiAqIGNvbnN0IHJlcGxheUV4dCA9IG5ldyBTdHJlYW1pbmdFeHRlbnNpb24uUmVwbGF5KGNoYW5uZWwsIHJlcGxheUlkKTtcbiAqXG4gKiBjb25zdCBmYXllQ2xpZW50ID0gY29ubi5zdHJlYW1pbmcuY3JlYXRlQ2xpZW50KFsgcmVwbGF5RXh0IF0pO1xuICpcbiAqIGNvbnN0IHN1YnNjcmlwdGlvbiA9IGZheWVDbGllbnQuc3Vic2NyaWJlKGNoYW5uZWwsIGRhdGEgPT4ge1xuICogICBjb25zb2xlLmxvZygndG9waWMgcmVjZWl2ZWQgZGF0YScsIGRhdGEpO1xuICogfSk7XG4gKlxuICogc3Vic2NyaXB0aW9uLmNhbmNlbCgpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXBsYXkge1xuICBfZXh0ZW5zaW9uRW5hYmxlZDogYm9vbGVhbjtcbiAgX3JlcGxheTogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgX2NoYW5uZWw6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihjaGFubmVsOiBzdHJpbmcsIHJlcGxheUlkPzogbnVtYmVyIHwgbnVsbCkge1xuICAgIHRoaXMuX2V4dGVuc2lvbkVuYWJsZWQgPSByZXBsYXlJZCAhPSBudWxsO1xuICAgIHRoaXMuX2NoYW5uZWwgPSBjaGFubmVsO1xuICAgIHRoaXMuX3JlcGxheSA9IHJlcGxheUlkO1xuICB9XG5cbiAgc2V0RXh0ZW5zaW9uRW5hYmxlZChleHRlbnNpb25FbmFibGVkOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZXh0ZW5zaW9uRW5hYmxlZCA9IGV4dGVuc2lvbkVuYWJsZWQ7XG4gIH1cblxuICBzZXRSZXBsYXkocmVwbGF5OiBzdHJpbmcpIHtcbiAgICB0aGlzLl9yZXBsYXkgPSBwYXJzZUludChyZXBsYXksIDEwKTtcbiAgfVxuXG4gIHNldENoYW5uZWwoY2hhbm5lbDogc3RyaW5nKSB7XG4gICAgdGhpcy5fY2hhbm5lbCA9IGNoYW5uZWw7XG4gIH1cblxuICBpbmNvbWluZyhtZXNzYWdlOiBhbnksIGNhbGxiYWNrOiBGdW5jdGlvbikge1xuICAgIGlmIChtZXNzYWdlLmNoYW5uZWwgPT09ICcvbWV0YS9oYW5kc2hha2UnKSB7XG4gICAgICBpZiAobWVzc2FnZS5leHQgJiYgbWVzc2FnZS5leHRbUkVQTEFZX0ZST01fS0VZXSA9PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuX2V4dGVuc2lvbkVuYWJsZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXG4gICAgICBtZXNzYWdlLmNoYW5uZWwgPT09IHRoaXMuX2NoYW5uZWwgJiZcbiAgICAgIG1lc3NhZ2UuZGF0YSAmJlxuICAgICAgbWVzc2FnZS5kYXRhLmV2ZW50ICYmXG4gICAgICBtZXNzYWdlLmRhdGEuZXZlbnQucmVwbGF5SWRcbiAgICApIHtcbiAgICAgIHRoaXMuX3JlcGxheSA9IG1lc3NhZ2UuZGF0YS5ldmVudC5yZXBsYXlJZDtcbiAgICB9XG4gICAgY2FsbGJhY2sobWVzc2FnZSk7XG4gIH1cblxuICBvdXRnb2luZyhtZXNzYWdlOiBhbnksIGNhbGxiYWNrOiBGdW5jdGlvbikge1xuICAgIGlmIChtZXNzYWdlLmNoYW5uZWwgPT09ICcvbWV0YS9zdWJzY3JpYmUnKSB7XG4gICAgICBpZiAodGhpcy5fZXh0ZW5zaW9uRW5hYmxlZCkge1xuICAgICAgICBpZiAoIW1lc3NhZ2UuZXh0KSB7XG4gICAgICAgICAgbWVzc2FnZS5leHQgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXBsYXlGcm9tTWFwID0ge1xuICAgICAgICAgIFt0aGlzLl9jaGFubmVsXTogdGhpcy5fcmVwbGF5LFxuICAgICAgICB9O1xuICAgICAgICAvLyBhZGQgXCJleHQgOiB7IFwicmVwbGF5XCIgOiB7IENIQU5ORUwgOiBSRVBMQVlfVkFMVUUgfX1cIiB0byBzdWJzY3JpYmUgbWVzc2FnZVxuICAgICAgICBtZXNzYWdlLmV4dFtSRVBMQVlfRlJPTV9LRVldID0gcmVwbGF5RnJvbU1hcDtcbiAgICAgIH1cbiAgICB9XG4gICAgY2FsbGJhY2sobWVzc2FnZSk7XG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sTUFBTUEsV0FBTixDQUFrQjtFQUd2QkMsV0FBVyxDQUFDQyxlQUFELEVBQTRCO0lBQUE7SUFDckMsS0FBS0MsZ0JBQUwsR0FBd0JELGVBQXhCO0VBQ0Q7O0VBRURFLFFBQVEsQ0FBQ0MsT0FBRCxFQUFlQyxRQUFmLEVBQW1DO0lBQ3pDLElBQ0UsQ0FBQ0QsT0FBTyxDQUFDRSxP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