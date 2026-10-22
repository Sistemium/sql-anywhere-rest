import assert from 'node:assert/strict';
import request from 'supertest';
import AnywhereRest from '../src/AnywhereRest';

// Only requests that never reach the database: parse-only and rejected ones
describe('POST /query', () => {

  const app = new AnywhereRest().app.callback();

  it('returns the generated SQL with the parse-only header', async () => {
    const res = await request(app)
      .post('/query')
      .set('parse-only', '1')
      .send({ select: ['a', 'b'], from: 't', where: ['a = 1', 'b = 2'] })
      .expect(200)
      .expect('content-type', /text\/plain/);
    assert.equal(res.text, 'SELECT a, b\n  FROM t\n WHERE a = 1 and b = 2');
  });

  it('rejects CALL', async () => {
    const res = await request(app)
      .post('/query')
      .send({ call: 'sp_drop_everything()' })
      .expect(400);
    assert.equal(res.text, 'CALL is not supported');
  });

  it('rejects CALL even with SELECT and parse-only', async () => {
    await request(app)
      .post('/query')
      .set('parse-only', '1')
      .send({ select: '1', call: 'p()' })
      .expect(400, 'CALL is not supported');
  });

  it('requires SELECT', async () => {
    await request(app)
      .post('/query')
      .set('parse-only', '1')
      .send({ from: 't' })
      .expect(400, 'SELECT is required');
  });

  it('has no other routes', async () => {
    await request(app).get('/query').expect(404);
  });

});
