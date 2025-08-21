/**
 * GitHub API 客户端
 * 用于获取 Nuclei 模板仓库的更新信息
 */

const axios = require('axios');

class GitHubClient {
  constructor(token = null) {
    this.token = token || process.env.GITHUB_TOKEN;
    this.baseURL = 'https://api.github.com';
    this.nucleiRepo = 'projectdiscovery/nuclei-templates';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'NucleiPOCAnalyzer/1.0',
        ...(this.token && { 'Authorization': `token ${this.token}` })
      }
    });
  }

  /**
   * 获取仓库的最新提交
   */
  async getLatestCommits(since = null, perPage = 30) {
    try {
      const params = {
        per_page: perPage,
        ...(since && { since })
      };

      const response = await this.client.get(`/repos/${this.nucleiRepo}/commits`, { params });
      return response.data;
    } catch (error) {
      console.error('获取提交失败:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * 获取单个提交的详细信息
   */
  async getCommitDetails(sha) {
    try {
      const response = await this.client.get(`/repos/${this.nucleiRepo}/commits/${sha}`);
      return response.data;
    } catch (error) {
      console.error(`获取提交详情失败 ${sha}:`, error.response?.data || error.message);
      return null;
    }
  }

  /**
   * 获取文件内容
   */
  async getFileContent(path, ref = 'main') {
    try {
      const response = await this.client.get(`/repos/${this.nucleiRepo}/contents/${path}`, {
        params: { ref }
      });
      
      if (response.data.encoding === 'base64') {
        return Buffer.from(response.data.content, 'base64').toString('utf8');
      }
      
      return response.data.content;
    } catch (error) {
      console.error(`获取文件内容失败 ${path}:`, error.response?.data || error.message);
      return null;
    }
  }

  /**
   * 分析最近的模板变更
   */
  async analyzeRecentTemplateChanges(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    try {
      const commits = await this.getLatestCommits(since);
      const templateChanges = {
        newTemplates: [],
        modifiedTemplates: [],
        deletedTemplates: []
      };

      for (const commit of commits) {
        const commitDetails = await this.getCommitDetails(commit.sha);
        if (!commitDetails) continue;

        for (const file of commitDetails.files || []) {
          // 只处理 .yaml 文件
          if (!file.filename.endsWith('.yaml')) continue;
          
          // 排除非模板文件
          if (file.filename.includes('/.nuclei-ignore') || 
              file.filename.includes('/.github/') ||
              file.filename.includes('/docs/')) continue;

          const changeInfo = {
            filename: file.filename,
            status: file.status,
            sha: commit.sha,
            commit: {
              message: commit.commit.message,
              author: commit.commit.author.name,
              date: commit.commit.author.date,
              url: commit.html_url
            },
            additions: file.additions,
            deletions: file.deletions,
            changes: file.changes
          };

          switch (file.status) {
            case 'added':
              templateChanges.newTemplates.push(changeInfo);
              break;
            case 'modified':
              templateChanges.modifiedTemplates.push(changeInfo);
              break;
            case 'removed':
              templateChanges.deletedTemplates.push(changeInfo);
              break;
          }
        }
      }

      return templateChanges;
    } catch (error) {
      console.error('分析模板变更失败:', error);
      return { newTemplates: [], modifiedTemplates: [], deletedTemplates: [] };
    }
  }

  /**
   * 获取模板文件的元数据
   */
  async getTemplateMetadata(templatePath) {
    try {
      const response = await this.client.get(`/repos/${this.nucleiRepo}/contents/${templatePath}`);
      
      return {
        path: templatePath,
        sha: response.data.sha,
        size: response.data.size,
        downloadUrl: response.data.download_url,
        lastModified: response.data.url // 这里需要额外的 API 调用获取准确时间
      };
    } catch (error) {
      console.error(`获取模板元数据失败 ${templatePath}:`, error.response?.data || error.message);
      return null;
    }
  }

  /**
   * 批量获取模板内容
   */
  async batchGetTemplateContents(templatePaths) {
    const results = [];
    const batchSize = 5; // 限制并发请求数
    
    for (let i = 0; i < templatePaths.length; i += batchSize) {
      const batch = templatePaths.slice(i, i + batchSize);
      const promises = batch.map(async (path) => {
        try {
          const content = await this.getFileContent(path);
          return content ? { path, content } : null;
        } catch (error) {
          console.error(`批量获取失败 ${path}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults.filter(r => r !== null));
      
      // 添加延迟避免 API 限制
      if (i + batchSize < templatePaths.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * 搜索特定类型的模板
   */
  async searchTemplates(query, type = 'file') {
    try {
      const searchQuery = `${query} repo:${this.nucleiRepo} extension:yaml`;
      const response = await this.client.get('/search/code', {
        params: {
          q: searchQuery,
          per_page: 100
        }
      });

      return response.data.items.map(item => ({
        path: item.path,
        url: item.html_url,
        score: item.score
      }));
    } catch (error) {
      console.error('搜索模板失败:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * 获取仓库统计信息
   */
  async getRepositoryStats() {
    try {
      const [repoInfo, contributors, releases] = await Promise.all([
        this.client.get(`/repos/${this.nucleiRepo}`),
        this.client.get(`/repos/${this.nucleiRepo}/contributors?per_page=10`),
        this.client.get(`/repos/${this.nucleiRepo}/releases?per_page=5`)
      ]);

      return {
        stars: repoInfo.data.stargazers_count,
        forks: repoInfo.data.forks_count,
        size: repoInfo.data.size,
        lastUpdated: repoInfo.data.updated_at,
        language: repoInfo.data.language,
        topics: repoInfo.data.topics || [],
        contributors: contributors.data.length,
        latestRelease: releases.data[0]?.tag_name || null,
        totalTemplates: await this.estimateTemplateCount()
      };
    } catch (error) {
      console.error('获取仓库统计失败:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * 估算模板总数
   */
  async estimateTemplateCount() {
    try {
      const response = await this.client.get('/search/code', {
        params: {
          q: `repo:${this.nucleiRepo} extension:yaml`,
          per_page: 1
        }
      });
      
      return response.data.total_count;
    } catch (error) {
      console.error('估算模板数量失败:', error);
      return 0;
    }
  }

  /**
   * 检查 API 限制状态
   */
  async checkRateLimit() {
    try {
      const response = await this.client.get('/rate_limit');
      return response.data;
    } catch (error) {
      console.error('检查 API 限制失败:', error);
      return null;
    }
  }
}

module.exports = { GitHubClient };