import Anywhere from 'sistemium-sqlanywhere';
import lo from 'lodash';
import log from 'sistemium-debug';

const { debug } = log('query');

export default async function (ctx) {

  const conn = new Anywhere();
  await conn.connect();
  const { body, headers: { 'parse-only': parseOnly } } = ctx.request;

  ctx.assert(lo.isObject(body));

  // debug('body', body);

  const { select, from, where, group, order, having, call } = body;

  const sql = lo.filter([
    call && `CALL ${call}`,
    select && `SELECT ${stringOrJoin(select, ', ')}`,
    from && `  FROM ${stringOrJoin(from)}`,
    where && ` WHERE ${stringOrJoin(where, ' and ')}`,
    group && ` GROUP BY ${stringOrJoin(group, ', ')}`,
    having && `HAVING ${stringOrJoin(having, ', ')}`,
    order && ` ORDER BY ${stringOrJoin(order, ', ')}`,
  ]).join('\n');

  // debug('sql', sql);

  try {
    if (parseOnly) {
      ctx.body = sql;
    } else {
      ctx.body = await conn.execImmediate(sql);
    }
  } catch (e) {
    ctx.throw(e.message, 400);
  }

  await conn.disconnect();

}

function stringOrJoin(stringOrArray, join = ' ') {
  return Array.isArray(stringOrArray)
    ? stringOrArray.join(join)
    : stringOrArray;
}
