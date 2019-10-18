// see example: https://github.com/apex/up-examples/blob/master/oss/node-micro/up.json
const http = require('http')
const { PORT = 3000, UP_STAGE } = process.env
const { Feed } = require('feed')
const { spoolContentViaPageLinks, BASE_URL, PAGE_CFG, LINKED_CONTENT_CFG } = require('./scraper')

// const BASE_URL = 'https://www.census.gov/AmericaCounts'

const server = http.createServer()

server.on('request', async (req, res) => {
  let feed = new Feed({
    title: 'America Counts RSS Feed',
    description: "an RSS feed made from the Census' America Counts stories",
    id: BASE_URL,
    link: BASE_URL,
    language: 'en',
    generator: 'Feed',
    feedLinks: {
      json: 'https://loganpowell.github.io/feed/json',
      atom: 'https://loganpowell.github.io/feed/atom',
    },
    author: {
      name: 'Logan Powell',
      email: 'logan.t.powell@census.gov',
      link: 'https://www.github.com/loganpowell',
    },
  })

  // WISHFUL THINKING ////////////////////////////////////////////////////
  // const { macro_config, micro_config } = req.body
  // return spoolContentViaPageLinks(mactro_config, micro_config).then(() => feed.rss2())
  // WISHFUL THINKING ////////////////////////////////////////////////////

  const rss = await spoolContentViaPageLinks(PAGE_CFG, LINKED_CONTENT_CFG, feed).then(() => {
    return feed.rss2()
  })

  console.log('PORT:', PORT)
  console.log('UP_STAGE:', UP_STAGE)
  res.end(rss)
})

server.listen(PORT, err => {
  if (err) {
    return console.log('error:', err)
  }
  console.log(`server is listening on ${PORT}`)
})
