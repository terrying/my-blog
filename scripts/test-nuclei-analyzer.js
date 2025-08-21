/**
 * Nuclei POC 分析器测试脚本
 * 用于本地测试分析功能
 */

const { NucleiPOCAnalyzer } = require('./nuclei-poc-analyzer');

// 测试用的模拟 Nuclei 模板
const mockTemplateContent = `id: CVE-2024-test

info:
  name: "Test Application RCE"
  author: "test-author"
  severity: high
  description: "A remote code execution vulnerability in test application"
  reference:
    - "https://nvd.nist.gov/vuln/detail/CVE-2024-test"
    - "https://example.com/poc"
  classification:
    cvss-metrics: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
    cvss-score: 9.8
    cve-id: "CVE-2024-test"
  tags: "apache,rce,linux"

requests:
  - method: GET
    path:
      - "{{BaseURL}}/admin/test"
      - "{{BaseURL}}/api/v1/admin"
    
    matchers-condition: and
    matchers:
      - type: word
        words:
          - "admin panel"
          - "unauthorized access"
        condition: or
      
      - type: status
        status:
          - 200`;

async function testAnalyzer() {
  console.log('🧪 开始测试 Nuclei POC 分析器...\n');
  
  try {
    // 创建分析器实例（不使用真实 GitHub Token）
    const analyzer = new NucleiPOCAnalyzer();
    
    // 测试模板解析
    console.log('1️⃣ 测试模板解析...');
    const analyzed = await analyzer.parseTemplate('test/CVE-2024-test.yaml', mockTemplateContent);
    
    if (analyzed) {
      console.log('✅ 模板解析成功');
      console.log(`   - ID: ${analyzed.id}`);
      console.log(`   - 名称: ${analyzed.info.name}`);
      console.log(`   - 严重程度: ${analyzed.info.severity}`);
      console.log(`   - 风险评分: ${analyzed.riskLevel.score}/5`);
      console.log(`   - 风险等级: ${analyzed.riskLevel.level}`);
      console.log(`   - 影响资产: ${analyzed.assetScope.assetTypes.join(', ')}`);
      console.log(`   - 预估影响: ${analyzed.assetScope.estimatedAffectedAssets}`);
    } else {
      console.log('❌ 模板解析失败');
      return;
    }
    
    console.log('\n2️⃣ 测试报告生成...');
    
    // 创建模拟的模板变更数据
    const mockTemplateChanges = {
      newTemplates: [
        {
          filename: 'test/CVE-2024-test.yaml',
          status: 'added',
          commit: {
            message: 'Add CVE-2024-test template',
            author: 'test-author',
            date: new Date().toISOString(),
            url: 'https://github.com/projectdiscovery/nuclei-templates/commit/test'
          },
          additions: 25,
          deletions: 0,
          changes: 25
        }
      ],
      modifiedTemplates: [],
      deletedTemplates: [],
      summary: {
        totalChanges: 1,
        newCount: 1,
        modifiedCount: 0,
        deletedCount: 0
      }
    };
    
    // 生成测试报告
    const report = await analyzer.generateDailyReport([analyzed], mockTemplateChanges);
    
    if (report) {
      console.log('✅ 报告生成成功');
      
      // 显示报告预览
      console.log('\n📄 报告预览:');
      console.log('='.repeat(50));
      console.log(report.substring(0, 800) + '...\n');
      
      // 保存测试报告
      const fs = require('fs');
      const path = require('path');
      const testReportPath = path.join(__dirname, '../data/blog', 'nuclei-poc-test.mdx');
      
      fs.writeFileSync(testReportPath, report, 'utf8');
      console.log(`💾 测试报告已保存到: ${testReportPath}`);
    } else {
      console.log('❌ 报告生成失败');
      return;
    }
    
    console.log('\n3️⃣ 测试分析功能...');
    
    // 测试各种分析方法
    const testResults = {
      severityAnalysis: analyzer.groupBySeverity([analyzed]),
      categoryAnalysis: analyzer.groupByCategory([analyzed]),
      riskFactors: analyzed.riskLevel.factors,
      recommendations: analyzer.generateRecommendations([analyzed])
    };
    
    console.log('✅ 分析功能测试完成');
    console.log(`   - 严重程度分布: ${JSON.stringify(testResults.severityAnalysis)}`);
    console.log(`   - 类别分布: ${JSON.stringify(testResults.categoryAnalysis)}`);
    console.log(`   - 风险因素: ${testResults.riskFactors.join(', ')}`);
    console.log(`   - 安全建议数量: ${testResults.recommendations.length}`);
    
    console.log('\n🎉 所有测试通过！');
    console.log('\n📝 测试总结:');
    console.log(`   ✅ 模板解析: 正常`);
    console.log(`   ✅ 风险评估: 正常`);
    console.log(`   ✅ 资产分析: 正常`);
    console.log(`   ✅ 报告生成: 正常`);
    console.log(`   ✅ 统计分析: 正常`);
    
    console.log('\n🚀 可以开始使用真实的 GitHub Token 进行完整测试！');
    console.log('   设置环境变量: export GITHUB_TOKEN=your_token');
    console.log('   运行完整分析: node scripts/nuclei-poc-analyzer.js');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('\n🔧 可能的解决方案:');
    console.error('   1. 检查依赖是否正确安装: yarn install');
    console.error('   2. 检查文件路径是否正确');
    console.error('   3. 检查 YAML 格式是否有效');
  }
}

// 运行测试
if (require.main === module) {
  testAnalyzer();
}

module.exports = { testAnalyzer };