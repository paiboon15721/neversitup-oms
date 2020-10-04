const { User } = require('mongoose').models
const axios = require('axios')

module.exports = r => {
  r.get('/profile', async ctx => {
    const userId = ctx.cookies.get('userId')
    const user = await User.findById(userId).select('-password').lean()
    ctx.body = user
  })

  r.get('/users/:id', async ctx => {
    const user = await User.findById(ctx.params.id).select('-password').lean()
    ctx.body = user
  })

  r.get('/orders', async ctx => {
    const { page = 1, limit = 10 } = ctx.query
    const userId = ctx.cookies.get('userId')
    const { data } = await axios.get('http://order-service:4000/orders', {
      params: { page, limit, customerId: userId },
    })
    ctx.body = data.data
  })
}
