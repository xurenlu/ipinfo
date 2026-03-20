# IP Info Service

一个基于 Cloudflare Workers 的轻量级 IP 信息查询服务，**对 AI 和 LLM 友好** 🤖

## 功能特性

- 🌍 返回访问者的 IPv4 地址
- 🌐 返回访问者的 IPv6 地址（如果适用）
- 🏳️ 返回访问者的国家代码（ISO 3166-1 Alpha-2）
- 📍 返回 Cloudflare 边缘节点信息
- 🔢 返回 ASN（自治系统号）
- 🕐 返回时区信息
- 🤖 **AI 友好**：提供 LLMs.txt 和 LLM.txt 索引文件
- 🎨 精美的 Web 首页，自动显示访问者信息

## AI 友好特性

本项目专为 AI 和 LLM（大语言模型）优化：

- `/llms.txt` - 遵循 [LLMs.txt 标准](https://llmstxt.org/) 的完整索引
- `/llm.txt` - 兼容格式的 LLM 索引
- `/robots.txt` - 允许 AI 爬虫访问索引文件
- `/` - 首页包含完整的使用说明和示例

这些文件让 AI 助手（如 Claude、ChatGPT 等）能够：
- 自动理解你的 API 用途
- 生成正确的使用示例代码
- 提供准确的集成指导

## 路由说明

| 路由 | 说明 | 内容类型 |
|------|------|----------|
| `GET /` | Web 首页 / JSON API | HTML / JSON* |
| `GET /robots.txt` | 搜索引擎爬虫规则 | text/plain |
| `GET /llms.txt` | LLM 索引文件 | text/plain |
| `GET /llm.txt` | LLM 索引文件（兼容） | text/plain |

*根据 `Accept` 头自动返回 JSON 或 HTML

## API 使用

### 请求

```bash
curl https://ip-info-service.your-subdomain.workers.dev
```

### JavaScript

```javascript
const response = await fetch('https://ip-info-service.your-subdomain.workers.dev/');
const data = await response.json();
console.log(data.country); // "CN"
console.log(data.ipv4);    // "203.0.113.1"
```

### Python

```python
import requests
response = requests.get('https://ip-info-service.your-subdomain.workers.dev/')
data = response.json()
print(data['country'])  # "CN"
print(data['ipv4'])     # "203.0.113.1"
```

### 响应示例

```json
{
  "ipv4": "203.0.113.1",
  "ipv6": "",
  "country": "CN",
  "colo": "HKG",
  "asn": "13335",
  "timezone": "Asia/Shanghai",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 响应字段说明

| 字段 | 说明 |
|------|------|
| `ipv4` | 访问者的 IPv4 地址 |
| `ipv6` | 访问者的 IPv6 地址 |
| `country` | ISO 3166-1 Alpha-2 国家代码 |
| `colo` | Cloudflare 边缘节点代码 |
| `asn` | 自治系统号 |
| `timezone` | 访问者的时区 |
| `timestamp` | 请求时间戳（ISO 8601） |

## 本地开发

### 前置要求

- Node.js 18+
- Yarn

### 安装依赖

```bash
yarn install
```

### 本地测试

```bash
yarn wrangler dev
```

访问 http://localhost:8787 测试。

## 部署

### 首次部署

1. 登录 Cloudflare：

```bash
yarn wrangler login
```

2. 部署 Worker：

```bash
yarn wrangler deploy
```

### 更新部署

```bash
yarn wrangler deploy
```

## 配置

编辑 `wrangler.toml` 文件来自定义配置：

- `name`: Worker 名称
- `main`: 入口文件路径
- `compatibility_date`: 兼容性日期

## 项目结构

```
cloudflare-ip-worker/
├── src/
│   └── index.js          # Worker 主代码
├── public/               # 静态文件（备份）
│   ├── robots.txt
│   ├── llms.txt
│   └── llm.txt
├── wrangler.toml         # Cloudflare 配置
├── package.json          # 项目依赖
└── README.md             # 本文件
```

## 许可证

MIT
