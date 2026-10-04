const encoder = new TextEncoder();
const COOKIE_NAME = "portfolio_access";
const TOKEN_LIFETIME_SECONDS = 7 * 24 * 60 * 60;

function decodeBase64Url(input: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(Array.from(atob(input.replace(/-/g, "+").replace(/_/g, "/")), ch => ch.charCodeAt(0)));
}
function encodeBase64Url(input: Uint8Array): string {
  return btoa(String.fromCharCode(...input)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function equal(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}
async function hmacKey() {
  const secret = process.env.ACCESS_TOKEN_KEY;
  if (!secret || secret.length < 32) return null;
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
export async function checkPassword(password: string): Promise<boolean> {
  const salt = process.env.ACCESS_PASSWORD_SALT;
  const expected = process.env.ACCESS_PASSWORD_HASH;
  if (!salt || !expected || password.length > 256) return false;
  try {
    const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
    const derived = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: decodeBase64Url(salt), iterations: 150000, hash: "SHA-256" }, key, 256));
    return equal(derived, decodeBase64Url(expected));
  } catch { return false; }
}
export async function createAccessToken(): Promise<string | null> {
  const key = await hmacKey();
  if (!key) return null;
  const expires = String(Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(expires)));
  return `${expires}.${encodeBase64Url(signature)}`;
}
export async function verifyAccessToken(token?: string): Promise<boolean> {
  if (!token || token.length > 200 || !/^\d{10,11}\.[A-Za-z0-9_-]+$/.test(token)) return false;
  const [expires, encodedSignature] = token.split(".");
  if (Number(expires) <= Math.floor(Date.now() / 1000)) return false;
  try {
    const key = await hmacKey();
    if (!key) return false;
    return crypto.subtle.verify("HMAC", key, decodeBase64Url(encodedSignature), encoder.encode(expires));
  } catch { return false; }
}
export { COOKIE_NAME, TOKEN_LIFETIME_SECONDS };
