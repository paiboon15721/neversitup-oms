require('dotenv').config()
const Koa = require('koa')
const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const { formatOutput } = require('koa-helpers')
const Router = require('koa-router')
const initMongoose = require('./models/initMongoose')
const initRoute = require('./controllers')

const app = new Koa()
const r = new Router()
initRoute(r)

if (process.env.NODE_ENV !== 'production') {
  app.use(logger())
}
app.use(bodyParser())
app.use(formatOutput)
app.use(r.routes())

initMongoose('user').then(() => {
  const port = 4000
  app.listen(port, () => {
    console.log(`Server listen on port ${port}`)
  })
})
