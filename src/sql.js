import lo from 'lodash';
import log from 'sistemium-debug';
const { debug } = log('sql');

export function queryToSQL(queryObject) {
  const { select, from, where, group, order, having } = queryObject;
  debug('query', lo.filter([select, from, where, group]));

  return lo.filter([
    // call && `CALL ${call}`,
    select && `SELECT ${stringOrJoin(select, ', ')}`,
    from && `  FROM ${stringOrJoin(from)}`,
    where && ` WHERE ${stringOrJoin(where, ' and ')}`,
    group && ` GROUP BY ${stringOrJoin(group, ', ')}`,
    having && `HAVING ${stringOrJoin(having, ', ')}`,
    order && ` ORDER BY ${stringOrJoin(order, ', ')}`,
  ]).join('\n');
}


export function stringOrJoin(stringOrArray, join = ' ') {
  return Array.isArray(stringOrArray)
    ? stringOrArray.join(join)
    : stringOrArray;
}
