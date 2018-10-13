// prefer default export if available
const preferDefault = m => m && m.default || m


exports.components = {
  "component---src-pages-app-js": preferDefault(require("/Users/edo/Documents/git/schan3ed.github.io/src/pages/App.js")),
  "component---src-pages-index-js": preferDefault(require("/Users/edo/Documents/git/schan3ed.github.io/src/pages/index.js"))
}

