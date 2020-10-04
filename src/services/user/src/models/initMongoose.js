const mongoose = require('mongoose')

require('./user')

module.exports = dbName =>
  new Promise((reslove, reject) => {
    const url = `mongodb://${process.env.MONGO_DB_HOST}:27017/${dbName}`
    mongoose
      .connect(url, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
      })
      .catch(reject)
    mongoose.connection.once('open', () => {
      console.log(`Connected to ${url}`)
      reslove(mongoose)
    })
  })
