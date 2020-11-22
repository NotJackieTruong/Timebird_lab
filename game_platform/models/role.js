const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({
  userId: { type: String },
  role: { type: String },
  setting: { type: Object, default: null }
})

module.exports = mongoose.model('Role', roleSchema)