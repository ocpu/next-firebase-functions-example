const functions = require('firebase-functions')
const admin = require('firebase-admin')
// IMPORTANT
// To emulate functions with auth and such follow these steps
// 1. Open the Service Accounts pane of the Google Cloud Console. (https://console.cloud.google.com/iam-admin/serviceaccounts)
// 2. Make sure that App Engine default service account is selected, and use the options menu at right to select Create key.
// 3. When prompted, select JSON for the key type, and click Create.
// 4. Set your Google default credentials to point to the downloaded key:
//    Unix: export GOOGLE_APPLICATION_CREDENTIALS="path/to/key.json"
//    Windows: set GOOGLE_APPLICATION_CREDENTIALS=path\to\key.json

const { existsSync } = require('fs')
const { join: joinPath } = require('path')
const dev = process.env.NODE_ENV !== 'production'
const next = require('next')
const app = next({
  dev,
  dir: joinPath(__dirname, 'app'),
  conf: Object.assign(
    existsSync(joinPath(__dirname, 'app', 'next.config.js')) ?
      require('./app/next.config') :
      {},
    { distDir: '../.next' }
  )
})

const prepare = app.prepare()
const handle = app.getRequestHandler()

const router = require('express')
  .Router()
  .use(require('./routes')(app))
  .get('*', handle)

exports.app = functions.https.onRequest(router)

if (!('FIREBASE_PROJECT' in process.env)) prepare.then(() =>
  require('http')
    .createServer(router)
    .listen(5000, () => {
      console.log('> Ready on http://localhost:5000')
    })
)
