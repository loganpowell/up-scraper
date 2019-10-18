const { JSDOM } = require('jsdom')
const fetch = require('node-fetch')

const BASE_URL = 'https://www.census.gov/AmericaCounts'

const BASE_CFG = {
  url: BASE_URL,
  contentType: 'text/html',
  includeNodeLocations: true,
  pretendToBeVisual: true,
  runScripts: 'outside-only', // optional: "dangerously"
}

/**
 * Asynchronous script loading:
 * https://github.com/jsdom/jsdom#asynchronous-script-loading
 *
 *
 * */

const createDomFromHtml = (html, cfg = BASE_CFG) => new JSDOM(html, cfg)

const liveDom = async url => {
  // fetch html
  const html = await fetch(url).then(r => r.text())
  // construct dom
  return createDomFromHtml(html)
  // remember to `window.close()` when done with the return
}

const PAGE_CFG = {
  pageURL: BASE_URL,
  selector: '.uscb-list-item',
  latest: 3,
}

const getHrefsFromPageBySelector = async ({ latest = null, pageURL, selector }) => {
  console.table({
    function: 'getHrefsFromPageBySelector',
    pageURL,
    selector,
    latest,
  })
  const dom = await liveDom(pageURL)
  // get document
  const document = dom.window.document
  // get links by selector
  const links = Array.from(document.querySelectorAll(selector)).map(l => ({
    href: l.href || 'href not found',
    img: l.querySelector('img').src || null,
  }))
  // clean up jsdom (shared instance between multiple invocations/constructions)
  dom.window.close()
  return latest ? links.slice(0, latest) : links
}

// getHrefsFromPageBySelector(PAGE_CFG).then(r => r) //?

const LINKED_CONTENT_CFG = {
  selectors: {
    text_heading: '.uscb-h2',
    text_author: '.author',
    text_pubDate: '.pubdate',
    meta_description: "meta[property='og:description']",
  },
}

const getContentForPageBySelectors = async ({ pageURL, selectors }) => {
  const dom = await liveDom(pageURL)
  // console.log('dom:', dom.window.document.body)
  const document = dom.window.document
  const trimRgx = /[\t\n]/g
  const getContentForTuple = ([key, selector]) => {
    let [type, tag] = key.split(/\.|_/g) // `let` <- assigned/computed
    return type === 'text'
      ? {
          [tag]: document.querySelector(selector)
            ? document
                .querySelector(selector)
                .textContent.replace(trimRgx, '')
                .trim()
            : null,
        }
      : type === 'img'
      ? { [tag]: document.querySelector(selector).querySelector('img').src }
      : type === 'meta'
      ? { [tag]: document.head.querySelector(selector).content }
      : { [tag]: document.querySelector(selector) }
  }
  const entries = Object.entries(selectors).reduce(
    (acc, cur) => ({ pageURL, ...acc, ...getContentForTuple(cur) }),
    {}
  )
  // clean up
  dom.window.close()
  return entries
}

const spoolContentViaPageLinks = async (pageCfg, linkedContentCfg, RSSFeed) => {
  const links = await getHrefsFromPageBySelector(pageCfg)
  console.log('spoolContentViaPageLinks -> links.length:', links.length)
  const json = await links.reduce(async (acc, { href, img }) => {
    const ACC = await acc
    const pageContent = await getContentForPageBySelectors({ ...linkedContentCfg, pageURL: href })
    const { heading, pageURL, description, author, pubDate } = { ...pageContent, img }
    const trimedAuthor = author ? author.trim() : null
    const dateString = pubDate ? pubDate.trim() : null
    const date = dateString ? new Date(dateString) : null
    // console.log('result:', result)
    RSSFeed.addItem({
      date,
      title: heading,
      description: description,
      id: pageURL,
      link: pageURL,
      image: img,
      author: trimedAuthor,
    })
    return ACC // <- side effects only
  }, Promise.resolve([]))
  return json
}

module.exports = { spoolContentViaPageLinks, BASE_CFG, PAGE_CFG, LINKED_CONTENT_CFG }
