const { User } = require('mongoose').models
const jwt = require('jsonwebtoken')
const Boom = require('@hapi/boom')
const { validateBody } = require('koa-helpers')
const { loginSchema, registerSchema } = require('./models/user')

module.exports = r => {
  r.get('/auth', async ctx => {
    let token = ctx.cookies.get('jwt')
    if (!token) {
      token = ctx.get('jwt')
    }
    try {
      const user = await jwt.verify(token, process.env.JWT_SECRET)
      ctx.cookies.set('userId', user.id)
      ctx.cookies.set('userEmail', user.email)
    } catch (err) {
      throw Boom.unauthorized(err)
    }
    ctx.body = 'Login Success'
  })

  r.post('/register', validateBody(registerSchema), async ctx => {
    const user = await User.create(ctx.request.body)
    ctx.body = user
  })

  r.post('/login', validateBody(loginSchema), async ctx => {
    const { email, password } = ctx.request.body
    const { token, user } = await User.login(email, password)
    ctx.cookies.set('jwt', token)
    ctx.cookies.set('userId', user._id)
    ctx.cookies.set('userEmail', user.email)
    ctx.body = { token }
  })

  r.post('/logout', async ctx => {
    ctx.cookies.set('jwt', null)
    ctx.cookies.set('userId', null)
    ctx.cookies.set('userEmail', null)
    ctx.body = 'Logout Success'
  })
}
