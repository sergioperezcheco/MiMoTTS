# 🚀 Cloudflare Pages 部署指南

## 方式一：命令行部署（推荐）

### 1. 登录 Cloudflare

```bash
npx wrangler login
```

浏览器会打开 Cloudflare 授权页面，完成授权即可。

### 2. 设置环境变量

```bash
# 设置 API Key（使用 secret 存储，更安全）
echo "tp-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" | npx wrangler pages secret put MIMO_API_KEY --project-name mimotts

# 设置 API Base URL（可选，默认值已在代码中配置）
echo "https://token-plan-sgp.xiaomimimo.com/v1" | npx wrangler pages secret put MIMO_BASE_URL --project-name mimotts
```

### 3. 构建并部署

```bash
# 构建项目
npm run build

# 部署到 Cloudflare Pages
npx wrangler pages deploy dist --project-name mimotts --branch main
```

### 4. 一键部署脚本

```bash
# 运行部署脚本
./deploy.sh
```

---

## 方式二：GitHub 自动部署（推荐用于生产环境）

### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "feat: ready for deployment"
git push origin main
```

### 2. 连接 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Create**
3. 选择 **Pages** → **Connect to Git**
4. 选择你的 GitHub 仓库 `sergioperezcheco/MiMoTTS`

### 3. 配置构建设置

| 设置项 | 值 |
|--------|-----|
| **Framework preset** | Vite |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Node.js version** | 18+ |

### 4. 设置环境变量

在 **Settings** → **Environment variables** 中添加：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `MIMO_API_KEY` | `tp-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (你自己的 Key) | Production |
| `MIMO_BASE_URL` | `https://token-plan-sgp.xiaomimimo.com/v1` | Production |

### 5. 部署

点击 **Save and Deploy** 即可。

---

## 方式三：手动上传（快速测试）

### 1. 构建项目

```bash
npm run build
```

### 2. 上传到 Cloudflare

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Create** → **Pages**
3. 选择 **Upload assets**
4. 项目名称填写 `mimotts`
5. 上传 `dist` 目录中的所有文件
6. 在 **Settings** → **Environment variables** 中添加环境变量

---

## 🔧 环境变量说明

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `MIMO_API_KEY` | ✅ | - | MiMo 平台 API Key |
| `MIMO_BASE_URL` | ❌ | `https://token-plan-sgp.xiaomimimo.com/v1` | API 基础 URL |

---

## 🌐 访问地址

部署成功后，你的应用将可以通过以下地址访问：

- **生产环境**: https://mimotts.pages.dev
- **预览环境**: https://mimotts.pages.dev（每次 PR 会生成预览链接）

---

## 🔍 验证部署

### 1. 检查部署状态

```bash
npx wrangler pages deployment list --project-name mimotts
```

### 2. 查看日志

```bash
npx wrangler pages deployment tail --project-name mimotts
```

### 3. 测试 API

```bash
curl -X POST https://mimotts.pages.dev/api/tts \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mimo-v2.5-tts",
    "messages": [{"role": "assistant", "content": "你好"}],
    "audio": {"format": "wav", "voice": "mimo_default"}
  }'
```

---

## ❓ 常见问题

### Q: 部署失败怎么办？

A: 检查以下几点：
1. 确保已登录 `npx wrangler whoami`
2. 确保环境变量已设置
3. 检查网络连接
4. 查看错误日志

### Q: 如何更新部署？

A: 推送代码到 GitHub（自动部署）或重新运行部署脚本（命令行部署）。

### Q: 如何查看实时日志？

A: 运行 `npx wrangler pages deployment tail --project-name mimotts`

### Q: 如何回滚到之前的版本？

A: 在 Cloudflare Dashboard 中选择之前的部署版本，点击 **Rollback to this deployment**。

---

## 📚 相关文档

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [MiMo TTS 官方文档](https://platform.xiaomimimo.com/docs/zh-CN/usage-guide/speech-synthesis-v2.5)
