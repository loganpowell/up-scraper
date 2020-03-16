const { spoolContentViaPageLinks } = require("../scraper.js")
const { PR_URL, PR_PAGE_CFG, PR_LINKED_CONTENT_CFG } = require("../configs.js")
const { init_RSS } = require("../index.js")

let feed = init_RSS(
  PR_URL,
  "Census Press Releases RSS Feed",
  "an RSS feed made from Census' Press Releases"
)

spoolContentViaPageLinks(PR_PAGE_CFG, PR_LINKED_CONTENT_CFG, feed).then(() => {
  return feed.rss2()
}) //?
