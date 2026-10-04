/**
 * 站点罗盘数据（本地数据源）。
 * 用途：src/pages/compass.astro → organisms/CompassSection → molecules/CompassTile。
 * 添加站点：往对应 Shelf.entries 追加一项；数组顺序即展示顺序。
 * - icon：Iconify 名（material-symbols:xxx）或图片 URL（http(s)/绝对路径）；
 *   省略时瓷砖显示 label 首字母 tonal 块（不自动抓取 favicon）。
 * - image：用户自定义图片 URL（http(s)/绝对路径），优先于 icon 渲染；
 *   加载失败自动降级为首字母块。
 */

/** 单条站点记录 */
export interface CompassEntry {
	/** 站点名（瓷砖标题） */
	label: string;
	/** 外链地址 */
	href: string;
	/** 一句话说明（瓷砖副行；省略则显示域名） */
	note?: string;
	/** 图标：Iconify 名或图片 URL；省略 = 首字母兜底 */
	icon?: string;
	/** 用户自定义图片（http(s)/绝对路径）：优先于 icon 渲染；省略则走 icon/首字母 */
	image?: string;
}

/** 分组（Shelf = 罗盘上的收纳格） */
export interface CompassShelf {
	/** 锚点 id（字母数字，作分组定位与跳转） */
	key: string;
	/** 分组名 */
	name: string;
	/** 分组图标（Iconify 名，SectionTitle 行首） */
	icon?: string;
	/** 分组副文案（标题下弱文本，可选） */
	blurb?: string;
	entries: CompassEntry[];
}

export const compassData: CompassShelf[] = [
	{
		key: "daily",
		name: "日常常逛",
		icon: "material-symbols:public-rounded",
		entries: [
			{
				label: "哔哩哔哩",
				href: "https://www.bilibili.com",
				note: "视频与教程",
				icon: "ri:bilibili-line",
			},
			{
				label: "GitHub",
				href: "https://github.com",
				note: "开源项目",
				icon: "fa6-brands:github",
			},
		],
	},
	{
		key: "learn",
		name: "学习文档",
		icon: "material-symbols:school-outline-rounded",
		entries: [
			{
				label: "MDN",
				href: "https://developer.mozilla.org/zh-CN/",
				note: "Web 开发文档",
				icon: "material-symbols:menu-book-outline-rounded",
			},
			{
				label: "Astro 文档",
				href: "https://docs.astro.build/zh-cn/getting-started/",
				note: "博客框架官方文档",
				icon: "material-symbols:rocket-launch-outline-rounded",
			},
		],
	},
	// 加分组：复制一个 { key, name, entries } 块改内容即可；数组顺序即页面展示顺序。
];
