# Code Slim 内存审计报告（v0.1.3-slim，实测数据）

> 结论先行：**保持 VS Code 功能形态（编辑器/搜索/高亮/git/markdown 预览/可装 GitLens）的前提下，
> 空载内存地板为 ~300MB，200MB 不可达。** 本文档记录完整的逐进程内存去向、每项削减实验的
> 实测结果，以及三条进一步降内存路线的确切代价，供随时切换。

## 一、内存地图（空载暖机，任务管理器"专用工作集"口径）

合计 **301MB / 8 进程**（提交内存口径 495MB；任务管理器看到的是前者）。

| 进程 | 为什么存在 | 私有WS (MB) | 备注 |
|---|---|---|---|
| renderer | workbench UI + Monaco。CDP 实测 JS 堆仅 42.6，其余 ~68 为 Blink/DOM/渲染缓存 | 110 | 随打开文件数与大小增长（编辑器 buffer 无硬顶） |
| main | Electron 主进程（窗口/IPC/原生服务） | 50 | 地板 |
| ext-host | 扩展宿主（git 扩展、可装第三方扩展）。空载 JS 堆仅 19MB，大头是 node 运行时+模块 | 44 | 地板 |
| shared | 服务枢纽：扩展管理/扫描/画廊、存储、设置同步栈、本地 git 服务（sharedProcessMain.ts） | 31 | 只能靠砍功能 |
| watcher | parcel 文件监视。默认 `files.watcherExclude '**'` 已不监视任何文件 | 22 | 进程仍拉起，-2.3MB 已拿 |
| gpu | 软件渲染（WARP d3d11） | 20 | `--in-process-gpu` 实测净省 0 |
| proxy_resolver | Chromium 代理解析（系统代理自动检测） | 15 | 仅 `--no-proxy-server` 可消 |
| network | Chromium 网络服务 | 8 | 地板 |

无 crashpad-handler（未调用 crashReporter.start）；无 pty-host（开终端才出现）。

**约 145MB 是 7 个子进程的"进程税"**：每个 Chromium utility / node 进程起手 8-20MB 运行时开销，
与装了什么无关。并进程两条路已实测：`--in-process-gpu` 净省 0；`--single-process` 启动即崩。

## 二、削减实验全记录

| 实验 | 实测结果 | 决定 |
|---|---|---|
| `files.watcherExclude '**': true` | watcher 只从 24.0→21.7（-2.3MB），事件处理归零 | ✅ 已采纳（v0.1.3 默认） |
| `--max-semi-space-size=8` | 稳态无差异；**浏览负载峰值 608→570MB（-40）** | ✅ 已采纳 |
| `--in-process-gpu` | gpu 进程消失但工作并入 main，总内存净省 ≈0 | ❌ 回滚 |
| `--enable-low-end-device-mode` | **+14MB** | ❌ 回滚 |
| `--single-process` | 启动即崩（Chromium 初始化 fatal） | ❌ 不可用 |
| ext host 堆 cap 128MB | 空载 JS 堆 19MB，160 上限远未触顶，收益 0 | ❌ 无意义 |
| 跳过 workspace watch 请求 | watcher 进程仍被拉起（扩展宿主的 watch 请求也养着它） | ❌ 记录为理论项 |
| 删除全部 LSP（v0.1.1） | tsserver/语言服务进程归零，浏览 TS 仓库内存不再失控（1.36GB→450MB 级） | ✅ 已采纳 |

测量工具：`scripts/slim-memory-measure.ps1`（任务管理器可比口径）+ 逐进程审计脚本
（PEB 读 `VSCODE_ESM_ENTRYPOINT` 区分 node 子进程角色）。

## 三、三条进一步降内存路线（未实施，确切代价如下）

### 路线 1：接受 ~300MB 地板（当前状态，v0.1.3-slim 即最终版）
保留全部功能。空载 301MB（波动 302-316），浏览 4 个大 TS 文件稳定 ~450MB、峰值 ~570MB。

### 路线 2：功能级三砍 → 约 265-285MB
- `src/main.ts` 加 `app.commandLine.appendSwitch('no-proxy-server')`：-14MB，
  **代价：系统代理自动检测失效**（国内网络下 Open VSX 商店可能无法直连，需代理的用户慎用）
- watcher 彻底 no-op（把扩展宿主的 fs watch 请求也短路）：约 -20MB，
  **代价：git SCM 不自动刷新、依赖文件事件的扩展失效**
- 砍 shared 进程：约 -30MB，**代价：无法安装扩展（GitLens 装不了）、设置同步栈消失**，
  需改 `src/vs/code/electron-utility/sharedProcess/sharedProcessMain.ts` 与主进程接线，属产品手术
- 三项全做约 240-265MB，**仍不到 200**。

### 路线 3：纯 Monaco Web 编辑器形态 → 可达 ~200MB 以下
放弃 Electron 多进程工作台：无文件树、无全局搜索、无 git、无 markdown 预览。
等于换产品，不在本 fork 演进范围内。

## 四、发布物

- v0.1.3-slim：https://github.com/zelixir/vscode/releases/tag/v0.1.3-slim
  （code-slim-1.139.0-win32-x64.zip 225.6MB / linux-x64.tar.gz 196.4MB）
- 版本演进：v0.1.0 ~590MB 空载 → v0.1.2 ~310MB（删全部 LSP/AI/调试/notebook/远程/同步）
  → v0.1.3 **301MB**（watcher 关闭 + V8 nursery 收窄，负载峰值 -40MB）
