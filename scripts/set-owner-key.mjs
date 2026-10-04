// Creates a random owner key for the /visits page, saves only its SHA-256 to Vercel (Production),
// and prints the private link. Run from this folder: node scripts/set-owner-key.mjs
import { createHash, randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";

const key = randomBytes(24).toString("base64url");
const hash = createHash("sha256").update(key).digest("hex");
try { execFileSync("vercel", ["env", "rm", "OWNER_KEY_SHA256", "production", "--yes", "--scope", "sansxel"], { stdio: "ignore", shell: true }); } catch {}
execFileSync("vercel", ["env", "add", "OWNER_KEY_SHA256", "production", "--sensitive", "--scope", "sansxel"], { input: hash, stdio: ["pipe", "ignore", "inherit"], shell: true });
console.log("Saved. Redeploying so the key takes effect...");
execFileSync("vercel", ["deploy", "--prod", "--yes", "--scope", "sansxel"], { stdio: "ignore", shell: true });
console.log("\nYour private visits link (bookmark it, don't share it):\n");
console.log(`https://snsxl.com/visits?key=${key}\n`);
