// America Counts

const AC_URL = "https://www.census.gov/AmericaCounts"

const ac_page_cfg = latest => ({
  pageURL: AC_URL,
  banner: ".topbanner",
  selector: ".uscb-list-item",
  latest
})

const AC_LINKED_CONTENT_CFG = {
  selectors: {
    // text_heading: '.uscb-h2',
    meta_img: "meta[property='og:image']",
    meta_heading: "meta[property='og:title']",
    text_description: ".pagetitle",
    text_author: ".author",
    text_pubDate: ".pubdate",
    popText_content: ".uscb-text-image-text"
  }
}

// Stats for Stories

const SS_URL = "https://www.census.gov/newsroom/stories.html"

const ss_page_cfg = latest => ({
  pageURL: SS_URL,
  selector: ".uscb-list-item",
  latest
})

const SS_LINKED_CONTENT_CFG = {
  selectors: {
    // text_heading: '.uscb-h2',
    img_img: ".uscb-text-media-media",
    meta_heading: "meta[property='og:title']",
    text_description: ".pagetitle",
    meta_author: "meta[name='DC.creator']",
    text_pubDate: ".publicationdate",
    popText_content: ".uscb-text-image-text"
  }
}

// Jobs

const JOBS_URL = "https://2020census.gov/en/jobs"

const JOBS_PAGE_CFG = {
  pageURL: JOBS_URL,
  selector: ".uscb-header-nav-item",
  latest: 4
}

const JOBS_LINKED_CONTENT_CFG = {
  selectors: {
    // text_heading: '.uscb-h2',
    img_img: ".image",
    text_heading: ".pagetitle",
    text_description: ".cmp-teaser__title",
    // meta_author: "meta[name='DC.creator']"
    // meta_pubDate: "meta[name='DC.date.created']",
    text_content: ".cmp-text"
  }
}

module.exports = {
  AC_URL,
  ac_page_cfg,
  AC_LINKED_CONTENT_CFG,
  SS_URL,
  ss_page_cfg,
  SS_LINKED_CONTENT_CFG,
  JOBS_URL,
  JOBS_PAGE_CFG,
  JOBS_LINKED_CONTENT_CFG
}
