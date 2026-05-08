const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  // Passthrough copy: public/ → _site/, images → _site/assets/images/
  eleventyConfig.addPassthroughCopy("public");
  eleventyConfig.addPassthroughCopy({ "src/assets/images": "assets/images" });

  // Global data available in all templates
  eleventyConfig.addGlobalData("currentYear", () => new Date().getFullYear());

  // Format a date as "May 7, 2026"
  eleventyConfig.addFilter("postDate", (dateObj) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateObj));
  });

  // Format a date as ISO 8601 string for <time datetime="...">
  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return new Date(dateObj).toISOString();
  });

  // Return the first N items of an array (Nunjucks slice() chunks, not trims)
  eleventyConfig.addFilter("limit", (arr, n) => arr.slice(0, n));

  // All blog posts sorted newest-first
  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/blog/**/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Sorted list of unique topic values from post frontmatter
  eleventyConfig.addCollection("topicList", (collectionApi) => {
    const topicSet = new Set();
    collectionApi.getFilteredByGlob("src/blog/**/*.md").forEach((item) => {
      if (item.data.topic) topicSet.add(item.data.topic);
    });
    return [...topicSet].sort();
  });

  // Sorted list of unique user-defined tags (excludes "posts" collection tag)
  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const tagSet = new Set();
    collectionApi.getFilteredByGlob("src/blog/**/*.md").forEach((item) => {
      (item.data.tags || []).forEach((tag) => {
        if (tag !== "posts") tagSet.add(tag);
      });
    });
    return [...tagSet].sort();
  });

  // All projects sorted newest-first
  eleventyConfig.addCollection("projects", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/projects/*.md")
      .sort((a, b) => b.date - a.date);
  });

  return {
    dir: { input: "src", output: "_site", data: "_data" },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
