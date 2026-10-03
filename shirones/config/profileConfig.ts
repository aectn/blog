import type { ProfileConfig } from "@/types/config";
import { withUserConfig } from "@/utils/config-overlay.ts";

/**
 * 博主资料：头像 / 名称 / 简介 / 社交链接（侧栏 Profile 卡片、页脚、RSS 作者等消费）。
 * 类型见 src/types/config.ts。
 */
export const profileConfig: ProfileConfig = withUserConfig("profile", {
	avatar: "/images/avatar.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "aectn",
	bio: "喜欢折腾技术的中学生",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github", // Visit https://icones.js.org/ for icon codes
			url: "https://github.com/aectn",
		},
	],
});
