export type AIToolCategory =
	| "chat"
	| "coding"
	| "image"
	| "audio"
	| "video"
	| "writing"
	| "search"
	| "other";

export type AIToolFrequency =
	| "daily"
	| "weekly"
	| "occasional"
	| "experimental";

export type LocaleString = Partial<
	Record<"en" | "zh_CN" | "zh_TW" | "ja", string>
>;

export function getLocaleString(value: LocaleString, lang: string): string {
	return value[lang as keyof LocaleString] ?? value["en"] ?? "";
}

export interface AITool {
	id: string;
	name: string;
	description: LocaleString;
	icon: string;
	category: AIToolCategory;
	frequency: AIToolFrequency;
	url?: string;
	usage?: LocaleString;
	tags?: string[];
	color?: string;
}

// ===== 软件收藏夹数据 =====
// 用法：照下面的示例复制一整段 {...} 粘贴在数组里，改掉内容即可，最后一项后面不要逗号。
//
// 字段速查：
//   id         唯一标识，英文小写，随便起但不能重复
//   name       显示名称
//   description 一句话说明，写 { zh_CN: "..." }（可再加 en / ja）
//   icon       Iconify 图标名，软件品牌图标去 icon-sets.iconify.design 搜软件英文名，
//              多数能在 simple-icons 集合里找到（如 simple-icons:googlechrome）
//   category   分类，只能从这 8 个里选：
//              chat=AI 助手 / coding=开发编程 / image=图像设计 / audio=音频音乐
//              video=视频影音 / writing=写作笔记 / search=搜索查资料 / other=其他工具
//   frequency  常用程度：daily=每天用 / weekly=每周用 / occasional=偶尔用 / experimental=在尝鲜
//   url        点击卡片跳转的链接（不填就不跳转）
//   tags       标签，用于筛选，可省略
//   usage      使用场景说明，可省略
export const aiToolsData: AITool[] = [
	// ↓↓↓ 在这里添加你的软件，格式示例见上方注释 ↓↓↓
	// {
	//   id: "spotify",
	//   name: "Spotify",
	//   description: { zh_CN: "听歌" },
	//   icon: "simple-icons:spotify",
	//   category: "audio",
	//   frequency: "daily",
	//   url: "https://open.spotify.com/",
	//   tags: ["音乐"],
	// },
];
