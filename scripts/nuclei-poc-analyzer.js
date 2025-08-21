/**
 * Nuclei POC 自动分析脚本
 * 分析 Nuclei 模板更新，提取漏洞信息并生成分析报告
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { GitHubClient } = require('./github-client');

// Nuclei 模板信息提取器
class NucleiPOCAnalyzer {
  constructor(githubToken = null) {
    this.githubClient = new GitHubClient(githubToken);
    this.severityLevels = {
      'critical': { priority: 5, emoji: '🔴', description: '严重' },
      'high': { priority: 4, emoji: '🟠', description: '高危' },
      'medium': { priority: 3, emoji: '🟡', description: '中危' },
      'low': { priority: 2, emoji: '🔵', description: '低危' },
      'info': { priority: 1, emoji: '⚪', description: '信息' }
    };
  }

  /**
   * 从 GitHub API 获取最新的模板更新
   */
  async getLatestTemplateUpdates(hours = 24) {
    try {
      console.log(`🔍 获取最近 ${hours} 小时的模板更新...`);
      
      const changes = await this.githubClient.analyzeRecentTemplateChanges(hours);
      
      console.log(`📊 发现变更: 新增${changes.newTemplates.length}个, 修改${changes.modifiedTemplates.length}个, 删除${changes.deletedTemplates.length}个`);
      
      return {
        newTemplates: changes.newTemplates,
        modifiedTemplates: changes.modifiedTemplates,
        deletedTemplates: changes.deletedTemplates,
        summary: {
          totalChanges: changes.newTemplates.length + changes.modifiedTemplates.length,
          newCount: changes.newTemplates.length,
          modifiedCount: changes.modifiedTemplates.length,
          deletedCount: changes.deletedTemplates.length
        }
      };
    } catch (error) {
      console.error('获取模板更新失败:', error);
      return { 
        newTemplates: [], 
        modifiedTemplates: [], 
        deletedTemplates: [],
        summary: { totalChanges: 0, newCount: 0, modifiedCount: 0, deletedCount: 0 }
      };
    }
  }

  /**
   * 解析单个 Nuclei 模板文件
   */
  async parseTemplate(templatePath, templateContent) {
    try {
      const template = yaml.load(templateContent);
      
      return {
        id: template.id || path.basename(templatePath, '.yaml'),
        filePath: templatePath,
        info: this.extractTemplateInfo(template.info || {}),
        assetScope: this.analyzeAssetScope(template),
        riskLevel: this.calculateRiskLevel(template),
        category: this.categorizeTemplate(templatePath, template),
        template: template, // 保留原始模板数据
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`解析模板失败 ${templatePath}:`, error);
      return null;
    }
  }

  /**
   * 智能过滤高价值模板
   */
  filterHighValueTemplates(templates) {
    const priorities = {
      'cves/': 10,           // CVE 漏洞最高优先级
      'vulnerabilities/': 8,  // 通用漏洞高优先级
      'exposures/': 6,       // 信息泄露中等优先级
      'misconfiguration/': 4, // 配置错误较低优先级
      'technologies/': 2,     // 技术识别最低优先级
      'panels/': 3,          // 面板检测较低优先级
    };

    return templates
      .map(template => {
        // 计算优先级分数
        let score = 1; // 基础分数
        
        for (const [path, priority] of Object.entries(priorities)) {
          if (template.filename.includes(path)) {
            score = priority;
            break;
          }
        }
        
        // 新增模板比修改模板优先级更高
        if (template.status === 'added') score += 2;
        
        // 最近提交的优先级更高
        const commitDate = new Date(template.commit.date);
        const hoursOld = (Date.now() - commitDate.getTime()) / (1000 * 60 * 60);
        if (hoursOld < 6) score += 1; // 6小时内的更新加分
        
        return { ...template, priorityScore: score };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }

  /**
   * 批量分析模板变更
   */
  async analyzeTemplateChanges(templateChanges) {
    const analyzedTemplates = [];
    
    // 处理新增和修改的模板
    let templatestoAnalyze = [
      ...templateChanges.newTemplates,
      ...templateChanges.modifiedTemplates
    ];

    console.log(`📊 发现 ${templatestoAnalyze.length} 个模板变更`);

    // 智能过滤高价值模板
    templatestoAnalyze = this.filterHighValueTemplates(templatestoAnalyze);
    
    // 限制分析数量以节省 API 配额
    const maxTemplates = process.env.MAX_TEMPLATES ? parseInt(process.env.MAX_TEMPLATES) : 50;
    if (templatestoAnalyze.length > maxTemplates) {
      console.log(`🎯 智能筛选前 ${maxTemplates} 个高价值模板进行分析`);
      templatestoAnalyze = templatestoAnalyze.slice(0, maxTemplates);
    }

    console.log(`📥 开始下载和分析 ${templatestoAnalyze.length} 个模板...`);

    // 批量获取模板内容
    const templatePaths = templatestoAnalyze.map(t => t.filename);
    const templateContents = await this.githubClient.batchGetTemplateContents(templatePaths);

    // 分析每个模板
    for (const { path: templatePath, content } of templateContents) {
      const analyzed = await this.parseTemplate(templatePath, content);
      if (analyzed) {
        // 添加变更信息
        const changeInfo = templatestoAnalyze.find(t => t.filename === templatePath);
        if (changeInfo) {
          analyzed.changeInfo = {
            status: changeInfo.status,
            commit: changeInfo.commit,
            additions: changeInfo.additions,
            deletions: changeInfo.deletions,
            changes: changeInfo.changes
          };
        }
        analyzedTemplates.push(analyzed);
      }
    }

    console.log(`✅ 成功分析 ${analyzedTemplates.length} 个模板`);
    return analyzedTemplates;
  }

  /**
   * 标准化标签格式
   */
  normalizeTags(tags) {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
      return tags.split(/[,\s]+/).map(t => t.trim()).filter(t => t.length > 0);
    }
    return [];
  }

  /**
   * 提取模板基本信息
   */
  extractTemplateInfo(info) {
    return {
      name: info.name || '未命名漏洞',
      author: Array.isArray(info.author) ? info.author.join(', ') : (info.author || '未知'),
      severity: info.severity || 'info',
      description: info.description || '暂无描述',
      reference: Array.isArray(info.reference) ? info.reference : (info.reference ? [info.reference] : []),
      tags: this.normalizeTags(info.tags),
      classification: info.classification || {},
      remediation: info.remediation || ''
    };
  }

  /**
   * 分析资产影响范围
   */
  analyzeAssetScope(template) {
    const scope = {
      assetTypes: new Set(),
      protocols: new Set(),
      ports: new Set(),
      paths: new Set()
    };

    // 从标签分析资产类型
    const tags = this.normalizeTags(template.info?.tags);
    
    const assetTagMapping = {
      'apache': 'Apache 服务器',
      'nginx': 'Nginx 服务器', 
      'iis': 'IIS 服务器',
      'wordpress': 'WordPress 站点',
      'joomla': 'Joomla 站点',
      'drupal': 'Drupal 站点',
      'jenkins': 'Jenkins CI/CD',
      'gitlab': 'GitLab 平台',
      'docker': 'Docker 容器',
      'kubernetes': 'Kubernetes 集群',
      'panel': '管理面板',
      'router': '路由器设备',
      'camera': '摄像头设备'
    };

    tags.forEach(tag => {
      if (assetTagMapping[tag.toLowerCase()]) {
        scope.assetTypes.add(assetTagMapping[tag.toLowerCase()]);
      }
    });

    // 从请求路径分析
    if (template.requests) {
      template.requests.forEach(request => {
        if (request.path) {
          request.path.forEach(p => {
            scope.paths.add(p);
            
            // 分析路径特征
            if (p.includes('/admin')) scope.assetTypes.add('管理后台');
            if (p.includes('/api/')) scope.assetTypes.add('API 接口');
            if (p.includes('.php')) scope.assetTypes.add('PHP 应用');
            if (p.includes('.jsp')) scope.assetTypes.add('Java 应用');
            if (p.includes('.asp')) scope.assetTypes.add('ASP.NET 应用');
          });
        }
      });
    }

    return {
      assetTypes: Array.from(scope.assetTypes),
      estimatedAffectedAssets: this.estimateAffectedAssets(scope.assetTypes),
      attackVectors: this.identifyAttackVectors(template),
      exposureRisk: this.calculateExposureRisk(template)
    };
  }

  /**
   * 计算风险等级
   */
  calculateRiskLevel(template) {
    const severity = template.info?.severity || 'info';
    const classification = template.info?.classification || {};
    
    let riskScore = this.severityLevels[severity]?.priority || 1;
    
    // CVSS 评分调整
    if (classification['cvss-score']) {
      const cvssScore = parseFloat(classification['cvss-score']);
      if (cvssScore >= 9.0) riskScore = Math.max(riskScore, 5);
      else if (cvssScore >= 7.0) riskScore = Math.max(riskScore, 4);
      else if (cvssScore >= 4.0) riskScore = Math.max(riskScore, 3);
    }

    // 是否有公开 exploit
    if (classification['cve-id'] || template.info?.reference?.some(ref => 
      ref.includes('exploit') || ref.includes('poc'))) {
      riskScore += 0.5;
    }

    return {
      score: Math.min(riskScore, 5),
      level: this.getRiskLevel(riskScore),
      factors: this.getRiskFactors(template)
    };
  }

  /**
   * 模板分类
   */
  categorizeTemplate(templatePath, template) {
    if (templatePath.includes('/cves/')) return { type: 'CVE漏洞', category: 'vulnerability' };
    if (templatePath.includes('/exposures/')) return { type: '信息泄露', category: 'exposure' };
    if (templatePath.includes('/misconfiguration/')) return { type: '配置错误', category: 'misconfiguration' };
    if (templatePath.includes('/panels/')) return { type: '管理面板', category: 'panel' };
    if (templatePath.includes('/technologies/')) return { type: '技术识别', category: 'technology' };
    if (templatePath.includes('/takeovers/')) return { type: '子域接管', category: 'takeover' };
    
    return { type: '其他', category: 'other' };
  }

  /**
   * 估算受影响资产数量
   */
  estimateAffectedAssets(assetTypes) {
    const estimates = {
      'Apache 服务器': '数百万台',
      'Nginx 服务器': '数百万台', 
      'WordPress 站点': '数千万个',
      'Jenkins CI/CD': '数十万个',
      '管理面板': '数万个',
      'API 接口': '数千万个'
    };

    // 将 Set 转换为数组
    const assetTypesArray = Array.from(assetTypes);
    
    if (assetTypesArray.length === 0) {
      return '数千个';
    }

    // 找到最大的估算值
    let maxEstimate = '数千个';
    for (const type of assetTypesArray) {
      if (estimates[type]) {
        maxEstimate = estimates[type];
        break; // 取第一个匹配的估算值
      }
    }

    return maxEstimate;
  }

  /**
   * 识别攻击向量
   */
  identifyAttackVectors(template) {
    const vectors = [];
    
    if (template.requests) {
      template.requests.forEach(request => {
        if (request.method === 'GET') vectors.push('HTTP GET 请求');
        if (request.method === 'POST') vectors.push('HTTP POST 请求');
        if (request.body) vectors.push('请求体注入');
        if (request.headers) vectors.push('HTTP 头注入');
      });
    }

    return vectors.length > 0 ? vectors : ['网络扫描'];
  }

  /**
   * 计算暴露风险
   */
  calculateExposureRisk(template) {
    const info = template.info || {};
    let risk = 'Medium';

    if (info.severity === 'critical' || info.severity === 'high') {
      risk = 'High';
    } else if (info.severity === 'low' || info.severity === 'info') {
      risk = 'Low';
    }

    return risk;
  }

  /**
   * 获取风险等级描述
   */
  getRiskLevel(score) {
    if (score >= 4.5) return '极高风险';
    if (score >= 3.5) return '高风险';
    if (score >= 2.5) return '中等风险';
    if (score >= 1.5) return '低风险';
    return '信息收集';
  }

  /**
   * 获取风险因素
   */
  getRiskFactors(template) {
    const factors = [];
    const info = template.info || {};
    
    if (info.classification?.['cve-id']) factors.push('已分配 CVE 编号');
    if (info.reference?.length > 0) factors.push('有公开参考资料');
    if (info.severity === 'critical') factors.push('严重程度为 Critical');
    if (info.tags?.includes('rce')) factors.push('可远程代码执行');
    if (info.tags?.includes('sqli')) factors.push('SQL 注入漏洞');
    if (info.tags?.includes('xss')) factors.push('跨站脚本攻击');
    
    return factors;
  }

  /**
   * 生成每日 POC 分析报告
   */
  async generateDailyReport(templates, templateChanges = null) {
    const date = new Date().toISOString().split('T')[0];
    const sortedTemplates = templates
      .filter(t => t !== null)
      .sort((a, b) => b.riskLevel.score - a.riskLevel.score);

    const report = {
      date,
      summary: {
        totalNew: sortedTemplates.length,
        bySeverity: this.groupBySeverity(sortedTemplates),
        byCategory: this.groupByCategory(sortedTemplates),
        highRiskCount: sortedTemplates.filter(t => t.riskLevel.score >= 4).length,
        ...(templateChanges && { changes: templateChanges.summary })
      },
      templates: sortedTemplates,
      recommendations: this.generateRecommendations(sortedTemplates),
      templateChanges
    };

    return this.formatReportAsMDX(report);
  }

  /**
   * 生成统计摘要
   */
  generateAnalysisSummary(totalTemplates, analyzedTemplates, templateChanges) {
    const summary = {
      total: totalTemplates,
      analyzed: analyzedTemplates.length,
      skipped: totalTemplates - analyzedTemplates.length,
      highRisk: analyzedTemplates.filter(t => t.riskLevel.score >= 4).length,
      categories: this.groupByCategory(analyzedTemplates),
      severities: this.groupBySeverity(analyzedTemplates)
    };

    console.log('\n📊 分析摘要:');
    console.log(`   总发现: ${summary.total} 个模板变更`);
    console.log(`   已分析: ${summary.analyzed} 个`);
    console.log(`   跳过: ${summary.skipped} 个 (优先级较低)`);
    console.log(`   高风险: ${summary.highRisk} 个`);
    console.log(`   类别分布: ${JSON.stringify(summary.categories)}`);
    console.log(`   严重程度: ${JSON.stringify(summary.severities)}`);

    return summary;
  }

  /**
   * 按严重程度分组
   */
  groupBySeverity(templates) {
    const groups = {};
    templates.forEach(template => {
      const severity = template.info.severity;
      groups[severity] = (groups[severity] || 0) + 1;
    });
    return groups;
  }

  /**
   * 按类别分组
   */
  groupByCategory(templates) {
    const groups = {};
    templates.forEach(template => {
      const category = template.category.type;
      groups[category] = (groups[category] || 0) + 1;
    });
    return groups;
  }

  /**
   * 生成安全建议
   */
  generateRecommendations(templates) {
    const recommendations = [];
    
    const highRiskTemplates = templates.filter(t => t.riskLevel.score >= 4);
    if (highRiskTemplates.length > 0) {
      recommendations.push('🚨 发现高风险漏洞，建议立即扫描相关资产');
    }

    const cveTemplates = templates.filter(t => t.info.classification?.['cve-id']);
    if (cveTemplates.length > 0) {
      recommendations.push('🔍 关注新发布的 CVE 漏洞，及时更新补丁');
    }

    const rceTemplates = templates.filter(t => t.info.tags?.includes('rce'));
    if (rceTemplates.length > 0) {
      recommendations.push('⚡ 检测到远程代码执行漏洞，优先处理');
    }

    return recommendations.length > 0 ? recommendations : ['✅ 今日无高危漏洞更新'];
  }

  /**
   * 格式化为 MDX 文件
   */
  formatReportAsMDX(report) {
    const { date, summary, templates, recommendations, templateChanges } = report;
    
    const totalChanges = templateChanges?.summary?.totalChanges || summary.totalNew;
    const analyzedCount = summary.totalNew;
    const skippedCount = totalChanges - analyzedCount;
    
    return `---
title: 'Nuclei POC 精选分析 - ${date}'
date: '${date}'
tags: ['Nuclei', 'POC分析', '漏洞扫描', '威胁情报']
draft: false
summary: '从 ${totalChanges} 个模板更新中精选分析 ${analyzedCount} 个高价值 POC，发现 ${summary.highRiskCount} 个高风险漏洞'
authors: ['default']
---

# Nuclei POC 精选分析 - ${date}

## 📊 智能筛选概况

- **发现变更**: ${totalChanges} 个模板更新
- **精选分析**: ${analyzedCount} 个高价值 POC  
- **智能跳过**: ${skippedCount} 个低优先级模板
- **高风险漏洞**: ${summary.highRiskCount} 个
- **主要类别**: ${Object.entries(summary.byCategory).map(([k,v]) => `${k}(${v})`).join(', ')}

> 💡 **智能筛选说明**: 系统自动优先分析 CVE 漏洞、高危漏洞和新增模板，跳过低价值的技术识别类模板，确保高效利用 API 资源。

### 严重程度分布

${Object.entries(summary.bySeverity).map(([severity, count]) => {
  const level = this.severityLevels[severity];
  return `- ${level?.emoji || '⚪'} **${level?.description || severity}**: ${count} 个`;
}).join('\n')}

## 🔍 重点漏洞分析

${templates.filter(t => t.riskLevel.score >= 4).map(template => `
### ${template.info.name}

- **漏洞ID**: \`${template.id}\`
- **严重程度**: ${this.severityLevels[template.info.severity]?.emoji} ${template.info.severity.toUpperCase()}
- **风险等级**: ${template.riskLevel.level} (${template.riskLevel.score}/5)
- **影响资产**: ${template.assetScope.assetTypes.join(', ') || '未知'}
- **预估影响**: ${template.assetScope.estimatedAffectedAssets}

**描述**: ${template.info.description}

**攻击向量**: ${template.assetScope.attackVectors.join(', ')}

${template.info.classification?.['cve-id'] ? `**CVE编号**: ${template.info.classification['cve-id']}` : ''}

${template.info.reference?.length > 0 ? `**参考链接**: 
${template.info.reference.map(ref => `- [${ref}](${ref})`).join('\n')}` : ''}

---
`).join('\n')}

## 📋 完整模板列表

| 模板名称 | 严重程度 | 类别 | 影响资产 | 风险评分 |
|---------|---------|------|---------|---------|
${templates.map(template => 
`| ${template.info.name} | ${this.severityLevels[template.info.severity]?.emoji} ${template.info.severity} | ${template.category.type} | ${template.assetScope.assetTypes.slice(0,2).join(', ') || '通用'} | ${template.riskLevel.score}/5 |`
).join('\n')}

## 🛡️ 安全建议

${recommendations.map(rec => `${rec}`).join('\n')}

## 🔧 扫描建议

建议使用以下 Nuclei 命令进行扫描：

\`\`\`bash
# 扫描高危漏洞
nuclei -t ${templates.filter(t => t.riskLevel.score >= 4).map(t => t.filePath).join(' -t ')} -u target-url

# 扫描所有今日新增模板  
nuclei -t ${templates.map(t => t.filePath).join(' -t ')} -u target-url
\`\`\`

---

*本报告基于 Nuclei 模板库自动生成，数据来源：[ProjectDiscovery/nuclei-templates](https://github.com/projectdiscovery/nuclei-templates)*

*扫描建议仅供参考，请在授权环境下进行安全测试*
`;
  }
}

// 主执行函数
async function main() {
  const analyzer = new NucleiPOCAnalyzer(process.env.GITHUB_TOKEN);
  
  try {
    console.log('🔍 开始分析 Nuclei POC 更新...');
    
    // 检查 API 限制
    const rateLimit = await analyzer.githubClient.checkRateLimit();
    if (rateLimit) {
      console.log(`📊 API 限制状态: ${rateLimit.rate.remaining}/${rateLimit.rate.limit}`);
    }
    
    // 获取最新模板更新
    const hours = process.env.ANALYSIS_HOURS ? parseInt(process.env.ANALYSIS_HOURS) : 24;
    const templateChanges = await analyzer.getLatestTemplateUpdates(hours);
    
    if (templateChanges.summary.totalChanges === 0) {
      console.log('📭 最近没有模板更新，跳过生成报告');
      return;
    }
    
    // 分析模板变更
    const totalTemplates = templateChanges.summary.totalChanges;
    const analyzedTemplates = await analyzer.analyzeTemplateChanges(templateChanges);
    
    if (analyzedTemplates.length === 0) {
      console.log('📭 没有成功分析的模板，跳过生成报告');
      return;
    }
    
    // 生成统计摘要
    const summary = analyzer.generateAnalysisSummary(totalTemplates, analyzedTemplates, templateChanges);
    
    // 生成报告
    const report = await analyzer.generateDailyReport(analyzedTemplates, templateChanges);
    
    // 保存报告
    const date = new Date().toISOString().split('T')[0];
    const fileName = `nuclei-poc-${date}.mdx`;
    const filePath = path.join(__dirname, '../data/blog', fileName);
    
    fs.writeFileSync(filePath, report, 'utf8');
    console.log(`\n✅ Nuclei POC 报告已生成: ${fileName}`);
    console.log(`📄 报告包含 ${analyzedTemplates.length} 个高价值模板分析`);
    
  } catch (error) {
    console.error('❌ 分析失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { NucleiPOCAnalyzer };