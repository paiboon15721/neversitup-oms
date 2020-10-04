const mongoose = require('mongoose')

const { Schema } = mongoose

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    detail: { type: String, required: true, trim: true },
    price: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
)

productSchema.index({ createdAt: 1 })

mongoose.model('Product', productSchema)
