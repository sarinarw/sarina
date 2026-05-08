function uniqueTopics(items) {
  const topicSet = new Set();
  items.forEach((item) => {
    if (item.data && item.data.topic) topicSet.add(item.data.topic);
  });
  return [...topicSet].sort();
}

function uniqueTags(items) {
  const tagSet = new Set();
  items.forEach((item) => {
    ((item.data && item.data.tags) || []).forEach((tag) => {
      if (tag !== "posts") tagSet.add(tag);
    });
  });
  return [...tagSet].sort();
}

module.exports = { uniqueTopics, uniqueTags };
