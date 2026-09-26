# PROJECT.md — 博客项目备忘录

> 这是博客的"项目交接文档"：记录网站结构、定制补丁、改动历史与待办。
> **开新对话/换 AI 时，先让 AI 读这个文件**，即可获得完整上下文。
> 最后更新：2026-09-26

## 一、项目概述

- **主题**：Mizuki v9.0（官方源 `github.com/LyraVoid/Mizuki`，通过 Download ZIP 获取，非 clone）
- **技术栈**：Astro 7.1.3（精确锁定）+ Tailwind 4 + Svelte 5 + Pagefind 搜索
- **包管理**：npm（"npm 化"路线，主题官方用 pnpm，改造细节见"定制补丁"）
- **部署**：GitHub 仓库 `aectn/blog`（main 分支）→ Cloudflare Workers Builds 检测 push 自动构建 → Workers Static Assets 纯静态托管（不耗请求配额）
- **域名**：`blog.aectn.top`（Worker Route + DNS 灰云/优选，大陆可达；workers.dev 域名大陆被墙属正常）
- **本地路径**：`E:\Code\blog`（⚠️ 勿移回 OneDrive 或中文路径，曾导致文件监视器崩溃，见踩坑 #3）

## 二、关键目录地图

| 路径 | 内容 |
|---|---|
| `src/config/` | **站点全部配置**（分文件）：`siteConfig.ts` 站名/URL/横幅文案、`profileConfig.ts` 头像/作者/社交链接、`musicConfig.ts` 音乐播放器、`navBarConfig.ts` 导航等 |
| `src/content/posts/` | **文章**。frontmatter：`title / published / description / tags / category / draft / pinned` |
| `src/content/spec/` | 特殊页面内容：`about.md` 关于页、`friends.md` 友链说明 |
| `src/data/` | **板块数据**（均已清空待填）：`anime.ts` 追番、`friends.ts` 友链、`diary.ts` 日记、`projects.ts` 项目、`skills.ts` 技能、`devices.ts` 设备、`timeline.ts` 时间线、`ai-tools.ts` AI工具 |
| `src/assets/images/` | 头像等图片（构建时自动压缩优化，jpg 可直接放） |
| `scripts/` | 主题自带构建链脚本：追番更新、样式检查、Pagefind 索引、字体检查 |
| `dev-patch.cjs` | ★ 我们的补丁：吞掉 Windows 盘根扫描 EINVAL 崩溃（见踩坑 #3） |
| `wrangler.toml` | CF Workers 部署配置。name=`blog`；纯静态红线：不写 `main=`、不加 `run_worker_first`、顶级字段在所有 `[块]` 之前 |

## 三、定制补丁清单（★ 主题更新时必须逐一保留或重做）

1. `package.json`：已删除 `"preinstall": "npx only-allow pnpm"`（npm 化的前提）
2. `package.json` dev script：改为 `node --require ./dev-patch.cjs node_modules/astro/bin/astro.mjs dev`
3. `astro.config.mjs` 第 14 行：`import { oddmisc } from "oddmisc/astro"`（oddmisc 1.2.11 起集成移到子路径）
4. `.npmrc`：`legacy-peer-deps=true`（主题自带，必须保持提交在仓库里）
5. `.gitignore`：已删除 `package-lock.json` 那一行（CF 构建机的 `npm ci` 必须有锁文件）
6. `dev-patch.cjs`：新增文件，勿删
7. `.env`：`ENABLE_CONTENT_SYNC=false`（主题自带，本地内容模式）

## 四、当前状态（2026-09-26：正式上线日）

- ✅ CF 构建全绿，`blog.aectn.top` 可访问
- ✅ 站名「aectn的博客」、URL `https://blog.aectn.top/`、语言 zh_CN、建站日 2026-09-26
- ✅ 作者 aectn，头像（工藤新一&小兰插画 → `src/assets/images/avatar.jpg`）
- ✅ 横幅文案：「慢煮光阴」+ 5 句（F 号·温柔松弛）
- ✅ 已清理：9 篇 demo 文章、追番/友链/日记/项目/技能/设备/时间线/AI工具数据、作者网易云歌单 ID、about 页英文介绍（换成待填骨架 + 指向 `aectn/blog` 的 GitHub 卡片）
- ✅ 第一篇文章 `posts/hello-world.md`（骨架已建，正文待填，已置顶）
- ⚠️ GitHub 有 Dependabot PR #1（想升级 astro 7.1.3→7.3.4）：PR 构建 红 × 是预期（主题按 7.1.3 锁定），**关闭不合并**
- 📌 站点统计口径：「最后活动」= 最新文章发布日距今天数，不是"最后碰网站"的时间

## 五、待办

- [ ] 填写 `hello-world.md` 正文、填写 `about.md`
- [ ] 音乐播放器：在 `musicConfig.ts` 填自己的网易云歌单 `id` 即恢复
- [ ] 清理相册页示例（albums/AcgExample、EncryptedExample 等构建日志可见）
- [ ] 处理 Dependabot PR #1（关闭）或加 `.github/dependabot.yml` 控制频率
- [ ] 可选：换横幅图、favicon、在 `siteConfig.ts` 的 `featurePages` 关掉暂不用的板块（关闭后记得同步删导航链接）

## 六、内容更新与多设备工作流

核心认知：**构建在 CF 云端，本地电脑不是必需品**——一切更新的本质都是"改文件 → push → 自动构建 → 2 分钟上线"。

| 方式 | 怎么用 | 适合 |
|---|---|---|
| **GitHub 手机 App / 网页在线编辑** | 仓库 → `src/content/posts/` → 铅笔图标 → 编辑 md → Commit changes | 手机随手写文章、改错字（纯 markdown） |
| **github.dev 浏览器编辑器** | 电脑浏览器打开仓库页面按 `.`（句号）键：完整 VS Code 界面 + Markdown 预览 | 换电脑/别人电脑临时更新，零安装 |
| **内容分离模式**（暂未启用） | `.env` 设 `ENABLE_CONTENT_SYNC=true` + `CONTENT_REPO_URL`，文章拆到独立私有仓库，dev/build 前自动同步 | 隐私层级更细、手机高频更新时再启用 |

⚠️ 分界线：**文章（纯 md）可在线编辑；`src/data/*.ts` 板块数据在线改有语法风险**（网页编辑器无 TS 校验），板块数据回本地 VS Code 改。

**新电脑完整迁移（5 分钟）**：

```powershell
# 1. 装环境：node 22+（nodejs.org）+ git（git-scm.com），各一次
# 2. 取回代码
git clone https://github.com/aectn/blog.git E:\Code\blog
cd E:\Code\blog
# 3. 重装依赖（锁文件保证版本一致）
npm install
# 4. 跑起来（PROJECT.md 供新环境/新 AI 读取上下文）
npm run dev
```

原则：**每次改动都 push，本地不留独占内容**，迁移就永远只是个 clone。

## 七、常用命令（日常 95% 只用这些）

```powershell
# 本地开发：启动后浏览器开 http://localhost:3000（注意端口是 3000，不是 4321）
npm run dev

# 完整构建验证：18 个页面 + Pagefind 索引 + 样式/字体检查；结尾输出 Complete! 为成功
npm run build

# 日常发布三连（小改动直接 main，不开 PR）
git add .                                   # 把改动放进暂存区
git commit -m "文章: 标题"                   # 拍快照，说明写"做了什么"
git push                                    # 推送 → CF 约 2 分钟自动上线

# 改了 package.json 的依赖之后必须做（重新生成锁文件，否则 CF 构建失同步报错）
npm install --package-lock-only --legacy-peer-deps

# 回滚线上：CF 控制台 → Worker → Deployments → 上一个正常版本 → 回滚（只影响线上，本地照常修）
```

## 八、踩坑实录（本项目实测）

1. **CF 构建命令默认为空**：Worker → 设置 → 构建 → 必须填 `npm run build`，否则构建报 `assets.directory does not exist`
2. **oddmisc 导出迁移**：1.2.11 起集成移到 `oddmisc/astro` 子路径，`astro.config.mjs` 的 import 已适配
3. **Windows 盘根扫描竞态**：dev 偶发 `EINVAL: lstat 'E:\System Volume Information'` 崩溃——`dev-patch.cjs` 已兜底吞掉；再遇重跑即可；项目勿放 OneDrive/中文路径
4. **astro-icon WARN**（`src/icons` 不存在）：无害警告，忽略
5. **About 页构建检查**：`check-global-style-loading.mjs` 要求 About 页含 GitHub 卡片——`about.md` 必须保留 `::github{repo="aectn/blog"}` 一行，删了构建失败
6. **GitHub 网页 "empty" 假象**：匿名访问有 CDN 缓存，验证推送是否成功用 API（`api.github.com/repos/aectn/blog/commits`）
7. **git push TLS 报错**（本机代理所致）：一次性 `git -c http.sslVerify=false push`，勿写入全局配置
8. **锁文件纪律**：改了 `package.json` 必须跑 `npm install --package-lock-only --legacy-peer-deps` 并提交锁文件

## 九、权威资料

- **搭建指南（唯一权威参考）**：`G:\Download\Astro博客搭建完全指南.md`
- **Mizuki 官方文档**：主题仓库 README（配置字段、frontmatter 语法、板块开关）
