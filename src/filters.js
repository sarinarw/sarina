function postDate(dateObj) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(dateObj));
}

function isoDate(dateObj) {
  return new Date(dateObj).toISOString();
}

function limit(arr, n) {
  return arr.slice(0, n);
}

function filterByTopic(posts, topic) {
  return posts.filter((post) => post.data.topic === topic);
}

function topicIcon(topic) {
  const icons = { tech: "💻", gardening: "🌱" };
  return icons[topic] || "";
}

module.exports = { postDate, isoDate, limit, filterByTopic, topicIcon };
