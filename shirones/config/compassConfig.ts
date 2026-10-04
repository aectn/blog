import type { CompassConfig } from "@/types/compassConfig.ts";
import { withUserConfig } from "@/utils/config-overlay.ts";

export const compassConfig: CompassConfig = withUserConfig("compass", {
	enable: true,
	title: "网站收藏",
	description: "收藏的站点与好东西",
});
