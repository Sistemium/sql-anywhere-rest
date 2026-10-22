// A fake PHA roles endpoint, so the auth tests need no network.
// Mocha loads this file before the tests (see .mocharc.json):
// sistemium-auth reads PHA_ROLES_URL once, when it is first loaded,
// so the variable must be set before any test imports the app.
import http from 'node:http';
import { AddressInfo } from 'node:net';

export const ROLE = 'testRole';

export const TOKENS = {
  withRole: 'token-with-role',
  withoutRole: 'token-without-role',
  unknown: 'token-unknown',
};

const ROLES: Record<string, Record<string, boolean>> = {
  [TOKENS.withRole]: { [ROLE]: true },
  [TOKENS.withoutRole]: { otherRole: true },
};

const server = http.createServer((req, res) => {
  const roles = ROLES[req.headers.authorization || ''];
  if (!roles) {
    res.writeHead(401).end();
    return;
  }
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ account: { name: 'Test account' }, roles }));
});

// listening without a host binds synchronously, so the port is known right away
server.listen(0).unref();

const { port } = server.address() as AddressInfo;
process.env.PHA_ROLES_URL = `http://localhost:${port}/roles`;
