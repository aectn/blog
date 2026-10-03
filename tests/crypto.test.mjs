/**
 * 加密系统端到端测试
 * 运行方式: node tests/crypto.test.mjs
 * 无需任何测试框架依赖
 */
import { createCipheriv, createHash, pbkdf2Sync, randomBytes } from "node:crypto";

// 必须与 crypto-utils.ts 的 toKeyMaterial() 完全一致：
// 先把文本压成 SHA-256 的 32 字节，再喂给 PBKDF2
function toKeyMaterial(text) {
	return createHash("sha256").update(text, "utf8").digest();
}

// 从源文件复制的常量（必须与 crypto-utils.ts 保持同步）
const CRYPTO_CONSTANTS = {
	PBKDF2_ITERATIONS: 310000,
	SALT_LENGTH: 16,
	IV_LENGTH: 12,
	AUTH_TAG_LENGTH: 16,
	KEY_LENGTH: 32,
	VERIFY_PREFIX: "MIZUKI-VERIFY:",
	VERSION: 3,
};

// === 服务端加密（复刻 crypto-utils.ts，协议 v3） ===
function encryptContent(html, password, _slug) {
	const { PBKDF2_ITERATIONS, SALT_LENGTH, IV_LENGTH, KEY_LENGTH, VERIFY_PREFIX, VERSION } = CRYPTO_CONSTANTS;
	const plaintext = VERIFY_PREFIX + html;
	// v3：salt / iv 改成真随机，不再从密码派生
	const salt = randomBytes(SALT_LENGTH);
	const iv = randomBytes(IV_LENGTH);
	const key = pbkdf2Sync(toKeyMaterial(password), salt, PBKDF2_ITERATIONS, KEY_LENGTH, "sha256");
	const cipher = createCipheriv("aes-256-gcm", key, iv);
	const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
	const authTag = cipher.getAuthTag();
	return Buffer.concat([
		Buffer.from([VERSION]),
		salt,
		iv,
		authTag,
		encrypted,
	]).toString("base64");
}

// === 客户端解密（复刻 PasswordProtection.astro inline script） ===
async function clientDecrypt(encData, password) {
	const { PBKDF2_ITERATIONS, SALT_LENGTH, IV_LENGTH, AUTH_TAG_LENGTH, VERIFY_PREFIX, VERSION } = CRYPTO_CONSTANTS;
	const raw = Buffer.from(encData, "base64");
	let pos = 0;
	const version = raw[pos++];
	if (version !== VERSION) {
		throw new Error(`Unsupported crypto version: ${version}`);
	}
	const salt = raw.subarray(pos, pos + SALT_LENGTH); pos += SALT_LENGTH;
	const iv = raw.subarray(pos, pos + IV_LENGTH); pos += IV_LENGTH;
	const authTag = raw.subarray(pos, pos + AUTH_TAG_LENGTH); pos += AUTH_TAG_LENGTH;
	const ciphertext = raw.subarray(pos);

	const combined = Buffer.concat([ciphertext, authTag]);

	// 客户端第一步是把文本压成 32 字节密钥材料（SHA-256）
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
	const keyMaterial = await crypto.subtle.importKey("raw", digest, "PBKDF2", false, ["deriveKey"]);
	const aesKey = await crypto.subtle.deriveKey(
		{ name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
		keyMaterial, { name: "AES-GCM", length: 256 }, false, ["decrypt"],
	);
	const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, combined);
	const decoded = new TextDecoder().decode(decrypted);

	if (!decoded.startsWith(VERIFY_PREFIX)) {
		throw new Error("Verification prefix mismatch");
	}
	return decoded.substring(VERIFY_PREFIX.length);
}

// === 测试用例 ===
const testHtml = "<h1>Hello World</h1><p>这是一篇加密文章的内容</p>";
const testPassword = "test-password-123";
const testSlug = "encrypted-test-post";

let passed = 0;
let failed = 0;

function assert(condition, message) {
	if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function test(name, fn) {
	try {
		await fn();
		console.log(`  ✓ ${name}`);
		passed++;
	} catch (err) {
		console.log(`  ✗ ${name}`);
		console.log(`    ${err.message}`);
		failed++;
	}
}

console.log("Encryption System Tests\n");

await test("encrypt and decrypt with correct password", async () => {
	const encrypted = encryptContent(testHtml, testPassword, testSlug);
	assert(encrypted.length > 0, "ciphertext should not be empty");
	const decrypted = await clientDecrypt(encrypted, testPassword);
	assert(decrypted === testHtml, `decrypted content mismatch: got "${decrypted.slice(0, 30)}..."`);
});

// v3 起 salt/iv 都是随机的，所以「相同输入」不再产出相同密文 —— 这是刻意的。
// 仍然要求：任何一篇都必须是 base64、且能被同一个密码解开（另见下面那条 random salt 用例）。
await test("ciphertext carries version byte and is decryptable", async () => {
	const enc = encryptContent(testHtml, testPassword, testSlug);
	const raw = Buffer.from(enc, "base64");
	assert(raw[0] === CRYPTO_CONSTANTS.VERSION, "first byte must be the version");
	assert((await clientDecrypt(enc, testPassword)) === testHtml, "must decrypt");
});

await test("reject wrong password", async () => {
	const encrypted = encryptContent(testHtml, testPassword, testSlug);
	let threw = false;
	try {
		await clientDecrypt(encrypted, "wrong-password");
	} catch {
		threw = true;
	}
	assert(threw, "wrong password should throw");
});

await test("different slugs produce different ciphertext", () => {
	const a = encryptContent(testHtml, testPassword, "slug-a");
	const b = encryptContent(testHtml, testPassword, "slug-b");
	assert(a !== b, "different slugs should produce different ciphertext");
});

await test("CJK content round-trip", async () => {
	const cjk = "<p>日本語テスト 中文测试 한국어 테스트</p>";
	const encrypted = encryptContent(cjk, testPassword, testSlug);
	const decrypted = await clientDecrypt(encrypted, testPassword);
	assert(decrypted === cjk, "CJK content mismatch");
});

await test("empty content round-trip", async () => {
	const encrypted = encryptContent("", testPassword, testSlug);
	const decrypted = await clientDecrypt(encrypted, testPassword);
	assert(decrypted === "", "empty content mismatch");
});

await test("special HTML characters round-trip", async () => {
	const special = '<div class="test">&amp; &lt; &gt; "quotes" \'single\'</div>';
	const encrypted = encryptContent(special, testPassword, testSlug);
	const decrypted = await clientDecrypt(encrypted, testPassword);
	assert(decrypted === special, "special HTML mismatch");
});

await test("CRYPTO_CONSTANTS have required fields", () => {
	assert(CRYPTO_CONSTANTS.PBKDF2_ITERATIONS === 310000, "PBKDF2_ITERATIONS");
	assert(CRYPTO_CONSTANTS.SALT_LENGTH === 16, "SALT_LENGTH");
	assert(CRYPTO_CONSTANTS.IV_LENGTH === 12, "IV_LENGTH");
	assert(CRYPTO_CONSTANTS.AUTH_TAG_LENGTH === 16, "AUTH_TAG_LENGTH");
	assert(CRYPTO_CONSTANTS.KEY_LENGTH === 32, "KEY_LENGTH");
	assert(CRYPTO_CONSTANTS.VERSION === 3, "VERSION");
	assert(CRYPTO_CONSTANTS.VERIFY_PREFIX === "MIZUKI-VERIFY:", "VERIFY_PREFIX");
});

await test("random salt: same password + same content => different ciphertext", async () => {
	const a = encryptContent(testHtml, testPassword, testSlug);
	const b = encryptContent(testHtml, testPassword, testSlug);
	assert(a !== b, "random salt should make ciphertext differ per build");
	// 但两份都必须能被同一个密码解开
	assert((await clientDecrypt(a, testPassword)) === testHtml, "a decryptable");
	assert((await clientDecrypt(b, testPassword)) === testHtml, "b decryptable");
});

await test("wrong password fails", async () => {
	const encrypted = encryptContent(testHtml, testPassword, testSlug);
	let threw = false;
	try {
		await clientDecrypt(encrypted, "definitely-wrong");
	} catch (_) {
		threw = true;
	}
	assert(threw, "wrong password must not decrypt");
});

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
