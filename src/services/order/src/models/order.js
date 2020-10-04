const mongoose = require('mongoose')
const Boom = require('@hapi/boom')
const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)
const mongoosePaginate = require('mongoose-paginate-v2')
const mongooseLeanVirtuals = require('mongoose-lean-virtuals')
const dayjs = require('dayjs')
const { nanoid } = require('nanoid')

const { Schema } = mongoose

const productSchema = new Schema({
  product: { type: Schema.Types.ObjectId },
  price: { type: Number, required: true, default: 0 },
  quantity: { type: Number, required: true, default: 1 },
})

const orderSchema = new Schema(
  {
    orderId: {
      type: String,
      default: () => `${dayjs().format('YYYY-MM-DD')}/${nanoid(5)}`,
      unique: true,
    },
    products: [productSchema],
    customer: { type: Schema.Types.ObjectId, index: true },
    shippingName: { type: String, required: true, trim: true },
    shippingAddress: { type: String, required: true, trim: true },
    paid: { type: Boolean, default: false, index: true },
    shipped: { type: Boolean, default: false },
    cancel: { type: Boolean, default: false },
    trackingNumber: { type: String, trim: true, default: '' },
    shippingPrice: { type: Number, required: true, default: 0 },
  },
  { timestamps: true, toObject: { virtuals: true } },
)

orderSchema.pre('remove', async function () {
  if (this.paid || this.trackingNumber || this.shipped) {
    throw Boom.badRequest(
      'This order already paid or shipped or have tracking number.',
    )
  }
})

orderSchema.virtual('totalPrice').get(function () {
  return this.products.reduce((acc, v) => (acc += v.price * v.quantity), 0)
})

orderSchema.plugin(mongoosePaginate)
orderSchema.plugin(mongooseLeanVirtuals)
orderSchema.index({ createdAt: 1 })

mongoose.model('Order', orderSchema)

exports.orderAddSchema = Joi.object().keys({
  products: Joi.array()
    .items(
      Joi.object()
        .keys({
          product: Joi.objectId().required(),
          quantity: Joi.number().integer().required(),
        })
        .required(),
    )
    .required(),
  shippingName: Joi.string().required(),
  shippingAddress: Joi.string().required(),
})

exports.orderUpdateSchema = Joi.object().keys({
  products: Joi.array().items(
    Joi.object()
      .keys({
        product: Joi.objectId().required(),
        price: Joi.number().integer().required(),
        quantity: Joi.number().integer().required(),
      })
      .required(),
  ),
  shippingName: Joi.string(),
  shippingAddress: Joi.string(),
  cancel: Joi.boolean(),
  paid: Joi.boolean(),
  shipped: Joi.boolean(),
  trackingNumber: Joi.string().optional().allow(''),
  shippingPrice: Joi.number().integer(),
})
