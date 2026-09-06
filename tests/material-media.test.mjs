import assert from "node:assert/strict";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const rows = [];
const objects = new Map();
const fixtureEnv = {
  DB: {
    prepare(sql) {
      let values = [];
      return {
        bind(...args) { values = args; return this; },
        async run() {
          assert.match(sql, /^INSERT INTO materials/);
          const [id, title, content, location, event_date, created_at, files, file_count, status, consent, category] = values;
          rows.push({ id, title, content, location, event_date, created_at, files, file_count, status, consent, category });
        },
        async first() { return rows.find((row) => row.id === values[0]) ?? null; },
        async all() { return { results: rows.filter((row) => row.status === "published" && row.consent === 1 && (!sql.includes("AND category=?") || row.category === values[0])) }; },
      };
    },
  },
  BUCKET: {
    async put(key, stream) { objects.set(key, new Uint8Array(await new Response(stream).arrayBuffer())); },
    async delete(key) { objects.delete(key); },
    async get(key, options) {
      const bytes = objects.get(key);
      if (!bytes) return null;
      const range = options.range.get("Range");
      if (range) {
        const [, start, end] = /^bytes=(\d+)-(\d+)$/.exec(range);
        return { body: bytes.slice(+start, +end + 1), size: bytes.length, range: { offset: +start, length: +end - +start + 1 } };
      }
      return { body: bytes, size: bytes.length };
    },
  },
};
globalThis.__materialTestEnv = fixtureEnv;
const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom", configFile: false, root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true, hmr: false },
  plugins: [{
    name: "test-material-bindings",
    resolveId(id) { if (id === "cloudflare:workers") return "\0material-test-env"; },
    load(id) { if (id === "\0material-test-env") return "export const env = globalThis.__materialTestEnv;"; },
  }],
});
after(async () => { await vite.close(); delete globalThis.__materialTestEnv; });

test("publishes a mixed-media submission and serves every attachment inline", async () => {
  const { POST } = await vite.ssrLoadModule("/app/api/materials/route.ts");
  const { GET: evidence } = await vite.ssrLoadModule("/app/api/evidence/route.ts");
  const { GET: media } = await vite.ssrLoadModule("/app/api/media/route.ts");
  const form = new FormData();
  form.set("title", "测试材料");
  form.set("content", "仅用于本地测试的混合附件");
  form.set("publicConsent", "yes");
  form.set("category", "official");
  const cases = [["photo.png", "image/png"], ["clip.mp4", "video/mp4"], ["reply.pdf", "application/pdf"], ["audio.wav", "audio/wav"]];
  for (const [name, type] of cases) form.append("files", new File(["fixture-content"], name, { type }));
  const response = await POST(new Request("http://localhost/api/materials", { method: "POST", body: form }));
  assert.equal(response.status, 201);
  const { id } = await response.json();
  const { items } = await (await evidence()).json();
  const item = items.find((entry) => entry.id === id);
  assert.equal(item.files.length, 4);
  for (let i = 0; i < cases.length; i++) {
    assert.equal(item.files[i].type, cases[i][1]);
    const served = await media(new Request(`http://localhost${item.files[i].url}`));
    assert.equal(served.status, 200);
    assert.equal(served.headers.get("Content-Type"), cases[i][1]);
    assert.equal(served.headers.get("Content-Disposition"), "inline");
    assert.equal(await served.text(), "fixture-content");
  }
  const audio = await media(new Request(`http://localhost${item.files[3].url}`, { headers: { Range: "bytes=0-3" } }));
  assert.equal(audio.status, 206);
  assert.equal(audio.headers.get("Content-Range"), "bytes 0-3/15");
  assert.equal(await audio.text(), "fixt");

  // Previously uploaded PDFs were recorded as generic binary files.
  const row = rows.find((entry) => entry.id === id);
  const files = JSON.parse(row.files);
  files[2].type = "application/octet-stream";
  row.files = JSON.stringify(files);
  const legacyPdf = await media(new Request(`http://localhost${item.files[2].url}`));
  assert.equal(legacyPdf.headers.get("Content-Type"), "application/pdf");
  assert.equal(legacyPdf.headers.get("Content-Disposition"), "inline");

  row.consent = 0;
  assert.equal((await media(new Request(`http://localhost${item.files[2].url}`))).status, 404);
  row.consent = 1;
  row.status = "pending";
  assert.equal((await media(new Request(`http://localhost${item.files[2].url}`))).status, 404);
});

test("renders images, native video/audio controls, and embedded PDFs", async () => {
  const { MaterialAttachment } = await vite.ssrLoadModule("/app/MaterialAttachment.tsx");
  const render = (name, type) => renderToStaticMarkup(React.createElement(MaterialAttachment, {
    file: { name, type, url: "/api/media?id=test&index=0" }, onExpand() {},
  }));
  assert.match(render("photo.png", "image/png"), /aria-label="放大图片：photo.png"/);
  assert.match(render("clip.mp4", "video/mp4"), /<video[^>]*controls/);
  assert.match(render("audio.wav", "audio/wav"), /<audio[^>]*controls/);
  assert.match(render("reply.pdf", "application/pdf"), /<iframe[^>]*title="PDF：reply.pdf"/);
  assert.match(render("old.PDF", "application/octet-stream"), /<iframe/);
  assert.match(render("record.txt", "text/plain"), /<pre[^>]*class="material-text-preview"/);
  assert.doesNotMatch(render("other.docx", "application/octet-stream"), /<iframe|<img|<audio|<video/);
});

test("text-only publishes immediately, category filtering isolates records, and invalid input is rejected", async () => {
  const { POST } = await vite.ssrLoadModule('/app/api/materials/route.ts');
  const { GET } = await vite.ssrLoadModule('/app/api/evidence/route.ts');
  const form = new FormData();
  form.set('title', '纯文字办理记录');
  form.set('content', '居民转述的回访记录，尚无附件。');
  form.set('publicConsent', 'yes');
  form.set('category', 'handling');
  const originalBucket = fixtureEnv.BUCKET;
  delete fixtureEnv.BUCKET;
  let response;
  try { response = await POST(new Request('http://localhost/api/materials', {method:'POST', body:form})); }
  finally { fixtureEnv.BUCKET = originalBucket; }
  assert.equal(response.status, 201);
  const { id, status } = await response.json();
  assert.equal(status, 'published');
  const listing = await (await GET(new Request('http://localhost/api/evidence?category=handling'))).json();
  const item = listing.items.find((row) => row.id === id);
  assert.equal(item.category, 'handling');
  assert.deepEqual(item.files, []);
  const other = await (await GET(new Request('http://localhost/api/evidence?category=official'))).json();
  assert.ok(!other.items.some((row) => row.id === id));
  form.set('category', 'invented');
  assert.equal((await POST(new Request('http://localhost/api/materials', {method:'POST',body:form}))).status,400);
  assert.equal((await GET(new Request('http://localhost/api/evidence?category=invalid'))).status,400);
  form.set('category', 'resident');
  form.delete('publicConsent');
  assert.equal((await POST(new Request('http://localhost/api/materials', {method:'POST',body:form}))).status,400);
});

test('masonry fills every column before stacking and uses the shortest column', async () => {
  const { masonryLayout } = await vite.ssrLoadModule('/lib/masonry-layout.ts');
  const layout = masonryLayout([900, 300, 500, 200], 3, 300, 24);
  assert.deepEqual(layout.positions, [
    {x:0,y:0}, {x:324,y:0}, {x:648,y:0}, {x:324,y:324},
  ]);
  assert.equal(layout.height, 900);
  const resized = masonryLayout([100, 200, 150], 1, 320, 24);
  assert.deepEqual(resized.positions.map(p => p.y), [0,124,348]);
  assert.equal(resized.height, 498);
  assert.equal(masonryLayout([], 3, 300, 24).height, 0);
});
