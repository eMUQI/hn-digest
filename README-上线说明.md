# 上线用文件（按 v2 设计稿实现）

把这些文件按同样路径提交进 `eMUQI/hn-digest`，`main` 推送后 GitHub Actions 会自动构建发布。

## 新增 / 覆盖

```text
package.json              新增 markdown-it 依赖（soft break 让每条的标题/摘要/链接各占一行）
eleventy.config.js        markdown-it 配置 + 日期与归档分组过滤器
src/_includes/layouts/base.njk     顶栏、栅格、右侧目录容器、页脚
src/_includes/layouts/digest.njk   单期页（日报 Markdown 已经指向这个 layout）
src/index.njk             首页 = 最新一期全文
src/archive.njk           /archive/ 按月归档
src/about.njk             /about/ 关于
src/feed.njk              /feed.xml 全文 RSS
src/assets/style.css      整套样式（覆盖原文件）
src/assets/toc.js         从正文 h2/h3 生成右侧目录并高亮当前段
```

## 提交后自检

```bash
npm install
npm run serve
```

- `/` 是最新一期，右侧目录列出「重点分类」下的各小节
- `/2026/08/18/` 单期页，底部有前一期 / 后一期
- `/archive/`、`/about/`、`/feed.xml` 可访问
- 窄于 1024px 时右侧目录自动隐藏

## 内容侧不需要改

日报 Markdown 的 front matter 保持现在的写法（`layout: layouts/digest.njk`、`tags: digest`、`permalink`、`description`）。分类节数量、条目数不足 30、某分类无相关条目，页面都按内容如实渲染。
