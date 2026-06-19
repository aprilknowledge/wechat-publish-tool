# 微信草稿排版

> 纯静态、多风格微信公众号草稿排版工具，一键复制即用

## 功能

- **3 种风格主题** — 文艺 / 动漫 / 干货，一键切换实时预览
- **6 套内置模板** — 简洁通用、文艺随笔、动漫分享、读书感悟、生活碎片、数据处理
- **智能文本解析** — 自动识别主标题、副标题、小节标题、段落、引用、代码块、列表
- **字体大小调节** — 标题/小标题/正文字号独立调节
- **DeepSeek AI 排版** — 输入 API Key 即可用 AI 自动智能排版（选填，不填也能用规则引擎）
- **深色/浅色模式** — 跟随系统或手动切换
- **一键复制** — 生成 100% 微信公众号兼容的内联样式 HTML，粘贴格式不变

## 部署到 GitHub Pages（免费外网访问）

### 第一步：在 GitHub 创建仓库

1. 打开 [github.com](https://github.com) 并登录
2. 点击右上角 **+** → **New repository**
3. Repository name 填 `wechat-publish-tool`（或任意名称）
4. 选择 **Public**（公开）
5. **不要**勾选 "Add a README file"
6. 点击 **Create repository**

### 第二步：推送代码

在项目目录 `D:\Desktop\wechat-publish-tool` 打开终端，依次执行：

```bash
# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "初始化：微信草稿排版工具"

# 关联远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/wechat-publish-tool.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

### 第三步：开启 GitHub Pages

1. 打开你的 GitHub 仓库页面
2. 点击 **Settings** → 左侧 **Pages**
3. **Source** 选择 **Deploy from a branch**
4. **Branch** 选择 `main`，文件夹选 `/ (root)`
5. 点击 **Save**
6. 等待 1-2 分钟，页面顶部会显示你的网址：
   `https://YOUR_USERNAME.github.io/wechat-publish-tool/`

之后每次 `git push` 新代码，GitHub Pages 会自动更新。

### 其他部署方式

**Vercel**（也已配置好）：
1. [vercel.com](https://vercel.com) 导入 GitHub 仓库
2. 无需任何配置，直接部署

**本地使用**：
双击 `index.html` 即可在浏览器中使用。

## 使用说明

1. 粘贴纯文本到左侧编辑器
2. 点击「文艺/动漫/干货」切换风格，预览实时更新
3. 选择模板点击「加载」或直接手写
4. 点击「智能美化」自动排版
5. 点击「一键复制」或 Ctrl+Enter 复制到公众号编辑器

### DeepSeek AI（可选）

1. 点击右上角 ⚙ 设置
2. 输入 DeepSeek API Key（从 [platform.deepseek.com](https://platform.deepseek.com) 获取）
3. 点击保存后，「智能美化」将优先使用 AI 推理排版

## 项目结构

```
wechat-publish-tool/
├── index.html          # 主页面
├── css/
│   └── styles.css      # 所有样式（3主题 + 深色模式 + 响应式）
├── js/
│   └── app.js          # 解析器、渲染器、模板、导出逻辑
├── .gitignore
├── README.md
└── vercel.json         # Vercel 部署配置
```

## 许可证

MIT