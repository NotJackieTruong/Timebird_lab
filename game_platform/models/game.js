const mongoose = require('mongoose')

const gameSchema = new mongoose.Schema({
  userId: { type: String },
  name: { type: String },
  url: { type: String },
  image: { type: String },
  status: {type: String, enum: ['pending', 'active'], default: 'pending'}
})

module.exports = mongoose.model('Game', gameSchema)