const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const { postDate, isoDate, limit, filterByTopic, topicIcon } = require("./src/filters");
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
  eleventyConfig.addFilter("topicIcon", topicIcon);

  // Compare post dates against today in Phoenix time (MST, UTC-7, no DST).
  // Eleventy parses frontmatter dates as midnight UTC, so a naive `date <= now`
  // comparison fails in the evening when UTC has already rolled to the next day.
  const todayPhoenix = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Phoenix",
  }); // "YYYY-MM-DD"
  const isPublished = (p) => p.date.toISOString().split("T")[0] <= todayPhoenix;

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/blog/**/*.md")
      .filter(isPublished)
      .sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("topicList", (collectionApi) =>
    uniqueTopics(collectionApi.getFilteredByGlob("src/blog/**/*.md").filter(isPublished))
  );

  eleventyConfig.addCollection("tagList", (collectionApi) =>
    uniqueTags(collectionApi.getFilteredByGlob("src/blog/**/*.md").filter(isPublished))
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
