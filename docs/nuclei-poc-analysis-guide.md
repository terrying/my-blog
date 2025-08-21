# Nuclei POC 自动分析使用指南

## 🎯 功能概览

这个 Nuclei POC 自动分析系统可以：

- 🔍 **自动监控** Nuclei 模板库的每日更新
- 📊 **智能分析** POC 的影响范围、危害程度和风险等级
- 📝 **生成报告** 包含详细分析和安全建议的博客文章
- 🤖 **自动发布** 定时推送到博客，无需人工干预

## 📋 系统组件

### 1. 核心分析器 (`scripts/nuclei-poc-analyzer.js`)
- 解析 Nuclei YAML 模板
- 提取漏洞信息和元数据
- 评估风险等级和影响范围
- 生成结构化的分析报告

### 2. GitHub 客户端 (`scripts/github-client.js`)
- 获取 Nuclei 模板仓库的更新
- 批量下载模板内容
- 分析提交历史和变更信息
- 处理 GitHub API 限制

### 3. 自动化工作流 (`.github/workflows/nuclei-poc-analysis.yml`)
- 每日定时运行分析
- 生成并发布博客文章
- 错误处理和通知机制

### 4. 测试脚本 (`scripts/test-nuclei-analyzer.js`)
- 本地功能验证
- 模板解析测试
- 报告生成预览

## 🚀 快速开始

### 1. 环境准备

```bash
# 1. 安装依赖
yarn install

# 2. 设置 GitHub Token (可选，用于提高 API 限制)
export GITHUB_TOKEN=your_github_token_here

# 3. 运行测试验证功能
node scripts/test-nuclei-analyzer.js
```

### 2. 本地测试

```bash
# 分析最近 24 小时的更新
node scripts/nuclei-poc-analyzer.js

# 分析最近 48 小时的更新  
ANALYSIS_HOURS=48 node scripts/nuclei-poc-analyzer.js

# 手动触发分析（用于调试）
node scripts/nuclei-poc-analyzer.js --debug
```

### 3. 自动化部署

系统会自动运行，无需手动干预：

- **每日 09:00** (北京时间) 自动分析并发布
- **手动触发** 可通过 GitHub Actions 页面手动运行
- **错误通知** 失败时会在 Actions 中显示详细错误信息

## 📊 分析维度

### 风险等级评估
- **极高风险** (5/5): Critical 漏洞 + 高 CVSS 评分
- **高风险** (4/5): High 漏洞或有公开 exploit
- **中等风险** (3/5): Medium 漏洞
- **低风险** (2/5): Low 漏洞
- **信息收集** (1/5): Info 级别

### 资产影响分析
- **资产类型识别**: 根据标签和路径分析影响的资产类型
- **影响范围估算**: 基于资产类型估算受影响的资产数量
- **攻击向量分析**: 识别可能的攻击方式和入口点

### 威胁情报整合
- **CVE 信息**: 自动关联 CVE 编号和 CVSS 评分
- **参考链接**: 收集相关的安全公告和技术文档
- **标签分类**: 按技术栈、攻击类型等维度分类

## 📝 报告格式

生成的 MDX 文件包含以下部分：

### 1. 文档头部 (Frontmatter)
```yaml
---
title: 'Nuclei POC 日报 - YYYY-MM-DD'
date: 'YYYY-MM-DD'
tags: ['Nuclei', 'POC分析', '漏洞扫描', '威胁情报']
draft: false
summary: '今日概况总结'
authors: ['default']
---
```

### 2. 今日概况
- 新增模板数量
- 高风险漏洞统计
- 严重程度分布
- 主要类别分析

### 3. 重点漏洞分析
- 漏洞详细信息
- 风险等级评估
- 影响资产分析
- 攻击向量说明
- CVE 信息和参考链接

### 4. 完整模板列表
- 表格形式展示所有分析的模板
- 包含名称、严重程度、类别、影响资产等信息

### 5. 安全建议
- 基于分析结果的针对性建议
- 优先级排序的防护措施
- 扫描和检测建议

### 6. 扫描命令
- 可直接使用的 Nuclei 扫描命令
- 针对性的参数配置
- 高危漏洞优先扫描

## ⚙️ 配置选项

### 环境变量
- `GITHUB_TOKEN`: GitHub API Token (可选，提高 API 限制)
- `ANALYSIS_HOURS`: 分析时间范围，默认 24 小时
- `DEBUG`: 启用调试模式，输出详细日志

### 自定义配置
可以在 `nuclei-poc-analyzer.js` 中调整：

```javascript
// 修改严重程度权重
this.severityLevels = {
  'critical': { priority: 5, emoji: '🔴', description: '严重' },
  // ...
};

// 调整资产类型映射
const assetTagMapping = {
  'apache': 'Apache 服务器',
  // ...
};

// 自定义影响范围估算
const estimates = {
  'Apache 服务器': '数百万台',
  // ...
};
```

## 🔧 故障排除

### 常见问题

1. **GitHub API 限制**
   ```
   解决方案: 设置 GITHUB_TOKEN 环境变量
   export GITHUB_TOKEN=your_token
   ```

2. **YAML 解析错误**
   ```
   检查 Nuclei 模板格式是否正确
   查看错误日志中的具体模板路径
   ```

3. **网络连接问题**
   ```
   检查网络连接
   确认 GitHub API 可访问
   ```

4. **文件权限错误**
   ```
   确保 data/blog/ 目录有写权限
   检查 Git 仓库状态
   ```

### 调试技巧

1. **启用详细日志**
   ```bash
   DEBUG=1 node scripts/nuclei-poc-analyzer.js
   ```

2. **测试单个模板**
   ```bash
   node scripts/test-nuclei-analyzer.js
   ```

3. **检查 API 限制状态**
   ```bash
   curl -H "Authorization: token $GITHUB_TOKEN" \
        https://api.github.com/rate_limit
   ```

## 📈 性能优化

### API 使用优化
- 批量请求减少 API 调用次数
- 智能缓存避免重复请求
- 速率限制自动处理

### 内存优化
- 流式处理大文件
- 及时释放不需要的对象
- 分批处理模板分析

### 网络优化
- 并发控制避免过载
- 失败重试机制
- 超时处理

## 🔮 扩展功能

### 可扩展的分析维度
- 添加新的风险评估因子
- 自定义资产类型识别
- 集成外部威胁情报源

### 多格式输出
- JSON 格式的结构化数据
- CSV 格式的统计报表
- PDF 格式的分析报告

### 通知集成
- Slack/钉钉通知
- 邮件报告推送
- Webhook 集成

## 📄 许可证

本项目基于 MIT 许可证开源，可自由使用和修改。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

- 🐛 **Bug 报告**: 详细描述问题和复现步骤
- 💡 **功能建议**: 说明用途和预期效果
- 🔧 **代码贡献**: 遵循现有代码风格和测试规范

---

*最后更新: 2025-08-21*