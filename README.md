# 建材路 · 居民反馈专题

> 这是一个**完全跑在 Cloudflare 上**的居民反馈专题站：Workers（前端 + API）、D1（投稿/投票/修订历史）、R2（附件）、Turnstile（防刷）、Cloudflare Access（编辑端）。

## 一键部署到 Cloudflare

### 1. 准备资源

```bash
# 1) 登录
npx wrangler login

# 2) 建 D1 数据库
npx wrangler d1 create jiancai-road
# 复制返回的 database_id，填到 wrangler.jsonc 的 d1_databases[0].database_id

# 3) 建 R2 桶
npx wrangler r2 bucket create jiancai-road-media

# 4) Turnstile：Cloudflare Dashboard → Turnstile → Add widget
#    拿到 Site Key 和 Secret
```

### 2. 写入 Secret

```bash
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put VOTE_HMAC_SECRET          # 值用 openssl rand -hex 32 生成
npx wrangler secret put REVIEWER_EMAILS            # 允许访问 /review 的邮箱列表（逗号分隔）

# 普通 vars（非机密）已经写在 wrangler.jsonc：
#   NEXT_PUBLIC_TURNSTILE_SITEKEY = 你的 sitekey
#   MAX_UPLOAD_BYTES / MAX_FILE_COUNT / 各种 limit
```

### 3. 应用 D1 schema

```bash
# 一次性的 init（合并了两个 Drizzle 迁移）
npx wrangler d1 execute jiancai-road --remote --file=./drizzle/init.sql

# 之后用 Drizzle 维护
npx wrangler d1 migrations apply DB --remote
```

### 4. 接入自定义域名（可选）

在 Cloudflare DNS 里把域名解析到 Workers：

```bash
# 在 wrangler.jsonc 的 routes 段填上：
#   pattern: "jiancailu.example.com/*"
#   zone_name: "example.com"
npx wrangler deploy
```

不填 routes 就会落到默认的 `<name>.<your-subdomain>.workers.dev`。

### 5. 配置 Cloudflare Access（保护 /review）

Dashboard → Access → Applications → Add Application:
- **Application name**: 建材路 · 编辑
- **Domain**: `jiancailu.example.com/review`
- **Session Duration**: 24h
- **Policy**: Allow `Emails ending in @your-org.com` 或 `Emails: [editor1@x.com, editor2@y.com]`
- **Application settings**: turn on **Enforce**, set **Identity providers** = One-time PIN

Cloudflare Access 会在边缘网关注入 `Cf-Access-Jwt-Assertion` 与 `Cf-Access-Authenticated-User-Email`，`lib/access.ts` 已自动从 header 中读取 email 并与 `REVIEWER_EMAILS` 白名单比对。

### 6. GitHub Actions 自动部署（推荐）

仓库 Settings → Secrets 添加：
- `CLOUDFLARE_API_TOKEN`（在 Cloudflare Dashboard → My Profile → API Tokens → Create Token → Edit Cloudflare Workers 模板）
- `CLOUDFLARE_ACCOUNT_ID`（Workers 页面右上角）

之后 PR → merge 到 main → 自动 build + 远程迁移 + 部署。

`.github/workflows/deploy.yml` 已就位。

---

## 本地开发

```bash
cp .env.example .dev.vars           # 写入本地 secret
env -u NODE_OPTIONS npm install     # 环境 broker 拦截，要去掉 NODE_OPTIONS
env -u NODE_OPTIONS npm run dev     # vite + wrangler dev，含 D1/R2 模拟
```

> 浏览器看到 `<meta name="turnstile-sitekey">` 为空时，Turnstile 小组件不会渲染，对应的 API 走本地 `verifyTurnstile` 短路（dev 仅在 TURNSTILE_SECRET 缺失时放行）—— 配置好 .dev.vars 后才会真正校验。

## 数据模型

| 表 | 字段 | 用途 |
|---|---|---|
| `materials` | id, title, content, location, event_date, created_at, updated_at, editor_id, files, file_count, status, consent, revisions | 居民提交的现场材料；consent=1 且 status=published 才会公开展示 |
| `votes` | phone_hash (HMAC), choice, created_at | 匿名投票，手机号只存加盐摘要 |
| `vote_limits` | key, count | 按 IP+小时桶的限流 |
| `material_replies` | id, material_id, source, department, content, files, created_at, created_by | 部门答复追踪 |
| `material_revisions` | id, material_id, editor_id, editor_label, field, before, after, created_at | 每次编辑都写一行审计日志 |

## 路由

| Path | Method | 作用 |
|---|---|---|
| `/` | GET | 公开主页 |
| `/review` | GET | 编辑审核（Access + REVIEWER_EMAILS 白名单） |
| `/api/materials` | GET / POST | 居民投稿列表 / 提交（POST 含 Turnstile + R2 附件上传 + D1 写入） |
| `/api/evidence` | GET | 证据墙列表（已发布材料，含分页） |
| `/api/media` | GET | R2 附件代理（带范围请求、Content-Type、nosniff） |
| `/api/review` | GET / POST | 编辑查看 / 修改状态 + 写修订历史 |
| `/api/votes` | GET / POST | 投票统计 / 投票提交（Turnstile + 手机号 HMAC） |

## 安全要点

- **跨站提交**：`crossSite(request)` 同时校验 `sec-fetch-site` 和 `origin`，与同源不符直接 403。
- **附件上传**：size 限 20MB，数量限 5 个，扩展名白名单 + size 累积检查 + 边读边 cancel。
- **手机号**：仅保留 HMAC-SHA256 摘要 + pepper，不存原文；限流（每 IP 每小时 ≤12 次）+ 每手机号一票。
- **编辑端**：Cloudflare Access 边缘鉴权 + Worker 端邮箱白名单双重把关；每次修改写修订表。
- **附件下载**：非 published/consent≠1 的文件直接 404；reviewer 才能预览待审核附件。

## 目录结构

```
.
├── worker/index.ts             # Cloudflare Worker 入口（vinext 适配 + 图像优化）
├── app/                        # 页面与 API 路由（vinext 风格）
│   ├── api/materials/route.ts
│   ├── api/evidence/route.ts
│   ├── api/media/route.ts
│   ├── api/review/route.ts
│   ├── api/votes/route.ts
│   ├── page.tsx
│   ├── participation.tsx
│   ├── review/page.tsx
│   ├── TurnstileWidget.tsx
│   └── layout.tsx
├── lib/
│   ├── access.ts               # Cloudflare Access JWT 解析
│   ├── turnstile.ts            # Turnstile 服务端校验
│   ├── review.ts               # 兼容层
│   └── survey.ts               # 手机号规范化 + HMAC
├── db/
│   ├── schema.ts               # Drizzle schema
│   ├── index.ts                # cloudflare:workers DB
│   └── raw.ts                  # D1 raw driver
├── drizzle/                    # 迁移文件 + init.sql
├── wrangler.jsonc              # Worker 配置（已生成）
└── .github/workflows/deploy.yml
```