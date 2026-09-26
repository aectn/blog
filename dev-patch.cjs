// dev 启动补丁：吞掉 Windows 下 chokidar/readdirp 扫描到
// "System Volume Information"（系统还原目录）时抛出的 EINVAL。
// 该错误来自对本不该监视的盘根的竞态扫描，吞掉无副作用；
// 其他未捕获异常照常抛出。参考：当日诊断结论（2026-09-26）。
process.on("uncaughtException", (err) => {
	if (
		err &&
		err.code === "EINVAL" &&
		String(err.path || "").includes("System Volume Information")
	) {
		console.log("[dev-patch] 已吞掉盘根系统目录的 EINVAL 扫描错误（间歇性上游竞态，不影响使用）");
		return;
	}
	throw err;
});
