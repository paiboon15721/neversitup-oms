const { Order } = require('mongoose').models
const { validateBody } = require('koa-helpers')
const axios = require('axios')
const Boom = require('@hapi/boom')
const { orderAddSchema, orderUpdateSchema } = require('./models/order')

module.exports = r => {
  r.get('/orders', async ctx => {
    // The orders collection will have alot of ducuments rapidly.
    // so, we need to implement pagination.
    const { page = 1, limit = 10, customerId } = ctx.query
    const find = customerId ? { customer: customerId } : {}
    const orders = await Order.paginate(find, {
      page,
      limit,
      sort: { createdAt: -1 },
      lean: { virtuals: true },
    })
    ctx.body = orders
  })

  r.get('/orders/:id', async ctx => {
    const order = await Order.findById(ctx.params.id).lean({ virtuals: true })
    const productIds = order.products.map(v => v.product)

    // Fullfill order detail required to interact with user and product services.
    // These tasks can done in parallel so we can do it together
    const [userRes, ...productsRes] = await Promise.all([
      axios.get(`http://user-service:4000/users/${order.customer}`),
      ...productIds.map(v =>
        axios.get(`http://product-service:4000/products/${v}`),
      ),
    ])
    order.customer = userRes.data.data
    order.products = productsRes.map((v, i) => ({
      ...order.products[i],
      product: v.data.data,
    }))
    ctx.body = order
  })

  r.post('/orders', validateBody(orderAddSchema), async ctx => {
    const { body } = ctx.request
    const userId = ctx.cookies.get('userId')

    // Validate all products available and get price on product service to fullfill order.
    // In the real application we also need to check stock.
    const productIds = body.products.map(v => v.product)
    try {
      const productsRes = await Promise.all(
        productIds.map(v =>
          axios.get(`http://product-service:4000/products/${v}`),
        ),
      )
      body.products = productsRes.map((v, i) => ({
        ...body.products[i],
        price: v.data.data.price,
      }))
      const order = await Order.create({ customer: userId, ...body })
      ctx.body = order
    } catch (_) {
      throw Boom.badRequest('Some of products not available.')
    }
  })

  r.del('/orders/:id', async ctx => {
    const order = await Order.findById(ctx.params.id)
    if (order) {
      await order.remove()
    }
    ctx.body = order
  })

  r.put('/orders/:id', validateBody(orderUpdateSchema), async ctx => {
    // This update api can update multiple things.
    // such as cancel order, shipping address, shiping name
    const order = await Order.findByIdAndUpdate(
      ctx.params.id,
      ctx.request.body,
      { new: true },
    ).lean()
    ctx.body = order
  })
}
