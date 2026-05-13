<div align="center">

# MiMo TTS Playground

**基于小米 MiMo-V2.5-TTS 的语音合成在线体验平台**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare)](https://pages.cloudflare.com)

[中文](#简介) | [English](README_en.md)

</div>

---

## 简介

MiMo TTS Playground 是一个基于小米 **MiMo-V2.5-TTS** 系列模型的 Web 语音合成应用，支持多种语音生成模式，包括内置音色、声音设计和声音克隆。

> **官方文档**: [小米 MiMo 开放平台 - 语音合成](https://platform.xiaomimimo.com/docs/zh-CN/usage-guide/speech-synthesis-v2.5)

## 核心特性

### 三种语音合成模式

| 模型 | 说明 | 特点 |
|------|------|------|
| `mimo-v2.5-tts` | **内置音色** | 9种高质量音色，支持风格控制、方言、唱歌 |
| `mimo-v2.5-tts-voicedesign` | **声音设计** | 通过文字描述自定义音色，无需音频样本 |
| `mimo-v2.5-tts-voiceclone` | **声音克隆** | 上传音频样本（WAV/MP3，最大 10MB），精准复刻目标音色 |

### 音色选择（9种）

**中文音色:**
- 冰糖 — 温柔女声
- 茉莉 — 甜美女声
- 苏打 — 活力男声
- 白桦 — 磁性男声

**英文音色:**
- Mia — Female
- Chloe — Female
- Milo — Male
- Dean — Male

**默认音色:**
- MiMo — 自动检测语言

### 导演模式（Director Mode）

内置音色支持结构化的导演控制，通过三个维度精确调控语音表现：

- **角色（Role）** — 说话人身份设定
- **场景（Scene）** — 情境与氛围描述
- **指导（Direction）** — 具体的演绎指令

也可以使用自然语言风格预设：开心活泼、温柔低语、新闻播报、讲故事、东北话、四川话、粤语、唱歌模式等。

### 音频标签

**全局风格标签** — 插入在文本开头，用圆括号 `(tag)` 包裹，支持 40+ 种标签，涵盖情感、语调、方言、唱歌等维度。

**行内效果标签** — 插入在文本中间，用方括号 `[tag]` 包裹，支持 28+ 种标签：

```
[叹气] [深吸一口气] [笑] [大笑] [哭泣] [紧张] [声音颤抖] [停顿] [咳嗽] [清嗓子]
```

### 声音设计预设

声音设计模式提供 9 种预设模板，快速生成不同风格的音色：

温柔女声、磁性男声、ASMR 耳语、播客主播、电影旁白、有声读物、新闻播报、儿童故事、说唱风格。

### 音频输出

支持 **WAV** 和 **PCM16**（24kHz 单声道）两种格式，PCM16 在客户端自动转换为 WAV 进行播放。

### 其他功能

- 生成历史记录（最多 20 条，存储在 localStorage）
- 自动播放、音频下载
- 拖拽上传音频文件（声音克隆模式）
- 深色/浅色主题切换
- 字符计数器

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/sergioperezcheco/MiMoTTS.git
cd MiMoTTS
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 API Key：

```env
MIMO_API_KEY=your_api_key_here
MIMO_BASE_URL=https://token-plan-sgp.xiaomimimo.com/v1
```

> 获取 API Key: 访问 [小米 MiMo 开放平台](https://platform.xiaomimimo.com) 注册并获取

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 即可体验。

## 部署到 Cloudflare Pages

### 方式一：GitHub 自动部署

1. Fork 或克隆仓库
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create** > **Pages** > **Connect to Git**
3. 构建设置：
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 在 **Settings** > **Environment variables** 中添加环境变量：
   - `MIMO_API_KEY` — 你的 MiMo API Key
   - `MIMO_BASE_URL` — API 端点（默认: `https://token-plan-sgp.xiaomimimo.com/v1`）
5. 点击 **Save and Deploy**

### 方式二：GitHub Actions（推荐用于生产环境）

项目已配置 GitHub Actions，推送到 `main` 分支后自动部署。

1. 在 Cloudflare Dashboard **My Profile** > **API Tokens** 创建 Token（选择 "Edit Cloudflare Workers" 模板）
2. 在 Cloudflare Dashboard 侧栏找到 Account ID
3. 在 GitHub 仓库 **Settings** > **Secrets and variables** > **Actions** 中添加：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
4. 在 Cloudflare Dashboard 设置 `MIMO_API_KEY` 环境变量
5. 推送代码：
   ```bash
   git push origin main
   ```

### 方式三：CLI 部署

```bash
npx wrangler pages secret put MIMO_API_KEY
npx wrangler pages deploy dist
```

## Docker 部署

### 使用 Docker Compose（推荐）

确保 `.env` 文件已配置 API Key，然后：

```bash
docker compose up --build -d
```

访问 http://localhost:3000 即可。

停止容器：

```bash
docker compose down
```

### 使用 Docker 命令

```bash
# 构建镜像
docker build -t mimotts .

# 运行容器
docker run -d -p 3000:3000 -e MIMO_API_KEY=your_api_key mimotts
```

> Docker 部署使用内置的 Node.js 轻量服务器（`server.mjs`）替代 Cloudflare Pages Functions，功能完全一致。

## 技术架构

```
浏览器 (React App)  ──POST /api/tts──>  Cloudflare Pages Function (Edge)
                                                    │
                                                    ▼
                                           MiMo TTS API
                                           (chat/completions)
```

- **API Key 安全** — 服务端注入，永不暴露给客户端
- **无 CORS 问题** — 代理运行在同一域名
- **零成本** — Cloudflare Workers 免费额度（10万请求/天）

## 项目结构

```
MiMoTTS/
├── public/              # 静态资源
├── src/
│   ├── api.ts           # TTS API 客户端
│   ├── App.tsx          # 主应用组件
│   ├── App.css          # 应用样式
│   ├── main.tsx         # 入口文件
│   └── index.css        # 全局样式
├── functions/
│   └── api/
│       └── tts.ts       # Cloudflare Pages Function（代理 MiMo API）
├── .env.example         # 环境变量示例
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript 配置
├── server.mjs           # Docker 部署用 Node.js 服务器
├── vite.config.ts       # Vite 配置（含 dev 代理）
├── Dockerfile           # Docker 镜像构建文件
├── docker-compose.yml   # Docker Compose 配置
└── wrangler.toml        # Cloudflare 配置
```

## 环境变量

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `MIMO_API_KEY` | 是 | — | MiMo 平台 API Key |
| `MIMO_BASE_URL` | 否 | `https://token-plan-sgp.xiaomimimo.com/v1` | API 基础 URL |
| `PORT` | 否 | `3000` | Docker 部署时的服务端口 |

## 技术栈

- **前端**: React 19 + TypeScript 6.0
- **构建工具**: Vite 8
- **边缘运行时**: Cloudflare Pages Functions
- **样式**: CSS Variables + 响应式设计

## 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目基于 [MIT License](LICENSE) 开源。

## 致谢

- [小米 MiMo 开放平台](https://platform.xiaomimimo.com) — TTS API 提供方
- [Cloudflare Pages](https://pages.cloudflare.com) — 边缘部署平台

## 相关链接

- [MiMo TTS 官方文档](https://platform.xiaomimimo.com/docs/zh-CN/usage-guide/speech-synthesis-v2.5)
- [MiMo 开放平台](https://platform.xiaomimimo.com)
- [GitHub 仓库](https://github.com/sergioperezcheco/MiMoTTS)

---

<div align="center">

**用 ❤️ 构建 | Powered by Xiaomi MiMo-V2.5-TTS**

</div>
