const express = require('express')
const write = require('./write')
const getFullURL = require('./get-full-url')
const delay = require('./delay')

module.exports = (db, name, opts) => {
  const router = express.Router()
  router.use(delay)

  function show(req, res, next) {
    res.locals.data = db.get(name).value()
    next()
  }

  function create(req, res, next) {
    db.set(name, req.body).value()
    res.locals.data = db.get(name).value()

    res.setHeader('Access-Control-Expose-Headers', 'Location')
    res.location(`${getFullURL(req)}`)

    res.status(201)
    next()
  }

  function update(req, res, next) {
    if (req.method === 'PUT') {
      db.set(name, req.body).value()
    } else {
      db
        .get(name)
        .assign(req.body)
        .value()
    }

    res.locals.data = db.get(name).value()
    next()
  }

  const w = write(db)

  const {strict} = opts;

  router
    .route('/')
    .get(show)
    .post(strict ? create : show, w)
    .put(strict ? create : update, w)
    .patch(strict ? create : update, w)

  return router
}
