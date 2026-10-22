import assert from 'node:assert/strict';
import { queryToSQL, stringOrJoin } from '../src/sql';

describe('queryToSQL', () => {

  it('builds a minimal SELECT', () => {
    assert.equal(queryToSQL({ select: '1' }), 'SELECT 1');
  });

  it('builds all clauses in SQL order from strings', () => {
    const sql = queryToSQL({
      order: 'a',
      having: 'count(*) > 1',
      group: 'a',
      where: 'a > 0',
      from: 't',
      select: 'a, count(*)',
    });
    assert.equal(sql, [
      'SELECT a, count(*)',
      '  FROM t',
      ' WHERE a > 0',
      ' GROUP BY a',
      'HAVING count(*) > 1',
      ' ORDER BY a',
    ].join('\n'));
  });

  it('joins arrays with the separator of each clause', () => {
    const sql = queryToSQL({
      select: ['a', 'b'],
      from: ['t1', 'join t2 on t2.id = t1.id'],
      where: ['a = 1', 'b = 2'],
      group: ['a', 'b'],
      order: ['a', 'b desc'],
    });
    assert.equal(sql, [
      'SELECT a, b',
      '  FROM t1 join t2 on t2.id = t1.id',
      ' WHERE a = 1 and b = 2',
      ' GROUP BY a, b',
      ' ORDER BY a, b desc',
    ].join('\n'));
  });

  it('skips empty clauses and ignores call', () => {
    assert.equal(
      queryToSQL({ select: 'a', from: 't', where: '', call: 'p()' }),
      'SELECT a\n  FROM t',
    );
  });

});

describe('stringOrJoin', () => {

  it('returns a string as is', () => {
    assert.equal(stringOrJoin('a b', ', '), 'a b');
  });

  it('joins an array with a space by default', () => {
    assert.equal(stringOrJoin(['a', 'b']), 'a b');
  });

});
