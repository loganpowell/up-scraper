const { JSDOM } = require("jsdom")
const fetch = require("node-fetch")

const config_dom = url => ({
  url,
  contentType: "text/html",
  includeNodeLocations: true,
  pretendToBeVisual: true,
  runScripts: "outside-only", // optional: "dangerously"
})

/**
 * Asynchronous script loading:
 * https://github.com/jsdom/jsdom#asynchronous-script-loading
 *
 *
 * */

const createDomFromHtml = (html, url) => new JSDOM(html, config_dom(url))

const liveDom = async url => {
  // fetch html
  const html = await fetch(url)
    .then(r => r.text())
    .catch(e => console.log("error in liveDom:", e))
  // construct dom
  return createDomFromHtml(html, url)
  // remember to `window.close()` when done with the return
}

const getHrefsFromPageBySelector = async ({
  latest = null,
  pageURL,
  selector,
  banner,
}) => {
  console.table({
    function: "getHrefsFromPageBySelector",
    pageURL,
    banner,
    selector,
    latest,
  })
  const dom = await liveDom(pageURL)
  // get document
  const document = dom.window.document
  // get banner
  const href1 = banner
    ? document.querySelector(banner).querySelector("a").href
    : null
  console.log("banner:", href1)
  // get links by selector
  const links = Array.from(document.querySelectorAll(selector)).map(l => {
    return l.href ? l.href : l.querySelector("a").href || "href not found"
  })
  const allLinks = href1 ? [href1, ...links] : links
  // clean up jsdom (shared instance between multiple invocations/constructions)
  dom.window.close()
  console.log("allLinks:", allLinks.slice(0, latest))
  return latest ? allLinks.slice(0, latest) : allLinks
}

// getHrefsFromPageBySelector(PAGE_CFG).then(r => r) //?

const getContentForPageBySelectors = async ({ pageURL, selectors }) => {
  console.log("pageURL:", pageURL, "| selectors:", selectors)
  const dom = await liveDom(pageURL)
  // console.log('dom:', dom.window.document.body)
  const document = dom.window.document
  const has_selector = sel => (document.querySelector(sel) ? true : false)
  const trimRgx = /[\t\n]/g
  const getContentForTuple = ([key, sel]) => {
    let [type, tag] = key.split(/\.|_/g) // `let` <- assigned/computed
    return type === "text"
      ? {
          [tag]: has_selector(sel)
            ? document
                .querySelector(sel)
                .textContent.replace(trimRgx, "")
                .trim()
            : null,
        }
      : type === "img"
      ? {
          [tag]: has_selector(sel)
            ? document.querySelector(sel).querySelector("img").src
            : "",
        }
      : type === "meta"
      ? { [tag]: document.head.querySelector(sel).content }
      : type === "popText"
      ? { [tag]: document.querySelector(sel).textContent.trim() }
      : type === "para3"
      ? {
          [tag]: document
            .querySelector(sel)
            .textContent.trim()
            .split(/\r?\n/g)
            .slice(0, 3)
            .join("\r\n"),
        }
      : { [tag]: document.querySelector(sel) }
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
  console.log("spoolContentViaPageLinks -> links.length:", links.length)
  const json = await links.reduce(async (acc, href) => {
    const ACC = await acc
    const {
      heading,
      pageURL,
      description,
      author,
      pubDate,
      img,
      content,
    } = await getContentForPageBySelectors({
      ...linkedContentCfg,
      pageURL: href,
    })
    const trimedAuthor = author ? author.trim() : null
    const dateString = pubDate ? pubDate.trim() : null
    const date = dateString ? new Date(dateString) : null
    // console.log('result:', result)
    RSSFeed.addItem({
      date,
      description,
      title: heading,
      id: pageURL,
      link: pageURL,
      image: img,
      content,
      author: [{ name: trimedAuthor }],
    })
    return ACC // <- side effects only
  }, Promise.resolve([]))
  console.log({ json })
  return json
}

module.exports = { spoolContentViaPageLinks }
