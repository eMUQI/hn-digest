# hn-digest

Hacker News 中文早报。内容由 Markdown 保存，Eleventy 构建为静态网站并通过 GitHub Pages 发布。

## 内容结构

日报按年/月归档：

```text
content/daily/YYYY/MM/DD.md
```

例如：

```text
content/daily/2026/08/18.md
```

每期 Markdown 只负责内容；首页、归档页、导航和样式由 Eleventy 模板统一生成。

## 本地运行

```bash
npm install
npm run serve
```

构建：

```bash
npm run build
```

输出目录为 `_site/`。

## 发布

推送到 `main` 后，`.github/workflows/deploy.yml` 会构建并部署到 GitHub Pages。仓库需要在 GitHub **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**。
