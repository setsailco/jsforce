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
  return csvParseSync(str, { ...options, columns: true, relax_quotes: true, relax_column_count: true, raw: true, on_record: ({raw, record}, {error}) => {
    if(error){
      return `ERROR ERROR ERROR ${raw}`;
    } else {
      return record;
    }
  } });
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
  return csvParse({ ...options, columns: true, relax_quotes: true, relax_column_count: true, raw: true, on_record: ({raw, record}, {error}) => {
    if(error){
      return `ERROR ERROR ERROR ${raw}`;
    } else {
      return record;
    }
  } });
}

/**
 * @private
 */
export function serializeCSVStream(options?: StringifyOpts): Transform {
  return csvStringify({ ...options, header: true });
}
