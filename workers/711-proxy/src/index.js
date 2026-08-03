const TIME_ZONE = "Asia/Taipei";
const UPSTREAM_ORIGIN = "https://lovefood.openpoint.com.tw";
const TOKEN_PATH = "/LoveFood/api/Auth/FrontendAuth/AccessToken";
const LOVEFOOD_PREFIX = "/LoveFood/api/";
const IMAP_PREFIX = "/iMap/api/";
const PROXY_TOKEN_PATH = "/proxy-token";
const ALLOWED_ORIGIN = "https://friendlycat.alan-cheng.com";
const PROXY_TOKEN_COOKIE = "proxy-token";
const PROXY_TOKEN_TTL_SECONDS = 10 * 60;

const TOKEN_CACHE_KEY = "https://worker.internal/cache/7-eleven-token";
const MIN_TOKEN_TTL_HOURS = 1;
const MAX_TOKEN_TTL_HOURS = 12;

const TOKEN_REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  Accept: "application/json",
  "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
  "Content-Type": "application/json",
};

const TIME_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

// 避免同一個 Worker isolate 內，多個請求同時刷新 token。
let tokenRefreshPromise = null;

function taipeiTimestamp(date = new Date()) {
  const parts = Object.fromEntries(
    TIME_FORMATTER.formatToParts(date)
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );

  return `${parts.year}/${parts.month}/${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

function base64Url(bytes) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function randomTokenTtlHours() {
  const range = MAX_TOKEN_TTL_HOURS - MIN_TOKEN_TTL_HOURS + 1;
  const random = new Uint32Array(1);

  crypto.getRandomValues(random);

  return MIN_TOKEN_TTL_HOURS + (random[0] % range);
}

async function generateMidV(mallKey, mid, gid) {
  const encoder = new TextEncoder();
  const mallKeyBytes = encoder.encode(mallKey);

  const aesKey = new Uint8Array(32);
  const iv = new Uint8Array(12);

  aesKey.set(mallKeyBytes.slice(0, aesKey.length));
  iv.set(mallKeyBytes.slice(0, iv.length));

  // Keep this insertion order identical to the APK Gson payload.
  const payload = {
    MID_V: "",
    TimeStamp: taipeiTimestamp(),
    MID: mid,
    GID: gid,
    VCode: "",
  };

  const key = await crypto.subtle.importKey(
    "raw",
    aesKey,
    "AES-GCM",
    false,
    ["encrypt"],
  );

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: 128,
    },
    key,
    encoder.encode(JSON.stringify(payload)),
  );

  return encodeURIComponent(base64Url(new Uint8Array(encrypted)));
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Turnstile-Token",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'"'"'`)}'`;
}

async function logRequestAsCurl(
  label,
  request,
  url = request.url,
  headersOverride,
) {
  const headers = headersOverride
    ? new Headers(headersOverride)
    : new Headers(request.headers);

  headers.delete("host");
  headers.delete("content-length");
  headers.delete("cookie");
  headers.delete("x-turnstile-token");

  let body;

  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request
      .clone()
      .text()
      .catch(() => "");
  }

  const curl = [
    "curl -i",
    "-X",
    request.method,
    shellQuote(url),
  ];

  for (const [name, value] of headers) {
    curl.push("-H", shellQuote(`${name}: ${value}`));
  }

  if (body !== undefined) {
    curl.push("--data", shellQuote(body));
  }

  console.log(label, curl.join(" "));
}

function allowedOrigin(request) {
  const origin = request.headers.get("Origin");

  if (
    origin === ALLOWED_ORIGIN ||
    /^https?:\/\/localhost(?::\d+)?$/.test(origin || "")
  ) {
    return origin;
  }

  return null;
}

function responseWithCors(response, origin) {
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(corsHeaders(origin))) {
    headers.set(name, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function configured(env) {
  return (
    typeof env.MALL_KEY === "string" &&
    typeof env.MID === "string" &&
    typeof env.GID === "string"
  );
}

function proxyTokenConfigured(env) {
  return (
    typeof env.TURNSTILE_SECRET_KEY === "string" &&
    env.TURNSTILE_SECRET_KEY &&
    env.PROXY_TOKENS
  );
}

function cookieValue(request, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = request.headers
    .get("Cookie")
    ?.match(new RegExp(`(?:^|;\\s*)${escapedName}=([^;]*)`));

  return match ? match[1] : null;
}

function createProxyToken() {
  // 24 random bytes encode to exactly 32 URL-safe Base64 characters.
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

function proxyTokenCookie(token) {
  return [
    `${PROXY_TOKEN_COOKIE}=${token}`,
    "Path=/",
    `Max-Age=${PROXY_TOKEN_TTL_SECONDS}`,
    "HttpOnly",
    "Secure",
    "SameSite=None",
  ].join("; ");
}

async function verifyTurnstileToken(request, env) {
  const token = request.headers.get("X-Turnstile-Token");

  if (!token) {
    return false;
  }

  const form = new FormData();
  form.set("secret", env.TURNSTILE_SECRET_KEY);
  form.set("response", token);

  const clientIp = request.headers.get("CF-Connecting-IP");
  if (clientIp) {
    form.set("remoteip", clientIp);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: form },
  );
  const result = await response.json().catch(() => null);

  return response.ok && result?.success === true && result?.action === "proxy-token";
}

async function issueProxyToken(request, env, origin) {
  if (!proxyTokenConfigured(env)) {
    return responseWithCors(
      new Response("Turnstile and PROXY_TOKENS bindings are required", { status: 500 }),
      origin,
    );
  }

  if (!(await verifyTurnstileToken(request, env))) {
    return responseWithCors(
      new Response("Invalid Turnstile token", { status: 403 }),
      origin,
    );
  }

  const token = createProxyToken();
  await env.PROXY_TOKENS.put(`proxy-token:${token}`, "1", {
    expirationTtl: PROXY_TOKEN_TTL_SECONDS,
  });

  return responseWithCors(
    Response.json(
      { expiresIn: PROXY_TOKEN_TTL_SECONDS },
      { headers: { "Set-Cookie": proxyTokenCookie(token), "Cache-Control": "no-store" } },
    ),
    origin,
  );
}

async function hasValidProxyToken(request, env) {
  const token = cookieValue(request, PROXY_TOKEN_COOKIE);
  return Boolean(token && (await env.PROXY_TOKENS.get(`proxy-token:${token}`)));
}

async function refreshToken(env) {
  const midV = await generateMidV(
    env.MALL_KEY,
    env.MID,
    env.GID,
  );

  // generateMidV 已經進行 URI encode。
  // 不使用 URLSearchParams，避免百分比符號被再次編碼。
  const url = new URL(
    `${TOKEN_PATH}?mid_v=${midV}`,
    UPSTREAM_ORIGIN,
  );

  const tokenCurl = [
    "curl --http2 -i -X POST",
    shellQuote(url.toString()),
  ];

  for (const [name, value] of Object.entries(TOKEN_REQUEST_HEADERS)) {
    tokenCurl.push("-H", shellQuote(`${name}: ${value}`));
  }

  tokenCurl.push("--data", shellQuote("{}"));

  console.log("711 token upstream curl", tokenCurl.join(" "));

  const response = await fetch(url, {
    method: "POST",
    headers: TOKEN_REQUEST_HEADERS,
    body: "{}",
  });

  if (!response.ok) {
    throw new Error(
      `7-ELEVEN token request failed (${response.status})`,
    );
  }

  const payload = await response.json();

  if (
    typeof payload?.element !== "string" ||
    !payload.element
  ) {
    throw new Error(
      "7-ELEVEN token response did not contain an element token",
    );
  }

  return payload.element;
}

async function getToken(env) {
  const cache = caches.default;
  const cacheKey = new Request(TOKEN_CACHE_KEY);

  const cachedResponse = await cache.match(cacheKey);

  if (cachedResponse) {
    const cached = await cachedResponse
      .json()
      .catch(() => null);

    if (
      typeof cached?.token === "string" &&
      cached.token &&
      typeof cached?.expiresAt === "number" &&
      Date.now() < cached.expiresAt
    ) {
      console.log("711 token cache hit", {
        expiresAt: new Date(cached.expiresAt).toISOString(),
      });

      return cached.token;
    }

    await cache.delete(cacheKey);
  }

  // 已經有請求正在取得新 token 時，其他請求共用該 Promise。
  if (tokenRefreshPromise) {
    console.log("711 token refresh already in progress");
    return tokenRefreshPromise;
  }

  tokenRefreshPromise = (async () => {
    const token = await refreshToken(env);

    // 每次刷新時，隨機選擇 1～12 小時的快取時間。
    const ttlHours = randomTokenTtlHours();
    const ttlSeconds = ttlHours * 60 * 60;
    const expiresAt = Date.now() + ttlSeconds * 1000;

    const cacheResponse = Response.json(
      {
        token,
        expiresAt,
      },
      {
        headers: {
          "Cache-Control": `public, max-age=${ttlSeconds}`,
        },
      },
    );

    await cache.put(cacheKey, cacheResponse);

    console.log("711 token refreshed and cached", {
      ttlHours,
      expiresAt: new Date(expiresAt).toISOString(),
    });

    return token;
  })();

  try {
    return await tokenRefreshPromise;
  } finally {
    tokenRefreshPromise = null;
  }
}

async function forwardRequest(
  request,
  env,
  includeToken = false,
) {
  const incomingUrl = new URL(request.url);

  const upstreamUrl = new URL(
    incomingUrl.pathname + incomingUrl.search,
    UPSTREAM_ORIGIN,
  );

  if (includeToken) {
    // 忽略瀏覽器傳入的 token，由 Worker 統一管理。
    upstreamUrl.searchParams.set(
      "token",
      await getToken(env),
    );
  }

  const headers = new Headers(request.headers);

  headers.delete("Origin");
  headers.delete("Referer");
  headers.delete("Host");
  headers.delete("Content-Length");
  headers.delete("Cookie");

  await logRequestAsCurl(
    "711 proxy upstream curl",
    request,
    upstreamUrl.toString(),
    headers,
  );

  return fetch(upstreamUrl, {
    method: request.method,
    headers,
    body:
      request.method === "GET" ||
      request.method === "HEAD"
        ? undefined
        : request.body,
  });
}

export default {
  async fetch(request, env) {
    await logRequestAsCurl(
      "711 proxy received curl",
      request,
    );

    const origin = allowedOrigin(request);

    if (!origin) {
      return new Response("Forbidden origin", {
        status: 403,
      });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    if (!["GET", "POST"].includes(request.method)) {
      return responseWithCors(
        new Response("Use GET or POST", {
          status: 405,
        }),
        origin,
      );
    }

    const path = new URL(request.url).pathname;

    // A new Turnstile verification is also the refresh mechanism: it replaces
    // the existing short-lived cookie with a new ten-minute proxy token.
    if (path === PROXY_TOKEN_PATH) {
      if (request.method !== "GET") {
        return responseWithCors(
          new Response("Use GET", { status: 405 }),
          origin,
        );
      }

      return issueProxyToken(request, env, origin);
    }

    if (!configured(env)) {
      return responseWithCors(
        new Response(
          "MALL_KEY, MID, and GID secrets are required",
          {
            status: 500,
          },
        ),
        origin,
      );
    }

    if (!proxyTokenConfigured(env)) {
      return responseWithCors(
        new Response("Turnstile and PROXY_TOKENS bindings are required", {
          status: 500,
        }),
        origin,
      );
    }

    try {
      if (!(await hasValidProxyToken(request, env))) {
        return responseWithCors(
          new Response("Valid proxy token required", { status: 401 }),
          origin,
        );
      }

      // 保留原有 API 相容性，但不將 JWT 暴露給瀏覽器。
      if (path === TOKEN_PATH) {
        await getToken(env);

        return responseWithCors(
          Response.json({
            element: "worker-managed",
          }),
          origin,
        );
      }

      if (path.startsWith(LOVEFOOD_PREFIX)) {
        return responseWithCors(
          await forwardRequest(request, env, true),
          origin,
        );
      }

      if (path.startsWith(IMAP_PREFIX)) {
        return responseWithCors(
          await forwardRequest(request, env),
          origin,
        );
      }

      return responseWithCors(
        new Response(
          "Unsupported 7-ELEVEN API path",
          {
            status: 404,
          },
        ),
        origin,
      );
    } catch (error) {
      console.error("7-ELEVEN proxy failed", error);

      return responseWithCors(
        new Response(
          "7-ELEVEN service is temporarily unavailable",
          {
            status: 502,
          },
        ),
        origin,
      );
    }
  },
};
