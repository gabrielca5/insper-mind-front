const DEFAULT_API_TARGET = process.env.API_PROXY_TARGET || 'http://3.237.223.11:8080';

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function getForwardHeaders(req) {
  const blockedHeaders = new Set([
    'accept-encoding',
    'connection',
    'content-length',
    'host',
    'x-forwarded-host',
    'x-forwarded-proto',
  ]);

  return Object.fromEntries(
    Object.entries(req.headers).filter(([key]) => !blockedHeaders.has(key.toLowerCase()))
  );
}

function writeResponseHeaders(res, headers) {
  const blockedHeaders = new Set([
    'connection',
    'content-encoding',
    'content-length',
    'transfer-encoding',
  ]);

  headers.forEach((value, key) => {
    if (!blockedHeaders.has(key.toLowerCase())) {
      res.setHeader(key, value);
    }
  });
}

export default async function handler(req, res) {
  const apiTarget = process.env.API_PROXY_TARGET || process.env.VITE_API_PROXY_TARGET || DEFAULT_API_TARGET;
  const incomingUrl = new URL(req.url, `https://${req.headers.host}`);
  const targetPath = incomingUrl.pathname.replace(/^\/api\/?/, '/');
  const targetUrl = `${apiTarget}${targetPath}${incomingUrl.search}`;

  try {
    const hasBody = !['GET', 'HEAD'].includes(req.method);
    const body = hasBody ? await readRequestBody(req) : undefined;
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: getForwardHeaders(req),
      body,
      redirect: 'manual',
    });

    writeResponseHeaders(res, response.headers);
    res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    res.status(502).json({
      error: 'API proxy failed',
      message: error?.message ?? 'Unknown proxy error',
    });
  }
}
