const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const { postDate, isoDate, limit, filterByTopic } = require("./src/filters");
const { uniqueTopics, uniqueTags } = require("./src/collections");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPassthroughCopy("public");
  eleventyConfig.addPassthroughCopy({ "src/assets/images": "assets/images" });

  eleventyConfig.addGlobalData("currentYear", () => new Date().getFullYear());

  eleventyConfig.addFilter("postDate", postDate);
  eleventyConfig.addFilter("isoDate", isoDate);
  eleventyConfig.addFilter("limit", limit);
  eleventyConfig.addFilter("filterByTopic", filterByTopic);

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/blog/**/*.md").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("topicList", (collectionApi) =>
    uniqueTopics(collectionApi.getFilteredByGlob("src/blog/**/*.md"))
  );

  eleventyConfig.addCollection("tagList", (collectionApi) =>
    uniqueTags(collectionApi.getFilteredByGlob("src/blog/**/*.md"))
  );

  eleventyConfig.addCollection("projects", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/projects/*.md").sort((a, b) => b.date - a.date)
  );

  return {
    dir: { input: "src", output: "_site", data: "_data" },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
