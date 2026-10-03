import { createCipheriv, createHash, pbkdf2Sync, randomBytes } from "node:crypto";

// 共享加密常量 — 客户端 PasswordProtection.astro 中的内联脚本必须保持同步
export const CRYPTO_CONSTANTS = {
	PBKDF2_ITERATIONS: 310000,
	SALT_LENGTH: 16,
	IV_LENGTH: 12,
	AUTH_TAG_LENGTH: 16,
	KEY_LENGTH: 32,
	VERIFY_PREFIX: "MIZUKI-VERIFY:", // 验证前缀：正确解密后内容以此开头
	VERSION: 3, // 密文协议版本：改算法时 +1，旧密文靠版本号区分
} as const;

/**
 * 把文本压成固定的 32 字节密钥材料（SHA-256）。
 *
 * ★ 这条必须与客户端 PasswordProtection.astro 的 toKeyMaterial() 完全一致：
 *   构建端 PBKDF2 吃的是「密码的 SHA-256」，不是密码原文 —— 否则两边
 *   算出来的 AES key 根本不是同一个，密文能加密但永远解不开。
 *   客户端同样要先把「密码 / 会话令牌」压成 32 字节再喂给 PBKDF2。
 */
function toKeyMaterial(text: string): Buffer {
	return createHash("sha256").update(text, "utf8").digest();
}

/**
 * 加密 HTML 内容
 *
 * 协议 v3（2026-10-03 加固）：
 *   - salt / iv 改成**真随机**（v2 是从密码 HMAC 派生的，等于把密钥材料混进 salt，
 *     严格说不算 salt）。随机 salt 公开存在密文里，既不泄露密码，
 *     又保证「同一密码 + 同一内容」每次构建的密文都不同。
 *   - PBKDF2 迭代 100000 → 310000。密文是公开的，攻击者能离线爆破；
 *     迭代次数就是唯一能拉高他成本的旋钮（OWASP 对 PBKDF2-HMAC-SHA256
 *     的建议是 600000，再高浏览器端每次解锁会卡住）。
 *   - 密文头部加 1 字节版本号，以后换算法不用硬滚兼容。
 *
 * 输出格式：base64(version[1] + salt[16] + iv[12] + authTag[16] + ciphertext)
 * 其中 ciphertext = AES-256-GCM-encrypt("MIZUKI-VERIFY:" + html)
 */
export function encryptContent(
	html: string,
	password: string,
	_slug: string, // slug 不再参与 salt 派生，保留形参只为兼容老调用
): string {
	const {
		PBKDF2_ITERATIONS,
		SALT_LENGTH,
		IV_LENGTH,
		KEY_LENGTH,
		VERIFY_PREFIX,
		VERSION,
	} = CRYPTO_CONSTANTS;

	const plaintext = VERIFY_PREFIX + html;

	const salt = randomBytes(SALT_LENGTH);
	const iv = randomBytes(IV_LENGTH);
	const key = pbkdf2Sync(
		toKeyMaterial(password),
		salt,
		PBKDF2_ITERATIONS,
		KEY_LENGTH,
		"sha256",
	);

	const cipher = createCipheriv("aes-256-gcm", key, iv);
	const encrypted = Buffer.concat([
		cipher.update(plaintext, "utf8"),
		cipher.final(),
	]);
	const authTag = cipher.getAuthTag();

	return Buffer.concat([
		Buffer.from([VERSION]),
		salt,
		iv,
		authTag,
		encrypted,
	]).toString("base64");
}
