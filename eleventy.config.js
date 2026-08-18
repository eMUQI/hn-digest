import markdownIt from "markdown-it";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  eleventyConfig.setLibrary("md", markdownIt({ html: true, linkify: true, typographer: false, breaks: true }));

  const utc = (value) => new Date(value);
  eleventyConfig.addFilter("dateISO", (value) => utc(value).toISOString().slice(0, 10));
  eleventyConfig.addFilter("dateCN", (value) => {
    const d = utc(value);
    return `${d.getUTCFullYear()} 年 ${d.getUTCMonth() + 1} 月 ${d.getUTCDate()} 日`;
  });
  eleventyConfig.addFilter("dateRFC", (value) => utc(value).toUTCString());
  eleventyConfig.addFilter("monthLabel", (value) => {
    const d = utc(value);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
  eleventyConfig.addFilter("dayLabel", (value) => String(utc(value).getUTCDate()).padStart(2, "0"));
  eleventyConfig.addFilter("newestFirst", (items) => [...items].reverse());
  eleventyConfig.addFilter("byMonth", (items) => {
    const groups = new Map();
    for (const item of [...items].reverse()) {
      const d = utc(item.date);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }
    return [...groups.entries()].map(([label, list]) => ({ label, items: list }));
  });

  return {
    pathPrefix: "/hn-digest/",
    dir: { input: ".", includes: "src/_includes", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
