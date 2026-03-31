declare module 'sistemium-auth/lib/middleware' {
  import { Middleware } from 'koa';
  export default function (config: { requiredRole?: string }): Middleware;
}
