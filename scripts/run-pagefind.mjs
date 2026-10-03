// 构建后补跑 Pagefind 搜索索引。
// 原因：主题自带的 Pagefind 集成在 Windows 上会 panic（output/mod.rs 写索引失败），
// 但索引二进制本身能正常工作，所以这里在 astro build 之后手动跑一次。
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const SITE_DIR = "dist";
const OUT_DIR = "dist/pagefind";

function findPagefindBin(dir, depth = 0) {
	if (depth > 4 || !existsSync(dir)) return null;
	for (const entry of readdirSync(dir)) {
		const full = path.join(dir, entry);
		let st;
		try {
			st = statSync(full);
		} catch {
			continue;
		}
		if (st.isDirectory()) {
			const hit = findPagefindBin(full, depth + 1);
			if (hit) return hit;
		} else if (/^pagefind.*(\.exe)?$/i.test(entry)) {
			return full;
		}
	}
	return null;
}

const bin =
	findPagefindBin(path.join("node_modules", ".pnpm")) ??
	findPagefindBin(path.join("node_modules", "pagefind"));

if (!bin) {
	console.error("[pagefind] 未找到可执行文件，跳过索引生成（搜索将不可用）");
	process.exit(0);
}

console.log(`[pagefind] 使用: ${bin}`);
const result = spawnSync(bin, ["--site", SITE_DIR, "--output-path", OUT_DIR], {
	stdio: "inherit",
	shell: process.platform === "win32",
});

if (result.status !== 0) {
	console.error(`[pagefind] 索引生成失败，退出码 ${result.status}`);
	process.exit(result.status ?? 1);
}
console.log("[pagefind] 索引已生成");
