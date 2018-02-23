/**
 * A router with extra routes.
 * The normal Next.js route that handles the app is already defined.
 * 
 * @param {next.Server} next The Next.js app
 */
module.exports = next => {
  const router = require('express').Router()

  // router.get('/test', (req, res) => {
  //   res.send('Hello, world!')
  // })

  return router
}
