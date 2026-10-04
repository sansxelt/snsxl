import { randomBytes, pbkdf2Sync } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
const rl = createInterface({ input, output });
const password = await rl.question("Choose the password visitors will type: ");
rl.close();
if (!password || password.length > 256) { console.error("Choose a password with 1–256 characters."); process.exit(1); }
const salt = randomBytes(24);
const hash = pbkdf2Sync(password, salt, 150000, 32, "sha256");
const tokenKey = randomBytes(48);
console.log("\nCopy these three values into Vercel → Project Settings → Environment Variables for Production:\n");
console.log(`ACCESS_PASSWORD_SALT=${salt.toString("base64url")}`);
console.log(`ACCESS_PASSWORD_HASH=${hash.toString("base64url")}`);
console.log(`ACCESS_TOKEN_KEY=${tokenKey.toString("base64url")}`);
console.log("\nKeep the values private. Set them before deploying to Production.");
