const { Product } = require('mongoose').models
const productsData = require('./models/products-data')

module.exports = r => {
  r.get('/products', async ctx => {
    const products = await Product.find({}, { detail: 0 })
      .sort({
        createdAt: -1,
      })
      .lean()
    ctx.body = products
  })

  r.get('/products/:id', async ctx => {
    const product = await Product.findById(ctx.params.id).lean()
    ctx.body = product
  })

  // Initial database for the sake of simplicity.
  // We must not do this in real application.
  r.post('/init-db', async ctx => {
    const exist = await Product.find().limit(1)
    if (exist.length) {
      ctx.body = 'Database already initialized'
      return
    }
    await Product.insertMany(productsData)
    ctx.body = 'Initial database successfully'
  })
}
