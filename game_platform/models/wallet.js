const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
  address: {type: String, default: '0'},
  book: [{type: Object}], 
  amount: {type: Number, default: 0}
})


module.exports = mongoose.model('wallet', walletSchema)