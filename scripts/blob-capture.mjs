import { chromium } from 'playwright';
import fs from 'node:fs';

const url = 'https://www.gaoding.com/editor/design?mode=user&id=33666427721202831';

const hook = `(() => {
  const toHex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  const records = [];
  const origCreate = URL.createObjectURL;
  const origRevoke = URL.revokeObjectURL;
  const origWorker = window.Worker;
  const origSharedWorker = window.SharedWorker;
  const stable = (stack) => {
    try {
      const m = String(stack||'').split('\n').map(s => s.trim()).find(s => /(https?:\/\/[^\s)]+):(\d+):(\d+)/.test(s));
      if (!m) return null;
      const mm = m.match(/(https?:\/\/[^\s)]+):(\d+):(\d+)/);
      return { file: mm[1], line: Number(mm[2]), col: Number(mm[3]) };
    } catch { return null; }
  };
  const hash32 = (s) => { let h = 2166136261>>>0; for (let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619);} return (h>>>0).toString(16); };

  URL.createObjectURL = function(obj){
    const url = origCreate.call(URL, obj);
    try {
      const st = (new Error('BLOB_STACK')).stack;
      const sig = stable(st);
      const fp = sig ? hash32(sig.file+':'+sig.line+':'+sig.col+'|'+(obj?.type||'')) : null;
      const rec = { url, type: obj?.type, size: obj?.size, cls: obj?.constructor?.name, when: performance.now(), stack: st, source: sig, fingerprint: fp };
      records.push(rec);
      if (obj && typeof obj.arrayBuffer === 'function' && self.crypto?.subtle) {
        obj.arrayBuffer().then(buf => crypto.subtle.digest('SHA-256', buf)).then(d => {
          rec.sha256 = toHex(d);
        }).catch(()=>{});
      }
    } catch {}
    return url;
  };

  URL.revokeObjectURL = function(u){
    try { records.push({ url: u, revoked: true, when: performance.now() }); } catch {}
    return origRevoke.call(URL, u);
  };

  // Observe resource entries for blob:
  try {
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) {
        if (String(e.name).startsWith('blob:')) records.push({ note:'BLOB_RESOURCE', name:e.name, initiatorType:e.initiatorType, startTime:e.startTime, duration:e.duration });
      }
    }).observe({ entryTypes: ['resource'] });
  } catch {}

  // Canvas helpers
  const ctb = HTMLCanvasElement.prototype.toBlob;
  const tdl = HTMLCanvasElement.prototype.toDataURL;
  if (ctb) HTMLCanvasElement.prototype.toBlob = function(cb, type, q){ return ctb.call(this, (...a)=>{ records.push({ note:'CANVAS_BLOB', type, q, when: performance.now() }); cb(...a); }, type, q); };
  if (tdl) HTMLCanvasElement.prototype.toDataURL = function(type, q){ const r = tdl.call(this, type, q); try { if ((r||'').startsWith('data:')) records.push({ note:'CANVAS_DATAURL', type, q, when: performance.now() }); } catch {} return r; };

  // Worker constructors (log blob workers)
  try {
    if (origWorker) {
      window.Worker = function(scriptURL, opts){ records.push({ note:'WORKER', scriptURL: String(scriptURL) }); return new origWorker(scriptURL, opts); };
      window.Worker.prototype = origWorker.prototype;
    }
    if (origSharedWorker) {
      window.SharedWorker = function(scriptURL, opts){ records.push({ note:'SHARED_WORKER', scriptURL: String(scriptURL) }); return new origSharedWorker(scriptURL, opts); };
      window.SharedWorker.prototype = origSharedWorker.prototype;
    }
  } catch {}

  Object.defineProperty(window, '__blobRecords', { value: records, configurable: false });
})();`;

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  await context.addInitScript(hook);
  const page = await context.newPage();
  await page.addInitScript(hook);

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  // Try to open the download dialog which often triggers canvas/export flows
  try { await page.getByRole('button', { name: '下载' }).click(); } catch {}
  await page.waitForTimeout(8000);

  // Allow async sha256 to settle
  await page.waitForTimeout(2000);

  const records = await page.evaluate(() => window.__blobRecords || []);

  // Aggregate: prefer sha256, then fingerprint, then source tuple, then url
  const bySig = {};
  for (const r of records) {
    const fallbackSrc = r.source ? (r.source.file+':'+r.source.line+':'+r.source.col+'|'+(r.type||'')) : '';
    const key = r.sha256 || r.fingerprint || fallbackSrc || r.url || 'unknown';
    (bySig[key] ||= { count:0, type:r.type, source:r.source, sha256:r.sha256, samples:[] });
    bySig[key].count++;
    if (r.url && bySig[key].samples.length < 3) bySig[key].samples.push({ url:r.url, size:r.size });
  }

  fs.writeFileSync('scripts/blob-capture-output.json', JSON.stringify(records, null, 2));
  fs.writeFileSync('scripts/blob-capture-agg.json', JSON.stringify(bySig, null, 2));

  console.log('Captured blobs by stable key (sha256/fingerprint/source):');
  for (const [k,v] of Object.entries(bySig)) {
    console.log('-', k, v.type, 'x', v.count, '=>', v.source?.file+':'+v.source?.line+':'+v.source?.col);
  }

  await browser.close();
})();
