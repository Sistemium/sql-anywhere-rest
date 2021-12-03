import Anywhere from 'sistemium-sqlanywhere';
import lo from 'lodash';
import log from 'sistemium-debug';

const { debug } = log('query');

export default async function (ctx) {

  const { body, headers: { 'parse-only': parseOnly } } = ctx.request;

  ctx.assert(lo.isObject(body));

  // debug('body', body);

  const { select, from, where, group, order, having, call } = body;

  if (call) {
    ctx.throw(400, 'CALL is not supported');
  }

  if (!select) {
    ctx.throw(400, 'SELECT is required');
  }

  const sql = lo.filter([
    // call && `CALL ${call}`,
    select && `SELECT ${stringOrJoin(select, ', ')}`,
    from && `  FROM ${stringOrJoin(from)}`,
    where && ` WHERE ${stringOrJoin(where, ' and ')}`,
    group && ` GROUP BY ${stringOrJoin(group, ', ')}`,
    having && `HAVING ${stringOrJoin(having, ', ')}`,
    order && ` ORDER BY ${stringOrJoin(order, ', ')}`,
  ]).join('\n');

  const conn = new Anywhere();
  await conn.connect();

  debug('query', lo.filter([select, from, where, group]));

  try {
    if (parseOnly) {
      ctx.body = sql;
    } else {
      ctx.body = await conn.execImmediate(sql);
      debug('result', ctx.body.length);
    }
  } catch (e) {
    ctx.throw(400, e.message);
  }

  await conn.disconnect();

}

function stringOrJoin(stringOrArray, join = ' ') {
  return Array.isArray(stringOrArray)
    ? stringOrArray.join(join)
    : stringOrArray;
}
