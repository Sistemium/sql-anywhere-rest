import lo from 'lodash';
import log from 'sistemium-debug';
const { debug } = log('sql');

export interface QueryObject {
  select?: string | string[];
  from?: string | string[];
  where?: string | string[];
  group?: string | string[];
  order?: string | string[];
  having?: string | string[];
  call?: string;
}

export function queryToSQL(queryObject: QueryObject): string {
  const { select, from, where, group, order, having } = queryObject;
  debug('query', lo.filter([select, from, where, group]));

  return lo.filter([
    select && `SELECT ${stringOrJoin(select, ', ')}`,
    from && `  FROM ${stringOrJoin(from)}`,
    where && ` WHERE ${stringOrJoin(where, ' and ')}`,
    group && ` GROUP BY ${stringOrJoin(group, ', ')}`,
    having && `HAVING ${stringOrJoin(having, ', ')}`,
    order && ` ORDER BY ${stringOrJoin(order, ', ')}`,
  ]).join('\n');
}

export function stringOrJoin(stringOrArray: string | string[], join = ' '): string {
  return Array.isArray(stringOrArray)
    ? stringOrArray.join(join)
    : stringOrArray;
}
