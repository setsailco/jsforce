"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

_Object$defineProperty(exports, "EmptyRegistry", {
  enumerable: true,
  get: function () {
    return _empty.EmptyRegistry;
  }
});

_Object$defineProperty(exports, "FileRegistry", {
  enumerable: true,
  get: function () {
    return _file.FileRegistry;
  }
});

_Object$defineProperty(exports, "Registry", {
  enumerable: true,
  get: function () {
    return _types.Registry;
  }
});

_Object$defineProperty(exports, "SfdxRegistry", {
  enumerable: true,
  get: function () {
    return _sfdx.SfdxRegistry;
  }
});

exports.default = void 0;

var _types = require("./types");

var _file = require("./file");

var _sfdx = require("./sfdx");

var _empty = require("./empty");

const registry = process.env.JSFORCE_CONNECTION_REGISTRY === 'sfdx' ? new _sfdx.SfdxRegistry({}) : new _file.FileRegistry({});
var _default = registry;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJyZWdpc3RyeSIsInByb2Nlc3MiLCJlbnYiLCJKU0ZPUkNFX0NPTk5FQ1RJT05fUkVHSVNUUlkiLCJTZmR4UmVnaXN0cnkiLCJGaWxlUmVnaXN0cnkiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVnaXN0cnkvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVnaXN0cnkgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IEZpbGVSZWdpc3RyeSB9IGZyb20gJy4vZmlsZSc7XG5pbXBvcnQgeyBTZmR4UmVnaXN0cnkgfSBmcm9tICcuL3NmZHgnO1xuaW1wb3J0IHsgRW1wdHlSZWdpc3RyeSB9IGZyb20gJy4vZW1wdHknO1xuXG5jb25zdCByZWdpc3RyeSA9XG4gIHByb2Nlc3MuZW52LkpTRk9SQ0VfQ09OTkVDVElPTl9SRUdJU1RSWSA9PT0gJ3NmZHgnXG4gICAgPyBuZXcgU2ZkeFJlZ2lzdHJ5KHt9KVxuICAgIDogbmV3IEZpbGVSZWdpc3RyeSh7fSk7XG5cbmV4cG9ydCBkZWZhdWx0IHJlZ2lzdHJ5O1xuXG5leHBvcnQgeyBSZWdpc3RyeSwgRmlsZVJlZ2lzdHJ5LCBTZmR4UmVnaXN0cnksIEVtcHR5UmVnaXN0cnkgfTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQSxNQUFNQSxRQUFRLEdBQ1pDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZQywyQkFBWixLQUE0QyxNQUE1QyxHQUNJLElBQUlDLGtCQUFKLENBQWlCLEVBQWpCLENBREosR0FFSSxJQUFJQyxrQkFBSixDQUFpQixFQUFqQixDQUhOO2VBS2VMLFEifQ==