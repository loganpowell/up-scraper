// see example: https://github.com/apex/up-examples/blob/master/oss/node-micro/up.json
const http = require("http")
const { PORT = 3000, UP_STAGE } = process.env
const { Feed } = require("rss2")
const { spoolContentViaPageLinks } = require("./scraper")
const {
  AC_URL,
  ac_page_cfg,
  AC_LINKED_CONTENT_CFG,
  SS_URL,
  ss_page_cfg,
  SS_LINKED_CONTENT_CFG,
  JOBS_URL,
  JOBS_PAGE_CFG,
  JOBS_LINKED_CONTENT_CFG
} = require("./configs")

const server = http.createServer()

server.listen(PORT, err => {
  if (err) {
    return console.log("error:", err)
  }
  console.log(`server is listening on ${PORT}`)
})

let init_RSS = (URL, title, description) =>
  new Feed({
    title,
    description,
    id: URL,
    link: URL,
    language: "en",
    generator: "Feed",
    feedLinks: {
      json: "https://loganpowell.github.io/feed/json",
      atom: "https://loganpowell.github.io/feed/atom"
    },
    author: {
      name: "Logan Powell",
      email: "logan.t.powell@census.gov",
      link: "https://www.github.com/loganpowell"
    }
  })

server.on("request", async (req, res) => {
  if (req.url !== "/favicon.ico") {
    const ac_match = /\/ac\//g
    const ss_match = /\/ss\//g
    const jobs_match = /\/jobs/g
    if (ac_match.test(req.url)) {
      let count = req.url.slice(4)
      console.log("request:", req.url)
      console.log("COUNT:", count)
      let feed = init_RSS(
        AC_URL,
        "America Counts RSS Feed",
        "an RSS feed made from the Census' America Counts stories"
      )

      const rss = await spoolContentViaPageLinks(ac_page_cfg(count), AC_LINKED_CONTENT_CFG, feed)
        .then(() => {
          return feed.rss2()
        })
        .catch(e => console.log(e))

      console.log("PORT:", PORT)
      res.end(rss)
    } else if (ss_match.test(req.url)) {
      let count = req.url.slice(4)
      console.log("request:", req.url)
      console.log("COUNT:", count)
      let feed = init_RSS(
        SS_URL,
        "Stats for Stories RSS Feed",
        "an RSS feed made from the Census' Stats for Stories articles"
      )

      const rss = await spoolContentViaPageLinks(ss_page_cfg(count), SS_LINKED_CONTENT_CFG, feed)
        .then(() => {
          return feed.rss2()
        })
        .catch(e => console.log(e))

      console.log("PORT:", PORT)
      res.end(rss)
    } else if (jobs_match.test(req.url)) {
      console.log("request:", req.url)
      let feed = init_RSS(
        JOBS_URL,
        "Census Jobs RSS Feed",
        "an RSS feed made from the Census' Jobs Site"
      )

      const rss = await spoolContentViaPageLinks(JOBS_PAGE_CFG, JOBS_LINKED_CONTENT_CFG, feed)
        .then(() => {
          return feed.rss2()
        })
        .catch(e => console.log(e))

      console.log("PORT:", PORT)
      res.end(rss)
    }
  }
})
