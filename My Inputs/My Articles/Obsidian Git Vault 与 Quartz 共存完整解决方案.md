---
Status: 🟩
tags:
  - input/articles
Links:
  - "[[Obsidian]]"
  - "[[运维部署]]"
Created: 2025-06-20T10:10:04
Source:
  - ""
Author:
  - Claude
Collection: 
Finished: 
Rating:
---

# Obsidian Git Vault 与 Quartz 共存完整解决方案

## 🎯 核心策略：双仓库"安全气隙"模式

**最佳实践：** 采用双仓库策略，确保私有知识库与公开发布完全隔离，通过 Dataview Serializer 插件和 GitHub Actions 实现自动化同步。

### 架构图

```
┌─────────────────────┐    GitHub Actions    ┌──────────────────────┐
│   Obsidian Vault   │ ─────自动同步────────→ │   Quartz 发布仓库     │
│   (私有仓库 A)       │                      │   (公开仓库 B)        │
│                     │                      │                      │
│ ├── 00_Inbox/       │    选择性复制内容      │ ├── content/         │
│ ├── 10_Projects/    │ ┌──share: true──┐  │ │   ├── rust/         │
│ ├── 20_Areas/ ────────┼─→ 标记的文件     │    │ │   └── bevy/         │
│ ├── 30_Resources/   │ └─ 3. Resources/ ─┘  │ └── quartz.config.ts │
│ └── 40_Archives/    │                      │                      │
└─────────────────────┘                      └──────────────────────┘
```

## 一、方案对比分析

|方案|优势|风险|推荐度|
|---|---|---|---|
|**双仓库策略**|🛡️ 完全安全、🔄 自动化、📱 工作流不变|初始设置复杂|⭐⭐⭐⭐⭐|
|单仓库集成|简单方便|🚨 可能泄露私有内容|⭐⭐⭐|
|Git 子模块|技术优雅|复杂度高、冲突风险|⭐⭐|

## 二、关键技术：Dataview Serializer 插件

### 2.1 插件功能

**Dataview Serializer** 是解决 Dataview 查询发布的完美方案：

- ✅ 将动态 Dataview 查询转换为静态 Markdown
- ✅ 保存时自动更新内容
- ✅ 生成的链接在图谱中显示
- ✅ 完全兼容 Quartz 和静态网站生成器

### 2.2 使用方法

```markdown
<!-- QueryToSerialize:
LIST FROM #rust 
WHERE publish = true
SORT file.mtime DESC
LIMIT 10
-->
```

插件会自动生成：

```markdown
<!-- SerializedQuery: LIST FROM #rust WHERE publish = true SORT file.mtime DESC LIMIT 10 -->
- [[Rust 异步编程完全指南]]
- [[Bevy ECS 系统设计]]
- [[Rust 性能优化技巧]]
<!-- SerializedQuery: END -->
```

## 三、实施步骤详解

### 步骤 1：配置你的私有 Obsidian Vault（仓库 A）

#### 1.1 安装必需插件

```
1. Dataview Serializer
2. Dataview（前置依赖）
```

#### 1.2 定义发布规则

**方案A：文件夹发布**

```
30_Resources/
├── Public/              # 完全公开
│   ├── Rust/
│   └── Bevy/
└── Private/             # 私有内容
```

**方案B：Frontmatter 标记**

```yaml
---
title: "Rust 异步编程指南"
tags: [rust, async]
share: true           # 发布标记
status: published
---
```

**方案C：混合模式（推荐）**

- `30_Resources/Public/` 文件夹自动发布
- 其他位置使用 `share: true` 标记

#### 1.3 转换现有 Dataview 查询

将你 MOC 中的查询改为可序列化格式：

**原查询：**

```dataview
TABLE file.mtime as "最后更新"
FROM #area/rust
SORT file.mtime DESC
LIMIT 10
```

**改为：**

```markdown
<!-- QueryToSerialize:
TABLE file.mtime as "最后更新"
FROM #area/rust 
WHERE publish = true
SORT file.mtime DESC
LIMIT 10
-->
```

### 步骤 2：创建 Quartz 发布仓库（仓库 B）

#### 2.1 初始化 Quartz 项目

```bash
# 创建新的公开仓库
git clone https://github.com/你的用户名/你的知识库-public.git
cd 你的知识库-public

# 初始化 Quartz
git clone https://github.com/jackyzha0/quartz.git .
npm install
npx quartz create
```

#### 2.2 配置 quartz.config.ts

```typescript
import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

const config: QuartzConfig = {
  configuration: {
    pageTitle: "Rust & Bevy 技术笔记",
    locale: "zh-CN",
    baseUrl: "your-site.pages.dev",
    ignorePatterns: [
      "private",
      "drafts", 
      "templates"
    ],
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.ObsidianFlavoredMarkdown(),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
    ],
    filters: [
      Plugin.RemoveDrafts(),
      // 注意：不需要 ExplicitPublish，因为内容已经预筛选
    ],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}
export default config
```

### 步骤 3：设置自动同步 GitHub Action

#### 3.1 生成部署密钥

```bash
# 生成 SSH 密钥对
ssh-keygen -t ed25519 -C "obsidian-to-quartz" -f ~/.ssh/quartz_deploy_key

# 添加公钥到仓库 B 的 Deploy Keys（启用写权限）
cat ~/.ssh/quartz_deploy_key.pub

# 添加私钥到仓库 A 的 Secrets，名为 QUARTZ_DEPLOY_PRIVATE_KEY
cat ~/.ssh/quartz_deploy_key
```

#### 3.2 创建同步工作流

**文件路径：** `.github/workflows/publish-to-quartz.yml`

```yaml
name: 🚀 发布到 Quartz

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      force_rebuild:
        description: '强制重建全部内容'
        type: boolean
        default: false

env:
  TZ: 'Asia/Shanghai'

jobs:
  sync-and-deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    
    steps:
      - name: 📥 检出源仓库 (Obsidian Vault)
        uses: actions/checkout@v4
        with:
          path: source
          fetch-depth: 0

      - name: 📥 检出目标仓库 (Quartz)
        uses: actions/checkout@v4
        with:
          repository: 你的用户名/你的知识库-public
          path: dest
          ssh-key: ${{ secrets.QUARTZ_DEPLOY_PRIVATE_KEY }}

      - name: 🔄 智能内容同步
        run: |
          echo "🔍 开始同步公开内容..."
          
          # 设置目标目录
          cd dest
          git config user.name "Obsidian Publisher"
          git config user.email "publisher@github.action"
          
          # 清理旧内容（如果强制重建）
          if [[ "${{ github.event.inputs.force_rebuild }}" == "true" ]]; then
            echo "🧹 强制重建：清理所有内容"
            rm -rf content/*
          fi
          
          mkdir -p content/
          cd ../source
          
          # 方法1：复制指定的公开文件夹
          echo "📁 同步公开文件夹..."
          if [ -d "30_Resources/Public" ]; then
            rsync -av --delete "30_Resources/Public/" ../dest/content/
            echo "✅ 已同步 30_Resources/Public/"
          fi
          
          # 方法2：查找所有标记为发布的文件
          echo "🏷️  查找标记发布的文件..."
          # 查找包含 "share: true" 的 markdown 文件
          find . -name "*.md" -type f -exec grep -l "share: *true" {} \; | while read file; do
            # 计算相对路径并复制到目标
            rel_path=${file#./}
            target_dir="../dest/content/$(dirname "$rel_path")"
            mkdir -p "$target_dir"
            cp "$file" "$target_dir/"
            echo "📄 已复制: $rel_path"
          done
          
          # 方法3：同步附件
          echo "🖼️  同步附件..."
          if [ -d "Attachments" ]; then
            # 只同步公开附件（以 public- 开头的文件）
            rsync -av --include="public-*" --exclude="*" Attachments/ ../dest/content/Attachments/
            echo "✅ 已同步公开附件"
          fi
          
          # 同步 assets 文件夹（如果存在）
          if [ -d "assets" ]; then
            rsync -av assets/ ../dest/content/assets/
            echo "✅ 已同步 assets"
          fi

      - name: 📊 生成同步报告
        run: |
          cd dest
          echo "📊 同步统计："
          echo "Markdown 文件: $(find content -name "*.md" | wc -l)"
          echo "图片文件: $(find content \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.webp" \) | wc -l)"
          echo "总大小: $(du -sh content | cut -f1)"

      - name: 📤 提交并推送到 Quartz 仓库
        run: |
          cd dest
          
          # 检查是否有变更
          if [[ -n $(git status --porcelain) ]]; then
            git add .
            
            # 生成有意义的提交信息
            commit_msg="📝 更新内容来自 vault"
            if [[ -n "${{ github.event.head_commit.message }}" ]]; then
              commit_msg="📝 ${{ github.event.head_commit.message }}"
            fi
            
            git commit -m "$commit_msg"
            git push
            
            echo "✅ 成功推送更新到 Quartz 仓库"
          else
            echo "ℹ️  没有内容变更，跳过推送"
          fi

      - name: 🌐 触发 Cloudflare Pages 部署
        if: success()
        run: |
          echo "🚀 Quartz 仓库已更新，Cloudflare Pages 将自动开始构建..."
          echo "📍 部署状态: https://dash.cloudflare.com/pages"
```

### 步骤 4：配置 Cloudflare Pages

#### 4.1 连接 Quartz 仓库（仓库 B）

1. 登录 Cloudflare Pages
2. 连接到你的 Quartz 公开仓库
3. 配置构建设置：
    
    ```yaml
    构建命令: npx quartz build构建输出目录: publicNode.js 版本: 22
    ```

#### 4.2 环境变量设置

```yaml
NODE_VERSION: 22
NODE_ENV: production
TZ: Asia/Shanghai
```

## 四、内容发布工作流

### 4.1 日常写作流程

1. **在 Obsidian 中正常写作**
2. **准备发布时：**
    - 添加 `share: true` 到 frontmatter
    - 或移动文件到 `30_Resources/Public/`
3. **检查 Dataview 查询已序列化**
4. **提交到 git：** `git add . && git commit -m "新增文章：Rust异步编程"`
5. **推送：** `git push`
6. **自动发布：** GitHub Actions 自动同步 → Cloudflare Pages 自动构建

### 4.2 批量内容管理

```bash
# 查看哪些文件标记为发布
grep -r "share: true" . --include="*.md"

# 查看待发布文件的统计
find . -name "*.md" -exec grep -l "share: true" {} \; | wc -l
```

## 五、安全与维护

### 5.1 安全检查清单

- [ ] 私有仓库设置正确
- [ ] Deploy Key 只有必要权限
- [ ] `.gitignore` 排除敏感文件
- [ ] 测试发布流程不会泄露私有内容

### 5.2 定期维护任务

```bash
# 每月清理检查
# 1. 检查孤立的发布标记
grep -r "share: true" . --include="*.md" | grep -v "30_Resources/Public"

# 2. 检查死链
# 在 Quartz 中运行构建查看警告

# 3. 更新依赖
cd quartz-repo && npm update
```

### 5.3 故障排除

**问题：Dataview 序列化失败**

```bash
# 检查插件状态
# 在 Obsidian 中：设置 → 社区插件 → Dataview Serializer

# 手动触发序列化
# 命令面板：Dataview Serializer: Refresh all serialized queries
```

**问题：GitHub Action 失败**

```bash
# 检查 Deploy Key 权限
# GitHub 仓库 B → Settings → Deploy keys → 确认有写权限

# 检查 Secret 配置
# GitHub 仓库 A → Settings → Secrets → QUARTZ_DEPLOY_PRIVATE_KEY
```

## 六、成本与收益分析

### 6.1 一次性设置成本

- 时间投入：4-6 小时（包括测试）
- 学习成本：中等（需要理解 GitHub Actions）
- 维护成本：每月 1-2 小时

### 6.2 长期收益

- 🛡️ **绝对安全**：私有内容永远不会意外泄露
- ⚡ **自动化**：写作发布完全自动化
- 🔗 **完整功能**：保留所有 Obsidian 特性
- 💰 **零成本**：完全免费的发布方案
- 📈 **可扩展**：支持未来功能扩展

## 七、替代方案权衡

如果你坚持单仓库方案，至少要做到：

### 单仓库安全配置

```typescript
// quartz.config.ts
ignorePatterns: [
  "00_Inbox/**",           // 排除收件箱
  "10_Projects/**",        // 排除项目
  "20_Areas/**",           // 排除领域
  "40_Archives/Private/**", // 排除私有归档
  "**/private*",           // 排除私有标记
  "**/*draft*",            // 排除草稿
  ".obsidian/**",          // 排除配置
  "Hidden/**",             // 排除隐藏文件
],
```

但即使如此，仍然存在**私有文件进入 git 历史**的风险。

## 八、总结

**最佳实践总结：**

1. **安全第一**：采用双仓库策略
2. **自动化优先**：使用 Dataview Serializer + GitHub Actions
3. **渐进式迁移**：先发布少量内容测试
4. **定期维护**：每月检查和更新
5. **备份策略**：确保两个仓库都有备份

这个解决方案让你能够：

- 📝 在熟悉的 Obsidian 环境中继续工作
- 🔒 完全保护私有内容的安全
- 🌐 自动发布到现代化的 Web 平台
- 💡 保留所有高级功能（Dataview、反向链接、图谱等）

现在你可以安心地享受最佳的私有知识管理和公开知识分享体验！