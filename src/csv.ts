/**
 *
 */
import { Transform } from 'stream';
import { parse as csvParse, Options as ParseOpts } from 'csv-parse';
import { parse as csvParseSync } from 'csv-parse/sync';

import {
  stringify as csvStringify,
  Options as StringifyOpts,
} from 'csv-stringify';
import { stringify as csvStringifySync } from 'csv-stringify/sync';

/**
 * @private
 */
export function parseCSV(str: string, options?: ParseOpts): Object[] {
  return csvParseSync(str, { ...options, columns: true });
}

/**
 * @private
 */
export function toCSV(records: Object[], options?: StringifyOpts): string {
  return csvStringifySync(records, { ...options, header: true });
}

/**
 * @private
 */
export function parseCSVStream(options?: ParseOpts): Transform {
  return csvParse({ ...options, columns: true });
}

/**
 * @private
 */
export function serializeCSVStream(options?: StringifyOpts): Transform {
  return csvStringify({ ...options, header: true });
}
