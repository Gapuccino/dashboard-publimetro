/**
 * @typedef {Object} SiteMetrics
 * @property {number} score
 * @property {string} lcp
 * @property {string} cls
 * @property {string} inp
 * @property {string} [fcp]
 * @property {string} [ttfb]
 */

/**
 * @typedef {Object} SiteHistoryEntry
 * @property {number} score
 * @property {number} desktopScore
 * @property {number} [labScore]
 * @property {string} date
 * @property {string} [lcp]
 * @property {string} [labLcp]
 */

/**
 * @typedef {Object} SiteAnalytics
 * @property {number} activeUsers
 * @property {number} views
 * @property {number} bounceRate
 * @property {number} avgSessionDuration
 * @property {number} sessions
 */

/**
 * @typedef {Object} SiteData
 * @property {string} siteName
 * @property {SiteMetrics} home
 * @property {SiteMetrics} [desktop]
 * @property {SiteMetrics} article
 * @property {SiteMetrics} [articleDesktop]
 * @property {SiteMetrics & {tbt: string, speedIndex: string}} [lab]
 * @property {SiteMetrics & {tbt: string, speedIndex: string}} [labDesktop]
 * @property {Array<SiteHistoryEntry>} [history]
 * @property {SiteAnalytics} [analytics]
 * @property {string} [date]
 */

export {};
