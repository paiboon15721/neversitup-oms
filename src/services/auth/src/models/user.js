const mongoose = require('mongoose')
const Boom = require('@hapi/boom')
const Joi = require('@hapi/joi')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')

const { Schema, models } = mongoose

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      trim: true,
    },
    password: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true },
)

userSchema.pre('save', async function () {
  const { User } = models
  const exist = await User.find({ email: this.email }).limit(1)
  if (exist.length) {
    throw Boom.badRequest('Email is in use')
  }
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.statics.login = async function (email, password) {
  const { User } = models
  const user = await User.findOne({ email }).lean()
  const err = Boom.unauthorized('Email or password is incorrect')
  if (!user) {
    throw err
  }
  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    throw err
  }
  const token = await promisify(jwt.sign)(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
  )
  return { token, user }
}

mongoose.model('User', userSchema)

exports.loginSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

exports.registerSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  name: Joi.string().required(),
})
