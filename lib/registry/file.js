"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.FileRegistry = void 0;

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/json/stringify"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _base = require("./base");

/**
 *
 */
function getDefaultConfigFilePath() {
  const homeDir = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];

  if (!homeDir) {
    throw new Error('cannot find user home directory to store configuration files');
  }

  return _path.default.join(homeDir, '.jsforce', 'config.json');
}
/**
 *
 */


class FileRegistry extends _base.BaseRegistry {
  constructor({
    configFilePath
  }) {
    super();
    (0, _defineProperty2.default)(this, "_configFilePath", void 0);
    this._configFilePath = configFilePath || getDefaultConfigFilePath();

    try {
      var data = _fs.default.readFileSync(this._configFilePath, 'utf-8');

      this._registryConfig = JSON.parse(data);
    } catch (e) {//
    }
  }

  _saveConfig() {
    const data = (0, _stringify.default)(this._registryConfig, null, 4);

    try {
      _fs.default.writeFileSync(this._configFilePath, data);

      _fs.default.chmodSync(this._configFilePath, '600');
    } catch (e) {
      const configDir = _path.default.dirname(this._configFilePath);

      _fs.default.mkdirSync(configDir);

      _fs.default.chmodSync(configDir, '700');

      _fs.default.writeFileSync(this._configFilePath, data);

      _fs.default.chmodSync(this._configFilePath, '600');
    }
  }

}

exports.FileRegistry = FileRegistry;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXREZWZhdWx0Q29uZmlnRmlsZVBhdGgiLCJob21lRGlyIiwicHJvY2VzcyIsImVudiIsInBsYXRmb3JtIiwiRXJyb3IiLCJwYXRoIiwiam9pbiIsIkZpbGVSZWdpc3RyeSIsIkJhc2VSZWdpc3RyeSIsImNvbnN0cnVjdG9yIiwiY29uZmlnRmlsZVBhdGgiLCJfY29uZmlnRmlsZVBhdGgiLCJkYXRhIiwiZnMiLCJyZWFkRmlsZVN5bmMiLCJfcmVnaXN0cnlDb25maWciLCJKU09OIiwicGFyc2UiLCJlIiwiX3NhdmVDb25maWciLCJ3cml0ZUZpbGVTeW5jIiwiY2htb2RTeW5jIiwiY29uZmlnRGlyIiwiZGlybmFtZSIsIm1rZGlyU3luYyJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZWdpc3RyeS9maWxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IEJhc2VSZWdpc3RyeSB9IGZyb20gJy4vYmFzZSc7XG5cbi8qKlxuICpcbiAqL1xuZnVuY3Rpb24gZ2V0RGVmYXVsdENvbmZpZ0ZpbGVQYXRoKCkge1xuICBjb25zdCBob21lRGlyID1cbiAgICBwcm9jZXNzLmVudltwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInID8gJ1VTRVJQUk9GSUxFJyA6ICdIT01FJ107XG4gIGlmICghaG9tZURpcikge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdjYW5ub3QgZmluZCB1c2VyIGhvbWUgZGlyZWN0b3J5IHRvIHN0b3JlIGNvbmZpZ3VyYXRpb24gZmlsZXMnLFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHBhdGguam9pbihob21lRGlyLCAnLmpzZm9yY2UnLCAnY29uZmlnLmpzb24nKTtcbn1cblxuLyoqXG4gKlxuICovXG5leHBvcnQgY2xhc3MgRmlsZVJlZ2lzdHJ5IGV4dGVuZHMgQmFzZVJlZ2lzdHJ5IHtcbiAgX2NvbmZpZ0ZpbGVQYXRoOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoeyBjb25maWdGaWxlUGF0aCB9OiB7IGNvbmZpZ0ZpbGVQYXRoPzogc3RyaW5nIH0pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2NvbmZpZ0ZpbGVQYXRoID0gY29uZmlnRmlsZVBhdGggfHwgZ2V0RGVmYXVsdENvbmZpZ0ZpbGVQYXRoKCk7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBkYXRhID0gZnMucmVhZEZpbGVTeW5jKHRoaXMuX2NvbmZpZ0ZpbGVQYXRoLCAndXRmLTgnKTtcbiAgICAgIHRoaXMuX3JlZ2lzdHJ5Q29uZmlnID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvL1xuICAgIH1cbiAgfVxuXG4gIF9zYXZlQ29uZmlnKCkge1xuICAgIGNvbnN0IGRhdGEgPSBKU09OLnN0cmluZ2lmeSh0aGlzLl9yZWdpc3RyeUNvbmZpZywgbnVsbCwgNCk7XG4gICAgdHJ5IHtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmModGhpcy5fY29uZmlnRmlsZVBhdGgsIGRhdGEpO1xuICAgICAgZnMuY2htb2RTeW5jKHRoaXMuX2NvbmZpZ0ZpbGVQYXRoLCAnNjAwJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc3QgY29uZmlnRGlyID0gcGF0aC5kaXJuYW1lKHRoaXMuX2NvbmZpZ0ZpbGVQYXRoKTtcbiAgICAgIGZzLm1rZGlyU3luYyhjb25maWdEaXIpO1xuICAgICAgZnMuY2htb2RTeW5jKGNvbmZpZ0RpciwgJzcwMCcpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLl9jb25maWdGaWxlUGF0aCwgZGF0YSk7XG4gICAgICBmcy5jaG1vZFN5bmModGhpcy5fY29uZmlnRmlsZVBhdGgsICc2MDAnKTtcbiAgICB9XG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVNBLHdCQUFULEdBQW9DO0VBQ2xDLE1BQU1DLE9BQU8sR0FDWEMsT0FBTyxDQUFDQyxHQUFSLENBQVlELE9BQU8sQ0FBQ0UsUUFBUixLQUFxQixPQUFyQixHQUErQixhQUEvQixHQUErQyxNQUEzRCxDQURGOztFQUVBLElBQUksQ0FBQ0gsT0FBTCxFQUFjO0lBQ1osTUFBTSxJQUFJSSxLQUFKLENBQ0osOERBREksQ0FBTjtFQUdEOztFQUNELE9BQU9DLGFBQUEsQ0FBS0MsSUFBTCxDQUFVTixPQUFWLEVBQW1CLFVBQW5CLEVBQStCLGFBQS9CLENBQVA7QUFDRDtBQUVEO0FBQ0E7QUFDQTs7O0FBQ08sTUFBTU8sWUFBTixTQUEyQkMsa0JBQTNCLENBQXdDO0VBRzdDQyxXQUFXLENBQUM7SUFBRUM7RUFBRixDQUFELEVBQWtEO0lBQzNEO0lBRDJEO0lBRTNELEtBQUtDLGVBQUwsR0FBdUJELGNBQWMsSUFBSVgsd0JBQXdCLEVBQWpFOztJQUNBLElBQUk7TUFDRixJQUFJYSxJQUFJLEdBQUdDLFdBQUEsQ0FBR0MsWUFBSCxDQUFnQixLQUFLSCxlQUFyQixFQUFzQyxPQUF0QyxDQUFYOztNQUNBLEtBQUtJLGVBQUwsR0FBdUJDLElBQUksQ0FBQ0MsS0FBTCxDQUFXTCxJQUFYLENBQXZCO0lBQ0QsQ0FIRCxDQUdFLE9BQU9NLENBQVAsRUFBVSxDQUNWO0lBQ0Q7RUFDRjs7RUFFREMsV0FBVyxHQUFHO0lBQ1osTUFBTVAsSUFBSSxHQUFHLHdCQUFlLEtBQUtHLGVBQXBCLEVBQXFDLElBQXJDLEVBQTJDLENBQTNDLENBQWI7O0lBQ0EsSUFBSTtNQUNGRixXQUFBLENBQUdPLGFBQUgsQ0FBaUIsS0FBS1QsZUFBdEIsRUFBdUNDLElBQXZDOztNQUNBQyxXQUFBLENBQUdRLFNBQUgsQ0FBYSxLQUFLVixlQUFsQixFQUFtQyxLQUFuQztJQUNELENBSEQsQ0FHRSxPQUFPTyxDQUFQLEVBQVU7TUFDVixNQUFNSSxTQUFTLEdBQUdqQixhQUFBLENBQUtrQixPQUFMLENBQWEsS0FBS1osZUFBbEIsQ0FBbEI7O01BQ0FFLFdBQUEsQ0FBR1csU0FBSCxDQUFhRixTQUFiOztNQUNBVCxXQUFBLENBQUdRLFNBQUgsQ0FBYUMsU0FBYixFQUF3QixLQUF4Qjs7TUFDQVQsV0FBQSxDQUFHTyxhQUFILENBQWlCLEtBQUtULGVBQXRCLEVBQXVDQyxJQUF2Qzs7TUFDQUMsV0FBQSxDQUFHUSxTQUFILENBQWEsS0FBS1YsZUFBbEIsRUFBbUMsS0FBbkM7SUFDRDtFQUNGOztBQTFCNEMifQ==