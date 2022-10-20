import Anywhere from 'sistemium-sqlanywhere';
import lo from 'lodash';
import log from 'sistemium-debug';
import { queryToSQL } from '../sql';

const { debug } = log('query');

export default async function (ctx) {

  const { body, headers: { 'parse-only': parseOnly } } = ctx.request;

  ctx.assert(lo.isObject(body));

  // debug('body', body);

  const { select, call } = body;

  if (call) {
    ctx.throw(400, 'CALL is not supported');
  }

  if (!select) {
    ctx.throw(400, 'SELECT is required');
  }

  const sql = queryToSQL(body);

  const conn = new Anywhere();
  await conn.connect();

  try {
    if (parseOnly) {
      ctx.body = sql;
    } else {
      ctx.body = await conn.execImmediate(sql);
      debug('result', ctx.body.length);
    }
  } catch (e) {
    await conn.disconnect();
    ctx.throw(400, e.message);
  }

  await conn.disconnect();

}
