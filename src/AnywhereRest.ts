import log from 'sistemium-debug';
import Koa from 'koa';
import Router from '@koa/router';
import koaBody from 'koa-bodyparser';
import logger from 'koa-logger';
import auth from 'sistemium-auth/lib/middleware';

import query from './handlers/query';

const { debug } = log('api');

interface AnywhereRestConfig {
  requiredRole?: string;
}

export default class AnywhereRest {

  app: Koa;

  constructor(config: AnywhereRestConfig = {}) {

    const { requiredRole } = config;
    const app = new Koa();
    const router = new Router();

    router.post('/query', query);

    this.app = app
      .use(logger())
      .use(koaBody());

    if (requiredRole) {
      app.use(auth({ requiredRole }));
      debug('requiredRole', requiredRole);
    }

    app.use(router.routes());
  }

  listen(port: number | string) {
    console.assert(!!port, 'port must be specified');
    this.app.listen(Number(port));
    debug('listen', port);
  }

}
