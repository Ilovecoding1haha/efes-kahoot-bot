export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url, method = 'GET', headers = {}, body = null } = req.body || {};
  if (!url) return res.status(400).json({ error: 'missing url' });

  const h = { ...headers };
  try {
    const o = new URL(url).origin;
    if (!h['origin']) h['origin'] = o;
    if (!h['referer']) h['referer'] = o + '/';
  } catch {}
  if (!h['user-agent']) {
    h['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
  }

  try {
    const r = await fetch(url, {
      method,
      headers: h,
      body: body == null ? undefined : (typeof body === 'string' ? body : JSON.stringify(body)),
      redirect: 'manual'
    });
    const text = await r.text();
    const out = {};
    for (const k of ['content-type', 'x-kahoot-session-token', 'set-cookie', 'location']) {
      const v = r.headers.get(k);
      if (v) out[k] = v;
    }
    return res.status(200).json({ status: r.status, headers: out, text });
  } catch (e) {
    return res.status(200).json({ status: 0, error: String(e) });
  }
}
