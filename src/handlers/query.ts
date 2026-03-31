import Anywhere from 'sistemium-sqlanywhere';
import lo from 'lodash';
import log from 'sistemium-debug';
import { Context } from 'koa';
import { queryToSQL, QueryObject } from '../sql';

const { debug } = log('query');

export default async function (ctx: Context) {

  const body = ctx.request.body as QueryObject;
  const parseOnly = ctx.request.headers['parse-only'];

  ctx.assert(lo.isObject(body));

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
      debug('result', (ctx.body as unknown[]).length);
    }
  } catch (e) {
    await conn.disconnect();
    ctx.throw(400, (e as Error).message);
  }

  await conn.disconnect();

}
