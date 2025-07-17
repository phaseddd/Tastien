# 环境变量配置指南

## 重要提醒 ⚠️
- `.env` 文件包含敏感信息，已被 Git 忽略，不会被提交到代码仓库
- 请妥善保管你的 GitHub Personal Access Token
- 不要将真实的 token 分享给他人

## 配置步骤

### 1. 获取 GitHub Personal Access Token
1. 访问 [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 设置 token 名称，如 "Tastien App"
4. 选择权限：
   - ✅ `gist` - 创建和管理 gist
5. 点击 "Generate token"
6. **重要**：复制生成的 token（只显示一次）

### 2. 创建或获取 Gist ID
1. 访问 [GitHub Gist](https://gist.github.com/)
2. 创建一个新的 private gist，用于存储应用数据
3. 从 URL 中获取 Gist ID（如：`https://gist.github.com/username/abc123def456` 中的 `abc123def456`）

### 3. 配置 .env 文件
编辑项目根目录下的 `.env` 文件，替换以下值：

```env
VITE_GITHUB_TOKEN=ghp_your_actual_token_here
VITE_GITHUB_USERNAME=your_github_username
VITE_GIST_ID=your_actual_gist_id_here
```

### 4. 验证配置
启动开发服务器后，检查浏览器控制台是否有相关错误信息。

## 安全最佳实践

1. **定期轮换 Token**：建议每 3-6 个月更新一次 Personal Access Token
2. **最小权限原则**：只授予必要的权限
3. **监控使用情况**：在 GitHub Settings 中定期检查 token 的使用情况
4. **泄露处理**：如果 token 意外泄露，立即在 GitHub 中撤销并生成新的

## 故障排除

### 常见错误
- `401 Unauthorized`：检查 token 是否正确且未过期
- `404 Not Found`：检查 Gist ID 是否正确
- `403 Forbidden`：检查 token 权限是否包含 gist 权限

### 调试技巧
- 在浏览器开发者工具中检查网络请求
- 查看控制台错误信息
- 确认环境变量是否正确加载（可以在代码中临时打印 `import.meta.env`）

- 2025-7-17 触发推送