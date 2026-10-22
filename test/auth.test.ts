import request from 'supertest';
import AnywhereRest from '../src/AnywhereRest';
import { ROLE, TOKENS } from './fakeRoles';

// The roles endpoint is the fake one from fakeRoles.ts
describe('auth with REQUIRED_ROLE', () => {

  const app = new AnywhereRest({ requiredRole: ROLE }).app.callback();

  function query() {
    return request(app)
      .post('/query')
      .set('parse-only', '1')
      .send({ select: '1' });
  }

  it('responds 401 without a token', async () => {
    await query().expect(401);
  });

  it('responds 401 when the roles endpoint rejects the token', async () => {
    await query().set('authorization', TOKENS.unknown).expect(401);
  });

  it('responds 403 without the required role', async () => {
    await query().set('authorization', TOKENS.withoutRole).expect(403);
  });

  // sistemium-auth 1.3.0 changed the middleware signature and this got 401
  it('passes a token with the required role', async () => {
    await query().set('authorization', TOKENS.withRole).expect(200, 'SELECT 1');
  });

});
