const mongoose = require('mongoose')

const gameSchema = new mongoose.Schema({
  userId: { type: String },
  name: { type: String },
  url: { type: String },
  cover: { type: String },
  status: { type: String, enum: ['pending', 'active'], default: 'pending' },
  createdAt: { type: Date, default: new Date(Date.now()) },
  visited: { type: Number, default: 0 },
})

module.exports = mongoose.model('Game', gameSchema)