export const PAGE_SIZE = 8;

export const LIGHT_MODE = "light",
	DARK_MODE = "dark";
export const AUTO_MODE = "auto"; // 跟随系统深浅色（本项目补丁新增，主题原版无此模式）
export const DEFAULT_THEME = AUTO_MODE; // 原值 LIGHT_MODE（强制浅色）；改为默认跟随系统

// Banner height unit: vh
export const BANNER_HEIGHT = 35;
export const BANNER_HEIGHT_FULLSCREEN = 100;
export const BANNER_HEIGHT_EXTEND = 30;
export const BANNER_HEIGHT_HOME = BANNER_HEIGHT + BANNER_HEIGHT_EXTEND;

// The height the main panel overlaps the banner, unit: rem
export const MAIN_PANEL_OVERLAPS_BANNER_HEIGHT = 3.5;

// Page width: rem
export const PAGE_WIDTH = 90;

// Category constants
export const UNCATEGORIZED = "uncategorized";

// Wallpaper mode constants
export const WALLPAPER_BANNER = "banner";
export const WALLPAPER_FULLSCREEN = "fullscreen";
export const WALLPAPER_OVERLAY = "overlay";
export const WALLPAPER_NONE = "none";
