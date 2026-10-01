import type { PioConfig } from "../types/config";

// Pio 看板娘配置
export const pioConfig: PioConfig = {
	enable: true, // 启用看板娘
	models: ["/pio/models/NOIR/noir.model3.json"], // 默认模型路径
	position: "left", // 模型位置
	width: 280, // 默认宽度
	height: 250, // 默认高度
	mode: "draggable", // 默认为可拖拽模式
	hiddenOnMobile: true, // 默认在移动设备上隐藏
	hideAboutMenu: false, // 隐藏内置 About 菜单按钮
	dialog: {
		welcome: ["欢迎来到 aectn 的小窝~", "要听歌吗？右下角有播放器哦"], // 欢迎词（数组会随机一句）
		touch: [
			"别摸我啦~",
			"再摸就要生气了！",
			"喂！你在干什么！",
			"手拿开，我可是会咬人的(｀・ω・´)",
		], // 触摸提示
		home: "点我回首页~", // 首页提示
		skin: ["想看我换身衣服吗？", "新衣服好看吗~"], // 换装提示
		close: "下次再见啦~", // 关闭提示
		link: "https://github.com/aectn/blog", // 关于链接（原指向主题作者仓库，已改为你的仓库）
		custom: [
			// 鼠标悬停在指定元素上时，看板娘会说的话
			{
				selector: ".music-fab",
				type: "read",
				text: "这是音乐控制台，点开听听歌吧~",
			},
		],
	},
	tips: {
		// 注意：一旦配置了 tips，上面 dialog.welcome 就会被忽略，
		// 所以欢迎语必须写在这里才会生效（否则会显示库的默认台词）
		welcomeMessage: [
			"欢迎来到 aectn 的小窝~",
			"要听歌吗？右下角有播放器哦",
		],
		messages: [
			// 定时弹出的随机台词
			"博客更新得挺勤快哦（大概）",
			"右下角有播放器，不听歌吗？",
			"可以拖着我在页面上到处跑~",
			"文章看完了？评论区欢迎留言",
			"晚上熬夜对身体不好哦",
		],
		duration: 8000, // 每条台词显示 8 秒
		interval: 90000, // 每 90 秒弹一条
	},
};
