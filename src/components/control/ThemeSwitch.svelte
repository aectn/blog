<script lang="ts">
import { AUTO_MODE, DARK_MODE, DEFAULT_THEME, LIGHT_MODE } from "@constants/constants";
import Icon from "@iconify/svelte";
import { getStoredTheme, resolveTheme, setTheme } from "@utils/setting-utils";
import { onMount } from "svelte";

import type { LIGHT_DARK_MODE } from "@/types/config.ts";

// 三态循环：浅色 → 深色 → 跟随系统（auto）
const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE, AUTO_MODE];
let mode: LIGHT_DARK_MODE = $state(DEFAULT_THEME);
let isChanging = false;

onMount(() => {
	mode = getStoredTheme();

	// 监听 Swup 的内容替换事件，确保在页面切换后同步主题状态
	const handleContentReplace = () => {
		// Swup 切换页面时会套用服务端渲染的 html 属性（其中不含 dark class），
		// 导致切到新页面瞬间退回浅色。这里同步恢复主题：
		// resolveTheme 会把 "auto" 解析成系统当前实际的 light/dark，
		// 直接改 class 而不走过渡动画，避免出现浅色闪烁。
		const resolved = resolveTheme(getStoredTheme());
		const shouldBeDark = resolved === DARK_MODE;
		document.documentElement.classList.toggle("dark", shouldBeDark);
		document.documentElement.setAttribute(
			"data-theme",
			shouldBeDark ? "github-dark" : "github-light",
		);

		requestAnimationFrame(() => {
			const newMode = getStoredTheme();
			if (mode !== newMode) {
				mode = newMode;
			}
		});
	};

	let swupHooked = false;

	const setupSwupHook = () => {
		if (!swupHooked && window.swup?.hooks) {
			window.swup.hooks.on("content:replace", handleContentReplace);
			swupHooked = true;
		}
	};

	if (window.swup?.hooks) {
		setupSwupHook();
	} else {
		document.addEventListener("swup:enable", setupSwupHook, { once: true });
	}

	return () => {
		if (window.swup?.hooks && swupHooked) {
			window.swup.hooks.off("content:replace", handleContentReplace);
		}
		document.removeEventListener("swup:enable", setupSwupHook);
	};
});

function switchScheme(newMode: LIGHT_DARK_MODE) {
	// 防止连续快速点击
	if (isChanging) {
		return;
	}

	isChanging = true;
	mode = newMode;
	setTheme(newMode);

	// 50ms 后重置状态，防止过快切换
	setTimeout(() => {
		isChanging = false;
	}, 50);
}

function toggleScheme() {
	if (isChanging) {
		return;
	}

	let i = 0;
	for (; i < seq.length; i++) {
		if (seq[i] === mode) {
			break;
		}
	}
	switchScheme(seq[(i + 1) % seq.length]);
}
</script>

<button
	aria-label="切换主题模式（浅色 / 深色 / 跟随系统）"
	title="当前：跟随系统"
	class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90 theme-switch-btn z-50"
	id="scheme-switch"
	onclick={toggleScheme}
	data-mode={mode}
>
	<div
		class="absolute transition-all duration-300 ease-in-out"
		class:opacity-0={mode !== LIGHT_MODE}
		class:rotate-180={mode !== LIGHT_MODE}
	>
		<Icon
			icon="material-symbols:wb-sunny-outline-rounded"
			class="text-[1.25rem]"
		></Icon>
	</div>
	<div
		class="absolute transition-all duration-300 ease-in-out"
		class:opacity-0={mode !== DARK_MODE}
		class:rotate-180={mode !== DARK_MODE}
	>
		<Icon
			icon="material-symbols:dark-mode-outline-rounded"
			class="text-[1.25rem]"
		></Icon>
	</div>
	<div
		class="absolute transition-all duration-300 ease-in-out"
		class:opacity-0={mode !== AUTO_MODE}
		class:rotate-180={mode !== AUTO_MODE}
	>
		<Icon
			icon="material-symbols:computer-outline-rounded"
			class="text-[1.25rem]"
		></Icon>
	</div>
</button>

<style>
	/* 确保主题切换按钮的背景色即时更新 */
	.theme-switch-btn::before {
		transition:
			transform 75ms ease-out,
			background-color 0ms !important;
	}
</style>
