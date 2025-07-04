# 📺 CCTV M3U8 视频批量下载与解密工具

本项目用于批量下载（tv.cctv.com）提供的 `.m3u8` 视频资源，并对下载后的 TS 视频进行解密与合并处理，最终输出为高清、无花屏的 MP4 文件。

支持手动下载单个视频或通过列表批量下载，已集成 m3u8 下载器和 JS 解密工具。

---

## 🧾 项目功能

- ✅ 支持读取 `list.txt`，批量下载多个 m3u8 视频
- ✅ 支持手动输入 m3u8 地址并下载
- ✅ 自动识别并解密视频花屏问题（720p 分辨率支持良好）
- ✅ 自动生成输出文件并保存为可播放视频
- ✅ 集成优秀的下载与解密工具

---

## 📁 目录结构

| 文件/目录             | 说明 |
|----------------------|------|
| `tmp/`               | 临时下载目录（保存原始 TS 分片） |
| `tmp_out/`           | 最终输出目录（合并并解密后的完整视频） |
| `config.txt`         | 下载器配置文件（可选） |
| `list.txt`           | 用户自定义任务列表，每行格式为：`m3u8_url\|文件名` |
| `down_auto.ps1`      | 自动批量下载脚本，读取 `list.txt` 执行任务 |
| `down_input.ps1`     | 手动下载脚本，输入 m3u8 地址后自动下载并解密 |
| `ffmpeg.exe`         | 视频合并工具（将 TS 合并为 MP4） |
| `N_m3u8DL-CLI.exe`   | m3u8 下载工具核心程序 |
| `N_m3u8DL-CLI-SimpleG.exe` | 可视化简化版（可选） |
| `run.js`             | 手动执行的 TS 解密合并脚本 |
| `run_auto.js`        | 自动调用的解密脚本（由 PowerShell 脚本调用） |
| `ts_decrypt.js`      | TS 分片的解密逻辑 |
| `h5.worker_patch.js` | 补丁脚本（用于支持某些特殊加密格式） |
| `README.md`          | 本说明文档 |

---

## 🛠️ 环境依赖

1. ✅ Windows 系统
2. ✅ PowerShell 可用（无需额外安装）
3. ✅ 已安装 [Node.js](https://nodejs.org)（建议 v16+，用于解密脚本）
4. ✅ 项目自带 `ffmpeg.exe`（无需另装）

---

## 🚀 使用说明

### 🔁 方式一：批量下载

1. 打开 `list.txt`，每行添加一个任务，格式如下：

    ```
    https://example.com/video/main.m3u8|视频标题1
    https://example.com/another/main.m3u8|视频标题2
    ```

2. 执行批量下载脚本：

    ```
    右键 down_auto.ps1 → 以 PowerShell 运行
    ```

3. 下载 + 解密完成后，输出文件保存在 `tmp_out/` 目录中。

---

### 🧑‍💻 方式二：手动下载单个 m3u8

1. 运行脚本：

    ```
    down_input.ps1
    ```

2. 根据提示输入 m3u8 地址和输出文件名，即可下载并解密。

---

## 📹 视频质量说明

央视网目前能找到的 m3u8 链接最高分辨率为 **1280x720（720p）**。

---

## 🔐 解密说明

央视视频一般采用 AES 加密的 TS 分片格式，项目中已内置完整解密逻辑，能自动完成去花屏和合并输出。

---

## 📚 技术参考

- 🎥 m3u8 下载器：  
  [https://github.com/nilaoda/N_m3u8DL-CLI](https://github.com/nilaoda/N_m3u8DL-CLI)

- 🔓 解密脚本参考：  
  B站视频 BV1dsTBzNE9B  
  [https://www.bilibili.com/video/BV1dsTBzNE9B](https://www.bilibili.com/video/BV1dsTBzNE9B)

- 🎬 合并工具：  
  [https://ffmpeg.org/](https://ffmpeg.org/)

- 🌐 m3u8 抓取工具建议：  
  使用浏览器插件“猫抓”或参考我的另一个项目 `cctv_m3u8_urlget`

---

## 💡 常见问题

**Q: 为什么运行后只下载一个 m3u8？**

A: 请确保你的 m3u8 地址是真实播放地址（通常包含 `main.m3u8`），而非跳转页。建议使用“猫抓”或浏览器 DevTools 获取真实 URL。

**Q: 下载后视频花屏 / 播放失败？**

A: 视频为加密的 TS 格式，请确认你已安装 Node.js 并解密脚本可正常运行。

---

## ⚠️ 版权与免责声明
本项目仅用于技术学习与研究目的，所有视频资源版权均归 原网站所有（如央视网）。

本项目未提供任何视频资源，也不鼓励用于商业用途或非法传播。

若您为版权方并认为本项目涉及侵权，请联系我删除相关内容。

---

## 📩 联系与反馈

如有问题或建议，欢迎提 Issue、Fork 项目或评论反馈。

---

