import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';
const source = (await readFile(new URL('../src/index.js', import.meta.url), 'utf8')) + '\nexport { searchFamilyProducts };';
const { searchFamilyProducts } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const env = { FAMILY_SEARCH_URL: 'https://app3.family.com.tw/api/familysearch/GetRetailSearchV2' };
const request = all => new Request(`https://proxy.example/family/search?keyword=飯糰&all_channels=${all}`);

test('uses Workers-compatible redirect mode and normalizes grouped results', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      // Model the Workers restriction that Node fetch alone does not enforce.
      assert.equal(options.redirect, 'manual');
      assert.equal(url.searchParams.get('languageCode'), 'zh-TW');
      return Response.json({ result: {
        storeInfo: { product: [{ id: 'product-1', name: '飯糰', price: '35' }, { id: '1', price: '40' }] },
        product: [{ id: 'product-1', channel: 'STORE' }, { id: '1', price: '50' }],
      } });
    };
    assert.deepEqual(await (await searchFamilyProducts(request(false), env)).json(), [
      { id: '1', name: '飯糰', price: '35', channel: 'STORE', promotions: [] },
    ]);
    assert.equal((await (await searchFamilyProducts(request(true), env)).json()).length, 2);
    globalThis.fetch = async () => new Response(null, { status: 302, headers: { Location: 'https://other.example/' } });
    await assert.rejects(searchFamilyProducts(request(false), env), /FamilyMart search failed \(302\)/);
    globalThis.fetch = async () => Response.json({ result: null });
    await assert.rejects(searchFamilyProducts(request(false), env), /Invalid FamilyMart result/);
  } finally { globalThis.fetch = original; }
});
