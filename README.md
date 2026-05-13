<div align="center">

# 🎙️ MiMo TTS Playground

**基于小米 MiMo-V2.5-TTS 的语音合成在线体验平台**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare)](https://pages.cloudflare.com)

[English](#english) | [中文](#中文)

</div>

---

## 📖 简介

MiMo TTS Playground 是一个基于小米 **MiMo-V2.5-TTS** 系列模型的 Web 语音合成应用，支持多种语音生成模式，包括内置音色、声音设计和声音克隆。

> 📚 **官方文档**: [小米 MiMo 开放平台 - 语音合成](https://platform.xiaomimimo.com/docs/zh-CN/usage-guide/speech-synthesis-v2.5)

## ✨ 核心特性

### 🎯 三种语音合成模式

| 模型 | 说明 | 特点 |
|------|------|------|
| `mimo-v2.5-tts` | **内置音色** | 9种高质量音色，支持风格控制、方言、唱歌 |
| `mimo-v2.5-tts-voicedesign` | **声音设计** | 通过文字描述自定义音色，无需音频样本 |
| `mimo-v2.5-tts-voiceclone` | **声音克隆** | 上传音频样本，精准复刻目标音色 |

### 🎨 丰富的音色选择

**中文音色:**
- 🍬 冰糖 - 温柔女声
- 🌸 茉莉 - 甜美女声
- 🥤 苏打 - 活力男声
- 🌳 白桦 - 磁性男声

**英文音色:**
- 👩 Mia - Female
- 👩 Chloe - Female
- 👨 Milo - Male
- 👨 Dean - Male

### 🎭 风格预设

支持多种语音风格预设：
- 😊 开心活泼 - 欢快语调
- 🤫 温柔低语 - 轻声细语
- 📰 新闻播报 - 专业播音
- 📖 讲故事 - 生动叙述
- 🗣️ 东北话 / 四川话 / 粤语 - 方言支持
- 🎤 唱歌 - 音乐模式

### 🏷️ 音频标签

内置音色模式支持插入音频标签，实现更丰富的情感表达：

```
[叹气] [深吸一口气] [笑] [大笑] [哭泣] [紧张] [声音颤抖] [停顿]
```

## 🚀 快速开始

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

> 💡 **获取 API Key**: 访问 [小米 MiMo 开放平台](https://platform.xiaomimimo.com) 注册并获取

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 即可体验

## ☁️ 部署到 Cloudflare Pages

### 方式一：通过 GitHub 自动部署

1. **Fork 或克隆仓库**

```bash
git clone https://github.com/sergioperezcheco/MiMoTTS.git
cd MiMoTTS
```

2. **连接 Cloudflare Pages**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 **Workers & Pages** → **Create** → **Pages**
   - 选择 **Connect to Git**，连接你的 GitHub 仓库

3. **配置构建设置**
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

4. **设置环境变量** (Settings → Environment variables)
   - `MIMO_API_KEY` — 你的 MiMo API Key
   - `MIMO_BASE_URL` — API 端点 (默认: `https://token-plan-sgp.xiaomimimo.com/v1`)

5. **点击 Save and Deploy**

### 方式二：通过 GitHub Actions 自动部署（推荐）

项目已配置 GitHub Actions，推送到 `main` 分支后会自动部署到 Cloudflare Pages。

**配置步骤：**

1. **获取 Cloudflare API Token**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 **My Profile** → **API Tokens**
   - 点击 **Create Token**，选择 **Edit Cloudflare Workers** 模板
   - 复制生成的 API Token

2. **获取 Account ID**
   - 在 Cloudflare Dashboard 右侧可以看到 **Account ID**
   - 或者运行 `npx wrangler whoami` 查看

3. **设置 GitHub Secrets**
   - 进入你的 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
   - 添加以下 Secrets：
     - `CLOUDFLARE_API_TOKEN` — 你的 Cloudflare API Token
     - `CLOUDFLARE_ACCOUNT_ID` — 你的 Account ID

4. **设置环境变量**
   - 在 Cloudflare Dashboard 中设置 `MIMO_API_KEY` 环境变量

5. **推送代码**
   ```bash
   git push origin main
   ```
   GitHub Actions 会自动构建并部署到 Cloudflare Pages

**查看部署状态：**
- GitHub 仓库 → **Actions** 标签页
- Cloudflare Dashboard → **Workers & Pages** → **mimotts**

### 方式三：通过 CLI 部署

```bash
# 设置密钥
npx wrangler pages secret put MIMO_API_KEY

# 部署
npx wrangler pages deploy dist
```

## 🏗️ 技术架构

```
┌─────────────────┐     POST /api/tts     ┌─────────────────────────┐
│     浏览器       │ ────────────────────► │  Cloudflare Pages       │
│   (React App)   │                        │  Function (Edge)        │
└─────────────────┘                        └─────────────────────────┘
                                                    │
                                                    ▼
                                           ┌─────────────────────────┐
                                           │    MiMo TTS API         │
                                           │  (token-plan-sgp...)    │
                                           └─────────────────────────┘
```

**架构优势:**
- 🔒 **API Key 安全** — 服务端注入，永不暴露给客户端
- 🌐 **无 CORS 问题** — 代理运行在同一域名
- 💰 **零成本** — Cloudflare Workers 免费额度 (10万请求/天)

## 📁 项目结构

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
│       └── tts.ts       # Cloudflare Pages Function
├── .env.example         # 环境变量示例
├── .gitignore           # Git 忽略规则
├── .dockerignore        # Docker 忽略规则
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript 配置
├── vite.config.ts       # Vite 配置
└── wrangler.toml        # Cloudflare 配置
```

## 🔧 环境变量

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `MIMO_API_KEY` | ✅ | - | MiMo 平台 API Key |
| `MIMO_BASE_URL` | ❌ | `https://token-plan-sgp.xiaomimimo.com/v1` | API 基础 URL |

## 🛠️ 技术栈

- **前端框架**: React 19 + TypeScript 6.0
- **构建工具**: Vite 8
- **边缘运行时**: Cloudflare Pages Functions
- **样式**: CSS Variables + 响应式设计

## 📝 使用示例

### 基础语音合成

```typescript
import { generateTTS } from './api';

const response = await generateTTS({
  model: 'mimo-v2.5-tts',
  text: '你好，欢迎使用小米 MiMo 语音合成服务',
  voice: '冰糖',
  audioFormat: 'wav'
});
```

### 声音设计

```typescript
const response = await generateTTS({
  model: 'mimo-v2.5-tts-voicedesign',
  text: '这是一段测试文本',
  voiceDesignPrompt: 'A young woman in her mid-20s, warm and gentle voice',
  audioFormat: 'wav',
  optimizeTextPreview: true
});
```

### 声音克隆

```typescript
const response = await generateTTS({
  model: 'mimo-v2.5-tts-voiceclone',
  text: '这是克隆的声音',
  voice: 'data:audio/wav;base64,...', // 音频样本的 Base64
  audioFormat: 'wav'
});
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

## 🙏 致谢

- [小米 MiMo 开放平台](https://platform.xiaomimimo.com) — 提供强大的 TTS API
- [Cloudflare Pages](https://pages.cloudflare.com) — 提供免费的边缘部署平台

## 🔗 相关链接

- 📚 [MiMo TTS 官方文档](https://platform.xiaomimimo.com/docs/zh-CN/usage-guide/speech-synthesis-v2.5)
- 🌐 [MiMo 开放平台](https://platform.xiaomimimo.com)
- 💻 [GitHub 仓库](https://github.com/sergioperezcheco/MiMoTTS)

---

<div align="center">

**用 ❤️ 构建 | Powered by Xiaomi MiMo-V2.5-TTS**

</div>
