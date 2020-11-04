const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({
  userId: { type: String },
  role: { type: String }
})

module.exports = mongoose.model('Role', roleSchema)