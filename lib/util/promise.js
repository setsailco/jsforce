"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.StreamPromise = void 0;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _stream = require("stream");

/**
 *
 */

/**
 *
 */
class StreamPromise extends _promise.default {
  stream() {
    // dummy
    return new _stream.Duplex();
  }

  static create(builder) {
    const {
      stream,
      promise
    } = builder();
    const streamPromise = new StreamPromise((resolve, reject) => {
      promise.then(resolve, reject);
    });

    streamPromise.stream = () => stream;

    return streamPromise;
  }

}

exports.StreamPromise = StreamPromise;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJlYW1Qcm9taXNlIiwic3RyZWFtIiwiRHVwbGV4IiwiY3JlYXRlIiwiYnVpbGRlciIsInByb21pc2UiLCJzdHJlYW1Qcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInRoZW4iXSwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbC9wcm9taXNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICpcbiAqL1xuaW1wb3J0IHsgRHVwbGV4IH0gZnJvbSAnc3RyZWFtJztcblxuLyoqXG4gKlxuICovXG5leHBvcnQgdHlwZSBTdHJlYW1Qcm9taXNlQnVpbGRlcjxUPiA9ICgpID0+IHtcbiAgc3RyZWFtOiBEdXBsZXg7XG4gIHByb21pc2U6IFByb21pc2U8VD47XG59O1xuXG4vKipcbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBTdHJlYW1Qcm9taXNlPFQ+IGV4dGVuZHMgUHJvbWlzZTxUPiB7XG4gIHN0cmVhbSgpIHtcbiAgICAvLyBkdW1teVxuICAgIHJldHVybiBuZXcgRHVwbGV4KCk7XG4gIH1cblxuICBzdGF0aWMgY3JlYXRlPFQ+KGJ1aWxkZXI6IFN0cmVhbVByb21pc2VCdWlsZGVyPFQ+KSB7XG4gICAgY29uc3QgeyBzdHJlYW0sIHByb21pc2UgfSA9IGJ1aWxkZXIoKTtcbiAgICBjb25zdCBzdHJlYW1Qcm9taXNlID0gbmV3IFN0cmVhbVByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgcHJvbWlzZS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSk7XG4gICAgc3RyZWFtUHJvbWlzZS5zdHJlYW0gPSAoKSA9PiBzdHJlYW07XG4gICAgcmV0dXJuIHN0cmVhbVByb21pc2U7XG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFHQTs7QUFIQTtBQUNBO0FBQ0E7O0FBV0E7QUFDQTtBQUNBO0FBQ08sTUFBTUEsYUFBTiwwQkFBMEM7RUFDL0NDLE1BQU0sR0FBRztJQUNQO0lBQ0EsT0FBTyxJQUFJQyxjQUFKLEVBQVA7RUFDRDs7RUFFWSxPQUFOQyxNQUFNLENBQUlDLE9BQUosRUFBc0M7SUFDakQsTUFBTTtNQUFFSCxNQUFGO01BQVVJO0lBQVYsSUFBc0JELE9BQU8sRUFBbkM7SUFDQSxNQUFNRSxhQUFhLEdBQUcsSUFBSU4sYUFBSixDQUFxQixDQUFDTyxPQUFELEVBQVVDLE1BQVYsS0FBcUI7TUFDOURILE9BQU8sQ0FBQ0ksSUFBUixDQUFhRixPQUFiLEVBQXNCQyxNQUF0QjtJQUNELENBRnFCLENBQXRCOztJQUdBRixhQUFhLENBQUNMLE1BQWQsR0FBdUIsTUFBTUEsTUFBN0I7O0lBQ0EsT0FBT0ssYUFBUDtFQUNEOztBQWI4QyJ9