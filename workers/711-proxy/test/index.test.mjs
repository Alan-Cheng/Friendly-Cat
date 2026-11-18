import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import assert from 'node:assert/strict';
import test from 'node:test';
globalThis.crypto ??= webcrypto;
const source = await readFile(new URL('../src/index.js', import.meta.url), 'utf8');
const { default: worker } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
function env() {
  const kv = new Map([['proxy-token:valid', '1']]);
  return { TURNSTILE_SECRET_KEY: 'test', FAMILY_SEARCH_URL: 'https://app3.family.com.tw/api/familysearch/GetRetailSearchV2',
    PROXY_TOKENS: { get: async key => kv.get(key), put: async (key, value) => kv.set(key, value) } };
}
function request(path, cookie = 'proxy-token=valid') {
  return new Request(`https://proxy.example${path}`, { headers: { Origin: 'https://friendlycat.alan-cheng.com', Cookie: cookie } });
}
test('FamilyMart requires proxy cookie and works without 711 secrets', async () => {
  const original = globalThis.fetch;
  try {
    const bindings = env();
    globalThis.fetch = async (_, options) => {
      assert.equal(options.redirect, 'manual');
      assert.equal(new Headers(options.headers).has('Cookie'), false);
      return Response.json({ result: {} });
    };
    assert.equal((await worker.fetch(request('/family/search?keyword=x', ''), bindings)).status, 401);
    const response = await worker.fetch(request('/family/search?keyword=x'), bindings);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Access-Control-Allow-Credentials'), 'true');
    assert.deepEqual(await response.json(), []);
  } finally { globalThis.fetch = original; }
});
test('711 uses Exchange, KV cache, and a single retry with Bearer token', async () => {
  const original = globalThis.fetch;
  try {
    const bindings = { ...env(), MALL_KEY: 'test', MID: 'member', GID: 'group' };
    let exchanges = 0, forwards = 0;
    globalThis.fetch = async (url, options) => {
      if (url.pathname.endsWith('/auth/exchange')) {
        exchanges++;
        assert.ok(JSON.parse(options.body).UniopenMemberToken);
        return Response.json({ isSuccess: true, element: { AccessToken: `token-${exchanges}` } });
      }
      forwards++;
      assert.equal(url.searchParams.has('token'), false);
      assert.equal(options.headers.has('Cookie'), false);
      assert.equal(options.headers.get('Authorization'), `Bearer token-${exchanges}`);
      return new Response('ok', { status: forwards === 1 ? 401 : 200 });
    };
    const path = '/LoveFood/api/Search/test?token=browser';
    assert.equal((await worker.fetch(request(path), bindings)).status, 200);
    assert.equal(exchanges, 2);
    assert.equal(forwards, 2);
    assert.equal((await worker.fetch(request(path), bindings)).status, 200);
    assert.equal(exchanges, 2);
  } finally { globalThis.fetch = original; }
});
