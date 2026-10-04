/**
 * 工具箱数据（结构与站点罗盘完全一致，复用同一套分组瓷砖渲染：
 * 搜索过滤 / 分组筛选 / stagger 入场都是现成的）。
 * 页面：src/pages/tools.astro；导航：navBarConfig.ts 的 Tools 项。
 *
 * 添加工具：往对应分组 entries 追加一项即可，数组顺序即展示顺序。
 * - label：瓷砖标题；note：副行说明（省略则显示域名）
 * - icon：Iconify 名（https://icones.js.org 查名，如 material-symbols:xxx / fa6-brands:xxx）
 *   或图片 URL；省略时显示首字母色块
 * - href：大部分工具直接填外链（https://...）；
 *   安装/使用复杂的工具：先在 shirones/content/posts/ 写一篇 Markdown 文档，
 *   再把该瓷砖的 href 指向文章地址（如 "/posts/tool-xxx/"），点瓷砖即打开文档。
 */
import type { CompassShelf } from "shirones/src/data/compass";

export const toolsData: CompassShelf[] = [
	{
		key: "dev",
		name: "开发工具",
		icon: "material-symbols:terminal-rounded",
		blurb: "写代码与调试常用",
		entries: [
			{
				label: "GitHub",
				href: "https://github.com",
				note: "代码托管",
				icon: "fa6-brands:github",
			},
			{
				label: "Cloudflare",
				href: "https://dash.cloudflare.com",
				note: "域名与 Workers 控制台",
				icon: "material-symbols:cloud-outline-rounded",
			},
		],
	},
	{
		key: "online",
		name: "在线工具",
		icon: "material-symbols:web-traffic-rounded",
		blurb: "打开浏览器就能用",
		entries: [
			{
				label: "Cloudflare 优选",
				href: "https://ip.164746.xyz",
				note: "Workers 优选 IP",
				icon: "material-symbols:speed-outline-rounded",
			},
			// 示例条目：替换或删除。复杂工具的文档式写法：
			// {
			// 	label: "某某工具安装指南",
			// 	href: "/posts/tool-xxx/",   ← 指向 posts 里对应 Markdown 文章
			// 	note: "安装与配置文档",
			// 	icon: "material-symbols:description-outline-rounded",
			// },
		],
	},
];
