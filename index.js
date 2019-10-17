// see example: https://github.com/apex/up-examples/blob/master/oss/node-micro/up.json
const { Feed } = require('feed')
const { send } = require('micro')
const { router, post, get } = require('microrouter')
const { spoolContentViaPageLinks } = require('./scraper')

module.exports = router(
  get('/', async (req, res) => {
    let feed = new Feed({
      title: 'America Counts RSS Feed',
      description: "an RSS feed made from the Census' America Counts stories",
      id: AC_URL,
      link: AC_URL,
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

    send(res, 200, rss)
    console.log('micro started')
  })
)
