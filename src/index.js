/**
 * Cloudflare Worker - IP Info Service
 * 返回访问者的 IP 地址和国家信息
 * 支持 AI 友好的路由：/robots.txt, /llms.txt, /llm.txt
 */

// 静态文件内容
const STATIC_FILES = {
  '/robots.txt': `# robots.txt - IP Info Service

User-agent: *
Allow: /

# 允许 AI 爬虫访问 LLM 索引文件
Allow: /llms.txt
Allow: /llm.txt

Sitemap: https://ip-info-service.your-subdomain.workers.dev/sitemap.xml
`,
  '/llms.txt': `# IP Info Service - LLMs Index
# 本文件遵循 LLMs.txt 标准 (https://llmstxt.org/)

# 项目描述
Title: IP Info Service
Description: 一个基于 Cloudflare Workers 的轻量级 IP 信息查询服务，返回访问者的 IP 地址、国家代码、时区等信息。
Version: 1.0.0
License: MIT
Language: zh-CN
Tags: ip, geolocation, cloudflare, api, rest

# API 端点
- GET / - 返回 JSON 格式的 IP 信息
- GET /robots.txt - 搜索引擎爬虫规则
- GET /llms.txt - LLM 索引文件（本文件）
- GET /llm.txt - LLM 索引文件（兼容）

## 快速使用

### curl
\`\`\`bash
curl https://ip-info-service.your-subdomain.workers.dev/
\`\`\`

### JavaScript
\`\`\`javascript
const response = await fetch('https://ip-info-service.your-subdomain.workers.dev/');
const data = await response.json();
console.log(data.country); // 国家代码，如 "CN"
console.log(data.ipv4);    // IPv4 地址
\`\`\`

### Python
\`\`\`python
import requests
response = requests.get('https://ip-info-service.your-subdomain.workers.dev/')
data = response.json()
print(data['country'])  # 国家代码
\`\`\`

## 响应格式
\`\`\`json
{
  "ipv4": "203.0.113.1",
  "ipv6": "",
  "country": "CN",
  "colo": "HKG",
  "asn": "13335",
  "timezone": "Asia/Shanghai",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
\`\`\`

## 特性
- ⚡ 全球边缘部署，低延迟
- 🔒 支持 CORS，可从任何域名调用
- 🌍 自动识别国家代码
- 💡 对 AI 和 LLM 友好
`,
  '/llm.txt': `# IP Info Service - LLM Index (兼容格式)
# 与 llms.txt 相同的内容，用于兼容不同的 LLM 索引标准

# 项目描述
Title: IP Info Service
Description: 一个基于 Cloudflare Workers 的轻量级 IP 信息查询服务，返回访问者的 IP 地址、国家代码、时区等信息。
Version: 1.0.0
License: MIT
Language: zh-CN
Tags: ip, geolocation, cloudflare, api, rest

# API 端点
- GET / - 返回 JSON 格式的 IP 信息
- GET /robots.txt - 搜索引擎爬虫规则
- GET /llms.txt - LLM 索引文件
- GET /llm.txt - LLM 索引文件（本文件）

## 快速使用
\`\`\`bash
curl https://ip-info-service.your-subdomain.workers.dev/
\`\`\`

## 特性
- ⚡ 全球边缘部署，低延迟
- 🔒 支持 CORS，可从任何域名调用
- 🌍 自动识别国家代码
- 💡 对 AI 和 LLM 友好
`,
};

// 首页 HTML
const HOME_PAGE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IP Info Service</title>
  <meta name="description" content="一个基于 Cloudflare Workers 的轻量级 IP 信息查询服务">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 600px;
      width: 100%;
      padding: 40px;
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 28px;
    }
    .subtitle {
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .info-box {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .info-item:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #666;
      font-weight: 500;
    }
    .info-value {
      color: #333;
      font-family: 'Monaco', 'Courier New', monospace;
      font-weight: 600;
    }
    .api-section {
      margin-top: 30px;
    }
    .api-title {
      font-size: 18px;
      color: #333;
      margin-bottom: 15px;
    }
    .code-block {
      background: #2d2d2d;
      color: #f8f8f2;
      padding: 15px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
    }
    .links {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
    }
    .links a {
      color: #667eea;
      text-decoration: none;
      margin-right: 20px;
      font-size: 14px;
    }
    .links a:hover {
      text-decoration: underline;
    }
    .ai-badge {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      margin-left: 10px;
    }
    .flag {
      font-size: 24px;
      margin-right: 10px;
    }
    #info {
      display: none;
    }
    #info.loading {
      display: block;
    }
    #info.loaded {
      display: block;
    }
    .loading-text {
      text-align: center;
      color: #999;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌐 IP Info Service <span class="ai-badge">AI Friendly</span></h1>
    <p class="subtitle">基于 Cloudflare Workers 的 IP 地址和地理位置信息查询服务</p>

    <div id="info" class="info-box">
      <div class="loading-text">正在获取您的 IP 信息...</div>
    </div>

    <div class="api-section">
      <h3 class="api-title">🚀 快速使用</h3>
      <div class="code-block">curl https://ip-info-service.your-subdomain.workers.dev/</div>
    </div>

    <div class="api-section">
      <h3 class="api-title">📝 响应示例</h3>
      <div class="code-block">{
  "ipv4": "203.0.113.1",
  "ipv6": "",
  "country": "CN",
  "colo": "HKG",
  "asn": "13335",
  "timezone": "Asia/Shanghai",
  "timestamp": "2024-01-01T12:00:00.000Z"
}</div>
    </div>

    <div class="links">
      <a href="/llms.txt">📚 LLMs.txt (AI 索引)</a>
      <a href="/llm.txt">🤖 LLM.txt</a>
      <a href="/robots.txt">🔍 Robots.txt</a>
      <a href="https://github.com/yourusername/cloudflare-ip-worker">💻 GitHub</a>
    </div>
  </div>

  <script>
    async function loadInfo() {
      const infoBox = document.getElementById('info');
      try {
        const response = await fetch('/');
        const data = await response.json();

        const countryFlags = {
          'CN': '🇨🇳', 'US': '🇺🇸', 'JP': '🇯🇵', 'GB': '🇬🇧',
          'DE': '🇩🇪', 'FR': '🇫🇷', 'KR': '🇰🇷', 'HK': '🇭🇰',
          'TW': '🇹🇼', 'SG': '🇸🇬', 'CA': '🇨🇦', 'AU': '🇦🇺'
        };

        const flag = countryFlags[data.country] || '🌍';

        infoBox.className = 'info-box loaded';
        infoBox.innerHTML = \`
          <div class="info-item">
            <span class="info-label"><span class="flag">\${flag}</span>国家/地区</span>
            <span class="info-value">\${data.country || '未知'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">IPv4 地址</span>
            <span class="info-value">\${data.ipv4 || '无'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">IPv6 地址</span>
            <span class="info-value">\${data.ipv6 || '无'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Cloudflare 节点</span>
            <span class="info-value">\${data.colo || '未知'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">ASN</span>
            <span class="info-value">\${data.asn || '未知'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">时区</span>
            <span class="info-value">\${data.timezone || '未知'}</span>
          </div>
        \`;
      } catch (error) {
        infoBox.className = 'info-box loaded';
        infoBox.innerHTML = '<div class="loading-text">获取信息失败，请刷新页面重试</div>';
      }
    }

    loadInfo();
  </script>
</body>
</html>
`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 处理静态文件
    if (STATIC_FILES[path]) {
      return new Response(STATIC_FILES[path], {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // 处理首页
    if (path === '/') {
      // 如果是 API 请求（带有 accept: application/json）
      const accept = request.headers.get('accept') || '';
      if (accept.includes('application/json')) {
        return getIpInfo(request);
      }

      // 返回 HTML 首页
      return new Response(HOME_PAGE, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    // 默认返回 IP 信息（兼容旧版）
    return getIpInfo(request);
  },
};

// 获取 IP 信息的辅助函数
function getIpInfo(request) {
  const headers = request.headers;

  // 获取 IPv4 地址 (CF-Connecting-IP)
  const ipv4 = headers.get('CF-Connecting-IP') || '';

  // 获取 IPv6 地址 (如果存在)
  const isIPv6 = ipv4.includes(':');
  const ipv6 = isIPv6 ? ipv4 : '';

  // 获取国家代码
  const country = headers.get('CF-IPCountry') || 'XX';

  // 获取其他有用信息
  const colo = headers.get('CF-Ray')?.split('-')[1] || '';
  const asn = headers.get('CF-IPASN') || '';
  const timezone = headers.get('CF-Timezone') || '';

  // 构建响应数据
  const data = {
    ipv4: isIPv6 ? '' : ipv4,
    ipv6: ipv6,
    country: country,
    colo: colo,
    asn: asn,
    timezone: timezone,
    timestamp: new Date().toISOString(),
  };

  // 返回 JSON 响应
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'X-App-Version': '1.0.0',
    },
  });
}
