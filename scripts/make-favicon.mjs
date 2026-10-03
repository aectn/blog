/**
 * 用头像原图生成站点图标。
 * 输出：
 *   public/favicon/favicon.ico   （内含 16/32/48/64/128/256 多尺寸，浏览器标签页主用）
 *   public/favicon/favicon-<n>.png（32/128/180/192，高清场景与添加到主屏幕备用）
 * 用法：node scripts/make-favicon.mjs [头像路径]
 */
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = process.argv[2] || resolve(root, "public/images/avatar.jpg");
const outDir = resolve(root, "public/favicon");
mkdirSync(outDir, { recursive: true });

// ICO 内只放浏览器实际会用到的小尺寸，避免文件过大（256 交给独立 PNG）。
const ICO_SIZES = [16, 24, 32, 48, 64, 128];
const PNG_SIZES = [32, 128, 180, 192, 256];

/** 把头像裁成正方形并输出 PNG buffer（小尺寸启用调色板以压缩体积） */
async function render(size) {
	return sharp(src)
		.resize(size, size, { fit: "cover", position: "centre" })
		.png({ compressionLevel: 9, palette: size <= 64, quality: 90 })
		.toBuffer();
}

/**
 * 组装 ICO 文件。每个条目内嵌 PNG 字节（Vista 起标准支持）。
 * ICONDIR 6 字节 + 每条目 16 字节目录项 + 图像数据。
 */
function buildIco(entries) {
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0); // reserved
	header.writeUInt16LE(1, 2); // type: 1 = icon
	header.writeUInt16LE(entries.length, 4);

	let offset = 6 + 16 * entries.length;
	const dirs = entries.map(({ size, buf }) => {
		const d = Buffer.alloc(16);
		d.writeUInt8(size >= 256 ? 0 : size, 0); // 256 用 0 表示
		d.writeUInt8(size >= 256 ? 0 : size, 1);
		d.writeUInt8(0, 2); // colorCount
		d.writeUInt8(0, 3); // reserved
		d.writeUInt16LE(1, 4); // planes
		d.writeUInt16LE(32, 6); // bitCount
		d.writeUInt32LE(buf.length, 8);
		d.writeUInt32LE(offset, 12);
		offset += buf.length;
		return d;
	});

	return Buffer.concat([header, ...dirs, ...entries.map((e) => e.buf)]);
}

const meta = await sharp(src).metadata();
console.log(`源图: ${meta.format} ${meta.width}x${meta.height}`);

const icoEntries = [];
for (const size of ICO_SIZES) {
	icoEntries.push({ size, buf: await render(size) });
}
const ico = buildIco(icoEntries);
writeFileSync(resolve(outDir, "favicon.ico"), ico);
console.log(`已生成 favicon.ico (${(ico.length / 1024).toFixed(1)} KB, ${ICO_SIZES.join("/")})`);

for (const size of PNG_SIZES) {
	const buf = await render(size);
	const name = `favicon-${size}.png`;
	writeFileSync(resolve(outDir, name), buf);
	console.log(`已生成 ${name} (${(buf.length / 1024).toFixed(1)} KB)`);
}
