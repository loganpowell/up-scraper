const { JSDOM } = require('jsdom')
const fetch = require('node-fetch')

const BASE_URL = 'https://www.census.gov/AmericaCounts'

const BASE_CFG = {
  url: BASE_URL,
  contentType: 'text/html',
  includeNodeLocations: true,
  runScripts: 'outside-only', // optional: "dangerously"
}

/**
 * Asynchronous script loading:
 * https://github.com/jsdom/jsdom#asynchronous-script-loading
 *
 *
 * */

const getDom = (html, cfg = BASE_CFG) => new JSDOM(html, cfg)

const PAGE_CFG = {
  jsDOMcfg: BASE_CFG,
  pageURL: BASE_URL,
  selector: '.uscb-list-item',
  latest: 2,
}

const LINKED_CONTENT_CFG = {
  jsDOMcfg: BASE_CFG,
  selectors: {
    text_heading: '.uscb-h2',
    text_author: '.author',
    text_pubDate: '.pubdate',
    meta_description: "meta[property='og:description']",
  },
}

const getHrefsFromPageBySelector = async ({ latest, pageURL, selector }) => {
  console.table({
    function: 'getHrefsFromPageBySelector',
    pageURL: pageURL,
    selector: selector,
    latest: latest,
  })

  // fetch html
  const HTML = await fetch(pageURL).then(r => r.text())
  // construct dom
  const dom = getDom(HTML)
  // get document
  const document = dom.window.document
  // get links by selector
  const links = Array.from(document.querySelectorAll(selector)).map(l => ({
    href: l.href || 'href not found',
    img: l.querySelector('img').src || null,
  }))
  // clean up jsdom (shared instance between multiple invocations/constructions)
  dom.window.close()
  return links.slice(0, latest)
}

getHrefsFromPageBySelector(PAGE_CFG).then(r => r) //?
