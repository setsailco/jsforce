"use strict";

var _Object$defineProperty2 = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.default = exports.Repl = void 0;

require("core-js/modules/es.promise.js");

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/concat"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/json/stringify"));

var _defineProperty3 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/define-property"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/filter"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/index-of"));

var _getOwnPropertyNames = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/get-own-property-names"));

var _getPrototypeOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/get-prototype-of"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys"));

var _events = require("events");

var _repl = require("repl");

var _stream = require("stream");

var _ = _interopRequireDefault(require(".."));

var _function = require("../util/function");

/**
 * @file Creates REPL interface with built in Salesforce API objects and automatically resolves promise object
 * @author Shinichi Tomita <shinichi.tomita@gmail.com>
 * @private
 */

/**
 * Intercept the evaled value returned from repl evaluator, convert and send back to output.
 * @private
 */
function injectBefore(replServer, method, beforeFn) {
  const _orig = replServer[method];

  replServer[method] = (...args) => {
    const callback = args.pop();
    beforeFn.apply(null, (0, _concat.default)(args).call(args, (err, res) => {
      if (err || res) {
        callback(err, res);
      } else {
        _orig.apply(replServer, (0, _concat.default)(args).call(args, callback));
      }
    }));
  };

  return replServer;
}
/**
 * @private
 */


function injectAfter(replServer, method, afterFn) {
  const _orig = replServer[method];

  replServer[method] = (...args) => {
    const callback = args.pop();

    _orig.apply(replServer, (0, _concat.default)(args).call(args, (...args) => {
      try {
        afterFn.apply(null, (0, _concat.default)(args).call(args, callback));
      } catch (e) {
        callback(e);
      }
    }));
  };

  return replServer;
}
/**
 * When the result was "promise", resolve its value
 * @private
 */


function promisify(err, value, callback) {
  // callback immediately if no value passed
  if (!callback && (0, _function.isFunction)(value)) {
    callback = value;
    return callback();
  }

  if (err) {
    throw err;
  }

  if ((0, _function.isPromiseLike)(value)) {
    value.then(v => {
      callback(null, v);
    }, err => {
      callback(err);
    });
  } else {
    callback(null, value);
  }
}
/**
 * Output object to stdout in JSON representation
 * @private
 */


function outputToStdout(prettyPrint) {
  if (prettyPrint && !(0, _function.isNumber)(prettyPrint)) {
    prettyPrint = 4;
  }

  return (err, value, callback) => {
    if (err) {
      console.error(err);
    } else {
      const str = (0, _stringify.default)(value, null, prettyPrint);
      console.log(str);
    }

    callback(err, value);
  };
}
/**
 * define get accessor using Object.defineProperty
 * @private
 */


function defineProp(obj, prop, getter) {
  if (_defineProperty3.default) {
    (0, _defineProperty3.default)(obj, prop, {
      get: getter
    });
  }
}
/**
 *
 */


class Repl {
  constructor(cli) {
    (0, _defineProperty2.default)(this, "_cli", void 0);
    (0, _defineProperty2.default)(this, "_in", void 0);
    (0, _defineProperty2.default)(this, "_out", void 0);
    (0, _defineProperty2.default)(this, "_interactive", true);
    (0, _defineProperty2.default)(this, "_paused", false);
    (0, _defineProperty2.default)(this, "_replServer", undefined);
    this._cli = cli;
    this._in = new _stream.Transform();
    this._out = new _stream.Transform();

    this._in._transform = (chunk, encoding, callback) => {
      if (!this._paused) {
        this._in.push(chunk);
      }

      callback();
    };

    this._out._transform = (chunk, encoding, callback) => {
      if (!this._paused && this._interactive !== false) {
        this._out.push(chunk);
      }

      callback();
    };
  }
  /**
   *
   */


  start(options = {}) {
    this._interactive = options.interactive !== false;
    process.stdin.resume();

    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }

    process.stdin.pipe(this._in);

    this._out.pipe(process.stdout);

    defineProp(this._out, 'columns', () => process.stdout.columns);
    this._replServer = (0, _repl.start)({
      input: this._in,
      output: this._out,
      terminal: true
    });

    this._defineAdditionalCommands();

    this._replServer = injectBefore(this._replServer, 'completer', (line, callback) => {
      this.complete(line).then(rets => {
        callback(null, rets);
      }).catch(err => {
        callback(err);
      });
    });
    this._replServer = injectAfter(this._replServer, 'eval', promisify);

    if (options.interactive === false) {
      this._replServer = injectAfter(this._replServer, 'eval', outputToStdout(options.prettyPrint));
      this._replServer = injectAfter(this._replServer, 'eval', function () {
        process.exit();
      });
    }

    this._replServer.on('exit', () => process.exit());

    this._defineBuiltinVars(this._replServer.context);

    if (options.evalScript) {
      this._in.write(options.evalScript + '\n', 'utf-8');
    }

    return this;
  }
  /**
   *
   */


  _defineAdditionalCommands() {
    const cli = this._cli;
    const replServer = this._replServer;

    if (!replServer) {
      return;
    }

    replServer.defineCommand('connections', {
      help: 'List currenty registered Salesforce connections',
      action: async () => {
        await cli.listConnections();
        replServer.displayPrompt();
      }
    });
    replServer.defineCommand('connect', {
      help: 'Connect to Salesforce instance',
      action: async (...args) => {
        const [name, password] = args;
        const params = password ? {
          connection: name,
          username: name,
          password: password
        } : {
          connection: name,
          username: name
        };

        try {
          await cli.connect(params);
        } catch (err) {
          if (err instanceof Error) {
            console.error(err.message);
          }
        }

        replServer.displayPrompt();
      }
    });
    replServer.defineCommand('disconnect', {
      help: 'Disconnect connection and erase it from registry',
      action: name => {
        cli.disconnect(name);
        replServer.displayPrompt();
      }
    });
    replServer.defineCommand('use', {
      help: 'Specify login server to establish connection',
      action: loginServer => {
        cli.setLoginServer(loginServer);
        replServer.displayPrompt();
      }
    });
    replServer.defineCommand('authorize', {
      help: 'Connect to Salesforce using OAuth2 authorization flow',
      action: async clientName => {
        try {
          await cli.authorize(clientName);
        } catch (err) {
          if (err instanceof Error) {
            console.error(err.message);
          }
        }

        replServer.displayPrompt();
      }
    });
    replServer.defineCommand('register', {
      help: 'Register OAuth2 client information',
      action: async (...args) => {
        const [clientName, clientId, clientSecret, redirectUri, loginUrl] = args;
        const config = {
          clientId,
          clientSecret,
          redirectUri,
          loginUrl
        };

        try {
          await cli.register(clientName, config);
        } catch (err) {
          if (err instanceof Error) {
            console.error(err.message);
          }
        }

        replServer.displayPrompt();
      }
    });
    replServer.defineCommand('open', {
      help: 'Open Salesforce web page using established connection',
      action: url => {
        cli.openUrlUsingSession(url);
        replServer.displayPrompt();
      }
    });
  }
  /**
   *
   */


  pause() {
    this._paused = true;

    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(false);
    }
  }
  /**
   *
   */


  resume() {
    this._paused = false;
    process.stdin.resume();

    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }
  }
  /**
   *
   */


  async complete(line) {
    const tokens = line.replace(/^\s+/, '').split(/\s+/);
    const [command, keyword = ''] = tokens;

    if (command[0] === '.' && tokens.length === 2) {
      let candidates = [];

      if (command === '.connect' || command === '.disconnect') {
        candidates = await this._cli.getConnectionNames();
      } else if (command === '.authorize') {
        candidates = await this._cli.getClientNames();
      } else if (command === '.use') {
        candidates = ['production', 'sandbox'];
      }

      candidates = (0, _filter.default)(candidates).call(candidates, name => (0, _indexOf.default)(name).call(name, keyword) === 0);
      return [candidates, keyword];
    }
  }
  /**
   * Map all jsforce object to REPL context
   * @private
   */


  _defineBuiltinVars(context) {
    const cli = this._cli; // define salesforce package root objects

    for (const key in _.default) {
      if (Object.prototype.hasOwnProperty.call(_.default, key) && !global[key]) {
        context[key] = _.default[key];
      }
    } // expose jsforce package root object in context.


    context.jsforce = _.default;

    function createProxyFunc(prop) {
      return (...args) => {
        const conn = cli.getCurrentConnection();
        return conn[prop](...args);
      };
    }

    function createProxyAccessor(prop) {
      return () => {
        const conn = cli.getCurrentConnection();
        return conn[prop];
      };
    }

    const conn = cli.getCurrentConnection(); // list all props in connection instance, other than EventEmitter or object built-in methods

    const props = {};
    let o = conn;

    while (o && o !== _events.EventEmitter.prototype && o !== Object.prototype) {
      for (const p of (0, _getOwnPropertyNames.default)(o)) {
        if (p !== 'constructor') {
          props[p] = true;
        }
      }

      o = (0, _getPrototypeOf.default)(o);
    }

    for (const prop of (0, _keys.default)(props)) {
      if (typeof global[prop] !== 'undefined') {
        // avoid global override
        continue;
      }

      if ((0, _indexOf.default)(prop).call(prop, '_') === 0) {
        // ignore private
        continue;
      }

      if ((0, _function.isFunction)(conn[prop])) {
        context[prop] = createProxyFunc(prop);
      } else if ((0, _function.isObject)(conn[prop])) {
        defineProp(context, prop, createProxyAccessor(prop));
      }
    } // expose default connection as "$conn"


    defineProp(context, '$conn', () => {
      return cli.getCurrentConnection();
    });
  }

}

exports.Repl = Repl;
var _default = Repl;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpbmplY3RCZWZvcmUiLCJyZXBsU2VydmVyIiwibWV0aG9kIiwiYmVmb3JlRm4iLCJfb3JpZyIsImFyZ3MiLCJjYWxsYmFjayIsInBvcCIsImFwcGx5IiwiZXJyIiwicmVzIiwiaW5qZWN0QWZ0ZXIiLCJhZnRlckZuIiwiZSIsInByb21pc2lmeSIsInZhbHVlIiwiaXNGdW5jdGlvbiIsImlzUHJvbWlzZUxpa2UiLCJ0aGVuIiwidiIsIm91dHB1dFRvU3Rkb3V0IiwicHJldHR5UHJpbnQiLCJpc051bWJlciIsImNvbnNvbGUiLCJlcnJvciIsInN0ciIsImxvZyIsImRlZmluZVByb3AiLCJvYmoiLCJwcm9wIiwiZ2V0dGVyIiwiZ2V0IiwiUmVwbCIsImNvbnN0cnVjdG9yIiwiY2xpIiwidW5kZWZpbmVkIiwiX2NsaSIsIl9pbiIsIlRyYW5zZm9ybSIsIl9vdXQiLCJfdHJhbnNmb3JtIiwiY2h1bmsiLCJlbmNvZGluZyIsIl9wYXVzZWQiLCJwdXNoIiwiX2ludGVyYWN0aXZlIiwic3RhcnQiLCJvcHRpb25zIiwiaW50ZXJhY3RpdmUiLCJwcm9jZXNzIiwic3RkaW4iLCJyZXN1bWUiLCJzZXRSYXdNb2RlIiwicGlwZSIsInN0ZG91dCIsImNvbHVtbnMiLCJfcmVwbFNlcnZlciIsInN0YXJ0UmVwbCIsImlucHV0Iiwib3V0cHV0IiwidGVybWluYWwiLCJfZGVmaW5lQWRkaXRpb25hbENvbW1hbmRzIiwibGluZSIsImNvbXBsZXRlIiwicmV0cyIsImNhdGNoIiwiZXhpdCIsIm9uIiwiX2RlZmluZUJ1aWx0aW5WYXJzIiwiY29udGV4dCIsImV2YWxTY3JpcHQiLCJ3cml0ZSIsImRlZmluZUNvbW1hbmQiLCJoZWxwIiwiYWN0aW9uIiwibGlzdENvbm5lY3Rpb25zIiwiZGlzcGxheVByb21wdCIsIm5hbWUiLCJwYXNzd29yZCIsInBhcmFtcyIsImNvbm5lY3Rpb24iLCJ1c2VybmFtZSIsImNvbm5lY3QiLCJFcnJvciIsIm1lc3NhZ2UiLCJkaXNjb25uZWN0IiwibG9naW5TZXJ2ZXIiLCJzZXRMb2dpblNlcnZlciIsImNsaWVudE5hbWUiLCJhdXRob3JpemUiLCJjbGllbnRJZCIsImNsaWVudFNlY3JldCIsInJlZGlyZWN0VXJpIiwibG9naW5VcmwiLCJjb25maWciLCJyZWdpc3RlciIsInVybCIsIm9wZW5VcmxVc2luZ1Nlc3Npb24iLCJwYXVzZSIsInRva2VucyIsInJlcGxhY2UiLCJzcGxpdCIsImNvbW1hbmQiLCJrZXl3b3JkIiwibGVuZ3RoIiwiY2FuZGlkYXRlcyIsImdldENvbm5lY3Rpb25OYW1lcyIsImdldENsaWVudE5hbWVzIiwia2V5IiwianNmb3JjZSIsIk9iamVjdCIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiY2FsbCIsImdsb2JhbCIsImNyZWF0ZVByb3h5RnVuYyIsImNvbm4iLCJnZXRDdXJyZW50Q29ubmVjdGlvbiIsImNyZWF0ZVByb3h5QWNjZXNzb3IiLCJwcm9wcyIsIm8iLCJFdmVudEVtaXR0ZXIiLCJwIiwiaXNPYmplY3QiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvY2xpL3JlcGwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBDcmVhdGVzIFJFUEwgaW50ZXJmYWNlIHdpdGggYnVpbHQgaW4gU2FsZXNmb3JjZSBBUEkgb2JqZWN0cyBhbmQgYXV0b21hdGljYWxseSByZXNvbHZlcyBwcm9taXNlIG9iamVjdFxuICogQGF1dGhvciBTaGluaWNoaSBUb21pdGEgPHNoaW5pY2hpLnRvbWl0YUBnbWFpbC5jb20+XG4gKiBAcHJpdmF0ZVxuICovXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHsgUkVQTFNlcnZlciwgc3RhcnQgYXMgc3RhcnRSZXBsIH0gZnJvbSAncmVwbCc7XG5pbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0IGpzZm9yY2UgZnJvbSAnLi4nO1xuaW1wb3J0IHtcbiAgaXNQcm9taXNlTGlrZSxcbiAgaXNOdW1iZXIsXG4gIGlzRnVuY3Rpb24sXG4gIGlzT2JqZWN0LFxufSBmcm9tICcuLi91dGlsL2Z1bmN0aW9uJztcbmltcG9ydCB7IENsaSB9IGZyb20gJy4vY2xpJztcblxuLyoqXG4gKiBJbnRlcmNlcHQgdGhlIGV2YWxlZCB2YWx1ZSByZXR1cm5lZCBmcm9tIHJlcGwgZXZhbHVhdG9yLCBjb252ZXJ0IGFuZCBzZW5kIGJhY2sgdG8gb3V0cHV0LlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gaW5qZWN0QmVmb3JlKFxuICByZXBsU2VydmVyOiBSRVBMU2VydmVyLFxuICBtZXRob2Q6IHN0cmluZyxcbiAgYmVmb3JlRm46IEZ1bmN0aW9uLFxuKSB7XG4gIGNvbnN0IF9vcmlnOiBGdW5jdGlvbiA9IChyZXBsU2VydmVyIGFzIGFueSlbbWV0aG9kXTtcbiAgKHJlcGxTZXJ2ZXIgYXMgYW55KVttZXRob2RdID0gKC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gICAgY29uc3QgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgIGJlZm9yZUZuLmFwcGx5KFxuICAgICAgbnVsbCxcbiAgICAgIGFyZ3MuY29uY2F0KChlcnI6IGFueSwgcmVzOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKGVyciB8fCByZXMpIHtcbiAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX29yaWcuYXBwbHkocmVwbFNlcnZlciwgYXJncy5jb25jYXQoY2FsbGJhY2spKTtcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgKTtcbiAgfTtcbiAgcmV0dXJuIHJlcGxTZXJ2ZXI7XG59XG5cbi8qKlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gaW5qZWN0QWZ0ZXIoXG4gIHJlcGxTZXJ2ZXI6IFJFUExTZXJ2ZXIsXG4gIG1ldGhvZDogc3RyaW5nLFxuICBhZnRlckZuOiBGdW5jdGlvbixcbikge1xuICBjb25zdCBfb3JpZzogRnVuY3Rpb24gPSAocmVwbFNlcnZlciBhcyBhbnkpW21ldGhvZF07XG4gIChyZXBsU2VydmVyIGFzIGFueSlbbWV0aG9kXSA9ICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgIGNvbnN0IGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICBfb3JpZy5hcHBseShcbiAgICAgIHJlcGxTZXJ2ZXIsXG4gICAgICBhcmdzLmNvbmNhdCgoLi4uYXJnczogYW55W10pID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhZnRlckZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KGNhbGxiYWNrKSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjYWxsYmFjayhlKTtcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgKTtcbiAgfTtcbiAgcmV0dXJuIHJlcGxTZXJ2ZXI7XG59XG5cbi8qKlxuICogV2hlbiB0aGUgcmVzdWx0IHdhcyBcInByb21pc2VcIiwgcmVzb2x2ZSBpdHMgdmFsdWVcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShcbiAgZXJyOiBFcnJvciB8IG51bGwgfCB1bmRlZmluZWQsXG4gIHZhbHVlOiBhbnksXG4gIGNhbGxiYWNrOiBGdW5jdGlvbixcbikge1xuICAvLyBjYWxsYmFjayBpbW1lZGlhdGVseSBpZiBubyB2YWx1ZSBwYXNzZWRcbiAgaWYgKCFjYWxsYmFjayAmJiBpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIGNhbGxiYWNrID0gdmFsdWU7XG4gICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gIH1cbiAgaWYgKGVycikge1xuICAgIHRocm93IGVycjtcbiAgfVxuICBpZiAoaXNQcm9taXNlTGlrZSh2YWx1ZSkpIHtcbiAgICB2YWx1ZS50aGVuKFxuICAgICAgKHY6IGFueSkgPT4ge1xuICAgICAgICBjYWxsYmFjayhudWxsLCB2KTtcbiAgICAgIH0sXG4gICAgICAoZXJyOiBhbnkpID0+IHtcbiAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgIH0sXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBjYWxsYmFjayhudWxsLCB2YWx1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBPdXRwdXQgb2JqZWN0IHRvIHN0ZG91dCBpbiBKU09OIHJlcHJlc2VudGF0aW9uXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBvdXRwdXRUb1N0ZG91dChwcmV0dHlQcmludD86IHN0cmluZyB8IG51bWJlcikge1xuICBpZiAocHJldHR5UHJpbnQgJiYgIWlzTnVtYmVyKHByZXR0eVByaW50KSkge1xuICAgIHByZXR0eVByaW50ID0gNDtcbiAgfVxuICByZXR1cm4gKGVycjogYW55LCB2YWx1ZTogYW55LCBjYWxsYmFjazogRnVuY3Rpb24pID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHN0ciA9IEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCBwcmV0dHlQcmludCk7XG4gICAgICBjb25zb2xlLmxvZyhzdHIpO1xuICAgIH1cbiAgICBjYWxsYmFjayhlcnIsIHZhbHVlKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBkZWZpbmUgZ2V0IGFjY2Vzc29yIHVzaW5nIE9iamVjdC5kZWZpbmVQcm9wZXJ0eVxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gZGVmaW5lUHJvcChvYmo6IE9iamVjdCwgcHJvcDogc3RyaW5nLCBnZXR0ZXI6ICgpID0+IGFueSkge1xuICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgcHJvcCwgeyBnZXQ6IGdldHRlciB9KTtcbiAgfVxufVxuXG4vKipcbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXBsIHtcbiAgX2NsaTogQ2xpO1xuICBfaW46IFRyYW5zZm9ybTtcbiAgX291dDogVHJhbnNmb3JtO1xuICBfaW50ZXJhY3RpdmU6IGJvb2xlYW4gPSB0cnVlO1xuICBfcGF1c2VkOiBib29sZWFuID0gZmFsc2U7XG4gIF9yZXBsU2VydmVyOiBSRVBMU2VydmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKGNsaTogQ2xpKSB7XG4gICAgdGhpcy5fY2xpID0gY2xpO1xuICAgIHRoaXMuX2luID0gbmV3IFRyYW5zZm9ybSgpO1xuICAgIHRoaXMuX291dCA9IG5ldyBUcmFuc2Zvcm0oKTtcbiAgICB0aGlzLl9pbi5fdHJhbnNmb3JtID0gKGNodW5rLCBlbmNvZGluZywgY2FsbGJhY2spID0+IHtcbiAgICAgIGlmICghdGhpcy5fcGF1c2VkKSB7XG4gICAgICAgIHRoaXMuX2luLnB1c2goY2h1bmspO1xuICAgICAgfVxuICAgICAgY2FsbGJhY2soKTtcbiAgICB9O1xuICAgIHRoaXMuX291dC5fdHJhbnNmb3JtID0gKGNodW5rLCBlbmNvZGluZywgY2FsbGJhY2spID0+IHtcbiAgICAgIGlmICghdGhpcy5fcGF1c2VkICYmIHRoaXMuX2ludGVyYWN0aXZlICE9PSBmYWxzZSkge1xuICAgICAgICB0aGlzLl9vdXQucHVzaChjaHVuayk7XG4gICAgICB9XG4gICAgICBjYWxsYmFjaygpO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICpcbiAgICovXG4gIHN0YXJ0KFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIGludGVyYWN0aXZlPzogYm9vbGVhbjtcbiAgICAgIHByZXR0eVByaW50Pzogc3RyaW5nIHwgbnVtYmVyO1xuICAgICAgZXZhbFNjcmlwdD86IHN0cmluZztcbiAgICB9ID0ge30sXG4gICkge1xuICAgIHRoaXMuX2ludGVyYWN0aXZlID0gb3B0aW9ucy5pbnRlcmFjdGl2ZSAhPT0gZmFsc2U7XG5cbiAgICBwcm9jZXNzLnN0ZGluLnJlc3VtZSgpO1xuICAgIGlmIChwcm9jZXNzLnN0ZGluLnNldFJhd01vZGUpIHtcbiAgICAgIHByb2Nlc3Muc3RkaW4uc2V0UmF3TW9kZSh0cnVlKTtcbiAgICB9XG4gICAgcHJvY2Vzcy5zdGRpbi5waXBlKHRoaXMuX2luKTtcblxuICAgIHRoaXMuX291dC5waXBlKHByb2Nlc3Muc3Rkb3V0KTtcblxuICAgIGRlZmluZVByb3AodGhpcy5fb3V0LCAnY29sdW1ucycsICgpID0+IHByb2Nlc3Muc3Rkb3V0LmNvbHVtbnMpO1xuXG4gICAgdGhpcy5fcmVwbFNlcnZlciA9IHN0YXJ0UmVwbCh7XG4gICAgICBpbnB1dDogdGhpcy5faW4sXG4gICAgICBvdXRwdXQ6IHRoaXMuX291dCxcbiAgICAgIHRlcm1pbmFsOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgdGhpcy5fZGVmaW5lQWRkaXRpb25hbENvbW1hbmRzKCk7XG5cbiAgICB0aGlzLl9yZXBsU2VydmVyID0gaW5qZWN0QmVmb3JlKFxuICAgICAgdGhpcy5fcmVwbFNlcnZlcixcbiAgICAgICdjb21wbGV0ZXInLFxuICAgICAgKGxpbmU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKSA9PiB7XG4gICAgICAgIHRoaXMuY29tcGxldGUobGluZSlcbiAgICAgICAgICAudGhlbigocmV0cykgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmV0cyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgKTtcbiAgICB0aGlzLl9yZXBsU2VydmVyID0gaW5qZWN0QWZ0ZXIodGhpcy5fcmVwbFNlcnZlciwgJ2V2YWwnLCBwcm9taXNpZnkpO1xuXG4gICAgaWYgKG9wdGlvbnMuaW50ZXJhY3RpdmUgPT09IGZhbHNlKSB7XG4gICAgICB0aGlzLl9yZXBsU2VydmVyID0gaW5qZWN0QWZ0ZXIoXG4gICAgICAgIHRoaXMuX3JlcGxTZXJ2ZXIsXG4gICAgICAgICdldmFsJyxcbiAgICAgICAgb3V0cHV0VG9TdGRvdXQob3B0aW9ucy5wcmV0dHlQcmludCksXG4gICAgICApO1xuICAgICAgdGhpcy5fcmVwbFNlcnZlciA9IGluamVjdEFmdGVyKHRoaXMuX3JlcGxTZXJ2ZXIsICdldmFsJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBwcm9jZXNzLmV4aXQoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLl9yZXBsU2VydmVyLm9uKCdleGl0JywgKCkgPT4gcHJvY2Vzcy5leGl0KCkpO1xuXG4gICAgdGhpcy5fZGVmaW5lQnVpbHRpblZhcnModGhpcy5fcmVwbFNlcnZlci5jb250ZXh0KTtcblxuICAgIGlmIChvcHRpb25zLmV2YWxTY3JpcHQpIHtcbiAgICAgIHRoaXMuX2luLndyaXRlKG9wdGlvbnMuZXZhbFNjcmlwdCArICdcXG4nLCAndXRmLTgnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgX2RlZmluZUFkZGl0aW9uYWxDb21tYW5kcygpIHtcbiAgICBjb25zdCBjbGkgPSB0aGlzLl9jbGk7XG4gICAgY29uc3QgcmVwbFNlcnZlciA9IHRoaXMuX3JlcGxTZXJ2ZXI7XG4gICAgaWYgKCFyZXBsU2VydmVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJlcGxTZXJ2ZXIuZGVmaW5lQ29tbWFuZCgnY29ubmVjdGlvbnMnLCB7XG4gICAgICBoZWxwOiAnTGlzdCBjdXJyZW50eSByZWdpc3RlcmVkIFNhbGVzZm9yY2UgY29ubmVjdGlvbnMnLFxuICAgICAgYWN0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGNsaS5saXN0Q29ubmVjdGlvbnMoKTtcbiAgICAgICAgcmVwbFNlcnZlci5kaXNwbGF5UHJvbXB0KCk7XG4gICAgICB9LFxuICAgIH0pO1xuICAgIHJlcGxTZXJ2ZXIuZGVmaW5lQ29tbWFuZCgnY29ubmVjdCcsIHtcbiAgICAgIGhlbHA6ICdDb25uZWN0IHRvIFNhbGVzZm9yY2UgaW5zdGFuY2UnLFxuICAgICAgYWN0aW9uOiBhc3luYyAoLi4uYXJnczogc3RyaW5nW10pID0+IHtcbiAgICAgICAgY29uc3QgW25hbWUsIHBhc3N3b3JkXSA9IGFyZ3M7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHBhc3N3b3JkXG4gICAgICAgICAgPyB7IGNvbm5lY3Rpb246IG5hbWUsIHVzZXJuYW1lOiBuYW1lLCBwYXNzd29yZDogcGFzc3dvcmQgfVxuICAgICAgICAgIDogeyBjb25uZWN0aW9uOiBuYW1lLCB1c2VybmFtZTogbmFtZSB9O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IGNsaS5jb25uZWN0KHBhcmFtcyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIubWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlcGxTZXJ2ZXIuZGlzcGxheVByb21wdCgpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgICByZXBsU2VydmVyLmRlZmluZUNvbW1hbmQoJ2Rpc2Nvbm5lY3QnLCB7XG4gICAgICBoZWxwOiAnRGlzY29ubmVjdCBjb25uZWN0aW9uIGFuZCBlcmFzZSBpdCBmcm9tIHJlZ2lzdHJ5JyxcbiAgICAgIGFjdGlvbjogKG5hbWUpID0+IHtcbiAgICAgICAgY2xpLmRpc2Nvbm5lY3QobmFtZSk7XG4gICAgICAgIHJlcGxTZXJ2ZXIuZGlzcGxheVByb21wdCgpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgICByZXBsU2VydmVyLmRlZmluZUNvbW1hbmQoJ3VzZScsIHtcbiAgICAgIGhlbHA6ICdTcGVjaWZ5IGxvZ2luIHNlcnZlciB0byBlc3RhYmxpc2ggY29ubmVjdGlvbicsXG4gICAgICBhY3Rpb246IChsb2dpblNlcnZlcikgPT4ge1xuICAgICAgICBjbGkuc2V0TG9naW5TZXJ2ZXIobG9naW5TZXJ2ZXIpO1xuICAgICAgICByZXBsU2VydmVyLmRpc3BsYXlQcm9tcHQoKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgcmVwbFNlcnZlci5kZWZpbmVDb21tYW5kKCdhdXRob3JpemUnLCB7XG4gICAgICBoZWxwOiAnQ29ubmVjdCB0byBTYWxlc2ZvcmNlIHVzaW5nIE9BdXRoMiBhdXRob3JpemF0aW9uIGZsb3cnLFxuICAgICAgYWN0aW9uOiBhc3luYyAoY2xpZW50TmFtZSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IGNsaS5hdXRob3JpemUoY2xpZW50TmFtZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIubWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlcGxTZXJ2ZXIuZGlzcGxheVByb21wdCgpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgICByZXBsU2VydmVyLmRlZmluZUNvbW1hbmQoJ3JlZ2lzdGVyJywge1xuICAgICAgaGVscDogJ1JlZ2lzdGVyIE9BdXRoMiBjbGllbnQgaW5mb3JtYXRpb24nLFxuICAgICAgYWN0aW9uOiBhc3luYyAoLi4uYXJnczogc3RyaW5nW10pID0+IHtcbiAgICAgICAgY29uc3QgW1xuICAgICAgICAgIGNsaWVudE5hbWUsXG4gICAgICAgICAgY2xpZW50SWQsXG4gICAgICAgICAgY2xpZW50U2VjcmV0LFxuICAgICAgICAgIHJlZGlyZWN0VXJpLFxuICAgICAgICAgIGxvZ2luVXJsLFxuICAgICAgICBdID0gYXJncztcbiAgICAgICAgY29uc3QgY29uZmlnID0geyBjbGllbnRJZCwgY2xpZW50U2VjcmV0LCByZWRpcmVjdFVyaSwgbG9naW5VcmwgfTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBjbGkucmVnaXN0ZXIoY2xpZW50TmFtZSwgY29uZmlnKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVyci5tZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVwbFNlcnZlci5kaXNwbGF5UHJvbXB0KCk7XG4gICAgICB9LFxuICAgIH0pO1xuICAgIHJlcGxTZXJ2ZXIuZGVmaW5lQ29tbWFuZCgnb3BlbicsIHtcbiAgICAgIGhlbHA6ICdPcGVuIFNhbGVzZm9yY2Ugd2ViIHBhZ2UgdXNpbmcgZXN0YWJsaXNoZWQgY29ubmVjdGlvbicsXG4gICAgICBhY3Rpb246ICh1cmwpID0+IHtcbiAgICAgICAgY2xpLm9wZW5VcmxVc2luZ1Nlc3Npb24odXJsKTtcbiAgICAgICAgcmVwbFNlcnZlci5kaXNwbGF5UHJvbXB0KCk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBwYXVzZSgpIHtcbiAgICB0aGlzLl9wYXVzZWQgPSB0cnVlO1xuICAgIGlmIChwcm9jZXNzLnN0ZGluLnNldFJhd01vZGUpIHtcbiAgICAgIHByb2Nlc3Muc3RkaW4uc2V0UmF3TW9kZShmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICByZXN1bWUoKSB7XG4gICAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG4gICAgcHJvY2Vzcy5zdGRpbi5yZXN1bWUoKTtcbiAgICBpZiAocHJvY2Vzcy5zdGRpbi5zZXRSYXdNb2RlKSB7XG4gICAgICBwcm9jZXNzLnN0ZGluLnNldFJhd01vZGUodHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBhc3luYyBjb21wbGV0ZShsaW5lOiBzdHJpbmcpIHtcbiAgICBjb25zdCB0b2tlbnMgPSBsaW5lLnJlcGxhY2UoL15cXHMrLywgJycpLnNwbGl0KC9cXHMrLyk7XG4gICAgY29uc3QgW2NvbW1hbmQsIGtleXdvcmQgPSAnJ10gPSB0b2tlbnM7XG4gICAgaWYgKGNvbW1hbmRbMF0gPT09ICcuJyAmJiB0b2tlbnMubGVuZ3RoID09PSAyKSB7XG4gICAgICBsZXQgY2FuZGlkYXRlczogc3RyaW5nW10gPSBbXTtcbiAgICAgIGlmIChjb21tYW5kID09PSAnLmNvbm5lY3QnIHx8IGNvbW1hbmQgPT09ICcuZGlzY29ubmVjdCcpIHtcbiAgICAgICAgY2FuZGlkYXRlcyA9IGF3YWl0IHRoaXMuX2NsaS5nZXRDb25uZWN0aW9uTmFtZXMoKTtcbiAgICAgIH0gZWxzZSBpZiAoY29tbWFuZCA9PT0gJy5hdXRob3JpemUnKSB7XG4gICAgICAgIGNhbmRpZGF0ZXMgPSBhd2FpdCB0aGlzLl9jbGkuZ2V0Q2xpZW50TmFtZXMoKTtcbiAgICAgIH0gZWxzZSBpZiAoY29tbWFuZCA9PT0gJy51c2UnKSB7XG4gICAgICAgIGNhbmRpZGF0ZXMgPSBbJ3Byb2R1Y3Rpb24nLCAnc2FuZGJveCddO1xuICAgICAgfVxuICAgICAgY2FuZGlkYXRlcyA9IGNhbmRpZGF0ZXMuZmlsdGVyKChuYW1lKSA9PiBuYW1lLmluZGV4T2Yoa2V5d29yZCkgPT09IDApO1xuICAgICAgcmV0dXJuIFtjYW5kaWRhdGVzLCBrZXl3b3JkXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWFwIGFsbCBqc2ZvcmNlIG9iamVjdCB0byBSRVBMIGNvbnRleHRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9kZWZpbmVCdWlsdGluVmFycyhjb250ZXh0OiB7IFt2YXJOYW1lOiBzdHJpbmddOiBhbnkgfSkge1xuICAgIGNvbnN0IGNsaSA9IHRoaXMuX2NsaTtcblxuICAgIC8vIGRlZmluZSBzYWxlc2ZvcmNlIHBhY2thZ2Ugcm9vdCBvYmplY3RzXG4gICAgZm9yIChjb25zdCBrZXkgaW4ganNmb3JjZSkge1xuICAgICAgaWYgKFxuICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoanNmb3JjZSwga2V5KSAmJlxuICAgICAgICAhKGdsb2JhbCBhcyBhbnkpW2tleV1cbiAgICAgICkge1xuICAgICAgICBjb250ZXh0W2tleV0gPSAoanNmb3JjZSBhcyBhbnkpW2tleV07XG4gICAgICB9XG4gICAgfVxuICAgIC8vIGV4cG9zZSBqc2ZvcmNlIHBhY2thZ2Ugcm9vdCBvYmplY3QgaW4gY29udGV4dC5cbiAgICBjb250ZXh0LmpzZm9yY2UgPSBqc2ZvcmNlO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlUHJveHlGdW5jKHByb3A6IHN0cmluZykge1xuICAgICAgcmV0dXJuICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgICBjb25zdCBjb25uID0gY2xpLmdldEN1cnJlbnRDb25uZWN0aW9uKCk7XG4gICAgICAgIHJldHVybiAoY29ubiBhcyBhbnkpW3Byb3BdKC4uLmFyZ3MpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVQcm94eUFjY2Vzc29yKHByb3A6IHN0cmluZykge1xuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgY29uc3QgY29ubiA9IGNsaS5nZXRDdXJyZW50Q29ubmVjdGlvbigpO1xuICAgICAgICByZXR1cm4gKGNvbm4gYXMgYW55KVtwcm9wXTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgY29ubiA9IGNsaS5nZXRDdXJyZW50Q29ubmVjdGlvbigpO1xuICAgIC8vIGxpc3QgYWxsIHByb3BzIGluIGNvbm5lY3Rpb24gaW5zdGFuY2UsIG90aGVyIHRoYW4gRXZlbnRFbWl0dGVyIG9yIG9iamVjdCBidWlsdC1pbiBtZXRob2RzXG4gICAgY29uc3QgcHJvcHM6IHsgW3Byb3A6IHN0cmluZ106IGJvb2xlYW4gfSA9IHt9O1xuICAgIGxldCBvOiBvYmplY3QgPSBjb25uO1xuICAgIHdoaWxlIChvICYmIG8gIT09IEV2ZW50RW1pdHRlci5wcm90b3R5cGUgJiYgbyAhPT0gT2JqZWN0LnByb3RvdHlwZSkge1xuICAgICAgZm9yIChjb25zdCBwIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG8pKSB7XG4gICAgICAgIGlmIChwICE9PSAnY29uc3RydWN0b3InKSB7XG4gICAgICAgICAgcHJvcHNbcF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG8pO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHByb3Agb2YgT2JqZWN0LmtleXMocHJvcHMpKSB7XG4gICAgICBpZiAodHlwZW9mIChnbG9iYWwgYXMgYW55KVtwcm9wXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgLy8gYXZvaWQgZ2xvYmFsIG92ZXJyaWRlXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHByb3AuaW5kZXhPZignXycpID09PSAwKSB7XG4gICAgICAgIC8vIGlnbm9yZSBwcml2YXRlXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKGlzRnVuY3Rpb24oKGNvbm4gYXMgYW55KVtwcm9wXSkpIHtcbiAgICAgICAgY29udGV4dFtwcm9wXSA9IGNyZWF0ZVByb3h5RnVuYyhwcm9wKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QoKGNvbm4gYXMgYW55KVtwcm9wXSkpIHtcbiAgICAgICAgZGVmaW5lUHJvcChjb250ZXh0LCBwcm9wLCBjcmVhdGVQcm94eUFjY2Vzc29yKHByb3ApKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBleHBvc2UgZGVmYXVsdCBjb25uZWN0aW9uIGFzIFwiJGNvbm5cIlxuICAgIGRlZmluZVByb3AoY29udGV4dCwgJyRjb25uJywgKCkgPT4ge1xuICAgICAgcmV0dXJuIGNsaS5nZXRDdXJyZW50Q29ubmVjdGlvbigpO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlcGw7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBS0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNBLFlBQVQsQ0FDRUMsVUFERixFQUVFQyxNQUZGLEVBR0VDLFFBSEYsRUFJRTtFQUNBLE1BQU1DLEtBQWUsR0FBSUgsVUFBRCxDQUFvQkMsTUFBcEIsQ0FBeEI7O0VBQ0NELFVBQUQsQ0FBb0JDLE1BQXBCLElBQThCLENBQUMsR0FBR0csSUFBSixLQUFvQjtJQUNoRCxN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