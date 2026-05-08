const { uniqueTopics, uniqueTags } = require("../src/collections");

function makeItem(topic, tags = []) {
  return { data: { topic, tags } };
}

describe("uniqueTopics", () => {
  test("returns sorted unique topic values", () => {
    const items = [
      makeItem("tech"),
      makeItem("gardening"),
      makeItem("tech"),
    ];
    expect(uniqueTopics(items)).toEqual(["gardening", "tech"]);
  });

  test("skips items with no topic", () => {
    const items = [makeItem(undefined), makeItem("tech")];
    expect(uniqueTopics(items)).toEqual(["tech"]);
  });

  test("returns empty array for empty input", () => {
    expect(uniqueTopics([])).toEqual([]);
  });
});

describe("uniqueTags", () => {
  test("returns sorted unique tags", () => {
    const items = [
      makeItem("tech", ["rust", "systems"]),
      makeItem("gardening", ["composting"]),
      makeItem("tech", ["rust"]),
    ];
    expect(uniqueTags(items)).toEqual(["composting", "rust", "systems"]);
  });

  test("excludes the 'posts' collection tag", () => {
    const items = [makeItem("tech", ["posts", "rust"])];
    expect(uniqueTags(items)).toEqual(["rust"]);
  });

  test("skips items with no tags array", () => {
    const items = [{ data: { topic: "tech" } }, makeItem("gardening", ["soil"])];
    expect(uniqueTags(items)).toEqual(["soil"]);
  });

  test("returns empty array for empty input", () => {
    expect(uniqueTags([])).toEqual([]);
  });
});
